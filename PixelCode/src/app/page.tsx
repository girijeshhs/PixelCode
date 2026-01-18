import Link from "next/link";
import { DashboardPreview } from "@/components/DashboardPreview";
import { LeaderboardPreview } from "@/components/LeaderboardPreview";
import { ProfilePreview } from "@/components/ProfilePreview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="pixel-heading">PixelCode</p>
            <h1 className="text-3xl font-semibold">LeetCode progress, gamified.</h1>
            <p className="mt-2 text-sm text-pixel-muted">
              Track XP, streaks, and daily deltas with a retro dashboard that stays modern.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/register" className="pixel-button">
              Create account
            </Link>
            <Link href="/login" className="pixel-button-secondary">
              Sign in
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <DashboardPreview />
          <ProfilePreview />
        </div>

        <LeaderboardPreview footerText="Rank up by earning XP each day." />
      </div>
    </main>
  );
}
