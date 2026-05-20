import type { Metadata } from "next";
import { FlashcardsClient } from "./FlashcardsClient";

export const metadata: Metadata = {
  title: "AI Flashcards",
  description: "Generate concise flashcards on any topic for quick revision.",
  alternates: { canonical: "/flashcards" },
};

export default function FlashcardsPage() {
  return (
    <section className="container pt-10 pb-20 max-w-2xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Flashcards</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate concise revision cards on any topic. Flip to reveal the answer.
        </p>
      </header>
      <FlashcardsClient />
    </section>
  );
}
