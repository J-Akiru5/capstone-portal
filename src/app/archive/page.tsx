"use client";

import { useEffect, useState } from "react";
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

export default function ArchivePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proposals?archived=true")
      .then((r) => r.json())
      .then(setProposals)
      .finally(() => setLoading(false));
  }, []);

  const filtered = proposals.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Research Archive</h1>
      <p className="text-gray-500 text-sm mb-6">Browse completed and archived research proposals</p>

      <input
        type="text"
        placeholder="Search archived proposals…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md border rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          <p className="text-4xl mb-3">📚</p>
          <p>No archived proposals yet.</p>
          <Link href="/proposals" className="text-blue-600 hover:underline text-sm mt-2 block">
            View active proposals
          </Link>
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
