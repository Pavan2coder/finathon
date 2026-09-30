"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** 0 → value over 600ms the first time it scrolls into view. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const decimals = Number.isInteger(value) ? 0 : 1;
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) return setShown(value);
    const c = animate(0, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1], onUpdate: setShown });
    return () => c.stop();
  }, [inView, reduce, value]);
  return <span ref={ref}>{shown.toFixed(decimals)}</span>;
}
