import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const [users, attempts, questions, pdfs, payments, pending] = await Promise.all([
      db.user.count(),
      db.attempt.count({ where: { status: "SUBMITTED" } }),
      db.question.count(),
      db.pdf.count(),
      db.payment.count({ where: { status: "PAID" } }),
      db.question.count({ where: { approved: false } }),
    ]);
    return ok({ users, attempts, questions, pdfs, payments, pendingApproval: pending });
  } catch (e) {
    return handleError(e);
  }
}
