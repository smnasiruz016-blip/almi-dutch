// Shared client-side item shapes handed from the runner pages to the practice
// components. Payloads stay `unknown` and are narrowed by taskType at render.

import type {
  PortugueseExam,
  PortugueseSkill,
  PortugueseTaskType,
  PortugueseVariant,
  ObjectiveAnswer,
} from "@/lib/pt/types";

export interface RunnerItem {
  title: string;
  prompt: string;
  exam: PortugueseExam;
  skill: PortugueseSkill;
  taskType: PortugueseTaskType;
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

/** The BCP-47 voice tag for the family: European vs Brazilian Portuguese. */
export function ttsLang(variant: PortugueseVariant): string {
  return variant === "BRAZILIAN" ? "pt-BR" : "pt-PT";
}

/** POST a graded/echoed attempt to the submit API. DB-optional, never throws. */
export async function submitAttempt(body: unknown): Promise<SubmitResult | null> {
  try {
    const res = await fetch("/api/pt/submit", {
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
