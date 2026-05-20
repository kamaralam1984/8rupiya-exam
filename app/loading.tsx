import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container py-24 grid place-items-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
