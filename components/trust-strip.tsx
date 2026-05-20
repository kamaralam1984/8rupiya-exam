"use client";
import { motion } from "framer-motion";
import { BookOpenText, PlayCircle, BadgeCheck, Users } from "lucide-react";

const ITEMS = [
  {
    icon: BookOpenText,
    title: "Expert Instructors",
    body: "AI + India ke top mentors ke saath calibrated learning paths.",
    bg: "bg-brand-500/10",
    color: "text-brand-600",
  },
  {
    icon: PlayCircle,
    title: "Flexible Learning",
    body: "Apni speed se padho — phone, tablet, kahin bhi, kabhi bhi.",
    bg: "bg-emerald-500/10",
    color: "text-emerald-600",
  },
  {
    icon: BadgeCheck,
    title: "Certification",
    body: "Mock series complete karo aur progress certificates earn karo.",
    bg: "bg-accent/15",
    color: "text-accent",
  },
  {
    icon: Users,
    title: "Community Support",
    body: "Lakhs of aspirants ke saath doubts solve karo aur grow karo.",
    bg: "bg-fuchsia-500/10",
    color: "text-fuchsia-600",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Why students choose 8Rupia" className="container -mt-2 md:-mt-6 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="paper-card p-5 md:p-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-2"
      >
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-start gap-3 lg:px-3"
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${it.bg} ${it.color}`}>
              <it.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{it.title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">{it.body}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
