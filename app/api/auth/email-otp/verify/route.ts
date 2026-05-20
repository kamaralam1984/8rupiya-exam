import { z } from "zod";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().optional(),
  code: z.string().regex(/^\d{6}$/, "6 digit code expected"),
  purpose: z.enum(["VERIFY", "RESET"]).default("VERIFY"),
});

const REASON_MSG: Record<string, string> = {
  NOT_FOUND: "No active code — request a new one.",
  EXPIRED: "Code expired. Request a new one.",
  USED: "Code already used.",
  TOO_MANY_ATTEMPTS: "Too many wrong attempts. Request a fresh code.",
  WRONG_CODE: "Wrong code, try again.",
};

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const rl = await rateLimit(`otp:verify:${clientKey(req.headers)}`, 20, 600);
    if (!rl.ok) return fail("Too many attempts, try in a minute.", 429, "RATE_LIMITED");

    let email = body.email?.toLowerCase();
    let userId: string | undefined;

    if (body.purpose === "VERIFY") {
      const session = await readSession();
      if (!session) return fail("Sign in first", 401, "UNAUTHENTICATED");
      const user = await db.user.findUnique({ where: { id: session.sub } });
      if (!user?.email) return fail("Only email accounts can verify", 400);
      email = user.email.toLowerCase();
      userId = user.id;
    } else if (!email) {
      return fail("Email required", 400);
    }

    const result = await verifyOtp({ email: email!, code: body.code, purpose: body.purpose });
    if (!result.ok) {
      return fail(REASON_MSG[result.reason] ?? "Verification failed", 400, result.reason);
    }

    if (body.purpose === "VERIFY") {
      await db.user.update({
        where: { id: userId! },
        data: { emailVerifiedAt: new Date() },
      });
      return ok({ verified: true });
    }

    // RESET — return a short-lived signed ticket the client can pass to /reset
    // (reuse the existing PasswordResetToken table so the rest of the flow is unchanged).
    const user = await db.user.findFirst({ where: { email } });
    if (!user) return fail("User not found", 404);
    const crypto = await import("node:crypto");
    const ticket = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(ticket).digest("hex");
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });
    return ok({ verified: true, ticket });
  } catch (e) {
    return handleError(e);
  }
}
