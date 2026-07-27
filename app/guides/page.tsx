import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CloudLightning } from "lucide-react";

import {
  ContentPage,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Greedy Growers Guides",
  description:
    "Evidence-bounded Greedy Growers guides for the confirmed gameplay loop and transparent harvest decisions.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/guides/beginner-guide",
    icon: BookOpen,
    title: "Beginner guide",
    description:
      "The small set of actions confirmed by the creator's public Roblox description—and the details still awaiting gameplay evidence.",
  },
  {
    href: "/guides/when-to-harvest",
    icon: CloudLightning,
    title: "When to harvest",
    description:
      "Compare a certain harvest with an uncertain wait using your own values, risk interval, and explicit assumptions.",
  },
] as const;

export default function GuidesPage() {
  return (
    <ContentPage
      eyebrow="Field notes / 02 published"
      title="Greedy Growers guides"
      description="Short guides that separate confirmed gameplay from calculator assumptions. We publish fewer pages rather than fill unknown mechanics with guesses."
      status="Game version: unverified · Official-description facts only"
    >
      <section aria-labelledby="published-guides">
        <h2
          id="published-guides"
          className="font-display text-2xl font-semibold text-foreground"
        >
          Published field notes
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {guides.map(({ href, icon: Icon, title, description }) => (
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
                  Read guide
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <EvidenceNote>
          There are no published seed rankings, code instructions, or advanced
          system guides yet. Those topics need current, attributable evidence
          before they become useful pages.
        </EvidenceNote>
      </div>

      <div className="mt-6">
        <InlineCta href="/">Open the harvest calculator</InlineCta>
      </div>
    </ContentPage>
  );
}
