"use client";
import { useEffect, useState } from "react";
import { Loader2, Send, Bell, AlertTriangle, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Stats = { totalSubscribers: number; last7Subscribers: number; vapidConfigured: boolean };
type SendResult = { sent: number; failed: number; pruned: number };

export function PushAdminView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [title, setTitle] = useState("8Rupia");
  const [body, setBody] = useState("Aaj ka DPP wait kar raha hai — 15 min mein streak save karo.");
  const [url, setUrl] = useState("/dpp");
  const [tag, setTag] = useState("dpp-reminder");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<Stats>("/api/admin/push/stats");
      if (!r.ok) { setErr(r.error.code === "FORBIDDEN" ? "Admin only." : r.error.message ?? "Failed"); return; }
      setStats(r.data);
    })();
  }, []);

  async function send() {
    setBusy(true); setErr(null); setResult(null);
    const r = await api<SendResult>("/api/admin/push/send", {
      method: "POST",
      body: JSON.stringify({ title, body, url, tag, audience: "all" }),
    });
    setBusy(false);
    if (!r.ok) { setErr(r.error.message ?? "Send failed"); return; }
    setResult(r.data);
  }

  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="neon-card p-5 border border-border">
            <Users className="h-5 w-5 text-[#1e3a8a] dark:text-cyan-300" />
            <p className="mt-3 text-xs text-muted-foreground">Total subscribers</p>
            <p className="font-display text-2xl font-bold text-[#1e3a8a] dark:text-foreground">{stats.totalSubscribers}</p>
          </div>
          <div className="neon-card p-5 border border-border">
            <Bell className="h-5 w-5 text-[#1e3a8a] dark:text-purple-300" />
            <p className="mt-3 text-xs text-muted-foreground">Last 7 days</p>
            <p className="font-display text-2xl font-bold text-[#1e3a8a] dark:text-foreground">{stats.last7Subscribers}</p>
          </div>
          <div className={`neon-card p-5 border ${stats.vapidConfigured ? "border-border" : "border-amber-500/60"}`}>
            {stats.vapidConfigured ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" /> : <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />}
            <p className="mt-3 text-xs text-muted-foreground">VAPID keys</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.vapidConfigured ? "Ready" : "Missing"}</p>
          </div>
        </div>
      )}

      {!stats?.vapidConfigured && (
        <div className="neon-card p-4 border-amber-500/40 bg-amber-500/10">
          <p className="text-sm">
            <AlertTriangle className="inline h-4 w-4 mr-1 text-amber-300" />
            Add <code className="font-mono">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> and{" "}
            <code className="font-mono">VAPID_PRIVATE_KEY</code> to <code>.env</code>. Generate with{" "}
            <code className="font-mono">npx web-push generate-vapid-keys</code>.
          </p>
        </div>
      )}

      <div className="neon-card p-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={300}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Target URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tag (dedupe key)</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={40}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <Button onClick={send} disabled={busy || !stats?.vapidConfigured} className="btn-ai">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Broadcast to all</>}
        </Button>
        {err && <p className="text-sm text-rose-400">{err}</p>}
        {result && (
          <p className="text-sm text-emerald-300">
            Sent: <strong>{result.sent}</strong> · Failed: <strong>{result.failed}</strong> · Pruned dead subs: <strong>{result.pruned}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
