import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const ownedModules = [
  "components/ui/button.tsx",
  "components/ui/card.tsx",
  "components/ui/input.tsx",
  "components/ui/label.tsx",
  "components/ui/textarea.tsx",
  "components/ui/accordion.tsx",
  "components/ui/slider.tsx",
  "components/ui/table.tsx",
  "lib/utils.ts",
] as const;

async function loadModule<T>(path: string) {
  return vi.importActual<T>(path);
}

describe("UI foundation", () => {
  test("server-renders branded-neutral form and card primitives with accessible control contracts", async () => {
    const missing = ownedModules.filter(
      (path) => !existsSync(resolve(projectRoot, path)),
    );

    expect(missing).toEqual([]);

    const [{ Button }, card, { Input }, { Label }, { Textarea }] =
      await Promise.all([
        loadModule<typeof import("./button")>("./button"),
        loadModule<typeof import("./card")>("./card"),
        loadModule<typeof import("./input")>("./input"),
        loadModule<typeof import("./label")>("./label"),
        loadModule<typeof import("./textarea")>("./textarea"),
      ]);

    const markup = renderToStaticMarkup(
      createElement(
        card.Card,
        null,
        createElement(
          card.CardHeader,
          null,
          createElement(card.CardTitle, null, "Field reading"),
          createElement(card.CardDescription, null, "Observed, not official"),
        ),
        createElement(
          card.CardContent,
          null,
          createElement(Label, { htmlFor: "current-value" }, "Current value"),
          createElement(Input, {
            id: "current-value",
            inputMode: "decimal",
            "aria-describedby": "current-value-note",
          }),
          createElement(
            "p",
            { id: "current-value-note" },
            "Enter the value shown in game.",
          ),
          createElement(Textarea, { "aria-label": "Observation notes" }),
        ),
        createElement(
          card.CardFooter,
          null,
          createElement(Button, { type: "button" }, "Calculate"),
        ),
      ),
    );

    expect(markup).toContain('for="current-value"');
    expect(markup).toContain('aria-describedby="current-value-note"');
    expect(markup).toContain("min-h-11");
    expect(markup).toContain("text-base");
    expect(markup).toContain("focus-visible:ring");
    expect(markup).not.toMatch(/Crazy Cattle|Unblocked|aggregateRating/i);
  });

  test("server-renders accordion, slider, and table with keyboard-readable semantics", async () => {
    const missing = ownedModules.filter(
      (path) => !existsSync(resolve(projectRoot, path)),
    );

    expect(missing).toEqual([]);

    const [accordion, { Slider }, table] = await Promise.all([
      loadModule<typeof import("./accordion")>("./accordion"),
      loadModule<typeof import("./slider")>("./slider"),
      loadModule<typeof import("./table")>("./table"),
    ]);

    const accordionMarkup = renderToStaticMarkup(
      createElement(
        accordion.Accordion,
        { type: "single", defaultValue: "method" },
        createElement(
          accordion.AccordionItem,
          { value: "method" },
          createElement(accordion.AccordionTrigger, null, "Method"),
          createElement(
            accordion.AccordionContent,
            null,
            "Community observations only.",
          ),
        ),
      ),
    );

    const sliderMarkup = renderToStaticMarkup(
      createElement(Slider, {
        "aria-label": "Lightning risk",
        defaultValue: [25],
        min: 0,
        max: 100,
      }),
    );

    const tableMarkup = renderToStaticMarkup(
      createElement(
        table.Table,
        { "aria-label": "Seed observations" },
        createElement(
          table.TableHeader,
          null,
          createElement(
            table.TableRow,
            null,
            createElement(table.TableHead, { scope: "col" }, "Seed"),
          ),
        ),
        createElement(
          table.TableBody,
          null,
          createElement(
            table.TableRow,
            null,
            createElement(table.TableCell, null, "Unknown"),
          ),
        ),
      ),
    );

    expect(accordionMarkup).toContain('aria-expanded="true"');
    expect(accordionMarkup).toContain("Community observations only.");
    expect(sliderMarkup).toContain('role="slider"');
    expect(sliderMarkup).toContain('aria-label="Lightning risk"');
    expect(sliderMarkup).toContain("size-6");
    expect(tableMarkup).toContain('role="region"');
    expect(tableMarkup).toContain('tabindex="0"');
    expect(tableMarkup).toContain('aria-label="Seed observations"');
  });

  test("merges conflicting utility classes through cn", async () => {
    const missing = ownedModules.filter(
      (path) => !existsSync(resolve(projectRoot, path)),
    );

    expect(missing).toEqual([]);

    const { cn } = await loadModule<typeof import("../../lib/utils")>(
      "../../lib/utils",
    );

    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe(
      "text-sm px-4",
    );
  });

  test("defines the field-manual theme and global motion and overflow safeguards", () => {
    const css = readFileSync(resolve(projectRoot, "app/globals.css"), "utf8");

    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain("--background: #08110f");
    expect(css).toContain("--surface: #101d19");
    expect(css).toContain("--grow: #59d17d");
    expect(css).toContain("--lightning: #f4c95d");
    expect(css).toContain("--risk: #ff6b5f");
    expect(css).toContain("@theme inline");
    expect(css).toMatch(/html\s*{[^}]*overflow-x:\s*clip/);
    expect(css).toMatch(
      /button,\s*input,\s*select,\s*textarea\s*{[^}]*min-height:\s*44px/,
    );
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("scroll-behavior: auto !important");
  });
});
