"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, IndianRupee, RotateCcw, Search, Copy, Check,
  TrendingUp, AlertTriangle, Wallet, CircleDashed, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Payment = {
  id: string;
  razorpayOrderId: string;
  amountInPaise: number;
  status: "CREATED" | "PAID" | "REFUNDED" | "FAILED";
  purpose: string;
  createdAt: string;
  user: { id: string; email: string | null; phone: string | null; name: string | null };
};
type Total = { status: string; _sum: { amountInPaise: number | null }; _count: number };
type StatusFilter = "all" | "PAID" | "REFUNDED" | "FAILED" | "CREATED";

const RANGES: { label: string; days: number | null }[] = [
  { label: "7 din", days: 7 },
  { label: "30 din", days: 30 },
  { label: "90 din", days: 90 },
  { label: "All time", days: null },
];

const STATUS_META: Record<Payment["status"], { icon: any; tone: string; chipTone: string }> = {
  PAID:     { icon: TrendingUp,    tone: "text-emerald-400", chipTone: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  REFUNDED: { icon: RotateCcw,     tone: "text-amber-400",   chipTone: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  FAILED:   { icon: AlertTriangle, tone: "text-rose-400",    chipTone: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  CREATED:  { icon: CircleDashed,  tone: "text-sky-400",     chipTone: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
};

function rupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function relTime(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function PaymentsAdminView() {
  const [data, setData] = useState<{ payments: Payment[]; totals: Total[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [days, setDays] = useState<number | null>(30);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (days) params.set("days", String(days));
      if (debouncedQ) params.set("q", debouncedQ);
      const r = await api<{ payments: Payment[]; totals: Total[] }>(`/api/admin/payments?${params}`);
      if (cancelled) return;
      if (r.ok) setData(r.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [status, days, debouncedQ]);

  async function refund(id: string) {
    if (!confirm("Issue refund for this payment?")) return;
    setRefundingId(id);
    const r = await api("/api/admin/payments/refund", {
      method: "POST",
      body: JSON.stringify({ paymentId: id }),
    });
    setRefundingId(null);
    if (r.ok) {
      toast("Refunded", "success");
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (days) params.set("days", String(days));
      if (debouncedQ) params.set("q", debouncedQ);
      const next = await api<{ payments: Payment[]; totals: Total[] }>(`/api/admin/payments?${params}`);
      if (next.ok) setData(next.data);
    } else {
      toast(r.error.message ?? "Failed", "error");
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  const totals = data?.totals ?? [];
  const payments = data?.payments ?? [];
  const paidTotal = useMemo(
    () => totals.find((t) => t.status === "PAID")?._sum.amountInPaise ?? 0,
    [totals],
  );
  const refundedTotal = useMemo(
    () => totals.find((t) => t.status === "REFUNDED")?._sum.amountInPaise ?? 0,
    [totals],
  );
  const netRevenue = paidTotal - refundedTotal;

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <div className="mt-1 flex items-end justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold">Payments</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-muted-foreground">Range:</span>
          <div className="inline-flex items-center gap-1 rounded-lg glass p-1">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setDays(r.days)}
                className={`px-2.5 py-1 text-xs rounded-md transition ${days === r.days ? "bg-brand-500/20 text-brand-500" : "text-muted-foreground hover:text-foreground"}`}
              >{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 glass rounded-2xl p-6 gradient-border"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Net revenue</p>
            <p className="mt-1 font-display text-4xl font-bold gradient-text">
              ₹{rupees(netRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Paid ₹{rupees(paidTotal)} · Refunded ₹{rupees(refundedTotal)}
            </p>
          </div>
          <Wallet className="h-12 w-12 text-brand-500/40" />
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["PAID", "REFUNDED", "FAILED", "CREATED"] as const).map((s, i) => {
          const t = totals.find((x) => x.status === s);
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          const active = status === s;
          return (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setStatus(active ? "all" : s)}
              className={`glass rounded-xl p-4 text-left transition gradient-border ${active ? "ring-2 ring-brand-500/50" : "hover:bg-white/[0.03]"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s}</p>
                <Icon className={`h-4 w-4 ${meta.tone}`} />
              </div>
              <p className={`mt-1 font-display text-xl font-bold ${meta.tone}`}>
                ₹{rupees(t?._sum.amountInPaise ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">{t?._count ?? 0} payments</p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Email, phone ya name se search karo…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg glass border border-white/5 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {status !== "all" && <span className="mr-2">Status: <b>{status}</b></span>}
          {payments.length} {payments.length === 1 ? "result" : "results"}
          {status !== "all" && (
            <button onClick={() => setStatus("all")} className="ml-2 text-brand-500 hover:underline">Clear filter</button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loading && !data ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-10 text-center gradient-border"
          >
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <h3 className="mt-3 font-display text-lg font-semibold">Koi payment nahi mila</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {q || status !== "all"
                ? "Filter ya search match nahi hua. Range badal ke dekho ya filter clear karo."
                : "Abhi tak koi payment record nahi hai. Jab koi user ₹8 unlock kharidega, yahaan dikhega."}
            </p>
            {(q || status !== "all" || days !== null) && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {q && <Button size="sm" variant="outline" onClick={() => setQ("")}>Clear search</Button>}
                {status !== "all" && <Button size="sm" variant="outline" onClick={() => setStatus("all")}>Clear status</Button>}
                {days !== null && <Button size="sm" variant="outline" onClick={() => setDays(null)}>All time</Button>}
              </div>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {payments.map((p, i) => {
                const meta = STATUS_META[p.status];
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: Math.min(i * 0.025, 0.3) }}
                    className="glass rounded-xl p-3 flex items-center gap-3 gradient-border hover:bg-white/[0.02]"
                  >
                    <IndianRupee className={`h-4 w-4 ${meta.tone}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        ₹{(p.amountInPaise / 100).toFixed(2)}
                        <span className="ml-2 text-xs text-muted-foreground">{p.purpose}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.user.name ?? p.user.email ?? p.user.phone ?? "—"}
                        <span className="mx-1">·</span>
                        {relTime(p.createdAt)}
                        <button
                          onClick={() => copyId(p.id)}
                          className="ml-2 inline-flex items-center gap-1 hover:text-brand-500 transition"
                          title="Copy payment ID"
                        >
                          {copiedId === p.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span className="font-mono">{p.id.slice(0, 8)}…</span>
                        </button>
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${meta.chipTone}`}>
                      {p.status}
                    </span>
                    {p.status === "PAID" && (
                      <Button size="sm" variant="outline" disabled={refundingId === p.id} onClick={() => refund(p.id)}>
                        {refundingId === p.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <RotateCcw className="h-3.5 w-3.5" />}
                        Refund
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
