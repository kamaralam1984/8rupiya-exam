import type { Metadata } from "next";
import { CommunityClient } from "./CommunityClient";

export const metadata: Metadata = {
  title: "Community — Study Rooms & Toppers",
  description:
    "Join exam-wise study rooms, follow toppers, ask doubts and motivate each other. Real-time chat with polling.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <section className="container pt-10 pb-20 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Study together</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          The <span className="ai-gradient-text">Community</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Akela mat padhao. Apne exam ka room join karo, doubt puchho, motivate karo —
          live chat (polled every 3 seconds).
        </p>
      </header>
      <CommunityClient />
    </section>
  );
}
