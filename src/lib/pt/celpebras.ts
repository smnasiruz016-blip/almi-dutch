// Celpe-Bras scoring engine — holistic TIER estimate (Brazilian Portuguese).
// Celpe-Bras is a single integrated exam (no per-skill scores): a candidate's
// Parte Escrita (4 integrated tasks) and Parte Oral (interview) combine into ONE
// certification tier. Below the Intermediário floor → no certificate. We estimate
// a tier from AI trait scores on the integrated tasks, ALWAYS labelled "estimate,
// not the official Inep result". Isolated from the CAPLE engine.

import { CELPE_TIERS, type CelpeTier } from "./registry";

/** Map an internal 0–5 estimate to the official-tier scale (holistic). */
export function tierFromEstimate(estimate: number): CelpeTier {
  const x = Math.max(0, Math.min(5, estimate));
  // Iterate high→low so boundary values land in the higher tier.
  for (let i = CELPE_TIERS.length - 1; i >= 0; i--) {
    if (x >= CELPE_TIERS[i].min) return CELPE_TIERS[i];
  }
  return CELPE_TIERS[0];
}

export interface CelpeTaskScore {
  // Each integrated task / oral is AI-rated 0–5 on adequacy to the enunciado
  // (genre, audience, purpose) + linguistic competence. Escrita = 4 tasks,
  // Oral = 1 holistic interview rating.
  part: "ESCRITA" | "ORAL";
  score: number; // 0–5
}

export interface CelpeResult {
  estimate: number; // 0–5 combined
  tier: CelpeTier;
  certified: boolean; // tier.key !== "NONE"
  escritaMean: number;
  oralMean: number;
}

/**
 * Combine task scores into a holistic estimate. Celpe-Bras weights the written
 * and oral parts together; we use an equal Escrita/Oral split as an honest
 * orientation (the real weighting is Inep's and not published as a formula).
 */
export function estimateCelpe(scores: CelpeTaskScore[]): CelpeResult {
  const escrita = scores.filter((s) => s.part === "ESCRITA").map((s) => s.score);
  const oral = scores.filter((s) => s.part === "ORAL").map((s) => s.score);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const escritaMean = mean(escrita);
  const oralMean = mean(oral);
  // If only one part was attempted, use it alone; else equal split.
  const parts = [escritaMean, oralMean].filter((_, i) => (i === 0 ? escrita.length : oral.length));
  const estimate = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
  const tier = tierFromEstimate(estimate);
  return {
    estimate: Math.round(estimate * 100) / 100,
    tier,
    certified: tier.key !== "NONE",
    escritaMean: Math.round(escritaMean * 100) / 100,
    oralMean: Math.round(oralMean * 100) / 100,
  };
}
