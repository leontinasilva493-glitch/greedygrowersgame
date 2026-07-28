import Image from "next/image";

import type { GameSceneAsset } from "@/features/visuals/assets";
import { cn } from "@/lib/utils";

export function GameScene({
  asset,
  preload = false,
  compact = false,
  className,
}: {
  asset: GameSceneAsset;
  preload?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <figure
      data-game-scene={asset.id}
      className={cn(
        "overflow-hidden rounded-[8px] border border-survey-line bg-background shadow-[0_18px_48px_rgb(0_0_0_/_0.22)]",
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-survey-line bg-surface-raised">
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 680px"
          preload={preload}
          className={cn(
            "w-full object-cover",
            compact ? "h-36 sm:h-52" : "aspect-[3/2] h-auto",
          )}
          style={{ objectPosition: asset.focalPoint }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_42%,rgb(39_223_255_/_0.12)_50%,transparent_58%)]"
        />
      </div>
      <figcaption className="flex flex-col gap-1 bg-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-grow">
          Fan-made illustration
        </span>
        <span className="text-xs leading-5 text-muted-foreground sm:text-right">
          {asset.caption}
        </span>
      </figcaption>
    </figure>
  );
}
