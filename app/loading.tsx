export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-space-navy text-star-white">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-cyan">
        <span className="loading-orbit" aria-hidden="true" />
        Initializing mission control
      </div>
    </main>
  );
}
