import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { proposalId: Number(id) },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(comments);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) {
    return Response.json({ error: "Content required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { proposalId: Number(id), authorId: session.userId, content },
    include: { author: true },
  });
  return Response.json(comment, { status: 201 });
}
