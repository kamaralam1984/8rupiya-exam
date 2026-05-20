import { db } from "../lib/db";
import { completeJson } from "../lib/ai/llm";
import { predictedSetSystem, predictedSetUser } from "../lib/ai/prompts";

type Payload = {
  jobId: string;
  examSlug: string;
  subjects: string[];
  count: number;
};

type PredictResp = {
  title: string;
  rationale: string;
  questions: Array<{
    stem: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    topic: string;
  }>;
};

export async function runPredict(payload: Payload) {
  await db.aiJob.update({ where: { id: payload.jobId }, data: { status: "RUNNING" } });
  try {
    const out = await completeJson<PredictResp>({
      system: predictedSetSystem(),
      user: predictedSetUser({
        exam: payload.examSlug,
        subjects: payload.subjects,
        count: payload.count,
      }),
      maxTokens: 6000,
      operation: "predict",
    });
    await db.aiJob.update({
      where: { id: payload.jobId },
      data: { status: "COMPLETED", output: out as any },
    });
    return out;
  } catch (e: any) {
    await db.aiJob.update({
      where: { id: payload.jobId },
      data: { status: "FAILED", error: e?.message?.slice(0, 1000) ?? "unknown" },
    });
    throw e;
  }
}
