"use client";
import { motion } from "framer-motion";
import { UserPlus, BookOpen, ClipboardCheck } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: UserPlus,
    title: "1. Sign up free",
    body: "30 seconds mein account banao. Phone ya email, dono se chalega. Koi card nahin chahiye.",
    color: "from-brand-500 to-brand-600",
  },
  {
    icon: BookOpen,
    title: "2. Apna exam chuno",
    body: "CTET, NEET, SSC, Railway, Banking ya 6 aur tracks mein se. Personalized dashboard tayyar.",
    color: "from-accent to-saffron-600",
  },
  {
    icon: ClipboardCheck,
    title: "3. Sirf ₹8 mein full mock",
    body: "Pura premium test + AI analytics + weakness report. Chai se bhi sasta. No upsell.",
    color: "from-emerald-500 to-teal-500",
  },
];

export function HowItWorks() {
  return (
    <section className="container py-16 md:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">How it works</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
          Padhai shuru karna <span className="highlight-underline">teen step</span> mein
        </h2>
        <p className="mt-3 text-muted-foreground">
          Lambi sign-up forms nahin, koi hidden charges nahin — bas exam chuno aur shuru karo.
        </p>
      </div>

      <ol className="mt-12 grid md:grid-cols-3 gap-5 md:gap-6 relative">
        {/* connecting dotted line between cards on desktop */}
        <div aria-hidden className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px border-t-2 border-dashed border-border/70" />
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative paper-card paper-card-hover p-6"
          >
            <div className={`inline-grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition"
        >
          Free account banao — first test ₹8
        </Link>
      </div>
    </section>
  );
}
