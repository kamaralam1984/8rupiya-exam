"use client";
import { useEffect, useState } from "react";
import { api } from "./api-client";

export type SubjectRow = {
  id?: string;
  slug: string;
  name: string;
  parentId?: string | null;
  splitEnabled?: boolean;
  children?: Array<{ id: string; name: string; slug: string }>;
};

type ExamDetail = { subjects: SubjectRow[] };

const cache = new Map<string, SubjectRow[]>();

/**
 * Returns the flat, student-facing list of subjects for an exam.
 *
 * If a parent subject has `splitEnabled=true` AND has children, the children
 * are surfaced and the parent is hidden. Otherwise the parent is surfaced
 * (children stay hidden — combined view).
 */
export function useExamSubjects(examSlug: string | null | undefined) {
  const [subjects, setSubjects] = useState<SubjectRow[]>(() =>
    examSlug ? cache.get(examSlug) ?? [] : []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examSlug) {
      setSubjects([]);
      return;
    }
    const cached = cache.get(examSlug);
    if (cached) {
      setSubjects(cached);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const r = await api<ExamDetail>(`/api/exams/${examSlug}`);
      if (!active) return;
      setLoading(false);
      if (!r.ok) return;
      const flat = resolveSubjects(r.data.subjects ?? []);
      cache.set(examSlug, flat);
      setSubjects(flat);
    })();
    return () => {
      active = false;
    };
  }, [examSlug]);

  return { subjects, loading };
}

/**
 * Filter: hide child subjects whose parent has splitEnabled=false.
 *         hide parent subjects that have splitEnabled=true (show children only).
 *         keep parent subjects with splitEnabled=false (combined view).
 */
function resolveSubjects(rows: SubjectRow[]): SubjectRow[] {
  const byId = new Map(rows.map((r) => [r.id ?? "", r] as const));
  const parentSplit = new Map<string, boolean>(); // parentId -> split flag
  for (const r of rows) {
    if (r.id && !r.parentId) parentSplit.set(r.id, !!r.splitEnabled);
  }

  return rows.filter((r) => {
    // If this is a child:
    if (r.parentId) {
      // surface only when parent.splitEnabled = true
      return parentSplit.get(r.parentId) === true;
    }
    // This is a parent (or stand-alone subject):
    // hide if it's a parent that has been split into children
    if (parentSplit.get(r.id ?? "") === true) return false;
    return true;
  });
}
