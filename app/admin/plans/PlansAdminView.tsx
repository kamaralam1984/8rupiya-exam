"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Save, Trash2, X, Star, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Role = "FREE" | "PREMIUM" | "FAMILY" | "ADMIN";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceInPaise: number;
  durationDays: number;
  targetRole: Role;
  features: string[];
  isActive: boolean;
  isHighlighted: boolean;
  sortOrder: number;
  _count: { subscriptions: number };
};

type FeatureMeta = { key: string; label: string };

export function PlansAdminView({ allFeatures }: { allFeatures: FeatureMeta[] }) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const toast = useToast();

  async function load() {
    const r = await api<Plan[]>("/api/admin/plans");
    if (r.ok) setPlans(r.data);
    else toast(r.error.message ?? "Load failed", "error");
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function toggleActive(p: Plan) {
    const r = await api(`/api/admin/plans/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (r.ok) { toast(`${p.name} ${!p.isActive ? "enabled" : "disabled"}`, "success"); load(); }
    else toast(r.error.message ?? "Failed", "error");
  }

  async function remove(p: Plan) {
    if (!confirm(`Delete plan "${p.name}"? Plans with subscriptions get soft-disabled.`)) return;
    const r = await api(`/api/admin/plans/${p.id}`, { method: "DELETE" });
    if (r.ok) { toast("Deleted (or soft-disabled if used)", "success"); load(); }
    else toast(r.error.message ?? "Delete failed", "error");
  }

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <div className="mt-1 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground">Define price, duration, target role, and feature unlocks per plan.</p>
        </div>
        <Button onClick={() => setEditingId("new")}><Plus className="h-4 w-4" /> Create plan</Button>
      </div>

      {editingId === "new" && (
        <PlanForm
          allFeatures={allFeatures}
          onDone={(ok) => { setEditingId(null); if (ok) load(); }}
        />
      )}

      {!plans ? (
        <div className="mt-8"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
      ) : plans.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No plans yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="paper-card p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                    {p.isHighlighted && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/15 text-accent inline-flex items-center gap-1">
                        <Star className="h-3 w-3" /> Popular
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      p.targetRole === "PREMIUM" ? "bg-amber-500/15 text-amber-600" :
                      p.targetRole === "FAMILY" ? "bg-fuchsia-500/15 text-fuchsia-600" :
                      p.targetRole === "ADMIN" ? "bg-brand-500/15 text-brand-600" :
                      "bg-muted text-muted-foreground"
                    }`}>{p.targetRole}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.slug} · ₹{p.priceInPaise / 100} · {p.durationDays}d · {p.features.length} features · {p._count.subscriptions} subscribers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(p)}
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  title={p.isActive ? "Disable" : "Enable"}
                >
                  {p.isActive ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  {p.isActive ? "Active" : "Hidden"}
                </button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(editingId === p.id ? null : p.id)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => remove(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {editingId === p.id && (
                <PlanForm
                  plan={p}
                  allFeatures={allFeatures}
                  onDone={(ok) => { setEditingId(null); if (ok) load(); }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlanForm({
  plan, allFeatures, onDone,
}: { plan?: Plan; allFeatures: FeatureMeta[]; onDone: (ok: boolean) => void }) {
  const isNew = !plan;
  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [rupees, setRupees] = useState((plan?.priceInPaise ?? 9900) / 100);
  const [days, setDays] = useState(plan?.durationDays ?? 30);
  const [targetRole, setTargetRole] = useState<Role>(plan?.targetRole ?? "PREMIUM");
  const [features, setFeatures] = useState<string[]>(plan?.features ?? []);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [isHighlighted, setIsHighlighted] = useState(plan?.isHighlighted ?? false);
  const [sortOrder, setSortOrder] = useState(plan?.sortOrder ?? 0);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  function toggleFeature(key: string) {
    setFeatures((f) => f.includes(key) ? f.filter((x) => x !== key) : [...f, key]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      slug, name, description: description || null,
      priceInPaise: Math.round(rupees * 100),
      durationDays: days, targetRole, features, isActive, isHighlighted, sortOrder,
    };
    const r = isNew
      ? await api("/api/admin/plans", { method: "POST", body: JSON.stringify(payload) })
      : await api(`/api/admin/plans/${plan!.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    setBusy(false);
    if (r.ok) { toast(isNew ? "Plan created" : "Saved", "success"); onDone(true); }
    else toast(r.error.message ?? "Save failed", "error");
  }

  return (
    <form onSubmit={submit} className="mt-4 border-t border-border/40 pt-4 grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2 flex items-center justify-between">
        <h4 className="font-display font-semibold">{isNew ? "New plan" : `Edit ${plan!.slug}`}</h4>
        <button type="button" onClick={() => onDone(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      {isNew && (
        <label className="block">
          <span className="text-xs text-muted-foreground">Slug (kebab-case)</span>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="premium-monthly" required />
        </label>
      )}
      <label className="block">
        <span className="text-xs text-muted-foreground">Display name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Premium Monthly" required />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted-foreground">Description (shown on pricing card)</span>
        <textarea
          rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Price (₹)</span>
        <Input type="number" min={0} step={1} value={rupees} onChange={(e) => setRupees(Number(e.target.value))} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Duration (days)</span>
        <Input type="number" min={0} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 0)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Target role on purchase</span>
        <select value={targetRole} onChange={(e) => setTargetRole(e.target.value as Role)} className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2 text-sm">
          <option value="FREE">FREE</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="FAMILY">FAMILY</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Sort order</span>
        <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
      </label>
      <div className="sm:col-span-2 flex items-center gap-5 text-sm flex-wrap">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (shown on /pricing)
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isHighlighted} onChange={(e) => setIsHighlighted(e.target.checked)} />
          Highlight as &quot;Most Popular&quot;
        </label>
      </div>

      <div className="sm:col-span-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Features included in this plan</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {allFeatures.map((f) => (
            <label key={f.key} className="inline-flex items-center gap-2 text-xs rounded-md border border-border bg-card px-2 py-1.5 cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={features.includes(f.key)}
                onChange={() => toggleFeature(f.key)}
              />
              <span className="truncate">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </Button>
      </div>
    </form>
  );
}
