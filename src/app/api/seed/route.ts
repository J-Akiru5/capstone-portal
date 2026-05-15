import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  const users = [
    { email: "admin@isuft.edu", name: "Administrator", password: "admin123", role: "ADMIN" as const },
    { email: "adviser@isuft.edu", name: "Dr. Santos", password: "adviser123", role: "ADVISER" as const },
    { email: "student@isuft.edu", name: "Juan dela Cruz", password: "student123", role: "STUDENT" as const },
    { email: "panel@isuft.edu", name: "Prof. Reyes", password: "panel123", role: "PANEL" as const },
  ];

  const created = [];
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      const user = await prisma.user.create({
        data: { email: u.email, name: u.name, passwordHash, role: u.role },
      });
      created.push(user.email);
    }
  }
  return Response.json({ seeded: created });
}
