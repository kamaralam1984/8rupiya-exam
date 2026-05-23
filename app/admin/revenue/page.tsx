import type { Metadata } from "next";
import { RevenueAdminView } from "./RevenueAdminView";

export const metadata: Metadata = { title: "Revenue Analytics — Admin" };

export default function AdminRevenuePage() {
  return (
    <section className="container pt-10 pb-20 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Admin · revenue</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Revenue <span className="ai-gradient-text">analytics</span>
        </h1>
        <p className="mt-2 text-muted-foreground">MRR, last-30-day revenue, refund rate aur purpose-wise breakdown.</p>
      </header>
      <RevenueAdminView />
    </section>
  );
}
