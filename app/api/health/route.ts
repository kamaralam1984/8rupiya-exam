import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    const pong = await redis.ping();
    return ok({ db: "ok", redis: pong === "PONG" ? "ok" : "degraded" });
  } catch (e: any) {
    return fail(e?.message ?? "unhealthy", 503, "UNHEALTHY");
  }
}
