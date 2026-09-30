"use client";

import { Camera, Clock, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { issuePunchCode, punch } from "@/app/(app)/workspace/actions";

/** Aczen's punch flow: rotating verification code + live camera snapshot, then punch in/out. */
export function PunchCard({ punchedIn, lastPunch }: { punchedIn: boolean; lastPunch: string | null }) {
  const [code, setCode] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);
  const [busy, start] = useTransition();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  const refresh = useCallback(() => start(async () => { setCode(await issuePunchCode()); setTyped(""); }), []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  const openCamera = async () => {
    setMsg(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 360 } });
      setLive(true);
      requestAnimationFrame(() => { if (video.current) { video.current.srcObject = stream.current; video.current.play(); } });
    } catch {
      setMsg({ error: "Camera access was blocked. Allow it in the browser's address bar, then try again." });
    }
  };
  const capture = () => {
    const v = video.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = Math.round((v.videoHeight / v.videoWidth) * 320) || 240;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    setPhoto(c.toDataURL("image/jpeg", 0.7));
    stream.current?.getTracks().forEach((t) => t.stop());
    setLive(false);
  };
  const submit = () =>
    start(async () => {
      const res = await punch({ code: typed, photo });
      setMsg(res);
      if (res.ok) { setPhoto(null); refresh(); }
    });

  return (
    <section className="brutal flex flex-col p-5">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Clock size={20} className="text-primary" /> Punch in / out</h2>
      <p className="mt-2 flex items-center gap-2">
        <span className={`inline-block size-3 rounded-full border-2 border-ink ${punchedIn ? "bg-accent" : "bg-card"}`} aria-hidden />
        Currently {punchedIn ? "punched in" : "punched out"}
      </p>
      <p className="mt-1 text-sm text-muted">Last punch: {lastPunch ? new Date(lastPunch).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "none yet"}</p>

      <div className="mt-4 space-y-3 rounded-md border-[3px] border-ink p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="label text-muted">Verification code</p>
            <p className="font-mono text-2xl font-semibold tracking-[0.2em]" aria-live="polite">{code ?? "·····"}</p>
          </div>
          <button type="button" onClick={refresh} disabled={busy} className="btn btn-ghost px-2.5" aria-label="New code"><RefreshCw size={16} /></button>
        </div>
        <label htmlFor="punch-code" className="sr-only">Enter verification code</label>
        <input id="punch-code" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} maxLength={5} autoComplete="off" className="field font-mono tracking-[0.3em] uppercase" placeholder="ENTER CODE" />
        <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-md border-2 border-dashed border-ink/40 bg-bg">
          {live ? (
            <video ref={video} muted playsInline className="h-full w-full object-cover [transform:scaleX(-1)]" />
          ) : photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your punch photo" className="h-full w-full object-cover [transform:scaleX(-1)]" />
          ) : (
            <p className="flex flex-col items-center gap-1 text-sm text-muted"><Camera size={20} /> No photo yet</p>
          )}
        </div>
        {live ? (
          <button type="button" onClick={capture} className="btn btn-accent w-full"><Camera size={16} /> Take photo</button>
        ) : (
          <button type="button" onClick={openCamera} className="btn btn-ghost w-full"><Camera size={16} /> {photo ? "Retake photo" : "Open live camera"}</button>
        )}
      </div>

      <button type="button" onClick={submit} disabled={busy || typed.length < 5 || !photo} className="btn btn-primary mt-4 w-full">
        {punchedIn ? <LogOut size={16} /> : <LogIn size={16} />} {busy ? "Saving…" : punchedIn ? "Punch out" : "Punch in"}
      </button>
      {msg && (
        <p role={msg.error ? "alert" : "status"} className={`mt-3 rounded-md border-2 border-ink px-3 py-2 text-sm ${msg.error ? "text-alert-ink" : "bg-accent text-[#0f1417]"}`}>{msg.error ?? msg.ok}</p>
      )}
    </section>
  );
}
