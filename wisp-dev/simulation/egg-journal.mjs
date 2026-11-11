/* Project Wisp narrative journal. Pure projections; never changes saved state. */
export const JOURNAL_SECTIONS=Object.freeze(["observations","milestones","personality","memories","mysteries"]);
const TRAIT_TEXT={
 curiosity:["Quietly observant","Interested in unfamiliar sounds","Eager to discover new things"],
 sociability:["Comfortable with quiet company","Responds to familiar voices","Seeks out shared moments"],
 calm:["Still learning to settle","Finds comfort in peaceful moments","A naturally tranquil presence"],
 courage:["Cautious around the unfamiliar","Growing more confident","Ready to face new experiences"],
 affection:["Slowly building a bond","Enjoys your reassuring presence","Shows a strong attachment"],
 playfulness:["Enjoys gentle amusement","Responds warmly to games","Delights in playful surprises"]
};
const ACTION_TEXT={
 warm:"Warmth seems reassuring to the egg.",
 sing:"It has begun recognising familiar melodies.",
 rest:"Quiet moments appear to help it settle.",
 explore:"It seems drawn to unfamiliar sounds and places.",
 play:"Playful attention brings a lively response.",
 story:"It listens closely when you share stories.",
 observe:"The egg appears aware of your quiet attention.",
 comfort:"Gentle reassurance helps it feel secure."
};
const titleCase=s=>s.charAt(0).toUpperCase()+s.slice(1);
function section(category){
 if(category==="milestone")return "milestones";
 if(category==="memory")return "memories";
 if(category==="mystery")return "mysteries";
 return "observations";
}
export function getJournalView(state){
 if(!state||state.schemaVersion!==2)throw new TypeError("Expected v2 egg state");
 const entries=state.journal.map(e=>({
  id:e.id,section:section(e.category),title:e.category==="milestone"?"A new milestone":e.category==="memory"?"A cherished moment":"Something noticed",
  description:e.text,turn:e.turn
 }));
 for(const [action,count] of Object.entries(state.development.activityCounts)){
  if(count>=3)entries.push({id:"activity-"+action,section:"observations",title:titleCase(action)+" feels familiar",description:ACTION_TEXT[action],turn:null});
 }
 const personality=Object.entries(TRAIT_TEXT).map(([trait,levels])=>{
  const value=state.personality[trait]??0;
  const index=value>=20?2:value>=7?1:0;
  return {id:"trait-"+trait,section:"personality",title:titleCase(trait),description:levels[index],turn:null};
 });
 entries.push(...personality);
 if(state.stage==="forming"||state.stage==="emergence"){
  entries.push({id:"shell-patterns",section:"mysteries",title:"Changes in the shell",description:"Subtle patterns have appeared, but their meaning remains a mystery.",turn:null});
 }
 if(state.hatch.status==="hatched"){
  entries.push({id:"birth",section:"milestones",title:"A new beginning",description:"Your companion has hatched. Its early experiences are now part of its story.",turn:state.hatch.birthRecord?.turn??null});
 }
 return JOURNAL_SECTIONS.map(name=>({section:name,entries:entries.filter(e=>e.section===name)}));
}
export function getJournalSummary(state){
 const sections=getJournalView(state);
 return {stage:state.stage,sections,observationCount:sections.find(s=>s.section==="observations").entries.length,milestoneCount:sections.find(s=>s.section==="milestones").entries.length};
}
