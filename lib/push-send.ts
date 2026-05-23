import webpush from "web-push";
import { db } from "./db";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@8rupiya.in";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export type SendResult = { sent: number; failed: number; pruned: number };

export async function sendPushToAll(payload: PushPayload): Promise<SendResult> {
  return sendPushTo(payload, undefined);
}

export async function sendPushTo(
  payload: PushPayload,
  userIds: string[] | undefined,
): Promise<SendResult> {
  if (!ensureConfigured()) throw new Error("VAPID_KEYS_MISSING");
  const subs = await db.pushSubscription.findMany({
    where: userIds ? { userId: { in: userIds } } : undefined,
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  let sent = 0, failed = 0;
  const toPrune: string[] = [];
  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 60 * 60 * 24 },
        );
        sent += 1;
      } catch (e: any) {
        failed += 1;
        const status = e?.statusCode;
        if (status === 404 || status === 410) toPrune.push(s.id);
      }
    }),
  );
  if (toPrune.length > 0) {
    await db.pushSubscription.deleteMany({ where: { id: { in: toPrune } } });
  }
  return { sent, failed, pruned: toPrune.length };
}
