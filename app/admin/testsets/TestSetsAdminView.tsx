"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Search, Save, ToggleLeft, ToggleRight, FileText, Trash2, Edit, Crown, IndianRupee,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { EXAMS } from "@/lib/exams";
import { cn } from "@/lib/utils";

type TS = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  kind: string;
  durationMin: number;
  isPremium: boolean;
  priceInPaise: number;
  isPublished: boolean;
  createdAt: string;
  exam: { name: string; slug: string };
  _count: { questions: number; attempts: number; unlocks: number };
};

function rupees(paise: number) {
  return `₹${(paise / 100).toFixed(paise % 100 === 0 ? 0 : 2)}`;
}

export function TestSetsAdminView() {
  const [sets, setSets] = useState<TS[] | null>(null);
  const [examSlug, setExamSlug] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const toast = useToast();

  async function load() {
    const sp = new URLSearchParams();
    if (examSlug) sp.set("examSlug", examSlug);
    if (q) sp.set("q", q);
    const r = await api<TS[]>(`/api/admin/testsets${sp.toString() ? `?${sp}` : ""}`);
    if (r.ok) setSets(r.data);
    else toast(r.error.message ?? "Load failed", "error");
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [examSlug]);

  async function patch(slug: string, body: object, msg: string) {
    const r = await api(`/api/admin/testsets/${slug}`, { method: "PATCH", body: JSON.stringify(body) });
    if (r.ok) { toast(msg, "success"); load(); }
    else toast(r.error.message ?? "Failed", "error");
  }

  async function remove(ts: TS) {
    if (!confirm(`Delete "${ts.title}"? This cannot be undone.`)) return;
    const r = await api(`/api/admin/testsets/${ts.slug}`, { method: "DELETE" });
    if (r.ok) { toast("Deleted", "success"); load(); }
    else toast(r.error.message ?? "Delete failed", "error");
  }

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Test Sets (mocks)</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Publish or unpublish individual test sets, flip free ↔ premium, edit duration and price.
      </p>

      <div className="mt-5 flex gap-2 flex-wrap items-end max-w-2xl">
        <label className="block">
          <span className="text-xs text-muted-foreground">Exam</span>
          <select
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
            className="mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All exams</option>
            {EXAMS.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </label>
        <form className="flex gap-2 flex-1" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or slug" />
          <Button type="submit"><Search className="h-4 w-4" /></Button>
        </form>
      </div>

      {!sets ? (
        <div className="mt-8"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
      ) : sets.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No test sets found.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {sets.map((ts) => (
            <div key={ts.id} className="glass rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg shrink-0",
                  ts.isPublished ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                )}>
                  <FileText className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {ts.title}
                    {ts.isPremium && (
                      <Crown className="inline h-3.5 w-3.5 ml-1.5 text-amber-400" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {ts.exam.name} · /{ts.slug} · {ts._count.questions}Q · {ts.durationMin}m · {rupees(ts.priceInPaise)} · {ts._count.attempts} attempts
                  </p>
                </div>
                <button
                  onClick={() => patch(ts.slug, { isPublished: !ts.isPublished }, `"${ts.title}" ${!ts.isPublished ? "published" : "unpublished"}`)}
                  className="inline-flex items-center gap-1 text-xs"
                  title={ts.isPublished ? "Unpublish (hide from students)" : "Publish (visible to students)"}
                >
                  {ts.isPublished ? (
                    <><ToggleRight className="h-5 w-5 text-emerald-500" /> Live</>
                  ) : (
                    <><ToggleLeft className="h-5 w-5 text-muted-foreground" /> Draft</>
                  )}
                </button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => patch(ts.slug, { isPremium: !ts.isPremium }, `${ts.isPremium ? "Made free" : "Made premium"}`)}
                  title={ts.isPremium ? "Switch to free" : "Switch to premium"}
                >
                  {ts.isPremium ? "Premium" : "Free"}
                </Button>
                <Button size="sm" variant="ghost" title="Edit" onClick={() => setEditing(editing === ts.slug ? null : ts.slug)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" title="Delete" onClick={() => remove(ts)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {editing === ts.slug && (
                <EditTestSetForm ts={ts} onDone={() => { setEditing(null); load(); }} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EditTestSetForm({ ts, onDone }: { ts: TS; onDone: () => void }) {
  const [title, setTitle] = useState(ts.title);
  const [description, setDescription] = useState(ts.description ?? "");
  const [durationMin, setDurationMin] = useState(ts.durationMin);
  const [priceInPaise, setPriceInPaise] = useState(ts.priceInPaise);
  const [kind, setKind] = useState(ts.kind);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    const r = await api(`/api/admin/testsets/${ts.slug}`, {
      method: "PATCH",
      body: JSON.stringify({
        title, description: description || null, durationMin, priceInPaise, kind,
      }),
    });
    setBusy(false);
    if (r.ok) { toast("Saved", "success"); onDone(); }
    else toast(r.error.message ?? "Save failed", "error");
  }

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-border/40 grid sm:grid-cols-2 gap-3">
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted-foreground">Title</span>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted-foreground">Description</span>
        <textarea
          rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Duration (min)</span>
        <Input type="number" min={5} max={360} value={durationMin}
          onChange={(e) => setDurationMin(parseInt(e.target.value) || 60)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <IndianRupee className="h-3 w-3" /> Price (paise)
        </span>
        <Input type="number" min={0} max={1000000} value={priceInPaise}
          onChange={(e) => setPriceInPaise(parseInt(e.target.value) || 0)} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted-foreground">Kind (MOCK / PYQ / PREDICT / DRILL / ...)</span>
        <Input value={kind} onChange={(e) => setKind(e.target.value)} />
      </label>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </Button>
      </div>
    </form>
  );
}
