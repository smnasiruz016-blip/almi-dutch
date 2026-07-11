// AlmiDutch — shared type contracts for the two-track item bank.
// String-literal unions mirror the Prisma enums (kept in sync by hand) so the
// scoring engine, content pipeline, and UI don't depend on the generated client.

export type PortugueseVariant = "EUROPEAN" | "BRAZILIAN";

export type CapleExam = "ACESSO" | "CIPLE" | "DEPLE" | "DIPLE" | "DAPLE" | "DUPLE";
export type PortugueseExam = CapleExam | "CELPE_BRAS";

export type CapleSkill = "READING" | "LISTENING" | "WRITING" | "SPEAKING";
export type CelpeSkill = "ESCRITA" | "ORAL";
export type PortugueseSkill = CapleSkill | CelpeSkill;

export type PortugueseTaskType =
  | "MCQ_SINGLE"
  | "MATCHING"
  | "CLOZE"
  | "ORDERING"
  | "TRUE_FALSE"
  | "WRITING_PROMPT"
  | "SPEAKING_PROMPT"
  | "ESCRITA_TASK"
  | "ORAL_INTERVIEW";

export type PortugueseDifficulty = "FOUNDATION" | "CORE" | "STRETCH";

export const OBJECTIVE_TASK_TYPES: PortugueseTaskType[] = [
  "MCQ_SINGLE",
  "MATCHING",
  "CLOZE",
  "ORDERING",
  "TRUE_FALSE",
];

export const PRODUCTIVE_TASK_TYPES: PortugueseTaskType[] = [
  "WRITING_PROMPT",
  "SPEAKING_PROMPT",
  "ESCRITA_TASK",
  "ORAL_INTERVIEW",
];

export function isObjectiveTask(t: PortugueseTaskType): boolean {
  return OBJECTIVE_TASK_TYPES.includes(t);
}

/** A skill is "free to taste" (auto-graded) vs gated (AI-graded / mock). */
export function isFreeSkill(skill: PortugueseSkill): boolean {
  return skill === "READING" || skill === "LISTENING";
}

// ---- Task payload shapes (validated in tasks.ts) ----

/** One multiple-choice / true-false option group. */
export interface McqPayload {
  passage?: string; // reading passage (READING) — omitted for LISTENING
  transcript?: string; // listening transcript (LISTENING) — rendered as audio via TTS
  question: string;
  options: string[]; // 3–4 options
}

export interface MatchingPayload {
  transcript?: string;
  passage?: string;
  instructions: string;
  left: string[]; // prompts
  right: string[]; // candidate matches (may include distractors)
}

export interface ClozePayload {
  passage: string; // text with {{1}} {{2}} … gap markers
  gaps: { id: number; options: string[] }[];
}

export interface OrderingPayload {
  instructions: string;
  items: string[]; // presented shuffled; answer = correct order of indices
}

/** Objective answer keys keyed by taskType. */
export type ObjectiveAnswer =
  | { type: "MCQ_SINGLE"; correctIndex: number }
  | { type: "TRUE_FALSE"; correctIndex: number }
  | { type: "MATCHING"; pairs: [number, number][] } // [leftIndex, rightIndex]
  | { type: "CLOZE"; correct: { id: number; index: number }[] }
  | { type: "ORDERING"; order: number[] };

/** CAPLE productive prompt (Writing / Speaking). */
export interface ProductivePayload {
  stimulus?: string; // context / situation (PT)
  criteria: string[]; // what the answer must show (feeds AI feedback)
  charBand?: { min: number; max: number }; // writing length guidance
  minSeconds?: number; // speaking guidance
}

/** Celpe-Bras integrated written task (stimulus → written production). */
export interface EscritaTaskPayload {
  stimulusKind: "video" | "audio" | "press" | "notice"; // elemento provocador type
  stimulusText: string; // the source text / transcript (original, PT-BR)
  enunciado: string; // the task instruction: genre, role, audience, purpose
  criteria: string[];
  charBand: { min: number; max: number };
}

/** Celpe-Bras oral interview simulation. */
export interface OralInterviewPayload {
  warmup: string[]; // ~5 min personal-interest questions
  elementos: { title: string; provocador: string; questions: string[] }[]; // ~15 min topics
  criteria: string[];
}
