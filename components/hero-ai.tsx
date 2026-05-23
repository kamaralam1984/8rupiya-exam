"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles, Brain, Zap, Mic, Play, ArrowRight, TrendingUp,
  Users, Award, Activity, BookOpen, Target,
} from "lucide-react";
import { AiBrainBackground } from "@/components/ai-brain-background";
import { DemoVideoModal } from "@/components/demo-video-modal";
import { AirTicker } from "@/components/air-ticker";

const TYPING_PHRASES = [
  "NEET 2026 ki taiyari?",
  "JEE Advanced predict karu?",
  "SSC CGL mock dilao?",
  "Weakness analyze karu?",
  "Doubt solve karu — Hindi ya English?",
];

function useTypewriter(phrases: string[], speed = 60, pause = 1400) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const phrase = phrases[idx % phrases.length];
    const timeout = setTimeout(() => {
      if (!del) {
        const next = phrase.slice(0, text.length + 1);
        setText(next);
        if (next === phrase) setTimeout(() => setDel(true), pause);
      } else {
        const next = phrase.slice(0, Math.max(0, text.length - 1));
        setText(next);
        if (next === "") {
          setDel(false);
          setIdx((i) => i + 1);
        }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, del, idx, phrases, speed, pause]);

  return text;
}

function useLiveCounter(start: number, drift = 3) {
  const [n, setN] = useState(start);
  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => v + Math.floor(Math.random() * drift) + 1);
    }, 2200);
    return () => clearInterval(id);
  }, [drift]);
  return n;
}

export function HeroAI() {
  const typed = useTypewriter(TYPING_PHRASES);
  const liveStudents = useLiveCounter(8421, 4);
  const tests = useLiveCounter(2143, 2);

  return (
    <section className="relative overflow-hidden">
      {/* Aurora + animated AI brain background */}
      <AiBrainBackground opacity={0.16} />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-1 -top-32 -left-20 w-[480px] h-[480px]" />
        <div className="aurora aurora-2 top-40 -right-32 w-[520px] h-[520px]" />
        <div className="aurora aurora-3 bottom-0 left-1/3 w-[420px] h-[420px]" />
        <div className="aurora aurora-4 -bottom-20 right-1/4 w-[360px] h-[360px]" />
        <div className="absolute inset-0 ai-grid-bg" />
      </div>

      <div className="container relative pt-12 md:pt-20 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT — Headline + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            {/* Top chip */}
            <div className="ai-chip mb-6">
              <span className="ai-chip-dot" />
              India ka pehla AI Exam OS
              <Sparkles className="h-3 w-3" />
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              <span className="ai-gradient-text">AI Se Banega</span>
              <br />
              <span className="text-foreground">Selection</span>
              <span className="text-pink-400">.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Sirf <span className="font-bold text-foreground">₹8</span> me AI-powered mock tests,
              predicted questions, weakness analysis, live classes aur{" "}
              <span className="ai-gradient-text-cyan font-semibold">Golu AI</span> mentor —
              NEET, JEE, SSC, Railway, Banking, CUET, UPSC, CTET ke liye.
            </p>

            {/* Typing assistant box */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 glass-ai rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/40">
                <Brain className="h-4.5 w-4.5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Golu AI puchh raha hai
                </p>
                <p className="text-sm md:text-base font-medium truncate">
                  {typed}
                  <span className="type-cursor text-purple-400">▍</span>
                </p>
              </div>
              <button
                aria-label="Voice input"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 transition"
              >
                <Mic className="h-4 w-4 text-purple-300" />
              </button>
            </motion.div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/exams" className="btn-ai">
                <Zap className="h-4 w-4" />
                Start Free Test
              </Link>
              <Link href="/radar" className="btn-ghost-ai">
                <Target className="h-4 w-4 text-cyan-400" />
                Analyze My Weakness
              </Link>
              <Link href="/predict-2026" className="btn-ghost-ai">
                <Sparkles className="h-4 w-4 text-pink-400" />
                AI Predict Questions
              </Link>
              <Link href="#live-classes" className="btn-ghost-ai">
                <Play className="h-4 w-4 text-emerald-400" />
                Join Live Classes
              </Link>
              <DemoVideoModal label="Play demo" />
            </div>

            {/* Live stat strip */}
            <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <LiveStat icon={<Users className="h-4 w-4" />} label="Live abhi" value={liveStudents.toLocaleString("en-IN")} color="cyan" />
              <LiveStat icon={<Activity className="h-4 w-4" />} label="Tests aaj" value={tests.toLocaleString("en-IN")} color="purple" />
              <LiveStat icon={<Award className="h-4 w-4" />} label="AIR <100" value="1,240+" color="pink" />
              <LiveStat icon={<TrendingUp className="h-4 w-4" />} label="Selections" value="47k+" color="emerald" />
            </div>

            {/* AIR ranks ticker */}
            <div className="mt-6 max-w-2xl">
              <AirTicker />
            </div>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Razorpay Secured</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />Hindi + English</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" />Anthropic Claude AI</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-400" />PWA — install karo</span>
            </div>
          </motion.div>

          {/* RIGHT — AI brain hologram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <AiBrainHologram />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LiveStat({
  icon, label, value, color,
}: { icon: React.ReactNode; label: string; value: string; color: "cyan" | "purple" | "pink" | "emerald" }) {
  const colorMap = {
    cyan: "text-cyan-300 from-cyan-500/20",
    purple: "text-purple-300 from-purple-500/20",
    pink: "text-pink-300 from-pink-500/20",
    emerald: "text-emerald-300 from-emerald-500/20",
  } as const;
  return (
    <div className={`glass-ai rounded-xl px-3 py-2.5 flex items-center gap-2.5 bg-gradient-to-br ${colorMap[color]} to-transparent`}>
      <span className={colorMap[color]}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">{label}</p>
        <p className="text-sm font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AiBrainHologram() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] aspect-square">
      {/* Outer orbital ring */}
      <div className="absolute inset-0 rounded-full border border-purple-500/20 pulse-glow" />
      <div className="absolute inset-8 rounded-full border border-cyan-400/15" />
      <div className="absolute inset-16 rounded-full border border-pink-400/10" />

      {/* Center: student photo in glowing ring */}
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-60 h-60 md:w-64 md:h-64 rounded-full glow-ring grid place-items-center overflow-hidden ring-4 ring-white/40 dark:ring-white/10 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 pointer-events-none" />
          <Image
            src="/hero-student.png"
            alt="8Rupia student"
            width={512}
            height={512}
            priority
            className="h-full w-full object-cover scale-110"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/30 pointer-events-none" />
        </motion.div>
      </div>

      {/* Orbiting icons */}
      <div className="absolute inset-0">
        {[
          { icon: BookOpen, color: "text-cyan-300", bg: "from-cyan-500/30 to-cyan-600/10", r: 180, delay: "0s" },
          { icon: Award, color: "text-pink-300", bg: "from-pink-500/30 to-pink-600/10", r: 180, delay: "-6s" },
          { icon: Target, color: "text-emerald-300", bg: "from-emerald-500/30 to-emerald-600/10", r: 180, delay: "-12s" },
        ].map((o, i) => (
          <div key={i} className="absolute top-1/2 left-1/2" style={{ animation: `orbit 18s linear infinite`, animationDelay: o.delay, transform: `translate(-50%,-50%)` }}>
            <div className="orbit" style={{ ["--r" as string]: `${o.r}px` }}>
              <div className={`grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br ${o.bg} border border-white/10 backdrop-blur-md shadow-lg`}>
                <o.icon className={`h-5 w-5 ${o.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating chips */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 -left-2 glass-ai rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium">Live AI active</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 -right-2 glass-ai rounded-xl px-3 py-2"
      >
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Prediction confidence</p>
        <p className="text-sm font-bold ai-gradient-text-cyan">94.6%</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-1/3 -left-6 glass-ai rounded-xl px-3 py-2"
      >
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">XP earned</p>
        <p className="text-sm font-bold text-amber-300">+218 ⚡</p>
      </motion.div>
    </div>
  );
}
