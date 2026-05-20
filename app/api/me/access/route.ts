import { readSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { activeSubscription, hasPaidAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      return ok({ authenticated: false, paid: false, subscription: null });
    }
    const paid = await hasPaidAccess(session.sub);
    const sub = paid ? await activeSubscription(session.sub) : null;
    return ok({
      authenticated: true,
      paid,
      subscription: sub
        ? { plan: sub.plan, startsAt: sub.startsAt, endsAt: sub.endsAt }
        : null,
    });
  } catch (e) {
    return handleError(e);
  }
}
