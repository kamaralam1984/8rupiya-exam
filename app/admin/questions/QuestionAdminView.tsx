"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Question = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  difficulty: string;
  approved: boolean;
  aiGenerated: boolean;
  source: string | null;
  subject: { name: string } | null;
};

export function QuestionAdminView() {
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [qs, setQs] = useState<Question[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function load() {
    setQs(null);
    const r = await api<Question[]>(`/api/admin/questions?status=${tab}`);
    if (r.ok) { setQs(r.data); setSelected(new Set()); }
  }
  useEffect(() => { load(); }, [tab]);

  async function bulk(approve: boolean) {
    if (selected.size === 0) return;
    setBusy(true);
    await api("/api/admin/questions/approve", {
      method: "POST",
      body: JSON.stringify({ ids: [...selected], approved: approve }),
    });
    setBusy(false);
    load();
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6">
        <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
        <h1 className="mt-1 font-display text-3xl font-bold">Question review</h1>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1 rounded-lg glass p-1">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-1.5 text-sm rounded-md ${tab === "pending" ? "bg-brand-500/20 text-brand-500" : ""}`}
          >Pending</button>
          <button
            onClick={() => setTab("approved")}
            className={`px-3 py-1.5 text-sm rounded-md ${tab === "approved" ? "bg-brand-500/20 text-brand-500" : ""}`}
          >Approved</button>
        </div>
        <div className="flex items-center gap-2">
          {qs && qs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selected.size === qs.length) setSelected(new Set());
                else setSelected(new Set(qs.map((q) => q.id)));
              }}
              className="text-xs px-2.5 py-1.5 rounded-md glass hover:bg-brand-500/10"
            >
              {selected.size === qs.length ? "Clear all" : "Select all on page"}
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {selected.size} / {qs?.length ?? 0} selected
          </span>
          <Button size="sm" disabled={busy || selected.size === 0} onClick={() => bulk(true)}>
            <Check className="h-4 w-4" /> Approve
          </Button>
          <Button size="sm" variant="outline" disabled={busy || selected.size === 0} onClick={() => bulk(false)}>
            <X className="h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      {!qs ? (
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
      ) : qs.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No {tab} questions.
        </div>
      ) : (
        <div className="space-y-3">
          {qs.map((q) => (
            <label
              key={q.id}
              className={`block glass rounded-xl p-4 gradient-border cursor-pointer ${
                selected.has(q.id) ? "ring-2 ring-brand-500/50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggle(q.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {q.subject && <span className="px-1.5 py-0.5 rounded bg-muted">{q.subject.name}</span>}
                    <span>{q.difficulty}</span>
                    {q.aiGenerated && <span className="text-brand-500">AI</span>}
                    {q.source && <span className="truncate">· {q.source}</span>}
                  </div>
                  <p className="mt-2 font-medium">{q.stem}</p>
                  <ol className="mt-2 space-y-0.5 text-sm">
                    {q.options.map((o, i) => (
                      <li key={i} className={i === q.correctIndex ? "text-emerald-500" : "text-muted-foreground"}>
                        {String.fromCharCode(65 + i)}. {o} {i === q.correctIndex && <span className="text-xs">✓</span>}
                      </li>
                    ))}
                  </ol>
                  {q.explanation && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
