import { PrismaClient, Difficulty } from "@prisma/client";
import { EXAMS } from "../lib/exams";

const db = new PrismaClient();

type SampleQ = {
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
};

const SAMPLE_BANK: SampleQ[] = [
  {
    stem: "If a train 120 m long is moving at 54 km/h, how long does it take to cross a stationary pole?",
    options: ["6 seconds", "8 seconds", "10 seconds", "12 seconds"],
    correctIndex: 1,
    explanation: "Speed 54 km/h = 15 m/s. Time = 120/15 = 8 seconds.",
    difficulty: "EASY",
  },
  {
    stem: "Find the next term in the series: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "48"],
    correctIndex: 2,
    explanation: "Differences are 4, 6, 8, 10, 12 — next is 30 + 12 = 42.",
    difficulty: "EASY",
  },
  {
    stem: "A is the brother of B. B is the sister of C. C is the father of D. How is D related to A?",
    options: ["Nephew or niece", "Son", "Cousin", "Brother"],
    correctIndex: 0,
    explanation: "C is A's sibling, D is C's child, so D is A's niece or nephew.",
    difficulty: "MEDIUM",
  },
  {
    stem: "Which Article of the Indian Constitution deals with the Right to Equality?",
    options: ["Article 14", "Article 19", "Article 21", "Article 32"],
    correctIndex: 0,
    explanation: "Article 14 guarantees equality before the law to all persons within India.",
    difficulty: "EASY",
  },
  {
    stem: "Choose the correctly spelled word.",
    options: ["Recieve", "Receive", "Receeve", "Recive"],
    correctIndex: 1,
    explanation: "The standard English spelling follows the 'i before e except after c' rule.",
    difficulty: "EASY",
  },
  {
    stem: "If the cost price of an article is ₹400 and it is sold at a profit of 25%, what is the selling price?",
    options: ["₹450", "₹475", "₹500", "₹525"],
    correctIndex: 2,
    explanation: "SP = CP × (1 + profit%) = 400 × 1.25 = ₹500.",
    difficulty: "EASY",
  },
  {
    stem: "Which of the following best describes constructivist pedagogy?",
    options: [
      "Students passively receive knowledge from the teacher",
      "Learners actively construct meaning through experience",
      "All learning must occur in a classroom",
      "Only assessments matter for learning",
    ],
    correctIndex: 1,
    explanation:
      "Constructivism (Piaget, Vygotsky) views learners as active builders of knowledge through experience and social interaction.",
    difficulty: "MEDIUM",
  },
  {
    stem: "The currency of Japan is:",
    options: ["Yuan", "Won", "Yen", "Ringgit"],
    correctIndex: 2,
    explanation: "Japan's official currency is the Yen (¥).",
    difficulty: "EASY",
  },
  {
    stem: "Solve: (3/4) ÷ (1/2) = ?",
    options: ["3/8", "3/2", "2/3", "4/3"],
    correctIndex: 1,
    explanation: "Dividing by a fraction is multiplying by its reciprocal: 3/4 × 2/1 = 3/2.",
    difficulty: "EASY",
  },
  {
    stem: "Choose the synonym of 'meticulous'.",
    options: ["Careless", "Painstaking", "Hasty", "Random"],
    correctIndex: 1,
    explanation: "'Meticulous' means showing great attention to detail; painstaking is a synonym.",
    difficulty: "MEDIUM",
  },
  {
    stem: "Photosynthesis primarily occurs in which part of a plant cell?",
    options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
    correctIndex: 2,
    explanation: "Chloroplasts contain chlorophyll, which captures light energy for photosynthesis.",
    difficulty: "EASY",
  },
  {
    stem: "Which Indian state has the longest coastline?",
    options: ["Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Gujarat"],
    correctIndex: 3,
    explanation: "Gujarat has the longest coastline among Indian states (~1,600 km).",
    difficulty: "MEDIUM",
  },
];

async function main() {
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

    for (const subjectName of e.subjects) {
      const slug = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.subject.upsert({
        where: { examId_slug: { examId: exam.id, slug } },
        create: { examId: exam.id, name: subjectName, slug },
        update: { name: subjectName },
      });
    }

    const firstSubject = await db.subject.findFirst({ where: { examId: exam.id } });

    // create or reuse sample questions tagged with `seed:<slug>`
    const questionIds: string[] = [];
    for (let i = 0; i < SAMPLE_BANK.length; i++) {
      const tpl = SAMPLE_BANK[i];
      const source = `seed:${exam.slug}:${i}`;
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
            subjectId: firstSubject?.id,
          },
        }));
      questionIds.push(q.id);
    }

    async function attachQuestions(testSetSlug: string, count: number) {
      const ts = await db.testSet.findUnique({ where: { slug: testSetSlug } });
      if (!ts) return;
      const have = await db.testSetQuestion.count({ where: { testSetId: ts.id } });
      if (have > 0) return;
      const chosen = questionIds.slice(0, count);
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

    const sampleSlug = `${e.slug}-sample-mock`;
    await db.testSet.upsert({
      where: { slug: sampleSlug },
      create: {
        examId: exam.id,
        slug: sampleSlug,
        title: `${e.name} Sample Mock Test`,
        description: `Free sample mock test for ${e.name}.`,
        kind: "MOCK",
        durationMin: parseInt(e.duration) || 60,
        isPremium: false,
        priceInPaise: 0,
      },
      update: {},
    });
    await attachQuestions(sampleSlug, 8);

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
    await attachQuestions(premiumSlug, SAMPLE_BANK.length);
  }

  console.log(`Seeded ${EXAMS.length} exams · ${SAMPLE_BANK.length} sample questions × ${EXAMS.length} = ${SAMPLE_BANK.length * EXAMS.length} questions · test sets populated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
