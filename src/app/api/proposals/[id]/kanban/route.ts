import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const tasks = await prisma.kanbanTask.findMany({
    where: { proposalId: Number(id) },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
  return Response.json(tasks);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, description, status } = await req.json();
  if (!title) return Response.json({ error: "Title required" }, { status: 400 });

  const count = await prisma.kanbanTask.count({ where: { proposalId: Number(id) } });
  const task = await prisma.kanbanTask.create({
    data: {
      proposalId: Number(id),
      title,
      description,
      status: status ?? "TODO",
      position: count,
    },
  });
  return Response.json(task, { status: 201 });
}
