import type { Metadata } from "next";
import { CareerClient } from "./CareerClient";

export const metadata: Metadata = {
  title: "AI Career Predictor",
  description:
    "Tell us about your subjects, interests and target class — AI suggests 3 best career tracks and the exams to crack them.",
  alternates: { canonical: "/career" },
};

export default function CareerPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Find your path</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          AI <span className="ai-gradient-text">Career</span> Predictor
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Apne subjects, interests aur strengths bata — AI 3 best-fit careers, required exams aur
          12-month roadmap suggest karega. Honest, India-specific.
        </p>
      </header>
      <CareerClient />
    </section>
  );
}
