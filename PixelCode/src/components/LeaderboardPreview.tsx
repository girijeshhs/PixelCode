const leaders = [
  { name: "AlgoAce", xp: 18420, streak: 32 },
  { name: "ByteWitch", xp: 17310, streak: 28 },
  { name: "PixelKnight", xp: 12450, streak: 14 }
];

export function LeaderboardPreview() {
  return (
    <section className="pixel-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading">Leaderboard</h2>
        <span className="text-xs text-pixel-muted">Global</span>
      </div>
      <div className="space-y-3">
        {leaders.map((leader, index) => (
          <div
            key={leader.name}
            className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-pixel-muted">#{index + 1}</span>
              <span className="font-semibold">{leader.name}</span>
            </div>
            <div className="text-xs text-pixel-muted">
              {leader.xp.toLocaleString()} XP · {leader.streak} day streak
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-pixel-muted">
        TODO: Replace with paginated API results.
      </div>
    </section>
  );
}
