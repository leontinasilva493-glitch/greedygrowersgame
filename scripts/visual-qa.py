from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3421"
ARTIFACTS = Path(__file__).resolve().parents[1] / ".artifacts"


def capture(page, name: str) -> None:
    page.goto(BASE_URL, wait_until="networkidle")
    page.screenshot(path=str(ARTIFACTS / name), full_page=True)


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)
    console_errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
        desktop.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        capture(desktop, "homepage-desktop.png")

        desktop.get_by_label("Current harvest value").fill("100")
        desktop.get_by_label("Value after waiting").fill("160")
        desktop.get_by_label("Wait time in seconds").fill("30")
        desktop.get_by_label("Lightning risk for this wait").fill("20")
        desktop.get_by_role("button", name="Calculate", exact=True).click()
        desktop.get_by_role("heading", name="WAIT", exact=True).wait_for()
        desktop.screenshot(path=str(ARTIFACTS / "calculator-result-desktop.png"), full_page=True)

        mobile = browser.new_page(viewport={"width": 375, "height": 812})
        mobile.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        capture(mobile, "homepage-mobile.png")
        overflow = mobile.evaluate(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth"
        )
        browser.close()

    if overflow:
        raise RuntimeError("Mobile homepage has horizontal overflow")
    if console_errors:
        raise RuntimeError("Browser console errors: " + " | ".join(console_errors))

    print(f"Visual QA passed; screenshots saved to {ARTIFACTS}")


if __name__ == "__main__":
    main()
