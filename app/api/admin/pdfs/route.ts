import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const pdfs = await db.pdf.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { exam: { select: { name: true, slug: true } }, _count: { select: { questions: true } } },
    });
    return ok(pdfs);
  } catch (e) {
    return handleError(e);
  }
}
