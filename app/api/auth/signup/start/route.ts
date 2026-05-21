import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signupStartSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { issueOtp } from "@/lib/otp";
import { setPendingSignup } from "@/lib/pending-signup";

export const dynamic = "force-dynamic";

/**
 * Step 1 of email-OTP gated signup.
 *
 * Validates the full form (name, email, phone, age, examSlug, password),
 * pre-hashes the password, stores the pending record in Redis, and emails a
 * 6-digit OTP. The user record in Postgres is only created on /verify.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`signup-start:${clientKey(req.headers)}`, 10, 600);
    if (!rl.ok) return fail("Too many attempts, try after 1 min", 429, "RATE_LIMITED");

    const body = signupStartSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const phone = body.phone.replace(/\s+/g, "");

    // Reject if email/phone already belongs to a real account
    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { id: true, email: true, phone: true },
    });
    if (existing) {
      return fail(
        existing.email === email ? "Email already registered" : "Phone already registered",
        409,
        "DUPLICATE",
      );
    }

    // Validate exam exists (and is active for student-facing pages)
    const exam = await db.exam.findUnique({
      where: { slug: body.examSlug },
      select: { isActive: true },
    });
    if (!exam || !exam.isActive) {
      return fail("Selected exam not available", 400, "BAD_EXAM");
    }

    // Hash password once + park in Redis under email
    const passwordHash = await hashPassword(body.password);
    await setPendingSignup(email, {
      name: body.name.trim(),
      email,
      phone,
      age: body.age,
      examSlug: body.examSlug,
      language: body.language,
      ref: body.ref,
      passwordHash,
    });

    // Fire OTP — uses purpose=VERIFY so the verify endpoint can reuse the same
    // OTP code path. userId=null because the user doesn't exist yet.
    const issued = await issueOtp({ email, purpose: "VERIFY", userId: null });
    if (!issued.sent.ok) {
      return fail("Could not send verification code. Please check your email and try again.", 502, "EMAIL_SEND_FAILED");
    }

    return ok({ sent: true, email });
  } catch (e) {
    return handleError(e);
  }
}
