import "server-only";
import { store } from "./data/repo";

export function writeAudit(entry: { entity: string; entityId: number; field: string; oldValue: string | null; newValue: string | null; reason: string; actorId: number }) {
  store.audit.push({ id: Math.max(0, ...store.audit.map((a) => a.id)) + 1, at: new Date().toISOString(), ...entry });
}
