import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.KVL_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      amountInPaise: true,
      currency: true,
      status: true,
      purpose: true,
      createdAt: true,
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  const orders = payments.map((p) => ({
    id: p.id,
    customer: p.user.name ?? p.user.email ?? p.user.phone ?? "Unknown",
    product: p.purpose,
    amount: p.amountInPaise / 100,
    status: p.status,
    createdAt: p.createdAt.toISOString().split("T")[0],
  }));

  const total = orders.reduce((a, b) => a + b.amount, 0);

  return Response.json({ orders, total, count: orders.length });
}
