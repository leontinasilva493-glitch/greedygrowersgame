"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

import type { VideoEvidence } from "@/features/guides/video-evidence";

export function VideoEvidenceCard({ video }: { video: VideoEvidence }) {
  const [loaded, setLoaded] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <aside className="overflow-hidden rounded-[8px] border border-survey-line bg-surface" aria-labelledby={`${video.id}-title`}>
      <div className="border-b border-survey-line bg-surface-raised px-5 py-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-lightning">
          Third-party gameplay reference
        </p>
        <h3 id={`${video.id}-title`} className="mt-2 font-display text-xl font-semibold text-foreground">
          {video.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {video.creator} · Published {video.publishedAt} · {video.duration}
        </p>
      </div>
      {loaded ? (
        <iframe
          className="aspect-video w-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="flex min-h-48 flex-col items-start justify-center gap-4 px-5 py-6">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Load this third-party YouTube video only if you want the gameplay context. The guide remains complete without it.
          </p>
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-lightning px-4 font-semibold text-background transition hover:bg-lightning/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <Play aria-hidden="true" className="size-4" />
            Load video from YouTube
          </button>
        </div>
      )}
      <div className="grid gap-4 border-t border-survey-line px-5 py-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
        <p><strong className="text-foreground">What it supports:</strong> {video.supports}</p>
        <p><strong className="text-foreground">What it does not prove:</strong> {video.doesNotProve}</p>
      </div>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center gap-2 border-t border-survey-line px-5 py-3 text-sm font-semibold text-lightning hover:underline"
      >
        Watch on YouTube <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    </aside>
  );
}
