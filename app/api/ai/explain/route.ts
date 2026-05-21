import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";

export const dynamic = "force-dynamic";

const schema = z.object({
  questionId: z.string().min(1),
  language: z.enum(["en", "hi"]).default("en"),
});

type ExplainResp = {
  steps: string[];
  concept: string;
  whyWrong: string;
};

/**
 * Generate a beginner-friendly, "zero level" step-by-step explanation for a
 * question the student got wrong. The response is cached in
 * `Question.explanationLong` so repeated views are instant and free.
 *
 * The endpoint requires the caller to have actually answered this question in
 * an attempt — prevents using it as a generic question lookup.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    // Confirm the user has at least one answer for this question.
    const answer = await db.answer.findFirst({
      where: { questionId: body.questionId, attempt: { userId: user.id } },
      select: { id: true },
    });
    if (!answer) return fail("Question not found in your attempts", 404, "NOT_FOUND");

    const q = await db.question.findUnique({
      where: { id: body.questionId },
      select: {
        id: true,
        stem: true,
        options: true,
        correctIndex: true,
        explanation: true,
        explanationLong: true,
        subject: { select: { name: true } },
        examSlug: true,
      },
    });
    if (!q) return fail("Question not found", 404, "NOT_FOUND");

    // Return cached explanation if present.
    if (q.explanationLong && q.explanationLong.length > 50) {
      return ok({ explanation: q.explanationLong, cached: true });
    }

    const rl = await rateLimitUser(user, "explain", 30, 3600);
    if (!rl.ok) return fail("Hourly limit reached. Try again later.", 429, "RATE_LIMITED");

    const options = Array.isArray(q.options) ? (q.options as string[]) : [];
    const correctOption = options[q.correctIndex] ?? "(unknown)";
    const langLabel = body.language === "hi" ? "Hindi (Devanagari)" : "simple English";

    const system = `You are a patient teacher explaining concepts to a beginner Indian competitive-exam student. Write in ${langLabel}. Be extremely simple — assume the student knows nothing. Use everyday analogies. Output strict JSON, no prose outside.`;
    const userPrompt = `A student got this MCQ wrong. Teach them from zero so they understand WHY the correct answer is right, and what trap led to the wrong choice.

Subject: ${q.subject?.name ?? "General"}
Exam: ${q.examSlug ?? "general"}

Question: ${q.stem}
Options:
${options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}${i === q.correctIndex ? "  ← correct" : ""}`).join("\n")}

Short hint (already shown to student): ${q.explanation ?? "(none)"}

Return JSON matching:
{
  "concept": "1-line name of the core concept (e.g. 'Newton's First Law')",
  "steps": ["step 1 in plain language", "step 2 ...", "..."],  // 3-6 short steps, each <= 30 words
  "whyWrong": "1-2 sentences on the common mistake or trap that made students pick the wrong option"
}`;

    const resp = await completeJson<ExplainResp>({
      system,
      user: userPrompt,
      operation: "doubt",
      temperature: 0.4,
      maxTokens: 700,
    });

    // Compose a single-string explanation we can cache and render.
    const composed =
      `**Concept:** ${resp.concept}\n\n` +
      `**Step-by-step:**\n${resp.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
      `**Why students get this wrong:** ${resp.whyWrong}`;

    await db.question.update({
      where: { id: q.id },
      data: { explanationLong: composed },
    });

    return ok({ explanation: composed, cached: false });
  } catch (e) {
    return handleError(e);
  }
}
