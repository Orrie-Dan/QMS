import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrator",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const defaultSettings = [
    { key: "org.name", value: "QMS Inc." },
    { key: "org.logoUrl", value: "" },
    { key: "org.currency", value: "USD" },
    { key: "tax.rate", value: "0.00" }
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


