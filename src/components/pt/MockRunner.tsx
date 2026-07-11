"use client";

// Full-mock runner. Sequences every section in exam order with NO marking until
// the end, then shows one honest aggregate estimate: CAPLE via aggregateCaple()
// over per-skill readouts, Celpe-Bras via estimateCelpe() over the self-scores.
// Always labelled "estimate, not the official CAPLE/Inep result".

import { useMemo, useState } from "react";
import type {
  PortugueseExam,
  PortugueseSkill,
  PortugueseVariant,
  CapleSkill,
} from "@/lib/pt/types";
import {
  aggregateCaple,
  skillReadout,
  readinessFromPct,
  type SkillReadout,
} from "@/lib/pt/caple";
import { estimateCelpe } from "@/lib/pt/celpebras";
import { SKILL_LABELS } from "@/lib/pt/registry";
import { ObjectiveTask } from "./ObjectiveTask";
import { submitAttempt, type RunnerItem } from "./shared";

export interface MockSection {
  skill: PortugueseSkill;
  objective: boolean;
  items: RunnerItem[];
}

interface FlatStep {
  skill: PortugueseSkill;
  objective: boolean;
  item: RunnerItem;
  index: number;
}

const RATING_PCT: Record<string, number> = { CLEAR: 85, BORDERLINE: 60, BELOW: 40 };
const CAPLE_RATINGS = ["CLEAR", "BORDERLINE", "BELOW"] as const;
const CAPLE_RATING_LABEL: Record<string, string> = {
  CLEAR: "Met all criteria", BORDERLINE: "Met some criteria", BELOW: "Struggled",
};

export function MockRunner({
  examName,
  variant,
  mockMinutes,
  sections,
}: {
  examName: string;
  exam: PortugueseExam;
  variant: PortugueseVariant;
  mockMinutes: number;
  sections: MockSection[];
}) {
  const isCaple = variant === "EUROPEAN";
  const flat = useMemo<FlatStep[]>(() => {
    let n = 0;
    return sections.flatMap((sec) =>
      sec.items.map((item) => ({ skill: sec.skill, objective: sec.objective, item, index: n++ })),
    );
  }, [sections]);

  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, unknown>>({});
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, string | number>>({});
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<React.ReactNode | null>(null);

  if (flat.length === 0) {
    return (
      <div className="rounded-2xl border border-almi-accent/40 bg-almi-accent/10 px-4 py-6 text-sm text-almi-ink">
        No mock content is available for this exam yet. Content is being added — check back soon.
      </div>
    );
  }

  const cur = flat[step];
  const isLast = step === flat.length - 1;

  async function finish() {
    setGrading(true);
    const perSkill: Partial<Record<PortugueseSkill, { points: number; max: number }>> = {};
    const prodPct: Partial<Record<PortugueseSkill, number[]>> = {};
    const celpeScores: { part: "ESCRITA" | "ORAL"; score: number }[] = [];

    for (const f of flat) {
      if (f.objective) {
        const g = await submitAttempt({
          exam: f.item.exam,
          skill: f.item.skill,
          taskType: f.item.taskType,
          answer: f.item.answer,
          maxPoints: f.item.maxPoints,
          response: responses[f.index] ?? null,
        });
        const points = g?.points ?? 0;
        const max = g?.maxPoints ?? f.item.maxPoints ?? 1;
        const acc = perSkill[f.skill] ?? { points: 0, max: 0 };
        perSkill[f.skill] = { points: acc.points + points, max: acc.max + max };
      } else {
        const r = ratings[f.index];
        if (variant === "BRAZILIAN" && typeof r === "number") {
          celpeScores.push({ part: f.skill === "ORAL" ? "ORAL" : "ESCRITA", score: r });
        } else if (typeof r === "string") {
          (prodPct[f.skill] ??= []).push(RATING_PCT[r] ?? 40);
        }
        // Persist the productive attempt (best-effort, gated server-side).
        await submitAttempt({
          exam: f.item.exam,
          skill: f.item.skill,
          taskType: f.item.taskType,
          response: { text: texts[f.index] ?? "" },
          selfScore: r ?? null,
        });
      }
    }

    if (isCaple) {
      const readouts: SkillReadout[] = [];
      for (const sec of sections) {
        if (sec.objective) {
          const s = perSkill[sec.skill];
          if (s) readouts.push(skillReadout(sec.skill as CapleSkill, s.points, s.max));
        } else {
          const pcts = prodPct[sec.skill] ?? [];
          const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
          // Synthesize points/max so the shared engine derives the readiness band.
          const max = pcts.length || 1;
          readouts.push(skillReadout(sec.skill as CapleSkill, Math.round((avg / 100) * max), max));
        }
      }
      const agg = aggregateCaple(readouts);
      setResult(<CapleResult examName={examName} readouts={readouts} agg={agg} />);
    } else {
      const est = estimateCelpe(celpeScores);
      setResult(<CelpeResult examName={examName} tierName={est.tier.name} estimate={est.estimate} certified={est.certified} />);
    }
    setGrading(false);
  }

  if (result) return <div className="space-y-5">{result}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-almi-text-muted">
        <span>Step {step + 1} of {flat.length} · {SKILL_LABELS[cur.skill].en}</span>
        <span>~{mockMinutes} min total</span>
      </div>

      <div className="space-y-4 rounded-2xl border border-almi-bg-peach bg-almi-bg-peach/30 p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-almi-teal/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-almi-teal">
            {SKILL_LABELS[cur.skill].en}
          </span>
          <h3 className="text-base font-semibold text-almi-ink">{cur.item.title}</h3>
        </div>
        <p className="text-sm text-almi-text">{cur.item.prompt}</p>

        {cur.objective ? (
          <ObjectiveTask
            key={cur.index}
            item={cur.item}
            variant={variant}
            disabled={false}
            onChange={(r) => setResponses((prev) => ({ ...prev, [cur.index]: r }))}
          />
        ) : (
          <ProductiveStep
            key={cur.index}
            isCelpe={!isCaple}
            text={texts[cur.index] ?? ""}
            rating={ratings[cur.index] ?? null}
            onText={(t) => setTexts((prev) => ({ ...prev, [cur.index]: t }))}
            onRating={(r) => setRatings((prev) => ({ ...prev, [cur.index]: r }))}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="inline-flex min-h-[44px] items-center rounded-full border border-almi-bg-peach px-5 py-2 text-sm font-semibold text-almi-text disabled:opacity-40"
        >
          ← Back
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex min-h-[44px] items-center rounded-full bg-almi-ink px-6 py-2 text-sm font-semibold text-almi-paper hover:opacity-90"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={grading}
            className="inline-flex min-h-[44px] items-center rounded-full bg-almi-coral px-6 py-2 text-sm font-semibold text-almi-ink hover:bg-almi-coral-deep disabled:opacity-40"
          >
            {grading ? "Scoring…" : "Finish mock & see estimate →"}
          </button>
        )}
      </div>
    </div>
  );
}

function ProductiveStep({
  isCelpe,
  text,
  rating,
  onText,
  onRating,
}: {
  isCelpe: boolean;
  text: string;
  rating: string | number | null;
  onText: (t: string) => void;
  onRating: (r: string | number) => void;
}) {
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        rows={6}
        placeholder="Escreva ou tome notas aqui…"
        className="w-full rounded-xl border border-almi-bg-peach bg-almi-paper p-3 text-sm text-almi-text"
      />
      <fieldset>
        <legend className="text-sm font-semibold text-almi-ink">
          Practice estimate — self-rating (not an official score)
        </legend>
        {isCelpe ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onRating(n)}
                className={`min-h-[40px] w-12 rounded-xl border text-sm font-semibold ${rating === n ? "border-almi-coral bg-almi-coral text-almi-ink" : "border-almi-bg-peach bg-almi-paper text-almi-text"}`}
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {CAPLE_RATINGS.map((r) => (
              <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm ${rating === r ? "border-almi-coral bg-almi-coral/5" : "border-almi-bg-peach bg-almi-paper"}`}>
                <input type="radio" name={`mock-rate`} checked={rating === r} onChange={() => onRating(r)} />
                <span className="text-almi-text">{CAPLE_RATING_LABEL[r]}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
}

function CapleResult({
  examName,
  readouts,
  agg,
}: {
  examName: string;
  readouts: SkillReadout[];
  agg: { meanPct: number; overall: string; label: string; weakest: CapleSkill | null };
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-almi-accent-deep">
          {examName} · full mock · estimate
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-almi-ink">{agg.label}</h2>
        <p className="text-sm text-almi-text-muted">
          Mean {agg.meanPct}% · overall readiness {readinessFromPct(agg.meanPct)}
          {agg.weakest ? ` · focus on ${SKILL_LABELS[agg.weakest].en}` : ""}
        </p>
      </div>
      <ul className="space-y-2">
        {readouts.map((r) => (
          <li key={r.skill} className="flex items-center justify-between rounded-xl border border-almi-bg-peach px-4 py-2 text-sm">
            <span className="text-almi-ink">
              {SKILL_LABELS[r.skill].en}
              {r.isEstimate ? <span className="ml-2 text-xs text-almi-text-muted">(self-rated)</span> : null}
            </span>
            <span className="font-semibold text-almi-text">{r.pct}% · {r.readiness}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-almi-text-muted">
        This is an estimate, not the official CAPLE result. The official mark is a weighted,
        centre-graded classification.
      </p>
    </div>
  );
}

function CelpeResult({
  examName,
  tierName,
  estimate,
  certified,
}: {
  examName: string;
  tierName: string;
  estimate: number;
  certified: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-almi-accent-deep">
          {examName} · full mock · estimate
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-almi-ink">{tierName}</h2>
        <p className="text-sm text-almi-text-muted">
          Self-rated estimate {estimate} / 5 · {certified ? "above the certification floor" : "below the certification floor"}
        </p>
      </div>
      <p className="text-xs text-almi-text-muted">
        This is an estimate, not the official Inep result. Celpe-Bras is holistically graded by Inep.
      </p>
    </div>
  );
}
