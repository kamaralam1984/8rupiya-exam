import { db } from "@/lib/db";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { issueOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`login:${clientKey(req.headers)}`, 20, 600);
    if (!rl.ok) return fail("Too many attempts", 429, "RATE_LIMITED");

    const body = loginSchema.parse(await req.json());
    const user = await db.user.findFirst({
      where: { OR: [{ email: body.email ?? undefined }, { phone: body.phone ?? undefined }] },
    });
    if (!user || !user.passwordHash) return fail("Invalid credentials", 401, "INVALID");
    const okPw = await verifyPassword(body.password, user.passwordHash);
    if (!okPw) return fail("Invalid credentials", 401, "INVALID");

    // Email-based accounts must verify before they can sign in.
    // Phone-based logins skip this gate (separate phone-OTP could be added later).
    // Admins are exempt so the platform can never lock itself out.
    if (user.email && !user.emailVerifiedAt && user.role !== "ADMIN") {
      // Fire-and-forget a fresh OTP so the user immediately gets a new code.
      issueOtp({ email: user.email, purpose: "VERIFY", userId: user.id }).catch(() => {});
      return fail(
        "Email verify nahin hai. Aapke email pe naya OTP bhej diya hai — /verify-email pe code daalein.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);
    return ok({ id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role });
  } catch (e) {
    return handleError(e);
  }
}
