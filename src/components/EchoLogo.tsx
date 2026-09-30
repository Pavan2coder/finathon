/** Wordmark stacked three times (ink / mint / purple) that fans out on load — the Equinox echo, in our palette. */
export function EchoLogo({ size = "text-5xl", className = "" }: { size?: string; className?: string }) {
  const word = "EvalSense";
  return (
    <span className={`echo relative inline-block font-sans font-black tracking-[-0.04em] leading-none ${size} ${className}`} aria-label={word}>
      <span aria-hidden className="echo-layer echo-3 absolute inset-0 text-primary">{word}</span>
      <span aria-hidden className="echo-layer echo-2 absolute inset-0 text-accent">{word}</span>
      <span className="relative">{word}</span>
    </span>
  );
}
