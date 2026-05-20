import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const a = await db.attempt.findUnique({
      where: { id },
      include: {
        testSet: { select: { title: true, slug: true, durationMin: true } },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                stem: true,
                options: true,
                correctIndex: true,
                explanation: true,
                difficulty: true,
                subject: { select: { name: true } },
                chapter: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    if (!a || a.userId !== user.id) return fail("Attempt not found", 404, "NOT_FOUND");
    return ok(a);
  } catch (e) {
    return handleError(e);
  }
}
