import type { Metadata } from "next";
import { LiveRoomClient } from "./LiveRoomClient";

export const metadata: Metadata = {
  title: "Live class",
  description: "HD live class powered by LiveKit.",
};

type Props = { params: Promise<{ id: string }> };

export default async function LiveRoomPage({ params }: Props) {
  const { id } = await params;
  return (
    <section className="container pt-6 pb-20 max-w-5xl">
      <header className="mb-6">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Live class</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Room <span className="ai-gradient-text">{id}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          HD streaming · live chat · polls. Admin = host, sab baki students = viewer.
        </p>
      </header>
      <LiveRoomClient roomName={id} />
    </section>
  );
}
