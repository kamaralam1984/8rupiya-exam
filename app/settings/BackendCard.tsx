"use client";
import { useState } from "react";
import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectBackend } from "@/components/connect-backend";
import { useToast } from "@/components/ui/toaster";

export function BackendCard() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <section className="container max-w-xl pb-20">
      <div className="paper-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-500">
              <Plug className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display font-semibold">Backend Integration</h2>
              <p className="text-xs text-muted-foreground">
                Connect your admin panel via API Key &amp; Secret Token
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Connect
          </Button>
        </div>
      </div>

      <ConnectBackend
        open={open}
        onClose={() => setOpen(false)}
        onConnected={() => {
          setOpen(false);
          toast("Backend connected successfully.", "success");
        }}
      />
    </section>
  );
}
