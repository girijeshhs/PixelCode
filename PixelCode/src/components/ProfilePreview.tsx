export function ProfilePreview() {
  return (
    <section className="pixel-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading">Profile</h2>
        <button className="rounded-md border border-slate-700 px-3 py-1 text-xs text-pixel-muted hover:text-white">
          Edit
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">Display Name</span>
          <span>PixelKnight</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">LeetCode</span>
          <span>@pixelknight</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">Joined</span>
          <span>Jan 2026</span>
        </div>
      </div>
      <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4 text-xs text-pixel-muted">
        TODO: Connect auth, allow users to update their LeetCode username.
      </div>
    </section>
  );
}
