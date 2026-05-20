"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { useUser } from "@/lib/use-user";

const RESEND_COOLDOWN = 30; // seconds

export function VerifyEmailClient() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading } = useUser();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Cooldown ticker for the Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // If the user lands here already verified, take them home.
  useEffect(() => {
    if (!loading && user && (user as any).emailVerifiedAt) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  function setDigit(i: number, v: string) {
    const cleaned = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const next = d.slice();
      next[i] = cleaned;
      return next;
    });
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") submit();
  }

  async function submit() {
    const code = digits.join("");
    if (code.length !== 6) {
      toast("Pura 6-digit code daalein", "error");
      return;
    }
    setSubmitting(true);
    const r = await api("/api/auth/email-otp/verify", {
      method: "POST",
      body: JSON.stringify({ code, purpose: "VERIFY" }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast("Email verified ✓", "success");
      router.replace("/home");
    } else {
      toast(r.error.message ?? "Verification failed", "error");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setResending(true);
    const r = await api("/api/auth/email-otp/send", {
      method: "POST",
      body: JSON.stringify({ purpose: "VERIFY" }),
    });
    setResending(false);
    if (r.ok) {
      toast("Naya code bhej diya gaya", "success");
      setCooldown(RESEND_COOLDOWN);
    } else {
      toast(r.error.message ?? "Could not resend", "error");
    }
  }

  return (
    <section className="container py-16 max-w-md">
      <div className="paper-card p-7">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hamne aapke email <span className="font-semibold text-foreground">{user?.email ?? "…"}</span>{" "}
          pe 6-digit code bheja hai. Niche daalein.
        </p>

        <div className="mt-6 grid grid-cols-6 gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              onPaste={handlePaste}
              className="h-14 text-center text-2xl font-semibold rounded-xl border border-border bg-card focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
            />
          ))}
        </div>

        <Button
          onClick={submit}
          disabled={submitting || digits.join("").length !== 6}
          className="mt-6 w-full"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Verify code
        </Button>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Code nahin mila?</span>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || resending}
            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Galat email tha? <Link href="/settings" className="text-brand-600 hover:underline">Settings se update karein</Link>.
        </p>
      </div>
    </section>
  );
}
