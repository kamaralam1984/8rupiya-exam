"use client";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

export type NavStatus = "unseen" | "current" | "answered" | "review" | "review-answered" | "skipped";

export function TestNavigator({
  total, current, statuses, onJump,
}: {
  total: number;
  current: number;
  statuses: NavStatus[];
  onJump: (i: number) => void;
}) {
  const counts = statuses.reduce(
    (acc, s) => {
      if (s === "answered") acc.answered += 1;
      else if (s === "review" || s === "review-answered") acc.review += 1;
      else if (s === "skipped") acc.skipped += 1;
      else if (s === "unseen") acc.unseen += 1;
      return acc;
    },
    { answered: 0, review: 0, skipped: 0, unseen: 0 }
  );

  return (
    <aside className="glass rounded-2xl p-4 gradient-border">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Question Palette
      </h3>
      <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, i) => {
          const s = i === current ? "current" : statuses[i];
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}`}
              className={cn(
                "relative aspect-square rounded-md text-xs font-medium transition",
                s === "current" && "ring-2 ring-brand-500 bg-brand-500/20 text-foreground",
                s === "answered" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30",
                s === "skipped" && "bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30",
                s === "review" && "bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-500/30",
                s === "review-answered" && "bg-violet-600/30 text-violet-100 hover:bg-violet-600/40",
                s === "unseen" && "bg-muted hover:bg-muted/70"
              )}
            >
              {i + 1}
              {(s === "review" || s === "review-answered") && (
                <Flag className="absolute top-0.5 right-0.5 h-2.5 w-2.5" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 text-xs">
        <Row swatch="bg-emerald-500/40" label="Answered" count={counts.answered} />
        <Row swatch="bg-amber-500/40" label="Skipped" count={counts.skipped} />
        <Row swatch="bg-violet-500/40" label="For review" count={counts.review} />
        <Row swatch="bg-muted" label="Unseen" count={counts.unseen} />
      </div>
    </aside>
  );
}

function Row({ swatch, label, count }: { swatch: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded-sm", swatch)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{count}</span>
    </div>
  );
}
