"use client";
import { motion } from "framer-motion";
import { Smartphone, Download, Apple, Bell, Wifi, Sparkles } from "lucide-react";

export function AppDownloadSection() {
  return (
    <section id="app" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-2 top-10 left-1/4 w-[480px] h-[480px] opacity-25" />
        <div className="aurora aurora-3 bottom-0 right-1/4 w-[420px] h-[420px] opacity-25" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="ai-chip mb-4">
              <Smartphone className="h-3 w-3 text-cyan-300" /> Pocket mein 8Rupia
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Phone pe <span className="ai-gradient-text">install</span> karo, offline padho
            </h2>
            <p className="mt-4 text-muted-foreground">
              8Rupia ek Progressive Web App hai — Play Store ya App Store ki zaroorat nahi.
              Browser se direct install, native app jaisa experience, offline tests aur push notifications.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Download, text: "1-click install — koi 100MB download nahi" },
                { icon: Wifi, text: "Offline mock tests jab signal kamzor ho" },
                { icon: Bell, text: "Push notifications — DPP, live class aur streak reminders" },
                { icon: Sparkles, text: "Auto-update — naye features bina app store wait ke" },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <p.icon className="h-4 w-4 text-purple-300 mt-0.5 shrink-0" />
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const evt = new Event("8r:install-prompt");
                  window.dispatchEvent(evt);
                }}
                className="btn-ai"
              >
                <Download className="h-4 w-4" /> Install app
              </button>
              <a href="#features" className="btn-ghost-ai">See features</a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="mx-auto w-[280px] h-[560px] rounded-[2.4rem] border-4 border-foreground/20 bg-gradient-to-b from-background to-muted shadow-2xl p-3 relative overflow-hidden">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-foreground/30" />
              <div className="mt-7 h-full rounded-[1.8rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 text-white">
                <p className="text-xs uppercase tracking-wider opacity-80">8Rupia</p>
                <p className="mt-2 font-display text-3xl font-bold leading-tight">AI Se<br />Banega<br />Selection</p>
                <div className="mt-6 space-y-3">
                  <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                    <p className="text-[10px] opacity-80">Today's DPP</p>
                    <p className="font-bold">10 questions · 15 min</p>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                    <p className="text-[10px] opacity-80">Streak</p>
                    <p className="font-bold">27 din 🔥</p>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                    <p className="text-[10px] opacity-80">Battle</p>
                    <p className="font-bold">vs 🦊 Aarav</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Apple className="h-3 w-3" /> iOS Safari</span>
              <span>·</span>
              <span>Android Chrome</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
