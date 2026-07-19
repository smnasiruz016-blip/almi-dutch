// Real-entity gate — blocks invented messages attributed to real organisations.
//
// This exists because the failure it catches already happened here. The bank shipped a
// municipal letter signed "Gemeente Almere", another signed "Gemeente Utrecht", a phone
// call from "de gemeente Middelburg", and seven named businesses — three of which turned
// out to be real practices. Every one survived review, because the surrounding facts were
// right. That is the whole danger: a fabricated document reads as credible precisely when
// nothing else about it is wrong.
//
// IT SCANS PARSED STRINGS, NOT JSON. The first version of this gate scanned
// JSON.stringify(payload), and that made it blind to the exact violation it was written
// for. In serialised JSON a newline is a backslash and the LETTER n, so in
// "groet,\nGemeente Almere" the character before "Gemeente" is a letter, \b never
// matches, and the signature sails through. Proven, not suspected: re-running the
// original violation past that version returned "clean". Mid-sentence names were caught,
// which is why it looked like it worked — but a letter's signature always sits right
// after a line break, so the blind spot covered the one place that matters.
//
// AlmiSwiss hit this same bug earlier and its gate already parses first; its comments
// describe being blind to "Helvetia" for the same reason. That lesson existed and this
// gate reintroduced it, which is the argument for keeping the reasoning in the file
// rather than in someone's memory.
//
// Two rules, matching the two ways it went wrong:
//   CLASS 1 — a real public body named as the AUTHOR of invented communication. Keyed on
//   "Gemeente <Name>" rather than a list of the 342 municipalities: a list goes stale the
//   moment two merge, and the pattern catches names no list would have. It distinguishes
//   attribution from setting — "Gemeente Almere" signs a letter, "in Almere" is where
//   someone lives, and only the first lies.
//   CLASS 2 — a named business as the author. Dutch naming is conventional enough
//   ("De …", "Het …") that an invented name collides with a real one by default, so the
//   rule is not "invent carefully" but DO NOT NAME AT ALL. A denylist of real insurers,
//   banks, telecoms and chains backs it up for names that skip the category noun.
//
// Deliberately NOT flagged: a real place as setting ("centrum van Leiden"), a station in
// a transport announcement ("Amsterdam Centraal"), a public body named factually in a
// knowledge question ("Wat doet de Belastingdienst?"). Those are accurate, not
// misattributed, and flagging them would push the content away from real life.

import fs from "node:fs";
import path from "node:path";

const ITEMS_DIR = path.join(process.cwd(), "src", "data", "items");
const problems = [];

const MUNICIPALITY_AS_ACTOR = /\b[Gg]emeente[ \t]+([A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+)?)/g;

const CATEGORY_NOUNS = [
  "huisartsenpraktijk", "tandartspraktijk", "praktijk", "apotheek", "ziekenhuis",
  "woningcorporatie", "verhuurder", "supermarkt", "basisschool", "school",
  "taalschool", "sportschool", "sportclub", "bibliotheek", "buurthuis",
  "uitzendbureau", "verzekeraar", "zorgverzekeraar", "bank",
];
const NAMED_BUSINESS = new RegExp(
  // [ \t] rather than \s: a business name never sits on the line AFTER its category
  // noun. Scanning real strings exposed that "…in het buurthuis\n\nElke dinsdag…" was
  // matching as "buurthuis Elke" — Elke means "every" and is capitalised only because it
  // opens a sentence. JSON-scanning had hidden that false positive by breaking the match
  // on the escape. A gate that cries wolf gets switched off, so precision matters as
  // much as reach.
  `\\b(${CATEGORY_NOUNS.join("|")})[ \\t]+((?:De|Het|'t)[ \\t]+[A-Z][a-zà-ÿ]+|[A-Z][a-zà-ÿ]{2,})`,
  "g",
);

// Helvetia class: a real insurer signing an invented letter. A backstop for names that
// skip the category noun — concrete, not a census of Dutch trade.
const BRAND_DENYLIST = [
  "Achmea", "Zilveren Kruis", "Menzis", "VGZ", "ONVZ", "Univé", "Aegon",
  "Nationale-Nederlanden", "Interpolis", "FBTO", "Centraal Beheer", "Ditzo", "Anderzorg",
  "Helvetia", "Allianz",
  "Rabobank", "ABN AMRO", "Bunq", "Knab", "Triodos", "RegioBank", "Volksbank",
  "KPN", "Vodafone", "T-Mobile", "Odido", "Ziggo", "Tele2", "Simyo",
  "Eneco", "Vattenfall", "Essent", "Greenchoice",
  "Albert Heijn", "Jumbo", "Lidl", "Aldi", "Ekoplaza", "HEMA", "Bijenkorf", "Blokker",
  "Kruidvat", "Etos", "Gamma", "Praxis", "Coolblue", "MediaMarkt", "Zalando",
  "Marktplaats", "PostNL", "Thuisbezorgd",
];

// Collect every string in a payload, so patterns run against real text with real
// boundaries — never against escaped JSON.
function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) strings(x, out);
  else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, out);
  return out;
}

let scanned = 0;
for (const file of fs.readdirSync(ITEMS_DIR).filter((f) => f.endsWith(".json"))) {
  const raw = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), "utf8"));
  for (const [i, item] of (raw.items ?? raw).entries()) {
    scanned++;
    const where = `${file}[${i}] "${item.title}"`;
    for (const text of strings(item.payload)) {
      for (const m of text.matchAll(MUNICIPALITY_AS_ACTOR)) {
        problems.push(
          `${where}: names a municipality as an actor — "gemeente ${m[1]}". ` +
            `Use "de gemeente"; a real municipality must never author invented text.`,
        );
      }
      for (const m of text.matchAll(NAMED_BUSINESS)) {
        problems.push(`${where}: names a business — "${m[1]} ${m[2]}". Use the bare category ("de ${m[1]}").`);
      }
      for (const brand of BRAND_DENYLIST) {
        if (new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)) {
          problems.push(`${where}: names a real company — "${brand}". Use a generic category.`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\nREAL-ENTITY GATE FAILED — ${problems.length} problem(s) across ${scanned} items:\n`);
  for (const p of [...new Set(problems)]) console.error(`  ✗ ${p}`);
  console.error(
    "\nAn invented letter, call or notice must not carry a real organisation's name.\n" +
      "Real places as SETTING are fine and are not flagged.\n",
  );
  process.exit(1);
}

console.log(`real-entity gate: ${scanned} items clean (no invented text attributed to a named organisation)`);
