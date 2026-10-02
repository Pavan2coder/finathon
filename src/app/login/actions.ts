"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO, store } from "@/lib/data/repo";
import { ready } from "@/lib/data/sync";
import { clearSession, setSession } from "@/lib/session";

const Role = z.enum(["employee", "manager", "hr"]);

export async function signInAs(formData: FormData) {
  const role = Role.parse(formData.get("role"));
  await setSession(DEMO[role]().id);
  redirect("/");
}

// ponytail: one shared demo password for every account; add a password-hash column to users for real accounts.
const PASSWORD = () => process.env.DEMO_PASSWORD ?? "evalsense";
const sha = (s: string) => createHash("sha256").update(s).digest();

const Credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export async function signIn(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  const parsed = Credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await ready();
  const user = store.users.find((u) => u.email.toLowerCase() === parsed.data.email);
  // Compare hashes so the check takes the same time whatever the input length.
  if (!user || !timingSafeEqual(sha(parsed.data.password), sha(PASSWORD()))) return { error: "Email or password is incorrect." };
  await setSession(user.id);
  redirect("/");
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}
