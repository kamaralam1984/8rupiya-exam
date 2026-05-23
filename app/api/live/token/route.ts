import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  roomName: z.string().min(1).max(60),
  role: z.enum(["host", "viewer"]).default("viewer"),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return fail(
        "Live streaming not configured on server. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, NEXT_PUBLIC_LIVEKIT_URL.",
        503,
        "LIVEKIT_MISSING",
      );
    }

    const body = schema.parse(await req.json());

    // Only admins can host; everyone can view (gating happens at the LiveClass row level via /api/admin/live).
    const isHost = body.role === "host";
    if (isHost && user.role !== "ADMIN") {
      return fail("Only admins can host.", 403, "FORBIDDEN");
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.name ?? user.email?.split("@")[0] ?? "Student",
      ttl: 60 * 60 * 2, // 2 hr
    });
    const grant: VideoGrant = {
      room: body.roomName,
      roomJoin: true,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: true,
    };
    at.addGrant(grant);
    const token = await at.toJwt();

    return ok({ token, wsUrl, identity: user.id, role: isHost ? "host" : "viewer" });
  } catch (e) {
    return handleError(e);
  }
}
