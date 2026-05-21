"use client";
import { useEffect, useState } from "react";
import { api } from "./api-client";

export type AdminExamOption = { slug: string; name: string };

/**
 * Loads the actual list of exams from the database (not the hardcoded
 * `EXAMS` config). Admin dropdowns should use this so users can't pick
 * an exam that doesn't exist in the DB — which produced the 404
 * "Exam not found" error when seeding hadn't run on a given env.
 *
 * Returns `null` while loading, then the array. Empty array means the
 * fetch failed or no exams exist yet.
 */
export function useAdminExams(): AdminExamOption[] | null {
  const [exams, setExams] = useState<AdminExamOption[] | null>(null);
  useEffect(() => {
    (async () => {
      const r = await api<Array<{ slug: string; name: string }>>("/api/admin/exams");
      if (r.ok) setExams(r.data.map((e) => ({ slug: e.slug, name: e.name })));
      else setExams([]);
    })();
  }, []);
  return exams;
}
