import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true";

  const proposals = await prisma.proposal.findMany({
    where: archived ? { status: "ARCHIVED" } : { status: { not: "ARCHIVED" } },
    include: {
      group: { include: { members: { include: { user: true } }, adviser: true } },
      documents: true,
      _count: { select: { comments: true, kanbanTasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(proposals);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, abstract, groupId } = await req.json();
  if (!title || !abstract) {
    return Response.json({ error: "Title and abstract required" }, { status: 400 });
  }

  let resolvedGroupId = groupId;

  if (!resolvedGroupId) {
    const existing = await prisma.groupMember.findFirst({
      where: { userId: session.userId },
      select: { groupId: true },
    });
    if (existing) {
      resolvedGroupId = existing.groupId;
    } else {
      const group = await prisma.group.create({
        data: {
          name: `${session.name}'s Group`,
          members: { create: { userId: session.userId } },
        },
      });
      resolvedGroupId = group.id;
    }
  }

  const hasProposal = await prisma.proposal.findUnique({
    where: { groupId: resolvedGroupId },
  });
  if (hasProposal) {
    return Response.json({ error: "Group already has a proposal" }, { status: 409 });
  }

  const proposal = await prisma.proposal.create({
    data: { title, abstract, groupId: resolvedGroupId },
    include: { group: true },
  });

  return Response.json(proposal, { status: 201 });
}
