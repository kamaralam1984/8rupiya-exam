"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

type Exam = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  durationMin: number;
  questions: number;
  isActive: boolean;
  _count: { testSets: number; subjects: number };
};

export function ExamsAdminView() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const toast = useToast();

  async function load() {
    const r = await api<Exam[]>("/api/admin/exams");
    if (r.ok) setExams(r.data);
    else toast(r.error.message ?? "Load failed", "error");
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function toggle(e: Exam) {
    const r = await api(`/api/admin/exams/${e.slug}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !e.isActive }),
    });
    if (r.ok) {
      toast(`${e.name} is now ${!e.isActive ? "active" : "hidden"}`, "success");
      load();
    } else {
      toast(r.error.message ?? "Toggle failed", "error");
    }
  }

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Exams (courses)</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Toggle which exams are visible on the public site (homepage exam grid, onboarding picker
        and /home redirects).
      </p>

      {!exams ? (
        <div className="mt-8"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {exams.map((e) => (
            <div key={e.id} className="glass rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg",
                  e.isActive ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                )}>
                  <BookOpen className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{e.name} <span className="text-xs text-muted-foreground font-normal">/{e.slug}</span></p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.short} · {e._count.testSets} mocks · {e._count.subjects} subjects
                  </p>
                </div>
                <button
                  onClick={() => toggle(e)}
                  className="inline-flex items-center gap-1 text-xs"
                  title={e.isActive ? "Click to hide from public site" : "Click to make visible"}
                >
                  {e.isActive ? (
                    <><ToggleRight className="h-5 w-5 text-emerald-500" /> Active</>
                  ) : (
                    <><ToggleLeft className="h-5 w-5 text-muted-foreground" /> Hidden</>
                  )}
                </button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(editing === e.slug ? null : e.slug)}>
                  Edit
                </Button>
              </div>
              {editing === e.slug && (
                <EditExamForm exam={e} onDone={() => { setEditing(null); load(); }} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EditExamForm({ exam, onDone }: { exam: Exam; onDone: () => void }) {
  const [name, setName] = useState(exam.name);
  const [short, setShort] = useState(exam.short);
  const [description, setDescription] = useState(exam.description);
  const [durationMin, setDurationMin] = useState(exam.durationMin);
  const [questions, setQuestions] = useState(exam.questions);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    const r = await api(`/api/admin/exams/${exam.slug}`, {
      method: "PATCH",
      body: JSON.stringify({ name, short, description, durationMin, questions }),
    });
    setBusy(false);
    if (r.ok) { toast("Saved", "success"); onDone(); }
    else toast(r.error.message ?? "Save failed", "error");
  }

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-border/40 grid sm:grid-cols-2 gap-3">
      <label className="block">
        <span className="text-xs text-muted-foreground">Display name</span>
        <Input value={name} onChange={(ev) => setName(ev.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Short label</span>
        <Input value={short} onChange={(ev) => setShort(ev.target.value)} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted-foreground">Description</span>
        <textarea
          rows={3}
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Default duration (min)</span>
        <Input type="number" min={5} max={360} value={durationMin}
          onChange={(ev) => setDurationMin(parseInt(ev.target.value) || 60)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Default questions</span>
        <Input type="number" min={5} max={500} value={questions}
          onChange={(ev) => setQuestions(parseInt(ev.target.value) || 50)} />
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
