import { db } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`reg:${clientKey(req.headers)}`, 10, 600);
    if (!rl.ok) return fail("Too many attempts", 429, "RATE_LIMITED");

    const body = registerSchema.parse(await req.json());
    const existing = await db.user.findFirst({
      where: { OR: [{ email: body.email ?? undefined }, { phone: body.phone ?? undefined }] },
    });
    if (existing) return fail("User already exists", 409, "DUPLICATE");

    let referredById: string | undefined;
    if (body.ref) {
      const referrer = await db.user.findUnique({ where: { referralCode: body.ref } });
      if (referrer) referredById = referrer.id;
    }
    const user = await db.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        language: body.language,
        referredById,
      },
    });

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);
    return ok({ id: user.id, email: user.email, phone: user.phone, name: user.name });
  } catch (e) {
    return handleError(e);
  }
}
