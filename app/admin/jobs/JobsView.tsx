"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

type Counts = { waiting: number; active: number; completed: number; failed: number; delayed: number };
type QueueInfo = {
  counts: Counts;
  recentFailed: { id: string; name: string; attemptsMade: number; failedReason: string; createdAt: number }[];
};

export function JobsView() {
  const [data, setData] = useState<Record<string, QueueInfo> | null>(null);

  async function load() {
    const r = await api<Record<string, QueueInfo>>("/api/admin/jobs");
    if (r.ok) setData(r.data);
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Background Jobs</h1>
      <p className="text-sm text-muted-foreground mt-1">Auto-refresh every 5s. Make sure <code className="text-brand-500">npm run workers</code> is running.</p>

      {!data ? (
        <Loader2 className="mt-8 h-5 w-5 animate-spin text-brand-500" />
      ) : (
        <div className="mt-6 space-y-5">
          {Object.entries(data).map(([name, q]) => (
            <div key={name} className="glass rounded-2xl p-5 gradient-border">
              <h2 className="font-display text-lg font-semibold">{name}</h2>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                {(["waiting", "active", "completed", "failed", "delayed"] as const).map((k) => (
                  <div key={k} className="rounded-lg bg-muted p-3">
                    <p className={`text-xl font-display font-bold ${k === "failed" && q.counts[k] > 0 ? "text-red-500" : k === "active" && q.counts[k] > 0 ? "text-brand-500" : ""}`}>{q.counts[k]}</p>
                    <p className="text-xs text-muted-foreground capitalize">{k}</p>
                  </div>
                ))}
              </div>
              {q.recentFailed.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recent failures</p>
                  <ul className="space-y-1 text-xs">
                    {q.recentFailed.map((f) => (
                      <li key={f.id} className="text-red-500 truncate">
                        <span className="text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span> · {f.name} · attempts {f.attemptsMade} · {f.failedReason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
