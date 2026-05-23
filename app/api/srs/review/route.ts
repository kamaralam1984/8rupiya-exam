import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { newCard, review, type SrsState } from "@/lib/srs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  questionId: z.string().min(1),
  grade: z.number().int().min(0).max(3),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const existing = await db.bookmark.findFirst({
      where: { userId: user.id, kind: "srs", label: body.questionId },
    });

    const prev = (existing?.payload as unknown as SrsState | undefined) ?? newCard(body.questionId);
    const next = review(prev, body.grade as 0 | 1 | 2 | 3);

    if (existing) {
      await db.bookmark.update({
        where: { id: existing.id },
        data: { payload: next as any },
      });
    } else {
      await db.bookmark.create({
        data: {
          userId: user.id,
          kind: "srs",
          label: body.questionId,
          payload: next as any,
        },
      });
    }

    return ok({ state: next });
  } catch (e) {
    return handleError(e);
  }
}
