export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Personal OS</h1>
        <p className="text-lg" style={{ color: "var(--color-muted)" }}>
          Tu workspace privado y portafolio público.
        </p>
      </div>
      <div className="flex gap-3 text-sm">
        <span
          className="px-3 py-1 rounded-full border text-xs font-medium"
          style={{ borderColor: "var(--color-accent-500)", color: "var(--color-accent-600)" }}
        >
          Setup inicial ✓
        </span>
        <span
          className="px-3 py-1 rounded-full border text-xs font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
        >
          Auth — próximo
        </span>
      </div>
    </main>
  );
}
