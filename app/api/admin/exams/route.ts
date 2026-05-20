import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const exams = await db.exam.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        short: true,
        description: true,
        durationMin: true,
        questions: true,
        isActive: true,
        _count: { select: { testSets: true, subjects: true } },
      },
    });
    return ok(exams);
  } catch (e) {
    return handleError(e);
  }
}
