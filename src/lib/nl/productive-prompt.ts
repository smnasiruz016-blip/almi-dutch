// THE PRODUCTIVE-GRADING PROMPT — one assembly, derived entirely from the server-loaded
// item.
//
// WHY IT LIVES HERE RATHER THAN INLINE IN THE ROUTE. Two reasons, and the second is the
// one that matters.
//
// 1. Anything that re-creates this prompt elsewhere — a harness, a script, a test —
//    would be proving a grader that does not ship. Two copies agree on the day they are
//    written and drift silently afterwards. One assembly, both callers import it.
//
// 2. Pulling it out of the route is what makes the P0 fix REAL rather than cosmetic. The
//    old route read `body.cefr`, `body.title`, `body.prompt` and `body.criteria` and
//    interpolated them straight into the system and user messages, so the browser stated
//    the standard it was about to be judged against. Nothing here takes an argument that
//    could carry those: this function is handed a DutchItemSeed and a string, and every
//    fact in the prompt comes off the item. A future edit cannot quietly re-introduce
//    client trust without changing the signature.

import { examBySlug, ALL_EXAMS } from "@/lib/nl/registry";
import { isCefrLevel, levelInstruction } from "@smnasiruz016-blip/almi-data";
import type { CefrLevel } from "@smnasiruz016-blip/almi-data";
import type { DutchItemSeed } from "@/lib/nl/items";

export type Band = "CLEAR" | "BORDERLINE" | "BELOW";
export const BANDS: Band[] = ["CLEAR", "BORDERLINE", "BELOW"];

export interface AiFeedback {
  band: Band;
  summary: string;
  strengths: string[];
  improvements: string[];
}

/** The registry entry for an item, found by the item's OWN exam — never by a slug the
 *  caller supplied. A wrong examiner persona produces confident, fluent, wrong
 *  feedback rather than an error anyone would notice. */
export function examForItem(item: DutchItemSeed) {
  return ALL_EXAMS.find((e) => e.exam === item.exam) ?? examBySlug(String(item.exam));
}

/** The criteria the answer is judged against, off the AUTHORED payload.
 *  Never from a request: letting the caller supply these is letting it mark its own
 *  paper — and the old route did exactly that, joining `body.criteria` into a line
 *  headed "Criteria the answer should meet". */
export function criteriaOf(item: DutchItemSeed): string[] {
  const payload = (item.payload ?? {}) as { criteria?: unknown };
  return (Array.isArray(payload.criteria) ? payload.criteria : []).filter(
    (c): c is string => typeof c === "string" && c.trim().length > 0,
  );
}

/**
 * Build the system + user messages for one item and one learner answer.
 *
 * The level is the TASK's own. Falling back to the exam entry's `cefr` is deliberate but
 * narrow: those labels include "A1–A2", "A2–B1", "B1–B2" and "Knowledge test", and
 * isCefrLevel rejects every one of them. A range is not a standard — the same answer
 * passes as A2 and fails as B1 depending where the model aims — so when a task declares
 * no level the model is told there is none rather than handed a guess. KNM and ONA items
 * legitimately have no CEFR at all (60 of the 300 in this bank); they take that path and
 * are judged against their own criteria.
 */
export function buildGradePrompt(
  item: DutchItemSeed,
  response: string,
): { system: string; user: string; cefr: CefrLevel | null } {
  const exam = examForItem(item);
  const examName = exam?.name ?? "the Dutch exam";
  const cefr: CefrLevel | null = isCefrLevel(item.cefr)
    ? (item.cefr as CefrLevel)
    : isCefrLevel(exam?.cefr)
      ? (exam!.cefr as CefrLevel)
      : null;
  const levelPhrase = cefr ?? "the task's own criteria";
  const isSpeaking = item.taskType === "SPEAKING_PROMPT";
  const criteria = criteriaOf(item);

  const system = [
    `You are an experienced Dutch-language examiner for ${examName}.`,
    levelInstruction(cefr ?? undefined),
    `You give an HONEST practice readiness estimate against the task's own criteria — this is a study aid, never an official CvTE or DUO result, and you never claim otherwise.`,
    isSpeaking
      ? `This is a SPEAKING task; the learner has typed the answer they would say aloud, so judge content, structure, range and appropriacy, not pronunciation.`
      : `This is a WRITING task; judge task fulfilment, coherence, range and accuracy at ${levelPhrase}.`,
    `Be constructive, specific and level-aware. Do not inflate. Reply with STRICT JSON only, no prose, no code fences, in this exact shape:`,
    `{"band":"CLEAR|BORDERLINE|BELOW","summary":"1-2 sentence honest estimate","strengths":["..."],"improvements":["..."]}`,
    `Bands: CLEAR = comfortably meets the criteria at ${levelPhrase}; BORDERLINE = partially meets them, could go either way; BELOW = does not yet meet them.`,
  ].join(" ");

  const user = [
    `Task: ${item.title}`,
    `Instructions: ${item.prompt}`,
    criteria.length ? `Criteria the answer should meet:\n- ${criteria.join("\n- ")}` : null,
    `\nLearner's answer:\n"""${response.slice(0, 6000)}"""`,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user, cefr };
}

/** Defensive JSON extraction — models occasionally wrap JSON in prose or fences. */
export function parseFeedback(raw: string): AiFeedback | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const o = obj as Partial<AiFeedback>;
  if (!o || typeof o !== "object") return null;
  if (!o.band || !BANDS.includes(o.band)) return null;
  return {
    band: o.band,
    summary: typeof o.summary === "string" ? o.summary : "",
    strengths: Array.isArray(o.strengths) ? o.strengths.filter((s): s is string => typeof s === "string") : [],
    improvements: Array.isArray(o.improvements) ? o.improvements.filter((s): s is string => typeof s === "string") : [],
  };
}
