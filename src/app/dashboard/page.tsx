"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProposalCard from "@/components/ProposalCard";

interface SessionUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface Proposal {
  id: number;
  title: string;
  abstract: string;
  status: string;
  updatedAt: string;
  group: {
    name: string;
    adviser?: { name: string } | null;
    members: { user: { name: string } }[];
  };
  _count: { comments: number; kanbanTasks: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
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
        setUser(u);
        fetch("/api/proposals")
          .then((r) => r.json())
          .then(setProposals)
          .finally(() => setLoading(false));
      });
  }, [router]);

  if (!user) return null;

  const myProposals = proposals.filter((p) =>
    p.group.members.some((m) => m.user.name === user.name) ||
    (p.group.adviser?.name === user.name)
  );

  const displayProposals = user.role === "STUDENT" ? myProposals : proposals;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome, {user.name} — <span className="font-medium">{user.role}</span>
          </p>
        </div>
        {user.role === "STUDENT" && (
          <Link
            href="/proposals/new"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            + New Proposal
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Proposals", value: proposals.length, color: "bg-blue-50 text-blue-700" },
          { label: "Submitted", value: proposals.filter((p) => p.status === "SUBMITTED").length, color: "bg-yellow-50 text-yellow-700" },
          { label: "Approved", value: proposals.filter((p) => p.status === "APPROVED").length, color: "bg-green-50 text-green-700" },
          { label: "Under Review", value: proposals.filter((p) => p.status === "UNDER_REVIEW").length, color: "bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {user.role === "STUDENT" ? "My Proposals" : "All Proposals"}
        </h2>
        <Link href="/proposals" className="text-sm text-blue-600 hover:underline">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading proposals…</div>
      ) : displayProposals.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          <p className="text-4xl mb-3">📂</p>
          <p>No proposals yet.</p>
          {user.role === "STUDENT" && (
            <Link href="/proposals/new" className="text-blue-600 hover:underline text-sm mt-2 block">
              Submit your first proposal
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProposals.slice(0, 6).map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
