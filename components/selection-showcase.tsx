"use client";
import { motion } from "framer-motion";
import { Star, Trophy, Sparkles, Quote } from "lucide-react";

const TOPPERS = [
  { name: "Rahul Verma", exam: "NEET 2025", rank: "AIR 47", score: "705/720", gradient: "from-rose-500 to-pink-600" },
  { name: "Sneha Iyer", exam: "JEE Adv 2025", rank: "AIR 112", score: "298/360", gradient: "from-indigo-500 to-purple-600" },
  { name: "Akash Singh", exam: "SSC CGL 2024", rank: "AIR 8", score: "354/400", gradient: "from-cyan-500 to-blue-600" },
  { name: "Priya Sharma", exam: "UPSC 2024", rank: "AIR 84", score: "1023/2025", gradient: "from-emerald-500 to-teal-600" },
  { name: "Vikram Joshi", exam: "RRB NTPC", rank: "AIR 23", score: "94.2%", gradient: "from-amber-500 to-orange-600" },
  { name: "Ananya Gupta", exam: "CUET 2025", rank: "99.8 PCT", score: "Top 0.2%", gradient: "from-purple-500 to-fuchsia-600" },
];

const TESTIMONIALS = [
  {
    name: "Aman, NEET aspirant",
    place: "Patna, Bihar",
    text: "Sirf ₹8 mein full mock + AI analysis milta hai. Coaching ke 50,000 ke baad samjha — yahi chahiye tha shuru se.",
  },
  {
    name: "Neha, SSC aspirant",
    place: "Lucknow, UP",
    text: "Golu AI mentor ne meri pure routine sambhal li. Aaj kya padhna hai, kab break lena hai — sab plan readymade.",
  },
  {
    name: "Rohan, JEE aspirant",
    place: "Indore, MP",
    text: "Weakness radar ne dikhaya ki Trigonometry me 38% accuracy hai. 3 hafte mein 81% pe le aaya — selection pakka.",
  },
];

export function SelectionShowcase() {
  return (
    <section id="selections" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="aurora aurora-1 top-10 right-1/4 w-[480px] h-[480px] opacity-25" />
        <div className="aurora aurora-3 bottom-10 left-1/4 w-[420px] h-[420px] opacity-25" />
      </div>

      <div className="container">
        {/* Mega counter strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="neon-card p-8 md:p-10 mb-16 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"
        >
          <div className="text-center">
            <div className="ai-chip mx-auto mb-3">
              <Trophy className="h-3 w-3 text-amber-300" /> Selections that speak
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="ai-gradient-text">47,000+ selections</span> aur ginti jaari hai
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: "47,210+", l: "Total selections" },
              { v: "1,240+", l: "AIR < 100" },
              { v: "12.4L+", l: "Students enrolled" },
              { v: "₹8", l: "Ek mock test ki keemat" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-4xl md:text-5xl font-display font-bold ai-gradient-text-cyan">{s.v}</p>
                <p className="mt-1.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Topper cards */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-display text-3xl md:text-4xl font-bold">
            <span className="ai-gradient-text">2025 ke selections</span>
          </h3>
          <p className="mt-3 text-muted-foreground">Asli students, asli ranks, ek hi platform.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOPPERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="neon-card overflow-hidden group"
            >
              <div className={`relative h-32 bg-gradient-to-br ${t.gradient}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                <Trophy className="absolute top-4 right-4 h-6 w-6 text-white/80" />
                <div className="absolute -bottom-8 left-5 grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
              <div className="p-5 pt-10">
                <p className="font-bold text-lg">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.exam}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rank</p>
                    <p className="ai-gradient-text-cyan font-display font-bold text-xl">{t.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Score</p>
                    <p className="font-bold text-foreground">{t.score}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold">
              Students <span className="ai-gradient-text">kya kehte</span> hain
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((q, i) => (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="neon-card p-6"
              >
                <Quote className="h-7 w-7 text-purple-400/60" />
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">"{q.text}"</p>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.place}</p>
                  </div>
                  <div className="flex text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-300" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
