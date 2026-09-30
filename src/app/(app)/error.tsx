"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="brutal mx-auto mt-10 max-w-lg p-6">
      <h1 className="font-display text-3xl">This page couldn&apos;t load</h1>
      <p className="mt-2 text-muted">EvalSense couldn&apos;t reach its data. Nothing you saved is lost. Try again, and if it keeps failing, check the database connection.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      <button onClick={reset} className="btn btn-primary mt-4">Try again</button>
    </div>
  );
}
