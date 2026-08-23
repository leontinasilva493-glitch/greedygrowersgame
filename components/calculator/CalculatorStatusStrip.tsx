import { CalendarClock, CircleAlert, Database, ShieldCheck } from "lucide-react";

import evidenceManifest from "../../research/evidence-manifest.json";

const checkedDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${evidenceManifest.auditDate}T00:00:00.000Z`));

const items = [
  {
    icon: ShieldCheck,
    label: "Player-input only",
    detail: "No game economy presets",
  },
  {
    icon: Database,
    label: `Version ${evidenceManifest.versionBasis.label}`,
    detail: "Evidence gate remains closed",
  },
  {
    icon: CalendarClock,
    label: `Checked ${checkedDate}`,
    detail: "Refresh after new evidence",
  },
  {
    icon: CircleAlert,
    label: "No official lightning probability",
    detail: "Seconds never create hidden odds",
  },
] as const;

export function CalculatorStatusStrip() {
  return (
    <section
      aria-label="Calculator data status"
      className="mt-4 grid gap-px overflow-hidden border border-survey-line bg-survey-line sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(({ icon: Icon, label, detail }) => (
        <div key={label} className="bg-background px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-lightning" />
            {label}
          </p>
          <p className="mt-1 pl-6 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
      ))}
    </section>
  );
}
