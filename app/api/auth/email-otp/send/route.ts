import { z } from "zod";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { issueOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().optional(),
  purpose: z.enum(["VERIFY", "RESET"]).default("VERIFY"),
});

/**
 * Request an OTP code by email.
 *  · VERIFY  — auth required, sent to the user's email. Skips if already verified.
 *  · RESET   — public, body.email required. Silent success if email isn't registered
 *              (prevents enumeration).
 */
export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json().catch(() => ({})));
    const rl = await rateLimit(`otp:send:${clientKey(req.headers)}`, 8, 600);
    if (!rl.ok) return fail("Too many requests, try in a minute.", 429, "RATE_LIMITED");

    if (body.purpose === "RESET") {
      if (!body.email) return fail("Email required", 400);
      const user = await db.user.findFirst({ where: { email: body.email.toLowerCase() } });
      // Silent success when email is unknown — anti-enumeration
      if (!user) return ok({ sent: true });
      const issued = await issueOtp({ email: user.email!, purpose: "RESET", userId: user.id });
      if (!issued.sent.ok) {
        return fail("Could not send email right now. Please try again in a minute.", 502, "EMAIL_SEND_FAILED");
      }
      return ok({ sent: true });
    }

    // VERIFY purpose — caller must be signed in
    const session = await readSession();
    if (!session) return fail("Sign in first", 401, "UNAUTHENTICATED");
    const user = await db.user.findUnique({ where: { id: session.sub } });
    if (!user?.email) return fail("Only email accounts can verify", 400);
    if (user.emailVerifiedAt) return ok({ alreadyVerified: true });

    const issued = await issueOtp({ email: user.email, purpose: "VERIFY", userId: user.id });
    if (!issued.sent.ok) {
      return fail("Could not send email right now. Please try again in a minute.", 502, "EMAIL_SEND_FAILED");
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
