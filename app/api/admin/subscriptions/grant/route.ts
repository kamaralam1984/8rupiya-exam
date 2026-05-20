import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { grantSubscription, revokeSubscription } from "@/lib/access";
import { z } from "zod";

export const dynamic = "force-dynamic";

const grantSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["MONTH", "YEAR", "LIFETIME"]).optional(),
  reason: z.string().max(200).optional(),
});

const revokeSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = grantSchema.parse(await req.json());
    const u = await db.user.findUnique({ where: { id: body.userId }, select: { id: true } });
    if (!u) return fail("User not found", 404, "NOT_FOUND");
    const sub = await grantSubscription({ userId: body.userId, plan: body.plan, reason: body.reason });
    await db.auditLog.create({
      data: { userId: admin.id, action: "SUBSCRIPTION_GRANTED", target: `User:${body.userId}`, meta: { plan: sub.plan, endsAt: sub.endsAt, reason: body.reason } },
    }).catch(() => {});
    return ok(sub);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = revokeSchema.parse(await req.json());
    const r = await revokeSubscription(body.userId);
    await db.auditLog.create({
      data: { userId: admin.id, action: "SUBSCRIPTION_REVOKED", target: `User:${body.userId}`, meta: { count: r.count } },
    }).catch(() => {});
    return ok({ revoked: r.count });
  } catch (e) {
    return handleError(e);
  }
}
