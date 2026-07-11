import type { Metadata } from "next";
import Link from "next/link";
import { CAPLE_EXAMS, CELPE_BRAS } from "@/lib/pt/registry";
import { TestimonialsSection } from "@/components/reviews/TestimonialsSection";

// Re-render hourly so newly approved testimonials appear without a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "European & Brazilian Portuguese Practice — CAPLE & Celpe-Bras | AlmiDutch",
  },
  description:
    "Practise European Portuguese (CAPLE — ACESSO A1 to DUPLE C2, including CIPLE for citizenship) and Brazilian Portuguese (Celpe-Bras) with honest per-skill readiness estimates, never a fake official score. Original material, never copied. $12/month, 7-day free trial.",
  openGraph: {
    title: "AlmiDutch — honest CAPLE & Celpe-Bras practice",
    description:
      "Original practice for both official Portuguese tracks, with a readiness estimate shown honestly — not an inflated score.",
  },
};

const PROMISES = [
  {
    title: "Both official tracks",
    detail:
      "European Portuguese — the full CAPLE suite (ACESSO A1 to DUPLE C2) — and Brazilian Portuguese — Celpe-Bras. Kept separate: PT-PT for CAPLE, PT-BR for Celpe-Bras.",
  },
  {
    title: "Honest readiness, not a fake score",
    detail:
      "Objective Reading and Listening are auto-marked to a clear readiness band. Writing and Speaking get AI feedback labelled an estimate. We never invent an official CAPLE classification or Inep tier.",
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
  "Free, auto-marked Reading and Listening across all CAPLE levels",
  "AI feedback on Writing & Speaking (CAPLE) and Escrita & Oral (Celpe-Bras)",
  "Full timed mock for every exam, in exam order",
  "Both variants — European (PT-PT) and Brazilian (PT-BR)",
  "100% original practice material — never copied from a real exam",
  "$12/month with a 7-day free trial, cancel anytime",
] as const;

const FAQ = [
  {
    q: "Which Portuguese exams does AlmiDutch cover?",
    a: "Both official tracks. European Portuguese: the CAPLE suite — ACESSO (A1), CIPLE (A2), DEPLE (B1), DIPLE (B2), DAPLE (C1) and DUPLE (C2). Brazilian Portuguese: Celpe-Bras, the single integrated exam. You pick your exam in your account, and your practice and full mock run for it.",
  },
  {
    q: "Is CIPLE the exam for Portuguese citizenship?",
    a: "CIPLE is the A2-level CAPLE exam commonly accepted as the Portuguese-language requirement for citizenship and residency. Requirements change, so always confirm the current one with the relevant Portuguese authority before you rely on it.",
  },
  {
    q: "Is my AlmiDutch estimate my real CAPLE or Celpe-Bras result?",
    a: "No. It's a practice readiness estimate to guide your prep — for CAPLE, a per-skill band against the real criteria; for Celpe-Bras, a holistic tier estimate from Intermediário to Avançado Superior. Only CAPLE (Camões / University of Lisbon) and Inep issue official results.",
  },
  {
    q: "European or Brazilian Portuguese?",
    a: "Both, and kept separate. CAPLE content is European Portuguese (PT-PT); Celpe-Bras content is Brazilian Portuguese (PT-BR). Choose your variant when you choose your test.",
  },
  {
    q: "Is the practice copied from a real exam?",
    a: "No. Every text, audio transcript, writing task and speaking prompt is original, written from scratch to mirror the real task types. We never copy or reproduce CAPLE or Inep material.",
  },
  {
    q: "How much does AlmiDutch cost?",
    a: "$12 per month with a 7-day free trial, monthly only, cancel anytime. Reading and Listening practice is free; AI feedback on Writing and Speaking and the full timed mock are part of the subscription.",
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
  { skill: "Compreensão da leitura", band: "Clear", pct: 82 },
  { skill: "Compreensão do oral", band: "Borderline", pct: 64 },
  { skill: "Produção escrita", band: "Estimate", pct: 71 },
  { skill: "Produção oral", band: "Estimate", pct: 58 },
];

function ReadinessMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-3xl border border-almi-bg-peach bg-almi-paper p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-almi-text-muted">Sample readiness · CIPLE (A2)</p>
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
            A readiness band per skill against the real criteria — never an invented official classification.
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
            <p className="text-sm font-bold uppercase tracking-widest text-almi-accent-deep">AlmiDutch · CAPLE &amp; Celpe-Bras practice</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] text-almi-ink sm:text-5xl">
              Practise Portuguese with <span className="text-almi-coral">honest readiness.</span>
            </h1>
            <p className="mt-5 text-lg text-almi-text">
              Original practice for both official tracks — European Portuguese (CAPLE, A1–C2) and
              Brazilian Portuguese (Celpe-Bras) — with an honest readiness estimate against each
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
              $12/month, 7-day free trial, cancel anytime · Reading &amp; Listening free · Original material, never copied
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
            The real exams are calibrated by CAPLE (Camões / University of Lisbon) and, for Brazil, by
            Inep — so anyone promising you a precise official result from practice is guessing.
            AlmiDutch does the honest thing instead: we estimate your readiness from your practice
            and show it plainly — a per-skill band for CAPLE, a holistic tier for Celpe-Bras.
          </p>
          <p className="mt-4 text-base text-almi-text">
            One principle runs through it: <strong className="text-almi-ink">tell you the truth.</strong> Honest,
            level-aware feedback, 100% original material, and a clear read on what to work on next — then
            confirm the exam you need with the relevant authority.
          </p>
        </div>
      </section>

      {/* CIPLE citizenship lead */}
      <section className="border-t border-almi-bg-peach bg-almi-bg-peach/40 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-almi-coral/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-almi-coral-deep">
            Citizenship route
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-almi-ink">Preparing for Portuguese citizenship? Start with CIPLE (A2).</h2>
          <p className="mt-4 text-base text-almi-text">
            CIPLE is the A2-level CAPLE exam commonly accepted as the Portuguese-language requirement for
            citizenship and residency. Practise all four skills in European Portuguese and get an honest
            read on whether you're ready — then confirm the current requirement with the relevant
            Portuguese authority.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep"
            >
              Practise CIPLE — free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Two tracks */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold text-almi-ink">Two variants, two official tracks</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-almi-text-muted">
            Reading and Listening are auto-marked and free to practise. Writing and Speaking are graded
            with honest AI feedback against each exam's real criteria.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* European CAPLE */}
            <div className="rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-almi-coral">European (Portugal) — CAPLE</p>
              <h3 className="mt-2 text-xl font-semibold text-almi-ink">Six levels, four skills</h3>
              <ul className="mt-4 space-y-2 text-sm text-almi-text">
                {CAPLE_EXAMS.map((e) => (
                  <li key={e.exam} className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-almi-bg-peach px-1.5 text-xs font-bold text-almi-ink">
                      {e.cefr}
                    </span>
                    <span className="font-semibold text-almi-ink">{e.name}</span>
                    {e.lead && (
                      <span className="rounded-full bg-almi-coral/15 px-2 py-0.5 text-[11px] font-semibold text-almi-coral-deep">Citizenship</span>
                    )}
                    <span className="text-almi-text-muted">— {e.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brazilian Celpe-Bras */}
            <div className="rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-almi-teal">Brazilian — Celpe-Bras</p>
              <h3 className="mt-2 text-xl font-semibold text-almi-ink">One integrated exam</h3>
              <p className="mt-2 text-sm text-almi-text">{CELPE_BRAS.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm text-almi-text">
                <li>• <strong className="text-almi-ink">Parte Escrita</strong> — comprehension → written production from Brazilian video, audio and press.</li>
                <li>• <strong className="text-almi-ink">Parte Oral</strong> — personal interests and contemporary-Brazil topics from "elementos provocadores".</li>
                <li>• Tiers: Intermediário → Intermediário Superior → Avançado → Avançado Superior.</li>
                <li className="text-almi-text-muted">Below Intermediário → no certificate. PT-BR throughout.</li>
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
            Both official Portuguese tracks at your level, honest readiness estimates, 100% original
            material — for $12/month with a 7-day free trial.
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
