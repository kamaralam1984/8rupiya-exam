import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export const revalidate = 300;

export async function GET() {
  try {
    const exams = await db.exam.findMany({
      where: { isActive: true },
      include: { subjects: true, _count: { select: { testSets: true } } },
      orderBy: { name: "asc" },
    });
    return ok(exams);
  } catch (e) {
    return handleError(e);
  }
}
