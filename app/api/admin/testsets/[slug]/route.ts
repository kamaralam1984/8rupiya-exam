import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  title: z.string().min(3).max(160).optional(),
  description: z.string().max(2000).nullable().optional(),
  durationMin: z.number().int().min(5).max(360).optional(),
  priceInPaise: z.number().int().min(0).max(1000000).optional(),
  kind: z.string().min(2).max(40).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin();
    const { slug } = await ctx.params;
    const body = patchSchema.parse(await req.json());

    const data: any = {};
    for (const k of Object.keys(body) as (keyof typeof body)[]) {
      if (body[k] !== undefined) data[k] = body[k];
    }

    const updated = await db.testSet.update({
      where: { slug },
      data,
      select: {
        slug: true, title: true, isPublished: true, isPremium: true,
        priceInPaise: true, durationMin: true, kind: true,
      },
    });

    await db.auditLog.create({
      data: { userId: admin.id, action: "TESTSET_UPDATED", target: `TestSet:${slug}`, meta: body },
    }).catch(() => {});

    return ok(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return fail("Test set not found", 404, "NOT_FOUND");
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin();
    const { slug } = await ctx.params;

    const ts = await db.testSet.findUnique({
      where: { slug },
      select: { id: true, title: true, _count: { select: { attempts: true } } },
    });
    if (!ts) return fail("Test set not found", 404, "NOT_FOUND");
    if (ts._count.attempts > 0) {
      return fail(
        `Cannot delete — ${ts._count.attempts} student attempt(s) exist. Unpublish instead.`,
        409,
        "HAS_ATTEMPTS",
      );
    }

    await db.testSet.delete({ where: { slug } });
    await db.auditLog.create({
      data: { userId: admin.id, action: "TESTSET_DELETED", target: `TestSet:${slug}`, meta: { title: ts.title } },
    }).catch(() => {});

    return ok({ deleted: slug });
  } catch (e) {
    return handleError(e);
  }
}
