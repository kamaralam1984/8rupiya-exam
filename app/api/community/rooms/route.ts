import { db } from "@/lib/db";
import { readSession, requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SEED = [
  { slug: "neet-2026", name: "NEET 2026 — Bio Crew", examSlug: "neet", description: "Biology + general NEET discussion." },
  { slug: "jee-marathon", name: "JEE Mains Marathon", examSlug: "jee", description: "Daily problem solving + doubts." },
  { slug: "ssc-cgl", name: "SSC CGL Tier-1 Sprint", examSlug: "ssc", description: "Reasoning + GA + Math." },
  { slug: "ibps-po", name: "Banking IBPS Squad", examSlug: "banking", description: "Banking, RBI, IBPS." },
  { slug: "upsc-polity", name: "UPSC Polity Optional", examSlug: "upsc", description: "Polity, IR, Ethics, governance." },
  { slug: "cuet-2026", name: "CUET 2026 Hub", examSlug: "cuet", description: "Domain + language + GK." },
  { slug: "ctet-dec", name: "CTET December Cracker", examSlug: "ctet", description: "Pedagogy + CDP + EVS." },
  { slug: "boards-10", name: "Class 10 Boards — Maths", examSlug: "boards", description: "Algebra, geometry, trig." },
];

/** Idempotently ensure the seed rooms exist (first-time admins). */
async function ensureSeed() {
  const count = await db.chatRoom.count();
  if (count > 0) return;
  await db.chatRoom.createMany({
    data: SEED.map((s) => ({ ...s })),
    skipDuplicates: true,
  });
}

export async function GET() {
  try {
    await ensureSeed();
    const rooms = await db.chatRoom.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        examSlug: true,
        description: true,
        isPaid: true,
        _count: { select: { messages: true } },
      },
    });
    return ok({ rooms });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  name: z.string().min(3).max(80),
  examSlug: z.string().max(40).optional(),
  description: z.string().max(280).optional(),
});

/** Authenticated users can create a community room (rate-limited via existing limiter). */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "ADMIN") return fail("Only admins can create rooms for now.", 403, "FORBIDDEN");
    const body = createSchema.parse(await req.json());
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || `room-${Date.now()}`;
    const room = await db.chatRoom.create({
      data: { slug, name: body.name, examSlug: body.examSlug, description: body.description },
    });
    return ok({ room });
  } catch (e) {
    return handleError(e);
  }
}
