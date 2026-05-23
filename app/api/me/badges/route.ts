import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { BADGES } from "@/lib/badges";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db.userBadge.findMany({
      where: { userId: user.id },
      orderBy: { awardedAt: "desc" },
      select: { code: true, awardedAt: true },
    });
    const earnedMap = new Map(rows.map((r) => [r.code, r.awardedAt]));
    const list = BADGES.map((b) => ({
      ...b,
      earned: earnedMap.has(b.code),
      awardedAt: earnedMap.get(b.code)?.toISOString() ?? null,
    }));
    return ok({
      badges: list,
      stats: {
        total: BADGES.length,
        earned: rows.length,
        xp: user.xp,
        streak: user.streak,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
