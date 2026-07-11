import type { Metadata } from "next";
import Link from "next/link";
import { NT2_EXAMS, INBURGERING_EXAMS } from "@/lib/nl/registry";
import { TestimonialsSection } from "@/components/reviews/TestimonialsSection";

// Re-render hourly so newly approved testimonials appear without a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "Dutch NT2 & Inburgering Practice — honest readiness | AlmiDutch",
  },
  description:
    "Practise Dutch for the NT2 Staatsexamen (Programma I B1 · Programma II B2) and the Inburgering exam (language, KNM, ONA) with honest per-skill readiness estimates, never a fake official score. Original material, never copied. $12/month, 7-day free trial.",
  openGraph: {
    title: "AlmiDutch — honest NT2 & Inburgering practice",
    description:
      "Original practice for the NT2 Staatsexamen and the Inburgering exam, with a readiness estimate shown honestly — not an inflated score.",
  },
};

const PROMISES = [
  {
    title: "Both Dutch tracks",
    detail:
      "The NT2 Staatsexamen — Programma I (B1) and Programma II (B2) — and the Inburgering exam, including KNM (Knowledge of Dutch Society) and ONA (labour-market orientation).",
  },
  {
    title: "Honest readiness, not a fake score",
    detail:
      "Objective Reading, Listening and KNM are auto-marked to a clear readiness band. Writing and Speaking get AI feedback labelled an estimate. We never invent an official CvTE or DUO result.",
  },
  {
    title: "100% original material",
    detail:
      "Every reading text, audio transcript, writing task and speaking prompt is written from scratch to mirror the real task types — never copied from a real exam.",
  },
  {
    title: "Feedback you can act on",
    detail:
      "AI feedback on productive tasks points to what to fix next — against each exam's real criteria, level-aware, constructive and never inflated.",
  },
] as const;

const PRICING_LINES = [
  "Free, auto-marked Reading, Listening and KNM practice",
  "AI feedback on Writing & Speaking against the real criteria",
  "Full timed mock for NT2 Programma I/II and Inburgering",
  "KNM and ONA practice, clearly labelled — never an official result",
  "100% original practice material — never copied from a real exam",
  "$12/month with a 7-day free trial, cancel anytime",
] as const;

const FAQ = [
  {
    q: "Which Dutch exams does AlmiDutch cover?",
    a: "Both official tracks. NT2 Staatsexamen: Programma I (B1, for work or vocational training) and Programma II (B2, for higher education or professional work) — each tests Reading, Listening, Writing and Speaking, and the Diploma NT2 requires passing all four parts. Inburgering: the four language skills plus KNM (Knowledge of Dutch Society) and ONA (labour-market orientation). You pick your exam in your account, and your practice and full mock run for it.",
  },
  {
    q: "Is the inburgering exam what I need for Dutch citizenship?",
    a: "Passing inburgering (or NT2) is commonly used as the Dutch-language proof for naturalisatie and a stronger residence permit — often at A2, or B1 for people whose integration obligation started on or after 1 January 2022 (Wet inburgering 2021). Rules change, so always confirm the current requirement with the relevant Dutch authority (DUO / IND) before you rely on it.",
  },
  {
    q: "Is my AlmiDutch estimate my real NT2 or Inburgering result?",
    a: "No. It's a practice readiness estimate to guide your prep — a per-skill band (Clear or Borderline) against the real criteria. KNM and ONA practice is clearly labelled practice. Only the official exams (NT2 Staatsexamen from CvTE, administered by DUO; and DUO for inburgering) issue real results.",
  },
  {
    q: "What are KNM and ONA?",
    a: "They're the two non-language components of the Inburgering exam. KNM (Kennis van de Nederlandse Maatschappij) is knowledge of how Dutch society works; ONA (Oriëntatie op de Nederlandse Arbeidsmarkt) is orientation on the Dutch labour market. AlmiDutch gives honest practice for both — labelled practice, not the official exam result.",
  },
  {
    q: "Is the practice copied from a real exam?",
    a: "No. Every text, audio transcript, writing task and speaking prompt is original, written from scratch to mirror the real task types. We never copy or reproduce official CvTE or DUO material.",
  },
  {
    q: "How much does AlmiDutch cost?",
    a: "$12 per month with a 7-day free trial, monthly only, cancel anytime. Reading, Listening and KNM practice is free; AI feedback on Writing and Speaking and the full timed mock are part of the subscription.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// Illustrative sample — clearly labelled, never a real user, never a real result.
const SAMPLE = [
  { skill: "Lezen", band: "Clear", pct: 82 },
  { skill: "Luisteren", band: "Borderline", pct: 64 },
  { skill: "Schrijven", band: "Estimate", pct: 71 },
  { skill: "Spreken", band: "Estimate", pct: 58 },
];

function ReadinessMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-3xl border border-almi-bg-peach bg-almi-paper p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-almi-text-muted">Sample readiness · NT2 Programma I (B1)</p>
          <span className="rounded-full bg-almi-bg-peach px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-almi-ink">Sample</span>
        </div>
        <ul className="mt-4 space-y-3">
          {SAMPLE.map((s) => (
            <li key={s.skill}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-almi-ink">{s.skill}</span>
                <span className="font-semibold text-almi-coral-deep">{s.band}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-almi-bg-peach">
                <div className="h-2 rounded-full bg-almi-coral" style={{ width: `${s.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-almi-bg-peach bg-almi-bg px-4 py-3">
          <p className="text-xs text-almi-text-muted">
            A readiness band per skill against the real criteria — never an invented official result.
          </p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-almi-text-muted">Illustrative example — not a real result.</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-almi-bg text-almi-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-almi-bg via-almi-bg to-almi-bg-peach px-6 pt-16 pb-20 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 z-0 h-96 w-96 rounded-full bg-almi-accent/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 z-0 h-80 w-80 rounded-full bg-almi-coral/10 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-almi-accent-deep">AlmiDutch · NT2 &amp; Inburgering practice</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] text-almi-ink sm:text-5xl">
              Practise Dutch with <span className="text-almi-coral">honest readiness.</span>
            </h1>
            <p className="mt-5 text-lg text-almi-text">
              Original practice for both Dutch tracks — the NT2 Staatsexamen (Programma I B1 · Programma II B2)
              and the Inburgering exam (language, KNM, ONA) — with an honest readiness estimate against each
              exam's real criteria, so you know exactly what to work on next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-almi-coral/30"
              >
                Start your 7-day free trial
              </Link>
              <Link href="/login" className="text-sm font-medium text-almi-coral hover:underline">
                Already have an account? Log in →
              </Link>
            </div>
            <p className="mt-4 text-sm text-almi-text-muted">
              $12/month, 7-day free trial, cancel anytime · Reading, Listening &amp; KNM free · Original material, never copied
            </p>
          </div>
          <ReadinessMockup />
        </div>
      </section>

      {/* Honest hook */}
      <section className="border-t border-almi-bg-peach bg-almi-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold text-almi-ink">An honest estimate, not a fake score</h2>
          <p className="mt-5 text-base text-almi-text">
            The real exams are set by the CvTE and administered by DUO — so anyone promising you a precise
            official result from practice is guessing. AlmiDutch does the honest thing instead: we estimate
            your readiness from your practice and show it plainly — a per-skill band (Clear or Borderline)
            against each exam's real criteria.
          </p>
          <p className="mt-4 text-base text-almi-text">
            One principle runs through it: <strong className="text-almi-ink">tell you the truth.</strong> Honest,
            level-aware feedback, 100% original material, and a clear read on what to work on next — then
            confirm the exam you need with the relevant authority (DUO / IND).
          </p>
        </div>
      </section>

      {/* Inburgering / citizenship lead */}
      <section className="border-t border-almi-bg-peach bg-almi-bg-peach/40 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-almi-coral/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-almi-coral-deep">
            Integration &amp; residency route
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-almi-ink">Inburgering, residency and naturalisatie — start here.</h2>
          <p className="mt-4 text-base text-almi-text">
            Passing inburgering (or NT2) is commonly used as the Dutch-language proof for a stronger residence
            permit and, later, naturalisatie — often at A2, or B1 for obligations from 1 January 2022. Practise
            the four skills plus KNM and ONA, and get an honest read on whether you're ready — then confirm the
            current requirement with DUO / IND.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep"
            >
              Practise inburgering — free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Two tracks */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold text-almi-ink">Two Dutch tracks</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-almi-text-muted">
            Reading, Listening and KNM are auto-marked and free to practise. Writing and Speaking are graded
            with honest AI feedback against each exam's real criteria.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* NT2 */}
            <div className="rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-almi-coral">NT2 Staatsexamen</p>
              <h3 className="mt-2 text-xl font-semibold text-almi-ink">Two programmes, four skills</h3>
              <ul className="mt-4 space-y-2 text-sm text-almi-text">
                {NT2_EXAMS.map((e) => (
                  <li key={e.exam} className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-almi-bg-peach px-1.5 text-xs font-bold text-almi-ink">
                      {e.cefr}
                    </span>
                    <span className="font-semibold text-almi-ink">{e.name}</span>
                    <span className="text-almi-text-muted">— {e.blurb}</span>
                  </li>
                ))}
                <li className="text-almi-text-muted">Diploma NT2 requires passing all four parts.</li>
              </ul>
            </div>

            {/* Inburgering */}
            <div className="rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-almi-teal">Inburgering</p>
              <h3 className="mt-2 text-xl font-semibold text-almi-ink">Language + KNM + ONA</h3>
              <ul className="mt-4 space-y-2 text-sm text-almi-text">
                {INBURGERING_EXAMS.map((e) => (
                  <li key={e.exam} className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-almi-bg-peach px-1.5 text-xs font-bold text-almi-ink">
                      {e.cefr}
                    </span>
                    <span className="font-semibold text-almi-ink">{e.name}</span>
                    <span className="rounded-full bg-almi-coral/15 px-2 py-0.5 text-[11px] font-semibold text-almi-coral-deep">Residency</span>
                  </li>
                ))}
                <li>• <strong className="text-almi-ink">KNM</strong> — Knowledge of Dutch Society.</li>
                <li>• <strong className="text-almi-ink">ONA</strong> — orientation on the Dutch labour market.</li>
                <li className="text-almi-text-muted">Level A2 or B1 by your integration-obligation date.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why honest */}
      <section className="border-t border-almi-bg-peach px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-semibold text-almi-ink">Honest readiness, exam by exam</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p.title} className="flex items-start gap-3 rounded-2xl border border-almi-bg-peach bg-almi-paper p-5">
                <span aria-hidden className="mt-0.5 flex-shrink-0 select-none font-bold text-almi-teal">✓</span>
                <p className="text-sm text-almi-text">
                  <span className="font-semibold text-almi-ink">{p.title}</span>
                  {" — "}
                  {p.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-almi-bg-peach bg-almi-paper px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-almi-ink">Simple, honest pricing</h2>
          <p className="mt-3 text-xl font-semibold text-almi-ink">$12/month — 7-day free trial, cancel anytime.</p>
          <ul className="mx-auto mt-6 max-w-xl space-y-2 text-left text-sm text-almi-text">
            {PRICING_LINES.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 flex-shrink-0 select-none font-bold text-almi-teal">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-xl text-sm text-almi-text-muted">
            25% of AlmiDutch proceeds fund the Shamool Foundation's social mission.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep">
              Start your 7-day free trial
            </Link>
          </div>
          <p className="mt-4 text-sm text-almi-text-muted">
            <Link href="/pricing" className="underline hover:text-almi-ink">See full pricing</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold text-almi-ink">Common questions</h2>
          <dl className="mt-10 space-y-6">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-almi-bg-peach bg-almi-bg p-6">
                <dt className="text-lg font-semibold text-almi-ink">{f.q}</dt>
                <dd className="mt-2 text-sm text-almi-text">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <TestimonialsSection />

      {/* Final CTA */}
      <section className="border-t border-almi-bg-peach bg-almi-paper px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-almi-ink">Practise honestly. Walk in ready.</h2>
          <p className="mt-3 text-base text-almi-text">
            Both Dutch tracks at your level, honest readiness estimates, 100% original material — for
            $12/month with a 7-day free trial.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep">
              Start your 7-day free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
