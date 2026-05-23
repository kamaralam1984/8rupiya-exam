import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const since7 = new Date(now); since7.setDate(now.getDate() - 7);
    const [total, last7] = await Promise.all([
      db.pushSubscription.count(),
      db.pushSubscription.count({ where: { createdAt: { gte: since7 } } }),
    ]);
    const hasVapid = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY) && !!process.env.VAPID_PRIVATE_KEY;
    return ok({ totalSubscribers: total, last7Subscribers: last7, vapidConfigured: hasVapid });
  } catch (e) {
    return handleError(e);
  }
}
