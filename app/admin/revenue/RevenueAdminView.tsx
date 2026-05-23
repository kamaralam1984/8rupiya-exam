"use client";
import { useEffect, useState } from "react";
import { Loader2, IndianRupee, TrendingUp, AlertTriangle, Users, ArrowDownToLine } from "lucide-react";
import { api } from "@/lib/api-client";

type Resp = {
  totals: {
    lifetimeRevenue: number;
    lifetimePayments: number;
    last30Revenue: number;
    last30Payments: number;
    last90Revenue: number;
    refunded30: number;
    failed30: number;
    activeSubs: number;
    mrr: number;
  };
  daily: { day: string; revenue: number; count: number }[];
  purposeBreakdown: { purpose: string; revenue: number; count: number }[];
};

function rupees(paise: number) {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function RevenueAdminView() {
  const [d, setD] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<Resp>("/api/admin/revenue");
      if (!r.ok) { setErr(r.error.code === "FORBIDDEN" ? "Admin only." : r.error.message ?? "Failed"); return; }
      setD(r.data);
    })();
  }, []);

  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!d) return <div className="neon-card p-10 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" /></div>;

  const maxRev = Math.max(1, ...d.daily.map((x) => x.revenue));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={IndianRupee} label="MRR (est.)" value={rupees(d.totals.mrr)} />
        <KPI icon={TrendingUp} label="Last 30 days" value={rupees(d.totals.last30Revenue)} sub={`${d.totals.last30Payments} payments`} />
        <KPI icon={Users} label="Active subs" value={String(d.totals.activeSubs)} />
        <KPI icon={IndianRupee} label="Lifetime" value={rupees(d.totals.lifetimeRevenue)} sub={`${d.totals.lifetimePayments} payments`} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <KPI icon={ArrowDownToLine} label="Refunded 30d" value={rupees(d.totals.refunded30)} />
        <KPI icon={AlertTriangle} label="Failed 30d" value={String(d.totals.failed30)} />
        <KPI icon={TrendingUp} label="Last 90 days" value={rupees(d.totals.last90Revenue)} />
      </div>

      <div className="neon-card p-5">
        <h3 className="font-display font-bold">Daily revenue · last 30 days</h3>
        <div className="mt-4 flex items-end gap-1 h-44 overflow-x-auto">
          {d.daily.length === 0 && <p className="text-sm text-muted-foreground">No paid transactions in last 30 days.</p>}
          {d.daily.map((row) => {
            const h = Math.round((row.revenue / maxRev) * 100);
            return (
              <div key={row.day} className="flex flex-col items-center gap-1 min-w-[28px]" title={`${row.day}: ${rupees(row.revenue)} (${row.count})`}>
                <div className="w-5 rounded-t-sm bg-[#1e3a8a]" style={{ height: `${Math.max(4, h)}%` }} />
                <span className="text-[9px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">{row.day.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="neon-card p-5">
        <h3 className="font-display font-bold">Purpose breakdown · last 30 days</h3>
        <table className="mt-4 w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr><th className="text-left py-1.5">Purpose</th><th className="text-right">Count</th><th className="text-right">Revenue</th></tr>
          </thead>
          <tbody>
            {d.purposeBreakdown.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-4">No data.</td></tr>}
            {d.purposeBreakdown.map((p) => (
              <tr key={p.purpose} className="border-t border-border/40">
                <td className="py-2">{p.purpose}</td>
                <td className="text-right font-mono">{p.count}</td>
                <td className="text-right font-mono text-[#1e3a8a] dark:text-foreground font-bold">{rupees(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="neon-card p-5 border border-border">
      <Icon className="h-5 w-5 text-[#1e3a8a] dark:text-foreground/80" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold text-[#1e3a8a] dark:text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
