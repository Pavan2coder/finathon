"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";

/**
 * useActionState, but the form keeps what the user typed when the action returns errors.
 * (React 19 resets a <form action> after every submission; that wipes input on validation errors.)
 * The form is cleared only after a successful save (state.ok or state.inserted).
 */
export function useSubmit<S>(action: (prev: S, fd: FormData) => Promise<S>, initial: S = null as S) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial as Awaited<S>);
  const form = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    const s = state as { ok?: unknown; inserted?: unknown } | null;
    if (s && (s.ok || s.inserted !== undefined)) form.current?.reset();
  }, [state]);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.current = e.currentTarget;
    // include the clicked button's name/value (e.g. intent=publish)
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}
