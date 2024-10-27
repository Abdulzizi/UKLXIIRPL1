import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedManagerPassword = await bcrypt.hash("manager123", 10);
  const hashedKasirPassword = await bcrypt.hash("kasir123", 10);

  // Seed Users
  const user = await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedAdminPassword,
        role: "ADMIN",
      },
      {
        name: "Manager User",
        email: "manager@example.com",
        password: hashedManagerPassword,
        role: "MANAGER",
      },
      {
        name: "Kasir User",
        email: "kasir@example.com",
        password: hashedKasirPassword,
        role: "KASIR",
      },
    ],
  });

  // Seed MenuItems
  const menu = await prisma.menuItem.createMany({
    data: [
      { name: "Coffee", description: "Freshly brewed coffee", price: 2.5 },
      { name: "Sandwich", description: "Ham and cheese sandwich", price: 5.0 },
      { name: "Bagel", description: "Gluten-free bread", price: 2.0 },
    ],
  });

  // Seed Tables
  const table = await prisma.table.createMany({
    data: [
      { number: 1, capacity: 4, status: "AVAILABLE" },
      { number: 2, capacity: 2, status: "RESERVED" },
      { number: 3, capacity: 2, status: "OCCUPIED" },
      { number: 4, capacity: 3, status: "AVAILABLE" },
    ],
  });

  console.log({ user, menu, table });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
