"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Exam } from "@/lib/exams";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BookOpen } from "lucide-react";

export function ExamGridClient({ items }: { items: Exam[] }) {
  return (
    <section className="container py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Prepare for <span className="gradient-text">every major exam</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Topic-wise drills, full-length mocks, previous-year sets and AI prediction tests across
          India&apos;s most popular competitive and academic exams.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No exams are currently active. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((e, i) => (
            <motion.div
              key={e.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link href={`/exams/${e.slug}`} className="group block h-full">
                <Card className="h-full gradient-border group-hover:-translate-y-0.5 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20">
                        <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                    <CardTitle className="mt-3">{e.name}</CardTitle>
                    <CardDescription>{e.short}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {e.subjects.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{e.questions} questions · {e.duration}</span>
                      <span className="font-medium text-brand-600 dark:text-brand-400">₹8 unlock</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
