import Link from "next/link";
import { SITE } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Heart, BookOpenText } from "lucide-react";

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
    <footer className="mt-24 border-t border-border/40 bg-background/60 backdrop-blur">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Logo size="md" />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Bharat ke students ke liye AI-powered exam prep. Premium mock tests sirf ₹8 mein —
            chai se sasta, coaching se behtar.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] font-medium">
            <BookOpenText className="h-3.5 w-3.5 text-accent" />
            Built for every padhakku
          </div>
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
          <p className="inline-flex items-center gap-1">
            Made with <Heart className="inline h-3 w-3 text-accent fill-accent" /> in India · {SITE.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
