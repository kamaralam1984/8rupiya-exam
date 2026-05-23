"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, X } from "lucide-react";
import { api } from "@/lib/api-client";

const DISMISS_KEY = "8r:push-dismissed";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushOptIn() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setShow(true), 12000);
    return () => clearTimeout(t);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { dismiss(); return; }
      const vapid = await api<{ publicKey: string }>("/api/push/vapid");
      if (!vapid.ok) { dismiss(); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.data.publicKey),
      });
      const json = sub.toJSON();
      await api("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });
      setShow(false);
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm neon-card p-4 bg-gradient-to-br from-purple-500/15 to-cyan-500/10">
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-purple-300 mt-0.5" />
        <div className="flex-1">
          <p className="font-display font-bold text-sm">Streak miss mat karo</p>
          <p className="mt-1 text-xs text-muted-foreground">Daily DPP reminder + live class alerts. Browser notifications on karo.</p>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={enable} disabled={busy} className="btn-ai !px-3 !py-1.5 text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} Enable
            </button>
            <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground">
              <BellOff className="inline h-3 w-3" /> Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Close" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
