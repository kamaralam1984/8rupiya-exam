import { redis } from "./redis";
import type { SignupStartInput } from "./validators";

/**
 * Pending signups live in Redis until the user proves they control the email
 * via OTP. Account row in Postgres is only created on /api/auth/signup/verify.
 * Key TTL matches the OTP TTL (10 min) — if the user takes too long, they
 * have to start over.
 */

const PREFIX = "signup:pending:";
const TTL_SEC = 10 * 60;

export type PendingSignup = Omit<SignupStartInput, "password"> & {
  passwordHash: string;
};

function keyFor(email: string) {
  return PREFIX + email.toLowerCase().trim();
}

export async function setPendingSignup(email: string, data: PendingSignup) {
  await redis.setex(keyFor(email), TTL_SEC, JSON.stringify(data));
}

export async function getPendingSignup(email: string): Promise<PendingSignup | null> {
  const raw = await redis.get(keyFor(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}

export async function clearPendingSignup(email: string) {
  await redis.del(keyFor(email));
}
