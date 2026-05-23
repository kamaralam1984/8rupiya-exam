import type { Metadata } from "next";
import { VoiceTutorClient } from "./VoiceTutorClient";

export const metadata: Metadata = {
  title: "AI Voice Tutor",
  description:
    "Hands-free study companion. Speak your doubt in Hindi or English, get spoken step-by-step explanation. Perfect for revision walks.",
  alternates: { canonical: "/voice-tutor" },
};

export default function VoiceTutorPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Hands-free</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          AI <span className="ai-gradient-text">Voice</span> Tutor
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Mic press karo, doubt bolo — Hindi ya English — AI wapas voice mein samjhayega.
          Walking revision aur driving learning ke liye perfect.
        </p>
      </header>
      <VoiceTutorClient />
    </section>
  );
}
