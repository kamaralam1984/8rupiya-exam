"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus, LayoutDashboard, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { LangToggle } from "@/components/lang-toggle";
import { useUser } from "@/lib/use-user";

const NAV = [
  { href: "/exams", label: "Exams" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
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
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
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
                    className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                  >
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
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-500 to-accent text-white hover:opacity-90"
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
