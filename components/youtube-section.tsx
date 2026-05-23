"use client";
import { motion } from "framer-motion";
import { Youtube, Play, ArrowUpRight, Users } from "lucide-react";
import { DemoVideoModal } from "@/components/demo-video-modal";

type Video = {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  gradient: string;
};

const VIDEOS: Video[] = [
  { id: "dQw4w9WgXcQ", title: "NEET 2026 — Genetics Marathon Class", duration: "1h 42m", views: "284K", thumbnail: "🧬", gradient: "from-rose-500 to-pink-600" },
  { id: "dQw4w9WgXcQ", title: "JEE Calculus — One Shot Revision", duration: "2h 10m", views: "192K", thumbnail: "📐", gradient: "from-indigo-500 to-purple-600" },
  { id: "dQw4w9WgXcQ", title: "SSC CGL Reasoning — Top 50 Tricks", duration: "55m",   views: "421K", thumbnail: "🧮", gradient: "from-cyan-500 to-blue-600" },
  { id: "dQw4w9WgXcQ", title: "UPSC Polity — Articles 1-15 Decoded", duration: "1h 18m", views: "176K", thumbnail: "🏛️", gradient: "from-emerald-500 to-teal-600" },
];

export function YouTubeSection() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-xl">
            <div className="ai-chip mb-3">
              <Youtube className="h-3 w-3 text-rose-400" /> 8Rupia YouTube
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Free <span className="ai-gradient-text">YouTube</span> classes
            </h2>
            <p className="mt-3 text-muted-foreground">
              4.2M+ subscribers · marathon sessions, one-shot revisions aur live PYQ decodes — bilkul free.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@8rupiya"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-ai"
          >
            <Users className="h-4 w-4" /> Subscribe <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VIDEOS.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="neon-card p-3"
            >
              <div className={`relative aspect-video rounded-lg bg-gradient-to-br ${v.gradient} flex items-center justify-center text-5xl`}>
                {v.thumbnail}
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
                <span className="absolute inset-0 grid place-items-center opacity-0 hover:opacity-100 bg-black/40 rounded-lg transition">
                  <Play className="h-10 w-10 text-white fill-current" />
                </span>
              </div>
              <h3 className="mt-3 font-display font-bold text-sm leading-snug line-clamp-2">{v.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{v.views} views</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <DemoVideoModal label="Play 8Rupia intro" />
        </div>
      </div>
    </section>
  );
}
