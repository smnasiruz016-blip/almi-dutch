// AlmiDutch — the "Choose a Test" tree + exam metadata.
// Two variants → exams → skills. Drives navigation, content filtering, and the
// honest readiness thresholds used by the scoring engines. All "pass" figures are
// framed as READINESS estimates, never the official CAPLE/Inep result.

import type {
  PortugueseVariant,
  PortugueseExam,
  CapleExam,
  PortugueseSkill,
  CapleSkill,
} from "./types";

export interface ExamMeta {
  exam: PortugueseExam;
  variant: PortugueseVariant;
  slug: string; // URL slug
  name: string; // display name
  cefr: string; // CEFR mapping label
  blurb: string; // one-line description
  skills: PortugueseSkill[];
  structuralCompetence: boolean; // B2+ (DIPLE/DAPLE/DUPLE)
  lead?: boolean; // CIPLE = citizenship lead
  mockMinutes: number; // full timed mock duration guidance
}

// CAPLE global-classification threshold (honest): the official result is a
// weighted "Suficiente" classification (~55%+). We show a per-skill readiness
// band against this, clearly labelled as an estimate.
export const CAPLE_SUFFICIENT_PCT = 55; // Suficiente floor
export const CAPLE_GOOD_PCT = 70; // Bom
export const CAPLE_VERYGOOD_PCT = 85; // Muito Bom

export const CAPLE_SKILLS: CapleSkill[] = ["READING", "LISTENING", "WRITING", "SPEAKING"];

export const SKILL_LABELS: Record<PortugueseSkill, { pt: string; en: string }> = {
  READING: { pt: "Compreensão da leitura", en: "Reading" },
  LISTENING: { pt: "Compreensão do oral", en: "Listening" },
  WRITING: { pt: "Produção e interação escritas", en: "Writing" },
  SPEAKING: { pt: "Produção e interação orais", en: "Speaking" },
  ESCRITA: { pt: "Parte Escrita", en: "Written part" },
  ORAL: { pt: "Parte Oral", en: "Oral part" },
};

export const CAPLE_EXAMS: ExamMeta[] = [
  {
    exam: "ACESSO", variant: "EUROPEAN", slug: "acesso", name: "ACESSO", cefr: "A1",
    blurb: "Entry-level European Portuguese — first contact.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: false, mockMinutes: 75,
  },
  {
    exam: "CIPLE", variant: "EUROPEAN", slug: "ciple", name: "CIPLE", cefr: "A2",
    blurb: "The A2 exam accepted for Portuguese citizenship and residency.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: false, lead: true, mockMinutes: 105,
  },
  {
    exam: "DEPLE", variant: "EUROPEAN", slug: "deple", name: "DEPLE", cefr: "B1",
    blurb: "Independent-user European Portuguese for work and study.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: false, mockMinutes: 135,
  },
  {
    exam: "DIPLE", variant: "EUROPEAN", slug: "diple", name: "DIPLE", cefr: "B2",
    blurb: "Upper-independent Portuguese, with structural competence.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: true, mockMinutes: 165,
  },
  {
    exam: "DAPLE", variant: "EUROPEAN", slug: "daple", name: "DAPLE", cefr: "C1",
    blurb: "Advanced Portuguese for academic and professional life.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: true, mockMinutes: 180,
  },
  {
    exam: "DUPLE", variant: "EUROPEAN", slug: "duple", name: "DUPLE", cefr: "C2",
    blurb: "Mastery-level European Portuguese.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], structuralCompetence: true, mockMinutes: 195,
  },
];

export const CELPE_BRAS: ExamMeta = {
  exam: "CELPE_BRAS", variant: "BRAZILIAN", slug: "celpe-bras", name: "Celpe-Bras", cefr: "Intermediário–Avançado Superior",
  blurb: "Brazil's only official Portuguese certificate — one integrated exam.",
  skills: ["ESCRITA", "ORAL"], structuralCompetence: false, mockMinutes: 200,
};

export const ALL_EXAMS: ExamMeta[] = [...CAPLE_EXAMS, CELPE_BRAS];

// Celpe-Bras holistic tiers (single estimate from an internal 0–5 band).
export interface CelpeTier {
  key: string;
  name: string;
  min: number; // inclusive lower bound on the 0–5 estimate
  max: number;
}
export const CELPE_TIERS: CelpeTier[] = [
  { key: "NONE", name: "Sem certificação", min: 0, max: 1.9999 },
  { key: "INTERMEDIARIO", name: "Intermediário", min: 2, max: 2.75 },
  { key: "INTERMEDIARIO_SUPERIOR", name: "Intermediário Superior", min: 2.7501, max: 3.5 },
  { key: "AVANCADO", name: "Avançado", min: 3.5001, max: 4.25 },
  { key: "AVANCADO_SUPERIOR", name: "Avançado Superior", min: 4.2501, max: 5 },
];

export function examBySlug(slug: string): ExamMeta | undefined {
  return ALL_EXAMS.find((e) => e.slug === slug);
}

export function examsByVariant(variant: PortugueseVariant): ExamMeta[] {
  return ALL_EXAMS.filter((e) => e.variant === variant);
}

export function isCapleExam(exam: PortugueseExam): exam is CapleExam {
  return exam !== "CELPE_BRAS";
}
