import type { Metadata } from "next";
import { DoubtClient } from "./DoubtClient";

export const metadata: Metadata = {
  title: "AI Doubt Solver",
  description: "Ask any academic doubt and get a step-by-step explanation in Hindi or English.",
  alternates: { canonical: "/doubt" },
};

export default function DoubtPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Doubt Solver</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get a clear step-by-step explanation for any academic question — paste it below.
        </p>
      </header>
      <DoubtClient />
    </section>
  );
}
