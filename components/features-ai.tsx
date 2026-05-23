"use client";
import { motion } from "framer-motion";
import {
  Video, MessageSquareText, Radar, Sparkles, Timer, Trophy,
  CalendarHeart, Bot, Users2, WifiOff, Mic, BrainCircuit,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  accent: "indigo" | "purple" | "pink" | "cyan" | "emerald" | "amber" | "rose" | "blue";
};

const FEATURES: Feature[] = [
  {
    icon: Video,
    title: "Live Classes",
    desc: "HD streaming, live chat, polls, emoji reactions, doubt chat aur AI lecture summaries — sab kuch built-in.",
    tag: "HD + AI Notes",
    accent: "indigo",
  },
  {
    icon: MessageSquareText,
    title: "AI Doubt Solver",
    desc: "Text, voice ya image — koi bhi doubt puchho. Hindi + English mein step-by-step explanation milega.",
    tag: "Voice + Image",
    accent: "purple",
  },
  {
    icon: Radar,
    title: "AI Weakness Radar",
    desc: "Subject heatmap, chapter weakness, accuracy analytics aur smart recommendations — kya dohrana hai pata chal jayega.",
    tag: "Smart insights",
    accent: "cyan",
  },
  {
    icon: Sparkles,
    title: "AI Predicted Engine",
    desc: "Trend analysis se important topic probability aur exam-pattern predicted question sets — selection ki guaranteed practice.",
    tag: "Trend AI",
    accent: "pink",
  },
  {
    icon: Timer,
    title: "Real Mock Engine",
    desc: "NEET/JEE/SSC ka real exam environment — fullscreen, anti-distraction mode, timer animations aur instant rank prediction.",
    tag: "Exam-grade",
    accent: "blue",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "XP, coins, streaks, achievements, daily missions, rank ladders, battle mode aur student leagues — sirf padhai nahi, game hai.",
    tag: "Addictive",
    accent: "amber",
  },
  {
    icon: CalendarHeart,
    title: "AI Study Planner",
    desc: "Tumhare exam date, weak topics aur available time ke hisaab se personalized dynamic timetable — daily auto-adjust.",
    tag: "Dynamic plan",
    accent: "emerald",
  },
  {
    icon: Bot,
    title: "Golu AI Mentor",
    desc: "Human-jaisa AI mentor — motivational replies, voice conversation, smart reminders aur emotional engagement. 24x7 saath.",
    tag: "Your buddy",
    accent: "purple",
  },
  {
    icon: Users2,
    title: "Community & Battles",
    desc: "Study groups, toppers ke saath discussion, live chat rooms, competitive leaderboards aur 1v1 quiz battles.",
    tag: "1v1 + Squads",
    accent: "rose",
  },
  {
    icon: WifiOff,
    title: "Offline + PWA",
    desc: "Offline tests, app-style install, push notifications aur downloaded lectures — network down ho to bhi padhai chalti rahe.",
    tag: "Install ready",
    accent: "indigo",
  },
  {
    icon: Mic,
    title: "AI Voice Tutor",
    desc: "Natural Hindi/English voice mein concept explanation — chalte chalte, headphone laga ke revise karo.",
    tag: "Hands-free",
    accent: "cyan",
  },
  {
    icon: BrainCircuit,
    title: "Smart Revision Engine",
    desc: "Spaced repetition AI, flashcards aur revision reminders — bhulo mat, dimaag mein cement ho jaye.",
    tag: "Spaced reps",
    accent: "emerald",
  },
];

const ACCENT: Record<Feature["accent"], { glow: string; icon: string; chip: string }> = {
  indigo:  { glow: "from-indigo-500/40",  icon: "text-indigo-300",  chip: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30" },
  purple:  { glow: "from-purple-500/40",  icon: "text-purple-300",  chip: "bg-purple-500/15 text-purple-300 border-purple-400/30" },
  pink:    { glow: "from-pink-500/40",    icon: "text-pink-300",    chip: "bg-pink-500/15 text-pink-300 border-pink-400/30" },
  cyan:    { glow: "from-cyan-500/40",    icon: "text-cyan-300",    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30" },
  emerald: { glow: "from-emerald-500/40", icon: "text-emerald-300", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  amber:   { glow: "from-amber-500/40",   icon: "text-amber-300",   chip: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  rose:    { glow: "from-rose-500/40",    icon: "text-rose-300",    chip: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
  blue:    { glow: "from-blue-500/40",    icon: "text-blue-300",    chip: "bg-blue-500/15 text-blue-300 border-blue-400/30" },
};

export function FeaturesAI() {
  return (
    <section id="features" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-2 top-20 left-1/4 w-[480px] h-[480px] opacity-30" />
        <div className="aurora aurora-3 bottom-10 right-1/4 w-[420px] h-[420px] opacity-30" />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ai-chip mb-4 mx-auto">
            <span className="ai-chip-dot" /> Features
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Ek hi platform —{" "}
            <span className="ai-gradient-text">12+ AI superpowers</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            PW jo karta hai, woh sab. Plus AI ka woh sab jo aaj tak kisi Indian EdTech ne nahi diya.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const a = ACCENT[f.accent];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="neon-card neon-card-light p-6 group"
              >
                {/* Soft glow halo */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-radial ${a.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ background: `radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 70%)` }} />

                <div className="relative flex items-start justify-between gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-xl glass-ai ${a.icon}`}>
                    <f.icon className="h-6 w-6" />
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${a.chip}`}>
                    {f.tag}
                  </span>
                </div>

                <h3 className="relative mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>

                <div className="relative mt-5 flex items-center gap-2 text-xs font-semibold text-purple-300 opacity-0 group-hover:opacity-100 transition">
                  Explore <span aria-hidden>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
