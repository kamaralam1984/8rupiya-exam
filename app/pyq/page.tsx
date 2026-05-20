import type { Metadata } from "next";
import { PyqClient } from "./PyqClient";

export const metadata: Metadata = {
  title: "Previous Year Questions — 8Rupia",
  description: "Search through 10+ years of previous-year exam questions. Filter by exam, subject, year and topic.",
  alternates: { canonical: "/pyq" },
};

export default function PyqPage() {
  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">Archive</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gradient-text">Previous Year</span> Questions
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Search the past 10+ years of exam questions, indexed by subject, year and topic.
          Use this data to spot trends — and try our AI-powered 2026 predictor.
        </p>
      </header>
      <PyqClient />
    </section>
  );
}
