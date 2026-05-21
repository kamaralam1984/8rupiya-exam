import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "kebab-case lowercase").min(2).max(60),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  priceInPaise: z.number().int().min(0).max(10_000_000),
  durationDays: z.number().int().min(0).max(99999),
  targetRole: z.enum(["FREE", "PREMIUM", "FAMILY", "ADMIN"]).default("PREMIUM"),
  features: z.array(z.string().min(1).max(40)).default([]),
  isActive: z.boolean().default(true),
  isHighlighted: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    await requireAdmin();
    const plans = await db.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    });
    return ok(plans);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = createSchema.parse(await req.json());
    const created = await db.plan.create({ data: body });
    await db.auditLog.create({
      data: { userId: admin.id, action: "PLAN_CREATED", target: `Plan:${created.id}`, meta: body },
    }).catch(() => {});
    return ok(created);
  } catch (e: any) {
    if (e?.code === "P2002") return fail("Slug already in use", 409, "DUPLICATE");
    return handleError(e);
  }
}
