// REBALANCE THE TRUE/FALSE VALUE AXIS.
//
// WHY THIS EXISTS, AND WHY IT IS SEPARATE FROM degame-options.mts.
//
// De-gaming POSITION exposed a second defect underneath it. Every true/false statement
// in five sections was FALSE — 19 TF items in the bank and not one of the five flagged
// sections contained a single true statement. "Answer Niet waar to everything" scored
// 100% on all of them. While the keys were also all at one index the two defects were
// collinear and only the position one was visible; balancing position separated them
// and the value clustering stood up on its own (audit row B1v).
//
// B1v is reported at P3 on the reasoning that a value axis is usually an option ID the
// learner never sees — true for goethe and French, WRONG here. These options render as
// their own text: "Waar" / "Niet waar" IS the label on screen. For this product the
// value axis is exactly as exploitable as position, and it is fixed rather than filed.
//
// THIS ONE CANNOT BE FIXED BY PERMUTATION. Position was a presentation defect and could
// be shuffled. Truth value is a property of the CLAIM, so the only honest fix is to
// rewrite some statements so that they are genuinely true of their own passage. That is
// authoring, so every rewrite below is listed explicitly with the source sentence that
// makes it true — no rule, no transformation, nothing generated. A reviewer can check
// each one against the passage in the same file.
//
// The distractor statements are left alone: a false statement is not a defect, a bank
// of ONLY false statements is.
//
// Run this BEFORE degame-options.mts — flipping which option is correct changes the
// position distribution, so positions are rebalanced afterwards.

import fs from "node:fs";
import path from "node:path";

const ITEMS_DIR = path.join(process.cwd(), "src", "data", "items");

/** Each entry: the item to rewrite, its new statement, and the sentence in its OWN
 *  passage/transcript that makes the new statement true. `evidence` is not used by the
 *  code — it is here so the claim can be checked without opening another file. */
const REWRITES: {
  file: string;
  index: number;
  title: string;
  statement: string;
  evidence: string;
}[] = [
  // ── PROGRAMMA_I::READING — 2 of 4 become true ──
  {
    file: "nt2-i-reading-2.json", index: 1, title: "Afspraken over pauzes",
    statement: "Stelling: wie tijdens de pauze een klant helpt, pauzeert later alsnog.",
    evidence: "\"Wie op dat moment een klant helpt, pauzeert later; de pauze vervalt dus niet, maar schuift op.\"",
  },
  {
    file: "nt2-reading.json", index: 1, title: "Vrijwilligers gezocht",
    statement: "Stelling: voor dit vrijwilligerswerk moet u goed Nederlands spreken.",
    evidence: "\"U hoeft geen diploma te hebben, maar u moet wel goed Nederlands spreken.\"",
  },

  // ── PROGRAMMA_II::READING — 1 of 3 becomes true ──
  {
    file: "nt2-ii-reading-2.json", index: 7, title: "Regels voor het inleveren van opdrachten",
    statement: "Stelling: wie zich vóór de deadline ziek meldt, krijgt uitstel.",
    evidence: "\"Bent u ziek, geef dat dan door vóór de deadline; u krijgt dan uitstel.\"",
  },

  // ── INBURGERING_A2::READING — 2 of 4 become true ──
  {
    file: "inburgering-reading-2.json", index: 5, title: "Informatie over de bibliotheekpas",
    statement: "Stelling: u kunt één keer verlengen als niemand anders het boek heeft gereserveerd.",
    evidence: "\"U kunt één keer verlengen, behalve als iemand anders het boek heeft gereserveerd.\"",
  },
  {
    file: "inburgering-reading.json", index: 1, title: "Aanbieding supermarkt",
    statement: "Stelling: de aanbieding geldt ook op zaterdag.",
    evidence: "\"De aanbieding geldt van maandag tot en met zaterdag.\"",
  },

  // ── INBURGERING_B1::READING — 2 of 4 become true ──
  {
    file: "inburgering-reading-2.json", index: 8, title: "Voorwaarden van het sportabonnement",
    statement: "Stelling: om het abonnement bij een blessure te pauzeren, heeft u een verklaring van een arts nodig.",
    evidence: "\"Bij een blessure kunt u het abonnement tijdelijk pauzeren; daarvoor is een verklaring van een arts nodig.\"",
  },
  {
    file: "inburgering-reading.json", index: 9, title: "Regel in het huurcontract",
    statement: "Stelling: de huurder mag gordijnen ophangen.",
    evidence: "\"Kleine veranderingen die eenvoudig ongedaan te maken zijn, zoals het ophangen van gordijnen, zijn wel toegestaan.\"",
  },

  // ── PROGRAMMA_II::LISTENING — 2 of 4 become true ──
  {
    file: "nt2-ii-listening-2.json", index: 1, title: "Discussie over nieuwe technologie op het werk",
    statement: "Stelling: volgens de spreker nemen de systemen taken over en verandert daardoor het werk van mensen.",
    evidence: "\"Wat ik zeg is dat ze taken overnemen… verdween geen functie, maar veranderde wel wat mensen de hele dag doen.\"",
  },
  {
    file: "nt2-listening.json", index: 12, title: "Radiofragment over thuiswerken",
    statement: "Stelling: volgens het onderzoek is een combinatie van thuis en kantoor de beste oplossing.",
    evidence: "\"De ideale situatie, zo concluderen zij, is een combinatie van enkele dagen thuis en enkele dagen op kantoor.\"",
  },
];

const banks = new Map<string, any[]>();
const load = (f: string) => {
  if (!banks.has(f)) banks.set(f, JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, f), "utf8")));
  return banks.get(f)!;
};

let changed = 0;
for (const r of REWRITES) {
  const items = load(r.file);
  const it = items[r.index];
  if (!it) throw new Error(`${r.file}[${r.index}] does not exist`);
  if (it.title !== r.title) {
    // The index is a position in a file that other passes also edit. Asserting the
    // title makes a silent mis-target impossible: rewriting the WRONG item's statement
    // would produce a fluent, plausible, false question — the worst outcome here.
    throw new Error(`${r.file}[${r.index}] is "${it.title}", expected "${r.title}" — refusing to rewrite the wrong item`);
  }
  if (it.answer?.type !== "TRUE_FALSE") throw new Error(`${r.file}[${r.index}] is not TRUE_FALSE`);

  const waar = it.payload.options.indexOf("Waar");
  if (waar < 0) throw new Error(`${r.file}[${r.index}] has no "Waar" option: ${JSON.stringify(it.payload.options)}`);

  it.payload.question = r.statement;
  it.answer.correctIndex = waar;
  changed++;
  console.log(`  ✓ ${r.file}[${r.index}] ${r.title}`);
  console.log(`      → ${r.statement}`);
  console.log(`      evidence: ${r.evidence}`);
}

for (const [f, items] of banks) {
  fs.writeFileSync(path.join(ITEMS_DIR, f), JSON.stringify(items, null, 2) + "\n", "utf8");
}
console.log(`\n${changed} statement(s) rewritten to be TRUE of their own source; ${banks.size} bundle(s) written.`);
console.log("Now re-run scripts/items/degame-options.mts to rebalance POSITION.");
