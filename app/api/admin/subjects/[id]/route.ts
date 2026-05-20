import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  splitEnabled: z.boolean().optional(),
  parentSlug: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());

    const current = await db.subject.findUnique({ where: { id }, select: { examId: true } });
    if (!current) return fail("Subject not found", 404, "NOT_FOUND");

    let parentIdUpdate: string | null | undefined = undefined;
    if (body.parentSlug !== undefined) {
      if (body.parentSlug === null) parentIdUpdate = null;
      else {
        const parent = await db.subject.findUnique({
          where: { examId_slug: { examId: current.examId, slug: body.parentSlug } },
          select: { id: true },
        });
        if (!parent) return fail("Parent subject not found", 404, "PARENT_NOT_FOUND");
        if (parent.id === id) return fail("A subject cannot be its own parent", 400, "BAD_PARENT");
        parentIdUpdate = parent.id;
      }
    }

    const updated = await db.subject.update({
      where: { id },
      data: {
        name: body.name,
        splitEnabled: body.splitEnabled,
        parentId: parentIdUpdate,
      },
      select: { id: true, name: true, slug: true, splitEnabled: true, parentId: true },
    });

    await db.auditLog.create({
      data: { userId: admin.id, action: "SUBJECT_UPDATED", target: `Subject:${id}`, meta: body },
    }).catch(() => {});

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;

    const s = await db.subject.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        _count: { select: { questions: true, children: true } },
      },
    });
    if (!s) return fail("Subject not found", 404, "NOT_FOUND");
    if (s._count.questions > 0) return fail(`Cannot delete — ${s._count.questions} question(s) reference this subject. Move or delete the questions first.`, 409, "HAS_QUESTIONS");
    if (s._count.children > 0) return fail(`Cannot delete — ${s._count.children} child subject(s) exist. Remove children first.`, 409, "HAS_CHILDREN");

    await db.subject.delete({ where: { id } });
    await db.auditLog.create({
      data: { userId: admin.id, action: "SUBJECT_DELETED", target: `Subject:${id}`, meta: { slug: s.slug } },
    }).catch(() => {});
    return ok({ deleted: id });
  } catch (e) {
    return handleError(e);
  }
}
