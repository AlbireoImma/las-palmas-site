import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
  const playerPassword = "Jugador1234!";

  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@laspalmas.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@laspalmas.com",
      passwordHash: adminHash,
      role: "ADMINISTRADOR",
      emailVerified: new Date(),
    },
  });

  console.log("✓ Admin created:", admin.email);

  const categories = ["PRIMERA", "SEGUNDA", "SENIOR"] as const;
  for (const category of categories) {
    const email = `capitan.${category.toLowerCase()}@laspalmas.com`;
    const userHash = await bcrypt.hash(playerPassword, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `Capitán ${category}`,
        email,
        passwordHash: userHash,
        role: "JUGADOR",
        emailVerified: new Date(),
      },
    });

    await prisma.player.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: "Capitán",
        lastName: category,
        dorsal: 10,
        position: "Centrocampista",
        category,
        isActive: true,
      },
    });

    console.log(`✓ Player created: ${email}`);
  }

  const season = "2025-2026";
  for (const category of categories) {
    await prisma.teamSeason.upsert({
      where: { category_season: { category, season } },
      update: {},
      create: { category, season },
    });
  }

  console.log("✓ TeamSeason records created for", season);
  console.log("\nSeed complete!");
  console.log("Admin login → admin@laspalmas.com / Admin1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
