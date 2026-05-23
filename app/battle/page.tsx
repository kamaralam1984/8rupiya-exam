import type { Metadata } from "next";
import { BattleClient } from "./BattleClient";

export const metadata: Metadata = {
  title: "Battle Arena — 1v1 Quiz Duels",
  description:
    "Real-time quiz battles. Challenge a rival, answer 10 questions, earn XP and climb the league.",
  alternates: { canonical: "/battle" },
};

export default function BattlePage() {
  return (
    <section className="container pt-10 pb-20 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Live arena</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          <span className="ai-gradient-text">Battle</span> Arena
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          10 sawal. 60 second per question. Sabse zyada sahi jawab — sabse kam time mein —
          XP aur crown jeet le. Solo bot mode ya quick-match.
        </p>
      </header>
      <BattleClient />
    </section>
  );
}
