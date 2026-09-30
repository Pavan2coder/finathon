/** Blueprint "layer" diagram: evidence → skills → gaps → career path, joined by flowing dashed connectors. */
export function EvidenceFlow({ steps }: { steps: { label: string; value: string; note: string }[] }) {
  return (
    <ol className="grid-paper flex flex-col items-stretch gap-0 rounded-md border-[3px] border-ink p-4 lg:flex-row lg:items-stretch">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-stretch">
          <div className="brutal flex-1 px-4 py-3">
            <p className="label flex items-center gap-2 text-muted">
              <span className="inline-block size-2 bg-primary" /> Layer {i + 1}: {s.label}
            </p>
            <p className="font-display mt-1 text-2xl leading-tight">{s.value}</p>
            <p className="text-sm text-muted">{s.note}</p>
          </div>
          {i < steps.length - 1 && (
            <svg aria-hidden className="mx-auto h-8 w-10 shrink-0 rotate-90 lg:h-10 lg:w-10 lg:rotate-0 lg:self-center" viewBox="0 0 40 40">
              <path d="M 0,12 C 20,12 20,28 40,28" fill="none" stroke="var(--series-1)" strokeWidth={1.5} className="anim-dash" />
              <path d="M 0,28 C 20,28 20,12 40,12" fill="none" stroke="var(--series-1)" strokeOpacity={0.35} strokeWidth={1.5} />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}
