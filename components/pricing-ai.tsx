"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Crown } from "lucide-react";

const PLANS = [
  {
    name: "₹8 Unlock",
    price: "₹8",
    sub: "per mock test",
    icon: Zap,
    chip: "MOST POPULAR",
    chipColor: "from-cyan-500 to-blue-600",
    features: [
      "1 premium full-length mock",
      "AI weakness analysis report",
      "Subject + chapter breakdown",
      "Hindi + English explanations",
    ],
    cta: "Unlock for ₹8",
    primary: false,
  },
  {
    name: "Monthly Pro",
    price: "₹199",
    sub: "per month",
    icon: Sparkles,
    chip: "BEST VALUE",
    chipColor: "from-purple-500 to-pink-600",
    features: [
      "Unlimited mocks + predicted sets",
      "Golu AI mentor — 24×7",
      "Live classes access",
      "Battle arena + leaderboards",
      "Daily AI study planner",
      "All exams covered",
    ],
    cta: "Go Pro",
    primary: true,
  },
  {
    name: "All-Year Elite",
    price: "₹1,499",
    sub: "12 months — saved 25%",
    icon: Crown,
    chip: "TOPPERS' CHOICE",
    chipColor: "from-amber-500 to-orange-600",
    features: [
      "Everything in Monthly Pro",
      "Personalized 1:1 mentor session",
      "Selection probability tracker",
      "Career predictor pro",
      "Offline downloads",
      "Priority doubt resolution",
    ],
    cta: "Get Elite",
    primary: false,
  },
];

export function PricingAI() {
  return (
    <section id="pricing" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-1 top-10 left-1/4 w-[420px] h-[420px] opacity-25" />
        <div className="aurora aurora-2 bottom-10 right-1/4 w-[420px] h-[420px] opacity-25" />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <div className="ai-chip mx-auto mb-4">
            <Sparkles className="h-3 w-3 text-purple-300" /> Pricing
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            India ka <span className="ai-gradient-text">sasta</span> AI exam platform
          </h2>
          <p className="mt-4 text-muted-foreground">
            ₹8 mein start karo. Pasand aaye to Pro lo. Coaching ke 50,000 ki bachat — guaranteed.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`neon-card p-7 relative ${
                p.primary ? "scale-105 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent" : ""
              }`}
            >
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold text-white bg-gradient-to-r ${p.chipColor} shadow-lg whitespace-nowrap`}>
                {p.chip}
              </span>

              <div className="flex items-center gap-3 mt-2">
                <span className="grid place-items-center h-11 w-11 rounded-xl glass-ai">
                  <p.icon className="h-5 w-5 text-purple-300" />
                </span>
                <h3 className="font-display font-bold text-xl">{p.name}</h3>
              </div>

              <div className="mt-6">
                <p className="font-display text-5xl font-bold ai-gradient-text">{p.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.sub}</p>
              </div>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/exams"
                className={`mt-7 block text-center ${p.primary ? "btn-ai" : "btn-ghost-ai"} w-full justify-center`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Razorpay secured payments • UPI / Card / NetBanking • 7-day refund
        </p>
      </div>
    </section>
  );
}
