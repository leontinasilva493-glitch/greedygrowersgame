import { ExternalLink } from "lucide-react";

import type { Source } from "@/features/data/types";

export interface SourceLedgerEntry {
  sourceId: string;
  label: string;
  claimStatus: string;
  note: string;
}

export function SourceLedger({
  sources,
  entries,
}: {
  sources: Source[];
  entries: readonly SourceLedgerEntry[];
}) {
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {entries.map((entry) => {
        const source = sourceById.get(entry.sourceId);

        if (!source) {
          throw new Error(`Missing source ledger entry: ${entry.sourceId}`);
        }

        return (
          <article
            key={`${entry.sourceId}-${entry.label}`}
            className="flex h-full flex-col border border-survey-line bg-surface px-4 py-4"
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-grow">
              {entry.label}
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
              {source.title}
            </h3>
            <p className="mt-2 text-sm leading-6">{entry.note}</p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Claim status: <strong className="text-foreground">{entry.claimStatus}</strong>
              <br />
              Checked: {formatDate(source.capturedAt)}
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-lightning hover:underline"
            >
              Open source
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </article>
        );
      })}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
