import { NotebookPen, Sprout, Zap, type LucideIcon } from "lucide-react";

import { GameScene } from "../game/GameScene";
import { gameSceneAssets } from "../../features/visuals/assets";

const facts: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    icon: Sprout,
    title: "Use visible values",
    body: "Start with the harvest value you can read now and a future value tied to one specific wait.",
  },
  {
    icon: Zap,
    title: "Set your own risk",
    body: "Estimate lightning risk for that wait window. The calculator never inserts an official probability.",
  },
  {
    icon: NotebookPen,
    title: "Audit every assumption",
    body: "Residual value and waiting cost stay visible, so you can see exactly why the result changes.",
  },
];

export function CalculatorContext() {
  return (
    <aside
      aria-label="Calculator evidence reminders"
      className="mt-6 border border-survey-line bg-surface px-5 py-5 sm:px-6"
    >
      <GameScene asset={gameSceneAssets.home} compact />

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {facts.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="border border-survey-line bg-surface-raised px-4 py-4"
          >
            <div className="flex size-9 items-center justify-center rounded-[4px] border border-lightning/40 bg-background text-lightning">
              <Icon aria-hidden="true" className="size-4" />
            </div>
            <p className="mt-3 font-display text-lg font-semibold text-foreground">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
