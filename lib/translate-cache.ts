"use client";
import { api } from "./api-client";

export type CachedTranslation = { stem: string; options: string[] };

const mem = new Map<string, CachedTranslation>(); // `${id}::${lang}` -> translation

function key(id: string, lang: string) {
  return `${id}::${lang}`;
}

function lsKey(id: string, lang: string) {
  return `8r_xlate:${key(id, lang)}`;
}

export function getCached(id: string, lang: string): CachedTranslation | null {
  const k = key(id, lang);
  const m = mem.get(k);
  if (m) return m;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lsKey(id, lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedTranslation;
    mem.set(k, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function setCached(id: string, lang: string, t: CachedTranslation) {
  const k = key(id, lang);
  mem.set(k, t);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(lsKey(id, lang), JSON.stringify(t));
  } catch {
    /* ignore quota */
  }
}

/**
 * Fire-and-forget prefetch of translations for many question ids.
 * Skips ids already in cache. Resolves when server response is folded into cache.
 */
export async function prefetchTranslations(args: {
  questionIds: string[];
  targetLang: "en" | "hi";
}): Promise<void> {
  const missing = args.questionIds.filter((id) => !getCached(id, args.targetLang));
  if (missing.length === 0) return;

  // chunk into 30-id batches (server caps at 60 per request)
  const CHUNK = 30;
  for (let i = 0; i < missing.length; i += CHUNK) {
    const batch = missing.slice(i, i + CHUNK);
    const r = await api<{
      items: Array<{ questionId: string; stem: string; options: string[] }>;
    }>("/api/i18n/translate-batch", {
      method: "POST",
      body: JSON.stringify({ questionIds: batch, targetLang: args.targetLang }),
    });
    if (!r.ok) continue;
    for (const it of r.data.items) {
      setCached(it.questionId, args.targetLang, { stem: it.stem, options: it.options });
    }
  }
}
