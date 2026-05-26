import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.KVL_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      xp: true,
      streak: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const users = dbUsers.map((u) => ({
    id: u.id,
    name: u.name ?? u.email ?? u.phone ?? "Unknown",
    email: u.email ?? u.phone ?? "",
    role: "staff",
    status: u.lastSeenAt && u.lastSeenAt > thirtyDaysAgo ? "active" : "inactive",
    lastLogin: u.lastSeenAt ? u.lastSeenAt.toISOString() : undefined,
    createdAt: u.createdAt.toISOString().split("T")[0],
    xp: u.xp,
    streak: u.streak,
  }));

  return Response.json({ users, total: users.length });
}
