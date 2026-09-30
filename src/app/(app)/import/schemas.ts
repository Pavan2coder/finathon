import { z } from "zod";

const num = z.coerce.number();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const list = z.string().transform((s) => s.split(";").map((x) => x.trim()).filter(Boolean));

/** One zod schema per evidence type. Column names are the CSV headers. */
export const IMPORT_TYPES = {
  goals: {
    label: "Goals",
    schema: z.object({ email: z.string().email(), cycle: z.string().min(1), title: z.string().min(3), target: num.positive(), actual: num.min(0) }),
    sample: "email,cycle,title,target,actual\npriya.sharma@evalsense.demo,H2 2026,Cut p95 latency,10,8.5",
  },
  deliverables: {
    label: "Deliverables",
    schema: z.object({ email: z.string().email(), cycle: z.string().min(1), title: z.string().min(3), due: date, delivered: z.union([date, z.literal("")]), quality: num.min(1).max(5), skills: list }),
    sample: "email,cycle,title,due,delivered,quality,skills\npriya.sharma@evalsense.demo,H2 2026,Billing retry flow,2026-09-15,2026-09-14,4.5,Delivery;Code Quality",
  },
  feedback: {
    label: "Peer and manager feedback",
    schema: z.object({ subject_email: z.string().email(), author_email: z.string().email(), kind: z.enum(["peer", "manager"]), cycle: z.string().min(1), score: num.min(1).max(5), text: z.string().min(10), skills: list }),
    sample: "subject_email,author_email,kind,cycle,score,text,skills\npriya.sharma@evalsense.demo,ravi.kumar@evalsense.demo,manager,H2 2026,4,Led the incident review and fixed the root cause,Delivery",
  },
  trainings: {
    label: "Training",
    schema: z.object({ email: z.string().email(), course: z.string().min(3), skill: z.string().min(2), status: z.enum(["planned", "in_progress", "done"]) }),
    sample: "email,course,skill,status\npriya.sharma@evalsense.demo,Designing Distributed Systems,System Design,in_progress",
  },
  attendance: {
    label: "Attendance",
    schema: z.object({ email: z.string().email(), cycle: z.string().min(1), month: z.string().min(3), work_days: num.int().positive(), present_days: num.int().min(0) }).refine((r) => r.present_days <= r.work_days, { message: "present_days can't exceed work_days", path: ["present_days"] }),
    sample: "email,cycle,month,work_days,present_days\npriya.sharma@evalsense.demo,H2 2026,Sep 2026,22,21",
  },
  impact: {
    label: "Business impact",
    schema: z.object({ email: z.string().email(), cycle: z.string().min(1), metric: z.string().min(3), value: num.min(0).max(100), note: z.string().default("") }),
    sample: "email,cycle,metric,value,note\npriya.sharma@evalsense.demo,H2 2026,Cost saved,72,Retired two legacy queues",
  },
} as const;

export type ImportType = keyof typeof IMPORT_TYPES;
export interface RowError { row: number; column: string; message: string }
export type ImportResult = { inserted?: number; type?: string; errors?: RowError[]; error?: string } | null;
