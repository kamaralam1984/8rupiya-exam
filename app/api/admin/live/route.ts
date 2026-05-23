import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SETTING_KEY = "live_classes";

const liveClassSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(200),
  teacher: z.string().min(1).max(120),
  examSlug: z.string().min(1).max(40),
  status: z.enum(["scheduled", "live", "ended"]),
  startsAt: z.string(),
  durationMin: z.number().int().min(5).max(600),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  paid: z.boolean().default(false),
});
export type LiveClass = z.infer<typeof liveClassSchema>;

const payloadSchema = z.object({ classes: z.array(liveClassSchema).max(50) });

async function readClasses(): Promise<LiveClass[]> {
  const row = await db.platformSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row) return [];
  try {
    const arr = JSON.parse(row.value);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch { return []; }
}

export async function GET() {
  try {
    await requireAdmin();
    return ok({ classes: await readClasses() });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = payloadSchema.parse(await req.json());
    await db.platformSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(body.classes) },
      create: { key: SETTING_KEY, value: JSON.stringify(body.classes) },
    });
    return ok({ saved: body.classes.length });
  } catch (e) {
    return handleError(e);
  }
}
