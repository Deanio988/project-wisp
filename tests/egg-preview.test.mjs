import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEgg,applyCare,beginHatch,completeHatch} from "../simulation/egg-engine.mjs";
const html=readFileSync(new URL("../preview/index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../preview/sanctuary.mjs",import.meta.url),"utf8");
test("preview contains all accessible core controls",()=>{
 for(const a of ["warm","sing","rest","explore","play","story","observe","comfort"])assert.ok(html.includes('data-care="'+a+'"'));
 for(const id of ["stage","story","journal","skip-hatch","hatch-notice","reset","family-symbol"])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('aria-live="polite"'));
});
test("preview uses isolated save and does not touch live save key",()=>{
 assert.ok(js.includes("project-wisp-egg-preview-v2"));
 assert.ok(!js.includes("project-wisp-v1"));
});
test("preview imports the shared engine and journal",()=>{
 assert.ok(js.includes('from "../simulation/egg-engine.mjs"'));
 assert.ok(js.includes('from "../simulation/egg-journal.mjs"'));
 assert.ok(js.includes("getJournalView(state)"));
});
test("hatching is automatic, recoverable and skippable",()=>{
 assert.ok(js.includes("progressHatch()"));
 assert.ok(js.includes('state.hatch.status==="hatching"'));
 assert.ok(js.includes('addEventListener("click",finishHatch)'));
 assert.ok(js.includes("prefers-reduced-motion"));
 let s=createEgg(19);const actions=["warm","sing","rest","explore","play","story","comfort","observe"];
 for(let i=0;i<500&&s.hatch.status==="incubating";i++)s=applyCare(s,actions[i%actions.length]);
 assert.equal(s.hatch.status,"ready");
 s=beginHatch(s);
 const recovered=JSON.parse(JSON.stringify(s));
 assert.equal(completeHatch(recovered).hatch.status,"hatched");
 assert.equal(completeHatch(recovered).hatch.birthRecord.family,s.hatch.family);
});
test("responsive CSS includes mobile and reduced-motion treatments",()=>{
 assert.ok(html.includes("max-width:480px"));
 assert.ok(html.includes("prefers-reduced-motion:reduce"));
 assert.ok(html.includes('data-stage="emergence"'));
});
