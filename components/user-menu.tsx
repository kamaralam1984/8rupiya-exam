"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Flame, Trophy, LayoutDashboard, Brain, Calendar, Sparkles, Settings, Bookmark, TrendingUp } from "lucide-react";
import { useUser } from "@/lib/use-user";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export function UserMenu() {
  const { user, loading, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) return <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />;

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link href="/signin">
          <Button size="sm" variant="ghost" className="px-2 sm:px-3">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="px-2 sm:px-3">Sign up</Button>
        </Link>
      </div>
    );
  }

  const initial = (user.name?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full glass pl-1 pr-3 py-1 hover:bg-muted/50 transition"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-xs font-semibold">
          {initial}
        </span>
        <span className="hidden sm:flex items-center gap-1.5 text-xs">
          <Flame className="h-3 w-3 text-amber-500" /> {user.streak}
          <Trophy className="h-3 w-3 text-brand-500 ml-1" /> {user.xp}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-xl gradient-border shadow-2xl p-2 z-50">
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-sm font-medium truncate">{user.name ?? user.email ?? user.phone}</p>
            <p className="text-xs text-muted-foreground">XP {user.xp} · Streak {user.streak}d</p>
          </div>
          <MenuLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
          <MenuLink href="/progress" icon={TrendingUp} label="My Progress" onClick={() => setOpen(false)} />
          <MenuLink href="/doubt" icon={Brain} label="AI Doubt Solver" onClick={() => setOpen(false)} />
          <MenuLink href="/predict" icon={Sparkles} label="AI Predicted Test" onClick={() => setOpen(false)} />
          <MenuLink href="/planner" icon={Calendar} label="Study Planner" onClick={() => setOpen(false)} />
          <MenuLink href="/leaderboard" icon={Trophy} label="Leaderboard" onClick={() => setOpen(false)} />
          <MenuLink href="/bookmarks" icon={Bookmark} label="Bookmarks" onClick={() => setOpen(false)} />
          <MenuLink href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
          {user.role === "ADMIN" && (
            <MenuLink href="/admin" icon={User} label="Admin" onClick={() => setOpen(false)} />
          )}
          <button
            onClick={async () => {
              await api("/api/auth/me", { method: "DELETE" });
              setUser(null);
              setOpen(false);
              router.push("/");
              router.refresh();
            }}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-muted mt-1 border-t border-border/40"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}
