"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Mic, Send, Heart, Sparkles, Image as ImageIcon } from "lucide-react";

const CHAT = [
  { who: "user", text: "Bhai, NEET Biology me genetics samajh nahi aa raha 😩" },
  { who: "ai", text: "Tension mat lo! 3-step approach try karte hain — first Mendel's laws revise, fir crosses practice, fir 50 MCQ. Shall I start lesson 1? 🚀" },
  { who: "user", text: "Han chalo. Aur mujhe daily 6 ghante padhna hai." },
  { who: "ai", text: "Locked in 💪 — 06:00 AM ko study planner ping karega. Aaj ka mission: 30 genetics MCQs + 1 mock. Tumhari accuracy abhi 62% hai, lakshya 80% rakha hai." },
];

export function GoluAISection() {
  return (
    <section id="golu-ai" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-2 top-10 left-10 w-[420px] h-[420px] opacity-30" />
        <div className="aurora aurora-1 bottom-10 right-20 w-[480px] h-[480px] opacity-30" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="ai-chip mb-4">
              <Bot className="h-3 w-3 text-purple-300" />
              Meet your AI mentor
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Milo <span className="ai-gradient-text">Golu AI</span> se —
              tumhara 24×7 mentor
            </h2>

            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              Golu sirf chatbot nahi hai. Ye tumhe har subject samjhata hai, motivate karta hai,
              burnout detect karta hai aur tumhari study habits ke according plan dynamic update karta hai —
              Hindi + English dono mein, voice ya text.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Heart, text: "Emotional support + motivation jab mood off ho" },
                { icon: Mic, text: "Voice conversation — bilkul real mentor jaisa" },
                { icon: ImageIcon, text: "Image upload karke handwritten doubt solve" },
                { icon: Sparkles, text: "Smart reminders — kya padho, kab padho, kitna padho" },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/30 text-purple-300 shrink-0">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="pt-1 text-muted-foreground">{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/doubt" className="btn-ai">
                <Sparkles className="h-4 w-4" /> Talk to Golu now
              </Link>
              <Link href="/onboarding" className="btn-ghost-ai">
                Set up my mentor
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — chat hologram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="neon-card p-5 max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="relative">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/40">
                    <Bot className="h-5 w-5 text-white" />
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Golu AI</p>
                  <p className="text-xs text-emerald-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online — Hindi + English
                  </p>
                </div>
                <span className="ai-chip text-[10px] py-1">Pro</span>
              </div>

              {/* Chat */}
              <div className="py-4 space-y-3 max-h-80 overflow-hidden">
                {CHAT.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                    className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${
                      m.who === "user"
                        ? "bg-white/10 border border-white/10 rounded-tr-sm"
                        : "bg-gradient-to-br from-indigo-500/25 to-purple-500/15 border border-purple-400/30 rounded-tl-sm"
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-purple-400/20 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button aria-label="Voice" className="grid place-items-center h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:bg-purple-500/15">
                  <Mic className="h-4 w-4 text-purple-300" />
                </button>
                <input
                  placeholder="Type or speak…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-purple-400/50"
                />
                <button aria-label="Send" className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
