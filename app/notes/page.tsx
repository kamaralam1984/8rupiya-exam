import type { Metadata } from "next";
import { NotesClient } from "./NotesClient";

export const metadata: Metadata = {
  title: "AI Revision Notes",
  description: "Generate concise revision notes with key points, definitions and mnemonics.",
  alternates: { canonical: "/notes" },
};

export default function NotesPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground">AI tool</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          AI <span className="gradient-text">Revision Notes</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get exam-ready notes with definitions, mnemonics and sample questions.
        </p>
      </header>
      <NotesClient />
    </section>
  );
}
