import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  topic: z.string().min(2).max(200),
  language: z.enum(["en", "hi"]).default("en"),
});

const SYSTEM = `You produce concise revision notes for Indian exam aspirants.

Hard rules:
- Original wording. Never copy verbatim from textbooks.
- Strictly factual, accurate. No padding.
- Return JSON only.

Schema:
{
  "topic": "...",
  "summary": "2-3 sentence overview",
  "keyPoints": ["..."],
  "definitions": [ { "term": "...", "meaning": "..." } ],
  "mnemonics": ["..."],
  "exampleQuestions": ["..."]
}`;

type Resp = {
  topic: string;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; meaning: string }[];
  mnemonics: string[];
  exampleQuestions: string[];
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`notes:${user.id}`, 20, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());
    const out = await completeJson<Resp>({
      system: SYSTEM,
      user: `Topic: ${body.topic}\nLanguage: ${body.language === "hi" ? "Hindi" : "English"}\nReturn only JSON.`,
      maxTokens: 2500,
    });
    return ok(out);
  } catch (e) {
    return handleError(e);
  }
}
