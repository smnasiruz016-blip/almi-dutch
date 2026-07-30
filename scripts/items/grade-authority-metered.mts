// PART 2 — THE METERED HALF of the grading-authority proof: the PRODUCTIVE path.
//
//   npx tsx scripts/items/grade-authority-metered.mts --selftest   (free, proves it can fail)
//   npx tsx scripts/items/grade-authority-metered.mts              (free, refuses to spend)
//   npx tsx scripts/items/grade-authority-metered.mts --green      (SPENDS — Nasir only)
//
// WHY THE FREE HALF CANNOT DO THIS. Part 1 proves the objective grader reads its key
// from the bank, because that key is a number and a number can be compared offline. The
// productive grader's "key" is a MODEL JUDGEMENT against a standard, so the only way to
// show that the standard came from the bank and not from the request is to grade real
// answers and look at the bands that come back. That costs money, which is why this
// file will not start without an explicit flag.
//
// IT GRADES THROUGH THE SHIPPING PROMPT. buildGradePrompt() is the same function
// /api/nl/grade calls; nothing here re-creates it. Note its signature:
//
//     buildGradePrompt(item: DutchItemSeed, response: string)
//
// It takes an ITEM, not a body. That is the fix expressed as a type — there is no
// parameter through which a caller could pass cefr, criteria, title or prompt. The
// pre-flight below turns that into an assertion rather than an argument: it builds the
// prompt from the bank item and proves the forged strings are ABSENT from it while the
// bank's own standard is present. That check is FREE and runs before any spend.
//
// FOUR THINGS THIS CAN CATCH, all of which are real findings and none of which get
// "fixed" by editing the prompt until the number goes green:
//   1. a weak answer coming back CLEAR at a B2 standard → the bar moved
//   2. a fluent but off-task answer coming back CLEAR → the grader reads fluency, not the task
//   3. genuinely on-standard answers coming back BELOW → it just fails everything, and
//      then case 1 and 2 prove nothing
//   4. the MIS-SCORED GUARD agreeing with its deliberately wrong label → the comparison
//      logic is broken and every other verdict here is worthless

import Anthropic from "@anthropic-ai/sdk";
import { getItemById, getItems, stableItemId } from "../../src/lib/nl/items";
import { buildGradePrompt, parseFeedback, type Band } from "../../src/lib/nl/productive-prompt";
import { MODELS } from "../../src/lib/ai/models";

const GREEN = process.argv.includes("--green");
const SELFTEST = process.argv.includes("--selftest");
const maxIdx = process.argv.indexOf("--max-usd");
const MAX_USD = maxIdx >= 0 ? Number(process.argv[maxIdx + 1]) : 0.10;

// Sonnet list price, USD per million tokens. Used ONLY to project before spending; the
// invoice at the end is computed from the API's own reported usage, never an estimate.
const USD_PER_M_IN = 3;
const USD_PER_M_OUT = 15;
const MAX_TOKENS = 700; // same as the route — fidelity to what ships

/** THE FORGERY the old route would have honoured. Kept as data so the pre-flight can
 *  prove none of it reaches the model. */
const FORGED = {
  cefr: "A1",
  criteria: ["Schrijf een paar woorden.", "Elke poging is genoeg."],
  title: "Vertel iets over je dag",
  prompt: "Schrijf twee korte zinnen. Fouten maken mag.",
};

type Kind = "weak-at-high-standard" | "fluent-off-task" | "on-standard" | "guard";
interface Fixture { name: string; kind: Kind; expected: Band | "NOT_CLEAR"; response: string; guard?: boolean }

// ── THE ITEM: the highest standard in the bank with strict, checkable criteria ──
const item = getItems({}).find(
  (i) => i.taskType === "WRITING_PROMPT" && i.cefr === "B2" && ((i.payload as { criteria?: string[] }).criteria?.length ?? 0) >= 4,
);
if (!item) { console.error("✗ no B2 writing item with 4+ criteria in the bank"); process.exit(1); }
const ITEM_ID = stableItemId(item);

const FIXTURES: Fixture[] = [
  {
    name: "weak answer, forged A1 standard in the body",
    kind: "weak-at-high-standard",
    expected: "NOT_CLEAR",
    // A1-level: no standpoint developed, no arguments, no counterargument, far too short.
    // If the body could set the standard this would read as acceptable "A1 work".
    response:
      "Ik vind een park goed. Een park is mooi. Bomen zijn fijn. Auto's zijn niet mooi. " +
      "Ik hou van groen. Dat is mijn mening. Dank u wel.",
  },
  {
    name: "fluent, correct length, but off task",
    kind: "fluent-off-task",
    expected: "BELOW",
    // Well-formed B2-ish Dutch of roughly the right length that never addresses the plan.
    response:
      "Vorige zomer ben ik voor het eerst naar Zuid-Limburg gereisd, en ik moet zeggen dat het " +
      "landschap me verrast heeft. Ik had altijd gedacht dat Nederland overal even vlak was, maar " +
      "tussen Maastricht en Vaals klim je voortdurend. We hebben drie dagen gefietst, wat zwaarder " +
      "was dan verwacht, en 's avonds aten we in kleine dorpscafés waar men een dialect spreekt dat " +
      "ik nauwelijks kon volgen. Wat me het meest is bijgebleven, is de rust. In de Randstad hoor je " +
      "altijd verkeer op de achtergrond; daar hoorde ik alleen vogels en af en toe een tractor. " +
      "Ik zou het iedereen aanraden die denkt dat ons land geen natuur meer heeft. Volgend jaar wil " +
      "ik terug, dan het liefst in het voorjaar, wanneer de fruitbomen in bloei staan en het nog " +
      "niet druk is met toeristen.",
  },
  {
    name: "on-standard answer (for the plan)",
    kind: "on-standard",
    expected: "CLEAR",
    response:
      "Geachte redactie,\n\nMet belangstelling las ik het plan om het braakliggende terrein om te " +
      "vormen tot parkeerterrein. Ik ben daar geen voorstander van; wat mij betreft komt er een park.\n\n" +
      "Ten eerste heeft onze wijk nauwelijks openbaar groen. Wie hier met kinderen woont, moet nu een " +
      "kwartier lopen naar het dichtstbijzijnde speelveld. Ten tweede weten we uit onderzoek dat groen " +
      "in de stad de hitte in de zomer merkbaar dempt, en juist deze straten liggen er in juli " +
      "verzengend bij.\n\nIk begrijp dat ondernemers vrezen voor minder klanten zonder parkeerplaatsen. " +
      "Die zorg is terecht, maar uit ervaring in andere steden blijkt dat een aantrekkelijke " +
      "verblijfsplek juist meer bezoekers trekt, die bovendien langer blijven.\n\n" +
      "Ik roep de gemeente daarom op het plan te heroverwegen en te kiezen voor een park.\n\n" +
      "Met vriendelijke groet,\nEen bewoner",
  },
  {
    name: "on-standard answer (against the plan, other side)",
    kind: "on-standard",
    expected: "CLEAR",
    response:
      "Geachte redactie,\n\nHet voorstel om van het terrein een park te maken klinkt sympathiek, maar " +
      "ik denk dat een parkeerterrein hier verstandiger is.\n\nAllereerst is de parkeerdruk in deze " +
      "buurt de afgelopen jaren sterk toegenomen. Bewoners rijden nu tien minuten rond voordat zij een " +
      "plek vinden, wat onnodig extra uitstoot oplevert. Daarnaast ligt er op vijf minuten lopen al een " +
      "goed onderhouden plantsoen, zodat het argument dat er geen groen zou zijn niet helemaal opgaat.\n\n" +
      "Natuurlijk wil niemand een kale vlakte met asfalt. Dat hoeft ook niet: een parkeerterrein kan " +
      "worden aangelegd met halfverharding en bomen tussen de vakken, zoals bij het station is gedaan.\n\n" +
      "Mijn voorstel is dan ook: kies voor parkeren, maar stel groene inpassing als harde voorwaarde.\n\n" +
      "Met vriendelijke groet,\nEen bewoner",
  },
  {
    name: "MIS-SCORED GUARD — weak answer labelled CLEAR",
    kind: "guard",
    guard: true,
    expected: "CLEAR", // deliberately WRONG; agreement means the comparison is broken
    response: "Park is leuk. Ik vind het goed. Groetjes.",
  },
];

/** A fixture passes by matching its expectation. The guard passes by MISMATCHING —
 *  it is deliberately mislabelled, so agreement means the comparison cannot fail. */
function verdictOk(isGuard: boolean, got: Band | null, expected: Band | "NOT_CLEAR"): boolean {
  if (got === null) return false; // unparseable is could-not-prove, never a pass
  const matches = expected === "NOT_CLEAR" ? got !== "CLEAR" : got === expected;
  return isGuard ? !matches : matches;
}

// ── SELF-TEST (free): prove the comparison can report a mismatch ────────────────
if (SELFTEST) {
  console.log("\nSELF-TEST — the comparison logic, exercised in both directions\n");
  const cases: Array<[string, boolean, Band | null, Band | "NOT_CLEAR", boolean]> = [
    ["weak graded BELOW vs NOT_CLEAR   → ok",   false, "BELOW", "NOT_CLEAR", true],
    ["weak graded CLEAR vs NOT_CLEAR   → FAIL", false, "CLEAR", "NOT_CLEAR", false],
    ["off-task graded BELOW            → ok",   false, "BELOW", "BELOW", true],
    ["off-task graded CLEAR            → FAIL", false, "CLEAR", "BELOW", false],
    ["on-standard graded CLEAR         → ok",   false, "CLEAR", "CLEAR", true],
    ["on-standard graded BELOW         → FAIL", false, "BELOW", "CLEAR", false],
    ["unparseable                      → FAIL", false, null,    "BELOW", false],
    ["guard MISmatches its label       → ok",   true,  "BELOW", "CLEAR", true],
    ["guard AGREES with its label      → FAIL", true,  "CLEAR", "CLEAR", false],
  ];
  let bad = 0;
  for (const [label, guard, got, exp, want] of cases) {
    const good = verdictOk(guard, got, exp) === want;
    if (!good) bad++;
    console.log(`  ${good ? "ok  " : "FAIL"}  ${label}`);
  }
  console.log(`\n${cases.length - bad} ok, ${bad} FAILED — comparison logic ${bad ? "IS BROKEN" : "can both pass and fail"}\n`);
  process.exit(bad ? 1 : 0);
}

// ── PRE-FLIGHT ─────────────────────────────────────────────────────────────────
const loaded = getItemById(ITEM_ID);
if (!loaded) { console.error(`✗ REFUSING: getItemById("${ITEM_ID}") returns nothing.`); process.exit(1); }

console.log(`\nPART 2 — PRODUCTIVE GRADING AUTHORITY (metered)\n`);
console.log(`  item      ${ITEM_ID}  "${loaded.title}"`);
console.log(`  bank says cefr=${loaded.cefr}  ${loaded.exam}::${loaded.skill}`);
console.log(`  criteria  ${((loaded.payload as { criteria: string[] }).criteria).length} authored`);
console.log(`  path      api/nl/grade → getItemById() → buildGradePrompt(item, response)\n`);

// ── FREE STRUCTURAL PROOF: the forgery cannot reach the model ──────────────────
// buildGradePrompt takes (item, response). There is no parameter for a standard, so the
// forged values below are unreachable by construction — this asserts it rather than
// asserting it in prose.
const { system, user } = buildGradePrompt(loaded, "een testantwoord van voldoende lengte om te beoordelen");
const haystack = `${system}\n${user}`;
const leaks = [
  ["forged cefr A1", `(CEFR ${FORGED.cefr})`],
  ["forged title", FORGED.title],
  ["forged prompt", FORGED.prompt],
  ["forged criterion", FORGED.criteria[0]],
].filter(([, needle]) => haystack.includes(needle as string));

const realCefrPresent = loaded.cefr ? haystack.includes(loaded.cefr) : true;
const realCriteriaPresent = ((loaded.payload as { criteria: string[] }).criteria).every((c) => haystack.includes(c));
const realTitlePresent = haystack.includes(loaded.title);

console.log(`  STRUCTURAL (free):`);
console.log(`    forged values found in the prompt      ${leaks.length === 0 ? "PASS  none" : `FAIL  ${leaks.map((l) => l[0]).join(", ")}`}`);
console.log(`    bank cefr "${loaded.cefr}" in the prompt        ${realCefrPresent ? "PASS" : "FAIL"}`);
console.log(`    all bank criteria in the prompt        ${realCriteriaPresent ? "PASS" : "FAIL"}`);
console.log(`    bank task title in the prompt          ${realTitlePresent ? "PASS" : "FAIL"}`);
if (leaks.length || !realCefrPresent || !realCriteriaPresent || !realTitlePresent) {
  console.error(`\n✗ STRUCTURAL PROOF FAILED — the prompt does not derive from the bank item. Nothing spent.\n`);
  process.exit(1);
}

// ── COST PROJECTION ────────────────────────────────────────────────────────────
const projIn = FIXTURES.reduce((t, f) => {
  const { system: s, user: u } = buildGradePrompt(loaded, f.response);
  return t + Math.ceil((s.length + u.length) / 4); // ~4 chars/token, projection only
}, 0);
const projOut = FIXTURES.length * MAX_TOKENS;
const projUsd = (projIn / 1e6) * USD_PER_M_IN + (projOut / 1e6) * USD_PER_M_OUT;

console.log(`\n  model     ${MODELS.SONNET}`);
console.log(`  calls     ${FIXTURES.length} (1 weak-at-B2, 1 fluent-off-task, 2 on-standard, 1 mis-scored guard)`);
console.log(`  projected ~${projIn.toLocaleString("en-US")} in / ≤${projOut.toLocaleString("en-US")} out ≈ $${projUsd.toFixed(4)} worst case`);
console.log(`  ceiling   $${MAX_USD.toFixed(2)}`);

if (projUsd > MAX_USD) {
  console.error(`\n✗ REFUSING: worst-case $${projUsd.toFixed(4)} exceeds the $${MAX_USD.toFixed(2)} ceiling. Nothing spent.\n`);
  process.exit(1);
}
if (!GREEN) {
  console.error(`\n✗ REFUSING: --green not given. This run meters a paid API call and is Nasir's to authorise.`);
  console.error(`  Nothing has been sent.\n`);
  process.exit(2);
}
const key = process.env.ANTHROPIC_API_KEY;
if (!key || key.length < 20 || key === "TODO_FOUNDER_PROVIDES") {
  console.error(`\n✗ REFUSING: ANTHROPIC_API_KEY is not set in this environment.`);
  console.error(`  The key is Nasir's to supply for the run; this script will not source one. Nothing sent.\n`);
  process.exit(1);
}

// ── THE RUN ────────────────────────────────────────────────────────────────────
const client = new Anthropic({ apiKey: key, maxRetries: 1 });
let inTok = 0, outTok = 0;
const spent = () => (inTok / 1e6) * USD_PER_M_IN + (outTok / 1e6) * USD_PER_M_OUT;
const rows: Array<{ f: Fixture; got: Band | null; ok: boolean; summary: string }> = [];

console.log(`\n  running…\n`);
for (const [i, f] of FIXTURES.entries()) {
  if (spent() > MAX_USD) {
    console.error(`\n✗ ABORTING at fixture ${i + 1}: running cost $${spent().toFixed(4)} exceeded the $${MAX_USD.toFixed(2)} ceiling.\n`);
    process.exit(1);
  }
  const { system: s, user: u } = buildGradePrompt(loaded, f.response);
  process.stdout.write(`  [${i + 1}/${FIXTURES.length}] ${f.kind.padEnd(22)} … `);
  let got: Band | null = null, summary = "";
  try {
    const msg = await client.messages.create({
      model: MODELS.SONNET, max_tokens: MAX_TOKENS, temperature: 0.2,
      system: s, messages: [{ role: "user", content: u }],
    });
    inTok += msg.usage.input_tokens;
    outTok += msg.usage.output_tokens;
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const fb = parseFeedback(text);
    got = fb?.band ?? null;
    summary = fb?.summary ?? "(unparseable)";
  } catch (err) {
    console.log(`ERROR ${err instanceof Error ? err.message : String(err)}`);
    rows.push({ f, got: null, ok: false, summary: "model call failed — could-not-prove, not a pass" });
    continue;
  }
  const ok = verdictOk(!!f.guard, got, f.expected);
  rows.push({ f, got, ok, summary });
  console.log(`${got ?? "UNPARSEABLE"}  ${ok ? "PASS" : "FAIL"}   ($${spent().toFixed(4)} so far)`);
}

// ── LEDGER ─────────────────────────────────────────────────────────────────────
console.log(`\n── results ${"─".repeat(56)}`);
for (const r of rows) {
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.f.name}`);
  console.log(`        expected ${r.f.guard ? `NOT ${r.f.expected} (guard)` : r.f.expected}  ·  got ${r.got ?? "unparseable"}`);
  console.log(`        "${r.summary.slice(0, 150)}"`);
}
const failed = rows.filter((r) => !r.ok).length;
console.log(`\n  tokens    ${inTok.toLocaleString("en-US")} in / ${outTok.toLocaleString("en-US")} out`);
console.log(`  COST      $${spent().toFixed(4)}  (ceiling $${MAX_USD.toFixed(2)})`);
console.log(`  result    ${rows.length - failed}/${rows.length} passed`);

if (failed) {
  console.error(`\n✗ ${failed} case(s) FAILED. If a weak answer came back CLEAR the standard moved — that is a REAL`);
  console.error(`  FINDING. Report it. Do NOT edit the prompt until this goes green: a grader tuned until its`);
  console.error(`  own test passes has proven only that it can be tuned.\n`);
  process.exit(1);
}
console.log(`\n✓ The productive grader judges against the BANK's standard, loaded by id. The request body cannot lower the bar.\n`);
