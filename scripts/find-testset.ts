import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  const ts = await db.testSet.findFirst({
    where: { isPublished: true, isPremium: false },
    orderBy: { createdAt: "desc" },
  });
  if (!ts) {
    console.log("NONE");
  } else {
    const qcount = await db.testSetQuestion.count({ where: { testSetId: ts.id } });
    console.log(`slug=${ts.slug} qcount=${qcount} duration=${ts.durationMin}`);
  }
  await db.$disconnect();
}
main();
