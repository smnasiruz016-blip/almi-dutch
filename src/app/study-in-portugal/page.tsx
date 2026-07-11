import type { Metadata } from "next";
import Link from "next/link";
import { SUBJECTS } from "@/lib/seo/axes";

export const metadata: Metadata = {
  title: { absolute: "Study in Portugal — the Portuguese-language pathway by subject | AlmiDutch" },
  description:
    "Studying in Portugal means meeting the Portuguese-language requirement. Explore the CAPLE pathway by subject, with honest readiness practice — never a fabricated official result.",
  alternates: { canonical: "/study-in-portugal" },
};

export default function StudyHub() {
  return (
    <main className="bg-almi-bg text-almi-text">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-almi-ink sm:text-4xl">Study in Portugal</h1>
        <p className="mt-3 max-w-2xl text-base text-almi-text">
          Whatever you plan to study in Portugal, the step students most often underestimate is the
          Portuguese-language requirement — usually around B1–B2 (DEPLE–DIPLE) for Portuguese-taught programmes.
          Choose a field to see the language pathway and practise honestly.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map((s) => (
            <li key={s.slug}>
              <Link href={`/study-in-portugal/${s.slug}`} className="block rounded-2xl border border-almi-bg-peach bg-almi-paper p-4 text-almi-ink hover:border-almi-coral">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
