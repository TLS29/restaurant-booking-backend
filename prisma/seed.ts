import prisma from "../src/config/databases/prisma";
import { hashPassword } from "../src/utils/password";

async function main() {
  console.log("🌱 Seeding database...");

  // Check if super_admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@booking.com" },
  });

  if (existingAdmin) {
    console.log("⚠️  Super admin already exists, skipping...");
    return;
  }

  // Create super_admin
  const hashedPassword = await hashPassword("password123");

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@booking.com",
      passwordHash: hashedPassword,
      firstName: "Jonathan",
      lastName: "Admin",
      phone: null,
      role: "super_admin",
    },
  });

  console.log("✅ Super admin created:", superAdmin.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
