"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { useUser } from "@/lib/use-user";

export function SettingsView() {
  const { user, loading, setUser } = useUser();
  const toast = useToast();
  const [name, setName] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name ?? ""); setLang((user.language as "en"|"hi") ?? "en"); }
  }, [user]);

  if (loading) {
    return (
      <section className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Sign in to manage settings</h1>
          <Link href="/signin?next=/settings" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      </section>
    );
  }

  async function save() {
    setSaving(true);
    const r = await api<{ id: string; name: string; language: string }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name, language: lang }),
    });
    setSaving(false);
    if (!r.ok) { toast(r.error.message ?? r.error.code, "error"); return; }
    setUser(user ? { ...user, name: r.data.name, language: r.data.language } : null);
    toast("Saved.", "success");
  }

  return (
    <section className="container pt-10 pb-20 max-w-xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">Account Settings</h1>
      <div className="mt-6 glass rounded-2xl p-6 gradient-border space-y-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Display name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Account identifier</span>
          <Input value={user.email ?? user.phone ?? ""} disabled />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Preferred language</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "hi")}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </label>
        <Button onClick={save} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save</>}
        </Button>
      </div>
      <div className="mt-6 glass rounded-2xl p-6 gradient-border">
        <h2 className="font-display font-semibold mb-2">Security</h2>
        <Link href="/forgot-password" className="text-sm text-brand-500 hover:underline">
          Change password
        </Link>
      </div>
    </section>
  );
}
