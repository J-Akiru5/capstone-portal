import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await prisma.group.findMany({
    include: {
      members: { include: { user: true } },
      adviser: true,
      proposal: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(groups);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, memberIds, adviserId } = await req.json();
  if (!name) return Response.json({ error: "Name required" }, { status: 400 });

  const group = await prisma.group.create({
    data: {
      name,
      ...(adviserId && { adviserId }),
      members: {
        create: [
          { userId: session.userId },
          ...(memberIds ?? [])
            .filter((id: number) => id !== session.userId)
            .map((id: number) => ({ userId: id })),
        ],
      },
    },
    include: { members: { include: { user: true } }, adviser: true },
  });
  return Response.json(group, { status: 201 });
}
