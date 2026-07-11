import type { Metadata } from "next";
import Link from "next/link";
import { NT2_EXAMS, INBURGERING_EXAMS, type ExamMeta } from "@/lib/nl/registry";

export const metadata: Metadata = {
  title: { absolute: "Dutch exams — Staatsexamen NT2 & Inburgering guides & practice | AlmiDutch" },
  description:
    "The Dutch language exams for work, study and integration — Staatsexamen NT2 (Programma I=B1, II=B2) and Inburgering (A2 / B1, with KNM and ONA). Honest per-skill readiness practice for all four skills.",
  alternates: { canonical: "/exams" },
};

function ExamList({ exams }: { exams: ExamMeta[] }) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      {exams.map((e) => (
        <li key={e.slug}>
          <Link
            href={`/exams/${e.slug}`}
            className="flex h-full flex-col rounded-2xl border border-almi-bg-peach bg-almi-paper p-5 hover:border-almi-coral"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-almi-bg-peach px-1.5 text-xs font-bold text-almi-ink">{e.cefr}</span>
              <span className="text-lg font-semibold text-almi-ink">{e.name}</span>
              {e.lead && <span className="rounded-full bg-almi-coral/15 px-2 py-0.5 text-xs font-semibold text-almi-coral-deep">Inburgering</span>}
            </div>
            <span className="mt-2 text-sm text-almi-text-muted">{e.blurb}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function DutchExamsHub() {
  return (
    <main className="bg-almi-bg text-almi-text">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-almi-ink sm:text-4xl">Dutch exams — NT2 &amp; Inburgering</h1>
        <p className="mt-3 max-w-2xl text-base text-almi-text">
          The two routes to Dutch for work, study and integration: the Staatsexamen NT2 (set and marked by
          the CvTE, run through DUO) and the Inburgering exam (DUO). Each tests Reading, Listening, Writing
          and Speaking; Inburgering adds KNM and ONA. Pick a level for an honest readiness estimate — never a
          fabricated official result.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-almi-ink">Staatsexamen NT2</h2>
          <p className="mt-1 text-sm text-almi-text-muted">
            Programma I (B1) for work or vocational training; Programma II (B2) for higher education or
            professional work. The Diploma NT2 is awarded when all four parts are passed.
          </p>
          <ExamList exams={NT2_EXAMS} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-almi-ink">Inburgeren</h2>
          <p className="mt-1 text-sm text-almi-text-muted">
            Civic integration at A2 or B1 (set by when your obligation started), with Knowledge of Dutch
            Society (KNM) and Labour-market orientation (ONA). Commonly used as language proof for
            naturalisatie — confirm the current rule with DUO / IND.
          </p>
          <ExamList exams={INBURGERING_EXAMS} />
        </section>
      </div>
    </main>
  );
}
