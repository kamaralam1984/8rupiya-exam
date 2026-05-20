"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

type T = { name: string; exam: string; quote: string; initials: string; tone: string };

const REVIEWS: T[] = [
  {
    name: "Priya Sharma",
    exam: "CTET aspirant · Lucknow",
    quote:
      "AI doubt solver ne meri pedagogy ki sabhi confusion ek week mein clear kar di. Aur ₹8 mein full mock — bachat aur quality dono.",
    initials: "PS",
    tone: "from-brand-500 to-brand-700",
  },
  {
    name: "Rahul Verma",
    exam: "NEET 2026 dropper · Patna",
    quote:
      "Weakness report dekh ke samajh aaya ki Organic mein kahan time waste ho raha tha. Predict test 78% accuracy par jaa pohncha.",
    initials: "RV",
    tone: "from-accent to-saffron-600",
  },
  {
    name: "Aman Singh",
    exam: "SSC CGL · Patna",
    quote:
      "Bilingual switch ek-tap. Quant Hindi mein, English section English mein — koi context lose nahin hota. Daily streak addictive hai.",
    initials: "AS",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    name: "Sneha Iyer",
    exam: "Class 10 CBSE · Bengaluru",
    quote:
      "Library mein NCERT Science kholti hoon, side mein AI panel se questions puchti hoon. Tuition se sasta aur tezz.",
    initials: "SI",
    tone: "from-pink-500 to-rose-600",
  },
];

export function Testimonials() {
  return (
    <section className="container py-16 md:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">Students ki awaaz</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
          Real students, <span className="highlight-underline">real progress</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Roz ke users jo apne exam pattern par calibrated test dete hain aur dashboard se padhai plan karte hain.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REVIEWS.map((r, i) => (
          <motion.figure
            key={r.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="paper-card paper-card-hover p-5 flex flex-col gap-3"
          >
            <Quote className="h-5 w-5 text-accent/70" />
            <blockquote className="text-sm leading-relaxed text-foreground/90">{r.quote}</blockquote>
            <figcaption className="mt-auto pt-3 border-t border-border/60 flex items-center gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-white text-xs font-semibold bg-gradient-to-br ${r.tone}`}>
                {r.initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{r.exam}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
