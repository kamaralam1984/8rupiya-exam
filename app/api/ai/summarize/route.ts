import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(100).max(12000),
  subject: z.string().max(120).optional().default(""),
});

type Resp = {
  title: string;
  tldr: string;
  keyPoints: string[];
  formulas: string[];
  examTip: string;
  miniQuiz: { stem: string; options: string[]; correctIndex: number; explanation: string }[];
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "summarize", 15, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());

    const res = await completeJson<Resp>({
      system:
        "You are a precise study summarizer for Indian competitive and academic exams. Always emit valid JSON matching the requested schema. Use clean, exam-ready phrasing.",
      user: JSON.stringify({
        subject: body.subject,
        text: body.text,
        schema: {
          title: "string — concise topic title",
          tldr: "1 sentence summary, under 30 words",
          keyPoints: "Array of 5-8 bullet points, each under 22 words",
          formulas: "Array of formulas as plain strings (e.g., 'F = q E'); empty if none",
          examTip: "1-2 sentences — actionable revision tip specific to the topic",
          miniQuiz: "Array of EXACTLY 5 MCQs: stem (string), options (4 strings), correctIndex (0-3), explanation (1 sentence)",
        },
        rules: [
          "Do not invent facts not present in the text. If something is missing, omit it.",
          "Formulas should be transcribed faithfully from the source.",
          "MCQs must test conceptual understanding, not trivia.",
        ],
      }),
      maxTokens: 2200,
      prefer: "quality",
      operation: "doubt",
    });
    return ok(res);
  } catch (e) {
    return handleError(e);
  }
}
