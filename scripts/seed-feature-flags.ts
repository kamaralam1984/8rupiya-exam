import { PrismaClient } from "@prisma/client";
import { KNOWN_FEATURES } from "../lib/feature-flags";

async function main() {
  const db = new PrismaClient();
  for (const f of KNOWN_FEATURES) {
    await db.featureFlag.upsert({
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
    });
    console.log(`✓ ${f.key} (${f.label})`);
  }
  await db.platformSetting.upsert({
    where: { key: "paid_plan_kind" },
    update: {},
    create: { key: "paid_plan_kind", value: "MONTH" },
  });
  console.log(`✓ platform_setting: paid_plan_kind=MONTH (default)`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
