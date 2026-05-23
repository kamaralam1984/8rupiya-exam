import type { Metadata } from "next";
import { SummariesClient } from "./SummariesClient";

export const metadata: Metadata = {
  title: "AI Lecture Summaries",
  description:
    "Paste a lecture transcript, YouTube notes or your raw class notes — AI returns a structured summary with key points, formulas and 5 quick MCQs.",
  alternates: { canonical: "/summaries" },
};

export default function SummariesPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Lecture AI</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          AI <span className="ai-gradient-text">Lecture</span> Summaries
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Apne class notes ya lecture transcript paste karo — AI bullet-point summary,
          formulas aur 5 MCQs nikal dega for instant revision.
        </p>
      </header>
      <SummariesClient />
    </section>
  );
}
