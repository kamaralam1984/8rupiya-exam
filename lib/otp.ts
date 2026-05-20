import crypto from "node:crypto";
import { db } from "./db";
import { generateOtpCode, sendOtpEmail } from "./email";

export const OTP_TTL_MIN = 10;
export const OTP_MAX_ATTEMPTS = 5;

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Create a fresh OTP, invalidate previous ones for the same email+purpose,
 * and send via Resend. Returns the OTP id so callers can correlate logs.
 */
export async function issueOtp(opts: {
  email: string;
  purpose: "VERIFY" | "RESET";
  userId?: string | null;
}) {
  const email = opts.email.toLowerCase().trim();
  const code = generateOtpCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  // Invalidate any prior pending OTPs of the same purpose for this email.
  await db.emailOtp.updateMany({
    where: { email, purpose: opts.purpose, usedAt: null },
    data: { usedAt: new Date() },
  });

  const row = await db.emailOtp.create({
    data: {
      email,
      userId: opts.userId ?? null,
      codeHash,
      purpose: opts.purpose,
      expiresAt,
    },
    select: { id: true },
  });

  const sent = await sendOtpEmail({
    to: email,
    code,
    purpose: opts.purpose,
    minutes: OTP_TTL_MIN,
  });

  // In dev (no RESEND_API_KEY) the code is logged to console — useful for testing.
  if (!process.env.RESEND_API_KEY) {
    console.log(`[otp:DEV] ${opts.purpose} code for ${email}: ${code}`);
  }

  return { id: row.id, sent };
}

export type VerifyResult =
  | { ok: true; userId: string | null; email: string; otpId: string }
  | { ok: false; reason: "NOT_FOUND" | "EXPIRED" | "USED" | "TOO_MANY_ATTEMPTS" | "WRONG_CODE" };

/**
 * Look up the latest pending OTP for email+purpose and compare. Increments
 * attempts on every wrong guess; marks the row used on success.
 */
export async function verifyOtp(opts: {
  email: string;
  code: string;
  purpose: "VERIFY" | "RESET";
}): Promise<VerifyResult> {
  const email = opts.email.toLowerCase().trim();
  const codeHash = hashCode(opts.code);

  const row = await db.emailOtp.findFirst({
    where: { email, purpose: opts.purpose, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false, reason: "NOT_FOUND" };
  if (row.usedAt) return { ok: false, reason: "USED" };
  if (row.expiresAt < new Date()) return { ok: false, reason: "EXPIRED" };
  if (row.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "TOO_MANY_ATTEMPTS" };

  if (row.codeHash !== codeHash) {
    await db.emailOtp.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "WRONG_CODE" };
  }

  await db.emailOtp.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return { ok: true, userId: row.userId, email, otpId: row.id };
}
