import { db } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  role: z.enum(["FREE", "PREMIUM", "FAMILY", "ADMIN"]).optional(),
  xpAdjust: z.number().int().min(-1000000).max(1000000).optional(),
  name: z.string().min(1).max(80).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(8).max(20).nullable().optional(),
  language: z.enum(["en", "hi"]).optional(),
  examTrack: z.string().nullable().optional(),
  /** Reset password */
  password: z.string().min(8).max(120).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, phone: true, name: true, role: true,
        xp: true, streak: true, createdAt: true, language: true,
        examTrack: true, emailVerifiedAt: true, onboardedAt: true,
        _count: { select: { attempts: true, payments: true } },
      },
    });
    if (!user) return fail("User not found", 404, "NOT_FOUND");
    return ok(user);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    if (id === admin.id) {
      if (body.role && body.role !== "ADMIN") {
        return fail("Cannot change your own role", 400, "SELF_ROLE");
      }
      if (typeof body.xpAdjust === "number") {
        return fail("Cannot adjust your own XP", 400, "SELF_XP");
      }
    }

    const data: any = {};
    if (body.role) data.role = body.role;
    if (body.xpAdjust) data.xp = { increment: body.xpAdjust };
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.language) data.language = body.language;
    if (body.examTrack !== undefined) data.examTrack = body.examTrack || null;
    if (body.password) data.passwordHash = await hashPassword(body.password);

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, role: true, xp: true, name: true, email: true, phone: true, language: true, examTrack: true },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: body.password ? "USER_PASSWORD_RESET" : "USER_UPDATED",
        target: `User:${id}`,
        meta: { ...body, password: body.password ? "[redacted]" : undefined },
      },
    }).catch(() => {});

    return ok(updated);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return fail("Email or phone already in use by another account", 409, "DUPLICATE");
    }
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    if (id === admin.id) return fail("Cannot delete yourself", 400, "SELF_DELETE");
    const u = await db.user.findUnique({ where: { id }, select: { email: true, phone: true } });
    if (!u) return fail("User not found", 404, "NOT_FOUND");
    await db.user.delete({ where: { id } });
    await db.auditLog.create({
      data: { userId: admin.id, action: "USER_DELETED", target: `User:${id}`, meta: u },
    }).catch(() => {});
    return ok({ deleted: id });
  } catch (e) {
    return handleError(e);
  }
}
