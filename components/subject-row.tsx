"use client";
import { motion } from "framer-motion";
import { Calculator, FlaskConical, Languages, Globe2, Brain, Landmark, Atom, Microscope } from "lucide-react";

const SUBJECTS = [
  { name: "Maths",      icon: Calculator,   color: "from-blue-500 to-cyan-500" },
  { name: "Science",    icon: FlaskConical, color: "from-emerald-500 to-teal-500" },
  { name: "Physics",    icon: Atom,         color: "from-sky-500 to-indigo-500" },
  { name: "Biology",    icon: Microscope,   color: "from-lime-500 to-emerald-500" },
  { name: "English",    icon: Languages,    color: "from-purple-500 to-fuchsia-500" },
  { name: "Hindi",      icon: Languages,    color: "from-orange-500 to-amber-500" },
  { name: "Reasoning",  icon: Brain,        color: "from-pink-500 to-rose-500" },
  { name: "GK",         icon: Globe2,       color: "from-yellow-500 to-orange-500" },
  { name: "Polity",     icon: Landmark,     color: "from-red-500 to-rose-600" },
];

export function SubjectRow() {
  return (
    <section className="container py-14">
      <div className="text-center max-w-xl mx-auto">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">Subjects covered</p>
        <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold tracking-tight">
          Har subject pe <span className="highlight-underline">drills + mocks</span>
        </h2>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
        {SUBJECTS.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="paper-card paper-card-hover flex items-center gap-2.5 px-4 py-2.5"
          >
            <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white shrink-0`}>
              <s.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{s.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
