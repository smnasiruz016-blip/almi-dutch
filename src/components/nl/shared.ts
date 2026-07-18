// Shared client-side item shapes handed from the runner pages to the practice
// components. Payloads stay `unknown` and are narrowed by taskType at render.

import type {
  DutchExam,
  DutchSkill,
  DutchTaskType,
  CefrLevel,
  ObjectiveAnswer,
} from "@/lib/nl/types";

export interface RunnerItem {
  title: string;
  prompt: string;
  exam: DutchExam;
  skill: DutchSkill;
  taskType: DutchTaskType;
  /** CEFR level this task is pitched at — carried so the runner can band readiness
   *  from at-goal tasks only, and the productive grader can judge at the right level. */
  cefr?: CefrLevel;
  payload: unknown;
  answer: ObjectiveAnswer | null;
  maxPoints: number;
}

export type ProductiveItem = Omit<RunnerItem, "answer" | "maxPoints">;

export interface SubmitResult {
  ok: boolean;
  points: number;
  maxPoints: number;
  correct: boolean;
}

/** The BCP-47 voice tag for listening audio — Dutch (both tracks). */
export function ttsLang(): string {
  return "nl-NL";
}

/** POST a graded/echoed attempt to the submit API. DB-optional, never throws. */
export async function submitAttempt(body: unknown): Promise<SubmitResult | null> {
  try {
    const res = await fetch("/api/nl/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as SubmitResult;
  } catch {
    return null;
  }
}

export type ProductiveBand = "CLEAR" | "BORDERLINE" | "BELOW";

export interface AiFeedback {
  band: ProductiveBand;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export type GradeOutcome =
  | { status: "graded"; feedback: AiFeedback }
  | { status: "unavailable" } // key not provisioned / model hiccup → self-rate
  | { status: "error"; message: string };

/**
 * Request honest AI feedback on a productive answer. Returns "unavailable" (not
 * an error) when the key isn't provisioned yet, so the caller falls back to the
 * self-rating flow. Never throws.
 */
export async function gradeProductive(body: {
  exam: DutchExam;
  skill: DutchSkill;
  taskType: DutchTaskType;
  /** The level THIS task is pitched at — the grade route judges the answer at this
   *  level (via almi-data's levelInstruction), never at the exam's range label. */
  cefr?: CefrLevel;
  title: string;
  prompt: string;
  criteria: string[];
  response: string;
}): Promise<GradeOutcome> {
  try {
    const res = await fetch("/api/nl/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as
      | ({ ok?: boolean; available?: boolean; error?: string } & Partial<AiFeedback>)
      | null;
    if (!res.ok || !data) {
      return { status: "error", message: data?.error ?? "Could not get feedback right now." };
    }
    if (data.available === false || !data.band) return { status: "unavailable" };
    return {
      status: "graded",
      feedback: {
        band: data.band,
        summary: data.summary ?? "",
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
