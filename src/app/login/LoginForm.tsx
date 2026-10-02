"use client";

import { LogIn } from "lucide-react";
import { useSubmit } from "@/lib/useSubmit";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, onSubmit, pending] = useSubmit(signIn);
  return (
    <form onSubmit={onSubmit} className="brutal space-y-4 p-5" noValidate>
      <div>
        <label htmlFor="email" className="label mb-1.5 block">Work email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" placeholder="priya.sharma@evalsense.demo" aria-invalid={!!state?.error} aria-describedby={state?.error ? "login-error" : undefined} />
      </div>
      <div>
        <label htmlFor="password" className="label mb-1.5 block">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" aria-invalid={!!state?.error} aria-describedby={state?.error ? "login-error" : undefined} />
      </div>
      {state?.error && <p id="login-error" role="alert" className="text-sm text-alert-ink">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}><LogIn size={16} /> {pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
