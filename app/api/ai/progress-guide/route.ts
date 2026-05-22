import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  accuracy: z.number(),
  attempts: z.number(),
  improvement: z.number(),
  period: z.enum(["week", "month", "year"]),
  streak: z.number(),
  subjects: z.array(z.object({ name: z.string(), accuracy: z.number() })),
});

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = schema.parse(await req.json());

    const weakSubjects = body.subjects
      .filter((s) => s.accuracy < 0.6)
      .map((s) => `${s.name} (${(s.accuracy * 100).toFixed(0)}%)`)
      .join(", ");

    const strongSubjects = body.subjects
      .filter((s) => s.accuracy >= 0.6)
      .map((s) => `${s.name} (${(s.accuracy * 100).toFixed(0)}%)`)
      .join(", ");

    const periodLabel = { week: "7 dinon", month: "1 mahine", year: "1 saal" }[body.period];

    const prompt = `Student ki ${periodLabel} ki performance:
- Accuracy: ${(body.accuracy * 100).toFixed(0)}%
- Tests diye: ${body.attempts}
- Improvement: ${body.improvement > 0 ? "+" : ""}${body.improvement.toFixed(1)}% (pichle period se)
- Streak: ${body.streak} din
- Kamzor subjects: ${weakSubjects || "koi nahi"}
- Mazboot subjects: ${strongSubjects || "abhi data nahi"}

3 specific, motivating study points Hindi mein do. Har point 1-2 lines. Practical aur actionable ho.`;

    const result = await completeJson<{ points: string[] }>({
      operation: "doubt",
      system:
        "You are a helpful Indian exam coach. Give 3 short, practical study tips in Hindi based on student data. Return JSON: { points: [\"tip1\", \"tip2\", \"tip3\"] }",
      user: prompt,
      schema: { type: "object", properties: { points: { type: "array", items: { type: "string" } } }, required: ["points"] },
    });

    const points: string[] = result.points ?? [];
    const text = points.map((p, i) => `${i + 1}. ${p}`).join("\n\n");
    return ok({ text });
  } catch (e) {
    return handleError(e);
  }
}
