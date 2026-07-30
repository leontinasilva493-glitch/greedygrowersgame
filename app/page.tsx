import {
  CalculatorContext,
  CalculatorExperience,
  CalculatorGuide,
  CalculatorIntro,
} from "@/components/calculator";
import { webApplicationSchema, websiteSchema } from "@/features/seo/schema";

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webApplicationSchema()) }}
      />
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <CalculatorExperience
          intro={<CalculatorIntro />}
          supportingContext={<CalculatorContext />}
        />
        <CalculatorGuide />
      </main>
    </>
  );
}
