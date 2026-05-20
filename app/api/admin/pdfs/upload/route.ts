import { NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { pdfIngestConfigSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { getQueue, QUEUE_NAMES, defaultJobOpts } from "@/lib/queue";
import { compressPdf } from "@/lib/pdf-compress";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

function uploadsDir() {
  return process.env.PDF_UPLOAD_DIR
    ? path.resolve(process.env.PDF_UPLOAD_DIR)
    : path.resolve(process.cwd(), "data", "pdfs");
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const form = await req.formData();

    const file = form.get("file");
    if (!(file instanceof File)) return fail("Missing file", 400, "NO_FILE");
    if (file.size === 0) return fail("Empty file", 400, "EMPTY");
    if (file.size > MAX_BYTES) return fail(`File too large (max ${MAX_BYTES / 1024 / 1024} MB)`, 413, "TOO_LARGE");
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
      return fail("Only PDF files are allowed", 415, "BAD_TYPE");
    }

    const configRaw = form.get("config");
    if (typeof configRaw !== "string") return fail("Missing config", 400, "NO_CONFIG");
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(configRaw);
    } catch {
      return fail("Invalid config JSON", 400, "BAD_CONFIG");
    }
    const config = pdfIngestConfigSchema.parse(parsedJson);

    const exam = config.examSlug
      ? await db.exam.findUnique({ where: { slug: config.examSlug } })
      : null;
    if (config.examSlug && !exam) return fail("Exam not found", 404, "EXAM_NOT_FOUND");

    const subject = config.subjectSlug && exam
      ? await db.subject.findUnique({ where: { examId_slug: { examId: exam.id, slug: config.subjectSlug } } })
      : null;
    if (config.subjectSlug && !subject) return fail("Subject not found", 404, "SUBJECT_NOT_FOUND");

    const dir = uploadsDir();
    await fs.mkdir(dir, { recursive: true });
    const id = randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const storagePath = path.join(dir, `${id}__${safeName}`);
    const buf = Buffer.from(await file.arrayBuffer());
    const originalSize = buf.byteLength;
    await fs.writeFile(storagePath, buf);

    // Lossless-feel compression via Ghostscript /printer preset (300dpi).
    // Falls back to the original file if compression doesn't help or fails.
    const compressionReport = await compressPdf(storagePath).catch((e) => {
      console.warn("[pdfs/upload] compressPdf threw, keeping original:", e?.message);
      return null;
    });

    const finalSize = compressionReport?.compressedSize ?? originalSize;
    if (compressionReport?.compressed) {
      console.log(
        `[pdfs/upload] compressed ${file.name}: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(finalSize / 1024 / 1024).toFixed(2)} MB (-${compressionReport.savedPct}%, preset=${compressionReport.preset})`,
      );
    } else if (compressionReport?.error) {
      console.warn(`[pdfs/upload] compression skipped: ${compressionReport.error}`);
    }

    const pdf = await db.pdf.create({
      data: {
        examId: exam?.id ?? null,
        uploadedBy: admin.id,
        filename: file.name,
        storagePath,
        fileSize: finalSize,
        config: {
          ...(config as Record<string, unknown>),
          compression: compressionReport
            ? {
                preset: compressionReport.preset,
                originalSize: compressionReport.originalSize,
                compressedSize: compressionReport.compressedSize,
                savedBytes: compressionReport.savedBytes,
                savedPct: compressionReport.savedPct,
                compressed: compressionReport.compressed,
                ...(compressionReport.error ? { error: compressionReport.error } : {}),
              }
            : { compressed: false, reason: "compressor unavailable" },
        } as unknown as object,
        status: "QUEUED",
      },
    });

    const job = await db.aiJob.create({
      data: {
        userId: admin.id,
        pdfId: pdf.id,
        kind: "PDF_TO_MCQ",
        status: "QUEUED",
        input: { pdfId: pdf.id, storagePath, config },
      },
    });

    await getQueue(QUEUE_NAMES.PDF_INGEST).add(
      "ingest",
      { jobId: job.id, pdfId: pdf.id, storagePath, config, subjectId: subject?.id ?? null },
      defaultJobOpts
    );

    return ok({
      pdfId: pdf.id,
      jobId: job.id,
      size: finalSize,
      originalSize,
      compressed: compressionReport?.compressed ?? false,
      savedPct: compressionReport?.savedPct ?? 0,
    });
  } catch (e) {
    return handleError(e);
  }
}
