import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const examSlug = url.searchParams.get("examSlug") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;

    const sets = await db.testSet.findMany({
      where: {
        ...(examSlug ? { exam: { slug: examSlug } } : {}),
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        kind: true,
        durationMin: true,
        isPremium: true,
        priceInPaise: true,
        isPublished: true,
        createdAt: true,
        exam: { select: { name: true, slug: true } },
        _count: { select: { questions: true, attempts: true, unlocks: true } },
      },
    });
    return ok(sets);
  } catch (e) {
    return handleError(e);
  }
}
