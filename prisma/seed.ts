import "dotenv/config";
import prisma from "../src/config/databases/prisma";
import { hashPassword } from "../src/utils/password";

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await hashPassword("password123");

  // Create super_admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@booking.com" },
  });

  if (existingAdmin) {
    console.log("⚠️  Super admin already exists, skipping...");
  } else {
    const superAdmin = await prisma.user.create({
      data: {
        email: "admin@booking.com",
        passwordHash: hashedPassword,
        firstName: "Super",
        lastName: "Admin",
        phone: null,
        role: "super_admin",
      },
    });
    console.log("✅ Super admin created:", superAdmin.email);
  }

  // Create owner
  const existingOwner = await prisma.user.findUnique({
    where: { email: "owner@booking.com" },
  });

  if (existingOwner) {
    console.log("⚠️  Owner already exists, skipping...");
  } else {
    const owner = await prisma.user.create({
      data: {
        email: "owner@booking.com",
        passwordHash: hashedPassword,
        firstName: "Test",
        lastName: "Owner",
        phone: "1234567890",
        role: "owner",
      },
    });
    console.log("✅ Owner created:", owner.email);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
