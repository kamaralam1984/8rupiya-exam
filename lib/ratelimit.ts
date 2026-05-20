import { redis } from "./redis";

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ ok: boolean; remaining: number; resetIn: number }> {
  const k = `rl:${key}`;
  const tx = redis.multi();
  tx.incr(k);
  tx.ttl(k);
  const [countRaw, ttlRaw] = (await tx.exec()) ?? [];
  const count = Number(countRaw?.[1] ?? 1);
  let ttl = Number(ttlRaw?.[1] ?? -1);
  if (ttl < 0) {
    await redis.expire(k, windowSec);
    ttl = windowSec;
  }
  return { ok: count <= limit, remaining: Math.max(0, limit - count), resetIn: ttl };
}

export function clientKey(headers: Headers, userId?: string | null) {
  if (userId) return `u:${userId}`;
  const fwd = headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || headers.get("x-real-ip") || "anon";
  return `ip:${ip}`;
}

/**
 * Per-user rate limit that automatically bypasses for paid roles (ADMIN, PREMIUM, FAMILY).
 * Pass any object with `{ id, role }` — typically the result of `requireUser()`.
 */
export async function rateLimitUser(
  user: { id: string; role: "FREE" | "PREMIUM" | "FAMILY" | "ADMIN" },
  key: string,
  limit: number,
  windowSec: number,
) {
  if (user.role === "ADMIN" || user.role === "PREMIUM" || user.role === "FAMILY") {
    return { ok: true, remaining: Number.POSITIVE_INFINITY, resetIn: 0 };
  }
  return rateLimit(`${key}:${user.id}`, limit, windowSec);
}
