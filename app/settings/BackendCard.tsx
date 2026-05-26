"use client";
import { useState } from "react";

export function BackendCard() {
  const [open, setOpen] = useState(false);

  return (
    <section className="container max-w-xl pb-20">
      <div className="paper-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold">Backend Integration</h2>
            <p className="text-xs text-muted-foreground">
              Connect your admin panel via API Key &amp; Secret Token
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Connect
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <p className="font-semibold">Connect Backend</p>
            <button onClick={() => setOpen(false)} className="mt-4 text-sm underline">
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
