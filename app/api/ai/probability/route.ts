import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  examSlug: z.string().min(1).max(40),
});

type Band = "low" | "medium" | "high" | "selectable";

type ProbResp = {
  probability: number;
  band: Band;
  headline: string;
  signals: {
    accuracy: number;
    consistency: number;
    timeControl: number;
    weakChapters: string[];
    strongChapters: string[];
  };
  actionPlan: string[];
  sampleSize: number;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "probability", 10, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());

    const attempts = await db.attempt.findMany({
      where: { userId: user.id, status: "SUBMITTED" },
      orderBy: { startedAt: "desc" },
      take: 20,
      select: {
        id: true,
        score: true,
        accuracy: true,
        durationSec: true,
        startedAt: true,
        submittedAt: true,
        answers: { select: { isCorrect: true, timeSpentMs: true } },
      },
    });

    const sampleSize = attempts.length;

    if (sampleSize === 0) {
      return ok<ProbResp>({
        probability: 0,
        band: "low",
        headline: "Koi attempt nahi mila — pehle 1-2 mock complete karo, fir probability calculate kar dunga.",
        signals: { accuracy: 0, consistency: 0, timeControl: 0, weakChapters: [], strongChapters: [] },
        actionPlan: [
          "Pehle /dpp ya mock test par jaake 3 attempts karo.",
          "Phir wapas aakar probability check karo — data jitna zyada, prediction utna sharp.",
        ],
        sampleSize: 0,
      });
    }

    let totalAns = 0;
    let totalCorrect = 0;
    for (const a of attempts) {
      totalAns += a.answers.length;
      totalCorrect += a.answers.filter((x) => x.isCorrect).length;
    }
    const accuracy = totalAns === 0 ? 0 : Math.round((totalCorrect / totalAns) * 100);

    const scores = attempts.map((a) => Number(a.score ?? a.accuracy ?? 0));
    const mean = scores.reduce((s, n) => s + n, 0) / Math.max(1, scores.length);
    const variance = scores.reduce((s, n) => s + (n - mean) ** 2, 0) / Math.max(1, scores.length);
    const std = Math.sqrt(variance);
    const consistency = Math.max(0, Math.min(100, Math.round(100 - (std / Math.max(1, mean || 1)) * 100)));

    const timeRatios = attempts
      .filter((a) => a.durationSec && a.submittedAt && a.startedAt)
      .map((a) => {
        const taken = ((a.submittedAt!.getTime() - a.startedAt.getTime()) / 1000);
        return Math.min(1.2, taken / Math.max(1, a.durationSec ?? 1));
      });
    const avgRatio = timeRatios.length
      ? timeRatios.reduce((s, n) => s + n, 0) / timeRatios.length
      : 0.7;
    const timeControl = Math.max(0, Math.round((1 - Math.abs(avgRatio - 0.85)) * 100));

    const wrongAnswers = await db.answer.findMany({
      where: { attempt: { userId: user.id, status: "SUBMITTED" }, isCorrect: false },
      take: 200,
      select: { question: { select: { chapter: { select: { name: true } }, topic: true } } },
    });
    const wrongMap = new Map<string, number>();
    for (const a of wrongAnswers) {
      const name = a.question?.chapter?.name ?? a.question?.topic;
      if (name) wrongMap.set(name, (wrongMap.get(name) ?? 0) + 1);
    }
    const weakChapters = Array.from(wrongMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    const correctMap = new Map<string, number>();
    const correctRows = await db.answer.findMany({
      where: { attempt: { userId: user.id, status: "SUBMITTED" }, isCorrect: true },
      take: 200,
      select: { question: { select: { chapter: { select: { name: true } }, topic: true } } },
    });
    for (const a of correctRows) {
      const name = a.question?.chapter?.name ?? a.question?.topic;
      if (name) correctMap.set(name, (correctMap.get(name) ?? 0) + 1);
    }
    const strongChapters = Array.from(correctMap.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([k]) => !weakChapters.includes(k))
      .slice(0, 5)
      .map(([k]) => k);

    const raw = Math.round(accuracy * 0.55 + consistency * 0.25 + timeControl * 0.2);
    const probability = Math.max(2, Math.min(95, raw));
    const band: Band =
      probability >= 80 ? "selectable" :
      probability >= 60 ? "high" :
      probability >= 35 ? "medium" : "low";

    try {
      const ai = await completeJson<{ headline: string; actionPlan: string[] }>({
        system:
          "You are a calibrated, honest Indian exam coach. Never overhype. Speak Hinglish (Hindi-English mix), supportive but direct. Always emit valid JSON matching the requested schema.",
        user: JSON.stringify({
          examSlug: body.examSlug,
          probability,
          band,
          accuracy,
          consistency,
          timeControl,
          weakChapters,
          strongChapters,
          sampleSize,
          schema: {
            headline: "1-line verdict, Hinglish, under 22 words",
            actionPlan: "Array of exactly 5 concrete actions, each under 18 words",
          },
          rules: [
            "Be conservative. Do not promise selection.",
            "Reference at most 2 specific chapter names if provided.",
            "actionPlan items must be measurable (e.g., '10 PYQs daily', '3 mocks/week').",
          ],
        }),
        maxTokens: 600,
        prefer: "fast",
        operation: "doubt",
      });
      return ok<ProbResp>({
        probability,
        band,
        headline: ai.headline,
        signals: { accuracy, consistency, timeControl, weakChapters, strongChapters },
        actionPlan: ai.actionPlan,
        sampleSize,
      });
    } catch {
      const headline =
        band === "selectable"
          ? "Strong band — selection bilkul reach mein hai, ab consistency lock kar."
          : band === "high"
          ? "Achha track — 2-3 hafte aur disciplined revision, selection probability bahut badh jayegi."
          : band === "medium"
          ? "Foundation thik hai par weak chapters target karne ka time hai — focus mode chahiye."
          : "Build phase hai — daily DPP + 2 mock/week se accuracy badhao, fir wapas check karo.";
      return ok<ProbResp>({
        probability,
        band,
        headline,
        signals: { accuracy, consistency, timeControl, weakChapters, strongChapters },
        actionPlan: [
          `Daily 1 DPP solve karo (10 questions, ${body.examSlug.toUpperCase()} pattern).`,
          weakChapters[0] ? `Pehle ${weakChapters[0]} chapter target karo — 20 PYQs.` : "Apne weakest chapter ka radar check karo.",
          "Har hafte minimum 2 full mocks, sectional time control ke saath.",
          "Wrong answers ka revision karo — same week mein dobara solve.",
          "Roz 30 min revision flashcards (SRS) chalao — recall pakka.",
        ],
        sampleSize,
      });
    }
  } catch (e) {
    return handleError(e);
  }
}
