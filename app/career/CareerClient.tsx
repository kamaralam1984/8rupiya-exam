"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Compass, Sparkles, Briefcase, GraduationCap, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Career = {
  title: string;
  fitScore: number;
  why: string;
  exams: string[];
  salaryRange: string;
  roadmap: string[];
};
type Resp = { careers: Career[]; topPick: string };

const CLASSES = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Graduate", "Working"];
const INTERESTS = [
  "Maths", "Physics", "Chemistry", "Biology", "Coding", "Design",
  "Writing", "Government job", "Banking", "Medicine", "Engineering",
  "Teaching", "Defence", "Business", "Law", "Civil services",
];

export function CareerClient() {
  const [klass, setKlass] = useState("Class 12");
  const [selected, setSelected] = useState<string[]>(["Maths", "Coding"]);
  const [strength, setStrength] = useState("");
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function toggle(i: string) {
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].slice(0, 6)));
  }

  async function run() {
    setErr(null);
    setLoading(true);
    const r = await api<Resp>("/api/ai/career", {
      method: "POST",
      body: JSON.stringify({ klass, interests: selected, strength, budget }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error.code === "UNAUTHENTICATED" ? "Sign in to use AI Career Predictor." : r.error.message ?? "Failed");
      return;
    }
    setData(r.data);
  }

  return (
    <div className="space-y-6">
      <div className="neon-card p-6 space-y-5">
        <div>
          <label className="text-xs text-muted-foreground">Current stage</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setKlass(c)}
                className={`text-xs rounded-full px-3 py-1.5 border transition ${
                  klass === c ? "border-brand-500 bg-brand-500/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Interests (max 6) <span className="text-foreground">{selected.length}</span></label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`text-xs rounded-full px-3 py-1.5 border transition ${
                  selected.includes(i) ? "border-purple-500/60 bg-purple-500/15 text-purple-200" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >{i}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Strongest subject / superpower</label>
          <input
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="e.g., Strong in Maths and logical reasoning"
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Family budget for coaching/college</label>
          <div className="mt-2 flex gap-2">
            {([
              ["low", "Low (under ₹2L total)"],
              ["medium", "Medium (₹2L–₹10L)"],
              ["high", "High (₹10L+)"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setBudget(k)}
                className={`text-xs rounded-md px-3 py-1.5 border transition ${
                  budget === k ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-200" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        <Button onClick={run} disabled={loading || selected.length === 0} className="btn-ai">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI analyzing…</> : <><Compass className="h-4 w-4" /> Predict careers</>}
        </Button>
        {err && <p className="text-sm text-rose-400">{err}</p>}
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="ai-chip"><Sparkles className="h-3 w-3 text-purple-300" /> Top pick: <span className="ai-gradient-text font-bold">{data.topPick}</span></div>
          {data.careers.map((c, i) => (
            <div key={i} className="neon-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Fit</p>
                  <p className="font-display text-3xl font-bold ai-gradient-text-cyan">{c.fitScore}%</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="ai-chip mb-2"><GraduationCap className="h-3 w-3" /> Exams to crack</p>
                  <ul className="space-y-1">
                    {c.exams.map((e) => <li key={e} className="text-foreground/90">• {e}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="ai-chip mb-2"><IndianRupee className="h-3 w-3" /> Typical salary band</p>
                  <p className="text-foreground/90">{c.salaryRange}</p>
                </div>
              </div>

              <div>
                <p className="ai-chip mb-2"><Briefcase className="h-3 w-3" /> 12-month roadmap</p>
                <ol className="space-y-1 text-sm">
                  {c.roadmap.map((s, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="text-purple-300 font-mono">{String(k + 1).padStart(2, "0")}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
