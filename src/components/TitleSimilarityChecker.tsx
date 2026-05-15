"use client";

import { useState } from "react";

interface SimilarTitle {
  id: number;
  title: string;
  similarity: number;
}

interface TitleSimilarityCheckerProps {
  value: string;
  onChange: (val: string) => void;
  excludeId?: number;
}

export default function TitleSimilarityChecker({
  value,
  onChange,
  excludeId,
}: TitleSimilarityCheckerProps) {
  const [similar, setSimilar] = useState<SimilarTitle[]>([]);
  const [checking, setChecking] = useState(false);

  async function checkSimilarity() {
    if (!value.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: value, excludeId }),
      });
      const data = await res.json();
      setSimilar(Array.isArray(data) ? data : []);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter research title…"
        />
        <button
          type="button"
          onClick={checkSimilarity}
          disabled={checking || !value.trim()}
          className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm border disabled:opacity-50 transition-colors"
        >
          {checking ? "Checking…" : "Check"}
        </button>
      </div>
      {similar.length > 0 && (
        <div className="border border-yellow-300 bg-yellow-50 rounded p-3">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Similar titles found ({similar.length}):
          </p>
          <ul className="space-y-1">
            {similar.map((s) => (
              <li key={s.id} className="text-sm text-yellow-700 flex justify-between">
                <span className="truncate mr-2">{s.title}</span>
                <span className="shrink-0 text-xs bg-yellow-200 px-1 rounded">
                  {Math.round(s.similarity * 100)}% similar
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {similar.length === 0 && value.trim() && !checking && (
        <p className="text-xs text-green-600">✓ No similar titles detected</p>
      )}
    </div>
  );
}
