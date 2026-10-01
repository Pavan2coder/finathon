import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getUser } from "./data/repo";
import type { UserRow } from "./data/generate";
import { ready, sync } from "./data/sync";

export const SESSION_COOKIE = "es_session";
const secret = () => process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

const sign = (uid: number) => `${uid}.${createHmac("sha256", secret()).update(String(uid)).digest("base64url")}`;

function verify(token: string | undefined): number | null {
  if (!token) return null;
  const [uid] = token.split(".");
  const expected = sign(Number(uid));
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? Number(uid) : null;
}

export async function setSession(uid: number) {
  (await cookies()).set(SESSION_COOKIE, sign(uid), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Every page and action resolves the viewer first, so this is where the DB is loaded and changes are saved. */
export async function getViewer(): Promise<UserRow | null> {
  await ready();
  after(sync);
  const uid = verify((await cookies()).get(SESSION_COOKIE)?.value);
  return uid ? getUser(uid) : null;
}

/** Guard for pages and actions. Unknown session → /login; wrong role → Overview. */
export async function requireRole(...roles: UserRow["role"][]): Promise<UserRow> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (roles.length && !roles.includes(viewer.role)) redirect("/?denied=1");
  return viewer;
}
