"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

export default function ForgotPage() {
  const [id, setId] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const isEmail = id.includes("@");
    const r = await api<{ sent: boolean; devLink?: string }>("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify(isEmail ? { email: id } : { phone: id }),
    });
    setLoading(false);
    if (r.ok) {
      setSent(true);
      if (r.data.devLink) setDevLink(r.data.devLink);
    }
  }

  return (
    <section className="container pt-16 pb-20 max-w-md">
      <form onSubmit={submit} className="glass rounded-2xl p-7 gradient-border space-y-4">
        <h1 className="font-display text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email or phone — we'll send you a reset link.
        </p>
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com or 98xxxxxxxx" required />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
        {sent && (
          <div className="rounded-md bg-emerald-500/10 text-emerald-500 text-sm p-3">
            If that account exists, a reset link has been sent.
            {devLink && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">Dev only:</span>{" "}
                <a className="underline break-all" href={devLink}>{devLink}</a>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-center text-muted-foreground">
          <Link href="/signin" className="text-brand-500 hover:underline">Back to sign in</Link>
        </p>
      </form>
    </section>
  );
}
