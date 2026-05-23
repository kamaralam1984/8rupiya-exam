import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  score: z.number().int().min(0).max(2000),
  opponentScore: z.number().int().min(0).max(2000),
  exam: z.string().min(1).max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const won = body.score > body.opponentScore;
    const tied = body.score === body.opponentScore;
    const xpDelta = won ? 50 : tied ? 20 : 10;
    await db.user.update({
      where: { id: user.id },
      data: { xp: { increment: xpDelta }, lastSeenAt: new Date() },
    });
    return ok({ xpDelta, result: won ? "won" : tied ? "tied" : "lost" });
  } catch (e) {
    return handleError(e);
  }
}
