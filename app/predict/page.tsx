import type { Metadata } from "next";
import { PredictClient } from "./PredictClient";

export const metadata: Metadata = {
  title: "AI Predicted Test",
  description:
    "AI-generated practice questions weighted toward historically high-frequency exam topics. Educational study aid only — not an actual leaked paper.",
  alternates: { canonical: "/predict" },
};

export default function PredictPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Predicted Test</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate a study-aid question set weighted toward topics that historically appear most.
          <strong className="text-foreground"> Educational practice only — not an actual exam leak.</strong>
        </p>
      </header>
      <PredictClient />
    </section>
  );
}
