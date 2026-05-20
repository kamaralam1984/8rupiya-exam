import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const attempts = await db.attempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 25,
      include: {
        testSet: { select: { title: true, slug: true, exam: { select: { name: true, slug: true } } } },
      },
    });
    return ok(attempts);
  } catch (e) {
    return handleError(e);
  }
}
