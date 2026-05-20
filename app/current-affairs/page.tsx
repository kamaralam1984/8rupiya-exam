import type { Metadata } from "next";
import { CurrentAffairsClient } from "./CurrentAffairsClient";

export const metadata: Metadata = {
  title: "Daily Current Affairs Quiz",
  description: "AI-generated current-affairs MCQs for Indian competitive exam aspirants — refreshes daily.",
  alternates: { canonical: "/current-affairs" },
};

export default function CurrentAffairsPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">Daily refresh</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Current Affairs <span className="gradient-text">Quiz</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          8 fresh MCQs every day for competitive prep. Educational study material — verify dates against official sources.
        </p>
      </header>
      <CurrentAffairsClient />
    </section>
  );
}
