import { db } from "./db";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function bumpStreak(userId: string): Promise<{ streak: number; bumped: boolean }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { streak: 0, bumped: false };

  const today = new Date();
  const todayKey = dayKey(today);
  const last = user.lastSeenAt ? dayKey(user.lastSeenAt) : null;

  if (last === todayKey) {
    return { streak: user.streak, bumped: false };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = last === dayKey(yesterday);
  const newStreak = continued ? user.streak + 1 : 1;

  await db.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastSeenAt: today },
  });
  return { streak: newStreak, bumped: true };
}

export const BADGES: Record<string, { label: string; description: string }> = {
  FIRST_ATTEMPT: { label: "First Step", description: "Completed your first mock test" },
  PERFECT: { label: "Perfectionist", description: "100% accuracy on a mock" },
  SPEED_DEMON: { label: "Speed Demon", description: "Finished a mock in under half the time" },
  STREAK_7: { label: "Week Warrior", description: "7-day study streak" },
  STREAK_30: { label: "Month Master", description: "30-day study streak" },
  TOP_10: { label: "Top 10", description: "Reached the top 10 on the leaderboard" },
};

export async function awardBadges(args: {
  userId: string;
  accuracy: number;
  durationSec: number | null;
  durationMin: number;
  attemptsCount: number;
  streak: number;
}): Promise<string[]> {
  const earned: string[] = [];
  const grant = async (code: string) => {
    try {
      await db.userBadge.create({ data: { userId: args.userId, code } });
      earned.push(code);
    } catch {
      // unique constraint — already had it
    }
  };
  if (args.attemptsCount === 1) await grant("FIRST_ATTEMPT");
  if (args.accuracy >= 0.999) await grant("PERFECT");
  if (args.durationSec && args.durationSec < args.durationMin * 60 * 0.5) await grant("SPEED_DEMON");
  if (args.streak >= 7) await grant("STREAK_7");
  if (args.streak >= 30) await grant("STREAK_30");
  return earned;
}
