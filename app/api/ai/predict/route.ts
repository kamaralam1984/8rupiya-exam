import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { predictSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { getQueue, QUEUE_NAMES, defaultJobOpts } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = predictSchema.parse(await req.json());
    const exam = await db.exam.findUnique({
      where: { slug: body.examSlug },
      include: { subjects: true },
    });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    let subjectNames = exam.subjects.map((s) => s.name);
    if (body.subjectSlug) {
      const chosen = exam.subjects.find((s) => s.slug === body.subjectSlug);
      if (!chosen) return fail("Subject not found in this exam", 404, "SUBJECT_NOT_FOUND");
      subjectNames = [chosen.name];
    }

    const job = await db.aiJob.create({
      data: {
        userId: user.id,
        kind: "PREDICTED_SET",
        status: "QUEUED",
        input: { examSlug: body.examSlug, subjectSlug: body.subjectSlug, count: body.count },
      },
    });

    await getQueue(QUEUE_NAMES.PREDICT).add(
      "predict",
      { jobId: job.id, examSlug: body.examSlug, subjects: subjectNames, count: body.count },
      defaultJobOpts
    );

    return ok({ jobId: job.id, status: "QUEUED" });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("jobId");
    if (!id) return fail("jobId required", 400);
    const job = await db.aiJob.findUnique({ where: { id } });
    if (!job || job.userId !== user.id) return fail("Not found", 404, "NOT_FOUND");
    return ok({ id: job.id, status: job.status, output: job.output, error: job.error });
  } catch (e) {
    return handleError(e);
  }
}
