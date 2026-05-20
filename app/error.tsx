"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="container py-24 max-w-md">
      <div className="glass rounded-2xl p-7 gradient-border text-center">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
        <h1 className="mt-3 font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The team has been notified. Try again in a moment.
        </p>
        {error.digest && (
          <p className="mt-2 text-[10px] font-mono text-muted-foreground">ref: {error.digest}</p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/"><Button variant="outline">Go home</Button></Link>
        </div>
      </div>
    </div>
  );
}
