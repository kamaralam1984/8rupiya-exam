import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { pyqPredictSystem, pyqPredictUser } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = z.object({
  examSlug: z.string().min(1),
  subjectSlug: z.string().optional(),
  targetYear: z.number().int().min(2024).max(2100).default(new Date().getFullYear() + 1),
  count: z.number().int().min(5).max(40).default(20),
  minScore: z.number().int().min(40).max(95).default(60),
  yearsLookback: z.number().int().min(3).max(20).default(10),
});

type PredictedSet = {
  title: string;
  rationale: string;
  topicTrend: Array<{ topic: string; yearsSeen: number; averageMarks?: number; rising?: boolean }>;
  questions: Array<{
    stem: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    topic: string;
    predictionScore: number;
    basedOnYears: number[];
  }>;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "predict-pyq", 6, 3600);
    if (!rl.ok) return fail("Hourly prediction limit reached", 429, "RATE_LIMITED");

    const body = bodySchema.parse(await req.json());
    const exam = await db.exam.findUnique({ where: { slug: body.examSlug } });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    let subject: { id: string; name: string } | null = null;
    if (body.subjectSlug) {
      const s = await db.subject.findUnique({
        where: { examId_slug: { examId: exam.id, slug: body.subjectSlug } },
        select: { id: true, name: true },
      });
      if (!s) return fail("Subject not found", 404, "SUBJECT_NOT_FOUND");
      subject = s;
    }

    const minYear = new Date().getFullYear() - body.yearsLookback;
    const pyqs = await db.question.findMany({
      where: {
        isPyq: true,
        examSlug: body.examSlug,
        ...(subject ? { subjectId: subject.id } : {}),
        year: { gte: minYear },
      },
      select: { id: true, stem: true, topic: true, year: true },
      orderBy: { year: "desc" },
      take: 400,
    });

    if (pyqs.length === 0) {
      return fail(
        `No PYQ data found for ${exam.name}${subject ? ` · ${subject.name}` : ""} since ${minYear}. Upload past papers via /admin/pdfs (PYQ mode) first.`,
        404,
        "NO_PYQ_DATA",
      );
    }

    // Aggregate topic frequencies
    const freq = new Map<string, Set<number>>();
    for (const q of pyqs) {
      const t = (q.topic ?? "Untagged").trim();
      if (!freq.has(t)) freq.set(t, new Set());
      if (q.year) freq.get(t)!.add(q.year);
    }
    const topicFrequencies = Array.from(freq.entries())
      .map(([topic, years]) => ({
        topic,
        years: Array.from(years).sort((a, b) => b - a),
        total: years.size,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25);

    const samplePyqs = pyqs.slice(0, 40).map((q) => ({
      year: q.year ?? 0,
      topic: q.topic,
      stem: q.stem.slice(0, 220),
    }));

    const out = await completeJson<PredictedSet>({
      operation: "pyq",
      system: pyqPredictSystem(body.targetYear),
      user: pyqPredictUser({
        exam: exam.name,
        subject: subject?.name,
        targetYear: body.targetYear,
        count: body.count,
        minScore: body.minScore,
        topicFrequencies,
        samplePyqs,
      }),
      maxTokens: 8000,
      temperature: 0.4,
    });

    // Save as AiJob output (so user can revisit)
    const job = await db.aiJob.create({
      data: {
        userId: user.id,
        kind: "PREDICTED_SET",
        status: "COMPLETED",
        input: { examSlug: body.examSlug, subjectSlug: body.subjectSlug, targetYear: body.targetYear, count: body.count },
        output: out as any,
      },
    });

    return ok({
      jobId: job.id,
      ...out,
      stats: {
        pyqCount: pyqs.length,
        topicsAnalyzed: topicFrequencies.length,
        yearRange: { from: Math.min(...pyqs.map((p) => p.year ?? 9999)), to: Math.max(...pyqs.map((p) => p.year ?? 0)) },
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
