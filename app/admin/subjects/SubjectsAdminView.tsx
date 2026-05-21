"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2, ToggleLeft, ToggleRight, Plus, Trash2, Split, Merge, BookOpen, Save, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { useAdminExams } from "@/lib/use-admin-exams";
import { cn } from "@/lib/utils";

type S = {
  id: string;
  name: string;
  slug: string;
  splitEnabled: boolean;
  parentId: string | null;
  examId: string;
  parent: { id: string; name: string; slug: string } | null;
  _count: { children: number; questions: number };
};

export function SubjectsAdminView() {
  const exams = useAdminExams();
  const [examSlug, setExamSlug] = useState("");
  const [rows, setRows] = useState<S[] | null>(null);
  const [adding, setAdding] = useState<{ parentSlug: string | null } | null>(null);
  const toast = useToast();

  // Default the dropdown to the first exam returned by the API once it loads.
  useEffect(() => {
    if (!examSlug && exams && exams.length > 0) setExamSlug(exams[0].slug);
  }, [exams, examSlug]);

  async function load() {
    setRows(null);
    const r = await api<S[]>(`/api/admin/subjects?examSlug=${examSlug}`);
    if (r.ok) setRows(r.data);
    else toast(r.error.message ?? "Load failed", "error");
  }
  useEffect(() => { if (examSlug) load(); /* eslint-disable-next-line */ }, [examSlug]);

  const parents = useMemo(() => (rows ?? []).filter((s) => !s.parentId), [rows]);
  const childrenByParent = useMemo(() => {
    const m = new Map<string, S[]>();
    for (const r of rows ?? []) {
      if (r.parentId) {
        if (!m.has(r.parentId)) m.set(r.parentId, []);
        m.get(r.parentId)!.push(r);
      }
    }
    return m;
  }, [rows]);

  async function toggle(s: S) {
    const r = await api(`/api/admin/subjects/${s.id}`, {
      method: "PATCH",
      body: JSON.stringify({ splitEnabled: !s.splitEnabled }),
    });
    if (r.ok) {
      toast(`${s.name}: ${!s.splitEnabled ? "split into children" : "combined"}`, "success");
      load();
    } else toast(r.error.message ?? "Toggle failed", "error");
  }

  async function remove(s: S) {
    if (!confirm(`Delete subject "${s.name}"?`)) return;
    const r = await api(`/api/admin/subjects/${s.id}`, { method: "DELETE" });
    if (r.ok) { toast("Deleted", "success"); load(); }
    else toast(r.error.message ?? "Delete failed", "error");
  }

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Subjects</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Toggle whether a parent subject (e.g. <em>Science</em>) is shown as one combined option or
        split into its children (<em>Physics + Chemistry + Biology</em>). Available across all exam
        tracks.
      </p>

      <label className="mt-5 inline-flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Exam:</span>
        <select
          value={examSlug}
          onChange={(e) => setExamSlug(e.target.value)}
          disabled={!exams || exams.length === 0}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-60"
        >
          {!exams ? (
            <option value="">Loading…</option>
          ) : exams.length === 0 ? (
            <option value="">No exams in database — seed first</option>
          ) : (
            exams.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)
          )}
        </select>
      </label>

      {exams && exams.length === 0 && (
        <p className="mt-3 text-sm text-amber-400">
          ⚠ No exams found in database. Run <code className="bg-white/10 px-1.5 py-0.5 rounded">npm run db:seed</code> on the server, or add exams via <Link href="/admin/exams" className="underline">/admin/exams</Link>.
        </p>
      )}

      {!rows ? (
        <div className="mt-8"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {parents.length === 0 && <p className="text-sm text-muted-foreground">No subjects for this exam yet.</p>}
          {parents.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4 gradient-border">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20 shrink-0">
                  <BookOpen className="h-4 w-4 text-brand-500" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name} <span className="text-xs text-muted-foreground font-normal">/{p.slug}</span></p>
                  <p className="text-xs text-muted-foreground">
                    {p._count.children} sub-subject{p._count.children !== 1 ? "s" : ""} · {p._count.questions} questions
                  </p>
                </div>
                {p._count.children > 0 && (
                  <button onClick={() => toggle(p)} className="inline-flex items-center gap-1 text-xs" title="Toggle split">
                    {p.splitEnabled ? (
                      <><ToggleRight className="h-5 w-5 text-emerald-500" /> Split</>
                    ) : (
                      <><ToggleLeft className="h-5 w-5 text-muted-foreground" /> Combined</>
                    )}
                  </button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setAdding({ parentSlug: p.slug })} title="Add sub-subject">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => remove(p)} title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* children */}
              {(childrenByParent.get(p.id) ?? []).length > 0 && (
                <div className={cn(
                  "mt-3 pl-5 border-l-2 space-y-2",
                  p.splitEnabled ? "border-emerald-500/40" : "border-border/60"
                )}>
                  {(childrenByParent.get(p.id) ?? []).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Split className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm flex-1 min-w-0 truncate">
                        {c.name} <span className="text-xs text-muted-foreground">/{c.slug}</span>
                        <span className="ml-2 text-xs text-muted-foreground">· {c._count.questions} questions</span>
                      </p>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        p.splitEnabled ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                      )}>
                        {p.splitEnabled ? "VISIBLE" : "HIDDEN"}
                      </span>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => remove(c)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {p._count.children === 0 && (
                <p className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Merge className="h-3 w-3" /> Add a sub-subject to enable the split toggle.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {adding && (
        <AddSubjectModal
          examSlug={examSlug}
          parentSlug={adding.parentSlug}
          onClose={() => setAdding(null)}
          onCreated={() => { setAdding(null); load(); }}
        />
      )}

      <div className="mt-8">
        <Button onClick={() => setAdding({ parentSlug: null })}>
          <Plus className="h-4 w-4" /> Add top-level subject
        </Button>
      </div>
    </section>
  );
}

function AddSubjectModal({
  examSlug, parentSlug, onClose, onCreated,
}: { examSlug: string; parentSlug: string | null; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await api("/api/admin/subjects", {
      method: "POST",
      body: JSON.stringify({
        examSlug,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parentSlug,
      }),
    });
    setBusy(false);
    if (r.ok) { toast("Subject added", "success"); onCreated(); }
    else toast(r.error.message ?? "Create failed", "error");
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-5 gradient-border w-full max-w-md space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">
            {parentSlug ? `New sub-subject under "${parentSlug}"` : "New top-level subject"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">Display name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Physics" required />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Slug (a-z, 0-9, -)</span>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Add
          </Button>
        </div>
      </form>
    </div>
  );
}
