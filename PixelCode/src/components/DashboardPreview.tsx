"use client";

import { motion } from "framer-motion";

type DashboardStat = { label: string; value: string };

type DashboardPreviewProps = {
  stats?: DashboardStat[];
  lastSyncLabel?: string;
  xpProgress?: { current: number; target: number };
};

const fallbackStats: DashboardStat[] = [
  { label: "Total XP", value: "12,450" },
  { label: "Level", value: "111" },
  { label: "Streak", value: "14 days" },
  { label: "Solved Today", value: "3" }
];

export function DashboardPreview({
  stats = fallbackStats,
  lastSyncLabel = "Last sync: 2h ago",
  xpProgress = { current: 650, target: 900 }
}: DashboardPreviewProps) {
  const progressPercent = Math.min(100, Math.round((xpProgress.current / xpProgress.target) * 100));

  return (
    <section className="pixel-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading">Dashboard</h2>
        <span className="text-xs text-pixel-muted">{lastSyncLabel}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="rounded-md border border-slate-700 bg-slate-900/60 p-4"
          >
            <div className="text-xs uppercase text-pixel-muted">{stat.label}</div>
            <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
          </motion.div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-pixel-muted">
          <span>XP to next level</span>
          <span>
            {xpProgress.current} / {xpProgress.target}
          </span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-slate-800">
          <div className="h-3 rounded-full bg-pixel-accent" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </section>
  );
}
