import type { Metadata } from "next";
import { PushAdminView } from "./PushAdminView";

export const metadata: Metadata = { title: "Push Notifications — Admin" };

export default function AdminPushPage() {
  return (
    <section className="container pt-10 pb-20 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Admin · push</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Push <span className="ai-gradient-text">broadcasts</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sare subscribed devices ko notification bhej. VAPID keys env mein hone chahiye.
        </p>
      </header>
      <PushAdminView />
    </section>
  );
}
