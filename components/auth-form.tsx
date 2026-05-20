"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { Logo } from "@/components/logo";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next =
    mode === "signup"
      ? `/onboarding${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""}`
      : rawNext || "/home";
  const ref = params.get("ref") ?? undefined;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmedId = identifier.trim();
  const isEmail = trimmedId.includes("@");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const path = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "signin"
        ? isEmail
          ? { email: trimmedId, password }
          : { phone: trimmedId, password }
        : isEmail
          ? { email: trimmedId, password, name: name.trim(), ref }
          : { phone: trimmedId, password, name: name.trim(), ref };

    const r = await api(path, { method: "POST", body: JSON.stringify(payload) });
    setLoading(false);
    if (!r.ok) {
      setError(r.error.message ?? r.error.code);
      return;
    }
    window.location.assign(next);
  };

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-7 gradient-border space-y-4">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" href={null} />
        <h1 className="mt-3 font-display text-2xl font-bold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin"
            ? "Sign in to continue your prep."
            : "Free to join. ₹8 per premium mock test."}
        </p>
      </div>
      {mode === "signup" && (
        <div>
          <label className="text-xs text-muted-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
      )}
      <div>
        <label className="text-xs text-muted-foreground">Email or phone</label>
        <Input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com or 98xxxxxxxx"
          required
          autoComplete={mode === "signin" ? "username" : "email"}
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Password</label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
            title={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <div className="text-sm text-center text-muted-foreground space-y-1">
        {mode === "signin" ? (
          <>
            <p>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-brand-500 hover:underline">Create an account</Link></p>
            <p><Link href="/forgot-password" className="text-brand-500 hover:underline">Forgot password?</Link></p>
          </>
        ) : (
          <p>Already have an account? <Link href={`/signin?next=${encodeURIComponent(next)}`} className="text-brand-500 hover:underline">Sign in</Link></p>
        )}
      </div>
    </form>
  );
}
