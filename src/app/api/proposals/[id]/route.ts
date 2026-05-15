import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id: Number(id) },
    include: {
      group: { include: { members: { include: { user: true } }, adviser: true } },
      documents: true,
      kanbanTasks: { orderBy: [{ status: "asc" }, { position: "asc" }] },
      gradingSheets: { include: { grader: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(proposal);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const proposal = await prisma.proposal.update({
    where: { id: Number(id) },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.abstract !== undefined && { abstract: body.abstract }),
    },
  });
  return Response.json(proposal);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "ADVISER")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.proposal.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
