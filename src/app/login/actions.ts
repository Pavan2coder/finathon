"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO } from "@/lib/data/repo";
import { clearSession, setSession } from "@/lib/session";

const Role = z.enum(["employee", "manager", "hr"]);

export async function signInAs(formData: FormData) {
  const role = Role.parse(formData.get("role"));
  await setSession(DEMO[role]().id);
  redirect("/");
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}
