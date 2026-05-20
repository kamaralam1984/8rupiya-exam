import { db } from "@/lib/db";
import { requireUser, clearSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ confirm: z.literal("DELETE"), password: z.string().optional() });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    if (user.passwordHash && body.password) {
      const okPw = await verifyPassword(body.password, user.passwordHash);
      if (!okPw) return fail("Password incorrect", 401, "INVALID");
    }
    await db.auditLog.create({
      data: { userId: null, action: "ACCOUNT_DELETED", target: user.id, meta: { email: user.email } },
    });
    await db.user.delete({ where: { id: user.id } });
    await clearSessionCookie();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
