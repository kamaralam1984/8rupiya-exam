import type { Metadata } from "next";
import { ProbabilityClient } from "./ProbabilityClient";

export const metadata: Metadata = {
  title: "Selection Probability Meter",
  description:
    "AI computes your selection probability from real attempt data — accuracy, consistency, time control and weak chapters.",
  alternates: { canonical: "/probability" },
};

export default function ProbabilityPage() {
  return (
    <section className="container pt-10 pb-20 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">AI predictor</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Selection <span className="ai-gradient-text">Probability</span> Meter
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Honest, data-driven probability of selection — based on your last 20 attempts, accuracy curve,
          time control and weak chapters. Conservative AI estimate, not a guarantee.
        </p>
      </header>
      <ProbabilityClient />
    </section>
  );
}
