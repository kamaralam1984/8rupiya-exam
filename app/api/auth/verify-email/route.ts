import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { SITE } from "@/lib/utils";
import crypto from "node:crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// Request a verification email
export async function POST() {
  try {
    const user = await requireUser();
    if (!user.email) return fail("Only email accounts can verify", 400);
    if (user.emailVerifiedAt) return ok({ alreadyVerified: true });
    const rl = await rateLimit(`verify:${user.id}`, 3, 3600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    await db.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) },
    });
    const link = `${SITE.url}/verify-email?token=${token}`;
    console.log(`[verify-email] Link for ${user.email}: ${link}`);
    return ok({ sent: true, devLink: process.env.NODE_ENV === "production" ? undefined : link });
  } catch (e) {
    return handleError(e);
  }
}

// Confirm a token
const schema = z.object({ token: z.string().min(20) });
export async function PUT(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const row = await db.emailVerificationToken.findUnique({ where: { tokenHash: sha256(body.token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) return fail("Invalid or expired token", 400, "BAD_TOKEN");
    await db.$transaction([
      db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }),
      db.emailVerificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);
    return ok({ verified: true });
  } catch (e) {
    return handleError(e);
  }
}
