/**
 * Subtle global background — kept minimal so the foreground content drives the look.
 * Two soft tinted blobs + faint dot pattern at the very top of the page.
 */
export function NotebookBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft tinted blobs (indigo top-left, lavender top-right) */}
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute -top-24 right-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />

      {/* Tiny dot grid at top corners — like the reference */}
      <div
        className="absolute top-24 left-8 h-32 w-32 opacity-40"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.35) 1.2px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        className="absolute top-44 right-8 h-32 w-32 opacity-40"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.35) 1.2px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      />
    </div>
  );
}
