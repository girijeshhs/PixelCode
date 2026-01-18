"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardPreview } from "@/components/DashboardPreview";
import { ProfilePreview } from "@/components/ProfilePreview";
import { LeaderboardPreview } from "@/components/LeaderboardPreview";

type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  leetcodeUsername: string | null;
  createdAt: string;
  totalXp: number;
  level: number;
  streak: number;
  streakFreezeTokens: number;
  lastSnapshotAt: string | null;
};

type LeaderboardItem = {
  id: string;
  displayName: string;
  leetcodeUsername: string | null;
  totalXp: number;
  level: number;
  streak: number;
};

type ProgressItem = {
  progressDate: string;
  deltaEasy: number;
  deltaMedium: number;
  deltaHard: number;
  deltaTotal: number;
  xpEarned: number;
  streakAfter: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updateHandle, setUpdateHandle] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    const [profileRes, leaderboardRes, progressRes] = await Promise.all([
      fetch("/api/user/profile"),
      fetch("/api/leaderboard?page=1&pageSize=10"),
      fetch("/api/user/progress?days=14")
    ]);

    if (profileRes.status === 401) {
      router.push("/login");
      return;
    }

    if (!profileRes.ok) {
      setError("Failed to load profile");
      setLoading(false);
      return;
    }

    const profile = (await profileRes.json()) as UserProfile;
    const leaderboardPayload = (await leaderboardRes.json().catch(() => null)) as
      | { items?: LeaderboardItem[] }
      | null;
    const progressPayload = (await progressRes.json().catch(() => null)) as
      | { progress?: ProgressItem[] }
      | null;

    setUser(profile);
    setUpdateName(profile.displayName);
    setUpdateHandle(profile.leetcodeUsername ?? "");
    setLeaders(leaderboardPayload?.items ?? []);
    setProgress(progressPayload?.progress ?? []);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/leetcode/snapshot", { method: "POST" });
    setSyncing(false);
    await loadDashboard();
  }

  async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: updateName,
        leetcodeUsername: updateHandle || undefined
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Failed to update profile");
      return;
    }

    await loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    if (!user) {
      return [];
    }

    const solvedToday = progress.length ? progress[progress.length - 1]?.deltaTotal ?? 0 : 0;

    return [
      { label: "Total XP", value: user.totalXp.toLocaleString() },
      { label: "Level", value: user.level.toString() },
      { label: "Streak", value: `${user.streak} days` },
      { label: "Solved Today", value: solvedToday.toString() }
    ];
  }, [user, progress]);

  const xpProgress = useMemo(() => {
    if (!user) {
      return { current: 0, target: 1 };
    }
    const currentLevel = user.level;
    const nextLevelXp = Math.pow(currentLevel + 1, 2);
    const currentLevelXp = Math.pow(currentLevel, 2);
    return {
      current: Math.max(0, user.totalXp - currentLevelXp),
      target: Math.max(1, nextLevelXp - currentLevelXp)
    };
  }, [user]);

  const profileCard = useMemo(() => {
    if (!user) {
      return undefined;
    }
    const joinedLabel = new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
    return {
      displayName: user.displayName,
      leetcodeUsername: user.leetcodeUsername,
      joinedLabel
    };
  }, [user]);

  const lastSyncLabel = user?.lastSnapshotAt
    ? `Last sync: ${new Date(user.lastSnapshotAt).toLocaleString()}`
    : "Last sync: never";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="pixel-heading">PixelCode</p>
            <h1 className="text-3xl font-semibold">Your progress hub</h1>
            <p className="mt-2 text-sm text-pixel-muted">
              Track your daily deltas, sync new data, and climb the leaderboard.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="pixel-button" onClick={handleSync} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync now"}
            </button>
            <Link href="/" className="pixel-button-secondary">
              Back to home
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="pixel-card p-6 text-sm text-pixel-muted">Loading dashboard...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <DashboardPreview stats={dashboardStats} lastSyncLabel={lastSyncLabel} xpProgress={xpProgress} />
            <ProfilePreview
              profile={profileCard}
              footerText={`Streak freezes: ${user?.streakFreezeTokens ?? 0} available.`}
            />
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="pixel-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="pixel-heading">Daily progress</h2>
              <span className="pixel-badge">Last 14 days</span>
            </div>
            {progress.length === 0 ? (
              <div className="text-sm text-pixel-muted">
                No progress snapshots yet. Sync to start tracking daily deltas.
              </div>
            ) : (
              <div className="space-y-2">
                {progress.map((day) => (
                  <div
                    key={day.progressDate}
                    className="flex flex-wrap items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs"
                  >
                    <span className="text-pixel-muted">
                      {new Date(day.progressDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <span className="text-slate-100">+{day.deltaTotal} solved</span>
                    <span className="text-pixel-muted">{day.xpEarned} XP</span>
                    <span className="text-pixel-muted">Streak: {day.streakAfter}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pixel-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="pixel-heading">Update profile</h2>
              <span className="pixel-badge">LeetCode link</span>
            </div>
            <form className="space-y-4" onSubmit={handleUpdateProfile}>
              <div className="space-y-2">
                <label className="pixel-label" htmlFor="profileName">
                  Display name
                </label>
                <input
                  id="profileName"
                  className="pixel-input"
                  value={updateName}
                  onChange={(event) => setUpdateName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="pixel-label" htmlFor="profileHandle">
                  LeetCode username
                </label>
                <input
                  id="profileHandle"
                  className="pixel-input"
                  value={updateHandle}
                  onChange={(event) => setUpdateHandle(event.target.value)}
                  placeholder="leetcode_handle"
                />
              </div>
              {error ? <div className="text-sm text-rose-400">{error}</div> : null}
              <button className="pixel-button w-full" type="submit">
                Save changes
              </button>
            </form>
          </div>
        </section>

        <LeaderboardPreview
          leaders={leaders.map((leader) => ({
            name: leader.displayName,
            xp: leader.totalXp,
            streak: leader.streak
          }))}
          footerText="Top 10 global players"
        />
      </div>
    </main>
  );
}
