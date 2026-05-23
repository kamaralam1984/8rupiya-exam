import type { Metadata } from "next";
import { ReviseClient } from "./ReviseClient";

export const metadata: Metadata = {
  title: "Smart Revision (SRS) — Spaced Repetition",
  description:
    "AI-scheduled flashcards. Cards you forget come back tomorrow; cards you know go to next week. Long-term recall on autopilot.",
  alternates: { canonical: "/revise" },
};

export default function RevisePage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Spaced repetition</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          <span className="ai-gradient-text">Smart</span> Revision
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          SM-2 inspired scheduler. Rate every card — forgot, hard, good ya easy — AI
          decide karega kab dobara dikhana hai. Brain-friendly, exam-grade recall.
        </p>
      </header>
      <ReviseClient />
    </section>
  );
}
