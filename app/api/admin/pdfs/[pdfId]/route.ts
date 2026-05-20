import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: { params: Promise<{ pdfId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { pdfId } = await ctx.params;

    const pdf = await db.pdf.findUnique({
      where: { id: pdfId },
      select: { id: true, storagePath: true, filename: true },
    });
    if (!pdf) return fail("PDF not found", 404, "NOT_FOUND");

    // Delete the file from disk first; ignore ENOENT so missing files don't block DB cleanup
    if (pdf.storagePath) {
      try {
        await fs.unlink(path.resolve(pdf.storagePath));
      } catch (e: any) {
        if (e?.code !== "ENOENT") console.warn("[admin/pdfs DELETE] unlink failed:", e?.message);
      }
    }

    await db.pdf.delete({ where: { id: pdfId } });

    await db.auditLog.create({
      data: { userId: admin.id, action: "PDF_DELETED", target: `Pdf:${pdfId}`, meta: { filename: pdf.filename } },
    }).catch(() => {});

    return ok({ id: pdfId });
  } catch (e) {
    return handleError(e);
  }
}
