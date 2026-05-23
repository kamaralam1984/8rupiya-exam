import type { Metadata } from "next";
import { DppClient } from "./DppClient";

export const metadata: Metadata = {
  title: "Daily Practice Problems (DPP)",
  description:
    "10 fresh questions every day. Calibrated to your exam pattern. Build streak, unlock XP, never miss a topic.",
  alternates: { canonical: "/dpp" },
};

export default function DppPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Daily mission</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Daily <span className="ai-gradient-text">Practice</span> Problems
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          10 questions. 15 minutes. Streak break mat hone dena — selection routine ki neev yahi hai.
        </p>
      </header>
      <DppClient />
    </section>
  );
}
