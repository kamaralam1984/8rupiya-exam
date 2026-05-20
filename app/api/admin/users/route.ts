import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional(),
  name: z.string().min(1).max(80).optional(),
  password: z.string().min(8).max(120),
  role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
  language: z.enum(["en", "hi"]).default("en"),
}).refine((b) => !!(b.email || b.phone), { message: "email or phone required" });

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const users = await db.user.findMany({
      where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { name: { contains: q, mode: "insensitive" } }] } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, email: true, phone: true, name: true, role: true,
        xp: true, streak: true, createdAt: true, language: true,
        emailVerifiedAt: true, examTrack: true, onboardedAt: true,
        subscriptions: {
          where: { active: true, endsAt: { gt: new Date() } },
          orderBy: { endsAt: "desc" },
          take: 1,
          select: { id: true, plan: true, startsAt: true, endsAt: true },
        },
      },
    });
    const shaped = users.map((u) => {
      const { subscriptions, ...rest } = u;
      return { ...rest, subscription: subscriptions[0] ?? null };
    });
    return ok(shaped);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = createSchema.parse(await req.json());
    const passwordHash = await hashPassword(body.password);

    const created = await db.user.create({
      data: {
        email: body.email ?? null,
        phone: body.phone ?? null,
        name: body.name ?? null,
        role: body.role,
        language: body.language,
        passwordHash,
      },
      select: { id: true, email: true, phone: true, name: true, role: true, language: true, createdAt: true },
    });

    await db.auditLog.create({
      data: { userId: admin.id, action: "USER_CREATED", target: `User:${created.id}`, meta: { email: body.email, phone: body.phone, role: body.role } },
    }).catch(() => {});

    return ok(created);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return fail("Email or phone already in use", 409, "DUPLICATE");
    }
    return handleError(e);
  }
}
