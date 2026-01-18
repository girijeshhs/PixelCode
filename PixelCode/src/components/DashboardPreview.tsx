import { motion } from "framer-motion";

const stats = [
  { label: "Total XP", value: "12,450" },
  { label: "Level", value: "111" },
  { label: "Streak", value: "14 days" },
  { label: "Solved Today", value: "3" }
];

export function DashboardPreview() {
  return (
    <section className="pixel-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading">Dashboard</h2>
        <span className="text-xs text-pixel-muted">Last sync: 2h ago</span>
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
          <span>650 / 900</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-slate-800">
          <div className="h-3 w-2/3 rounded-full bg-pixel-accent" />
        </div>
      </div>
    </section>
  );
}
