import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProposalStatus } from "@/generated/prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: ProposalStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
];

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "ADVISER" && session.role !== "PANEL") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const proposal = await prisma.proposal.update({
    where: { id: Number(id) },
    data: { status },
  });
  return Response.json(proposal);
}
