import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { doubtSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { doubtSystem, doubtUser } from "@/lib/ai/prompts";
import { checkFeatureAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

type DoubtResp = { answer: string; steps: string[]; concept: string };

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const gate = await checkFeatureAccess("ai_doubt", user.id);
    if (gate === "disabled") return fail("This feature is disabled.", 403, "FEATURE_DISABLED");
    if (gate === "paywall") return fail("Upgrade to unlock AI Doubt Solver.", 402, "PAYMENT_REQUIRED");

    const rl = await rateLimitUser(user, "doubt", 30, 3600);
    if (!rl.ok) return fail("Hourly doubt limit reached", 429, "RATE_LIMITED");

    const body = doubtSchema.parse(await req.json());

    let examName: string | undefined;
    let subjectName: string | undefined;
    if (body.examSlug) {
      const exam = await db.exam.findUnique({
        where: { slug: body.examSlug },
        select: {
          name: true,
          subjects: body.subjectSlug ? { where: { slug: body.subjectSlug }, select: { name: true } } : false,
        },
      });
      if (exam) {
        examName = exam.name;
        if (body.subjectSlug && exam.subjects && exam.subjects[0]) subjectName = exam.subjects[0].name;
      }
    }

    const imageDataUrls = body.imageDataUrls ?? (body.imageDataUrl ? [body.imageDataUrl] : []);
    const hasImage = imageDataUrls.length > 0;

    const res = await completeJson<DoubtResp>({
      system: doubtSystem(),
      user: doubtUser({ question: body.question, language: body.language, examName, subjectName }),
      imageDataUrls: imageDataUrls.length > 0 ? imageDataUrls : undefined,
      prefer: hasImage ? "quality" : "fast",
      maxTokens: 1200,
      operation: "doubt",
    });

    const saved = await db.doubt.create({
      data: {
        userId: user.id,
        question: body.question,
        imageUrl: body.imageUrl,
        language: body.language,
        answer: res.answer,
        steps: res.steps,
      },
    });
    return ok({ id: saved.id, ...res });
  } catch (e) {
    return handleError(e);
  }
}
