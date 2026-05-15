import { findSimilarTitles } from "@/lib/similarity";

export async function POST(req: Request) {
  const { title, excludeId } = await req.json();
  if (!title) return Response.json({ error: "Title required" }, { status: 400 });
  const results = await findSimilarTitles(title, excludeId);
  return Response.json(results);
}
