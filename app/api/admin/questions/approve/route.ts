import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  ids: z.array(z.string()).min(1),
  approved: z.boolean(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    const res = await db.question.updateMany({
      where: { id: { in: body.ids } },
      data: { approved: body.approved },
    });
    return ok({ updated: res.count });
  } catch (e) {
    return handleError(e);
  }
}
