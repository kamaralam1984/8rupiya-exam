import type { Metadata } from "next";
import { RadarClient } from "./RadarClient";

export const metadata: Metadata = {
  title: "AI Exam Radar",
  description: "Trending high-frequency topics for each exam — an educational study aid based on historical question patterns.",
  alternates: { canonical: "/radar" },
};

export default function RadarPage() {
  return (
    <section className="container pt-10 pb-20 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Exam Radar</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Topics that historically score high in your target exam. <strong className="text-foreground">Educational guidance only — not an actual exam leak.</strong>
        </p>
      </header>
      <RadarClient />
    </section>
  );
}
