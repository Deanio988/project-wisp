import test from "node:test";
import assert from "node:assert/strict";
import {createEgg,applyCare,FAMILIES} from "../simulation/egg-engine.mjs";
const strategies={
 balanced:["warm","sing","rest","explore","play","story","observe","comfort"],
 adventurous:["explore","play","story","rest","warm"],
 nurturing:["warm","comfort","sing","rest","story"],
 quiet:["rest","observe","comfort","story","warm"],
 repetitive:["sing","sing","sing","rest","warm","explore","play"],
 lowEnergy:["play","explore","play","explore","rest","comfort","warm","story"],
 minimal:["warm","rest","story","explore"]
};
test("1,000 eggs: reproducible, reachable hatching, four families",()=>{
 const counts=Object.fromEntries(FAMILIES.map(f=>[f,0]));
 const patterns=Object.keys(strategies);
 const failures=[];const lengths=[];
 for(let seed=0;seed<1000;seed++){
  const pattern=patterns[seed%patterns.length],actions=strategies[pattern];
  let state=createEgg(seed);
  for(let step=0;step<500&&state.hatch.status==="incubating";step++)state=applyCare(state,actions[step%actions.length]);
  if(state.hatch.status!=="ready"){failures.push({seed,pattern,stage:state.stage,turn:state.turn});continue}
  const family=state.hatch.family;
  counts[family]++;lengths.push(state.turn);
  assert.equal(state.hatch.birthRecord.family,family);
  const replay=JSON.parse(JSON.stringify(state));
  assert.deepEqual(replay.hatch.birthRecord,state.hatch.birthRecord);
 }
 assert.deepEqual(failures,[],JSON.stringify(failures.slice(0,10)));
 for(const family of FAMILIES)assert.ok(counts[family]>=30,`Family ${family} only occurred ${counts[family]} times`);
 console.log(JSON.stringify({total:1000,counts,minTurns:Math.min(...lengths),maxTurns:Math.max(...lengths),meanTurns:Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length)}));
});
