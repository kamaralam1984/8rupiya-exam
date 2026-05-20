"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type OrderResp = {
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  testSetSlug?: string;
  alreadyUnlocked?: boolean;
};

export function RazorpayCheckout({
  testSetSlug, label = "Unlock for ₹8", onSuccess,
}: {
  testSetSlug: string;
  label?: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadScript(SCRIPT); }, []);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await api<OrderResp>("/api/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ testSetSlug }),
    });
    setLoading(false);
    if (!r.ok) {
      setError(r.error.message ?? r.error.code);
      return;
    }
    if (r.data.alreadyUnlocked) {
      onSuccess?.();
      return;
    }
    const ok = await loadScript(SCRIPT);
    if (!ok || !window.Razorpay) {
      setError("Could not load payment SDK");
      return;
    }
    const rzp = new window.Razorpay({
      key: r.data.keyId,
      amount: r.data.amount,
      currency: r.data.currency ?? "INR",
      order_id: r.data.orderId,
      name: "8Rupia",
      description: `Premium mock test unlock`,
      theme: { color: "#4f7cff" },
      handler: async (resp: any) => {
        const v = await api("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          }),
        });
        if (!v.ok) {
          setError(v.error.message ?? "Verification failed");
          return;
        }
        onSuccess?.();
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.on("payment.failed", (resp: any) => {
      setError(resp?.error?.description ?? "Payment failed");
    });
    rzp.open();
  }, [testSetSlug, onSuccess]);

  return (
    <div className="space-y-2">
      <Button onClick={start} disabled={loading} size="lg">
        {loading ? "Opening payment…" : label}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
