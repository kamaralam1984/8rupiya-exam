import { completeJson } from "./llm";

export type TranslatedMcq = {
  stem: string;
  options: string[];
  explanation?: string;
};

const SYSTEM = `You translate educational MCQs accurately between English and Hindi.

Rules:
- Preserve meaning, technical terms, named entities, numbers, units, and proper nouns.
- Keep options aligned: option index N in input maps to index N in output.
- Use natural, exam-style Hindi (Devanagari script) when target is Hindi.
- For English, use clear academic English.
- Output strict JSON only.`;

function userPrompt(args: { stem: string; options: string[]; explanation?: string; targetLang: "en" | "hi" }) {
  return `Translate the following MCQ into ${args.targetLang === "hi" ? "Hindi" : "English"}.

Input JSON:
${JSON.stringify({ stem: args.stem, options: args.options, explanation: args.explanation ?? "" }, null, 2)}

Return JSON in this exact shape:
{ "stem": "...", "options": ["...","...","...","..."], "explanation": "..." }`;
}

export async function translateMcq(args: {
  stem: string;
  options: string[];
  explanation?: string;
  targetLang: "en" | "hi";
}): Promise<TranslatedMcq> {
  const out = await completeJson<TranslatedMcq>({
    system: SYSTEM,
    user: userPrompt(args),
    maxTokens: 1500,
    prefer: "fast",
    temperature: 0.2,
    operation: "translate",
  });
  if (!out?.stem || !Array.isArray(out.options) || out.options.length !== args.options.length) {
    throw new Error("Invalid translation response");
  }
  return out;
}

export type BatchInput = {
  id: string;
  stem: string;
  options: string[];
  explanation?: string;
};
export type BatchTranslated = { id: string; stem: string; options: string[]; explanation?: string };

const BATCH_SYSTEM = `You translate multiple educational MCQs accurately.

Rules:
- Preserve meaning, technical terms, numbers, units, and proper nouns.
- Keep options aligned: index N maps to index N.
- For Hindi, use natural exam-style Hindi in Devanagari.
- Return strict JSON only. No prose.`;

function batchUserPrompt(items: BatchInput[], targetLang: "en" | "hi") {
  return `Translate the following ${items.length} MCQs into ${targetLang === "hi" ? "Hindi" : "English"}.

Input JSON:
${JSON.stringify(items, null, 2)}

Return JSON in this exact shape (same ids and same option lengths):
{ "items": [ { "id": "...", "stem": "...", "options": ["...","..."], "explanation": "..." } ] }`;
}

export async function translateMcqBatch(args: {
  items: BatchInput[];
  targetLang: "en" | "hi";
}): Promise<BatchTranslated[]> {
  if (args.items.length === 0) return [];
  const out = await completeJson<{ items: BatchTranslated[] }>({
    system: BATCH_SYSTEM,
    user: batchUserPrompt(args.items, args.targetLang),
    maxTokens: Math.min(8000, 400 + args.items.length * 400),
    prefer: "fast",
    temperature: 0.2,
    operation: "translate",
  });
  if (!out?.items || !Array.isArray(out.items)) throw new Error("Invalid batch translation response");
  return out.items.filter((it) =>
    it && typeof it.id === "string" && typeof it.stem === "string" && Array.isArray(it.options) && it.options.length > 0
  );
}
