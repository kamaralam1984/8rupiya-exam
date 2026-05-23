import type { Metadata } from "next";
import { LiveAdminView } from "./LiveAdminView";

export const metadata: Metadata = { title: "Live Class Controls — Admin" };

export default function AdminLivePage() {
  return (
    <section className="container pt-10 pb-20 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Admin · live</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Live class <span className="ai-gradient-text">controls</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Schedule, start, end aur replay links manage karo. Saari rows ek hi JSON setting mein save hoti hain.
        </p>
      </header>
      <LiveAdminView />
    </section>
  );
}
