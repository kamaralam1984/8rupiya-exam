import { db } from "../lib/db";
import { extractPdfText, chunkText } from "../lib/ai/pdf-extract";
import { completeJson } from "../lib/ai/llm";
import {
  mcqFromTextSystem,
  mcqFromTextUser,
  extractMcqSystem,
  extractMcqUser,
} from "../lib/ai/prompts";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type Config = {
  mode: "book" | "questions" | "pyq";
  examSlug?: string;
  subjectSlug?: string;
  year?: number;
  durationMin: number;
  totalQuestions: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  language: "en" | "hi";
  title?: string;
  autoCreateTestSet: boolean;
  isPremium: boolean;
};

type Payload = {
  jobId: string;
  pdfId: string;
  storagePath: string;
  config: Config;
  subjectId: string | null;
};

type Generated = {
  questions: Array<{
    stem: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: Difficulty;
    topic: string;
    language: "en" | "hi";
    answerKnown?: boolean;
  }>;
};

function splitCounts(total: number, easyPct: number, mediumPct: number) {
  const easy = Math.round((easyPct / 100) * total);
  const medium = Math.round((mediumPct / 100) * total);
  const hard = Math.max(0, total - easy - medium);
  return { EASY: easy, MEDIUM: medium, HARD: hard };
}

function buildDifficultyPrompt(text: string, count: number, language: "en" | "hi", difficulty: Difficulty) {
  return `${mcqFromTextUser({ text, count, language })}\n\nAll generated questions MUST have difficulty="${difficulty}". Target a ${difficulty.toLowerCase()} level of reasoning and recall.`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function runPdfIngest(payload: Payload) {
  await db.aiJob.update({ where: { id: payload.jobId }, data: { status: "RUNNING" } });

  try {
    const { config, pdfId, storagePath, subjectId } = payload;

    const { text, pages } = await extractPdfText(storagePath);
    await db.pdf.update({
      where: { id: pdfId },
      data: { pageCount: pages, status: "EXTRACTED" },
    });

    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("No extractable text in PDF");

    const exam = config.examSlug
      ? await db.exam.findUnique({ where: { slug: config.examSlug } })
      : null;

    const createdIds: Record<Difficulty, string[]> = { EASY: [], MEDIUM: [], HARD: [] };

    if (config.mode === "questions" || config.mode === "pyq") {
      // Extract existing questions verbatim from each chunk
      const isPyq = config.mode === "pyq";
      let remaining = config.totalQuestions;
      for (const chunk of chunks) {
        if (remaining <= 0) break;
        const out = await completeJson<Generated>({
          system: extractMcqSystem(),
          user: extractMcqUser({ text: chunk, language: config.language, maxCount: Math.min(40, remaining) }),
          maxTokens: 2048,
          operation: "ingest",
        });
        if (!out?.questions?.length) continue;
        for (const q of out.questions) {
          if (remaining <= 0) break;
          if (!Array.isArray(q.options) || q.options.length !== 4) continue;
          const answerKnown = q.answerKnown !== false && typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex <= 3;
          const difficulty = (q.difficulty === "EASY" || q.difficulty === "HARD" ? q.difficulty : "MEDIUM") as Difficulty;
          const created = await db.question.create({
            data: {
              stem: q.stem,
              options: q.options,
              correctIndex: answerKnown ? q.correctIndex : 0,
              explanation: q.explanation ?? null,
              difficulty,
              language: q.language ?? config.language,
              source: `pdf:${pdfId}`,
              aiGenerated: true,
              approved: answerKnown,
              isPyq,
              year: isPyq ? config.year ?? null : null,
              topic: q.topic ?? null,
              examSlug: config.examSlug ?? null,
              pdfId,
              pdfHighlight: q.stem.slice(0, 200),
              subjectId: subjectId ?? undefined,
            },
            select: { id: true },
          });
          createdIds[difficulty].push(created.id);
          remaining -= 1;
        }
      }
    } else {
      // Book mode: generate per-difficulty MCQs to hit configured mix
      const targetCounts = splitCounts(config.totalQuestions, config.easyPct, config.mediumPct);

      for (const difficulty of ["EASY", "MEDIUM", "HARD"] as const) {
        let remaining = targetCounts[difficulty];
        if (remaining === 0) continue;

        let chunkIdx = 0;
        while (remaining > 0) {
          const chunk = chunks[chunkIdx % chunks.length];
          const ask = Math.min(remaining, Math.max(5, Math.ceil(remaining / chunks.length)));

          const out = await completeJson<Generated>({
            system: mcqFromTextSystem(),
            user: buildDifficultyPrompt(chunk, ask, config.language, difficulty),
            maxTokens: 4096,
            operation: "ingest",
          });
          if (!out?.questions?.length) {
            chunkIdx += 1;
            if (chunkIdx > chunks.length * 2) break;
            continue;
          }

          for (const q of out.questions) {
            if (remaining <= 0) break;
            if (!Array.isArray(q.options) || q.options.length !== 4) continue;
            if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3) continue;
            const created = await db.question.create({
              data: {
                stem: q.stem,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
                difficulty,
                language: q.language ?? config.language,
                source: `pdf:${pdfId}`,
                aiGenerated: true,
                approved: false,
                topic: q.topic ?? null,
                examSlug: config.examSlug ?? null,
                pdfId,
                pdfHighlight: chunk.slice(0, 200).trim(),
                subjectId: subjectId ?? undefined,
              },
              select: { id: true },
            });
            createdIds[difficulty].push(created.id);
            remaining -= 1;
          }
          chunkIdx += 1;
          if (chunkIdx > chunks.length * 3) break;
        }
      }
    }

    const allIds = [...createdIds.EASY, ...createdIds.MEDIUM, ...createdIds.HARD];

    let testSetId: string | null = null;
    if (config.autoCreateTestSet && exam && allIds.length > 0) {
      const baseTitle = config.title?.trim() || `${exam.name} — PDF set`;
      let slug = slugify(baseTitle);
      // ensure unique slug
      const existing = await db.testSet.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${pdfId.slice(0, 6)}`;

      const ts = await db.testSet.create({
        data: {
          examId: exam.id,
          title: baseTitle,
          slug,
          description: `Auto-generated from PDF ${payload.pdfId.slice(0, 8)}`,
          kind: "PDF",
          durationMin: config.durationMin,
          isPremium: config.isPremium,
          priceInPaise: config.isPremium ? 800 : 0,
          isPublished: false, // admin must publish after review
        },
      });
      testSetId = ts.id;
      let order = 1;
      for (const qid of allIds) {
        await db.testSetQuestion.create({
          data: {
            testSetId: ts.id,
            questionId: qid,
            order: order++,
            marksRight: 1,
            marksWrong: -0.25,
          },
        });
      }
    }

    await db.pdf.update({ where: { id: pdfId }, data: { status: "INGESTED" } });
    await db.aiJob.update({
      where: { id: payload.jobId },
      data: {
        status: "COMPLETED",
        output: {
          easy: createdIds.EASY.length,
          medium: createdIds.MEDIUM.length,
          hard: createdIds.HARD.length,
          total: allIds.length,
          testSetId,
        },
      },
    });
    return { created: allIds.length, testSetId };
  } catch (e: any) {
    await db.aiJob.update({
      where: { id: payload.jobId },
      data: { status: "FAILED", error: e?.message?.slice(0, 1000) ?? "unknown" },
    });
    throw e;
  }
}
