import { db } from "@/lib/db";
import { EXAMS } from "@/lib/exams";
import { ExamGridClient } from "@/components/exam-grid-client";

/**
 * Server component: filters the static EXAMS metadata by the live `isActive`
 * flag in the DB. Falls back to all exams if the DB is unreachable, so the
 * homepage still renders during temporary outages.
 */
export async function ExamGrid() {
  let activeSlugs: Set<string> | null = null;
  try {
    const rows = await db.exam.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    activeSlugs = new Set(rows.map((r) => r.slug));
  } catch {
    activeSlugs = null;
  }
  const items = activeSlugs ? EXAMS.filter((e) => activeSlugs!.has(e.slug)) : EXAMS;
  return <ExamGridClient items={items} />;
}
