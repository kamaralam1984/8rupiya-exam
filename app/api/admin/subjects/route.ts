import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  examSlug: z.string().min(1),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  parentSlug: z.string().nullable().optional(),
  splitEnabled: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const examSlug = url.searchParams.get("examSlug") ?? undefined;
    const exam = examSlug
      ? await db.exam.findUnique({ where: { slug: examSlug }, select: { id: true } })
      : null;
    if (examSlug && !exam) return fail("Exam not found", 404, "NOT_FOUND");
    const rows = await db.subject.findMany({
      where: exam ? { examId: exam.id } : {},
      orderBy: [{ parentId: { sort: "asc", nulls: "first" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        splitEnabled: true,
        parentId: true,
        examId: true,
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { children: true, questions: true } },
      },
    });
    return ok(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = createSchema.parse(await req.json());

    const exam = await db.exam.findUnique({ where: { slug: body.examSlug }, select: { id: true } });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    let parentId: string | null = null;
    if (body.parentSlug) {
      const parent = await db.subject.findUnique({
        where: { examId_slug: { examId: exam.id, slug: body.parentSlug } },
        select: { id: true },
      });
      if (!parent) return fail("Parent subject not found", 404, "PARENT_NOT_FOUND");
      parentId = parent.id;
    }

    const created = await db.subject.create({
      data: {
        examId: exam.id,
        name: body.name,
        slug: body.slug,
        parentId,
        splitEnabled: body.splitEnabled,
      },
      select: { id: true, name: true, slug: true, splitEnabled: true, parentId: true },
    });

    await db.auditLog.create({
      data: { userId: admin.id, action: "SUBJECT_CREATED", target: `Subject:${created.id}`, meta: body },
    }).catch(() => {});

    return ok(created);
  } catch (e: any) {
    if (e?.code === "P2002") return fail("Subject slug already exists for this exam", 409, "DUPLICATE");
    return handleError(e);
  }
}
