"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, Calendar, Users, ArrowUpRight, Sparkles } from "lucide-react";

type Batch = {
  name: string;
  exam: string;
  startsOn: string;
  seats: string;
  badge: string;
  gradient: string;
};

const BATCHES: Batch[] = [
  {
    name: "NEET 2026 Mahaul",
    exam: "NEET UG",
    startsOn: "Dec 1, 2026",
    seats: "240 seats",
    badge: "Flagship",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    name: "JEE Advanced Booster",
    exam: "JEE Adv",
    startsOn: "Jan 5, 2026",
    seats: "180 seats",
    badge: "Premium",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "SSC CGL Tier-1 Sprint",
    exam: "SSC CGL",
    startsOn: "Nov 25, 2026",
    seats: "Open",
    badge: "Fast track",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "UPSC GS Foundation",
    exam: "UPSC CSE",
    startsOn: "Feb 1, 2026",
    seats: "120 seats",
    badge: "Mentor-led",
    gradient: "from-emerald-500 to-teal-600",
  },
];

export function BatchLaunchSection() {
  return (
    <section id="batches" className="relative py-20 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <div className="ai-chip mb-4 mx-auto">
            <Rocket className="h-3 w-3 text-amber-300" /> New batches launching
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Fresh <span className="ai-gradient-text">batches</span>, AI-curated
          </h2>
          <p className="mt-3 text-muted-foreground">
            Limited seats, live faculty + AI tools — pre-register karke ₹999 ka discount lock kar lo.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BATCHES.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={`neon-card p-5 bg-gradient-to-br ${b.gradient}/15 to-transparent`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-gradient-to-r ${b.gradient} text-white shadow-lg`}>
                  {b.badge}
                </span>
                <span className="text-[10px] text-muted-foreground">{b.exam}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold leading-tight">{b.name}</h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3 text-cyan-300" /> Starts {b.startsOn}
                </p>
                <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3 w-3 text-purple-300" /> {b.seats}
                </p>
              </div>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
              >
                <Sparkles className="h-3 w-3" /> Pre-register <ArrowUpRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
