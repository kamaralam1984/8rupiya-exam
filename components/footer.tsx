import Link from "next/link";
import { SITE } from "@/lib/utils";
import { Logo } from "@/components/logo";

const COLS = [
  {
    title: "Platform",
    links: [
      { href: "/exams", label: "All Exams" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-background/50 backdrop-blur">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Logo size="md" />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-powered exam preparation for Indian students. Unlock premium mock tests for just ₹8.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40">
        <div className="container py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Made in India · {SITE.domain}</p>
        </div>
      </div>
    </footer>
  );
}
