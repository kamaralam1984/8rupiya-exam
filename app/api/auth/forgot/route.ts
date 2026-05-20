import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { SITE } from "@/lib/utils";
import { z } from "zod";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?\d{10,14}$/).optional(),
}).refine((d) => d.email || d.phone, { message: "Provide email or phone" });

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`forgot:${clientKey(req.headers)}`, 5, 3600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");

    const body = schema.parse(await req.json());
    const user = await db.user.findFirst({
      where: { OR: [{ email: body.email ?? undefined }, { phone: body.phone ?? undefined }] },
    });

    // Always return ok to prevent account enumeration
    if (!user) return ok({ sent: true });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const link = `${SITE.url}/reset-password?token=${token}`;

    // TODO: email/SMS the link. For dev, log to server.
    console.log(`[forgot] Reset link for ${user.email ?? user.phone}: ${link}`);

    return ok({ sent: true, devLink: process.env.NODE_ENV === "production" ? undefined : link });
  } catch (e) {
    return handleError(e);
  }
}
