import test from "node:test";
import assert from "node:assert/strict";
import {createEgg,applyCare,getReadiness,beginHatch,completeHatch,FAMILIES,STAGES} from "../simulation/egg-engine.mjs";
import {getJournalView} from "../simulation/egg-journal.mjs";
const plans={
 balanced:["warm","sing","rest","explore","play","story","observe","comfort"],
 nurturing:["warm","comfort","sing","rest","story"],
 curious:["explore","play","story","rest","warm"],
 quiet:["rest","observe","comfort","story","warm"],
 sparse:["warm","rest","story","explore"],
 repetitive:["sing","sing","sing","rest","warm","explore","play"]
};
function run(seed,actions,limit=500){
 let s=createEgg(seed),history=[s.stage],seen=new Set([s.stage]);
 for(let i=0;i<limit&&s.hatch.status==="incubating";i++){
  s=applyCare(s,actions[i%actions.length]);
  if(!seen.has(s.stage)){seen.add(s.stage);history.push(s.stage)}
 }
 return {s,history};
}
test("Stage 1: Dormant initial state, no premature hatch",()=>{
 for(let seed=0;seed<100;seed++){
  const s=createEgg(seed);assert.equal(s.stage,"dormant");assert.equal(s.hatch.status,"incubating");assert.equal(getReadiness(s).ready,false);
  assert.equal(s.journal.length,0);assert.equal(s.turn,0);
 }
});
test("Stage 2: Awakening follows meaningful varied care",()=>{
 for(let seed=0;seed<100;seed++){
  const {history}=run(seed,plans.balanced);assert.ok(history.includes("awakening"),`seed ${seed}`);
 }
});
test("Stage 3: Forming records preference and narrative milestones",()=>{
 for(let seed=0;seed<100;seed++){
  const {s,history}=run(seed,plans.balanced);
  assert.ok(history.includes("forming"),`seed ${seed}`);
  assert.ok(s.development.milestones.includes("stage-forming"));
  assert.ok(s.journal.some(e=>e.id==="first-preference"));
 }
});
test("Stage 4: Emergence requires developed temperament",()=>{
 for(let seed=0;seed<100;seed++){
  const {s,history}=run(seed,plans.balanced);
  assert.ok(history.includes("emergence"),`seed ${seed}`);
  assert.ok(s.development.milestones.includes("stage-emergence"));
  assert.ok(Object.values(s.personality).filter(v=>v>=6).length>=3);
 }
});
test("Stage 5: hatching locks family and preserves birth record",()=>{
 for(let seed=0;seed<100;seed++){
  let {s}=run(seed,plans.balanced);
  assert.equal(s.hatch.status,"ready");
  assert.ok(FAMILIES.includes(s.hatch.family));
  const record=JSON.stringify(s.hatch.birthRecord);
  s=beginHatch(s);assert.equal(s.hatch.status,"hatching");
  s=completeHatch(s);assert.equal(s.hatch.status,"hatched");
  assert.equal(JSON.stringify(s.hatch.birthRecord),record);
  assert.deepEqual(completeHatch(s),s);
  assert.deepEqual(applyCare(s,"warm"),s);
 }
});
test("All stages are ordered and never regress across strategies",()=>{
 for(const [name,actions] of Object.entries(plans))for(let seed=0;seed<60;seed++){
  const {s,history}=run(seed,actions);
  assert.deepEqual(history,STAGES,`${name} seed ${seed}`);
  assert.equal(s.hatch.status,"ready",`${name} seed ${seed}`);
 }
});
test("Save/reload: JSON serialization produces identical continuation",()=>{
 for(let seed=0;seed<100;seed++){
  const actions=plans.balanced;let a=createEgg(seed);
  for(let i=0;i<20;i++)a=applyCare(a,actions[i%actions.length]);
  let b=JSON.parse(JSON.stringify(a));
  for(let i=20;i<100&&a.hatch.status==="incubating";i++){
   a=applyCare(a,actions[i%actions.length]);b=applyCare(b,actions[i%actions.length]);
  }
  assert.deepEqual(a,b,`seed ${seed}`);
 }
});
test("Journal: milestone IDs unique and no premature family revelation",()=>{
 for(let seed=0;seed<100;seed++){
  const {s}=run(seed,plans.balanced);
  assert.equal(new Set(s.journal.map(e=>e.id)).size,s.journal.length);
  const view=getJournalView(s);
  assert.deepEqual(view.map(x=>x.section),["observations","milestones","personality","memories","mysteries"]);
  const prose=view.flatMap(x=>x.entries).map(e=>e.description).join(" ").toLowerCase();
  for(const family of FAMILIES)assert.ok(!prose.includes(family),`family leaked: ${family}`);
 }
});
