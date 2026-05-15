import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeTotal } from "@/lib/rubrics";
import { GradingStage } from "@/generated/prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const sheets = await prisma.gradingSheet.findMany({
    where: { proposalId: Number(id) },
    include: { grader: true },
  });
  return Response.json(sheets);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "PANEL" && session.role !== "ADVISER" && session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { stage, criteria, scores, remarks } = await req.json();

  if (!stage || !criteria || !scores) {
    return Response.json({ error: "stage, criteria, and scores required" }, { status: 400 });
  }

  const validStages: GradingStage[] = ["PROPOSAL", "FINAL_DEFENSE"];
  if (!validStages.includes(stage)) {
    return Response.json({ error: "Invalid stage" }, { status: 400 });
  }

  const totalScore = computeTotal(scores, stage as "PROPOSAL" | "FINAL_DEFENSE");

  const sheet = await prisma.gradingSheet.upsert({
    where: {
      proposalId_graderId_stage: {
        proposalId: Number(id),
        graderId: session.userId,
        stage,
      },
    },
    create: {
      proposalId: Number(id),
      graderId: session.userId,
      stage,
      criteria: JSON.stringify(criteria),
      scores: JSON.stringify(scores),
      totalScore,
      remarks,
    },
    update: {
      criteria: JSON.stringify(criteria),
      scores: JSON.stringify(scores),
      totalScore,
      remarks,
    },
    include: { grader: true },
  });

  return Response.json(sheet, { status: 201 });
}
