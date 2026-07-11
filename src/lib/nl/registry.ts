// AlmiDutch — the "Choose a Test" tree + exam metadata.
// Two tracks → exams → skills. Drives navigation, content filtering, and the
// honest readiness thresholds used by the scoring engine. All "pass" figures are
// framed as READINESS estimates, never the official CvTE / DUO result.

import type {
  DutchTrack,
  DutchExam,
  Nt2Exam,
  InburgeringExam,
  DutchSkill,
  LanguageSkill,
} from "./types";

export interface ExamMeta {
  exam: DutchExam;
  track: DutchTrack;
  slug: string; // URL slug
  name: string; // display name
  cefr: string; // CEFR level label
  blurb: string; // one-line description
  skills: DutchSkill[];
  lead?: boolean; // citizenship/naturalisatie-relevant (Inburgering)
  mockMinutes: number; // full timed mock duration guidance
}

// Per-skill readiness thresholds (honest). NT2 parts and the Inburgering exams
// are pass/fail against official criteria; we show a per-skill readiness band as
// an estimate, clearly labelled — never an official CvTE/DUO result.
export const READY_PCT = 70; // CLEAR — comfortably meeting the level's demands
export const BORDERLINE_PCT = 55; // BORDERLINE — close, needs consolidation

export const LANGUAGE_SKILLS: LanguageSkill[] = ["READING", "LISTENING", "WRITING", "SPEAKING"];

export const SKILL_LABELS: Record<DutchSkill, { nl: string; en: string }> = {
  READING: { nl: "Lezen", en: "Reading" },
  LISTENING: { nl: "Luisteren", en: "Listening" },
  WRITING: { nl: "Schrijven", en: "Writing" },
  SPEAKING: { nl: "Spreken", en: "Speaking" },
  KNM: { nl: "Kennis van de Nederlandse Maatschappij", en: "Knowledge of Dutch Society (KNM)" },
  ONA: { nl: "Oriëntatie op de Nederlandse Arbeidsmarkt", en: "Labour-market orientation (ONA)" },
};

// NT2 Staatsexamen — two programmes. Diploma NT2 requires passing all four parts.
export const NT2_EXAMS: ExamMeta[] = [
  {
    exam: "PROGRAMMA_I", track: "NT2", slug: "programma-i", name: "NT2 Programma I", cefr: "B1",
    blurb: "Dutch at B1 — for work or vocational training in a Dutch-speaking environment.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], mockMinutes: 200,
  },
  {
    exam: "PROGRAMMA_II", track: "NT2", slug: "programma-ii", name: "NT2 Programma II", cefr: "B2",
    blurb: "Dutch at B2 — for higher education (college/university) or professional work.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING"], mockMinutes: 230,
  },
];

// Inburgering — four language skills + KNM + ONA. Level is set by the date the
// integration obligation started (Wet inburgering 2021): B1 on/after 1 Jan 2022,
// otherwise A2. Passing the exam is commonly used as the language proof for
// naturalisatie — but confirm the current rule with DUO / IND.
export const INBURGERING_EXAMS: ExamMeta[] = [
  {
    exam: "INBURGERING_A2", track: "INBURGERING", slug: "inburgering-a2", name: "Inburgering (A2)", cefr: "A2",
    blurb: "Civic integration at A2 — for obligations that started before 1 Jan 2022.",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING", "KNM", "ONA"], lead: true, mockMinutes: 210,
  },
  {
    exam: "INBURGERING_B1", track: "INBURGERING", slug: "inburgering-b1", name: "Inburgering (B1)", cefr: "B1",
    blurb: "Civic integration at B1 — Wet inburgering 2021 (obligation on/after 1 Jan 2022).",
    skills: ["READING", "LISTENING", "WRITING", "SPEAKING", "KNM", "ONA"], lead: true, mockMinutes: 220,
  },
];

export const ALL_EXAMS: ExamMeta[] = [...NT2_EXAMS, ...INBURGERING_EXAMS];

export function examBySlug(slug: string): ExamMeta | undefined {
  return ALL_EXAMS.find((e) => e.slug === slug);
}

export function examsByTrack(track: DutchTrack): ExamMeta[] {
  return ALL_EXAMS.filter((e) => e.track === track);
}

export function isNt2Exam(exam: DutchExam): exam is Nt2Exam {
  return exam === "PROGRAMMA_I" || exam === "PROGRAMMA_II";
}

export function isInburgeringExam(exam: DutchExam): exam is InburgeringExam {
  return exam === "INBURGERING_A2" || exam === "INBURGERING_B1";
}
