import { requireUser, clearSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  language: z.enum(["en", "hi"]).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return ok({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      xp: user.xp,
      streak: user.streak,
      language: user.language,
      examTrack: user.examTrack ?? null,
      onboardedAt: user.onboardedAt ? user.onboardedAt.toISOString() : null,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = patchSchema.parse(await req.json());
    const updated = await db.user.update({
      where: { id: user.id },
      data: { name: body.name, language: body.language },
    });
    return ok({ id: updated.id, name: updated.name, language: updated.language });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return ok({ loggedOut: true });
}
