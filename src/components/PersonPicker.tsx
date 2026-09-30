"use client";

import { usePathname, useRouter } from "next/navigation";

/** Lets managers and HR switch whose page they're looking at. */
export function PersonPicker({ people, value }: { people: { id: number; name: string }[]; value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div>
      <label htmlFor="person" className="label mb-1 block">Viewing</label>
      <select id="person" className="field w-64" value={value} onChange={(e) => router.push(`${pathname}?user=${e.target.value}`)}>
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );
}
