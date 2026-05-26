import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== process.env.KVL_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await db.plan.findMany({
    orderBy: { priceInPaise: "asc" },
    select: {
      id: true,
      name: true,
      priceInPaise: true,
      features: true,
    },
  });

  const products = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.priceInPaise / 100,
    currency: "INR",
    features: plan.features,
  }));

  return Response.json({ products, total: products.length });
}
