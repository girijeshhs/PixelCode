"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName,
        leetcodeUsername: leetcodeUsername || undefined
      })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Registration failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div className="space-y-2">
          <p className="pixel-heading">PixelCode</p>
          <h1 className="text-3xl font-semibold">Start your quest</h1>
          <p className="text-sm text-pixel-muted">
            Create an account and link your LeetCode username when you are ready.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pixel-card space-y-4 p-6">
          <div className="space-y-2">
            <label className="pixel-label" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              className="pixel-input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="PixelKnight"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="pixel-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="pixel-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="pixel-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="pixel-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="pixel-label" htmlFor="leetcode">
              LeetCode username (optional)
            </label>
            <input
              id="leetcode"
              className="pixel-input"
              value={leetcodeUsername}
              onChange={(event) => setLeetcodeUsername(event.target.value)}
              placeholder="leetcoder_123"
            />
          </div>

          {error ? <div className="text-sm text-rose-400">{error}</div> : null}

          <button className="pixel-button w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-sm text-pixel-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
