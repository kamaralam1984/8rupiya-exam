import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

function generateCode(len = 7): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function GET() {
  try {
    const user = await requireUser();
    let code = user.referralCode;
    if (!code) {
      for (let i = 0; i < 5; i++) {
        const candidate = generateCode();
        const taken = await db.user.findUnique({ where: { referralCode: candidate } });
        if (!taken) { code = candidate; break; }
      }
      await db.user.update({ where: { id: user.id }, data: { referralCode: code } });
    }
    const count = await db.user.count({ where: { referredById: user.id } });
    return ok({
      code,
      link: `${SITE.url}/signup?ref=${code}`,
      referredCount: count,
      bonusPerSignup: 500, // paise
    });
  } catch (e) {
    return handleError(e);
  }
}
