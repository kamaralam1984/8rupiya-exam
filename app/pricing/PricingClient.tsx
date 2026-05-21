"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { useUser } from "@/lib/use-user";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceInPaise: number;
  durationDays: number;
  targetRole: string;
  features: string[];
  isHighlighted: boolean;
};

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      // already loading
      const i = setInterval(() => {
        if (window.Razorpay) { clearInterval(i); resolve(true); }
      }, 50);
      return;
    }
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function formatPrice(p: Plan) {
  if (p.priceInPaise === 0) return "Free";
  return `₹${(p.priceInPaise / 100).toLocaleString("en-IN")}`;
}

function durationLabel(days: number) {
  if (days >= 9999) return "lifetime";
  if (days >= 365) return `/ ${Math.round(days / 365)}y`;
  if (days >= 28) return `/ ${Math.round(days / 30)}m`;
  return `/ ${days}d`;
}

export function PricingClient({
  plans, featureLabels,
}: { plans: Plan[]; featureLabels: Record<string, string> }) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useUser();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { loadRazorpay(); }, []);

  async function buy(plan: Plan) {
    if (!user) {
      router.push(`/signin?next=/pricing`);
      return;
    }
    setBusyId(plan.id);
    const order = await api<{
      free?: boolean; orderId?: string; amount?: number; keyId?: string;
      planSlug?: string; planName?: string;
    }>("/api/payments/plan-order", {
      method: "POST",
      body: JSON.stringify({ planSlug: plan.slug }),
    });
    if (!order.ok) {
      setBusyId(null);
      toast(order.error.message ?? "Could not start purchase", "error");
      return;
    }

    if (order.data.free) {
      setBusyId(null);
      toast("Plan activated", "success");
      router.refresh();
      return;
    }

    const ok = await loadRazorpay();
    if (!ok || !window.Razorpay) {
      setBusyId(null);
      toast("Could not load payment gateway", "error");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.data.keyId,
      amount: order.data.amount,
      currency: "INR",
      name: "8Rupia",
      description: order.data.planName,
      order_id: order.data.orderId,
      prefill: {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        contact: user.phone ?? undefined,
      },
      theme: { color: "#4f46e5" },
      handler: async (resp: any) => {
        const v = await api("/api/payments/plan-verify", {
          method: "POST",
          body: JSON.stringify({
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          }),
        });
        setBusyId(null);
        if (v.ok) {
          toast(`Welcome to ${plan.name} 🎉`, "success");
          router.refresh();
          router.push("/home");
        } else {
          toast(v.error.message ?? "Verification failed", "error");
        }
      },
      modal: {
        ondismiss: () => setBusyId(null),
      },
    });
    rzp.open();
  }

  return (
    <section className="container pt-12 pb-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">Pricing</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tight">
          Apni padhai ke liye sahi <span className="highlight-underline text-brand-600">plan chuno</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Free se start karo, jab feel ho upgrade kar lo. Sab plans bilingual, AI-powered aur cancel anytime.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No plans available right now. Check back soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((p) => (
            <article
              key={p.id}
              className={`paper-card paper-card-hover p-6 relative flex flex-col ${
                p.isHighlighted ? "ring-2 ring-brand-500 shadow-xl" : ""
              }`}
            >
              {p.isHighlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-brand-600 text-white rounded-full px-3 py-1 shadow-lg">
                  <Star className="h-3 w-3 fill-current" /> Most popular
                </span>
              )}
              <header>
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">{formatPrice(p)}</span>
                  {p.priceInPaise > 0 && (
                    <span className="text-sm text-muted-foreground">{durationLabel(p.durationDays)}</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Upgrades to <b>{p.targetRole}</b> for {p.durationDays >= 9999 ? "lifetime" : `${p.durationDays} days`}
                </p>
              </header>

              <ul className="mt-5 space-y-2 flex-1">
                {p.features.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Basic access only</li>
                ) : (
                  p.features.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{featureLabels[key] ?? key}</span>
                    </li>
                  ))
                )}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={p.isHighlighted ? "default" : "outline"}
                onClick={() => buy(p)}
                disabled={busyId === p.id}
              >
                {busyId === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : p.priceInPaise === 0 ? (
                  "Start free"
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Buy {p.name}
                  </>
                )}
              </Button>
            </article>
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Payments by Razorpay · Cancel anytime from Settings · GST included where applicable.
      </p>
    </section>
  );
}
