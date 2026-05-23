"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowUpRight, Sparkles } from "lucide-react";
import { NCERT, NCERT_CLASSES, ncertSubjectsByClass } from "@/lib/ncert";

export function NcertClient() {
  const [klass, setKlass] = useState<10 | 12>(10);
  const subjects = useMemo(() => ncertSubjectsByClass(klass), [klass]);
  const [subject, setSubject] = useState(subjects[0]);

  const chapters = useMemo(
    () => NCERT.filter((c) => c.klass === klass && c.subject === subject),
    [klass, subject],
  );

  return (
    <div className="space-y-6">
      <div className="neon-card p-5 flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {NCERT_CLASSES.map((k) => (
            <button
              key={k}
              onClick={() => { setKlass(k as 10 | 12); setSubject(ncertSubjectsByClass(k)[0]); }}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                klass === k ? "border-brand-500 bg-brand-500/10 text-foreground" : "border-border text-muted-foreground"
              }`}
            >
              Class {k}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-border mx-2" />
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                subject === s ? "border-purple-500/60 bg-purple-500/15 text-purple-200" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((c, i) => (
          <motion.div
            key={c.chapter}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="neon-card p-5"
          >
            <BookOpen className="h-5 w-5 text-brand-500" />
            <h3 className="mt-3 font-display font-bold">{c.chapter}</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {c.topics.map((t) => <li key={t}>• {t}</li>)}
            </ul>
            <Link
              href={`/doubt?prefill=${encodeURIComponent(`Class ${c.klass} NCERT — ${c.subject} — ${c.chapter}: `)}`}
              className="mt-4 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
            >
              <Sparkles className="h-3 w-3" /> Ask AI about this chapter <ArrowUpRight className="h-3 w-3" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
