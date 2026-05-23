/**
 * SM-2 inspired spaced-repetition scheduler.
 * Stored per-card inside Bookmark.payload (kind="srs"):
 *   { questionId, ease, interval, reps, dueAt, lastReviewedAt, lapses }
 *
 * Grade scale (from review UI):
 *   0 = forgot   -> reset
 *   1 = hard
 *   2 = good
 *   3 = easy
 */

export type SrsState = {
  questionId: string;
  ease: number;       // 1.3 .. 2.8
  interval: number;   // days
  reps: number;
  lapses: number;
  dueAt: string;      // ISO
  lastReviewedAt?: string;
};

export function newCard(questionId: string): SrsState {
  return {
    questionId,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    dueAt: new Date().toISOString(),
  };
}

export function review(state: SrsState, grade: 0 | 1 | 2 | 3, now = new Date()): SrsState {
  let { ease, interval, reps, lapses } = state;

  if (grade === 0) {
    lapses += 1;
    reps = 0;
    interval = 1;                 // re-show tomorrow
    ease = Math.max(1.3, ease - 0.2);
  } else {
    if (reps === 0) interval = grade === 1 ? 1 : grade === 2 ? 2 : 4;
    else if (reps === 1) interval = grade === 1 ? 3 : grade === 2 ? 6 : 10;
    else interval = Math.round(interval * (grade === 1 ? ease - 0.15 : grade === 2 ? ease : ease + 0.15));
    reps += 1;
    ease = Math.max(1.3, ease + (grade === 1 ? -0.15 : grade === 2 ? 0 : 0.1));
  }

  const due = new Date(now);
  due.setDate(due.getDate() + Math.max(1, interval));

  return {
    ...state,
    ease,
    interval,
    reps,
    lapses,
    dueAt: due.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function isDue(state: SrsState, now = new Date()): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}
