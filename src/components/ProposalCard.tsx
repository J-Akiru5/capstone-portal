"use client";

import Link from "next/link";

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
  _count?: { comments: number; kanbanTasks: number };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-purple-100 text-purple-700",
};

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  const statusClass = STATUS_COLORS[proposal.status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-snug">{proposal.title}</h3>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>
          {proposal.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{proposal.abstract}</p>
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>
          <span className="font-medium">Group:</span> {proposal.group.name}
        </p>
        {proposal.group.adviser && (
          <p>
            <span className="font-medium">Adviser:</span> {proposal.group.adviser.name}
          </p>
        )}
        <p>
          <span className="font-medium">Members:</span>{" "}
          {proposal.group.members.map((m) => m.user.name).join(", ")}
        </p>
      </div>
      {proposal._count && (
        <div className="flex gap-3 text-xs text-gray-400 mb-3">
          <span>💬 {proposal._count.comments} comments</span>
          <span>📋 {proposal._count.kanbanTasks} tasks</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Updated {new Date(proposal.updatedAt).toLocaleDateString()}
        </span>
        <Link
          href={`/proposals/${proposal.id}`}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
