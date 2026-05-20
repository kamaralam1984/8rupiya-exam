import { db } from "./db";

export type FeatureFlagRow = {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  requiresPaid: boolean;
  sortOrder: number;
};

export const KNOWN_FEATURES: Array<Omit<FeatureFlagRow, "enabled" | "requiresPaid"> & { defaultPaid?: boolean }> = [
  { key: "mock_tests",      label: "Mock Tests",         description: "Premium full-length mock test sets",                       sortOrder: 10 },
  { key: "pyq",             label: "Previous Year Qs",   description: "Previous year question bank",                             sortOrder: 20 },
  { key: "ai_doubt",        label: "AI Doubt Solver",    description: "AI-powered doubt clearing chatbot",                       sortOrder: 30 },
  { key: "ai_predict",      label: "Exam Predictor",     description: "AI predicts likely exam questions",                       sortOrder: 40 },
  { key: "ai_predict_2026", label: "Predict 2026",       description: "Predicted question paper for 2026",                       sortOrder: 50 },
  { key: "ai_notes",        label: "AI Notes",           description: "AI-generated summarised notes",                            sortOrder: 60 },
  { key: "ai_flashcards",   label: "AI Flashcards",      description: "AI-generated flashcards from material",                   sortOrder: 70 },
  { key: "ai_radar",        label: "Topic Radar",        description: "AI scans for trending exam topics",                        sortOrder: 80 },
  { key: "ai_planner",      label: "Study Planner",      description: "Personalised AI study plan",                              sortOrder: 90 },
  { key: "current_affairs", label: "Current Affairs",    description: "Daily current affairs MCQs",                              sortOrder: 100 },
  { key: "leaderboard",     label: "Leaderboard",        description: "Public student leaderboard",                              sortOrder: 110 },
  { key: "library",         label: "Book Library",       description: "PDF library with AI reader",                              sortOrder: 120 },
  { key: "bookmarks",       label: "Bookmarks",          description: "Save questions for later",                                sortOrder: 130 },
  { key: "refer",           label: "Referrals",          description: "Refer a friend, earn credit",                             sortOrder: 140 },
  { key: "voice",           label: "Voice Read-aloud",   description: "Text-to-speech for answers and explanations",             sortOrder: 150 },
];

export async function listFlags(): Promise<FeatureFlagRow[]> {
  const rows = await db.featureFlag.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    key: r.key,
    label: r.label,
    description: r.description,
    enabled: r.enabled,
    requiresPaid: r.requiresPaid,
    sortOrder: r.sortOrder,
  }));
}

export async function getFlag(key: string): Promise<FeatureFlagRow | null> {
  const r = await db.featureFlag.findUnique({ where: { key } });
  if (!r) return null;
  return {
    key: r.key,
    label: r.label,
    description: r.description,
    enabled: r.enabled,
    requiresPaid: r.requiresPaid,
    sortOrder: r.sortOrder,
  };
}

/** Ensure all KNOWN_FEATURES exist in DB (idempotent). */
export async function ensureSeededFlags() {
  await Promise.all(
    KNOWN_FEATURES.map((f) =>
      db.featureFlag.upsert({
        where: { key: f.key },
        update: { label: f.label, description: f.description ?? null, sortOrder: f.sortOrder },
        create: {
          key: f.key,
          label: f.label,
          description: f.description ?? null,
          sortOrder: f.sortOrder,
          enabled: true,
          requiresPaid: false,
        },
      }),
    ),
  );
}
