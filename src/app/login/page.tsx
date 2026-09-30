import { EchoLogo } from "@/components/EchoLogo";
import { signInAs } from "./actions";

const SOURCES = ["Goals", "Project outcomes", "Deliverables", "Peer feedback", "Manager feedback", "Skill development", "Attendance", "Training", "Business impact"];

const PEOPLE = [
  { role: "employee", name: "Priya Sharma", title: "Senior Engineer", sees: "Her evidence profile, skill gaps and what the next level needs." },
  { role: "manager", name: "Ravi Kumar", title: "Engineering Manager", sees: "His team's profiles, promotion pipeline and how his ratings compare." },
  { role: "hr", name: "Elena Rostova", title: "HR Calibration Lead", sees: "Every manager's rating pattern, flagged cases and the audit trail." },
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="grid flex-1 lg:grid-cols-[1.25fr_1fr]">
        <section className="grid-paper relative flex flex-col justify-between gap-12 border-b-[3px] border-ink p-6 sm:p-10 lg:border-r-[3px] lg:border-b-0 lg:p-14">
          <EchoLogo size="text-4xl" />
          <div>
            <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.85] tracking-[-0.03em]">
              Evidence
              <br />
              <span className="text-outline">over</span>
              <br />
              opinion.
            </h1>
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed font-light">
              Every rating sits next to the goals, deliverables and feedback behind it. When a manager&apos;s scores drift from the evidence, you see it before the promotion committee does.
            </p>
          </div>
          <span aria-hidden className="anim-twinkle pointer-events-none absolute top-16 right-16 text-3xl text-primary">✦</span>
          <span aria-hidden className="anim-twinkle pointer-events-none absolute right-40 bottom-40 text-xl text-primary [animation-delay:1.1s]">✦</span>
        </section>

        <section className="flex flex-col justify-center gap-5 bg-bg p-6 sm:p-10 lg:p-14">
          <div>
            <h2 className="font-display text-4xl">Sign in to the demo</h2>
            <p className="mt-2 text-muted">Pick a person. Each one sees a different slice of the same data.</p>
          </div>
          {PEOPLE.map((p) => (
            <form key={p.role} action={signInAs}>
              <input type="hidden" name="role" value={p.role} />
              <button type="submit" className="brutal brutal-lift group flex w-full items-start gap-4 p-4 text-left active:translate-x-1 active:translate-y-1 active:shadow-none">
                <span className="grid size-12 shrink-0 place-items-center rounded-md border-[3px] border-ink bg-accent font-mono font-semibold text-[#0f1417]">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display text-2xl">{p.name}</span>
                    <span className="label rounded border-2 border-ink px-2 py-0.5">{p.role === "hr" ? "HR" : p.role}</span>
                  </span>
                  <span className="block text-sm text-muted">{p.title}</span>
                  <span className="mt-2 block text-sm">{p.sees}</span>
                </span>
              </button>
            </form>
          ))}
          <p className="text-xs text-muted">Simulated data. No real employees.</p>
        </section>
      </div>

      <div className="overflow-hidden border-t-[3px] border-ink bg-accent py-3 text-[#0f1417]" aria-label="Evidence sources">
        <div className="anim-marquee flex w-max gap-8">
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <span key={i} className="label flex items-center gap-8 whitespace-nowrap" aria-hidden={i >= SOURCES.length}>
              {s} <span className="inline-block size-2 bg-[#0f1417]" />
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
