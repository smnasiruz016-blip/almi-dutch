import type { Metadata } from "next";
import Link from "next/link";

// Honest requirements explainer: which inburgering language level applies (A2
// vs B1) by integration-obligation date, and how to PREPARE for it. Framed as
// honest preparation — never as beating or getting around DUO/IND. ISR.
export const revalidate = 2592000;

const SITE = "https://almidutch.almiworld.com";
const PATH = "/requirements/netherlands/b1-inburgering-timeline";

export const metadata: Metadata = {
  title: { absolute: "A2 or B1 for inburgering? The Dutch language requirement by obligation date | AlmiDutch" },
  description:
    "Which Dutch language level do you need for inburgering — A2 or B1? It depends on when your integration obligation started. An honest explainer, and how to practise the four skills + KNM + ONA. Confirm the current rule with DUO / IND.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "A2 or B1 for inburgering — the Dutch requirement by obligation date",
    description:
      "Honest guide to the A2-vs-B1 inburgering language routes by obligation date, and how to prepare. Confirm the current rule with DUO / IND.",
  },
};

const FAQ = [
  {
    q: "Do I need A2 or B1 Dutch for inburgering?",
    a: "It depends on when your integration obligation (inburgeringsplicht) started. Under the Wet inburgering 2021, people whose obligation started on or after 1 January 2022 generally follow the B1 route (the B1-route, with some individual learning routes); people whose obligation started earlier generally fall under the older system where A2 was the common language level. Your personal situation and any exemptions are decided by DUO — confirm your own requirement with them.",
  },
  {
    q: "What changed on 1 January 2022?",
    a: "The Wet inburgering 2021 came into force, raising the general language ambition from A2 toward B1 for new integrators and adding personalised routes. The date that matters is when your obligation started, not today's date — so two people integrating in the same year can have different requirements.",
  },
  {
    q: "Is passing inburgering enough for a residence permit or naturalisatie?",
    a: "Passing inburgering (or NT2) is commonly used as the Dutch-language proof toward a stronger residence permit and, later, naturalisatie — but the full residency and citizenship conditions are set by the IND and change over time. We don't state fixed years or a fixed level; always confirm the current requirement with DUO / IND.",
  },
  {
    q: "How does AlmiDutch help?",
    a: "AlmiDutch is honest practice, not the official exam. You practise the four language skills (Reading, Listening, Writing, Speaking) plus KNM and ONA at A2 or B1, and get a per-skill readiness band (Clear or Borderline) against the real task criteria — an estimate to guide your prep, never an official CvTE/DUO result.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Row({ when, level, note }: { when: string; level: string; note: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-2xl border border-almi-bg-peach bg-almi-paper p-5 sm:grid-cols-[8rem_5rem_1fr]">
      <div className="text-sm font-semibold text-almi-ink">{when}</div>
      <div className="text-sm font-bold text-almi-coral-deep">{level}</div>
      <div className="text-sm text-almi-text sm:col-span-1 col-span-2">{note}</div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="bg-almi-bg text-almi-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-almi-text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-almi-coral">Home</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden>/</span><Link href="/exams" className="hover:text-almi-coral">Dutch exams</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden>/</span><span>Inburgering: A2 or B1?</span></li>
          </ol>
        </nav>

        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-almi-accent-deep">Requirements · Netherlands</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-almi-ink sm:text-4xl">
            A2 or B1 for inburgering? It depends on your obligation date.
          </h1>
          <p className="mt-3 text-base text-almi-text">
            The Dutch language level you need for inburgering isn&apos;t the same for everyone — it&apos;s tied to
            when your integration obligation (<em>inburgeringsplicht</em>) started, not to today&apos;s date. Here&apos;s
            an honest read on which route applies, and how to prepare for it.
          </p>
        </header>

        <section className="mt-8 space-y-3">
          <Row when="From 1 Jan 2022" level="B1" note="Obligations starting on/after this date generally follow the B1 route under the Wet inburgering 2021 (with individual learning routes for some). " />
          <Row when="Before 1 Jan 2022" level="A2" note="Obligations that started earlier generally fall under the previous system, where A2 was the common language level." />
          <p className="text-xs text-almi-text-muted">
            Individual situations, exemptions and learning routes are decided by DUO. This is general information, not
            advice about your case.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-almi-ink">Why the date, not the year, matters</h2>
          <p className="mt-3 text-base text-almi-text">
            The <strong>Wet inburgering 2021</strong> came into force on 1 January 2022 and raised the general language
            ambition from A2 toward B1, while adding more personalised routes. Because the trigger is when your
            obligation began, two people integrating around the same time can genuinely have different requirements.
            That&apos;s exactly why it&apos;s worth checking your own status rather than assuming.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-almi-ink">How to prepare — honestly</h2>
          <p className="mt-3 text-base text-almi-text">
            Whichever route applies, the preparation is the same shape: get comfortable with the four language skills —
            Reading, Listening, Writing and Speaking — plus <strong>KNM</strong> (Knowledge of Dutch Society) and{" "}
            <strong>ONA</strong> (orientation on the Dutch labour market). AlmiDutch lets you practise all of them at A2
            or B1 and shows an honest per-skill readiness band (Clear or Borderline) against the real task criteria — an
            estimate to guide your prep, never an official CvTE or DUO result.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-almi-bg-peach bg-almi-paper p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-almi-ink">Practise the four skills + KNM + ONA at your level.</p>
          <Link
            href="/signup"
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-almi-coral px-7 py-3 text-base font-semibold text-almi-ink hover:bg-almi-coral-deep"
          >
            Start your 7-day free trial
          </Link>
          <p className="mt-3 text-xs text-almi-text-muted">$12/month after the trial · cancel anytime</p>
        </section>

        <section className="mt-10 rounded-2xl border border-almi-accent/40 bg-almi-accent/10 p-5">
          <p className="text-sm text-almi-ink">
            <strong>Always confirm your own requirement with DUO / IND.</strong> Integration and residency rules change,
            and only the official authorities can tell you which level and conditions apply to your situation. AlmiDutch
            helps you prepare — it doesn&apos;t decide or replace the official process.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-almi-ink">Questions</h2>
          <dl className="mt-4 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-almi-bg-peach bg-almi-paper p-5">
                <dt className="font-semibold text-almi-ink">{f.q}</dt>
                <dd className="mt-1 text-sm text-almi-text">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-almi-ink">Related</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            <li><Link href="/exams/inburgering-a2" className="inline-block rounded-full border border-almi-bg-peach bg-almi-paper px-3 py-1.5 text-sm text-almi-ink hover:border-almi-coral">Inburgering (A2) guide</Link></li>
            <li><Link href="/exams/inburgering-b1" className="inline-block rounded-full border border-almi-bg-peach bg-almi-paper px-3 py-1.5 text-sm text-almi-ink hover:border-almi-coral">Inburgering (B1) guide</Link></li>
            <li><Link href="/exams" className="inline-block rounded-full border border-almi-bg-peach bg-almi-paper px-3 py-1.5 text-sm text-almi-ink hover:border-almi-coral">All Dutch exams</Link></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
