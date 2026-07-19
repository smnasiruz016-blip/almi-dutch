// Real-entity gate — blocks invented messages attributed to real organisations.
//
// This exists because the failure it catches already happened here. The bank shipped a
// municipal letter signed "Gemeente Almere", another signed "Gemeente Utrecht", a phone
// call from "de gemeente Middelburg", and seven named businesses — three of which turned
// out to be real practices (huisartsenpraktijk De Linde, tandartspraktijk Groenewoud,
// tandartspraktijk Bloemhof). Every one of them survived review, because the surrounding
// facts were right. That is the whole danger: a fabricated document reads as credible
// precisely when nothing else about it is wrong.
//
// Two rules, matching the two ways it went wrong:
//
//   CLASS 1 — a real public body named as the AUTHOR of invented communication.
//   Keyed on "Gemeente <Name>" rather than a list of the 342 municipalities, because a
//   list goes stale the moment two merge, and because the pattern catches names no list
//   would have. Crucially it distinguishes attribution from setting: "Gemeente Almere"
//   signs a letter, "in Almere" is where someone lives. Only the first is a lie.
//
//   CLASS 2 — a named business as the author. Dutch organisation naming is conventional
//   enough ("De …", "Het …") that an invented name collides with a real one by default,
//   so the rule is not "invent carefully" but DO NOT NAME AT ALL: use the generic
//   category (de huisartsenpraktijk, de apotheek, de supermarkt). A denylist of real
//   insurers, banks, telecoms and chains backs it up for names that skip the category
//   noun entirely.
//
// What this gate deliberately does NOT flag: a real place as a setting ("centrum van
// Leiden"), a real station in a transport announcement ("Amsterdam Centraal"), and a
// public body named factually in a knowledge question ("Wat doet de Belastingdienst?").
// Those are accurate, not misattributed, and stripping them would only make the content
// less true to life.

import fs from "node:fs";
import path from "node:path";

const ITEMS_DIR = path.join(process.cwd(), "src", "data", "items");
const problems = [];

// ---- CLASS 1: a municipality named as an actor -----------------------------------
const MUNICIPALITY_AS_ACTOR = /\b[Gg]emeente\s+([A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+)?)/g;

// ---- CLASS 2: category noun followed by a proper name -----------------------------
const CATEGORY_NOUNS = [
  "huisartsenpraktijk", "tandartspraktijk", "praktijk", "apotheek", "ziekenhuis",
  "woningcorporatie", "verhuurder", "supermarkt", "basisschool", "school",
  "taalschool", "sportschool", "sportclub", "bibliotheek", "buurthuis",
  "uitzendbureau", "verzekeraar", "zorgverzekeraar", "bank",
];
const NAMED_BUSINESS = new RegExp(
  `\\b(${CATEGORY_NOUNS.join("|")})\\s+((?:De|Het|'t)\\s+[A-Z][a-zà-ÿ]+|[A-Z][a-zà-ÿ]{2,})`,
  "g",
);

// ---- CLASS 2b: real commercial brands, named with or without a category noun -------
// Helvetia class: a real insurer signing an invented letter. Kept short and concrete —
// this is a backstop for names that skip the category noun, not a census of Dutch trade.
const BRAND_DENYLIST = [
  // insurers
  "Achmea", "Zilveren Kruis", "Menzis", "VGZ", "ONVZ", "Univé", "Aegon",
  "Nationale-Nederlanden", "Interpolis", "FBTO", "Centraal Beheer", "Ditzo", "Anderzorg",
  "Helvetia", "Allianz",
  // banks
  "Rabobank", "ABN AMRO", "Bunq", "Knab", "Triodos", "RegioBank", "Volksbank",
  // telecom / energy
  "KPN", "Vodafone", "T-Mobile", "Odido", "Ziggo", "Tele2", "Simyo",
  "Eneco", "Vattenfall", "Essent", "Greenchoice",
  // retail / delivery
  "Albert Heijn", "Jumbo", "Lidl", "Aldi", "Ekoplaza", "HEMA", "Bijenkorf", "Blokker",
  "Kruidvat", "Etos", "Gamma", "Praxis", "Coolblue", "MediaMarkt", "Zalando",
  "Marktplaats", "PostNL", "Thuisbezorgd",
];

let scanned = 0;
for (const file of fs.readdirSync(ITEMS_DIR).filter((f) => f.endsWith(".json"))) {
  const raw = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), "utf8"));
  const items = raw.items ?? raw;
  items.forEach((item, i) => {
    scanned++;
    // Search the payload only: that is where passages, transcripts and stimuli live.
    const text = JSON.stringify(item.payload ?? {});
    const where = `${file}[${i}] "${item.title}"`;

    for (const m of text.matchAll(MUNICIPALITY_AS_ACTOR)) {
      problems.push(
        `${where}: names a municipality as an actor — "gemeente ${m[1]}". ` +
          `Use "de gemeente"; a real municipality must never author invented text.`,
      );
    }
    for (const m of text.matchAll(NAMED_BUSINESS)) {
      problems.push(
        `${where}: names a business — "${m[1]} ${m[2]}". Use the bare category ("de ${m[1]}").`,
      );
    }
    for (const brand of BRAND_DENYLIST) {
      if (text.includes(brand)) {
        problems.push(`${where}: names a real company — "${brand}". Use a generic category.`);
      }
    }
  });
}

if (problems.length) {
  console.error(`\nREAL-ENTITY GATE FAILED — ${problems.length} problem(s) across ${scanned} items:\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error(
    "\nAn invented letter, call or notice must not carry a real organisation's name.\n" +
      "Real places as SETTING are fine and are not flagged.\n",
  );
  process.exit(1);
}

console.log(`real-entity gate: ${scanned} items clean (no invented text attributed to a named organisation)`);
