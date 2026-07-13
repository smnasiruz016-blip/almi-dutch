// Deterministic, honest, varied content generator for the pSEO matrix.
// Every page is composed from its axes' REAL attributes; phrasing variants are
// selected by hash(slug) so text distributes across millions of pages without
// thin duplication. Honesty guardrails (spec §7): readiness = band/estimate,
// never an official CvTE/DUO result; citizenship/naturalisatie NEVER a fixed
// year count or fixed level — always "confirm with DUO / IND".

import { NT2_EXAMS, INBURGERING_EXAMS, ALL_EXAMS, type ExamMeta } from "@/lib/nl/registry";
import {
  hash, pick, studyPath, jobsPath,
  UNIVERSITIES, COUNTRIES, HUBS,
  type SeoUniversity, type SeoRole, type SeoCountry, type SeoSubject, type SeoHub,
} from "@/lib/seo/axes";
import { uniTeaches } from "@/lib/seo/subject-mapper";
import { type OriginBlock } from "@/lib/seo/origin-localization";

const SITE = "https://almidutch.almiworld.com";

export interface SeoPage {
  h1: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  /** Taught-gate: false = untaught cell → route emits robots:{index:false} +
      canonical-up to the subject×origin hub (Localization Standard rule #3). */
  indexable: boolean;
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

// NT2 Programma I (B1) and Programma II (B2) are the two study/work language levels;
// Inburgering (A2) is the civic-integration exam commonly relevant to residency.
const PROG_I = NT2_EXAMS.find((e) => e.exam === "PROGRAMMA_I")!;
const PROG_II = NT2_EXAMS.find((e) => e.exam === "PROGRAMMA_II")!;
const INB_A2 = INBURGERING_EXAMS.find((e) => e.exam === "INBURGERING_A2")!;

// Shared honest fragments -----------------------------------------------------
const READINESS_LINE =
  "AlmiDutch gives you an honest readiness estimate — a per-skill band (Clear or Borderline) against each exam's real criteria — never an invented official CvTE or DUO result.";
const CITIZENSHIP_HEDGE =
  "Passing the Inburgering exam or NT2 is commonly used as the Dutch-language proof for naturalisatie and a stronger residence permit — often at A2, or B1 for people whose integration obligation started on or after 1 January 2022 (Wet inburgering 2021). Naturalisation rules change, so we don't state fixed years or a fixed level — always confirm the current requirement with the relevant Dutch authority (DUO / IND).";
const MISSION_LINE =
  "25% of AlmiDutch proceeds fund the Shamool Foundation's social mission.";
const CTA_LINE =
  "Reading and Listening practice is free; AI feedback on Writing and Speaking and the full timed mock unlock with a 7-day free trial ($12/month after, cancel anytime).";

function levelForSubject(subjectSlug: string): ExamMeta {
  // Higher education in Dutch typically sits around B2; vocational/work around B1.
  return SUBJECT_META[subjectSlug]?.regulated ? PROG_II : PROG_I;
}

// Display label for an exam. NT2 names carry the level in the name ("Programma I")
// with the CEFR separate, while Inburgering names embed the CEFR ("Inburgering
// (A2)") to tell the two apart — so only append "(cefr)" when it's not already
// present, to avoid "Inburgering (A2) (A2)".
function examLabel(e: ExamMeta): string {
  return e.name.includes(`(${e.cefr})`) ? e.name : `${e.name} (${e.cefr})`;
}

// A few sibling internal links (same subject, other origin countries).
function relatedStudy(subject: SeoSubject, country: SeoCountry, seed: number): { href: string; label: string }[] {
  const others = COUNTRIES.filter((c) => c.slug !== country.slug);
  const picks = [others[seed % others.length], others[(seed * 7 + 3) % others.length], others[(seed * 13 + 5) % others.length]]
    .filter((c, i, a) => c && a.findIndex((x) => x.slug === c.slug) === i);
  const uniPick = UNIVERSITIES[(seed * 17) % UNIVERSITIES.length];
  return picks.map((c) => ({ href: studyPath(subject.slug, c.slug, uniPick.slug), label: `${subject.name} in the Netherlands from ${c.name}` }));
}

// Strip trailing sentence punctuation so an origin's commonConcern reads cleanly inline.
const cleanConcern = (s: string): string => s.replace(/\s*[.?;]+\s*$/, "").trim();

// ---- STUDY PAGE -------------------------------------------------------------
// `origin` REQUIRED (Standard rule #2): a per-origin recognition block is always
// woven, so a bare name-swap template is structurally impossible.
export function buildStudyPage(subject: SeoSubject, country: SeoCountry, uni: SeoUniversity, origin: OriginBlock): SeoPage {
  const path = studyPath(subject.slug, country.slug, uni.slug);
  const seed = hash(path);
  const sm = SUBJECT_META[subject.slug] ?? { field: subject.name.toLowerCase(), regulated: false };
  const level = levelForSubject(subject.slug);
  const uniPlace = [uni.city, uni.countryName].filter(Boolean).join(", ");

  // TAUGHT-GATE (rule #3): index only where the uni teaches the subject; else
  // noindex + canonical-up to the subject×origin hub.
  const taught = uniTeaches(uni, subject.slug);
  const canonicalPath = taught ? path : `/study-in-netherlands/${subject.slug}/from/${country.slug}`;

  const recognitionSection = {
    heading: `Using a Dutch degree back in ${country.name}`,
    body: [
      origin.localized
        ? `In ${country.name}, recognition of a foreign degree goes through ${origin.recognitionBody}${origin.recognitionUrl ? ` (${origin.recognitionUrl})` : ""}. ${origin.equivalenceNote}`
        : origin.equivalenceNote,
      `A common concern for students from ${country.name} — "${cleanConcern(origin.commonConcern)}" — is worth planning early, alongside the language requirement.${origin.sourceNote ? ` (${origin.sourceNote})` : ""}${origin.searchTerms.length ? ` Students from ${country.name} commonly search for: ${origin.searchTerms.join(", ")}.` : ""}`,
    ],
  };

  const introVariants = [
    `Planning to study ${sm.field} in the Netherlands from ${country.name}? Dutch universities and universities of applied sciences (hogescholen) offer strong programmes across ${subject.name.toLowerCase()}. Many are taught in English — but for a Dutch-taught programme, and for daily life, the step students most often underestimate is the Dutch-language requirement.`,
    `${subject.name} is a popular reason students from ${country.name} look to the Netherlands. Whichever university and city you aim for, one thing shapes how smoothly you settle in and study a Dutch-taught programme: your Dutch.`,
    `If you're coming from ${country.name} to study ${sm.field} in the Netherlands, the academic side is only half the picture — where a programme is taught in Dutch, the language pathway (NT2) is what turns an offer into a place you can fully live and learn in.`,
  ];
  const uniLine = taught
    ? `${uni.name} — based in ${uniPlace} — lists programmes associated with ${subject.name.toLowerCase()}${uni.subjects.length ? ` (fields such as ${uni.subjects.slice(0, 3).join(", ")})` : ""}. Your degree background matters for admission, but Dutch proficiency is assessed separately.`
    : `${uni.name} — based in ${uniPlace} — is in our directory, but its public listing doesn't specifically show ${subject.name.toLowerCase()}. For a verified overview see the ${subject.name} in the Netherlands from ${country.name} guide; here we focus on the Dutch-language pathway, which applies wherever you study.`;

  return {
    h1: `Study ${subject.name} in the Netherlands from ${country.name}`,
    subtitle: `Reference institution: ${uni.name} (${uniPlace})`,
    metaTitle: `Study ${subject.name} in the Netherlands from ${country.name} — Dutch language pathway | AlmiDutch`,
    metaDescription: `The Dutch-language route for ${country.name} students studying ${sm.field} in the Netherlands — typical NT2 level (${level.name} ${level.cefr}), degree recognition via ${origin.recognitionBody}, and honest readiness practice. Not an official result.`,
    canonicalPath,
    indexable: taught,
    intro: [pick(introVariants, seed), uniLine],
    sections: [
      {
        heading: "The Dutch-language requirement",
        body: [
          `The Netherlands offers many English-taught programmes, especially at master's level — those may not require Dutch for admission. Dutch-taught programmes typically ask for around B1–B2, which maps to ${PROG_I.name} (B1) or ${PROG_II.name} (B2) in the NT2 Staatsexamen. Either way you'll need Dutch for paperwork, part-time work and everyday life. Confirm the exact requirement with the specific university and programme.`,
          sm.regulated
            ? `${subject.name} is often a regulated field: beyond admission, professional practice in the Netherlands can require a set Dutch level plus separate recognition of your qualifications (for example via the BIG register for healthcare). Treat the exam as one step and confirm recognition with the relevant Dutch authority.`
            : `For ${sm.field}, a solid B1–B2 lets you follow a Dutch-taught programme, write assignments and integrate — aim a level above the minimum if you can.`,
        ],
      },
      recognitionSection,
      {
        heading: `Practise for ${level.name} (${level.cefr}) — honestly`,
        body: [
          `AlmiDutch lets you practise the four NT2 skills — Reading, Listening, Writing and Speaking — at ${level.name} and the other level. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
      {
        heading: "Thinking about staying after your studies?",
        body: [`If you plan to remain in the Netherlands after graduating, the language also matters for residency and, later, citizenship. ${CITIZENSHIP_HEDGE}`],
      },
    ],
    faq: [
      { q: `Do I need Dutch to study ${subject.name} in the Netherlands?`, a: `For Dutch-taught programmes, usually around B1–B2. Many English-taught master's waive it for admission, but you'll still need Dutch day-to-day. Confirm with the university.` },
      { q: `Will a Dutch degree be recognised in ${country.name}?`, a: origin.localized
        ? `Recognition of a foreign degree in ${country.name} goes through ${origin.recognitionBody}. ${origin.equivalenceNote} Confirm the current process on the official site${origin.recognitionUrl ? ` (${origin.recognitionUrl})` : ""}.`
        : origin.equivalenceNote },
      { q: `Which NT2 level should I aim for?`, a: `Most higher-education programmes in Dutch sit around ${PROG_I.name} (B1) to ${PROG_II.name} (B2). Regulated fields and professional practice may need more. AlmiDutch shows an honest per-skill readiness band, not an official score.` },
    ],
    related: [
      { href: `/exams/${level.slug}`, label: `${level.name} (${level.cefr}) exam guide` },
      { href: `/exams/${INB_A2.slug}`, label: `Inburgering (A2) — integration & residency` },
      ...relatedStudy(subject, country, seed),
    ],
    breadcrumbs: [
      { name: "Study in the Netherlands", path: "/study-in-netherlands" },
      { name: subject.name, path: `/study-in-netherlands/${subject.slug}` },
      { name: country.name, path: canonicalPath },
    ],
    jsonLd: faqJsonLd([
      { q: `Do I need Dutch to study ${subject.name} in the Netherlands?`, a: `For Dutch-taught programmes, usually around B1–B2; many English-taught master's waive it for admission. Confirm with the university.` },
    ], `${SITE}${path}`, `Study ${subject.name} in the Netherlands from ${country.name}`),
  };
}

// ---- JOBS PAGE --------------------------------------------------------------
export function buildJobsPage(role: SeoRole, country: SeoCountry, hub: SeoHub, origin: OriginBlock): SeoPage {
  const path = jobsPath(role.slug, country.slug, hub.slug);
  const seed = hash(path);
  const clientFacing = role.collar === "pink" || role.collar === "white";

  const introVariants = [
    `Moving from ${country.name} to work as a ${role.name} in ${hub.name}, the Netherlands? ${hub.profile} How much Dutch you need depends a lot on the role — and it's easy to underestimate.`,
    `${role.name}s from ${country.name} looking at ${hub.name} face two questions: is there demand, and how good does my Dutch need to be? ${hub.profile}`,
    `Working in the Netherlands as a ${role.name} — coming from ${country.name} — often starts with the language. ${hub.name}: ${hub.profile}`,
  ];

  return {
    h1: `Work in the Netherlands as a ${role.name} from ${country.name}`,
    subtitle: `${hub.name} · ${hub.region}`,
    metaTitle: `Work in the Netherlands as a ${role.name} from ${country.name} (${hub.name}) — Dutch you'll need | AlmiDutch`,
    metaDescription: `The Dutch-language side of working as a ${role.name} in ${hub.name}, the Netherlands, coming from ${country.name} — how much you'll need, which NT2 level, home-qualification recognition via ${origin.recognitionBody}, and honest readiness practice. Confirm specifics with employers and regulators.`,
    canonicalPath: path,
    indexable: true,
    intro: [pick(introVariants, seed)],
    sections: [
      {
        heading: `How much Dutch does a ${role.name} need?`,
        body: [
          clientFacing
            ? `As a ${role.name}, you'll likely deal with colleagues, clients or patients directly, so employers often expect conversational-to-professional Dutch — think B1–B2 and up. Even in international teams, Dutch widens your options in ${hub.name}.`
            : `A ${role.name} in a technical or international team in ${hub.name} may work largely in English — common in Dutch tech, engineering and startups. But Dutch still helps with admin, teammates and everyday life — and it's important if you plan to stay long-term.`,
          `Some professions are regulated and need formal recognition plus a set Dutch level — confirm the exact requirement with the employer and the relevant Dutch regulator. ${origin.localized ? `If you trained in ${country.name}, your qualification's home recognition runs through ${origin.recognitionBody}${origin.recognitionUrl ? ` (${origin.recognitionUrl})` : ""}; ${origin.equivalenceNote}` : origin.equivalenceNote} A common concern coming from ${country.name}: "${cleanConcern(origin.commonConcern)}".`,
        ],
      },
      {
        heading: "Residency, and later citizenship",
        body: [`If working in ${hub.name} is a step toward settling in the Netherlands, the language matters beyond the job. ${CITIZENSHIP_HEDGE} ${origin.citizenshipNote}`],
      },
      {
        heading: "Practise the Dutch you'll actually use — honestly",
        body: [
          `Practise NT2 Reading, Listening, Writing and Speaking at the level you need. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
    ],
    faq: [
      { q: `Do I need Dutch to work as a ${role.name} in the Netherlands?`, a: `It depends on the role. Client-facing and regulated jobs usually expect B1–B2 or more; some technical roles in ${hub.name} run in English. You'll still need Dutch for daily life and long-term stay. Confirm with the employer.` },
      { q: `Which Dutch level should I practise?`, a: `Inburgering (A2) is a common integration baseline; many jobs want B1–B2 (NT2 Programma I/II). AlmiDutch shows an honest readiness band, never an official result.` },
    ],
    related: [
      { href: `/exams/${INB_A2.slug}`, label: `Inburgering (A2) — integration & residency` },
      { href: `/exams/${PROG_I.slug}`, label: `${PROG_I.name} (B1) exam guide` },
      ...HUBS.filter((h) => h.slug !== hub.slug).map((h) => ({ href: jobsPath(role.slug, country.slug, h.slug), label: `${role.name} in ${h.name}` })),
    ],
    breadcrumbs: [
      { name: "Work in the Netherlands", path: "/work-in-netherlands" },
      { name: role.name, path: `/work-in-netherlands/${role.slug}` },
      { name: `${country.name} · ${hub.name}`, path: path },
    ],
    jsonLd: faqJsonLd([
      { q: `Do I need Dutch to work as a ${role.name} in the Netherlands?`, a: `It depends on the role; client-facing and regulated jobs usually expect B1–B2. Confirm with the employer.` },
    ], `${SITE}${path}`, `Work in the Netherlands as a ${role.name} from ${country.name}`),
  };
}

// ---- EXAM LEVEL PAGE --------------------------------------------------------
export function buildLevelPage(exam: ExamMeta): SeoPage {
  const path = `/exams/${exam.slug}`;
  const isInburgering = exam.track === "INBURGERING";
  const nt2Line = ` It is part of the NT2 Staatsexamen, produced by the CvTE and administered by DUO (delivered by Cito and Bureau ICE), and taken in Dutch.`;
  const inbLine = ` It is the civic-integration (inburgering) exam, administered by DUO, covering the four language skills plus KNM (Knowledge of Dutch Society) and ONA (labour-market orientation).`;
  return {
    h1: isInburgering ? `${exam.name} — the Dutch civic-integration exam` : `${exam.name} (${exam.cefr}) — Dutch NT2 exam`,
    subtitle: exam.blurb,
    metaTitle: isInburgering
      ? `${exam.name}: the Dutch inburgering exam — format, KNM, ONA & practice | AlmiDutch`
      : `${exam.name} (${exam.cefr}) — NT2 Staatsexamen format & honest practice | AlmiDutch`,
    metaDescription: `${examLabel(exam)}: what it tests, how it's structured, and honest readiness practice. ${isInburgering ? "Commonly relevant to residency and naturalisatie — confirm the current rule with DUO / IND." : "Practice estimate, not an official CvTE/DUO result."}`,
    canonicalPath: path,
    indexable: true,
    intro: [
      `${exam.name} sits at CEFR ${exam.cefr}.${isInburgering ? inbLine : nt2Line} It assesses ${isInburgering ? "Reading, Listening, Writing and Speaking, plus KNM and ONA" : "four skills — Reading (Lezen), Listening (Luisteren), Writing (Schrijven) and Speaking (Spreken); the Diploma NT2 requires passing all four parts"}.`,
    ],
    sections: [
      isInburgering
        ? { heading: "Inburgering, residency and citizenship", body: [CITIZENSHIP_HEDGE] }
        : { heading: `Who ${exam.name} is for`, body: [`${exam.blurb} It suits learners who can already handle Dutch at roughly ${exam.cefr} and want an honest read on whether they're ready for all four parts.`] },
      {
        heading: "Honest readiness, not a fake score",
        body: [
          `Reading and Listening${isInburgering ? " and KNM" : ""} are auto-marked to a clear per-skill band — Clear or Borderline — against the real criteria. Writing and Speaking get AI feedback labelled an estimate. ${READINESS_LINE}`,
          CTA_LINE,
        ],
      },
      {
        heading: "Prepare by where you're coming from",
        body: [`Studying or working in the Netherlands? See the language pathway for your situation — from any country, for study or work.`],
      },
    ],
    faq: [
      { q: `What level is ${exam.name}?`, a: `${exam.name} maps to CEFR ${exam.cefr}.` },
      isInburgering
        ? { q: `Is the inburgering exam what I need for Dutch citizenship?`, a: `Passing inburgering (or NT2) is commonly used as the language proof for naturalisatie — often A2, or B1 for obligations from 1 January 2022. Rules change; confirm the current requirement with DUO / IND.` }
        : { q: `Is my AlmiDutch result official?`, a: `No — it's an honest practice estimate. Only the official NT2 Staatsexamen (CvTE / DUO) issues real results.` },
    ],
    related: [
      ...ALL_EXAMS.filter((e) => e.slug !== exam.slug).map((e) => ({ href: `/exams/${e.slug}`, label: examLabel(e) })),
    ],
    breadcrumbs: [
      { name: "Dutch exams", path: "/exams" },
      { name: examLabel(exam), path: path },
    ],
    jsonLd: faqJsonLd(
      [{ q: `What level is ${exam.name}?`, a: `${exam.name} maps to CEFR ${exam.cefr}.` }],
      `${SITE}${path}`,
      `${examLabel(exam)} — Dutch exam`,
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
