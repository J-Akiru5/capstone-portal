import { prisma } from "@/lib/db";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();
  if (!email || !password || !name) {
    return Response.json({ error: "Name, email and password required" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }
  const allowedRoles: Role[] = ["STUDENT", "ADVISER", "PANEL"];
  const userRole: Role = allowedRoles.includes(role) ? role : "STUDENT";
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: userRole },
  });
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return Response.json(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    {
      status: 201,
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    }
  );
}
