// CAPLE scoring engine — per-skill READINESS estimate (European Portuguese).
// The official CAPLE result is a weighted global classification (Insuficiente /
// Suficiente / Bom / Muito Bom), with Suficiente (~55%) as the pass floor. We do
// NOT fabricate that weighted official mark: we score each skill's objective items
// deterministically to a percentage and map it to an honest readiness band, and
// we label productive skills as AI estimates. Isolated from the Celpe-Bras engine.

import {
  CAPLE_SUFFICIENT_PCT,
  CAPLE_GOOD_PCT,
  CAPLE_VERYGOOD_PCT,
} from "./registry";
import type { ObjectiveAnswer, PortugueseTaskType, CapleSkill } from "./types";

export type Readiness = "CLEAR" | "BORDERLINE" | "BELOW";

export interface ObjectiveResult {
  points: number;
  maxPoints: number;
}

/** Deterministically grade one objective item's response against its key. */
export function gradeObjective(
  answer: ObjectiveAnswer,
  response: unknown,
): ObjectiveResult {
  switch (answer.type) {
    case "MCQ_SINGLE":
    case "TRUE_FALSE": {
      const picked = (response as { index?: number } | null)?.index;
      return { points: picked === answer.correctIndex ? 1 : 0, maxPoints: 1 };
    }
    case "MATCHING": {
      const picks = (response as { pairs?: [number, number][] } | null)?.pairs ?? [];
      const key = new Map(answer.pairs.map(([l, r]) => [l, r]));
      let pts = 0;
      for (const [l, r] of picks) if (key.get(l) === r) pts++;
      return { points: pts, maxPoints: answer.pairs.length };
    }
    case "CLOZE": {
      const picks = (response as { gaps?: { id: number; index: number }[] } | null)?.gaps ?? [];
      const key = new Map(answer.correct.map((c) => [c.id, c.index]));
      let pts = 0;
      for (const g of picks) if (key.get(g.id) === g.index) pts++;
      return { points: pts, maxPoints: answer.correct.length };
    }
    case "ORDERING": {
      const order = (response as { order?: number[] } | null)?.order ?? [];
      const correct =
        order.length === answer.order.length &&
        order.every((v, i) => v === answer.order[i]);
      return { points: correct ? 1 : 0, maxPoints: 1 };
    }
  }
}

/** Percentage → honest readiness band vs the CAPLE Suficiente/Bom thresholds. */
export function readinessFromPct(pct: number): Readiness {
  if (pct >= CAPLE_GOOD_PCT) return "CLEAR";
  if (pct >= CAPLE_SUFFICIENT_PCT) return "BORDERLINE";
  return "BELOW";
}

export interface SkillReadout {
  skill: CapleSkill;
  points: number;
  maxPoints: number;
  pct: number;
  readiness: Readiness; // objective skills only; productive → estimate label
  isEstimate: boolean; // productive (Writing/Speaking) = AI estimate
}

export function skillReadout(
  skill: CapleSkill,
  points: number,
  maxPoints: number,
): SkillReadout {
  const pct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
  const isEstimate = skill === "WRITING" || skill === "SPEAKING";
  return { skill, points, maxPoints, pct, readiness: readinessFromPct(pct), isEstimate };
}

/** Global classification LABEL for a percentage (honest, non-official framing). */
export function classificationLabel(pct: number): string {
  if (pct >= CAPLE_VERYGOOD_PCT) return "Muito Bom (estimate)";
  if (pct >= CAPLE_GOOD_PCT) return "Bom (estimate)";
  if (pct >= CAPLE_SUFFICIENT_PCT) return "Suficiente (estimate)";
  return "Insuficiente (estimate)";
}

/**
 * Aggregate a full mock's per-skill readouts into an overall readiness estimate.
 * Honest model: CAPLE's official result is weighted and centre-marked, so we take
 * the mean objective percentage as an ORIENTATION estimate and flag the weakest
 * skill — never claim the weighted official classification.
 */
export function aggregateCaple(readouts: SkillReadout[]): {
  meanPct: number;
  overall: Readiness;
  label: string;
  weakest: CapleSkill | null;
} {
  const graded = readouts.filter((r) => r.maxPoints > 0);
  const meanPct = graded.length
    ? Math.round(graded.reduce((s, r) => s + r.pct, 0) / graded.length)
    : 0;
  let weakest: CapleSkill | null = null;
  let low = Infinity;
  for (const r of graded) if (r.pct < low) { low = r.pct; weakest = r.skill; }
  return {
    meanPct,
    overall: readinessFromPct(meanPct),
    label: classificationLabel(meanPct),
    weakest,
  };
}

/** True when this task type is auto-gradable (objective) in the CAPLE engine. */
export function isCapleObjective(t: PortugueseTaskType): boolean {
  return (
    t === "MCQ_SINGLE" ||
    t === "TRUE_FALSE" ||
    t === "MATCHING" ||
    t === "CLOZE" ||
    t === "ORDERING"
  );
}
