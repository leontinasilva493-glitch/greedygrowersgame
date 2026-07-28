import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface ContentPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  status?: string;
  visual?: ReactNode;
}

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
  status,
  visual,
}: ContentPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
      <header className="relative overflow-hidden border-b border-survey-line pb-8 sm:pb-10">
        <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-30 sm:block" aria-hidden="true">
          <span className="absolute right-8 top-3 h-24 w-px -rotate-12 bg-lightning/50" />
          <span className="absolute right-20 top-10 h-16 w-px -rotate-12 bg-grow/30" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-grow">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
        {status ? (
          <p className="mt-5 inline-flex items-center gap-2 rounded-[3px] border border-dashed border-survey-line bg-surface px-3 py-2 font-mono text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4 text-lightning" />
            {status}
          </p>
        ) : null}
        {visual ? <div className="relative z-10 mt-7 max-w-4xl">{visual}</div> : null}
      </header>
      <div className="mt-8 min-w-0">{children}</div>
    </main>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-dashed border-survey-line py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 max-w-[72ch] space-y-4 leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function EvidenceNote({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-lightning bg-surface px-4 py-4 text-sm leading-6 text-muted-foreground">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-lightning">
        Evidence note
      </p>
      <div className="mt-2">{children}</div>
    </aside>
  );
}

export function InlineCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-[4px] font-semibold text-lightning underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}
