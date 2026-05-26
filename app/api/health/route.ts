import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (apiKey !== undefined && apiKey !== null) {
    if (apiKey !== process.env.KVL_API_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ status: "ok", site: "8rupiya.in" });
  }

  try {
    await db.$queryRaw`SELECT 1`;
    const pong = await redis.ping();
    return ok({ db: "ok", redis: pong === "PONG" ? "ok" : "degraded" });
  } catch (e: any) {
    return fail(e?.message ?? "unhealthy", 503, "UNHEALTHY");
  }
}
