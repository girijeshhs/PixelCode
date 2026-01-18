type ProfilePreviewProps = {
  profile?: {
    displayName: string;
    leetcodeUsername: string | null;
    joinedLabel: string;
  };
  footerText?: string;
  showEditButton?: boolean;
};

export function ProfilePreview({
  profile = {
    displayName: "PixelKnight",
    leetcodeUsername: "pixelknight",
    joinedLabel: "Jan 2026"
  },
  footerText = "Update your profile to link a LeetCode handle.",
  showEditButton = false
}: ProfilePreviewProps) {
  return (
    <section className="pixel-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading">Profile</h2>
        {showEditButton ? (
          <button className="rounded-md border border-slate-700 px-3 py-1 text-xs text-pixel-muted hover:text-white">
            Edit
          </button>
        ) : null}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">Display Name</span>
          <span>{profile.displayName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">LeetCode</span>
          <span>{profile.leetcodeUsername ? `@${profile.leetcodeUsername}` : "Not linked"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-pixel-muted">Joined</span>
          <span>{profile.joinedLabel}</span>
        </div>
      </div>
      <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4 text-xs text-pixel-muted">
        {footerText}
      </div>
    </section>
  );
}
