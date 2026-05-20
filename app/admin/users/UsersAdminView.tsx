"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Search, Shield, ShieldOff, Trash2, Edit, KeyRound, Plus, X, Save, Eye, EyeOff, Crown, CalendarOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Sub = { id: string; plan: string; startsAt: string; endsAt: string } | null;

type U = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: "STUDENT" | "ADMIN";
  xp: number;
  streak: number;
  createdAt: string;
  emailVerifiedAt: string | null;
  language?: string;
  examTrack?: string | null;
  subscription?: Sub;
};

export function UsersAdminView() {
  const [users, setUsers] = useState<U[] | null>(null);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetForId, setResetForId] = useState<string | null>(null);
  const toast = useToast();

  async function load() {
    const r = await api<U[]>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (r.ok) setUsers(r.data);
    else toast(r.error.message ?? "Failed to load", "error");
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function setRole(u: U, role: "STUDENT" | "ADMIN") {
    const r = await api(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
    if (r.ok) { toast(`Set ${u.email ?? u.id} → ${role}`, "success"); load(); }
    else toast(r.error.message ?? "Failed", "error");
  }

  async function remove(u: U) {
    if (!confirm(`Delete ${u.email ?? u.phone ?? u.id}? This cannot be undone.`)) return;
    const r = await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (r.ok) { toast(`Deleted ${u.email ?? u.id}`, "success"); load(); }
    else toast(r.error.message ?? "Delete failed", "error");
  }

  return (
    <section className="container pt-10 pb-20">
      <Link href="/admin" className="text-xs text-muted-foreground hover:underline">← Admin home</Link>
      <div className="mt-1 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Create user
        </Button>
      </div>

      <form className="mt-5 flex gap-2 max-w-md" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, phone, name" />
        <Button type="submit"><Search className="h-4 w-4" /></Button>
      </form>

      {creating && (
        <CreateUserCard onDone={(ok) => { setCreating(false); if (ok) load(); }} />
      )}

      {!users ? (
        <div className="mt-8"><Loader2 className="h-5 w-5 animate-spin text-brand-500" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users match.</p>
          )}
          {users.map((u) => (
            <div key={u.id} className="glass rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-xs font-semibold">
                  {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name ?? u.email ?? u.phone ?? u.id}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[u.email, u.phone].filter(Boolean).join(" · ")} · XP {u.xp} · {u.streak}d
                    {u.examTrack ? ` · track=${u.examTrack}` : ""}
                  </p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded ${u.role === "ADMIN" ? "bg-brand-500/20 text-brand-500" : "bg-muted text-muted-foreground"}`}>
                  {u.role}
                </span>
                {u.subscription && (
                  <span
                    className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                    title={`Ends ${new Date(u.subscription.endsAt).toLocaleDateString()}`}
                  >
                    <Crown className="h-3 w-3" /> {u.subscription.plan}
                  </span>
                )}
                <Button size="sm" variant="ghost" title="Edit" onClick={() => setEditingId(editingId === u.id ? null : u.id)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" title="Reset password" onClick={() => setResetForId(resetForId === u.id ? null : u.id)}>
                  <KeyRound className="h-3.5 w-3.5" />
                </Button>
                {u.role === "ADMIN" ? (
                  <Button size="sm" variant="outline" onClick={() => setRole(u, "STUDENT")}>
                    <ShieldOff className="h-3.5 w-3.5" /> Demote
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setRole(u, "ADMIN")}>
                    <Shield className="h-3.5 w-3.5" /> Promote
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" title="Delete" onClick={() => remove(u)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {editingId === u.id && (
                <EditUserForm user={u} onDone={(ok) => { setEditingId(null); if (ok) load(); }} />
              )}

              {resetForId === u.id && (
                <ResetPasswordForm userId={u.id} onDone={() => setResetForId(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CreateUserCard({ onDone }: { onDone: (ok: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email && !phone) { toast("email or phone required", "error"); return; }
    if (password.length < 8) { toast("password ≥ 8 chars", "error"); return; }
    setBusy(true);
    const r = await api("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: email || undefined,
        phone: phone || undefined,
        name: name || undefined,
        password,
        role,
      }),
    });
    setBusy(false);
    if (r.ok) { toast("User created", "success"); onDone(true); }
    else toast(r.error.message ?? "Create failed", "error");
  }

  return (
    <form onSubmit={submit} className="mt-4 glass rounded-2xl p-5 gradient-border grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2 flex items-center justify-between">
        <h2 className="font-display font-semibold">New user</h2>
        <button type="button" onClick={() => onDone(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Email</span>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Phone</span>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Password (min 8 chars)</span>
        <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
          <option value="STUDENT">STUDENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create
        </Button>
      </div>
    </form>
  );
}

function EditUserForm({ user, onDone }: { user: U; onDone: (ok: boolean) => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [language, setLanguage] = useState((user.language as "en" | "hi") ?? "en");
  const [examTrack, setExamTrack] = useState(user.examTrack ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password && password.length < 8) {
      toast("Password kam se kam 8 chars ka hona chahiye", "error");
      return;
    }
    setBusy(true);
    const payload: Record<string, unknown> = {
      name: name || null,
      email: email || null,
      phone: phone || null,
      language,
      examTrack: examTrack || null,
    };
    if (password) payload.password = password;

    const r = await api(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (r.ok) {
      toast(password ? "Saved + password updated" : "Saved", "success");
      setPassword("");
      onDone(true);
    } else {
      toast(r.error.message ?? "Update failed", "error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-t border-border/40 pt-3 grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <SubscriptionPanel user={user} onChanged={() => onDone(true)} />
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Email</span>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Phone</span>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Language</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Exam track slug</span>
        <Input value={examTrack} onChange={(e) => setExamTrack(e.target.value)} placeholder="ctet, ssc, railway…" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <KeyRound className="h-3 w-3" /> New password
          <span className="text-[10px] text-muted-foreground/70">(khaali = no change)</span>
        </span>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars"
            autoComplete="new-password"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      <div className="sm:col-span-2 flex items-center justify-between gap-2 flex-wrap">
        {password && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <KeyRound className="h-3 w-3" /> Password change save ke saath update hoga
          </p>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </Button>
        </div>
      </div>
    </form>
  );
}

function SubscriptionPanel({ user, onChanged }: { user: U; onChanged: () => void }) {
  const sub = user.subscription;
  const [busy, setBusy] = useState<"grant" | "revoke" | null>(null);
  const [plan, setPlan] = useState<"DEFAULT" | "MONTH" | "YEAR" | "LIFETIME">("DEFAULT");
  const toast = useToast();

  async function grant() {
    setBusy("grant");
    const body: Record<string, unknown> = { userId: user.id };
    if (plan !== "DEFAULT") body.plan = plan;
    const r = await api("/api/admin/subscriptions/grant", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (r.ok) { toast("Subscription granted", "success"); onChanged(); }
    else toast(r.error.message ?? "Grant failed", "error");
  }

  async function revoke() {
    if (!confirm("Revoke this user's active subscription?")) return;
    setBusy("revoke");
    const r = await api("/api/admin/subscriptions/grant", {
      method: "DELETE",
      body: JSON.stringify({ userId: user.id }),
    });
    setBusy(null);
    if (r.ok) { toast("Subscription revoked", "success"); onChanged(); }
    else toast(r.error.message ?? "Revoke failed", "error");
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="font-medium">Subscription</span>
          {sub ? (
            <span className="text-xs text-muted-foreground">
              · <b className="text-amber-300">{sub.plan}</b> · ends {new Date(sub.endsAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">· No active subscription</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as any)}
          className="bg-background border border-border rounded-md px-2 py-1.5 text-xs"
        >
          <option value="DEFAULT">Default (admin setting)</option>
          <option value="MONTH">1 month (30 din)</option>
          <option value="YEAR">1 year (365 din)</option>
          <option value="LIFETIME">Lifetime</option>
        </select>
        <Button type="button" size="sm" disabled={busy !== null} onClick={grant}>
          {busy === "grant" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
          {sub ? "Re-grant / Extend" : "Grant"}
        </Button>
        {sub && (
          <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={revoke}>
            {busy === "revoke" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarOff className="h-3.5 w-3.5" />}
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}

function ResetPasswordForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast("min 8 chars", "error"); return; }
    setBusy(true);
    const r = await api(`/api/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (r.ok) { toast("Password reset", "success"); onDone(); }
    else toast(r.error.message ?? "Reset failed", "error");
  }
  return (
    <form onSubmit={submit} className="mt-3 border-t border-border/40 pt-3 flex gap-2 items-end">
      <label className="block flex-1">
        <span className="text-xs text-muted-foreground">New password (min 8)</span>
        <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Reset
      </Button>
      <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
    </form>
  );
}
