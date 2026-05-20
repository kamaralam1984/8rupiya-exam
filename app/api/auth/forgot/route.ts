import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { issueOtp } from "@/lib/otp";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

/**
 * Start a password reset by emailing the user a 6-digit OTP. Returns success
 * even when the email is unknown, so callers can't enumerate accounts.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`forgot:${clientKey(req.headers)}`, 5, 3600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");

    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    const user = await db.user.findFirst({ where: { email } });

    if (!user || !user.email) {
      // anti-enumeration — silently succeed
      return ok({ sent: true });
    }

    await issueOtp({ email: user.email, purpose: "RESET", userId: user.id });
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
