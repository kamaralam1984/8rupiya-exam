import { db } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { signupVerifySchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { verifyOtp } from "@/lib/otp";
import { getPendingSignup, clearPendingSignup } from "@/lib/pending-signup";

export const dynamic = "force-dynamic";

const REASON_MSG: Record<string, string> = {
  NOT_FOUND: "Code not found — request a new one.",
  EXPIRED: "Code expired. Start signup again.",
  USED: "Code already used.",
  TOO_MANY_ATTEMPTS: "Too many wrong tries. Start signup again.",
  WRONG_CODE: "Wrong code, try again.",
};

/**
 * Step 2 — verify the OTP, materialise the user in Postgres, drop the pending
 * record from Redis, and sign the user in.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`signup-verify:${clientKey(req.headers)}`, 20, 600);
    if (!rl.ok) return fail("Too many attempts, try after 1 min", 429, "RATE_LIMITED");

    const body = signupVerifySchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const pending = await getPendingSignup(email);
    if (!pending) {
      return fail(
        "Signup session expired. Please fill the form again.",
        400,
        "NO_PENDING",
      );
    }

    const result = await verifyOtp({ email, code: body.code, purpose: "VERIFY" });
    if (!result.ok) {
      return fail(REASON_MSG[result.reason] ?? "Verification failed", 400, result.reason);
    }

    // Resolve referrer if present
    let referredById: string | undefined;
    if (pending.ref) {
      const referrer = await db.user.findUnique({
        where: { referralCode: pending.ref },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    // Create user with examTrack already set (skips onboarding)
    const user = await db.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        passwordHash: pending.passwordHash,
        language: pending.language,
        examTrack: pending.examSlug,
        // Email already verified through this very flow
        emailVerifiedAt: new Date(),
        // Stash age in a JSON-ish meta field via name workaround — Prisma User
        // doesn't have a dedicated age column yet, so we put it in the audit log
        // instead (see below). Avoid blocking signup over schema-only details.
        referredById,
        onboardedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_SIGNUP",
        target: `User:${user.id}`,
        meta: { age: pending.age, examSlug: pending.examSlug, via: "email-otp" },
      },
    }).catch(() => {});

    await clearPendingSignup(email);

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);

    return ok({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      examTrack: user.examTrack,
      verified: true,
    });
  } catch (e) {
    return handleError(e);
  }
}
