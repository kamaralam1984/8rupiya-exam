import type { Metadata } from "next";
import Link from "next/link";
import { Star, GraduationCap, Sparkles, Crown, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Faculty — Top Educators",
  description:
    "Meet the educators behind 8Rupia — NEET, JEE, SSC, UPSC and Banking specialists with decades of selection experience.",
  alternates: { canonical: "/teachers" },
};

type Faculty = {
  name: string;
  subject: string;
  exam: string;
  bio: string;
  years: number;
  selections: number;
  avatar: string;
  gradient: string;
  badge?: string;
};

const FACULTY: Faculty[] = [
  { name: "Dr. Anjali Sharma", subject: "Biology", exam: "NEET", years: 18, selections: 2300, gradient: "from-emerald-500 to-teal-600", avatar: "🧬", badge: "AIIMS alumna", bio: "Genetics aur cell biology specialist — Maharashtra HSC topper coach." },
  { name: "Rohit Goyal", subject: "Mathematics", exam: "JEE Adv", years: 15, selections: 1840, gradient: "from-indigo-500 to-purple-600", avatar: "📐", badge: "IIT Delhi", bio: "Calculus + coordinate geometry — proof-based teaching, real exam shortcuts." },
  { name: "Priya Singh", subject: "Quantitative Aptitude", exam: "SSC / Banking", years: 12, selections: 4200, gradient: "from-cyan-500 to-blue-600", avatar: "🧮", bio: "Speed maths queen — 2 second tricks for SSC CGL aur IBPS PO." },
  { name: "Arjun Mehta", subject: "Polity & Governance", exam: "UPSC", years: 14, selections: 480, gradient: "from-amber-500 to-orange-600", avatar: "🏛️", badge: "IRS officer", bio: "Constitution, IR aur ethics — UPSC mains answer-writing master." },
  { name: "Dr. Vikram Joshi", subject: "Physics", exam: "JEE / NEET", years: 22, selections: 3100, gradient: "from-rose-500 to-pink-600", avatar: "⚛️", badge: "PhD IIT-B", bio: "Mechanics, EMI, modern physics — concept-first, formula-second." },
  { name: "Neha Iyer", subject: "Chemistry", exam: "NEET", years: 10, selections: 1620, gradient: "from-purple-500 to-fuchsia-600", avatar: "🧪", bio: "Organic + inorganic — NCERT diff drills aur named reactions mastery." },
  { name: "Akash Kumar", subject: "General Studies", exam: "Railway / SSC", years: 9, selections: 5400, gradient: "from-violet-500 to-indigo-600", avatar: "📚", bio: "GK + reasoning + current affairs — 1 hour daily session." },
  { name: "Megha Bose", subject: "English & Reasoning", exam: "Banking / CUET", years: 11, selections: 2700, gradient: "from-yellow-500 to-amber-600", avatar: "✍️", bio: "Reading comprehension aur error spotting — 99 percentile coach." },
];

export default function TeachersPage() {
  return (
    <section className="container pt-10 pb-20 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Our faculty</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Top <span className="ai-gradient-text">educators</span>, AI-augmented
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Har subject ke India's top teachers — selection record verified. AI tum jaise students
          ke saath unka curriculum personalize karta hai.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FACULTY.map((f) => (
          <div key={f.name} className="neon-card p-6">
            <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-4xl`}>
              {f.avatar}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{f.name}</h3>
              {f.badge && <span className="ai-chip text-[10px]"><Crown className="h-3 w-3 text-amber-300" /> {f.badge}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{f.subject} · {f.exam}</p>
            <p className="mt-3 text-sm leading-relaxed">{f.bio}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-muted/40 px-2 py-1.5">
                <p className="text-muted-foreground">Years</p>
                <p className="font-display font-bold ai-gradient-text-cyan">{f.years}+</p>
              </div>
              <div className="rounded-md bg-muted/40 px-2 py-1.5">
                <p className="text-muted-foreground">Selections</p>
                <p className="font-display font-bold ai-gradient-text-cyan">{f.selections.toLocaleString("en-IN")}+</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-amber-300">
              <Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-muted-foreground ml-1">4.9 / 5 from students</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 neon-card p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 text-center">
        <GraduationCap className="h-7 w-7 mx-auto text-purple-300" />
        <h2 className="mt-3 font-display text-2xl font-bold">Want a 1-on-1 session?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Pro Plus members get 2 mentor calls/month. Get matched to a faculty for your weak subject.</p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Link href="/pricing" className="btn-ai"><Sparkles className="h-4 w-4" /> Upgrade for mentor calls</Link>
          <Link href="/community" className="btn-ghost-ai">Join study rooms <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </section>
  );
}
