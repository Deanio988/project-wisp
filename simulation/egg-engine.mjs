/* Project Wisp formative egg simulation v2.
 * Pure, deterministic, UI-independent module. No storage or timers.
 * Usage: import { createEgg, applyCare, migrateLegacy, getReadiness } from "./simulation/egg-engine.mjs";
 */
export const FAMILIES=Object.freeze(["mossling","glimlet","mistril","pebblin"]);
export const TRAITS=Object.freeze(["curiosity","sociability","calm","courage","affection","playfulness"]);
export const STAGES=Object.freeze(["dormant","awakening","forming","emergence"]);
export const ACTIONS=Object.freeze({
 warm:{traits:{affection:3,calm:1},needs:{comfort:9,security:5,energy:-1},family:{glimlet:2,pebblin:1}},
 sing:{traits:{sociability:3,playfulness:1},needs:{stimulation:6,comfort:2},family:{glimlet:2,mistril:1}},
 rest:{traits:{calm:3,affection:1},needs:{energy:10,stimulation:-7,comfort:3},family:{mistril:2,pebblin:1}},
 explore:{traits:{curiosity:3,courage:2},needs:{stimulation:7,energy:-5},family:{mossling:3,pebblin:1}},
 play:{traits:{playfulness:3,courage:1},needs:{stimulation:8,energy:-6},family:{glimlet:2,mossling:1}},
 story:{traits:{curiosity:2,sociability:2},needs:{comfort:4,stimulation:3},family:{mistril:2,mossling:1}},
 observe:{traits:{curiosity:1,calm:1},needs:{stimulation:-2,comfort:2},family:{mossling:1}},
 comfort:{traits:{affection:2,calm:2},needs:{security:8,comfort:8},family:{pebblin:2,mistril:1}}
});
const clamp=(x,min=0,max=100)=>Math.max(min,Math.min(max,Number.isFinite(x)?x:min));
const hash=(value)=>{let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function rng(seed){let x=seed>>>0;return ()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
const blank=keys=>Object.fromEntries(keys.map(k=>[k,0]));
const addJournal=(s,id,category,text)=>{if(!s.journal.some(e=>e.id===id))s.journal.push({id,category,text,turn:s.turn})};
function deriveGenetics(seed){const next=rng(seed);return {sensitivity:next(),adaptability:next(),independence:next(),affinities:Object.fromEntries(FAMILIES.map(f=>[f,next()]))}}
export function createEgg(seed){
 if(!Number.isSafeInteger(seed)||seed<0)throw new TypeError("Seed must be a non-negative safe integer");
 return {schemaVersion:2,seed,id:"egg-"+seed,stage:"dormant",turn:0,genetics:deriveGenetics(seed),
 personality:blank(TRAITS),needs:{comfort:60,energy:65,stimulation:35,security:50},
 preferences:blank(Object.keys(ACTIONS)),development:{experience:0,activityCounts:blank(Object.keys(ACTIONS)),familyInfluence:blank(FAMILIES),milestones:[],familyEvents:blank(FAMILIES)},
 journal:[],events:[],hatch:{status:"incubating",family:null,birthRecord:null}};
}
const diversity=s=>Object.values(s.development.activityCounts).filter(n=>n>0).length;
const developed=s=>TRAITS.filter(t=>s.personality[t]>=6).length;
const preferenceEstablished=s=>Object.values(s.preferences).some(n=>Math.abs(n)>=3);
const conditions=s=>({
 experience:s.development.experience>=18,
 diversity:diversity(s)>=3,
 personality:developed(s)>=3,
 preference:preferenceEstablished(s),
 comfort:s.needs.comfort>=35&&s.needs.security>=35
});
export function getReadiness(s){const c=conditions(s);return {stage:s.stage,conditions:c,ready:s.stage==="emergence"&&Object.values(c).every(Boolean)}}
function transition(s){
 const xp=s.development.experience,d=diversity(s),t=developed(s);
 let target="dormant";
 if(xp>=7&&d>=2)target="awakening";
 if(xp>=18&&d>=3&&preferenceEstablished(s))target="forming";
 if(xp>=38&&d>=4&&t>=3)target="emergence";
 if(STAGES.indexOf(target)>STAGES.indexOf(s.stage)){
  for(let i=STAGES.indexOf(s.stage)+1;i<=STAGES.indexOf(target);i++){
   const stage=STAGES[i];s.stage=stage;s.development.milestones.push("stage-"+stage);
   addJournal(s,"stage-"+stage,"milestone",({awakening:"The egg is beginning to recognise familiar care.",forming:"Its individual temperament is becoming clearer.",emergence:"The shell is changing. Something is almost ready."})[stage]);
  }
 }
}
function familyFor(s){
 const maxCount=Math.max(1,...Object.values(s.development.activityCounts));
 const scores=FAMILIES.map(f=>{
  const genetic=s.genetics.affinities[f];
  const care=clamp(s.development.familyInfluence[f]/(maxCount*3),0,1);
  const events=clamp(s.development.familyEvents[f]/(maxCount*2),0,1);
  return {family:f,score:.45*genetic+.35*care+.20*events,tie:hash(s.seed+":"+f)};
 });
 scores.sort((a,b)=>b.score-a.score||a.tie-b.tie);
 return scores[0].family;
}
export function applyCare(original,action){
 if(!ACTIONS[action])throw new RangeError("Unknown care action");
 if(original?.schemaVersion!==2)throw new TypeError("Expected v2 egg save");
 const s=structuredClone(original);
 if(s.hatch.status!=="incubating")return s;
 const a=ACTIONS[action];s.turn++;
 const count=s.development.activityCounts[action];
 const multiplier=count>=5?.45:count>=2?.7:1;
 const energyFactor=s.needs.energy<20&&action!=="rest"&&action!=="comfort"?.65:1;
 const gain=multiplier*energyFactor;
 for(const [t,value] of Object.entries(a.traits))s.personality[t]=clamp(s.personality[t]+value*gain);
 for(const [n,value] of Object.entries(a.needs))s.needs[n]=clamp(s.needs[n]+value*(.5+s.genetics.sensitivity));
 s.development.activityCounts[action]++;
 s.development.experience+=gain*(1+s.genetics.adaptability*.25);
 s.preferences[action]=clamp(s.preferences[action]+(s.needs.comfort>=30?1:-1)*gain,-20,20);
 for(const [f,value] of Object.entries(a.family)){s.development.familyInfluence[f]+=value*gain;if(s.development.activityCounts[action]===1)s.development.familyEvents[f]+=value}
 s.events.push({id:"care-"+s.turn,action,turn:s.turn});
 if(s.events.length>200)s.events=s.events.slice(-200);
 if(s.turn===1)addJournal(s,"first-care","memory","You cared for the egg for the first time.");
 if(preferenceEstablished(s))addJournal(s,"first-preference","observation","The egg is beginning to show a preference for familiar activities.");
 transition(s);
 // A gentle recovery floor prevents exhausted or uncomfortable eggs from deadlocking.
 if(s.turn%8===0){s.needs.energy=clamp(s.needs.energy+12);s.needs.comfort=clamp(s.needs.comfort+8);s.needs.security=clamp(s.needs.security+8)}
 const r=getReadiness(s);
 if(r.ready){
  const family=familyFor(s);
  s.hatch={status:"ready",family,birthRecord:{
   id:s.id,seed:s.seed,family,personality:{...s.personality},genetics:structuredClone(s.genetics),
   preferences:{...s.preferences},milestones:[...s.development.milestones],turn:s.turn
  }};
  addJournal(s,"hatch-ready","milestone","The egg gives a new, steady rhythm. Something is about to begin.");
 }
 return s;
}
export function beginHatch(original){
 const s=structuredClone(original);if(s.hatch.status==="ready")s.hatch.status="hatching";return s;
}
export function completeHatch(original){
 const s=structuredClone(original);if(s.hatch.status==="hatching")s.hatch.status="hatched";return s;
}
export function migrateLegacy(old,seed){
 const s=createEgg(seed);
 if(!old||typeof old!=="object")return s;
 s.needs.comfort=clamp(old.warmth==null?50:Number(old.warmth));
 s.needs.security=clamp(old.trust==null?0:Number(old.trust));
 for(const t of TRAITS)s.personality[t]=clamp(Number(old.traits?.[t])||0);
 // Legacy actions are not reconstructed: unknown experiences must not be invented.
 if(old.hatched===true){
  const family="mossling";s.stage="emergence";
  s.hatch={status:"hatched",family,birthRecord:{id:s.id,seed:s.seed,family,personality:{...s.personality},legacy:true}};
  addJournal(s,"legacy-hatch","milestone","Your companion's earlier story has been preserved.");
 }
 return s;
}
