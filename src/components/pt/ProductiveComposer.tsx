"use client";

// Productive composer for AI-graded skills (Writing/Speaking/Escrita/Oral).
// Shows the stimulus + criteria, a writing textarea with a live length counter
// (or a speaking notes area with timing guidance), and a clearly-labelled
// "practice estimate" self-rating — 0–5 for Celpe-Bras (feeds estimateCelpe) or
// CLEAR/BORDERLINE/BELOW for CAPLE. NEVER an official score. Saves via the API.

import { useMemo, useState } from "react";
import type {
  PortugueseSkill,
  PortugueseVariant,
  ProductivePayload,
  EscritaTaskPayload,
  OralInterviewPayload,
} from "@/lib/pt/types";
import { estimateCelpe } from "@/lib/pt/celpebras";
import { SKILL_LABELS } from "@/lib/pt/registry";
import { submitAttempt, type ProductiveItem } from "./shared";

const CAPLE_RATINGS = ["CLEAR", "BORDERLINE", "BELOW"] as const;
const CAPLE_RATING_LABEL: Record<string, string> = {
  CLEAR: "I met all the criteria",
  BORDERLINE: "I met some criteria",
  BELOW: "I struggled with this",
};

function isWritingType(t: string): boolean {
  return t === "WRITING_PROMPT" || t === "ESCRITA_TASK";
}

function readDisplay(item: ProductiveItem): {
  stimulus: string | null;
  enunciado: string | null;
  criteria: string[];
  charBand: { min: number; max: number } | null;
  minSeconds: number | null;
  warmup: string[];
  elementos: { title: string; provocador: string; questions: string[] }[];
} {
  const base = {
    stimulus: null as string | null,
    enunciado: null as string | null,
    criteria: [] as string[],
    charBand: null as { min: number; max: number } | null,
    minSeconds: null as number | null,
    warmup: [] as string[],
    elementos: [] as { title: string; provocador: string; questions: string[] }[],
  };
  switch (item.taskType) {
    case "WRITING_PROMPT":
    case "SPEAKING_PROMPT": {
      const p = item.payload as ProductivePayload;
      return { ...base, stimulus: p.stimulus ?? null, criteria: p.criteria ?? [], charBand: p.charBand ?? null, minSeconds: p.minSeconds ?? null };
    }
    case "ESCRITA_TASK": {
      const p = item.payload as EscritaTaskPayload;
      return { ...base, stimulus: p.stimulusText ?? null, enunciado: p.enunciado ?? null, criteria: p.criteria ?? [], charBand: p.charBand ?? null };
    }
    case "ORAL_INTERVIEW": {
      const p = item.payload as OralInterviewPayload;
      return { ...base, criteria: p.criteria ?? [], warmup: p.warmup ?? [], elementos: p.elementos ?? [] };
    }
    default:
      return base;
  }
}

export function ProductiveComposer({
  examName,
  variant,
  skill,
  items,
}: {
  examName: string;
  variant: PortugueseVariant;
  skill: PortugueseSkill;
  items: ProductiveItem[];
}) {
  const isCelpe = variant === "BRAZILIAN"; // ESCRITA / ORAL → 0–5 self-rating
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<string | number | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<{ part: "ESCRITA" | "ORAL"; score: number }[]>([]);
  const [capleRatings, setCapleRatings] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const item = items[step];
  const d = useMemo(() => readDisplay(item), [item]);
  const writing = isWritingType(item.taskType);
  const isLast = step === items.length - 1;

  async function save() {
    if (saved || busy || rating === null) return;
    setBusy(true);
    await submitAttempt({
      exam: item.exam,
      skill: item.skill,
      taskType: item.taskType,
      response: { text },
      selfScore: rating,
    });
    setBusy(false);
    setSaved(true);
    if (isCelpe && typeof rating === "number") {
      setScores((prev) => [...prev, { part: skill === "ORAL" ? "ORAL" : "ESCRITA", score: rating }]);
    } else if (typeof rating === "string") {
      setCapleRatings((prev) => [...prev, rating]);
    }
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
    setText("");
    setRating(null);
    setSaved(false);
  }

  if (done) {
    return <Summary examName={examName} skill={skill} isCelpe={isCelpe} scores={scores} capleRatings={capleRatings} onReset={() => { setStep(0); setText(""); setRating(null); setSaved(false); setScores([]); setCapleRatings([]); setDone(false); }} />;
  }

  const charCount = text.trim().length;
  const inBand = d.charBand ? charCount >= d.charBand.min && charCount <= d.charBand.max : true;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-almi-text-muted">
        <span>Task {step + 1} of {items.length}</span>
        <span>{SKILL_LABELS[skill].en}</span>
      </div>

      <div className="space-y-4 rounded-2xl border border-almi-bg-peach bg-almi-bg-peach/30 p-5">
        <h3 className="text-base font-semibold text-almi-ink">{item.title}</h3>
        <p className="text-sm text-almi-text">{item.prompt}</p>

        {d.enunciado && (
          <p className="rounded-xl border border-almi-coral/30 bg-almi-coral/5 p-4 text-sm text-almi-ink">
            {d.enunciado}
          </p>
        )}
        {d.stimulus && (
          <p className="whitespace-pre-wrap rounded-xl border border-almi-bg-peach bg-almi-paper p-4 text-sm text-almi-text">
            {d.stimulus}
          </p>
        )}

        {d.warmup.length > 0 && (
          <div className="rounded-xl border border-almi-bg-peach bg-almi-paper p-4 text-sm text-almi-text">
            <p className="font-semibold text-almi-ink">Warm-up questions</p>
            <ul className="mt-1 list-disc pl-5">
              {d.warmup.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}
        {d.elementos.map((el, i) => (
          <div key={i} className="rounded-xl border border-almi-bg-peach bg-almi-paper p-4 text-sm text-almi-text">
            <p className="font-semibold text-almi-ink">{el.title}</p>
            <p className="mt-1 italic text-almi-text-muted">{el.provocador}</p>
            <ul className="mt-1 list-disc pl-5">
              {el.questions.map((q, qi) => <li key={qi}>{q}</li>)}
            </ul>
          </div>
        ))}

        {d.criteria.length > 0 && (
          <div className="rounded-xl border border-almi-bg-peach bg-almi-paper p-4 text-sm">
            <p className="font-semibold text-almi-ink">What your answer should show</p>
            <ul className="mt-1 list-disc pl-5 text-almi-text">
              {d.criteria.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-almi-ink">
            {writing ? "Your written answer" : "Your speaking notes"}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={writing ? 8 : 5}
            disabled={saved}
            placeholder={writing ? "Escreva a sua resposta aqui…" : "Jot down what you would say…"}
            className="mt-2 w-full rounded-xl border border-almi-bg-peach bg-almi-paper p-3 text-sm text-almi-text"
          />
          <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs">
            {writing && d.charBand ? (
              <span className={inBand ? "text-almi-teal" : "text-almi-text-muted"}>
                {charCount} characters · target {d.charBand.min}–{d.charBand.max}
              </span>
            ) : writing ? (
              <span className="text-almi-text-muted">{charCount} characters</span>
            ) : (
              <span className="text-almi-text-muted">
                {d.minSeconds ? `Aim to speak for at least ${d.minSeconds} seconds.` : "Practise aloud from your notes."}
              </span>
            )}
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-almi-ink">
            Practice estimate — your own self-rating (not an official score)
          </legend>
          {isCelpe ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={saved}
                  onClick={() => setRating(n)}
                  className={`min-h-[40px] w-12 rounded-xl border text-sm font-semibold ${
                    rating === n ? "border-almi-coral bg-almi-coral text-almi-ink" : "border-almi-bg-peach bg-almi-paper text-almi-text"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {CAPLE_RATINGS.map((r) => (
                <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm ${rating === r ? "border-almi-coral bg-almi-coral/5" : "border-almi-bg-peach bg-almi-paper"}`}>
                  <input type="radio" name="caple-selfrate" disabled={saved} checked={rating === r} onChange={() => setRating(r)} />
                  <span className="text-almi-text">{CAPLE_RATING_LABEL[r]}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      </div>

      {saved && (
        <div className="rounded-xl bg-almi-teal/15 px-4 py-3 text-sm font-semibold text-almi-teal">
          Saved. This is your own practice estimate — arrange AI or tutor feedback for a real judgement.
        </div>
      )}

      <div className="flex gap-3">
        {!saved ? (
          <button type="button" onClick={save} disabled={busy || rating === null} className="inline-flex min-h-[44px] items-center rounded-full bg-almi-coral px-6 py-2 text-sm font-semibold text-almi-ink hover:bg-almi-coral-deep disabled:opacity-40">
            {busy ? "Saving…" : "Save & self-rate"}
          </button>
        ) : (
          <button type="button" onClick={next} className="inline-flex min-h-[44px] items-center rounded-full bg-almi-ink px-6 py-2 text-sm font-semibold text-almi-paper hover:opacity-90">
            {isLast ? "See estimate →" : "Next task →"}
          </button>
        )}
      </div>
    </div>
  );
}

function Summary({
  examName,
  skill,
  isCelpe,
  scores,
  capleRatings,
  onReset,
}: {
  examName: string;
  skill: PortugueseSkill;
  isCelpe: boolean;
  scores: { part: "ESCRITA" | "ORAL"; score: number }[];
  capleRatings: string[];
  onReset: () => void;
}) {
  let body: React.ReactNode;
  if (isCelpe && scores.length > 0) {
    const est = estimateCelpe(scores);
    body = (
      <>
        <h2 className="mt-1 text-2xl font-semibold text-almi-ink">{est.tier.name}</h2>
        <p className="text-sm text-almi-text-muted">Self-rated estimate {est.estimate} / 5</p>
      </>
    );
  } else {
    // CAPLE: conservative overall = weakest self-rating.
    const order = ["CLEAR", "BORDERLINE", "BELOW"];
    const worst = capleRatings.reduce((w, r) => (order.indexOf(r) > order.indexOf(w) ? r : w), "CLEAR");
    const label = worst === "CLEAR" ? "On track" : worst === "BORDERLINE" ? "Borderline" : "Below target";
    body = (
      <>
        <h2 className="mt-1 text-2xl font-semibold text-almi-ink">{label}</h2>
        <p className="text-sm text-almi-text-muted">Your own self-rating across {capleRatings.length || "the"} task(s)</p>
      </>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-almi-bg-peach bg-almi-paper p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-almi-accent-deep">
          {examName} · {SKILL_LABELS[skill].en} · practice estimate
        </p>
        {body}
      </div>
      <p className="text-xs text-almi-text-muted">
        This is a self-assessment for practice only — it is an estimate, not the official CAPLE or
        Inep result.
      </p>
      <button type="button" onClick={onReset} className="inline-flex min-h-[44px] items-center rounded-full bg-almi-coral px-6 py-2 text-sm font-semibold text-almi-ink hover:bg-almi-coral-deep">
        Practise again
      </button>
    </div>
  );
}
