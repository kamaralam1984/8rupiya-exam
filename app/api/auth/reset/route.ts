import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(120),
});

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const tokenHash = sha256(body.token);
    const row = await db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return fail("Invalid or expired token", 400, "BAD_TOKEN");
    }
    const hash = await hashPassword(body.password);
    await db.$transaction([
      db.user.update({ where: { id: row.userId }, data: { passwordHash: hash } }),
      db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);
    return ok({ reset: true });
  } catch (e) {
    return handleError(e);
  }
}
