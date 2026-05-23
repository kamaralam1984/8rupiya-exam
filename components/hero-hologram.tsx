"use client";
import { motion } from "framer-motion";
import { Bot, Sparkles, Mic, MessageSquareText } from "lucide-react";
import Link from "next/link";

export function HeroHologram() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-pink-500/40 blur-2xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative neon-card p-6 backdrop-blur-xl bg-gradient-to-br from-background/60 to-background/30 border-white/10"
      >
        {/* Scan-line overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(34,211,238,0.10) 4px)",
          }}
        />

        {/* Avatar core */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40"
        >
          <Bot className="h-12 w-12 text-white" />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-cyan-300/40"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
            />
          ))}
        </motion.div>

        <p className="mt-5 text-center font-display text-lg font-bold">
          <span className="ai-gradient-text">Golu AI</span> hologram online
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">24×7 mentor · Hindi + English</p>

        <div className="mt-5 space-y-2">
          {[
            { icon: MessageSquareText, txt: "NEET Biology me genetics samjhao 🙏" },
            { icon: Bot, txt: "Sure — 3-step lesson chala dun? Mendel's laws se start karte hain." },
            { icon: Mic, txt: "Voice se bhi pucho — 'Newton's second law…'", muted: true },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.18 }}
              className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                m.muted ? "text-muted-foreground" : "bg-foreground/5"
              }`}
            >
              <m.icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-cyan-300" />
              <span>{m.txt}</span>
            </motion.div>
          ))}
        </div>

        <Link
          href="/voice-tutor"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:from-cyan-400 hover:to-purple-500"
        >
          <Sparkles className="h-4 w-4" /> Talk to Golu
        </Link>
      </motion.div>
    </div>
  );
}
