import type { Metadata } from "next";
import { NcertClient } from "./NcertClient";

export const metadata: Metadata = {
  title: "NCERT Solutions",
  description:
    "Chapter-wise NCERT solutions for Class 10 and Class 12 — Science, Maths, Physics, Chemistry, Biology and Social Science.",
  alternates: { canonical: "/ncert" },
};

export default function NcertPage() {
  return (
    <section className="container pt-10 pb-20 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Board reference</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          <span className="ai-gradient-text">NCERT</span> Solutions
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Class 10 aur Class 12 ke har chapter — concise, exam-ready notes aur AI-explanations.
          Topic select karke instant doubt solve.
        </p>
      </header>
      <NcertClient />
    </section>
  );
}
