import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  examSlug: z.string(),
  questionCount: z.number().int().min(10).max(300),
  durationMin: z.number().int().min(5).max(300),
  subject: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const exam = await db.exam.findUnique({
      where: { slug: body.examSlug },
      select: { id: true, name: true },
    });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    const subjectFilter = body.subject ? { subject: { name: body.subject } } : {};

    // Prefer PDF-sourced approved questions
    let questions = await db.question.findMany({
      where: { examSlug: body.examSlug, pdfId: { not: null }, approved: true, ...subjectFilter },
      select: { id: true },
    });

    // Fall back: PDF questions without approval filter
    if (questions.length < 10) {
      questions = await db.question.findMany({
        where: { examSlug: body.examSlug, pdfId: { not: null }, ...subjectFilter },
        select: { id: true },
      });
    }

    // Fall back: any questions for this exam
    if (questions.length < 10) {
      questions = await db.question.findMany({
        where: {
          ...subjectFilter,
          OR: [
            { examSlug: body.examSlug },
            { subject: { exam: { slug: body.examSlug } } },
          ],
        },
        select: { id: true },
      });
    }

    if (questions.length === 0) {
      return fail("No questions available for this exam yet.", 404, "NO_QUESTIONS");
    }

    // Shuffle and pick
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(body.questionCount, shuffled.length));

    const slug = `${body.examSlug}-custom-${Date.now()}-${user.id.slice(-4)}`;

    const testSet = await db.testSet.create({
      data: {
        examId: exam.id,
        title: `${exam.name} — Custom Mock (${selected.length}Q / ${body.durationMin}min)`,
        slug,
        kind: "MOCK",
        durationMin: body.durationMin,
        isPremium: false,
        isPublished: true,
        questions: {
          create: selected.map((q, i) => ({
            questionId: q.id,
            order: i + 1,
            marksRight: 1.0,
            marksWrong: -0.25,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: { id: true, stem: true, options: true, language: true },
            },
          },
        },
      },
    });

    const attempt = await db.attempt.create({
      data: { userId: user.id, testSetId: testSet.id },
    });

    return ok({
      attemptId: attempt.id,
      testSetSlug: slug,
      durationMin: body.durationMin,
      questions: testSet.questions.map((r) => ({
        id: r.question.id,
        stem: r.question.stem,
        options: r.question.options,
        language: r.question.language,
        order: r.order,
        marksRight: r.marksRight,
        marksWrong: r.marksWrong,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
