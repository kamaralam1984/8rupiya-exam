import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="container py-20 max-w-md">
      <div className="glass rounded-2xl p-7 gradient-border text-center">
        <WifiOff className="h-8 w-8 mx-auto text-amber-500" />
        <h1 className="mt-3 font-display text-2xl font-bold">You're offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reconnect to load fresh tests. Previously visited pages may still work.
        </p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Retry home</Button>
        </Link>
      </div>
    </section>
  );
}
