import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(80).optional(),
  short: z.string().min(1).max(160).optional(),
  description: z.string().min(1).max(2000).optional(),
  durationMin: z.number().int().min(5).max(360).optional(),
  questions: z.number().int().min(5).max(500).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin();
    const { slug } = await ctx.params;
    const body = patchSchema.parse(await req.json());

    const data: any = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.name) data.name = body.name;
    if (body.short) data.short = body.short;
    if (body.description) data.description = body.description;
    if (body.durationMin) data.durationMin = body.durationMin;
    if (body.questions) data.questions = body.questions;

    const updated = await db.exam.update({ where: { slug }, data });

    await db.auditLog.create({
      data: { userId: admin.id, action: "EXAM_UPDATED", target: `Exam:${slug}`, meta: body },
    }).catch(() => {});

    return ok({
      slug: updated.slug,
      name: updated.name,
      isActive: updated.isActive,
      durationMin: updated.durationMin,
      questions: updated.questions,
    });
  } catch (e: any) {
    if (e?.code === "P2025") return fail("Exam not found", 404, "NOT_FOUND");
    return handleError(e);
  }
}
