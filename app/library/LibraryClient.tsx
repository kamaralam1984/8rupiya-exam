"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, FileText, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";

type Book = {
  id: string;
  filename: string;
  title: string;
  subjectSlug: string | null;
  pageCount: number | null;
  fileSize: number | null;
  status: string;
  createdAt: string;
};

function humanSize(bytes: number | null) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function LibraryClient() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api<Book[]>("/api/library");
      if (r.ok) setBooks(r.data);
      else setErr(r.error.message ?? "Failed to load library");
    })();
  }, []);

  return (
    <section className="container pt-10 pb-20">
      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-500 uppercase">
          Class 10 · Beta
        </p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gradient-text">Read</span> books, ask AI when you&apos;re stuck
        </h1>
        <p className="mt-3 text-muted-foreground">
          Open any book below to read inside the browser. The AI doubt panel is right next to the
          page — paste a confusing line, type a question, or describe what you don&apos;t get, and
          you&apos;ll get a step-by-step explanation in seconds.
        </p>
      </header>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {!books ? (
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      ) : books.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center gradient-border max-w-xl">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            No books yet. Admin can upload Class 10 PDFs from{" "}
            <Link href="/admin/pdfs" className="text-brand-500 hover:underline">/admin/pdfs</Link>
            {" "}(choose exam = Class 10).
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/library/${b.id}`}
              className="group block h-full"
            >
              <div className="h-full glass rounded-2xl p-5 gradient-border hover:-translate-y-0.5 transition">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent/20">
                    <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-base truncate" title={b.title}>{b.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      <FileText className="inline h-3 w-3 mr-1" /> {b.filename}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.pageCount ?? "?"} pages · {humanSize(b.fileSize)}</span>
                  {b.subjectSlug && (
                    <span className="px-2 py-0.5 rounded bg-muted">{b.subjectSlug}</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-brand-500 inline-flex items-center gap-1">
                  Open reader <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
