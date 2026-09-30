"use client";

import { useLayoutEffect, useRef, useState } from "react";

export interface Claim {
  id: string;
  text: string;
  refs: string[];
  missing?: boolean;
}
export interface EvidenceCard {
  ref: string;
  kind: string;
  title: string;
  detail: string;
}

/**
 * Claims on the left, evidence on the right. Hovering or focusing a claim draws
 * bezier connectors to the rows it cites (CogniSwitch layer-connector style).
 */
export function EvidenceClaims({ claims, evidence }: { claims: Claim[]; evidence: EvidenceCard[] }) {
  const [active, setActive] = useState<string | null>(claims.find((c) => !c.missing)?.id ?? null);
  const wrap = useRef<HTMLDivElement>(null);
  const claimEls = useRef(new Map<string, HTMLElement>());
  const evEls = useRef(new Map<string, HTMLElement>());
  const [paths, setPaths] = useState<string[]>([]);
  const cited = new Set(claims.find((c) => c.id === active)?.refs ?? []);
  const shown = evidence.filter((e) => cited.has(e.ref));

  useLayoutEffect(() => {
    const draw = () => {
      const root = wrap.current;
      const from = active ? claimEls.current.get(active) : null;
      if (!root || !from || window.innerWidth < 1024) return setPaths([]);
      const R = root.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const x1 = a.right - R.left;
      const y1 = a.top + a.height / 2 - R.top;
      setPaths(
        shown.flatMap((e) => {
          const el = evEls.current.get(e.ref);
          if (!el) return [];
          const b = el.getBoundingClientRect();
          const x2 = b.left - R.left;
          const y2 = b.top + b.height / 2 - R.top;
          const mx = (x1 + x2) / 2;
          return [`M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`];
        }),
      );
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, shown.length]);

  return (
    <div ref={wrap} className="relative grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" aria-hidden>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--series-1)" strokeWidth={1.5} className="anim-dash" />
        ))}
      </svg>
      <ul className="space-y-2" aria-label="What the evidence says">
        {claims.map((c) => (
          <li key={c.id}>
            <button
              ref={(el) => { if (el) claimEls.current.set(c.id, el); }}
              onMouseEnter={() => !c.missing && setActive(c.id)}
              onFocus={() => !c.missing && setActive(c.id)}
              onClick={() => !c.missing && setActive(c.id)}
              aria-pressed={active === c.id}
              disabled={c.missing}
              className={`w-full rounded-md border-[3px] px-4 py-3 text-left transition-[background,box-shadow,transform] duration-250 ease-out-expo ${
                c.missing
                  ? "border-dashed border-ink/40 text-muted"
                  : active === c.id
                    ? "border-ink bg-accent text-[#0f1417] shadow-brutal-sm"
                    : "border-ink bg-card hover:-translate-y-px"
              }`}
            >
              <span className="block">{c.text}</span>
              {!c.missing && <span className="label mt-1 block opacity-70">{c.refs.length} source{c.refs.length === 1 ? "" : "s"}</span>}
            </button>
          </li>
        ))}
      </ul>
      <div aria-live="polite">
        <p className="label mb-2 text-muted">Evidence behind the selected statement</p>
        <ul className="space-y-2">
          {shown.map((e) => (
            <li key={e.ref} ref={(el) => { if (el) evEls.current.set(e.ref, el); }} className="rounded-md border-2 border-ink bg-card px-3 py-2">
              <p className="label text-muted">{e.kind} · <span className="font-mono">{e.ref}</span></p>
              <p className="text-sm font-medium">{e.title}</p>
              <p className="text-sm text-muted">{e.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
