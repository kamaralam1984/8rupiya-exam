"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { StudentIllustration } from "@/components/student-illustration";

export function Hero() {
  const t = useT();
  return (
    <section className="relative">
      <div className="container relative pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase text-brand-600">
              Welcome to 8Rupia
            </span>

            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Learn. Grow.<br />
              Achieve{" "}
              <span className="text-brand-600 relative inline-block">
                Excellence.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  style={{ originX: 0 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-accent/70"
                />
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              {t("hero.sub")} India ka modern AI study platform — har exam ke liye calibrated mocks,
              AI doubt solver aur ₹8 per premium test.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/exams">
                <Button size="lg" className="group rounded-xl shadow-lg shadow-brand-500/25">
                  Explore Courses
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-xl group">
                  Learn More
                  <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-brand-500/10 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A","S","R","P"].map((c, i) => (
                  <span
                    key={c}
                    className={`grid h-9 w-9 place-items-center rounded-full border-2 border-background text-white text-xs font-semibold ${
                      ["bg-brand-600","bg-accent","bg-emerald-500","bg-pink-500"][i]
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-tight">
                <span className="font-semibold text-foreground">Join 20,000+ students</span>
                <br />learning with us
              </p>
            </div>

            {/* Hand-drawn scribble decoration */}
            <svg
              aria-hidden
              className="hidden lg:block absolute -right-4 top-32 w-20 h-20 text-brand-500/70"
              viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 80 Q 40 20, 78 40 Q 60 50, 70 70" />
              <path d="M62 64 L 72 70 L 66 80" />
            </svg>
          </motion.div>

          {/* RIGHT — illustration + floating stat cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <StudentIllustration className="max-w-[520px] mx-auto" />

            {/* Floating stat card — top */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute top-10 -left-2 sm:left-4 paper-card px-4 py-3 flex items-center gap-3 float-y"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">150+</p>
                <p className="text-[11px] text-muted-foreground mt-1">Expert Instructors</p>
              </div>
            </motion.div>

            {/* Floating stat card — bottom */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute bottom-12 -right-2 sm:right-4 paper-card px-4 py-3 flex items-center gap-3 float-y-slow"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">500+</p>
                <p className="text-[11px] text-muted-foreground mt-1">Online Courses</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
