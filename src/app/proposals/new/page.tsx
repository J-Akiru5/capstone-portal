"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TitleSimilarityChecker from "@/components/TitleSimilarityChecker";

export default function NewProposalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, abstract }),
    });
    setLoading(false);
    if (res.ok) {
      const p = await res.json();
      router.push(`/proposals/${p.id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to submit proposal");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/proposals" className="text-sm text-blue-600 hover:underline">
          ← Back to Proposals
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Research Proposal</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Title
            <span className="text-gray-400 font-normal ml-1">(similarity check available)</span>
          </label>
          <TitleSimilarityChecker value={title} onChange={setTitle} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
          <textarea
            required
            rows={8}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide a concise summary of your research proposal…"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting…" : "Submit Proposal"}
          </button>
          <Link
            href="/proposals"
            className="flex-1 text-center border border-gray-300 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
