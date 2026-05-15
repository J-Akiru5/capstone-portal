"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
        <p className="text-sm text-gray-500 mb-6">ISUFT Capstone Portal</p>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@isuft.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        <div className="mt-4 pt-4 border-t text-xs text-gray-400">
          <p className="font-medium mb-1">Demo accounts:</p>
          <p>admin@isuft.edu / admin123</p>
          <p>adviser@isuft.edu / adviser123</p>
          <p>student@isuft.edu / student123</p>
          <p>panel@isuft.edu / panel123</p>
        </div>
      </div>
    </div>
  );
}
