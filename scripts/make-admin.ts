import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "kamaralam137@gmail.com";
  const password = "K12345678";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", emailVerifiedAt: new Date() },
    create: {
      email,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`OK: admin user ready -> id=${user.id} email=${user.email} role=${user.role}`);
}

main()
  .catch((e) => {
    console.error("FAIL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
