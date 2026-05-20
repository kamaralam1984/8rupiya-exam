import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "pending";
    const where = status === "approved" ? { approved: true } : { approved: false };
    const questions = await db.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { subject: { select: { name: true } } },
    });
    return ok(questions);
  } catch (e) {
    return handleError(e);
  }
}
