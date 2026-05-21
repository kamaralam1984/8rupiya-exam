import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional().nullable(),
  priceInPaise: z.number().int().min(0).max(10_000_000).optional(),
  durationDays: z.number().int().min(0).max(99999).optional(),
  targetRole: z.enum(["FREE", "PREMIUM", "FAMILY", "ADMIN"]).optional(),
  features: z.array(z.string().min(1).max(40)).optional(),
  isActive: z.boolean().optional(),
  isHighlighted: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    const updated = await db.plan.update({ where: { id }, data: body });
    await db.auditLog.create({
      data: { userId: admin.id, action: "PLAN_UPDATED", target: `Plan:${id}`, meta: body },
    }).catch(() => {});
    return ok(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return fail("Plan not found", 404, "NOT_FOUND");
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    // Don't hard-delete plans that have subscriptions — soft-disable instead.
    const subCount = await db.subscription.count({ where: { planId: id } });
    if (subCount > 0) {
      await db.plan.update({ where: { id }, data: { isActive: false } });
      return ok({ softDisabled: true, subscriptionCount: subCount });
    }
    await db.plan.delete({ where: { id } });
    await db.auditLog.create({
      data: { userId: admin.id, action: "PLAN_DELETED", target: `Plan:${id}`, meta: {} },
    }).catch(() => {});
    return ok({ deleted: true });
  } catch (e: any) {
    if (e?.code === "P2025") return fail("Plan not found", 404, "NOT_FOUND");
    return handleError(e);
  }
}
