import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Calculator, CloudLightning } from "lucide-react";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
} from "@/components/layout/ContentPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Greedy Growers Guides — Beginner and Harvest Strategy",
  description:
    "Start Greedy Growers with an evidence-bounded beginner guide, a transparent harvest calculator, and practical risk scenarios.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/#calculator",
    icon: Calculator,
    title: "Harvest calculator",
    description:
      "Compare harvesting now with one defined wait using values, costs, and interval risk that you enter yourself.",
    action: "Open calculator",
  },
  {
    href: "/guides/beginner-guide",
    icon: BookOpen,
    title: "Beginner guide",
    description:
      "Follow the small gameplay loop confirmed by the creator's public Roblox description, with unknown details marked clearly.",
    action: "Read beginner guide",
  },
  {
    href: "/guides/when-to-harvest",
    icon: CloudLightning,
    title: "When to harvest",
    description:
      "Compare a certain harvest with an uncertain wait using your own values, risk interval, and explicit assumptions.",
    action: "Read harvest guide",
  },
] as const;

const linkClassName = "font-semibold text-lightning hover:underline";

export default function GuidesPage() {
  return (
    <ContentPage
      eyebrow="Start here / Greedy Growers guides"
      title="Greedy Growers guides"
      description="Choose a clear starting point, learn the confirmed loop, and make a transparent harvest decision without treating estimates as official game data."
      status="Reviewed 2026-08-02 · Official-description facts and player-entered scenarios"
    >
      <section aria-labelledby="published-guides">
        <h2
          id="published-guides"
          className="font-display text-2xl font-semibold text-foreground"
        >
          Choose your next step
        </h2>
        <p className="mt-4 max-w-[72ch] leading-7 text-muted-foreground">
          You do not need to read every page before playing. Pick the task that
          matches what you need now, then return to the other guides when your
          next decision changes.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {guides.map(({ href, icon: Icon, title, description, action }) => (
            <Card key={href} className="flex h-full flex-col">
              <CardHeader>
                <Icon aria-hidden="true" className="size-6 text-lightning" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <CardDescription className="text-base leading-7">
                  {description}
                </CardDescription>
                <Link
                  href={href}
                  className="mt-5 inline-flex min-h-11 items-center font-semibold text-lightning hover:underline"
                >
                  {action}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ContentSection title="Where should a new player start?">
        <p>
          Start with the{" "}
          <Link href="/guides/beginner-guide" className={linkClassName}>
            beginner guide
          </Link>{" "}
          if you want the shortest evidence-bounded explanation of the game.
          The official Roblox description confirms a simple loop: buy a seed
          from the river, plant it in your plot, let the tree grow, and decide
          when to harvest before lightning becomes the outcome you regret. The
          guide deliberately stops there when the public source stops.
        </p>
        <p>
          Use the{" "}
          <Link href="/guides/when-to-harvest" className={linkClassName}>
            when-to-harvest guide
          </Link>{" "}
          when your question changes from “what do I do?” to “is another wait
          worth the risk?” It explains expected value, the break-even risk,
          three hypothetical scenarios, and the conditions that favor an
          immediate harvest. Its numbers illustrate the method; they are not
          prices or probabilities taken from Greedy Growers.
        </p>
      </ContentSection>

      <ContentSection title="Recommended reading order">
        <ol className="grid gap-4 pl-5 marker:font-mono marker:text-lightning">
          <li>
            <span className="font-semibold text-foreground">Learn the boundary.</span>{" "}
            Read the beginner guide so confirmed actions and unanswered
            mechanics do not blur together.
          </li>
          <li>
            <span className="font-semibold text-foreground">Define one decision.</span>{" "}
            Note what harvesting now is worth, what you think the same tree
            could be worth after a specific wait, and what could remain after
            a bad outcome.
          </li>
          <li>
            <span className="font-semibold text-foreground">Compare and test.</span>{" "}
            Run those assumptions through the calculator, then change one input
            at a time. A result is useful because its assumptions are visible,
            not because it predicts the next lightning strike.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Greedy Growers guide FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">
              Is the calculator an official Roblox tool?
            </h3>
            <p className="mt-1">
              No. It is a fan-made scenario calculator. It compares the inputs
              you provide and does not know when lightning will strike.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Where are the best-seed rankings?
            </h3>
            <p className="mt-1">
              They are not published because the current evidence set does not
              verify seed names, prices, rarity, returns, or a stable game
              version. A confident-looking ranking without that evidence would
              be less useful than an explicit unknown.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Can I use my own observations?
            </h3>
            <p className="mt-1">
              Yes. Enter what you can observe or reasonably estimate for one
              scenario. Keep the time interval attached to your risk estimate
              and recalculate when the situation changes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Why are some navigation pages still incomplete?
            </h3>
            <p className="mt-1">
              Data-heavy topics stay unpublished or noindex until they have
              current, attributable evidence. The editorial guides remain
              useful by explaining the confirmed loop and the decision method
              without filling those gaps with guesses.
            </p>
          </div>
        </div>
      </ContentSection>

      <div className="mt-2">
        <EvidenceNote>
          Source boundary: the gameplay loop on these pages was reviewed
          against the creator&apos;s public Roblox experience description on
          2026-08-02. No official seed economics, lightning probability, or
          advanced-system claim is added here.
        </EvidenceNote>
      </div>
    </ContentPage>
  );
}
