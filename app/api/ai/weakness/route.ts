import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { weaknessSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { weaknessSystem, weaknessUser } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

type Report = {
  summary: string;
  weakSubjects: { subject: string; accuracy: number; reason: string }[];
  weakChapters: { chapter: string; subject: string; accuracy: number }[];
  timeManagement: string;
  guessingBehavior: string;
  recommendedPlan: string[];
  passingProbability: number;
  encouragement: string;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "weak", 20, 3600);
    if (!rl.ok) return fail("Limit reached", 429, "RATE_LIMITED");

    const body = weaknessSchema.parse(await req.json());
    const attempt = await db.attempt.findUnique({
      where: { id: body.attemptId },
      include: { testSet: { include: { exam: true } } },
    });
    if (!attempt || attempt.userId !== user.id) return fail("Attempt not found", 404, "NOT_FOUND");
    if (attempt.status !== "SUBMITTED") return fail("Submit the attempt first", 409, "NOT_SUBMITTED");

    const report = await completeJson<Report>({
      system: weaknessSystem(),
      user: weaknessUser({
        exam: attempt.testSet.exam.name,
        language: body.language,
        stats: {
          score: attempt.score,
          accuracy: attempt.accuracy,
          durationSec: attempt.durationSec,
          breakdown: attempt.meta,
        },
      }),
      maxTokens: 1800,
    });

    await db.aiJob.create({
      data: {
        userId: user.id,
        kind: "WEAKNESS_REPORT",
        status: "COMPLETED",
        input: { attemptId: attempt.id },
        output: report as any,
      },
    });
    return ok(report);
  } catch (e) {
    return handleError(e);
  }
}
