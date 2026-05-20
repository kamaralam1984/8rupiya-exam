import { db } from "@/lib/db";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";

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

    await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);
    return ok({ id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role });
  } catch (e) {
    return handleError(e);
  }
}
