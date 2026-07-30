// Bundled item loader for AlmiDutch practice.
//
// Items are authored as JSON bundles under src/data/items/*.json (one per
// surface). The content pipeline may still be generating them, so the loader is
// defensive: any missing, empty, or malformed file falls back to [] rather than
// throwing. Files are read from disk at module load (Node runtime) so we don't
// need every bundle to exist at build/tsc time.

import fs from "fs";
import path from "path";
import type {
  DutchTrack,
  DutchExam,
  DutchSkill,
  DutchTaskType,
  DutchDifficulty,
  CefrLevel,
  ObjectiveAnswer,
} from "./types";

/** A single authored item, matching the DutchItem content fields (no DB id). */
export interface DutchItemSeed {
  track: DutchTrack;
  exam: DutchExam;
  skill: DutchSkill;
  taskType: DutchTaskType;
  difficulty: DutchDifficulty;
  /** The CEFR level this task is pitched at (optional). Feeds the goal-readiness band
   *  and the level-aware AI grader. Absent = UNDECLARED (never counted as at-goal). */
  cefr?: CefrLevel;
  title: string;
  prompt: string;
  payload: unknown;
  answer: ObjectiveAnswer | null;
  maxPoints: number;
}

const BUNDLE_FILES = [
  "nt2-reading.json",
  "nt2-listening.json",
  "nt2-productive.json",
  "inburgering-reading.json",
  "inburgering-listening.json",
  "inburgering-productive.json",
  "inburgering-speaking-2.json",
  "inburgering-writing-2.json",
  "inburgering-reading-2.json",
  "inburgering-listening-2.json",
  "inburgering-knm-2.json",
  "inburgering-ona-2.json",
  "nt2-i-reading-2.json",
  "nt2-i-listening-2.json",
  "nt2-i-productive-2.json",
  "nt2-ii-reading-2.json",
  "nt2-ii-listening-2.json",
  "nt2-ii-productive-2.json",
  "inburgering-knm.json",
  "inburgering-ona.json",
];

const ITEMS_DIR = path.join(process.cwd(), "src", "data", "items");

function loadBundle(file: string): DutchItemSeed[] {
  try {
    const full = path.join(ITEMS_DIR, file);
    if (!fs.existsSync(full)) return [];
    const raw = fs.readFileSync(full, "utf8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DutchItemSeed[];
  } catch {
    // Malformed / partially-written bundle — tolerate and skip.
    return [];
  }
}

let cache: DutchItemSeed[] | null = null;

function allItems(): DutchItemSeed[] {
  if (cache) return cache;
  cache = BUNDLE_FILES.flatMap(loadBundle);
  return cache;
}

/** Filtered item lookup by any combination of track / exam / skill. */
export function getItems(filter: {
  track?: DutchTrack;
  exam?: DutchExam;
  skill?: DutchSkill;
} = {}): DutchItemSeed[] {
  return allItems().filter(
    (it) =>
      (filter.track === undefined || it.track === filter.track) &&
      (filter.exam === undefined || it.exam === filter.exam) &&
      (filter.skill === undefined || it.skill === filter.skill),
  );
}

// ── SERVER-SIDE ITEM IDENTITY ───────────────────────────────────────────────
// Items are bundle-served with NO database id. That absence was not a cosmetic gap: it
// was the ROOT of this product's grading P0. With nothing to re-load by, /api/nl/submit
// had no way to find an item server-side, so it graded whatever answer key the browser
// posted — `gradeObjective(body.answer, body.response)` — and /api/nl/grade took the
// CEFR level, title, prompt and criteria off the request too. Both were forgeable, and
// the productive one failed silently: a B1 task tagged `cefr:"A1"` came back with
// fluent, confident, specific feedback against the easier standard.
//
// An id has to exist before grading can be server-authoritative. It is the first fix,
// not a later hardening step.
//
// The id hashes the FULL identifying tuple — track|exam|skill|title — because titles are
// only unique within a surface. assertNoIdCollisions() proves that tuple is unique at
// build time; a collision would make getItemById() return the WRONG item and grade a
// learner against a different task's key, silently.

/** Stable, content-derived id for a bundle item — the handle the client posts back. */
export function stableItemId(
  it: Pick<DutchItemSeed, "track" | "exam" | "skill" | "title">,
): string {
  return hashSeed(`${it.track}|${it.exam}|${it.skill}|${it.title}`).toString(36);
}

/** Re-load the full item, INCLUDING its answer key, by its stable id — server-side only.
 *  This is the function that makes grading authoritative: the route calls it instead of
 *  believing the request. */
export function getItemById(id: string): DutchItemSeed | undefined {
  return allItems().find((it) => stableItemId(it) === id);
}

/**
 * Build-time guard: no two items may share a stable id. A collision would make
 * getItemById() return the wrong item, so the submit route would grade a learner's
 * answer against a DIFFERENT item's key — with no error and a plausible score.
 *
 * SEEN RED: duplicate a (track,exam,skill,title) tuple in any bundle and this throws.
 */
export function assertNoIdCollisions(): void {
  const seen = new Map<string, string>();
  for (const it of allItems()) {
    const id = stableItemId(it);
    const key = `${it.track}|${it.exam}|${it.skill}|${it.title}`;
    const prior = seen.get(id);
    if (prior) {
      throw new Error(
        `stableItemId collision: "${key}" and "${prior}" both hash to ${id} — grading would key against the wrong item`,
      );
    }
    seen.set(id, key);
  }
}

/**
 * Deterministic stable string hash → 32-bit int. Used as a fallback seed so the
 * pick is varied but reproducible without Math.random at module/build scope.
 */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) for a stable shuffle from a numeric seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  const rng = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deterministically pick up to n practice items for an exam + skill. With no
 * seed the natural (authored) order is preserved; a numeric seed produces a
 * stable reshuffle for variety. Never uses Math.random.
 */
export function pickPractice(
  exam: DutchExam,
  skill: DutchSkill,
  n: number,
  seed?: number,
): DutchItemSeed[] {
  const pool = getItems({ exam, skill });
  const ordered =
    seed === undefined
      ? pool
      : stableShuffle(pool, seed ^ hashSeed(`${exam}:${skill}`));
  return ordered.slice(0, Math.max(0, n));
}
