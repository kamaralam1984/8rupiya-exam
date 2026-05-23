import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { sendPushToAll, sendPushTo } from "@/lib/push-send";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(2).max(80),
  body: z.string().min(2).max(300),
  url: z.string().max(500).optional(),
  tag: z.string().max(40).optional(),
  audience: z.enum(["all", "users"]).default("all"),
  userIds: z.array(z.string().min(1)).max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    try {
      const result =
        body.audience === "users"
          ? await sendPushTo({ title: body.title, body: body.body, url: body.url, tag: body.tag }, body.userIds ?? [])
          : await sendPushToAll({ title: body.title, body: body.body, url: body.url, tag: body.tag });
      return ok(result);
    } catch (e: any) {
      if (e?.message === "VAPID_KEYS_MISSING") {
        return fail("Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in env before broadcasting.", 503, "VAPID_MISSING");
      }
      throw e;
    }
  } catch (e) {
    return handleError(e);
  }
}
