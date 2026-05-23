"use client";
import { useState } from "react";
import { Play, X } from "lucide-react";

type Props = {
  /** YouTube video ID or full URL */
  videoId?: string;
  label?: string;
};

export function DemoVideoModal({ videoId = "dQw4w9WgXcQ", label = "Play 90-sec demo" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur text-sm font-medium hover:bg-white/10 transition"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/40">
          <Play className="h-3.5 w-3.5 text-white fill-current ml-0.5" />
        </span>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="8Rupia demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
