"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Proposal {
  id: number;
  title: string;
  status: string;
  group: { name: string; members: { user: { name: string } }[] };
  gradingSheets: { id: number; stage: string; totalScore: number; grader: { name: string } }[];
}

export default function GradingPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) { router.push("/login"); return null; }
        return r.json();
      })
      .then((u) => {
        if (!u) return;
        if (u.role === "STUDENT") { router.push("/dashboard"); return; }
        fetch("/api/proposals")
          .then((r) => r.json())
          .then(setProposals)
          .finally(() => setLoading(false));
      });
  }, [router]);

  if (loading) return <div className="text-center py-16 text-gray-500">Loading…</div>;

  const submitted = proposals.filter((p) =>
    ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(p.status)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Grading</h1>
      <p className="text-gray-500 text-sm mb-6">Review and grade submitted proposals</p>

      {submitted.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          No proposals ready for grading.
        </div>
      ) : (
        <div className="space-y-3">
          {submitted.map((p) => {
            const avgScore = p.gradingSheets.length > 0
              ? (p.gradingSheets.reduce((s, g) => s + g.totalScore, 0) / p.gradingSheets.length).toFixed(1)
              : null;
            return (
              <div key={p.id} className="bg-white border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500">
                    {p.group.name} · {p.group.members.map((m) => m.user.name).join(", ")}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      p.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {p.status.replace("_", " ")}
                    </span>
                    {avgScore && (
                      <span className="text-xs text-gray-500">
                        Avg score: <strong>{avgScore}</strong> ({p.gradingSheets.length} grader{p.gradingSheets.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/proposals/${p.id}?tab=grading`}
                  className="shrink-0 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Grade →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
