import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  /** Target user — pass at least one identifier */
  userEmail: z.string().email().optional(),
  userPhone: z.string().min(8).optional(),
  userId: z.string().min(1).optional(),
  /** Target test set slug to unlock */
  testSetSlug: z.string().min(1),
}).refine(b => b.userEmail || b.userPhone || b.userId, { message: "user identifier required" });

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = bodySchema.parse(await req.json());

    const user = await db.user.findFirst({
      where: {
        OR: [
          body.userId ? { id: body.userId } : undefined,
          body.userEmail ? { email: body.userEmail } : undefined,
          body.userPhone ? { phone: body.userPhone } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (!user) return fail("User not found", 404, "USER_NOT_FOUND");

    const testSet = await db.testSet.findUnique({ where: { slug: body.testSetSlug } });
    if (!testSet) return fail("Test set not found", 404, "TEST_NOT_FOUND");
    if (!testSet.isPremium) return fail("Test set is already free", 400, "ALREADY_FREE");

    const unlock = await db.unlock.upsert({
      where: { userId_testSetId: { userId: user.id, testSetId: testSet.id } },
      create: { userId: user.id, testSetId: testSet.id },
      update: {},
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_GRANT_UNLOCK",
        target: `Unlock:${unlock.id}`,
        meta: {
          targetUserId: user.id,
          targetUserEmail: user.email,
          testSetSlug: testSet.slug,
          testSetTitle: testSet.title,
        },
      },
    }).catch(() => {}); // audit best-effort

    return ok({
      unlockId: unlock.id,
      userId: user.id,
      testSetSlug: testSet.slug,
      testSetTitle: testSet.title,
      unlockedAt: unlock.unlockedAt.toISOString(),
    });
  } catch (e) {
    return handleError(e);
  }
}
