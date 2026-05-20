import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Returns slugs of exams currently visible to students (isActive). */
export async function GET() {
  try {
    const rows = await db.exam.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { createdAt: "asc" },
    });
    return ok(rows.map((r) => r.slug));
  } catch (e) {
    return handleError(e);
  }
}
