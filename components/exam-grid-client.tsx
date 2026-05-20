"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Exam } from "@/lib/exams";
import { ArrowUpRight, Star, BookMarked } from "lucide-react";
import { ExamLogo } from "@/components/exam-logo";

// Deterministic "rating" + lesson count derived from the slug so cards stay stable
// across renders without needing a DB column.
function fakeMetrics(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const rating = 4.4 + ((hash % 60) / 100); // 4.40 – 4.99
  const learners = 1000 + (hash % 4000);
  const lessons = 8 + (hash % 18); // 8 – 25
  return {
    rating: rating.toFixed(1),
    learnersK: (learners / 1000).toFixed(1) + "k",
    lessons,
  };
}

export function ExamGridClient({ items }: { items: Exam[] }) {
  return (
    <section className="container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">Popular Courses</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
            Har major Indian exam ke liye{" "}
            <span className="highlight-underline text-brand-600">calibrated mocks</span>
          </h2>
        </div>
        <Link
          href="/exams"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View All Courses
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </motion.div>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No courses are currently active.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((e, i) => {
            const m = fakeMetrics(e.slug);
            return (
              <motion.div
                key={e.slug}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
              >
                <Link href={`/exams/${e.slug}`} className="group block h-full">
                  <article className="paper-card paper-card-hover h-full overflow-hidden flex flex-col">
                    {/* Top image area — logo on gradient backdrop, matches EduLearn course-card thumbnail */}
                    <div
                      className={`relative aspect-[16/10] bg-gradient-to-br ${e.color} flex items-center justify-center overflow-hidden`}
                    >
                      <ExamLogo
                        icon={e.icon}
                        color={e.color}
                        logoUrl={e.logoUrl}
                        alt={`${e.name} logo`}
                        size="lg"
                        className="!h-20 !w-20 ring-2 ring-white/60 shadow-lg"
                      />
                      {/* highlight chip badge */}
                      {e.highlight && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-brand-700 rounded-full px-2 py-0.5">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      <span className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600 bg-brand-500/10 rounded-full px-2 py-0.5">
                        {e.subjects[0] ?? "Exam"}
                      </span>
                      <h3 className="mt-2 font-display text-base font-semibold leading-tight line-clamp-2">
                        {e.name} — {e.short}
                      </h3>
                      <div className="mt-auto pt-4 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {m.rating} <span className="text-muted-foreground font-normal">({m.learnersK})</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <BookMarked className="h-3.5 w-3.5" />
                          {m.lessons} lessons
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{e.questions} Qs · {e.duration}</span>
                        <span className="font-semibold text-accent">₹8 unlock</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
