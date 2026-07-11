// Practice hub — "Choose a Test". Two families: European Portuguese (CAPLE, six
// CEFR levels) and Brazilian Portuguese (Celpe-Bras, one integrated exam). Each
// card routes to /practice/<slug>. Reading + Listening are free to taste;
// Writing/Speaking/Escrita/Oral and the timed mock are Pro.

import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { CAPLE_EXAMS, CELPE_BRAS, type ExamMeta } from "@/lib/pt/registry";

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
          Cidadania / A2
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
          Celpe-Bras integrated parts are graded with honest AI-style feedback against the official
          criteria. Every readout is a practice estimate — never an official CAPLE or Inep result.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-almi-ink">European (Portugal) — CAPLE</h2>
        <p className="mt-1 text-sm text-almi-text-muted">
          Six CEFR levels from A1 to C2. CIPLE (A2) is the exam accepted for Portuguese citizenship.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPLE_EXAMS.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-almi-ink">Brazilian — Celpe-Bras</h2>
        <p className="mt-1 text-sm text-almi-text-muted">
          Brazil&apos;s only official Portuguese certificate — one integrated exam, a holistic tier.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExamCard exam={CELPE_BRAS} />
        </div>
      </section>

      <p className="text-xs text-almi-text-muted">
        Every task here is written from scratch by AlmiDutch. We never copy or reproduce CAPLE
        or Inep test material. Estimates are for practice only — confirm the exam you need with the
        official body.
      </p>
    </div>
  );
}
