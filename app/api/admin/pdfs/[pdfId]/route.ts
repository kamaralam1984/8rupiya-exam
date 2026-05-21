import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subjectSlug: z.string().min(1).max(60).nullable().optional(),
});

/** Admin-only inline edit of a PDF's display title + subject category. */
export async function PATCH(req: Request, ctx: { params: Promise<{ pdfId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { pdfId } = await ctx.params;
    const body = patchSchema.parse(await req.json());

    const existing = await db.pdf.findUnique({
      where: { id: pdfId },
      select: { id: true, config: true, filename: true },
    });
    if (!existing) return fail("PDF not found", 404, "NOT_FOUND");

    const prev = (existing.config as Record<string, unknown>) ?? {};
    const nextConfig: Record<string, unknown> = { ...prev };
    if (body.title !== undefined) nextConfig.title = body.title.trim();
    if (body.subjectSlug !== undefined) {
      if (body.subjectSlug === null || body.subjectSlug === "") {
        delete nextConfig.subjectSlug;
      } else {
        nextConfig.subjectSlug = body.subjectSlug.trim();
      }
    }

    const updated = await db.pdf.update({
      where: { id: pdfId },
      data: { config: nextConfig as object },
      select: { id: true, filename: true, config: true },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "PDF_RENAMED",
        target: `Pdf:${pdfId}`,
        meta: { title: body.title, subjectSlug: body.subjectSlug, filename: existing.filename },
      },
    }).catch(() => {});

    return ok({
      id: updated.id,
      filename: updated.filename,
      title: (updated.config as any)?.title ?? null,
      subjectSlug: (updated.config as any)?.subjectSlug ?? null,
    });
  } catch (e) {
    return handleError(e);
  }
}

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
