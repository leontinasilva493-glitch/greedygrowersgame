# Homepage On-Page SEO Design

## Goal

Raise the homepage's topical clarity for `Greedy Growers Calculator` while preserving the calculator-first experience and the site's evidence-gated product policy.

## Decisions

- Keep the calculator in the first viewport. Add explanatory content below it rather than placing an article before the tool.
- Use the exact target phrase in the title, description, H1, and one H2. Use semantic related terms elsewhere instead of repeating the exact phrase unnaturally.
- Render explanatory content as a Server Component. Keep only calculator state and analytics consent inside Client Components.
- Preserve the current evidence boundary: examples are illustrative, lightning risk is user supplied, and the page never claims official values or predictions.
- Normalize the homepage to `https://greedygrowersgame.com/`. Redirect HTTP requests before serving content.
- Replace the shared form-field helper sentence with field-specific instructions so the visible copy reflects the user's task instead of a repeated template.

## Information Architecture

1. H1 and concise calculator explanation.
2. H2 calculator form with H3 advanced assumptions.
3. Result panel and optional analytics.
4. H2 sections explaining the formula, inputs, results, worked examples, and FAQs.

## Acceptance Criteria

- Title: `Greedy Growers Calculator: Harvest Now or Wait?`
- Description: `Use the Greedy Growers Calculator to compare harvest value, wait value, and lightning risk, see the break-even point, and decide whether to harvest or wait.`
- Exactly one H1 containing the complete target phrase.
- No H1-to-H3 heading jump on the homepage.
- Canonical and Open Graph URL resolve to the framework-normalized root URL `https://greedygrowersgame.com`.
- HTTP production requests redirect permanently to the equivalent HTTPS URL and preserve path and query.
- Visible homepage copy reaches at least 1,200 English words in the production HTML without relying on client-only loading.
- Worked examples are explicitly labeled illustrative and do not claim official probabilities or game values.
- Targeted tests, lint, typecheck, data/evidence validation, brand check, and production build pass.
