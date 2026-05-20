import type { Metadata } from "next";
import { Predict2026Client } from "./Predict2026Client";

export const metadata: Metadata = {
  title: "AI 2026 Predictor — 8Rupia",
  description:
    "AI-powered 2026 prediction set built from 10 years of previous-year exam questions. Each question carries a confidence score.",
  alternates: { canonical: "/predict-2026" },
};

export default function Predict2026Page() {
  return (
    <section className="container pt-10 pb-20 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool · paid model</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gradient-text">2026 Predictor</span> from PYQ patterns
        </h1>
        <p className="mt-2 text-muted-foreground">
          We analyze the past 10 years of <strong>previous-year question papers</strong> and project
          which topics + question styles are likely to appear next cycle. Each generated question
          carries a <strong>confidence score</strong> (0-100). Educational projection — not an actual leak.
        </p>
      </header>
      <Predict2026Client />
    </section>
  );
}
