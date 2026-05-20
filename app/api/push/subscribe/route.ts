import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const row = await db.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: { userId: user.id, endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth },
      update: { userId: user.id, p256dh: body.keys.p256dh, auth: body.keys.auth },
    });
    return ok({ id: row.id });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireUser();
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    if (endpoint) await db.pushSubscription.deleteMany({ where: { endpoint } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
