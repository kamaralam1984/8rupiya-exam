import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { TRACK_SLUGS } from "@/lib/track-config";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  examTrack: z.enum(TRACK_SLUGS),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { examTrack } = bodySchema.parse(await req.json());

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        examTrack,
        onboardedAt: user.onboardedAt ?? new Date(),
      },
      select: { id: true, examTrack: true, onboardedAt: true },
    });

    return ok({
      id: updated.id,
      examTrack: updated.examTrack,
      onboardedAt: updated.onboardedAt?.toISOString() ?? null,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await db.user.update({
      where: { id: user.id },
      data: { examTrack: null },
    });
    return ok({ cleared: true });
  } catch (e) {
    return handleError(e);
  }
}
