"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FileText, Brain, IndianRupee, ClipboardList, Loader2, ShieldAlert, BookOpen, ToggleRight, SlidersHorizontal, Cpu } from "lucide-react";
import { api } from "@/lib/api-client";

type Stats = {
  users: number;
  attempts: number;
  questions: number;
  pdfs: number;
  payments: number;
  pendingApproval: number;
};

export function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await api<Stats>("/api/admin/stats");
      if (!r.ok) { setForbidden(true); return; }
      setStats(r.data);
    })();
  }, []);

  if (forbidden) {
    return (
      <section className="container py-16 max-w-md">
        <div className="glass rounded-2xl p-7 gradient-border">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
          <h1 className="mt-2 font-display text-xl font-bold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with an admin account. Promote a user to ADMIN in the database to access this panel.
          </p>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="container py-20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </section>
    );
  }

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-8">
        <p className="text-xs text-muted-foreground">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Control Center</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatBox icon={Users} label="Users" value={stats.users} />
        <StatBox icon={ClipboardList} label="Attempts" value={stats.attempts} />
        <StatBox icon={Brain} label="Questions" value={stats.questions} />
        <StatBox icon={FileText} label="PDFs" value={stats.pdfs} />
        <StatBox icon={IndianRupee} label="Payments" value={stats.payments} />
        <StatBox icon={ClipboardList} label="Pending Approval" value={stats.pendingApproval} accent />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Tile href="/admin/pdfs" icon={FileText} title="Upload PDFs" body="Send a PDF to the AI pipeline to auto-generate or extract MCQs." />
        <Tile href="/admin/questions" icon={Brain} title="Approve AI Questions" body={`${stats.pendingApproval} questions awaiting review.`} highlight={stats.pendingApproval > 0} />
        <Tile href="/admin/exams" icon={BookOpen} title="Manage Exams" body="Toggle which courses appear on the homepage and onboarding picker." />
        <Tile href="/admin/testsets" icon={ClipboardList} title="Manage Test Sets" body="Publish or unpublish individual mocks · flip free ↔ premium · edit price." />
        <Tile href="/admin/subjects" icon={Brain} title="Subjects & Splits" body="Combine or split parent subjects (e.g. Science → Physics + Chemistry + Biology)." />
        <Tile href="/admin/users" icon={Users} title="Manage Users" body="Create, edit, delete users · reset passwords · promote admins." />
        <Tile href="/admin/payments" icon={IndianRupee} title="Payments & Unlocks" body="View transactions and grant ₹8 unlocks manually." />
        <Tile href="/admin/plans" icon={IndianRupee} title="Subscription Plans" body="Create / edit student subscription tiers · price, duration, features included." />
        <Tile href="/admin/features" icon={SlidersHorizontal} title="Features & Plan" body="Feature flags on/off · paid/free · ₹8 plan duration (month/year/lifetime)." highlight />
        <Tile href="/admin/audit" icon={ToggleRight} title="Audit Log" body="Every admin action recorded with actor + target." />
        <Tile href="/admin/jobs" icon={Cpu} title="Background Jobs" body="PDF ingest, AI generate, predict jobs — status, failures, retries." />
      </div>
    </section>
  );
}

function StatBox({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 font-display text-2xl font-bold ${accent ? "gradient-text" : ""}`}>{value}</p>
    </div>
  );
}

function Tile({ href, icon: Icon, title, body, highlight }: { href: string; icon: any; title: string; body: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`block glass rounded-2xl p-6 gradient-border hover:-translate-y-0.5 transition ${
        highlight ? "ring-2 ring-brand-500/40" : ""
      }`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20">
        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
      </div>
      <h3 className="mt-3 font-display font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
