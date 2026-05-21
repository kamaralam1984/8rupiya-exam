import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Public list of active subscription plans for the pricing page. */
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, slug: true, name: true, description: true,
        priceInPaise: true, durationDays: true, targetRole: true,
        features: true, isHighlighted: true,
      },
    });
    return ok(plans);
  } catch (e) {
    return handleError(e);
  }
}
