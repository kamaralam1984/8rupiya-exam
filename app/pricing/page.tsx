import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PricingClient } from "./PricingClient";
import { KNOWN_FEATURES } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Pricing — Subscription plans for AI exam prep",
  description:
    "Pick a plan that fits your prep — Free starter, Premium for unlimited AI mocks + doubt solver + study planner, or Family plan for the whole household.",
  alternates: { canonical: "/pricing" },
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let plans: Array<{
    id: string; slug: string; name: string; description: string | null;
    priceInPaise: number; durationDays: number; targetRole: string;
    features: string[]; isHighlighted: boolean;
  }> = [];
  try {
    plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, slug: true, name: true, description: true,
        priceInPaise: true, durationDays: true, targetRole: true,
        features: true, isHighlighted: true,
      },
    });
  } catch {
    // DB unreachable — render empty state
  }

  const featureLabels = Object.fromEntries(
    KNOWN_FEATURES.map((f) => [f.key, f.label]),
  );

  return <PricingClient plans={plans} featureLabels={featureLabels} />;
}
