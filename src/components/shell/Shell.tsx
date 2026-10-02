"use client";

import {
  BookOpenCheck, CalendarCheck, CalendarDays, GitPullRequestArrow, History, LayoutGrid, ListChecks, LogOut,
  Megaphone, Menu, MessageSquareQuote, Moon, Scale, Sparkles, Sun, Target, UserRound, Users, X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { signInAs, signOut } from "@/app/login/actions";
import { EchoLogo } from "@/components/EchoLogo";

type Role = "employee" | "manager" | "hr";

export interface ShellViewer {
  id: number;
  name: string;
  role: Role;
  title: string;
}

type NavItem = { href: string | ((v: ShellViewer) => string); label: string; icon: typeof LayoutGrid; roles: Role[]; badge?: "flags" | "requests" };
const ALL: Role[] = ["employee", "manager", "hr"];

// Aczen Connect's order, pointed at HR work; HRM-05 modules grouped underneath.
const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutGrid, roles: ALL },
      { href: "/pipeline", label: "Talent pipeline", icon: GitPullRequestArrow, roles: ["manager", "hr"] },
      { href: "/feedback", label: "Feedback automation", icon: MessageSquareQuote, roles: ALL, badge: "requests" },
      { href: "/recognition", label: "Recognition", icon: Megaphone, roles: ALL },
      { href: "/assistant", label: "AI assistant", icon: Sparkles, roles: ALL },
      { href: "/assignments", label: "Assignments", icon: ListChecks, roles: ALL },
      { href: "/my-calendar", label: "My calendar", icon: CalendarCheck, roles: ALL },
      { href: "/calendar", label: "Company", icon: CalendarDays, roles: ALL },
    ],
  },
  {
    group: "Performance",
    items: [
      { href: (v) => `/people/${v.id}`, label: "My profile", icon: UserRound, roles: ["employee"] },
      { href: "/people", label: "People", icon: Users, roles: ["manager", "hr"] },
      { href: "/skills", label: "Skills & gaps", icon: Target, roles: ALL },
      { href: "/development", label: "Development plan", icon: BookOpenCheck, roles: ["employee", "manager"] },
      { href: "/calibration", label: "Calibration", icon: Scale, roles: ["manager", "hr"], badge: "flags" },
      { href: "/audit", label: "Audit trail", icon: History, roles: ["hr"] },
    ],
  },
];

const ROLE_LABEL: Record<Role, string> = { employee: "Employee", manager: "Manager", hr: "HR" };

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setDark(t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setDark(!dark);
    };
    try { localStorage.setItem("theme", next); } catch {}
    // cross-fade the whole page where supported; instant otherwise
    const d = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(apply);
    else apply();
  };
  return (
    <button onClick={toggle} className="btn btn-ghost px-2.5" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// apple-design: drawer/sheet spring (damping 0.8 → small bounce, response ≈ 0.3s)
const SHEET_SPRING = { type: "spring", bounce: 0.15, duration: 0.35 } as const;
/** Apple's momentum projection: where a flick at `v` px/s would come to rest. */
const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);

export function Shell({ viewer, badges, children }: { viewer: ShellViewer; badges: { flags: number; requests: number }; children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [switching, startSwitch] = useTransition();
  const dragged = useRef(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const groups = NAV.map((g) => ({ group: g.group, items: g.items.filter((n) => n.roles.includes(viewer.role)).map((n) => ({ ...n, href: typeof n.href === "function" ? n.href(viewer) : n.href })) }));
  const items = groups.flatMap((g) => g.items);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const current = items.filter((i) => active(i.href)).sort((a, b) => b.href.length - a.href.length)[0];

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#0f1417] text-[#ebebed] dark:border-r-[3px] dark:border-[#ebebed]">
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <Link href="/" className="text-[#ebebed]"><EchoLogo size="text-3xl" /></Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Main">
        {groups.map((g) => (
          <div key={g.group} className="mb-4">
            <p className="label mb-1.5 px-3 text-[10px] text-[#ebebed]/45">{g.group}</p>
            <div className="space-y-0.5">
        {g.items.map((n) => {
          const on = active(n.href) && current?.href === n.href;
          const count = n.badge ? badges[n.badge] : 0;
          return (
            <Link
              key={n.label}
              href={n.href}
              draggable={false}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md border-2 px-3 py-1.5 text-sm transition-colors duration-200 ${
                on ? "border-accent bg-accent font-medium text-[#0f1417]" : "border-transparent text-[#ebebed]/80 hover:border-[#ebebed]/30 hover:text-[#ebebed]"
              }`}
            >
              <n.icon size={17} strokeWidth={2} />
              <span className="flex-1">{n.label}</span>
              {count > 0 && (
                <span className={`rounded border-2 px-1.5 font-mono text-[11px] ${on ? "border-[#0f1417]" : n.badge === "flags" ? "border-alert text-alert-ink" : "border-[#ebebed]/50"}`}>{count}</span>
              )}
            </Link>
          );
        })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t-2 border-[#ebebed]/15 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md border-2 border-[#ebebed] bg-primary font-mono text-sm font-semibold text-white">
            {viewer.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{viewer.name}</p>
            <p className="truncate text-xs text-[#ebebed]/60">{viewer.title}</p>
          </div>
          <form action={signOut}>
            <button className="rounded p-1.5 text-[#ebebed]/70 hover:text-[#ebebed]" aria-label="Sign out"><LogOut size={17} /></button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              className="absolute inset-0 bg-[#0f1417]/50"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            {/* enters from the left, leaves to the left; drag to dismiss with a projected flick */}
            <motion.div
              className="relative h-full w-64"
              initial={{ x: reduce ? 0 : "-100%", opacity: reduce ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduce ? 0 : "-100%", opacity: reduce ? 0 : 1 }}
              transition={SHEET_SPRING}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: -256, right: 0 }}
              dragElastic={{ left: 0, right: 0.12 }}
              dragMomentum={false}
              onPointerDownCapture={() => (dragged.current = false)}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (info.offset.x + project(info.velocity.x) < -110) setOpen(false);
              }}
              // a drag is not a tap: swallow the click that follows it
              onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
            >
              {sidebar}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b-[3px] border-ink bg-bg px-4 py-3 sm:px-8">
        <button className="btn btn-ghost px-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={16} /></button>
        <p className="font-display flex-1 truncate text-xl">{current?.label ?? "EvalSense"}</p>
        <span className="hidden items-center gap-2 sm:flex">
          <span className="relative flex size-2.5">
            <span className="anim-ping absolute inline-flex size-full rounded-full bg-accent" />
            <span className="relative inline-flex size-2.5 rounded-full border border-ink bg-accent" />
          </span>
          <span className="label">H2 2026 open</span>
        </span>
        <div className="flex items-center">
          <label className="sr-only" htmlFor="role-switch">View as</label>
          {/* controlled, and only acts on a real change — a stray reset can never sign you in as someone else */}
          <select
            id="role-switch"
            value={viewer.role}
            disabled={switching}
            onChange={(e) => {
              const role = e.target.value as Role;
              if (role === viewer.role) return;
              const fd = new FormData();
              fd.set("role", role);
              startSwitch(() => signInAs(fd));
            }}
            className="field label w-auto cursor-pointer py-1.5 pr-8 shadow-brutal-sm"
          >
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r}>View as {ROLE_LABEL[r]}</option>
            ))}
          </select>
        </div>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}

