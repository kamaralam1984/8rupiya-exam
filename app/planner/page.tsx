import type { Metadata } from "next";
import { PlannerClient } from "./PlannerClient";

export const metadata: Metadata = {
  title: "AI Study Planner",
  description: "Get a personalized week-by-week study plan for your target exam.",
  alternates: { canonical: "/planner" },
};

export default function PlannerPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Study Planner</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell us the exam, days you have, and daily study hours. We'll build a week-by-week plan
          weighted by syllabus.
        </p>
      </header>
      <PlannerClient />
    </section>
  );
}
