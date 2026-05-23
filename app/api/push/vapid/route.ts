import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return fail("Push notifications not configured on server.", 503, "VAPID_MISSING");
  }
  return ok({ publicKey: key });
}
