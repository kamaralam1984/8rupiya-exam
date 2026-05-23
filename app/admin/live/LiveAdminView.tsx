"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Radio, Calendar, Video, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type LiveClass = {
  id: string;
  title: string;
  teacher: string;
  examSlug: string;
  status: "scheduled" | "live" | "ended";
  startsAt: string;
  durationMin: number;
  meetingUrl?: string;
  thumbnailUrl?: string;
  paid: boolean;
};

function cuid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

export function LiveAdminView() {
  const [list, setList] = useState<LiveClass[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<{ classes: LiveClass[] }>("/api/admin/live");
      if (!r.ok) { setErr(r.error.code === "FORBIDDEN" ? "Admin only." : r.error.message ?? "Failed"); return; }
      setList(r.data.classes);
    })();
  }, []);

  function add() {
    setList((prev) => [
      ...(prev ?? []),
      {
        id: cuid(),
        title: "New live class",
        teacher: "TBD",
        examSlug: "neet",
        status: "scheduled",
        startsAt: new Date().toISOString().slice(0, 16),
        durationMin: 60,
        meetingUrl: "",
        thumbnailUrl: "",
        paid: false,
      },
    ]);
  }
  function update(i: number, patch: Partial<LiveClass>) {
    setList((prev) => prev!.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }
  function remove(i: number) {
    setList((prev) => prev!.filter((_, j) => j !== i));
  }
  async function save() {
    if (!list) return;
    setSaving(true); setSavedMsg(null);
    const r = await api("/api/admin/live", { method: "PUT", body: JSON.stringify({ classes: list }) });
    setSaving(false);
    if (!r.ok) { setErr(r.error.message ?? "Save failed"); return; }
    setSavedMsg(`Saved ${list.length} class${list.length === 1 ? "" : "es"}.`);
    setTimeout(() => setSavedMsg(null), 3000);
  }

  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!list) return <div className="neon-card p-10 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Button onClick={add} variant="ghost"><Plus className="h-4 w-4" /> Add class</Button>
        <Button onClick={save} disabled={saving} className="btn-ai">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save all</>}
        </Button>
        {savedMsg && <span className="self-center text-sm text-emerald-300">{savedMsg}</span>}
      </div>

      {list.length === 0 && (
        <div className="neon-card p-10 text-center text-muted-foreground">
          No live classes scheduled. Click "Add class" to create one.
        </div>
      )}

      <div className="space-y-3">
        {list.map((c, i) => (
          <div key={c.id} className="neon-card p-5 grid sm:grid-cols-2 gap-3">
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" />
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.teacher} onChange={(e) => update(i, { teacher: e.target.value })} placeholder="Teacher" />
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.examSlug} onChange={(e) => update(i, { examSlug: e.target.value })} placeholder="exam slug (neet/jee/ssc...)" />
            <select className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.status} onChange={(e) => update(i, { status: e.target.value as any })}>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live now</option>
              <option value="ended">Ended (replay)</option>
            </select>
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" type="datetime-local" value={c.startsAt.slice(0, 16)} onChange={(e) => update(i, { startsAt: new Date(e.target.value).toISOString() })} />
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" type="number" min={5} max={600} value={c.durationMin} onChange={(e) => update(i, { durationMin: Number(e.target.value) || 60 })} placeholder="Duration min" />
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.meetingUrl ?? ""} onChange={(e) => update(i, { meetingUrl: e.target.value })} placeholder="Meeting / stream URL" />
            <input className="text-sm bg-background border border-border rounded-md px-3 py-2" value={c.thumbnailUrl ?? ""} onChange={(e) => update(i, { thumbnailUrl: e.target.value })} placeholder="Thumbnail URL" />

            <div className="sm:col-span-2 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={c.paid} onChange={(e) => update(i, { paid: e.target.checked })} />
                <Lock className="h-3.5 w-3.5 text-amber-300" /> Paid only
              </label>
              <div className="flex items-center gap-3">
                <span className={`ai-chip ${c.status === "live" ? "text-rose-200" : ""}`}>
                  {c.status === "live" ? <Radio className="h-3 w-3 text-rose-400 animate-pulse" /> : c.status === "ended" ? <Video className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  {c.status}
                </span>
                <button onClick={() => remove(i)} className="text-rose-400 hover:text-rose-300" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
