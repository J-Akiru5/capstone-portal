import { prisma } from "@/lib/db";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return Response.json(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    }
  );
}
