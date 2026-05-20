import type { Metadata } from "next";
import { LeaderboardView } from "./LeaderboardView";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top 100 students by XP on 8Rupia.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
