"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import GradingSheetForm from "@/components/GradingSheetForm";

interface SessionUser { userId: number; email: string; name: string; role: string; }

interface Proposal {
  id: number;
  title: string;
  abstract: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  group: {
    name: string;
    adviser?: { name: string } | null;
    members: { user: { id: number; name: string; email: string } }[];
  };
  documents: { id: number; filename: string; url: string }[];
  gradingSheets: { id: number; stage: string; totalScore: number; remarks?: string; grader: { name: string } }[];
  comments: { id: number; content: string; createdAt: string; author: { name: string; role: string } }[];
}

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"];

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [tab, setTab] = useState<"overview" | "kanban" | "grading" | "comments">("overview");
  const [gradingStage, setGradingStage] = useState<"PROPOSAL" | "FINAL_DEFENSE">("PROPOSAL");

  const id = params.id as string;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser);
    loadProposal();
  }, [id]);

  async function loadProposal() {
    const res = await fetch(`/api/proposals/${id}`);
    if (res.ok) setProposal(await res.json());
    setLoading(false);
  }

  async function updateStatus(status: string) {
    await fetch(`/api/proposals/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadProposal();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await fetch(`/api/proposals/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    setComment("");
    loadProposal();
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading…</div>;
  if (!proposal) return <div className="text-center py-16 text-gray-500">Proposal not found.</div>;

  const canGrade = user && (user.role === "PANEL" || user.role === "ADVISER" || user.role === "ADMIN");
  const canChangeStatus = user && (user.role === "ADMIN" || user.role === "ADVISER" || user.role === "PANEL");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/proposals" className="text-sm text-blue-600 hover:underline">← Proposals</Link>
      </div>

      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Group: <span className="font-medium">{proposal.group.name}</span>
              {proposal.group.adviser && <> · Adviser: <span className="font-medium">{proposal.group.adviser.name}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              proposal.status === "APPROVED" ? "bg-green-100 text-green-700" :
              proposal.status === "REJECTED" ? "bg-red-100 text-red-700" :
              proposal.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
              proposal.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {proposal.status.replace("_", " ")}
            </span>
            {canChangeStatus && (
              <select
                value={proposal.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b mb-6">
        {(["overview", "kanban", "grading", "comments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-blue-700 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "comments" && ` (${proposal.comments.length})`}
            {t === "grading" && ` (${proposal.gradingSheets.length})`}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-800 mb-2">Abstract</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{proposal.abstract}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Group Members</h2>
            <ul className="space-y-1">
              {proposal.group.members.map((m) => (
                <li key={m.user.id} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">
                    {m.user.name[0]}
                  </span>
                  {m.user.name}
                </li>
              ))}
            </ul>
          </div>
          {proposal.documents.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Documents</h2>
              <ul className="space-y-1">
                {proposal.documents.map((d) => (
                  <li key={d.id}>
                    <a href={d.url} className="text-sm text-blue-600 hover:underline">{d.filename}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "kanban" && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Task Board</h2>
          <KanbanBoard proposalId={proposal.id} readonly={!user} />
        </div>
      )}

      {tab === "grading" && (
        <div className="space-y-4">
          {canGrade && (
            <div className="bg-white rounded-xl border p-5">
              <div className="flex gap-4 mb-4">
                {(["PROPOSAL", "FINAL_DEFENSE"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setGradingStage(s)}
                    className={`text-sm font-medium px-3 py-1 rounded ${
                      gradingStage === s ? "bg-blue-700 text-white" : "border text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <GradingSheetForm proposalId={proposal.id} stage={gradingStage} onSaved={loadProposal} />
            </div>
          )}
          {proposal.gradingSheets.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Submitted Grades</h2>
              <div className="space-y-2">
                {proposal.gradingSheets.map((gs) => (
                  <div key={gs.id} className="flex justify-between items-center text-sm border rounded p-3">
                    <div>
                      <span className="font-medium">{gs.grader.name}</span>
                      <span className="text-gray-400 ml-2">({gs.stage.replace("_", " ")})</span>
                      {gs.remarks && <p className="text-xs text-gray-500 mt-1">{gs.remarks}</p>}
                    </div>
                    <span className="font-bold text-blue-700">{gs.totalScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "comments" && (
        <div className="bg-white rounded-xl border p-5">
          <div className="space-y-4 mb-6">
            {proposal.comments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No comments yet.</p>
            ) : (
              proposal.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.author.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{c.author.role}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {user && (
            <form onSubmit={submitComment} className="flex gap-2 border-t pt-4">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
