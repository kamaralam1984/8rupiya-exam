"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

export function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const r = await api("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ token, password: pw }),
    });
    setLoading(false);
    if (!r.ok) { setErr(r.error.message ?? r.error.code); return; }
    setDone(true);
    setTimeout(() => router.push("/signin"), 1500);
  }

  if (!token) {
    return (
      <div className="glass rounded-2xl p-7 gradient-border">
        <h1 className="font-display text-xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link is missing a token.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-brand-500 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-7 gradient-border space-y-4">
      <h1 className="font-display text-2xl font-bold">Set a new password</h1>
      <Input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        minLength={8}
        required
        placeholder="At least 8 characters"
      />
      {err && <p className="text-sm text-red-500">{err}</p>}
      {done ? (
        <p className="text-sm text-emerald-500">Password reset. Redirecting to sign in…</p>
      ) : (
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      )}
    </form>
  );
}
