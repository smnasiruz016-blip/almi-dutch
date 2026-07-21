// Build-time FORK HYGIENE GATE — the AlmiWorld §7 rule, enforced instead of trusted.
//
// WHY THIS EXISTS. This repo's lineage is:
//   almi-celpip → almi-goethe → almi-portuguese → almi-dutch (you are here)
// AlmiDutch's first commit is "Fork almi-portuguese → almi-dutch": the immediate ancestor
// is AlmiPortuguese (CAPLE + Celpe-Bras), whose engine came celpip → goethe. So three leak
// surfaces: Portuguese (CAPLE, Celpe-Bras, the CIPLE/DEPLE/… ladder, Instituto Camões),
// German (from AlmiGoethe), and Canadian English (from AlmiCELPIP). A Dutch NT2/Inburgering
// product has no reason to name any of them.
//
// NOTE this fork is OFF the Nordic chain — its ancestors are Portuguese/German/English, not
// Icelandic/Danish/Norwegian. The lineage was pinned from provenance (the fork commit), not
// assumed; portuguese greps clean of Nordic and German nouns, a goethe-engine fork with
// fresh Portuguese content.
//
// Recurring lesson (documented in almi-swiss): the dangerous case is the LABEL localized
// while the FACT was not, and an identifier shipped in a spelling the banned list didn't
// hold. Product names are ENUMERATED in all four shapes.
//
// ⚠️ RE-CUT NOTES:
//  1. Dutch nouns are THIS product's subject and are NOT banned: NT2, Inburgering, KNM,
//     ONA, Staatsexamen, nl-NL.
//  2. German SKILL words (Schreiben/Sprechen/Hören/Lesen) banned by WORD BOUNDARY + case —
//     Dutch uses lezen/horen/schrijven/spreken, which differ, so no collision.
//  3. Bare country names are NOT banned — a Dutch item may name Portugal/Brazil/Germany/
//     Canada as content. Only ancestors' exam/authority/institution/product/locale nouns leak.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "scripts", "prisma"];
const SCAN_EXT = /\.(ts|tsx|js|mjs|json|prisma|css|md)$/;

const ALLOWLIST = new Map([
  ["src/lib/nav/family.ts", "links to sibling AlmiWorld products by name"],
  ["scripts/seo/fork-hygiene-gate.mjs", "documents the banned nouns"],
]);

const LINE_ESCAPE = "hygiene-allow";

// Ancestor (Portuguese + German + CELPIP) proper nouns. ⚠️ RE-CUT AT EVERY FORK.
// Dutch nouns are NOT here; bare country names are not here.
const BANNED = [
  // — Portuguese (immediate ancestor) — CAPLE system + Brazil's Celpe-Bras + the body —
  "CAPLE", "Celpe-Bras", "CELPE_BRAS", "Instituto Camões",
  "pt-PT", "pt-BR",
  // — German (Goethe lineage) — institution / exam / locale —
  "Goethe-Institut", "Goethe-Zertifikat", "TestDaF",
  "de-DE",
  // — CELPIP (root) — Canadian English test + framework —
  "CELPIP", "Canadian Language Benchmark",
  "Immigration, Refugees and Citizenship Canada",
  // Sibling/ancestor PRODUCT names appended below — GENERATED, not hand-listed.
];

const ANCESTOR_PRODUCTS = ["celpip", "goethe", "portuguese"];
/** Every form a product slug ships in: almi-x · almi_x · almix · AlmiX. */
function productNameForms(p) {
  return [`almi-${p}`, `almi_${p}`, `almi${p}`, `Almi${p[0].toUpperCase()}${p.slice(1)}`];
}
for (const p of ANCESTOR_PRODUCTS) BANNED.push(...productNameForms(p));
BANNED.push("AlmiCELPIP");

// SELF-CHECK — a global find-replace can rewrite this list to ban our own name.
const SELF_NAMES = ["AlmiDutch", "almi-dutch", "almi_dutch", "almidutch"];
for (const n of SELF_NAMES) {
  if (BANNED.some((b) => b.toLowerCase() === n.toLowerCase())) {
    console.error("");
    console.error(`FORK-HYGIENE GATE IS MISCONFIGURED: BANNED contains "${n}", which is THIS product's own name.`);
    console.error("Every legitimate mention of ourselves would be reported as an ancestor leak. Fix BANNED.");
    console.error("");
    process.exit(2);
  }
}

// Word-boundary bans (\b) — collide with ordinary substrings otherwise. The CAPLE ladder
// exam codes (CIPLE/DEPLE/DIPLE/DAPLE/DUPLE/ACESSO) and acronyms go here; German nouns are
// case-sensitive-Capitalised so \bLesen\b matches the German word, not Dutch "lezen".
const BANNED_WORD = [
  "CIPLE", "DEPLE", "DIPLE", "DAPLE", "DUPLE", "ACESSO",   // CAPLE ladder (Portuguese)
  "CLB", "IRCC", "telc",                                     // CELPIP / German exam acronyms
  "Schreiben", "Sprechen", "Hören", "Lesen",                // German skill words
];

// ── Scanning machinery (real-entity-gate design: strip comments, scan STRING values).

function stripComments(text) {
  let out = "";
  let i = 0;
  let quote = null;
  let inLine = false;
  let inBlock = false;
  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1];
    if (inLine) {
      if (c === "\n") { inLine = false; out += c; }
      else out += " ";
      i++; continue;
    }
    if (inBlock) {
      if (c === "*" && n === "/") { inBlock = false; out += "  "; i += 2; continue; }
      out += c === "\n" ? c : " ";
      i++; continue;
    }
    if (quote) {
      if (c === "\\") { out += text.slice(i, i + 2); i += 2; continue; }
      if (c === quote) quote = null;
      out += c; i++; continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i++; continue; }
    if (c === "/" && n === "/") { inLine = true; out += "  "; i += 2; continue; }
    if (c === "/" && n === "*") { inBlock = true; out += "  "; i += 2; continue; }
    out += c; i++;
  }
  return out;
}

// Prisma comments are `//` and `///` — NOT `#`. stripComments handles `//` while
// respecting string literals, so prisma reuses it.

function jsonStrings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) for (const v of node) jsonStrings(v, out);
  else if (node && typeof node === "object") for (const v of Object.values(node)) jsonStrings(v, out);
  return out;
}

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === "node_modules" || e === ".next" || e === ".git") continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXT.test(e)) out.push(full);
  }
  return out;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (ALLOWLIST.has(rel)) continue;
    const raw = readFileSync(file, "utf8");
    let text;
    if (rel.endsWith(".json")) {
      try { text = jsonStrings(JSON.parse(raw)).join("\n"); }
      catch { text = raw; }
    } else if (rel.endsWith(".prisma")) {
      text = stripComments(raw);   // prisma comments are //
    } else {
      text = stripComments(raw);
    }
    const lines = text.split(/\r?\n/);
    const rawLines = raw.split(/\r?\n/);

    lines.forEach((line, i) => {
      if ((rawLines[i] ?? "").includes(LINE_ESCAPE)) return;
      for (const term of BANNED) {
        if (line.includes(term)) {
          violations.push(`${rel}:${i + 1}  banned ancestor noun "${term}"\n      ${line.trim().slice(0, 120)}`);
        }
      }
      for (const term of BANNED_WORD) {
        if (new RegExp(`\\b${term}\\b`).test(line)) {
          violations.push(`${rel}:${i + 1}  banned ancestor noun "${term}"\n      ${line.trim().slice(0, 120)}`);
        }
      }
    });
  }
}

if (violations.length) {
  console.error("\n✗ FORK HYGIENE GATE FAILED — ancestor content found.\n");
  console.error("  The Netherlands must read as the Netherlands. These are leaks from the");
  console.error("  fork lineage (celpip → goethe → portuguese → dutch).\n");
  for (const v of [...new Set(violations)]) console.error(`  ${v}`);
  console.error(`\n  ${violations.length} violation(s). Fix the FACT, not just the label.\n`);
  process.exit(1);
}

console.log(`✓ Fork hygiene gate: clean (no ancestor nouns across ${SCAN_DIRS.join(", ")}).`);
