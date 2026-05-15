"use client";

import { useState } from "react";
import { getRubric, getTotalMaxScore, computeTotal } from "@/lib/rubrics";

interface GradingSheetProps {
  proposalId: number;
  stage: "PROPOSAL" | "FINAL_DEFENSE";
  onSaved?: () => void;
}

export default function GradingSheetForm({ proposalId, stage, onSaved }: GradingSheetProps) {
  const rubric = getRubric(stage);
  const maxTotal = getTotalMaxScore(stage);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = computeTotal(scores, stage);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/proposals/${proposalId}/grading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, criteria: rubric.map((c) => c.key), scores, remarks }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      onSaved?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">
          {stage === "PROPOSAL" ? "Proposal Defense" : "Final Defense"} Rubric
        </h3>
        <span className="text-sm font-medium text-blue-700">
          Total: {total} / {maxTotal}
        </span>
      </div>
      {rubric.map((criterion) => (
        <div key={criterion.key} className="border rounded p-3 bg-gray-50">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-sm">{criterion.label}</p>
              <p className="text-xs text-gray-500">{criterion.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <input
                type="number"
                min={0}
                max={criterion.maxScore}
                value={scores[criterion.key] ?? ""}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [criterion.key]: Math.min(Number(e.target.value), criterion.maxScore),
                  }))
                }
                className="w-16 border rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">/ {criterion.maxScore}</span>
            </div>
          </div>
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Optional remarks for the group…"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : saved ? "✓ Saved" : "Submit Grade"}
      </button>
    </form>
  );
}
