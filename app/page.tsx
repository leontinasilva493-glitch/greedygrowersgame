import { CalculatorExperience } from "@/components/calculator";
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
      <CalculatorExperience />
    </>
  );
}
