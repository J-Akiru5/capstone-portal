"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProposalCard from "@/components/ProposalCard";

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

const STATUS_FILTERS = ["ALL", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) { router.push("/login"); return null; }
        return r.json();
      })
      .then((u) => {
        if (!u) return;
        setRole(u.role);
        fetch("/api/proposals")
          .then((r) => r.json())
          .then(setProposals)
          .finally(() => setLoading(false));
      });
  }, [router]);

  const filtered = proposals.filter((p) => {
    const matchStatus = filter === "ALL" || p.status === filter;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
        {role === "STUDENT" && (
          <Link
            href="/proposals/new"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            + New Proposal
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search proposals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === s
                  ? "bg-blue-700 text-white border-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl border">
          No proposals match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
