"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus, LayoutDashboard, User, BookOpenText, IndianRupee, Newspaper, Info } from "lucide-react";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { LangToggle } from "@/components/lang-toggle";
import { useUser } from "@/lib/use-user";

const NAV = [
  { href: "/exams",   label: "Exams",   icon: BookOpenText },
  { href: "/pricing", label: "Pricing", icon: IndianRupee },
  { href: "/blog",    label: "Blog",    icon: Newspaper },
  { href: "/about",   label: "About",   icon: Info },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border/40">
        <div className="container flex h-16 items-center justify-between gap-2">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                <n.icon className="h-4 w-4 text-accent/80" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LangToggle />
            <ThemeToggle />
            <UserMenu />
            <button
              className="md:hidden p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/40"
            >
              <div className="container py-3 flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={close}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                  >
                    <n.icon className="h-4 w-4 text-accent/80" />
                    {n.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-border/40" />
                {user ? (
                  <>
                    <Link
                      href="/home"
                      onClick={close}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <LayoutDashboard className="h-4 w-4" /> My Home
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={close}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <LogIn className="h-4 w-4" /> Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={close}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"
                    >
                      <UserPlus className="h-4 w-4" /> Sign up — Start ₹8 Test
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
