import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const exam = await db.exam.findUnique({
      where: { slug },
      include: {
        subjects: { include: { chapters: true } },
        testSets: {
          where: { isPublished: true },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            kind: true,
            durationMin: true,
            isPremium: true,
            priceInPaise: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");
    return ok(exam);
  } catch (e) {
    return handleError(e);
  }
}
