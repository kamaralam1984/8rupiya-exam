import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  topic: z.string().min(2).max(120),
  count: z.number().int().min(4).max(30).default(10),
  language: z.enum(["en", "hi"]).default("en"),
});

const SYSTEM = `You produce concise study flashcards for Indian exam aspirants.

Hard rules:
- Original wording, never copy from textbooks.
- Front: short prompt or question. Back: 1-3 sentence factual answer.
- Output strict JSON, no prose outside the JSON.

Schema:
{ "topic": "...", "cards": [ { "front": "...", "back": "..." } ] }`;

type Resp = { topic: string; cards: { front: string; back: string }[] };

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "flash", 20, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());

    const lang = body.language === "hi" ? "Hindi" : "English";
    const out = await completeJson<Resp>({
      system: SYSTEM,
      user: `Topic: ${body.topic}\nLanguage: ${lang}\nGenerate exactly ${body.count} flashcards. Return only JSON.`,
      maxTokens: 2000,
    });
    return ok(out);
  } catch (e) {
    return handleError(e);
  }
}
