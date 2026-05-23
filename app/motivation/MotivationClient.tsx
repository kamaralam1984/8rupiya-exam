"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Heart, Brain, Moon, Coffee, Send, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Resp = {
  burnoutScore: number;
  band: "calm" | "stretched" | "burning" | "danger";
  pepTalk: string;
  microActions: string[];
};

export function MotivationClient() {
  const [mood, setMood] = useState(6);
  const [sleep, setSleep] = useState(6);
  const [stress, setStress] = useState(5);
  const [hours, setHours] = useState(8);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null);
    setLoading(true);
    const r = await api<Resp>("/api/ai/motivation", {
      method: "POST",
      body: JSON.stringify({ mood, sleep, stress, hours, note }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to use Motivation." : r.error.message ?? "Failed");
      return;
    }
    setData(r.data);
  }

  const bandColor = (b?: string) =>
    b === "calm" ? "from-emerald-500 to-teal-500"
    : b === "stretched" ? "from-cyan-500 to-blue-500"
    : b === "burning" ? "from-amber-500 to-orange-500"
    : "from-rose-500 to-pink-500";

  return (
    <div className="space-y-5">
      <div className="neon-card p-6 space-y-5">
        <Slider icon={Heart} label="Mood (1 down · 10 great)" value={mood} setValue={setMood} />
        <Slider icon={Moon} label="Sleep last night (hours)" value={sleep} setValue={setSleep} max={12} />
        <Slider icon={Brain} label="Stress (1 calm · 10 max)" value={stress} setValue={setStress} />
        <Slider icon={Coffee} label="Study hours today" value={hours} setValue={setHours} max={14} />

        <div>
          <label className="text-xs text-muted-foreground">What's on your mind? (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="e.g., Aaj mock bahut bura gaya, lagta hai selection nahi hoga…"
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={run} disabled={loading} className="btn-ai">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI thinking…</> : <><Send className="h-4 w-4" /> Get pep talk</>}
        </Button>
        {err && <p className="text-sm text-rose-400">{err}</p>}
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className={`neon-card p-6 bg-gradient-to-br ${bandColor(data.band)}/15 to-transparent`}>
            <div className="flex items-center gap-2">
              {data.band === "danger" && <AlertTriangle className="h-4 w-4 text-rose-300" />}
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{data.band} band</span>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <p className="font-display text-6xl font-bold ai-gradient-text">{data.burnoutScore}</p>
              <p className="text-sm text-muted-foreground mb-2">/100 burnout score</p>
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground/95">{data.pepTalk}</p>
          </div>

          <div className="neon-card p-5">
            <p className="ai-chip mb-3"><Sparkles className="h-3 w-3 text-purple-300" /> Aaj ke micro-actions</p>
            <ol className="space-y-2 text-sm">
              {data.microActions.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-purple-300 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Slider({ icon: Icon, label, value, setValue, max = 10 }: { icon: any; label: string; value: number; setValue: (n: number) => void; max?: number; }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5 text-brand-500" /> {label}</span>
        <span className="font-mono font-bold ai-gradient-text-cyan">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full accent-purple-500"
      />
    </div>
  );
}
