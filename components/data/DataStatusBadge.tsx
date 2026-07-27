import type { DataStatus } from "@/features/data/types";

const STATUS_STYLES: Record<DataStatus, string> = {
  verified: "border-grow/50 bg-grow/10 text-grow",
  observed: "border-lightning/50 bg-lightning/10 text-lightning",
  estimated: "border-risk/50 bg-risk/10 text-risk",
  conflicting: "border-risk/50 bg-risk/10 text-risk",
  unknown: "border-survey-line bg-surface-raised text-muted-foreground",
  needs_recheck: "border-survey-line bg-surface-raised text-muted-foreground",
};

const STATUS_LABELS: Record<DataStatus, string> = {
  verified: "Verified",
  observed: "Observed",
  estimated: "Estimated",
  conflicting: "Conflicting",
  unknown: "Unknown",
  needs_recheck: "Needs recheck",
};

export function DataStatusBadge({ status }: { status: DataStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-[0.12em] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
