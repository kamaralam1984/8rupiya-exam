import { PrismaClient } from "@prisma/client";
import { EXAMS } from "../lib/exams";
import { QUESTION_BANK, type SampleQ } from "./question-bank";

const db = new PrismaClient();

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  let totalQuestions = 0;

  for (const e of EXAMS) {
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      create: {
        slug: e.slug,
        name: e.name,
        short: e.short,
        description: e.description,
        durationMin: parseInt(e.duration) || 60,
        questions: e.questions,
      },
      update: {
        name: e.name,
        short: e.short,
        description: e.description,
        durationMin: parseInt(e.duration) || 60,
        questions: e.questions,
      },
    });

    // Upsert all subjects for this exam
    const subjectIdBySlug = new Map<string, string>();
    for (const subjectName of e.subjects) {
      const slug = slugify(subjectName);
      const subject = await db.subject.upsert({
        where: { examId_slug: { examId: exam.id, slug } },
        create: { examId: exam.id, name: subjectName, slug },
        update: { name: subjectName },
      });
      subjectIdBySlug.set(slug, subject.id);
    }

    // Seed exam-specific questions attached to the correct subject.
    // Falls back to the first subject if a particular subject has no questions in the bank.
    const examQs = QUESTION_BANK[e.slug] ?? {};
    const firstSubjectId = subjectIdBySlug.values().next().value as string | undefined;
    const questionIds: string[] = [];

    for (const subjectName of e.subjects) {
      const subjectSlug = slugify(subjectName);
      const subjectId = subjectIdBySlug.get(subjectSlug) ?? firstSubjectId;
      const bank: SampleQ[] = examQs[subjectSlug] ?? [];

      for (let i = 0; i < bank.length; i++) {
        const tpl = bank[i];
        const source = `seed:${e.slug}:${subjectSlug}:${i}`;
        const existing = await db.question.findFirst({ where: { source } });
        const q =
          existing ??
          (await db.question.create({
            data: {
              stem: tpl.stem,
              options: tpl.options,
              correctIndex: tpl.correctIndex,
              explanation: tpl.explanation,
              difficulty: tpl.difficulty,
              language: "en",
              source,
              approved: true,
              aiGenerated: false,
              subjectId,
              examSlug: e.slug,
            },
          }));
        // If the question existed but had no subjectId (older seed), backfill it.
        if (existing && !existing.subjectId && subjectId) {
          await db.question.update({
            where: { id: existing.id },
            data: { subjectId, examSlug: e.slug },
          });
        }
        questionIds.push(q.id);
        totalQuestions += existing ? 0 : 1;
      }
    }

    // Attach questions to test sets. Detects the legacy generic-question seed
    // (source format `seed:<slug>:<n>` with no subject part) and replaces those
    // attachments with the new exam-specific, subject-tagged questions.
    async function attachQuestions(testSetSlug: string, count: number) {
      const ts = await db.testSet.findUnique({ where: { slug: testSetSlug } });
      if (!ts) return;

      // Check whether current attachments point to OLD-format generic questions.
      const currentAttachments = await db.testSetQuestion.findMany({
        where: { testSetId: ts.id },
        include: { question: { select: { source: true } } },
      });
      const legacyRegex = new RegExp(`^seed:${e.slug}:\\d+$`);
      const hasLegacy = currentAttachments.some(
        (a) => a.question.source && legacyRegex.test(a.question.source),
      );

      if (currentAttachments.length > 0 && !hasLegacy) {
        // Already wired up with new questions — leave alone.
        return;
      }

      if (hasLegacy) {
        // Wipe legacy attachments before re-wiring.
        await db.testSetQuestion.deleteMany({ where: { testSetId: ts.id } });
      }

      const chosen = questionIds.slice(0, count);
      if (chosen.length === 0) return;
      await db.testSetQuestion.createMany({
        data: chosen.map((qid, idx) => ({
          testSetId: ts.id,
          questionId: qid,
          order: idx + 1,
          marksRight: 1,
          marksWrong: -0.25,
        })),
      });
    }

    // Free sample mock — first ~8 questions across subjects.
    const sampleSlug = `${e.slug}-sample-mock`;
    await db.testSet.upsert({
      where: { slug: sampleSlug },
      create: {
        examId: exam.id,
        slug: sampleSlug,
        title: `${e.name} Sample Mock Test`,
        description: `Free sample mock test for ${e.name} — covers ${e.subjects.join(", ")}.`,
        kind: "MOCK",
        durationMin: parseInt(e.duration) || 60,
        isPremium: false,
        priceInPaise: 0,
      },
      update: {},
    });
    await attachQuestions(sampleSlug, 8);

    // Subject-wise free mocks — one test set per subject so users can pick.
    for (const subjectName of e.subjects) {
      const subjectSlug = slugify(subjectName);
      const subjectId = subjectIdBySlug.get(subjectSlug);
      const bank = examQs[subjectSlug] ?? [];
      if (!subjectId || bank.length === 0) continue; // skip subjects with no Qs yet

      const tsSlug = `${e.slug}-${subjectSlug}-mock`;
      await db.testSet.upsert({
        where: { slug: tsSlug },
        create: {
          examId: exam.id,
          slug: tsSlug,
          title: `${e.name} · ${subjectName} Mock`,
          description: `Free ${subjectName} drill for ${e.name} — focused practice on this subject only.`,
          kind: "MOCK",
          durationMin: Math.max(15, Math.min(parseInt(e.duration) || 60, 30)),
          isPremium: false,
          priceInPaise: 0,
        },
        update: {},
      });

      // Attach only this subject's questions.
      const ts = await db.testSet.findUnique({ where: { slug: tsSlug } });
      if (ts) {
        const have = await db.testSetQuestion.count({ where: { testSetId: ts.id } });
        if (have === 0) {
          const subjectQs = await db.question.findMany({
            where: { subjectId, source: { startsWith: `seed:${e.slug}:${subjectSlug}:` } },
            select: { id: true },
            orderBy: { source: "asc" },
          });
          if (subjectQs.length > 0) {
            await db.testSetQuestion.createMany({
              data: subjectQs.map((q, idx) => ({
                testSetId: ts.id,
                questionId: q.id,
                order: idx + 1,
                marksRight: 1,
                marksWrong: -0.25,
              })),
            });
          }
        }
      }
    }

    // Premium mock — all available questions for this exam.
    const premiumSlug = `${e.slug}-premium-mock-1`;
    await db.testSet.upsert({
      where: { slug: premiumSlug },
      create: {
        examId: exam.id,
        slug: premiumSlug,
        title: `${e.name} Premium Mock 1 (₹8)`,
        description: `AI-curated premium mock test for ${e.name} — unlock for ₹8.`,
        kind: "MOCK",
        durationMin: parseInt(e.duration) || 60,
        isPremium: true,
        priceInPaise: 800,
      },
      update: {},
    });
    await attachQuestions(premiumSlug, questionIds.length);

    console.log(`  · ${e.name.padEnd(18)} → ${questionIds.length} Qs across ${e.subjects.length} subjects`);
  }

  console.log(`\nSeeded ${EXAMS.length} exams · ${totalQuestions} new questions inserted (existing ones reused via source tag).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
