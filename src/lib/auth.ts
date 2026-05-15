import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export const COOKIE_NAME = "capstone_session";

export function createSessionToken(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function parseSessionToken(token: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return null;
  return { userId: user.id, email: user.email, name: user.name, role: user.role };
}
