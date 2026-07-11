import type { Metadata } from "next";
import Link from "next/link";
import { CAPLE_EXAMS } from "@/lib/pt/registry";

export const metadata: Metadata = {
  title: { absolute: "CAPLE European Portuguese exams (ACESSO to DUPLE) — guides & practice | AlmiDutch" },
  description:
    "The CAPLE suite of European Portuguese exams — ACESSO (A1), CIPLE (A2, the citizenship exam), DEPLE (B1), DIPLE (B2), DAPLE (C1), DUPLE (C2). Honest per-skill readiness practice for all four skills.",
  alternates: { canonical: "/exams/caple" },
};

export default function CapleHub() {
  return (
    <main className="bg-almi-bg text-almi-text">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-almi-ink sm:text-4xl">CAPLE — European Portuguese exams</h1>
        <p className="mt-3 max-w-2xl text-base text-almi-text">
          CAPLE is the official suite of European Portuguese exams from the University of Lisbon with Instituto
          Camões — six CEFR levels, each testing Reading, Listening, Writing and Speaking. Pick your level for an
          honest readiness estimate, never a fabricated official result.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {CAPLE_EXAMS.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/exams/caple/${e.slug}`}
                className="flex h-full flex-col rounded-2xl border border-almi-bg-peach bg-almi-paper p-5 hover:border-almi-coral"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-almi-bg-peach px-1.5 text-xs font-bold text-almi-ink">{e.cefr}</span>
                  <span className="text-lg font-semibold text-almi-ink">{e.name}</span>
                  {e.lead && <span className="rounded-full bg-almi-coral/15 px-2 py-0.5 text-xs font-semibold text-almi-coral-deep">Citizenship</span>}
                </div>
                <span className="mt-2 text-sm text-almi-text-muted">{e.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
