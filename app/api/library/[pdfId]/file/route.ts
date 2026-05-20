import fs from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/library/[pdfId]/file
 *
 * Streams the actual PDF file to authorised students (Class 10 track only).
 * The file lives outside the public directory, so this route is the gatekeeper.
 *
 * Supports HTTP Range requests so the browser PDF viewer can seek pages.
 */
export async function GET(req: Request, ctx: { params: Promise<{ pdfId: string }> }) {
  try {
    const user = await requireUser();
    if (user.examTrack !== "class-10") return fail("Forbidden", 403, "LIBRARY_RESTRICTED");

    const { pdfId } = await ctx.params;
    const pdf = await db.pdf.findUnique({
      where: { id: pdfId },
      select: { storagePath: true, filename: true, exam: { select: { slug: true } } },
    });
    if (!pdf) return fail("Book not found", 404, "NOT_FOUND");
    if (pdf.exam?.slug !== "class-10") return fail("Book not part of your library", 403, "WRONG_TRACK");

    const safePath = path.resolve(pdf.storagePath);
    if (!fs.existsSync(safePath)) return fail("File missing on disk", 410, "FILE_MISSING");

    const stat = fs.statSync(safePath);
    const total = stat.size;
    const range = req.headers.get("range");

    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(pdf.filename)}"`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=300",
    };

    if (range) {
      const match = range.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : total - 1;
        if (start >= total || end >= total || start > end) {
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${total}` },
          });
        }
        const chunkSize = end - start + 1;
        const stream = fs.createReadStream(safePath, { start, end });
        return new Response(stream as unknown as ReadableStream, {
          status: 206,
          headers: {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Content-Length": String(chunkSize),
          },
        });
      }
    }

    const stream = fs.createReadStream(safePath);
    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: { ...headers, "Content-Length": String(total) },
    });
  } catch (e) {
    return handleError(e);
  }
}
