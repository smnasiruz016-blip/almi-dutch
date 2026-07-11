// Engine selftests — run with `npm run selftest:engine` (tsx).
// Proves CAPLE readiness bands + Celpe-Bras tier mapping are correct and that the
// two engines never cross-contaminate.

import { gradeObjective, readinessFromPct, skillReadout, aggregateCaple } from "./caple";
import { tierFromEstimate, estimateCelpe } from "./celpebras";

let pass = 0;
let fail = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; } else { fail++; console.error(`✗ ${label}: got ${a}, want ${e}`); }
}

// ---- CAPLE objective grading ----
eq(gradeObjective({ type: "MCQ_SINGLE", correctIndex: 2 }, { index: 2 }), { points: 1, maxPoints: 1 }, "mcq correct");
eq(gradeObjective({ type: "MCQ_SINGLE", correctIndex: 2 }, { index: 0 }), { points: 0, maxPoints: 1 }, "mcq wrong");
eq(gradeObjective({ type: "TRUE_FALSE", correctIndex: 1 }, { index: 1 }), { points: 1, maxPoints: 1 }, "tf correct");
eq(
  gradeObjective({ type: "MATCHING", pairs: [[0, 1], [1, 2], [2, 0]] }, { pairs: [[0, 1], [1, 2], [2, 2]] }),
  { points: 2, maxPoints: 3 },
  "matching partial",
);
eq(
  gradeObjective({ type: "CLOZE", correct: [{ id: 1, index: 0 }, { id: 2, index: 3 }] }, { gaps: [{ id: 1, index: 0 }, { id: 2, index: 1 }] }),
  { points: 1, maxPoints: 2 },
  "cloze partial",
);
eq(gradeObjective({ type: "ORDERING", order: [2, 0, 1] }, { order: [2, 0, 1] }), { points: 1, maxPoints: 1 }, "ordering correct");
eq(gradeObjective({ type: "ORDERING", order: [2, 0, 1] }, { order: [0, 1, 2] }), { points: 0, maxPoints: 1 }, "ordering wrong");

// ---- CAPLE readiness bands (Suficiente 55 / Bom 70) ----
eq(readinessFromPct(85), "CLEAR", "band 85");
eq(readinessFromPct(70), "CLEAR", "band 70 floor");
eq(readinessFromPct(69), "BORDERLINE", "band 69");
eq(readinessFromPct(55), "BORDERLINE", "band 55 floor");
eq(readinessFromPct(54), "BELOW", "band 54");
eq(readinessFromPct(0), "BELOW", "band 0");

// productive skills flagged as estimate
eq(skillReadout("WRITING", 0, 0).isEstimate, true, "writing is estimate");
eq(skillReadout("READING", 8, 10).isEstimate, false, "reading not estimate");
eq(skillReadout("READING", 8, 10).readiness, "CLEAR", "reading 80% clear");

// aggregate: weakest skill + mean
{
  const agg = aggregateCaple([
    skillReadout("READING", 9, 10), // 90
    skillReadout("LISTENING", 5, 10), // 50 (weakest)
  ]);
  eq(agg.meanPct, 70, "agg mean");
  eq(agg.weakest, "LISTENING", "agg weakest");
  eq(agg.overall, "CLEAR", "agg overall 70");
}

// ---- Celpe-Bras tiers (holistic 0–5) ----
eq(tierFromEstimate(1.5).key, "NONE", "celpe <2 none");
eq(tierFromEstimate(2).key, "INTERMEDIARIO", "celpe 2 intermediario");
eq(tierFromEstimate(2.75).key, "INTERMEDIARIO", "celpe 2.75 intermediario");
eq(tierFromEstimate(2.8).key, "INTERMEDIARIO_SUPERIOR", "celpe 2.8 int-sup");
eq(tierFromEstimate(3.5).key, "INTERMEDIARIO_SUPERIOR", "celpe 3.5 int-sup");
eq(tierFromEstimate(4).key, "AVANCADO", "celpe 4 avancado");
eq(tierFromEstimate(4.3).key, "AVANCADO_SUPERIOR", "celpe 4.3 av-sup");
eq(tierFromEstimate(5).key, "AVANCADO_SUPERIOR", "celpe 5 av-sup");

// combined estimate: escrita+oral equal split
{
  const r = estimateCelpe([
    { part: "ESCRITA", score: 3 }, { part: "ESCRITA", score: 4 },
    { part: "ESCRITA", score: 3 }, { part: "ESCRITA", score: 4 }, // escritaMean 3.5
    { part: "ORAL", score: 4 }, // oralMean 4
  ]);
  eq(r.escritaMean, 3.5, "celpe escrita mean");
  eq(r.oralMean, 4, "celpe oral mean");
  eq(r.estimate, 3.75, "celpe combined estimate");
  eq(r.tier.key, "AVANCADO", "celpe combined tier");
  eq(r.certified, true, "celpe certified");
}
// below-floor → no certificate
eq(estimateCelpe([{ part: "ESCRITA", score: 1 }, { part: "ORAL", score: 1.5 }]).certified, false, "celpe below floor uncertified");

console.log(`\nAlmiDutch engine selftest: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
