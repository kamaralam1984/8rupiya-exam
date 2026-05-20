"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Bookmark as BookmarkIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Row = {
  id: string;
  kind: string;
  label: string | null;
  payload: any;
  createdAt: string;
};

export function BookmarksView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [needAuth, setNeedAuth] = useState(false);
  const toast = useToast();

  async function load() {
    const r = await api<Row[]>("/api/bookmarks");
    if (!r.ok) {
      if (r.error.code === "UNAUTHENTICATED") setNeedAuth(true);
      return;
    }
    setRows(r.data);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    const r = await api(`/api/bookmarks?id=${id}`, { method: "DELETE" });
    if (r.ok) { setRows((rows ?? []).filter((x) => x.id !== id)); toast("Removed", "success"); }
  }

  if (needAuth) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <h1 className="font-display text-xl font-bold">Sign in to see bookmarks</h1>
          <Link href="/signin?next=/bookmarks" className="mt-4 inline-block"><Button>Sign in</Button></Link>
        </div>
      </section>
    );
  }

  if (!rows) {
    return <section className="container py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></section>;
  }

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6 flex items-center gap-3">
        <BookmarkIcon className="h-6 w-6 text-brand-500" />
        <h1 className="font-display text-3xl font-bold tracking-tight">Bookmarks</h1>
      </header>

      {rows.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center gradient-border">
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Bookmark notes, flashcards or predicted questions to revisit later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4 gradient-border flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20 shrink-0">
                <BookmarkIcon className="h-4 w-4 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{r.kind}</p>
                <p className="font-medium truncate">{r.label ?? r.payload?.topic ?? r.payload?.title ?? "Saved item"}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => del(r.id)}
                className="text-muted-foreground hover:text-red-500 transition"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
