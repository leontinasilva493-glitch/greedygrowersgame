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
    title: "Use the boundary first",
    body: "Read the maximum tolerable risk before adding your own estimate. Seconds never generate hidden odds.",
  },
  {
    icon: NotebookPen,
    title: "Count every failed run",
    body: "Run profit includes lost attempts and elapsed time instead of showing only the final successful harvest.",
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
