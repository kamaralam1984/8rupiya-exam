import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  examSlug: z.string(),
  subjectSlug: z.string().optional(),
  days: z.number().int().min(3).max(180).default(30),
  hoursDaily: z.number().min(0.5).max(12).default(2),
  language: z.enum(["en", "hi"]).default("en"),
  goal: z.string().max(200).optional(),
});

const SYSTEM = `You produce realistic, week-by-week study plans for Indian exam aspirants.

Hard rules:
- Distribute topics across days based on syllabus weightage.
- Include revision days and mock test days.
- Keep each daily task concrete (a topic name + activity), not vague.
- Output strict JSON, no prose outside JSON.

Schema:
{
  "examName": "...",
  "summary": "1-2 sentence overview",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "main theme",
      "days": [
        { "day": 1, "tasks": ["task 1", "task 2"], "mockTest": false }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2"]
}`;

type PlanResp = {
  examName: string;
  summary: string;
  weeks: { weekNumber: number; focus: string; days: { day: number; tasks: string[]; mockTest: boolean }[] }[];
  tips: string[];
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "plan", 6, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());
    const exam = await db.exam.findUnique({
      where: { slug: body.examSlug },
      include: { subjects: true },
    });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    const focusSubject = body.subjectSlug
      ? exam.subjects.find((s) => s.slug === body.subjectSlug)
      : null;
    if (body.subjectSlug && !focusSubject) return fail("Subject not found", 404, "SUBJECT_NOT_FOUND");

    const subjectsList = focusSubject ? [focusSubject.name] : exam.subjects.map((s) => s.name);

    const out = await completeJson<PlanResp>({
      operation: "plan",
      system: SYSTEM,
      user: `Exam: ${exam.name} (${exam.short})
Subjects: ${subjectsList.join(", ")}
${focusSubject ? `Focus subject only: ${focusSubject.name}. Do NOT include any other subject.` : ""}
Plan length: ${body.days} days
Daily study time: ${body.hoursDaily} hours
Language: ${body.language === "hi" ? "Hindi" : "English"}
${body.goal ? `Student goal: ${body.goal}` : ""}

Generate the plan. Return only JSON.`,
      maxTokens: 4000,
    });

    const saved = await db.studyPlan.create({
      data: {
        userId: user.id,
        examSlug: body.examSlug,
        days: body.days,
        hoursDaily: body.hoursDaily,
        language: body.language,
        goal: body.goal,
        plan: out as any,
      },
    });
    return ok({ id: saved.id, ...out });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const plans = await db.studyPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    return ok(plans);
  } catch (e) {
    return handleError(e);
  }
}
