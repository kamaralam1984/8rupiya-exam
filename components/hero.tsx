"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Brain, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCounter } from "@/components/stats-counter";
import { useT } from "@/lib/i18n";

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="container relative pt-12 md:pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 w-full max-w-[460px] md:max-w-[560px]"
          >
            <Image
              src="/brand-logo.png"
              alt="8Rupia — Smart Exam Practice"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]"
            />
          </motion.div>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            India&apos;s first ₹8 AI-powered exam platform
          </span>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight">
            {t("hero.tagline")}
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("hero.sub")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/exams">
              <Button size="lg" className="group">
                {t("cta.startFree")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/predict">
              <Button size="lg" variant="glass">
                <Brain className="h-4 w-4" />
                {t("cta.aiPredict")}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                <BarChart3 className="h-4 w-4" />
                {t("cta.analyzeWeak")}
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-16"
        >
          <StatsCounter />
        </motion.div>

        <FloatingOrbs />
      </div>
    </section>
  );
}

function FloatingOrbs() {
  return (
    <>
      <div
        aria-hidden
        className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-accent/25 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
    </>
  );
}
