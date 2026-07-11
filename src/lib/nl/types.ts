// AlmiDutch — shared type contracts for the two-track item bank.
// String-literal unions mirror the Prisma enums (kept in sync by hand) so the
// scoring engine, content pipeline, and UI don't depend on the generated client.

export type DutchTrack = "NT2" | "INBURGERING";

export type Nt2Exam = "PROGRAMMA_I" | "PROGRAMMA_II";
export type InburgeringExam = "INBURGERING_A2" | "INBURGERING_B1";
export type DutchExam = Nt2Exam | InburgeringExam;

// The four language skills are shared by both tracks; KNM + ONA are Inburgering
// components only.
export type LanguageSkill = "READING" | "LISTENING" | "WRITING" | "SPEAKING";
export type InburgeringComponent = "KNM" | "ONA";
export type DutchSkill = LanguageSkill | InburgeringComponent;

export type DutchTaskType =
  | "MCQ_SINGLE"
  | "MATCHING"
  | "CLOZE"
  | "ORDERING"
  | "TRUE_FALSE"
  | "WRITING_PROMPT"
  | "SPEAKING_PROMPT"
  | "ONA_TASK";

export type DutchDifficulty = "FOUNDATION" | "CORE" | "STRETCH";

export const OBJECTIVE_TASK_TYPES: DutchTaskType[] = [
  "MCQ_SINGLE",
  "MATCHING",
  "CLOZE",
  "ORDERING",
  "TRUE_FALSE",
];

export const PRODUCTIVE_TASK_TYPES: DutchTaskType[] = [
  "WRITING_PROMPT",
  "SPEAKING_PROMPT",
  "ONA_TASK",
];

export function isObjectiveTask(t: DutchTaskType): boolean {
  return OBJECTIVE_TASK_TYPES.includes(t);
}

/** A skill is "free to taste" (auto-graded) vs gated (AI-graded / mock).
 *  Free taste = Reading + Listening + KNM (all objective, auto-graded).
 *  Gated = Writing + Speaking (AI-graded) + ONA reflection + the full mock. */
export function isFreeSkill(skill: DutchSkill): boolean {
  return skill === "READING" || skill === "LISTENING" || skill === "KNM";
}

// ---- Task payload shapes (validated in items.ts) ----

/** One multiple-choice / true-false option group. */
export interface McqPayload {
  passage?: string; // reading passage (READING/KNM) — omitted for LISTENING
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

/** Productive prompt (Writing / Speaking) — AI-graded. */
export interface ProductivePayload {
  stimulus?: string; // context / situation (NL)
  criteria: string[]; // what the answer must show (feeds AI feedback)
  charBand?: { min: number; max: number }; // writing length guidance
  minSeconds?: number; // speaking guidance
}

/** Inburgering ONA — labour-market orientation reflection (practice, not graded).
 *  The candidate writes short reflective answers; feedback is coaching-only and
 *  clearly labelled practice, never an official DUO result. */
export interface OnaTaskPayload {
  scenario: string; // a real-world Dutch labour-market situation (NL)
  prompts: string[]; // reflective questions (CV, sollicitatiebrief, job search, work culture)
  criteria: string[]; // what a strong reflection covers (feeds coaching feedback)
}
