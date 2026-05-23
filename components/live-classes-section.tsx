"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Users, Radio, Video, MessageCircle, ThumbsUp, FileText } from "lucide-react";

const CLASSES = [
  {
    title: "NEET Biology — Genetics Marathon",
    teacher: "Dr. Anjali Sharma",
    students: "12,841",
    time: "Live abhi",
    tag: "live",
    color: "from-rose-500 to-pink-600",
  },
  {
    title: "JEE Maths — Calculus Mega Class",
    teacher: "Rohit Sir (IIT Delhi)",
    students: "9,302",
    time: "7:00 PM",
    tag: "upcoming",
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "SSC GK — One-Shot Revision",
    teacher: "Priya Ma'am",
    students: "5,670",
    time: "9:30 PM",
    tag: "upcoming",
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "UPSC GS-2 — Polity Doubt Session",
    teacher: "Arjun Sir",
    students: "3,420",
    time: "Kal 6 PM",
    tag: "upcoming",
    color: "from-emerald-500 to-teal-600",
  },
];

export function LiveClassesSection() {
  return (
    <section id="live-classes" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-4 top-20 right-1/4 w-[480px] h-[480px] opacity-25" />
      </div>

      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="ai-chip mb-3">
              <Radio className="h-3 w-3 text-rose-400" />
              <span className="ai-chip-dot" /> Live now
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              <span className="ai-gradient-text">Live Classes</span> jo PW se behtar
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              HD streaming, real-time chat, polls, doubts aur AI auto-generated lecture notes — sab ek hi screen par.
            </p>
          </div>
          <Link href="/live" className="btn-ghost-ai">View all classes</Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {CLASSES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="neon-card overflow-hidden group"
            >
              <div className={`relative aspect-video bg-gradient-to-br ${c.color} overflow-hidden`}>
                {/* Mock player frame */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_60%)]" />
                <div className="absolute inset-0 scan-line" />

                {/* Live badge */}
                {c.tag === "live" ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[11px] font-bold uppercase tracking-wider">
                    {c.time}
                  </span>
                )}

                {/* Viewer count */}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs font-semibold">
                  <Users className="h-3 w-3" /> {c.students}
                </span>

                {/* Play button center */}
                <button className="absolute inset-0 grid place-items-center">
                  <span className="grid place-items-center h-16 w-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 group-hover:scale-110 transition shadow-2xl">
                    <Play className="h-7 w-7 text-white fill-white ml-1" />
                  </span>
                </button>

                {/* Bottom info strip */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white/70 font-medium">{c.teacher}</p>
                  <p className="text-white font-bold text-lg leading-tight mt-0.5">{c.title}</p>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 1.2k doubts</span>
                  <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" /> 8.4k</span>
                  <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> AI notes</span>
                </div>
                <button className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition">
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
