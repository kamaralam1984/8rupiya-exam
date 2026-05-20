import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  // Ordered list of PDF ids — index in the array becomes the new sortOrder
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { ids } = bodySchema.parse(await req.json());

    await db.$transaction(
      ids.map((id, idx) =>
        db.pdf.update({ where: { id }, data: { sortOrder: idx } }),
      ),
    );

    return ok({ count: ids.length });
  } catch (e) {
    return handleError(e);
  }
}
