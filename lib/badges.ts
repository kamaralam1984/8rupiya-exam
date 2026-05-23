export type BadgeDef = {
  code: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

export const BADGES: BadgeDef[] = [
  { code: "first_step",     title: "First Step",       description: "Completed your first attempt.",                emoji: "👶", gradient: "from-cyan-500 to-blue-500",       rarity: "common" },
  { code: "dpp_streak_7",   title: "7-Day Streak",     description: "Solved DPP 7 days in a row.",                  emoji: "🔥", gradient: "from-orange-500 to-rose-500",     rarity: "common" },
  { code: "dpp_streak_30",  title: "30-Day Streak",    description: "Iron discipline — 30 days unbroken.",          emoji: "⚡", gradient: "from-amber-500 to-orange-600",    rarity: "rare" },
  { code: "dpp_streak_100", title: "Centurion",        description: "100-day streak. Untouchable.",                 emoji: "👑", gradient: "from-yellow-400 to-amber-600",    rarity: "legendary" },
  { code: "perfect_mock",   title: "Perfect Score",    description: "100% in any mock test.",                       emoji: "🎯", gradient: "from-emerald-500 to-teal-500",    rarity: "epic" },
  { code: "battle_win_10",  title: "Duelist",          description: "Won 10 battle arena duels.",                   emoji: "⚔️", gradient: "from-indigo-500 to-purple-600",   rarity: "rare" },
  { code: "battle_win_100", title: "Gladiator",        description: "100 battle wins.",                             emoji: "🛡️", gradient: "from-purple-500 to-fuchsia-600",  rarity: "epic" },
  { code: "ai_user_50",     title: "AI Power User",    description: "50 AI doubt/predict/summarize calls.",         emoji: "🤖", gradient: "from-cyan-500 to-purple-600",     rarity: "rare" },
  { code: "early_bird",     title: "Early Bird",       description: "Studied before 6 AM (5 times).",               emoji: "🌅", gradient: "from-pink-500 to-rose-500",       rarity: "rare" },
  { code: "night_owl",      title: "Night Owl",        description: "Studied after midnight (5 times).",            emoji: "🦉", gradient: "from-violet-500 to-indigo-600",   rarity: "rare" },
  { code: "first_paid",     title: "₹8 Unlocked",      description: "First premium unlock — welcome to the club.",  emoji: "💎", gradient: "from-blue-500 to-cyan-500",       rarity: "common" },
  { code: "selection_band", title: "Selection Band",   description: "Hit 80%+ selection probability.",              emoji: "🏆", gradient: "from-amber-500 to-yellow-500",    rarity: "legendary" },
];

export function findBadge(code: string): BadgeDef | undefined {
  return BADGES.find((b) => b.code === code);
}
