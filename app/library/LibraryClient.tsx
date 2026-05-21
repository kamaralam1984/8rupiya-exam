"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Loader2, BookOpen, FileText, ArrowRight, Pencil, Check, X as XIcon,
  GripVertical, FolderOpen, Save,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { getExam } from "@/lib/exams";
import { ExamLogo } from "@/components/exam-logo";
import { useToast } from "@/components/ui/toaster";

type Book = {
  id: string;
  filename: string;
  title: string;
  subjectSlug: string | null;
  pageCount: number | null;
  fileSize: number | null;
  status: string;
  sortOrder: number;
  createdAt: string;
};

type LibResp = { isAdmin: boolean; books: Book[] };

function humanSize(bytes: number | null) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

/** "science" → "Science", "social-science" → "Social Science" */
function prettyCategory(slug: string | null) {
  if (!slug) return "Uncategorized";
  return slug.split(/[-_\s]+/).map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

export function LibraryClient() {
  const [data, setData] = useState<LibResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();

  // local order map so drag UX feels instant
  const [orderOverride, setOrderOverride] = useState<Record<string, number>>({});

  async function load() {
    const r = await api<LibResp>("/api/library");
    if (r.ok) {
      setData(r.data);
      setOrderOverride({});
    } else {
      setErr(r.error.message ?? "Failed to load library");
    }
  }
  useEffect(() => { load(); }, []);

  // Group books by subject category (admins + students see same grouping).
  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ subject: string | null; books: Book[] }>;
    const map = new Map<string, Book[]>();
    for (const b of data.books) {
      const key = b.subjectSlug ?? "__uncategorized__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    // Sort books inside each section by sortOrder (with override) then createdAt
    for (const [, list] of map) {
      list.sort((a, b) => {
        const ao = orderOverride[a.id] ?? a.sortOrder;
        const bo = orderOverride[b.id] ?? b.sortOrder;
        if (ao !== bo) return ao - bo;
        return a.createdAt.localeCompare(b.createdAt);
      });
    }
    return Array.from(map.entries())
      .map(([k, books]) => ({ subject: k === "__uncategorized__" ? null : k, books }))
      // Alphabetical category order; uncategorized last
      .sort((x, y) => {
        if (x.subject === null) return 1;
        if (y.subject === null) return -1;
        return x.subject.localeCompare(y.subject);
      });
  }, [data, orderOverride]);

  async function saveRename(book: Book, newTitle: string, newSubject: string | null) {
    const r = await api(`/api/admin/pdfs/${book.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle, subjectSlug: newSubject }),
    });
    if (!r.ok) {
      toast(r.error.message ?? "Save failed", "error");
      return false;
    }
    toast("Saved", "success");
    // Patch in memory so UI updates without full reload
    setData((d) => d ? {
      ...d,
      books: d.books.map((b) => b.id === book.id ? { ...b, title: newTitle, subjectSlug: newSubject } : b),
    } : d);
    return true;
  }

  async function persistOrder(orderedIds: string[]) {
    const r = await api("/api/admin/pdfs/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids: orderedIds }),
    });
    if (!r.ok) {
      toast(r.error.message ?? "Reorder failed", "error");
      load(); // rollback to server state
    } else {
      // Bake the new order into local sortOrder so future operations are correct
      setData((d) => d ? {
        ...d,
        books: d.books.map((b) => {
          const i = orderedIds.indexOf(b.id);
          return i >= 0 ? { ...b, sortOrder: i } : b;
        }),
      } : d);
      setOrderOverride({});
    }
  }

  function handleDrop(draggedId: string, droppedOverId: string, sectionBooks: Book[]) {
    if (draggedId === droppedOverId) return;
    const from = sectionBooks.findIndex((b) => b.id === draggedId);
    const to = sectionBooks.findIndex((b) => b.id === droppedOverId);
    if (from < 0 || to < 0) return;

    const next = sectionBooks.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    // Build full ordered list across ALL sections (preserve order of other sections)
    const fullIds: string[] = [];
    for (const grp of grouped) {
      if (grp.books === sectionBooks) {
        for (const b of next) fullIds.push(b.id);
      } else {
        for (const b of grp.books) fullIds.push(b.id);
      }
    }
    // Optimistic UI update
    const override: Record<string, number> = {};
    fullIds.forEach((id, i) => { override[id] = i; });
    setOrderOverride(override);
    persistOrder(fullIds);
  }

  const isAdmin = !!data?.isAdmin;

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
        {isAdmin && (
          <p className="mt-3 text-xs inline-flex items-center gap-1.5 rounded-full bg-accent/15 text-accent px-3 py-1">
            <Pencil className="h-3 w-3" /> Admin mode — pencil to rename, drag the handle to reorder.
          </p>
        )}
      </header>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {!data ? (
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      ) : data.books.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center gradient-border max-w-xl">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            No books yet. Admin can upload Class 10 PDFs from{" "}
            <Link href="/admin/pdfs" className="text-brand-500 hover:underline">/admin/pdfs</Link>
            {" "}(choose exam = Class 10).
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.subject ?? "uncat"}>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold mb-4">
                <FolderOpen className="h-5 w-5 text-accent" />
                {prettyCategory(group.subject)}
                <span className="text-xs text-muted-foreground font-normal">({group.books.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.books.map((b) => (
                  <BookCard
                    key={b.id}
                    book={b}
                    isAdmin={isAdmin}
                    onSave={saveRename}
                    onDrop={(draggedId) => handleDrop(draggedId, b.id, group.books)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

/** Single book card. Renders editor inline when admin clicks the pencil icon. */
function BookCard({
  book, isAdmin, onSave, onDrop,
}: {
  book: Book;
  isAdmin: boolean;
  onSave: (b: Book, title: string, subjectSlug: string | null) => Promise<boolean>;
  onDrop: (draggedId: string) => void;
}) {
  const exam = getExam("class-10");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [subject, setSubject] = useState(book.subjectSlug ?? "");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setTitle(book.title);
      setSubject(book.subjectSlug ?? "");
      setTimeout(() => titleRef.current?.focus(), 30);
    }
  }, [editing, book.title, book.subjectSlug]);

  async function commit() {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await onSave(book, title.trim(), subject.trim() || null);
    setSaving(false);
    if (ok) setEditing(false);
  }

  // HTML5 DnD wiring — only on admin cards
  const dragProps = isAdmin && !editing
    ? {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", book.id);
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (!dragOver) setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(false);
          const id = e.dataTransfer.getData("text/plain");
          if (id) onDrop(id);
        },
      }
    : {};

  const inner = (
    <div
      className={`h-full glass rounded-2xl p-5 gradient-border transition relative ${
        dragOver ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-[1.01]" : "hover:-translate-y-0.5"
      }`}
    >
      {isAdmin && !editing && (
        <span
          className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-muted/60"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}

      <div className="flex items-center gap-3">
        <ExamLogo
          icon={exam?.icon}
          color={exam?.color}
          logoUrl={exam?.logoUrl}
          alt={`${exam?.name ?? "Course"} logo`}
          size="md"
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <>
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="w-full bg-card border border-border rounded-md px-2 py-1 text-sm font-display font-semibold"
                placeholder="Book title"
              />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="mt-1 w-full bg-card border border-border rounded-md px-2 py-1 text-[11px] text-muted-foreground"
                placeholder="Subject (e.g. science, maths)"
              />
            </>
          ) : (
            <>
              <p className="font-display font-semibold text-base truncate" title={book.title}>
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                <FileText className="inline h-3 w-3 mr-1" /> {book.filename}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{book.pageCount ?? "?"} pages · {humanSize(book.fileSize)}</span>
        {!editing && book.subjectSlug && (
          <span className="px-2 py-0.5 rounded bg-muted">{book.subjectSlug}</span>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={commit}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-brand-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1 rounded-md border border-border text-xs px-3 py-1.5 hover:bg-muted"
          >
            <XIcon className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/library/${book.id}`}
            className="text-xs text-brand-500 inline-flex items-center gap-1 hover:underline"
          >
            Open reader <ArrowRight className="h-3 w-3" />
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setEditing(true); }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              title="Edit title + category"
              aria-label="Edit book"
            >
              <Pencil className="h-3.5 w-3.5" /> Rename
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div {...dragProps} className="h-full">
      {inner}
    </div>
  );
}
