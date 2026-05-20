"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ToggleRight, ToggleLeft, Crown, Gift, Calendar, Infinity as InfinityIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Flag = {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  requiresPaid: boolean;
  sortOrder: number;
};

type PlanKind = "MONTH" | "YEAR" | "LIFETIME";

const PLAN_OPTIONS: { value: PlanKind; label: string; icon: any; description: string }[] = [
  { value: "MONTH",    label: "1 month",  icon: Calendar,     description: "₹8 → 30 din ka access" },
  { value: "YEAR",     label: "1 year",   icon: Calendar,     description: "₹8 → 365 din ka access" },
  { value: "LIFETIME", label: "Lifetime", icon: InfinityIcon, description: "₹8 → poora lifetime access" },
];

export function FeaturesView() {
  const [flags, setFlags] = useState<Flag[] | null>(null);
  const [planKind, setPlanKind] = useState<PlanKind | null>(null);
  const [savingFlag, setSavingFlag] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const toast = useToast();

  async function load() {
    const [fr, sr] = await Promise.all([
      api<Flag[]>("/api/admin/feature-flags"),
      api<{ planKind: PlanKind }>("/api/admin/platform-settings"),
    ]);
    if (fr.ok) setFlags(fr.data);
    if (sr.ok) setPlanKind(sr.data.planKind);
  }
  useEffect(() => { load(); }, []);

  async function update(key: string, patch: Partial<Flag>) {
    setSavingFlag(key);
    // Optimistic
    setFlags((cur) => cur ? cur.map((f) => f.key === key ? { ...f, ...patch } : f) : cur);
    const r = await api<Flag>(`/api/admin/feature-flags`, {
      method: "PATCH",
      body: JSON.stringify({ key, ...patch }),
    });
    setSavingFlag(null);
    if (!r.ok) {
      toast(r.error.message ?? "Update failed", "error");
      load();
    } else {
      toast(`Saved · ${key}`, "success");
    }
  }

  async function savePlan(p: PlanKind) {
    setSavingPlan(true);
    const r = await api<{ planKind: PlanKind }>("/api/admin/platform-settings", {
      method: "PATCH",
      body: JSON.stringify({ planKind: p }),
    });
    setSavingPlan(false);
    if (r.ok) {
      setPlanKind(p);
      toast(`Plan duration → ${p}`, "success");
    } else {
      toast(r.error.message ?? "Save failed", "error");
    }
  }

  const enabled = flags?.filter((f) => f.enabled).length ?? 0;
  const paid = flags?.filter((f) => f.enabled && f.requiresPaid).length ?? 0;
  const free = (flags?.length ?? 0) - paid;

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Features & Plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Har feature ko on/off, free/paid set karo. ₹8 plan duration choose karo.
      </p>

      {/* Plan duration */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass rounded-2xl p-6 gradient-border">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">₹8 plan duration</p>
            <p className="mt-1 text-sm">User jab ₹8 deta hai usse kitne din ka access milta hai</p>
          </div>
          {planKind && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/30">
              Current: {planKind}
            </span>
          )}
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {PLAN_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = planKind === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={savingPlan}
                onClick={() => savePlan(opt.value)}
                className={`glass rounded-xl p-4 text-left transition gradient-border ${active ? "ring-2 ring-brand-500/50 bg-brand-500/5" : "hover:bg-white/[0.03]"}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${active ? "text-brand-500" : "text-muted-foreground"}`} />
                  {active && <span className="text-[10px] uppercase tracking-wider text-brand-500 font-semibold">Active</span>}
                </div>
                <p className={`mt-2 font-display text-lg font-bold ${active ? "text-brand-500" : ""}`}>{opt.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Stats */}
      {flags && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Total" value={flags.length} />
          <StatCard label="Enabled" value={enabled} tone="emerald" />
          <StatCard label="Paid only" value={paid} tone="amber" />
        </div>
      )}

      {/* Feature list */}
      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold mb-3">All features</h2>
        {!flags ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {flags.map((f, i) => (
                <motion.div
                  key={f.key}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.25) }}
                  className={`glass rounded-xl p-4 gradient-border ${!f.enabled ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{f.label}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f.key}</span>
                        {!f.enabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30">DISABLED</span>
                        )}
                        {f.enabled && f.requiresPaid && (
                          <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                            <Crown className="h-3 w-3" /> PAID
                          </span>
                        )}
                        {f.enabled && !f.requiresPaid && (
                          <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                            <Gift className="h-3 w-3" /> FREE
                          </span>
                        )}
                      </div>
                      {f.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={f.enabled ? "outline" : "default"}
                        disabled={savingFlag === f.key}
                        onClick={() => update(f.key, { enabled: !f.enabled })}
                      >
                        {f.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {f.enabled ? "On" : "Off"}
                      </Button>
                      <Button
                        size="sm"
                        variant={f.requiresPaid ? "default" : "outline"}
                        disabled={savingFlag === f.key || !f.enabled}
                        onClick={() => update(f.key, { requiresPaid: !f.requiresPaid })}
                      >
                        {f.requiresPaid ? <Crown className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                        {f.requiresPaid ? "Paid" : "Free"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "amber" }) {
  const t = tone === "emerald" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : "text-brand-500";
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${t}`}>{value}</p>
    </div>
  );
}
