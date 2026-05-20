"use client";
import { motion } from "framer-motion";
import {
  Brain, Target, FileText, LineChart, Mic, Trophy, Calendar, Lightbulb, ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Mock Test Engine",
    body: "Adaptive difficulty, topic-wise drills, full-length mocks and randomized question pools with negative marking support.",
  },
  {
    icon: FileText,
    title: "PDF → MCQ Generator",
    body: "Upload a PDF and let AI extract questions, generate explanations, detect topics and build chapter-wise tests automatically.",
  },
  {
    icon: Target,
    title: "Predicted Question Sets",
    body: "Models trained on a decade of past papers surface likely topics, repeated patterns and high-weightage chapters. Educational guidance — no leak claims.",
  },
  {
    icon: LineChart,
    title: "Weakness Analyzer",
    body: "After every test, AI maps weak chapters, slow topics, accuracy drops and guess-rates, then prescribes a personalized study path.",
  },
  {
    icon: Calendar,
    title: "Smart Study Planner",
    body: "7-day and 30-day AI-generated plans with revision cycles, daily goals and progress tracking aligned to your exam date.",
  },
  {
    icon: Lightbulb,
    title: "AI Doubt Solver",
    body: "Snap a photo or paste a question — get step-by-step Hindi or English explanations powered by Claude.",
  },
  {
    icon: Mic,
    title: "AI Voice Tutor",
    body: "Audio explanations in Hindi and English. Listen on the go, even on a slow connection.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    body: "XP, streaks, badges, real-time leaderboards and rank tiers keep daily practice addictive.",
  },
  {
    icon: ShieldCheck,
    title: "AdSense & UPI Safe",
    body: "Privacy, Terms and Disclaimer pages, original educational content, Razorpay UPI payments and bot-protected APIs.",
  },
];

export function FeaturesSection() {
  return (
    <section className="container py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          A complete <span className="gradient-text">AI study ecosystem</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Everything an Indian student needs to crack their exam — built around adaptive AI
          coaching, not generic question banks.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="glass rounded-2xl p-6 gradient-border"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-accent/20">
              <f.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
