import { Resend } from "resend";
import { SITE } from "./utils";

/**
 * Minimal email sender — primary driver is Resend (RESEND_API_KEY).
 * SMTP fallback is intentionally not wired here to keep the dependency surface tiny;
 * if Resend is unset and you need SMTP, add nodemailer later.
 */

const FROM = process.env.EMAIL_FROM || `${SITE.name} <onboarding@resend.dev>`;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  const c = client();
  if (!c) {
    // Dev mode without Resend — log so the OTP can still be tested.
    console.log(`[email:DEV] to=${opts.to}  subject=${opts.subject}\n${opts.text ?? opts.html}`);
    return { ok: true };
  }
  try {
    const r = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (r.error) return { ok: false, error: r.error.message };
    return { ok: true, id: r.data?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Email send failed" };
  }
}

/** Inline-styled OTP template — works in every email client (Gmail, Outlook, etc.). */
function otpHtml(opts: { code: string; purposeLabel: string; minutes: number }) {
  const { code, purposeLabel, minutes } = opts;
  return `
<!doctype html>
<html><body style="margin:0;background:#f6f8fb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
    <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#6366f1;font-weight:700;">${SITE.name}</div>
    <h1 style="margin:8px 0 12px;font-size:22px;color:#0f172a;">${purposeLabel}</h1>
    <p style="font-size:14px;line-height:1.55;color:#475569;margin:0 0 22px;">
      Apna code neeche dekho. Yeh ${minutes} minute mein expire ho jayega.
    </p>
    <div style="text-align:center;background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;padding:22px;margin:0 0 22px;">
      <div style="font-size:13px;color:#4f46e5;font-weight:600;margin-bottom:8px;">Your verification code</div>
      <div style="font-size:38px;letter-spacing:14px;font-weight:800;color:#1e1b4b;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">${code}</div>
    </div>
    <p style="font-size:13px;color:#64748b;line-height:1.55;margin:0;">
      Agar aap ne yeh request nahin kiya, is email ko ignore kar dein. Koi action nahin lena.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;margin:0;">
      © ${new Date().getFullYear()} ${SITE.name} · ${SITE.domain}
    </p>
  </div>
</body></html>`;
}

export type OtpPurpose = "VERIFY" | "RESET";

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  purpose: OtpPurpose;
  minutes: number;
}): Promise<SendResult> {
  const purposeLabel =
    opts.purpose === "RESET" ? "Reset your password" : "Verify your email";
  const subject =
    opts.purpose === "RESET"
      ? `${SITE.name} password reset code: ${opts.code}`
      : `${SITE.name} email verification code: ${opts.code}`;
  const html = otpHtml({ code: opts.code, purposeLabel, minutes: opts.minutes });
  const text = `${purposeLabel}\n\nYour code: ${opts.code}\nExpires in ${opts.minutes} minutes.\n\nAgar aap ne request nahin kiya to ignore karein.`;
  return sendEmail({ to: opts.to, subject, html, text });
}

/** Crypto-strong 6-digit numeric code (no leading-zero confusion). */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("node:crypto").webcrypto.getRandomValues(buf);
  const n = buf[0] % 1000000;
  return n.toString().padStart(6, "0");
}
