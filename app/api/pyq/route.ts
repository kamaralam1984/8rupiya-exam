import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  examSlug: z.string().min(1),
  subjectSlug: z.string().optional(),
  yearFrom: z.coerce.number().int().min(1990).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1990).max(2100).optional(),
  topic: z.string().max(120).optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(20),
});

export async function GET(req: Request) {
  try {
    await requireUser();
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return fail("Invalid filters", 400, "BAD_REQUEST");
    const f = parsed.data;

    // Optional subject id lookup
    let subjectId: string | undefined;
    if (f.subjectSlug) {
      const exam = await db.exam.findUnique({ where: { slug: f.examSlug }, select: { id: true } });
      if (!exam) return fail("Exam not found", 404, "NOT_FOUND");
      const subject = await db.subject.findUnique({
        where: { examId_slug: { examId: exam.id, slug: f.subjectSlug } },
        select: { id: true },
      });
      subjectId = subject?.id;
    }

    const where: any = {
      isPyq: true,
      examSlug: f.examSlug,
      ...(subjectId ? { subjectId } : {}),
      ...(f.yearFrom || f.yearTo
        ? {
            year: {
              ...(f.yearFrom ? { gte: f.yearFrom } : {}),
              ...(f.yearTo ? { lte: f.yearTo } : {}),
            },
          }
        : {}),
      ...(f.topic ? { topic: { contains: f.topic, mode: "insensitive" } } : {}),
      ...(f.q ? { stem: { contains: f.q, mode: "insensitive" } } : {}),
    };

    const [items, total, yearAgg] = await Promise.all([
      db.question.findMany({
        where,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        skip: (f.page - 1) * f.pageSize,
        take: f.pageSize,
        select: {
          id: true,
          stem: true,
          options: true,
          correctIndex: true,
          difficulty: true,
          language: true,
          year: true,
          topic: true,
          examSlug: true,
          subject: { select: { name: true, slug: true } },
        },
      }),
      db.question.count({ where }),
      db.question.groupBy({
        by: ["year"],
        where: { isPyq: true, examSlug: f.examSlug, ...(subjectId ? { subjectId } : {}) },
        _count: { _all: true },
        orderBy: { year: "desc" },
      }),
    ]);

    return ok({
      items,
      total,
      page: f.page,
      pageSize: f.pageSize,
      pageCount: Math.max(1, Math.ceil(total / f.pageSize)),
      years: yearAgg
        .filter((r) => r.year != null)
        .map((r) => ({ year: r.year as number, count: r._count._all })),
    });
  } catch (e) {
    return handleError(e);
  }
}
