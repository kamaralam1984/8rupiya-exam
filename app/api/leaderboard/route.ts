import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export const revalidate = 60;

export async function GET() {
  try {
    const top = await db.user.findMany({
      where: { xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, xp: true, streak: true },
    });
    const board = top.map((u, i) => ({
      rank: i + 1,
      name: u.name ?? (u.email ? u.email.split("@")[0] : "Anonymous"),
      xp: u.xp,
      streak: u.streak,
    }));
    return ok(board);
  } catch (e) {
    return handleError(e);
  }
}
