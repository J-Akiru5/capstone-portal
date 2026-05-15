import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskStatus } from "@/generated/prisma/client";

interface Params {
  params: Promise<{ taskId: string }>;
}

const VALID: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) {
    if (!VALID.includes(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = body.status;
  }
  if (body.position !== undefined) updateData.position = body.position;

  const task = await prisma.kanbanTask.update({
    where: { id: Number(taskId) },
    data: updateData,
  });
  return Response.json(task);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await prisma.kanbanTask.delete({ where: { id: Number(taskId) } });
  return Response.json({ ok: true });
}
