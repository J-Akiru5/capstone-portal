"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>🎓</span>
          <span>ISUFT Capstone Portal</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/proposals" className="hover:underline">Proposals</Link>
              {(user.role === "ADMIN" || user.role === "ADVISER" || user.role === "PANEL") && (
                <Link href="/grading" className="hover:underline">Grading</Link>
              )}
              <Link href="/archive" className="hover:underline">Archive</Link>
              <span className="text-blue-200 border-l border-blue-600 pl-4">
                {user.name} <span className="text-xs bg-blue-600 px-1 rounded">{user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="bg-white text-blue-800 px-3 py-1 rounded font-medium hover:bg-blue-50 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
