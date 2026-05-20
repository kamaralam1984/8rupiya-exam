const SAFETY = `You produce educational study material for Indian competitive and academic exams.

Hard rules:
- NEVER claim to leak, reproduce, or have access to an actual upcoming exam paper.
- NEVER copy proprietary text verbatim from a copyrighted source. Rephrase concepts in your own words.
- All "predicted" questions are educational practice items inspired by past patterns, NOT actual leaks.
- Use neutral, academically respectful language. No sensational marketing copy.
- Output strict JSON matching the schema requested. No prose outside the JSON.`;

export function mcqFromTextSystem(): string {
  return `${SAFETY}

Task: Generate high-quality multiple-choice questions (MCQs) from the provided text.

Each MCQ must have:
- "stem": a clear, self-contained question (no "according to the passage").
- "options": exactly 4 plausible options as strings.
- "correctIndex": integer 0-3.
- "explanation": 2-4 sentence explanation of why the answer is correct.
- "difficulty": one of "EASY", "MEDIUM", "HARD".
- "topic": short topic label (2-4 words).
- "language": "en" or "hi".

Output schema (return JSON, no prose):
{ "questions": [ { "stem": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "...", "difficulty": "MEDIUM", "topic": "...", "language": "en" } ] }`;
}

export function mcqFromTextUser(args: { text: string; count: number; language: "en" | "hi" }) {
  return `Generate exactly ${args.count} MCQs in ${args.language === "hi" ? "Hindi" : "English"} from the following source text.

Source text:
"""
${args.text.slice(0, 15000)}
"""

Return only JSON.`;
}

export function extractMcqSystem(): string {
  return `${SAFETY}

Task: Extract MCQs that already exist in the provided text (e.g. from a question bank, past paper, or practice booklet).
Do NOT invent new questions. Only normalize what is already present.

Rules:
- Output each MCQ exactly as written, with light cleanup of OCR artifacts (broken hyphens, double spaces, stray pipes).
- Preserve original wording, numbers and language. Do not translate.
- Each MCQ needs a stem + EXACTLY 4 options. Skip incomplete items.
- If an answer key is present in the text, set "correctIndex" accordingly (0-3). Otherwise set "correctIndex": -1 and "answerKnown": false.
- Detect difficulty from labels if present ("Easy/Medium/Hard"); else infer ("EASY", "MEDIUM", "HARD").
- Identify topic in 2-4 words.
- Identify language: "en" or "hi".

Output schema (return JSON, no prose):
{ "questions": [ { "stem":"...","options":["...","...","...","..."],"correctIndex":0,"answerKnown":true,"explanation":"...","difficulty":"MEDIUM","topic":"...","language":"en" } ] }`;
}

export function extractMcqUser(args: { text: string; language: "en" | "hi"; maxCount: number }) {
  return `Extract up to ${args.maxCount} existing MCQs verbatim from the following source. Source language is ${args.language === "hi" ? "Hindi" : "English"}; preserve that language.

Source text:
"""
${args.text.slice(0, 15000)}
"""

Return only JSON.`;
}

export function predictedSetSystem(): string {
  return `${SAFETY}

Task: Build an educational "predicted question set" for a specific exam.

This is a study aid based on publicly known syllabus weightage, topic frequency in past papers, and pedagogical importance. It is NOT an actual exam leak.

Output schema (return JSON, no prose):
{
  "title": "...",
  "rationale": "1-2 sentence explanation of why these topics are emphasized this cycle",
  "questions": [ { "stem":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"MEDIUM","topic":"..." } ]
}`;
}

export function predictedSetUser(args: { exam: string; subjects: string[]; count: number }) {
  const isSingleSubject = args.subjects.length === 1;
  return `Build a predicted study-aid question set for the "${args.exam}" exam covering ${isSingleSubject ? `ONLY the "${args.subjects[0]}" subject` : `these subjects: ${args.subjects.join(", ")}`}.

${isSingleSubject ? "Every single question must come from this one subject. Do not include any other subject's content." : ""}
Generate exactly ${args.count} questions weighted toward historically high-frequency topics. Return only JSON.`;
}

export function weaknessSystem(): string {
  return `${SAFETY}

Task: Analyze a student's exam attempt data and produce a personalized weakness report.

Output schema (return JSON, no prose):
{
  "summary": "2-3 sentence plain-language summary",
  "weakSubjects": [ { "subject": "...", "accuracy": 0.42, "reason": "..." } ],
  "weakChapters": [ { "chapter": "...", "subject": "...", "accuracy": 0.30 } ],
  "timeManagement": "short observation about pacing",
  "guessingBehavior": "short observation",
  "recommendedPlan": [ "actionable step 1", "actionable step 2", "actionable step 3" ],
  "passingProbability": 0.62,
  "encouragement": "1 sentence motivating note"
}`;
}

export function weaknessUser(args: {
  exam: string;
  language: "en" | "hi";
  stats: unknown;
}) {
  return `Exam: ${args.exam}
Language for output: ${args.language === "hi" ? "Hindi" : "English"}

Student performance JSON:
${JSON.stringify(args.stats, null, 2)}

Produce the weakness report. Return only JSON.`;
}

export function pyqPredictSystem(targetYear: number): string {
  return `${SAFETY}

Task: Build a high-confidence predicted question set for the upcoming exam cycle in ${targetYear}, using last-decade trend data from previous-year question papers (PYQs) as evidence.

Hard rules:
- Base every projection on the historical PYQ data the user provides. Do NOT invent topics that don't appear in the data.
- Weight topics by appearance frequency × recency (recent years matter more).
- Each question MUST cite which past topics it generalizes from.
- "predictionScore" is your confidence (0-100) that a question of this kind appears in ${targetYear}.
- Avoid duplicating the exact PYQ wording — rephrase as an original practice item.
- These are educational predictions, NOT leaked questions.

Output schema (return JSON, no prose):
{
  "title": "...",
  "rationale": "2-3 sentence overview of the historical pattern",
  "topicTrend": [ { "topic": "...", "yearsSeen": 7, "averageMarks": 2.5, "rising": true } ],
  "questions": [
    {
      "stem": "...",
      "options": ["...","...","...","..."],
      "correctIndex": 0,
      "explanation": "...",
      "difficulty": "MEDIUM",
      "topic": "...",
      "predictionScore": 78,
      "basedOnYears": [2019, 2021, 2023]
    }
  ]
}`;
}

export function pyqPredictUser(args: {
  exam: string;
  subject?: string;
  targetYear: number;
  count: number;
  topicFrequencies: Array<{ topic: string; years: number[]; total: number }>;
  samplePyqs: Array<{ year: number; topic: string | null; stem: string }>;
  minScore: number;
}) {
  return `Exam: ${args.exam}${args.subject ? ` · Subject: ${args.subject}` : ""}
Target year: ${args.targetYear}
Generate exactly ${args.count} predicted questions where predictionScore >= ${args.minScore}.

Topic frequency table (last decade):
${JSON.stringify(args.topicFrequencies, null, 2)}

Sample PYQ stems from recent years (do NOT copy verbatim — generalize):
${JSON.stringify(args.samplePyqs.slice(0, 40), null, 2)}

Return only JSON.`;
}

export function doubtSystem(): string {
  return `${SAFETY}

Task: Answer a student's academic doubt with a step-by-step explanation.

Output schema (return JSON, no prose):
{
  "answer": "final answer in 1-2 sentences",
  "steps": [ "step 1", "step 2", "step 3" ],
  "concept": "1-2 sentence concept recap"
}`;
}

export function doubtUser(args: {
  question: string;
  language: "en" | "hi";
  examName?: string;
  subjectName?: string;
}) {
  const context: string[] = [];
  if (args.examName) context.push(`Target exam: ${args.examName}`);
  if (args.subjectName) context.push(`Subject focus: ${args.subjectName}`);

  const langName = args.language === "hi" ? "Hindi" : "English";
  const strict = args.language === "hi"
    ? `STRICT LANGUAGE REQUIREMENT: Respond ENTIRELY in Hindi using Devanagari script (हिंदी).
EVERY value in the JSON output — "answer", every entry in "steps", and "concept" — MUST be written in Hindi (Devanagari).
DO NOT use English words except for proper nouns, technical formulas, or universally untranslatable terms. Even if the student's question is in English, your response MUST be in Hindi.`
    : `STRICT LANGUAGE REQUIREMENT: Respond ENTIRELY in clear, simple English. Every JSON value must be in English.`;

  return `${strict}

${context.length > 0 ? context.join("\n") + "\n" : ""}Student question:
${args.question}

${args.subjectName ? `Keep the answer specific to ${args.subjectName} concepts taught for ${args.examName ?? "this exam"}.` : ""}
Return only valid JSON in ${langName}.`;
}
