"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Txn = { id: string; kind: "CREDIT" | "DEBIT"; amount: number; reason: string; createdAt: string };
type WalletData = { balance: number; currency: string; txns: Txn[] };

const PRESETS = [800, 4900, 9900, 19900];

declare global { interface Window { Razorpay?: any } }

export function WalletView() {
  const [data, setData] = useState<WalletData | null>(null);
  const [needAuth, setNeedAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function load() {
    const r = await api<WalletData>("/api/wallet");
    if (!r.ok) { if (r.error.code === "UNAUTHENTICATED") setNeedAuth(true); return; }
    setData(r.data);
  }
  useEffect(() => { load(); }, []);

  async function topup(amountInPaise: number) {
    setLoading(true);
    const r = await api<{ orderId: string; amount: number; currency: string; keyId: string }>("/api/wallet/topup", {
      method: "POST",
      body: JSON.stringify({ amountInPaise }),
    });
    setLoading(false);
    if (!r.ok) { toast(r.error.message ?? "Failed", "error"); return; }
    if (!window.Razorpay) { toast("Payment SDK not loaded", "error"); return; }
    const rzp = new window.Razorpay({
      key: r.data.keyId, amount: r.data.amount, currency: r.data.currency,
      order_id: r.data.orderId, name: "8Rupia Wallet", theme: { color: "#4f7cff" },
      handler: async (resp: any) => {
        const v = await api("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          }),
        });
        if (v.ok) { toast("Wallet credited", "success"); load(); }
        else toast("Verification failed", "error");
      },
    });
    rzp.open();
  }

  if (needAuth) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Sign in to view wallet</h1>
          <Link href="/signin?next=/wallet" className="mt-4 inline-block"><Button>Sign in</Button></Link>
        </div>
      </section>
    );
  }
  if (!data) return <section className="container py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></section>;

  return (
    <section className="container pt-10 pb-20 max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
        <WalletIcon className="h-7 w-7 text-brand-500" /> Wallet
      </h1>
      <div className="mt-6 glass rounded-2xl p-7 gradient-border text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
        <p className="mt-2 font-display text-5xl font-bold gradient-text">
          ₹{(data.balance / 100).toFixed(2)}
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {PRESETS.map((a) => (
            <Button key={a} variant="outline" disabled={loading} onClick={() => topup(a)}>
              + ₹{a / 100}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="font-display font-semibold mb-3">Recent transactions</h2>
        {data.txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.txns.map((t) => (
              <li key={t.id} className="glass rounded-xl p-3 flex items-center gap-3">
                {t.kind === "CREDIT" ? (
                  <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.reason}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <span className={`font-mono ${t.kind === "CREDIT" ? "text-emerald-500" : "text-red-500"}`}>
                  {t.kind === "CREDIT" ? "+" : "-"}₹{(t.amount / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
