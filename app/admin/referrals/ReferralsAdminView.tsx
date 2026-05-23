"use client";
import { useEffect, useState } from "react";
import { Loader2, Users, UserPlus, IndianRupee, Trophy } from "lucide-react";
import { api } from "@/lib/api-client";

type Resp = {
  totals: {
    totalReferred: number;
    last30Referred: number;
    paidReferred: number;
    conversionRate: number;
    uniqueReferrers: number;
  };
  topReferrers: { referrerId: string; name: string; email: string; code: string; count: number }[];
};

export function ReferralsAdminView() {
  const [d, setD] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<Resp>("/api/admin/referrals");
      if (!r.ok) { setErr(r.error.code === "FORBIDDEN" ? "Admin only." : r.error.message ?? "Failed"); return; }
      setD(r.data);
    })();
  }, []);

  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!d) return <div className="neon-card p-10 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Users} label="Total referred users" value={String(d.totals.totalReferred)} />
        <KPI icon={UserPlus} label="Last 30 days" value={String(d.totals.last30Referred)} />
        <KPI icon={IndianRupee} label="Converted to paid" value={String(d.totals.paidReferred)} sub={`${d.totals.conversionRate}% conv.`} />
        <KPI icon={Trophy} label="Unique referrers" value={String(d.totals.uniqueReferrers)} />
      </div>

      <div className="neon-card p-5">
        <h3 className="font-display font-bold">Top 25 referrers</h3>
        <table className="mt-4 w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="text-left py-1.5">#</th>
              <th className="text-left">Referrer</th>
              <th className="text-left">Code</th>
              <th className="text-right">Invited</th>
            </tr>
          </thead>
          <tbody>
            {d.topReferrers.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-4">No referrals yet.</td></tr>}
            {d.topReferrers.map((r, i) => (
              <tr key={r.referrerId} className="border-t border-border/40">
                <td className="py-2 font-mono text-muted-foreground">{i + 1}</td>
                <td>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </td>
                <td className="font-mono text-xs">{r.code || "—"}</td>
                <td className="text-right font-mono text-[#1e3a8a] dark:text-foreground font-bold">{r.count}</td>
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
