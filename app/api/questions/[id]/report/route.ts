import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  reason: z.enum(["WRONG_ANSWER", "BAD_OPTIONS", "TYPO", "OFFENSIVE", "OTHER"]),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`report:${user.id}`, 30, 3600);
    if (!rl.ok) return fail("Too many reports", 429, "RATE_LIMITED");
    const { id } = await ctx.params;
    const body = schema.parse(await req.json());
    const q = await db.question.findUnique({ where: { id } });
    if (!q) return fail("Question not found", 404, "NOT_FOUND");
    const row = await db.questionReport.create({
      data: { questionId: id, userId: user.id, reason: body.reason, note: body.note },
    });
    return ok({ id: row.id });
  } catch (e) {
    return handleError(e);
  }
}
