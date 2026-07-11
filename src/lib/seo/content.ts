// Deterministic, honest, varied content generator for the pSEO matrix.
// Every page is composed from its axes' REAL attributes; phrasing variants are
// selected by hash(slug) so text distributes across ~7.8M pages without thin
// duplication. Honesty guardrails (spec §7): readiness = band/estimate never an
// official CAPLE/Inep result; citizenship residency NEVER a fixed year count
// (Portugal's 2026 nationality-law change) — always "confirm with the authority".

import { CAPLE_EXAMS, type ExamMeta } from "@/lib/pt/registry";
import {
  hash, pick, studyPath, jobsPath,
  UNIVERSITIES, COUNTRIES, HUBS,
  type SeoUniversity, type SeoRole, type SeoCountry, type SeoSubject, type SeoHub,
} from "@/lib/seo/axes";

const SITE = "https://almidutch.almiworld.com";

export interface SeoPage {
  h1: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  intro: string[];
  sections: { heading: string; body: string[] }[];
  faq: { q: string; a: string }[];
  related: { href: string; label: string }[];
  breadcrumbs: { name: string; path: string }[];
  jsonLd: Record<string, unknown>;
}

// Honest per-subject descriptors + whether the field is typically regulated.
const SUBJECT_META: Record<string, { field: string; regulated: boolean }> = {
  "medicine-health-sciences": { field: "medicine, nursing and the health sciences", regulated: true },
  "engineering-technology": { field: "engineering and applied technology", regulated: false },
  "computer-science-it": { field: "computer science, software and IT", regulated: false },
  "business-management": { field: "business, management and economics", regulated: false },
  "law": { field: "law and legal studies", regulated: true },
  "natural-sciences": { field: "the natural sciences", regulated: false },
  "arts-humanities": { field: "the arts and humanities", regulated: false },
  "social-sciences": { field: "the social sciences", regulated: false },
  "education": { field: "education and teaching", regulated: true },
  "mathematics-statistics": { field: "mathematics and statistics", regulated: false },
  "architecture-design": { field: "architecture and design", regulated: true },
  "agriculture-environment": { field: "agriculture and environmental science", regulated: false },
};

const examByCefr = (cefr: string): ExamMeta => CAPLE_EXAMS.find((e) => e.cefr === cefr)!;
const CIPLE = examByCefr("A2");
const DEPLE = examByCefr("B1");
const DIPLE = examByCefr("B2");

// Shared honest fragments -----------------------------------------------------
const READINESS_LINE =
  "AlmiDutch gives you an honest readiness estimate — a per-skill band (Clear or Borderline) against each exam's real criteria — never an invented official CAPLE result.";
const CITIZENSHIP_HEDGE =
  "CIPLE (A2) is commonly accepted as the Portuguese-language requirement for citizenship and residency. Portugal's nationality rules changed in 2026, so we don't state a fixed number of residency years — always confirm the current requirement with the relevant Portuguese authority (AIMA / IRN).";
const MISSION_LINE =
  "25% of AlmiDutch proceeds fund the Shamool Foundation's social mission.";
const CTA_LINE =
  "Reading and Listening practice is free; AI feedback on Writing and Speaking and the full timed mock unlock with a 7-day free trial ($12/month after, cancel anytime).";

function levelForSubject(subjectSlug: string): ExamMeta {
  // Undergraduate Portuguese-taught programmes typically sit around B1–B2.
  return SUBJECT_META[subjectSlug]?.regulated ? DIPLE : DEPLE;
}

// A few sibling internal links (same subject, other origin countries).
function relatedStudy(subject: SeoSubject, country: SeoCountry, seed: number): { href: string; label: string }[] {
  const others = COUNTRIES.filter((c) => c.slug !== country.slug);
  const picks = [others[seed % others.length], others[(seed * 7 + 3) % others.length], others[(seed * 13 + 5) % others.length]]
    .filter((c, i, a) => c && a.findIndex((x) => x.slug === c.slug) === i);
  const uniPick = UNIVERSITIES[(seed * 17) % UNIVERSITIES.length];
  return picks.map((c) => ({ href: studyPath(subject.slug, c.slug, uniPick.slug), label: `${subject.name} in Portugal from ${c.name}` }));
}

// ---- STUDY PAGE -------------------------------------------------------------
export function buildStudyPage(subject: SeoSubject, country: SeoCountry, uni: SeoUniversity): SeoPage {
  const path = studyPath(subject.slug, country.slug, uni.slug);
  const seed = hash(path);
  const sm = SUBJECT_META[subject.slug] ?? { field: subject.name.toLowerCase(), regulated: false };
  const level = levelForSubject(subject.slug);
  const uniPlace = [uni.city, uni.countryName].filter(Boolean).join(", ");

  const introVariants = [
    `Planning to study ${sm.field} in Portugal from ${country.name}? Portuguese universities and polytechnics offer strong programmes across ${subject.name.toLowerCase()}, and the step most students underestimate is the Portuguese-language requirement.`,
    `${subject.name} is a popular reason students from ${country.name} look to Portugal. Whichever university and city you aim for, one thing decides how smoothly you settle in and study: your Portuguese.`,
    `If you're coming from ${country.name} to study ${sm.field} in Portugal, the academic side is only half the picture — the language pathway is what turns an offer into a place you can actually live and learn in.`,
  ];
  const uniLine =
    `${uni.name} — based in ${uniPlace} — is one of the institutions in our directory${uni.subjects.length ? `, associated with fields such as ${uni.subjects.slice(0, 3).join(", ")}` : ""}. If you studied at ${uni.name} or a comparable institution, your degree background matters for admission, but Portuguese proficiency is assessed separately.`;

  return {
    h1: `Study ${subject.name} in Portugal from ${country.name}`,
    subtitle: `Reference institution: ${uni.name} (${uniPlace})`,
    metaTitle: `Study ${subject.name} in Portugal from ${country.name} — Portuguese language pathway | AlmiDutch`,
    metaDescription: `The Portuguese-language route for ${country.name} students studying ${sm.field} in Portugal — typical CAPLE level (${level.name} ${level.cefr}), honest readiness practice, and how to prepare. Not an official result.`,
    canonicalPath: path,
    intro: [pick(introVariants, seed), uniLine],
    sections: [
      {
        heading: "The Portuguese-language requirement",
        body: [
          `Many Portuguese-taught programmes ask for around B1–B2 — that maps to ${DEPLE.name} (B1) or ${DIPLE.name} (B2) in the CAPLE suite. Some English-taught master's may not require Portuguese for admission, but you'll still need it for daily life, paperwork and part-time work. Confirm the exact requirement with the specific university and programme.`,
          sm.regulated
            ? `${subject.name} is often a regulated field: beyond admission, professional practice in Portugal can require higher Portuguese proficiency and separate recognition of your qualifications. Treat the exam as one step and confirm recognition with the relevant Portuguese authority.`
            : `For ${sm.field}, a solid B1–B2 lets you follow lectures, write assignments and integrate — aim a level above the minimum if you can.`,
        ],
      },
      {
        heading: `Practise for ${level.name} (${level.cefr}) — honestly`,
        body: [
          `AlmiDutch lets you practise the four CAPLE skills — Reading, Listening, Writing and Speaking — at ${level.name} and every other level. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
      {
        heading: "Thinking about staying after your studies?",
        body: [`If you plan to remain in Portugal after graduating, the language also matters for residency and, later, citizenship. ${CITIZENSHIP_HEDGE}`],
      },
    ],
    faq: [
      { q: `Do I need Portuguese to study ${subject.name} in Portugal?`, a: `Usually yes for Portuguese-taught programmes (around B1–B2). English-taught master's may waive it for admission, but you'll still need Portuguese day-to-day. Confirm with the university.` },
      { q: `Which CAPLE level should I aim for?`, a: `Most higher-education programmes sit around ${DEPLE.name} (B1) to ${DIPLE.name} (B2). Regulated fields and professional practice may need more. AlmiDutch shows an honest per-skill readiness band, not an official score.` },
      { q: `Is the readiness estimate my real CAPLE result?`, a: `No. It's a practice estimate against the real criteria to guide your prep. Only CAPLE (Camões / University of Lisbon) issues official results.` },
    ],
    related: [
      { href: `/exams/caple/${level.slug}`, label: `${level.name} (${level.cefr}) exam guide` },
      { href: `/exams/caple/${CIPLE.slug}`, label: `CIPLE (A2) — citizenship exam` },
      ...relatedStudy(subject, country, seed),
    ],
    breadcrumbs: [
      { name: "Study in Portugal", path: "/study-in-portugal" },
      { name: subject.name, path: `/study-in-portugal/${subject.slug}` },
      { name: country.name, path: path },
    ],
    jsonLd: faqJsonLd([
      { q: `Do I need Portuguese to study ${subject.name} in Portugal?`, a: `Usually yes for Portuguese-taught programmes (around B1–B2); confirm with the university.` },
    ], `${SITE}${path}`, `Study ${subject.name} in Portugal from ${country.name}`),
  };
}

// ---- JOBS PAGE --------------------------------------------------------------
export function buildJobsPage(role: SeoRole, country: SeoCountry, hub: SeoHub): SeoPage {
  const path = jobsPath(role.slug, country.slug, hub.slug);
  const seed = hash(path);
  const clientFacing = role.collar === "pink" || role.collar === "white";

  const introVariants = [
    `Moving from ${country.name} to work as a ${role.name} in ${hub.name}, Portugal? ${hub.profile} How much Portuguese you need depends a lot on the role — and it's easy to underestimate.`,
    `${role.name}s from ${country.name} looking at ${hub.name} face two questions: is there demand, and how good does my Portuguese need to be? ${hub.profile}`,
    `Working in Portugal as a ${role.name} — coming from ${country.name} — starts with the language. ${hub.name}: ${hub.profile}`,
  ];

  return {
    h1: `Work in Portugal as a ${role.name} from ${country.name}`,
    subtitle: `${hub.name} · ${hub.region}`,
    metaTitle: `Work in Portugal as a ${role.name} from ${country.name} (${hub.name}) — Portuguese you'll need | AlmiDutch`,
    metaDescription: `The Portuguese-language side of working as a ${role.name} in ${hub.name}, Portugal, coming from ${country.name} — how much you'll need, which CAPLE level, and honest readiness practice. Confirm specifics with employers and regulators.`,
    canonicalPath: path,
    intro: [pick(introVariants, seed)],
    sections: [
      {
        heading: `How much Portuguese does a ${role.name} need?`,
        body: [
          clientFacing
            ? `As a ${role.name}, you'll likely deal with colleagues, clients or patients directly, so employers often expect conversational-to-professional Portuguese — think B1–B2 and up. Even in international teams, Portuguese widens your options in ${hub.name}.`
            : `A ${role.name} in a technical or international team in ${hub.name} may work largely in English, especially in tech and startups. But Portuguese still helps with admin, teammates and everyday life — and it's essential if you plan to stay long-term.`,
          `Some professions are regulated and need formal recognition plus a set language level — confirm the exact requirement with the employer and the relevant Portuguese regulator.`,
        ],
      },
      {
        heading: "Residency, and later citizenship",
        body: [`If working in ${hub.name} is a step toward settling in Portugal, the language matters beyond the job. ${CITIZENSHIP_HEDGE}`],
      },
      {
        heading: "Practise the Portuguese you'll actually use — honestly",
        body: [
          `Practise CAPLE Reading, Listening, Writing and Speaking at the level you need. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
    ],
    faq: [
      { q: `Do I need Portuguese to work as a ${role.name} in Portugal?`, a: `It depends on the role. Client-facing and regulated jobs usually expect B1–B2 or more; some technical roles in ${hub.name} run in English. You'll still need Portuguese for daily life and long-term stay. Confirm with the employer.` },
      { q: `Which CAPLE level should I practise?`, a: `CIPLE (A2) is the common baseline for residency; many jobs want B1–B2 (DEPLE/DIPLE). AlmiDutch shows an honest readiness band, never an official result.` },
    ],
    related: [
      { href: `/exams/caple/${CIPLE.slug}`, label: `CIPLE (A2) — citizenship exam` },
      { href: `/exams/caple/${DEPLE.slug}`, label: `${DEPLE.name} (B1) exam guide` },
      ...HUBS.filter((h) => h.slug !== hub.slug).map((h) => ({ href: jobsPath(role.slug, country.slug, h.slug), label: `${role.name} in ${h.name}` })),
    ],
    breadcrumbs: [
      { name: "Work in Portugal", path: "/work-in-portugal" },
      { name: role.name, path: `/work-in-portugal/${role.slug}` },
      { name: `${country.name} · ${hub.name}`, path: path },
    ],
    jsonLd: faqJsonLd([
      { q: `Do I need Portuguese to work as a ${role.name} in Portugal?`, a: `It depends on the role; client-facing and regulated jobs usually expect B1–B2. Confirm with the employer.` },
    ], `${SITE}${path}`, `Work in Portugal as a ${role.name} from ${country.name}`),
  };
}

// ---- CAPLE LEVEL PAGE -------------------------------------------------------
export function buildLevelPage(exam: ExamMeta): SeoPage {
  const path = `/exams/caple/${exam.slug}`;
  const isCiple = exam.cefr === "A2";
  const structural = exam.structuralCompetence ? " At this level the exam also assesses structural competence (grammar and vocabulary in use)." : "";
  return {
    h1: isCiple ? `${exam.name} (A2) — the Portuguese citizenship exam` : `${exam.name} (${exam.cefr}) — European Portuguese exam`,
    subtitle: exam.blurb,
    metaTitle: isCiple
      ? `CIPLE (A2): the Portuguese citizenship & residency exam — format and practice | AlmiDutch`
      : `${exam.name} (${exam.cefr}) — CAPLE European Portuguese exam format & practice | AlmiDutch`,
    metaDescription: `${exam.name} (${exam.cefr}) in the CAPLE suite: what it tests, how it's structured, and honest readiness practice for Reading, Listening, Writing and Speaking. ${isCiple ? "Commonly accepted for Portuguese citizenship — confirm with the authority." : "Practice estimate, not an official result."}`,
    canonicalPath: path,
    intro: [
      `${exam.name} is the ${exam.cefr}-level exam in the CAPLE suite, produced by the University of Lisbon with Instituto Camões and taken in European Portuguese (PT-PT). It assesses four skills — Reading (Compreensão da leitura), Listening (Compreensão do oral), Writing (Produção escrita) and Speaking (Produção oral).${structural}`,
    ],
    sections: [
      isCiple
        ? { heading: "CIPLE and Portuguese citizenship", body: [CITIZENSHIP_HEDGE] }
        : { heading: `Who ${exam.name} is for`, body: [`${exam.blurb} It suits learners who can already handle Portuguese at roughly ${exam.cefr} and want an honest read on whether they're ready.`] },
      {
        heading: "Honest readiness, not a fake score",
        body: [
          `Reading and Listening are auto-marked to a clear per-skill band — Clear or Borderline — against the real criteria. Writing and Speaking get AI feedback labelled an estimate. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
      {
        heading: "Prepare by where you're coming from",
        body: [`Studying or working in Portugal? See the language pathway for your situation — from any country, for study or work.`],
      },
    ],
    faq: [
      { q: `What level is ${exam.name}?`, a: `${exam.name} maps to CEFR ${exam.cefr}.` },
      isCiple
        ? { q: `Is CIPLE the exam for Portuguese citizenship?`, a: `CIPLE (A2) is commonly accepted as the language requirement for citizenship and residency. Rules changed in 2026 — confirm the current requirement with the relevant Portuguese authority.` }
        : { q: `Is my AlmiDutch result official?`, a: `No — it's an honest practice estimate. Only CAPLE issues official results.` },
    ],
    related: [
      ...CAPLE_EXAMS.filter((e) => e.slug !== exam.slug).map((e) => ({ href: `/exams/caple/${e.slug}`, label: `${e.name} (${e.cefr})` })),
    ],
    breadcrumbs: [
      { name: "CAPLE exams", path: "/exams/caple" },
      { name: `${exam.name} (${exam.cefr})`, path: path },
    ],
    jsonLd: faqJsonLd(
      [{ q: `What level is ${exam.name}?`, a: `${exam.name} maps to CEFR ${exam.cefr}.` }],
      `${SITE}${path}`,
      `${exam.name} (${exam.cefr}) — CAPLE exam`,
    ),
  };
}

function faqJsonLd(faq: { q: string; a: string }[], url: string, name: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, name, url },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

export { MISSION_LINE };
