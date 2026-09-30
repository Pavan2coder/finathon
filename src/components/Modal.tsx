"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

/** Native <dialog> modal with the brutal frame. Escape and backdrop click close it. */
export function Modal({ open, onClose, title, description, children, width = 520 }: { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; width?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      style={{ width: `min(${width}px, calc(100vw - 2rem))` }}
      className="brutal m-auto max-h-[90vh] overflow-y-auto p-0 text-ink backdrop:bg-[#0f1417]/60"
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl leading-tight">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded p-1 hover:bg-bg" aria-label="Close"><X size={18} /></button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
