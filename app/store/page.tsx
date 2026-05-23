import type { Metadata } from "next";
import Link from "next/link";
import { Book, Sparkles, IndianRupee, ShoppingBag, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "8Rupia Store — Books & Material",
  description:
    "Curated study material, mock-test workbooks and PYQ collections for NEET, JEE, SSC, Banking, UPSC and more.",
  alternates: { canonical: "/store" },
};

type Book = {
  title: string;
  exam: string;
  type: string;
  pages: number;
  rating: number;
  price: number;
  mrp: number;
  gradient: string;
  badge?: string;
};

const BOOKS: Book[] = [
  { title: "NEET PYQ Decoded — Biology", exam: "NEET", type: "PYQ + Solutions", pages: 540, rating: 4.8, price: 299, mrp: 599, gradient: "from-emerald-500 to-teal-600", badge: "Bestseller" },
  { title: "JEE Main 22 Year PYQ", exam: "JEE", type: "PYQ Book", pages: 720, rating: 4.7, price: 349, mrp: 699, gradient: "from-indigo-500 to-purple-600" },
  { title: "SSC CGL Mathematics — Speed Tricks", exam: "SSC", type: "Concept + Practice", pages: 410, rating: 4.6, price: 249, mrp: 499, gradient: "from-cyan-500 to-blue-600" },
  { title: "Banking Reasoning Workbook", exam: "IBPS/SBI", type: "Sectional Drill", pages: 320, rating: 4.5, price: 199, mrp: 399, gradient: "from-amber-500 to-orange-600" },
  { title: "UPSC GS Polity — One Shot", exam: "UPSC", type: "Notes + Mind Maps", pages: 280, rating: 4.7, price: 299, mrp: 549, gradient: "from-rose-500 to-pink-600" },
  { title: "CUET English & GK Combo", exam: "CUET", type: "Practice Sets", pages: 360, rating: 4.4, price: 249, mrp: 449, gradient: "from-purple-500 to-fuchsia-600" },
  { title: "CTET Paper 1 — All-in-One", exam: "CTET", type: "Theory + Mocks", pages: 480, rating: 4.6, price: 299, mrp: 549, gradient: "from-violet-500 to-indigo-600", badge: "New" },
  { title: "RRB NTPC Speed Booster", exam: "Railway", type: "Drill + PYQ", pages: 340, rating: 4.5, price: 229, mrp: 399, gradient: "from-yellow-500 to-amber-600" },
];

export default function StorePage() {
  return (
    <section className="container pt-10 pb-20 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">Books & material</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          8Rupia <span className="ai-gradient-text">Store</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Selected workbooks aur PYQ collections — flat 40-50% off, premium subscribers ko free shipping.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BOOKS.map((b) => (
          <div key={b.title} className="neon-card p-5 flex flex-col">
            <div className={`aspect-[3/4] rounded-lg bg-gradient-to-br ${b.gradient} p-4 flex flex-col justify-between`}>
              <Book className="h-7 w-7 text-white/90" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/70">{b.exam}</p>
                <p className="mt-1 text-sm font-display font-bold text-white leading-tight line-clamp-3">{b.title}</p>
              </div>
            </div>
            <div className="mt-4 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.type}</span>
                <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-current" /> {b.rating}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{b.pages} pages</p>
              {b.badge && <span className="mt-2 inline-block ai-chip">{b.badge}</span>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold ai-gradient-text-cyan">₹{b.price}</p>
                <p className="text-xs text-muted-foreground line-through">₹{b.mrp}</p>
              </div>
              <button className="btn-ghost-ai !px-3 !py-1.5 text-xs">
                <ShoppingBag className="h-3.5 w-3.5" /> Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 neon-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/5 text-center">
        <Sparkles className="h-7 w-7 mx-auto text-purple-300" />
        <h2 className="mt-3 font-display text-2xl font-bold">Pro members get all books at <span className="ai-gradient-text">50% off</span></h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Plus free shipping pan-India, and ₹50 wallet cashback on every order.
        </p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Link href="/pricing" className="btn-ai"><IndianRupee className="h-4 w-4" /> Go Pro</Link>
          <Link href="/exams" className="btn-ghost-ai">Browse Exams</Link>
        </div>
      </div>
    </section>
  );
}
