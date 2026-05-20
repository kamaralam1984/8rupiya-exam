"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

type Row = { id: string; action: string; target: string | null; meta: any; createdAt: string; user: { email: string | null; name: string | null } | null };

export function AuditView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { (async () => { const r = await api<Row[]>("/api/admin/audit"); if (r.ok) setRows(r.data); })(); }, []);
  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Audit Log</h1>
      {!rows ? <Loader2 className="mt-8 h-5 w-5 animate-spin text-brand-500" /> : (
        <ol className="mt-6 space-y-1 text-sm font-mono">
          {rows.map((r) => (
            <li key={r.id} className="glass rounded-md px-3 py-2">
              <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
              <span className="ml-2 text-brand-500">{r.action}</span>
              {r.target && <span className="ml-2 text-muted-foreground">target={r.target}</span>}
              {r.user && <span className="ml-2 text-muted-foreground">by {r.user.email ?? r.user.name}</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
