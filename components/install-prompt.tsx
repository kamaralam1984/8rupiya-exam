"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("8r_install_dismissed") === "1") {
      setHidden(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!evt || hidden) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl gradient-border p-3 pl-4 pr-3 flex items-center gap-3 shadow-2xl max-w-xs">
      <Download className="h-4 w-4 text-brand-500 shrink-0" />
      <p className="text-xs flex-1">Install 8Rupia for one-tap access</p>
      <Button
        size="sm"
        onClick={async () => {
          await evt.prompt();
          await evt.userChoice;
          setEvt(null);
        }}
      >
        Install
      </Button>
      <button
        onClick={() => { localStorage.setItem("8r_install_dismissed", "1"); setHidden(true); }}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
