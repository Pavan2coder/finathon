import type { LeaveType } from "./data/generate";
import { store } from "./data/repo";

/** Working days (Mon–Fri) between two inclusive yyyy-mm-dd dates. */
export function leaveDays(from: string, to: string) {
  let n = 0;
  for (let d = new Date(from + "T00:00:00"); d <= new Date(to + "T00:00:00"); d.setDate(d.getDate() + 1)) if (d.getDay() % 6 !== 0) n++;
  return n;
}

/** Days used this year; pending requests count too when checking a new request so balances can't be double-booked. */
export function leaveUsed(userId: number, type: LeaveType, includePending = false) {
  return store.leaves
    .filter((l) => l.userId === userId && l.type === type && (l.status === "approved" || (includePending && l.status === "pending")))
    .reduce((a, l) => a + leaveDays(l.from, l.to), 0);
}
