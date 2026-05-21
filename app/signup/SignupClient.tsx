"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, MailCheck, User, Phone, Calendar, GraduationCap, KeyRound, RefreshCw, ShieldCheck, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

const RESEND_COOLDOWN = 30;

type ExamOption = { slug: string; name: string };

export function SignupClient({ exams }: { exams: ExamOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const ref = params.get("ref") ?? undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPw, setShowPw] = useState(false);

  // Step 1 form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<string>("");
  const [examSlug, setExamSlug] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 OTP
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function submitStep1(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const r = await api("/api/auth/signup/start", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\s+/g, ""),
        age: Number(age),
        examSlug,
        password,
        ref,
      }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast("OTP sent to your email", "success");
      setStep(2);
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } else {
      toast(r.error.message ?? "Signup failed", "error");
    }
  }

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const n = d.slice();
      n[i] = c;
      return n;
    });
    if (c && i < 5) inputs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const n = Array(6).fill("");
    for (let i = 0; i < text.length; i++) n[i] = text[i];
    setDigits(n);
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "Enter") submitStep2();
  }

  async function submitStep2() {
    const code = digits.join("");
    if (code.length !== 6) {
      toast("Pura 6-digit code daalein", "error");
      return;
    }
    setSubmitting(true);
    const r = await api("/api/auth/signup/verify", {
      method: "POST",
      body: JSON.stringify({ email: email.toLowerCase(), code }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast("Account created — welcome!", "success");
      router.replace("/home");
      router.refresh();
    } else {
      toast(r.error.message ?? "Verification failed", "error");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setSubmitting(true);
    // Re-fire the start endpoint — Redis pending entry still valid for 10 min
    const r = await api("/api/auth/signup/start", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\s+/g, ""),
        age: Number(age),
        examSlug,
        password,
        ref,
      }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast("New code sent", "success");
      setCooldown(RESEND_COOLDOWN);
    } else {
      toast(r.error.message ?? "Resend failed", "error");
    }
  }

  if (step === 2) {
    return (
      <div className="paper-card p-7">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{email}</span> pe 6-digit code bheja hai. Niche daalein.
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
          onClick={submitStep2}
          disabled={submitting || digits.join("").length !== 6}
          className="mt-6 w-full"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Verify & create account
        </Button>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Edit details
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || submitting}
            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-card p-7">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Already registered? <Link href="/signin" className="text-brand-600 hover:underline">Sign in</Link>
      </p>

      <form onSubmit={submitStep1} className="mt-5 space-y-3.5">
        <Field label="Student Name" icon={User}>
          <Input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Full name" required minLength={2} maxLength={80}
          />
        </Field>

        <Field label="Exam preparing for" icon={GraduationCap}>
          <select
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
            required
            className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">— Select your exam —</option>
            {exams.map((x) => (
              <option key={x.slug} value={x.slug}>{x.name}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Age" icon={Calendar}>
            <Input
              type="number" min={8} max={100}
              value={age} onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 18" required
            />
          </Field>
          <Field label="Phone Number" icon={Phone}>
            <Input
              type="tel"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98xxxxxxxx" required
              pattern="^\+?\d{10,14}$"
            />
          </Field>
        </div>

        <Field label="Email ID" icon={MailCheck}>
          <Input
            type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            autoComplete="email"
          />
        </Field>

        <Field label="Password" icon={KeyRound}>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" required minLength={8} maxLength={120}
              autoComplete="new-password" className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPw ? "Hide" : "Show"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
          Send OTP to email
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-brand-600">Terms</Link> and{" "}
          <Link href="/privacy" className="text-brand-600">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}

function Field({
  label, icon: Icon, children,
}: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
