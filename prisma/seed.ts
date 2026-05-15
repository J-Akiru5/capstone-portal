import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSQLite } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const sqlite = new Database(path.resolve("./prisma/dev.db"));
const adapter = new PrismaBetterSQLite(sqlite);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { email: "admin@isuft.edu", name: "Administrator", password: "admin123", role: "ADMIN" as const },
    { email: "adviser@isuft.edu", name: "Dr. Santos", password: "adviser123", role: "ADVISER" as const },
    { email: "student@isuft.edu", name: "Juan dela Cruz", password: "student123", role: "STUDENT" as const },
    { email: "panel@isuft.edu", name: "Prof. Reyes", password: "panel123", role: "PANEL" as const },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      await prisma.user.create({ data: { email: u.email, name: u.name, passwordHash, role: u.role } });
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`Skipped (already exists): ${u.email}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
