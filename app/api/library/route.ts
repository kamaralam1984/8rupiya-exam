import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/library
 *
 * Returns the list of books available to the currently signed-in student.
 *
 * Currently scoped to Class 10 (`examTrack === "class-10"`). PDFs uploaded by
 * admins for the class-10 exam track and marked as INGESTED are surfaced here.
 */
export async function GET() {
  try {
    const user = await requireUser();
    // Admins always see the full library regardless of their examTrack.
    if (user.role !== "ADMIN" && user.examTrack !== "class-10") {
      return fail("Library is available only for Class 10 students for now.", 403, "LIBRARY_RESTRICTED");
    }

    const exam = await db.exam.findUnique({ where: { slug: "class-10" }, select: { id: true } });
    if (!exam) return ok([]);

    const books = await db.pdf.findMany({
      where: {
        examId: exam.id,
        // Hide queued/failed ingests; show extracted or fully ingested books
        status: { in: ["EXTRACTED", "INGESTED"] },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 100,
      select: {
        id: true,
        filename: true,
        pageCount: true,
        fileSize: true,
        status: true,
        createdAt: true,
        sortOrder: true,
        config: true,
      },
    });

    return ok(
      books.map((b) => ({
        id: b.id,
        filename: b.filename,
        pageCount: b.pageCount,
        fileSize: b.fileSize,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        // Pull human-friendly title + subject hint from the admin upload config
        title: (b.config as any)?.title ?? b.filename.replace(/\.pdf$/i, ""),
        subjectSlug: (b.config as any)?.subjectSlug ?? null,
      })),
    );
  } catch (e) {
    return handleError(e);
  }
}
