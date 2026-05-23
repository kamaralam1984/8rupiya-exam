import type { Metadata } from "next";
import { MotivationClient } from "./MotivationClient";

export const metadata: Metadata = {
  title: "Motivation & Burnout Detector",
  description:
    "Mood track karo, burnout signals dekho, AI mentor se pep talk lo. Sustainable prep ka secret yahi hai.",
  alternates: { canonical: "/motivation" },
};

export default function MotivationPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Mind care</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          <span className="ai-gradient-text">Motivation</span> & Burnout Detector
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Padhai mein utna hi zaroori hai mind. Apna mood, sleep aur stress bata —
          AI burnout score nikalega aur pep talk dega.
        </p>
      </header>
      <MotivationClient />
    </section>
  );
}
