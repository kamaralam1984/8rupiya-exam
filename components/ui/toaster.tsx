"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; message: string; kind: "info" | "success" | "error" };
type Ctx = (message: string, kind?: Toast["kind"]) => void;

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<Ctx>((message, kind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  // expose globally as window.__toast for non-React callers
  useEffect(() => {
    (window as any).__toast = push;
    return () => { delete (window as any).__toast; };
  }, [push]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.18 }}
              className={`glass rounded-xl px-4 py-3 gradient-border shadow-xl flex items-start gap-3 ${
                t.kind === "error" ? "text-red-500" :
                t.kind === "success" ? "text-emerald-500" : ""
              }`}
              role="status"
            >
              {t.kind === "error" ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                : t.kind === "success" ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                : <span className="h-4 w-4 mt-0.5 shrink-0 rounded-full bg-brand-500" />}
              <p className="text-sm leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // fallback for non-wrapped usage
    return (msg) => { if (typeof window !== "undefined" && (window as any).__toast) (window as any).__toast(msg); else console.log(msg); };
  }
  return ctx;
}
