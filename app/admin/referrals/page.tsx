import type { Metadata } from "next";
import { ReferralsAdminView } from "./ReferralsAdminView";

export const metadata: Metadata = { title: "Referral Analytics — Admin" };

export default function AdminReferralsPage() {
  return (
    <section className="container pt-10 pb-20 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Admin · referrals</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Referral <span className="ai-gradient-text">analytics</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Top referrers, conversion-to-paid aur last-30-day signups.</p>
      </header>
      <ReferralsAdminView />
    </section>
  );
}
