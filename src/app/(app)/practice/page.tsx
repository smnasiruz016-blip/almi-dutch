// Practice hub — "Choose a Test". Two tracks: NT2 Staatsexamen (Programma I=B1,
// II=B2) and Inburgering (A2 / B1, language + KNM + ONA). Each card routes to
// /practice/<slug>. Reading + Listening (+ KNM) are free to taste; Writing,
// Speaking, ONA and the timed mock are Pro. Every readout is a practice
// estimate — never an official CvTE/DUO result.

import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { NT2_EXAMS, INBURGERING_EXAMS, type ExamMeta } from "@/lib/nl/registry";

function ExamCard({ exam }: { exam: ExamMeta }) {
  return (
    <Link
      href={`/practice/${exam.slug}`}
      className="flex flex-col rounded-2xl border border-almi-bg-peach bg-almi-paper p-5 shadow-sm transition hover:border-almi-coral"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-almi-ink">{exam.name}</h3>
        <span className="rounded-full bg-almi-teal/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-almi-teal">
          {exam.cefr}
        </span>
      </div>
      {exam.lead && (
        <span className="mt-2 inline-flex w-fit rounded-full bg-almi-coral/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-almi-coral-deep">
          Inburgering
        </span>
      )}
      <p className="mt-2 text-sm text-almi-text">{exam.blurb}</p>
      <p className="mt-3 text-sm font-semibold text-almi-coral">Practise →</p>
    </Link>
  );
}

export default async function PracticePage() {
  await requireUser();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-almi-accent-deep">
          AlmiDutch · practice
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-almi-ink">Choose a test</h1>
        <p className="mt-2 max-w-2xl text-sm text-almi-text">
          Reading and Listening are auto-marked and free to practise. Writing, Speaking and the
          Inburgering reflection tasks are graded with honest AI-style feedback against the level&apos;s
          criteria. Every readout is a practice estimate — never an official CvTE or DUO result.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-almi-ink">Staatsexamen NT2</h2>
        <p className="mt-1 text-sm text-almi-text-muted">
          Two programmes: Programma I (B1) for work or vocational training, Programma II (B2) for
          higher education or professional work. The Diploma NT2 requires passing all four parts.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NT2_EXAMS.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-almi-ink">Inburgeren</h2>
        <p className="mt-1 text-sm text-almi-text-muted">
          Civic integration at A2 or B1 (set by when your obligation started), plus Knowledge of Dutch
          Society (KNM) and Labour-market orientation (ONA). Passing is commonly used as language proof
          for naturalisatie — confirm the current rule with DUO / IND.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INBURGERING_EXAMS.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>

      <p className="text-xs text-almi-text-muted">
        Every task here is written from scratch by AlmiDutch. We never copy or reproduce official
        CvTE or DUO test material. Estimates are for practice only — confirm the exam you need with the
        official body.
      </p>
    </div>
  );
}
