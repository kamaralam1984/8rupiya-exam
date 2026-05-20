import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { ensureSeededFlags, listFlags } from "@/lib/feature-flags";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean().optional(),
  requiresPaid: z.boolean().optional(),
  label: z.string().min(1).max(80).optional(),
  description: z.string().max(400).nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    await ensureSeededFlags();
    const flags = await listFlags();
    return ok(flags);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = patchSchema.parse(await req.json());
    const data: Record<string, unknown> = {};
    if (typeof body.enabled === "boolean") data.enabled = body.enabled;
    if (typeof body.requiresPaid === "boolean") data.requiresPaid = body.requiresPaid;
    if (body.label !== undefined) data.label = body.label;
    if (body.description !== undefined) data.description = body.description;

    const updated = await db.featureFlag.update({
      where: { key: body.key },
      data,
    });
    await db.auditLog.create({
      data: { userId: admin.id, action: "FEATURE_FLAG_UPDATED", target: body.key, meta: body },
    }).catch(() => {});
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
