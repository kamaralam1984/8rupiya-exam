import type { Metadata } from "next";
import { AchievementsClient } from "./AchievementsClient";

export const metadata: Metadata = {
  title: "Achievements & Badges",
  description: "Unlock badges for streaks, perfect scores, battle wins and more. Your prep, gamified.",
  alternates: { canonical: "/achievements" },
};

export default function AchievementsPage() {
  return (
    <section className="container pt-10 pb-20 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Your trophy room</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          <span className="ai-gradient-text">Achievements</span> & badges
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Har streak, har battle, har perfect mock — sab unlock hota hai. Apne progress ko visible rakho.
        </p>
      </header>
      <AchievementsClient />
    </section>
  );
}
