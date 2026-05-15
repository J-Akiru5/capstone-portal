import { prisma } from "@/lib/db";

function getTrigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/\s+/g, " ").trim();
  const padded = `  ${s} `;
  const trigrams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

export function trigramSimilarity(a: string, b: string): number {
  const ta = getTrigrams(a);
  const tb = getTrigrams(b);
  let intersection = 0;
  for (const t of ta) {
    if (tb.has(t)) intersection++;
  }
  return (2 * intersection) / (ta.size + tb.size);
}

export interface SimilarTitle {
  id: number;
  title: string;
  similarity: number;
}

export async function findSimilarTitles(
  title: string,
  excludeId?: number
): Promise<SimilarTitle[]> {
  const proposals = await prisma.proposal.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, title: true },
  });

  return proposals
    .map((p) => ({ id: p.id, title: p.title, similarity: trigramSimilarity(title, p.title) }))
    .filter((p) => p.similarity >= 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}
