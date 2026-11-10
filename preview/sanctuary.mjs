import {createEgg,applyCare,beginHatch,completeHatch} from "../simulation/egg-engine.mjs";
import {getJournalView} from "../simulation/egg-journal.mjs";
const KEY="project-wisp-egg-preview-v2";
const $=id=>document.getElementById(id);
const randomSeed=()=>{const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0]};
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.schemaVersion===2&&s?.hatch&&s?.development)return s}catch{}return createEgg(randomSeed())}
let state=load();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn("Preview save unavailable",e)}}
function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node}
function render(){
 const hatched=state.hatch.status==="hatched";
 $("stage").textContent=hatched?"A new beginning":state.stage.charAt(0).toUpperCase()+state.stage.slice(1);
 $("title").textContent=hatched?"Your "+state.hatch.family:"The Little Egg";
 $("story").textContent=hatched?"Your companion has emerged, carrying the memories of its egg days.":state.hatch.status==="ready"||state.hatch.status==="hatching"?"The shell trembles softly. A new life is about to begin.":"The egg responds to your presence. Spend time together and discover its personality.";
 $("art").src=hatched&&state.hatch.family==="mossling"?"../assets/mossling.svg":"../assets/living-egg.svg";
 $("art").alt=hatched?"A newly hatched companion":"An illustrated magical egg";
 document.querySelectorAll("[data-care]").forEach(b=>b.disabled=state.hatch.status!=="incubating");
 $("hatch").hidden=!(state.hatch.status==="ready"||state.hatch.status==="hatching");
 const journal=$("journal");journal.replaceChildren();
 for(const section of getJournalView(state)){
  const details=el("details");details.open=section.section==="observations"||section.section==="milestones";
  details.append(el("summary",section.section.charAt(0).toUpperCase()+section.section.slice(1)+" ("+section.entries.length+")"));
  for(const entry of section.entries){const article=el("article");article.append(el("strong",entry.title),el("p",entry.description));details.append(article)}
  journal.append(details);
 }
 persist();
}
document.querySelectorAll("[data-care]").forEach(button=>button.addEventListener("click",()=>{state=applyCare(state,button.dataset.care);render()}));
$("hatch").addEventListener("click",()=>{if(state.hatch.status==="ready")state=beginHatch(state);state=completeHatch(state);render()});
$("reset").addEventListener("click",()=>{if(confirm("Start a new preview egg?")){state=createEgg(randomSeed());render()}});
render();
