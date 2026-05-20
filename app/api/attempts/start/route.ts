import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { startAttemptSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = startAttemptSchema.parse(await req.json());

    const testSet = await db.testSet.findUnique({
      where: { slug: body.testSetSlug },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                stem: true,
                options: true,
                language: true,
              },
            },
          },
        },
      },
    });
    if (!testSet || !testSet.isPublished) return fail("Test set not available", 404, "NOT_FOUND");

    const isPaidRole = user.role === "ADMIN" || user.role === "PREMIUM" || user.role === "FAMILY";
    if (testSet.isPremium && !isPaidRole) {
      const unlock = await db.unlock.findUnique({
        where: { userId_testSetId: { userId: user.id, testSetId: testSet.id } },
      });
      if (!unlock) return fail("Premium test locked. Pay ₹8 to unlock.", 402, "PAYMENT_REQUIRED");
    }

    const existing = await db.attempt.findFirst({
      where: { userId: user.id, testSetId: testSet.id, status: "IN_PROGRESS" },
    });
    if (existing) {
      return ok({
        attemptId: existing.id,
        durationMin: testSet.durationMin,
        questions: sanitize(testSet.questions),
        resumed: true,
      });
    }

    const attempt = await db.attempt.create({
      data: { userId: user.id, testSetId: testSet.id },
    });

    return ok({
      attemptId: attempt.id,
      durationMin: testSet.durationMin,
      questions: sanitize(testSet.questions),
      resumed: false,
    });
  } catch (e) {
    return handleError(e);
  }
}

function sanitize(rows: Array<{ question: { id: string; stem: string; options: unknown; language: string }; order: number; marksRight: number; marksWrong: number }>) {
  return rows.map((r) => ({
    id: r.question.id,
    stem: r.question.stem,
    options: r.question.options,
    language: r.question.language,
    order: r.order,
    marksRight: r.marksRight,
    marksWrong: r.marksWrong,
  }));
}
