import {createEgg,applyCare,beginHatch,completeHatch} from "../simulation/egg-engine.mjs";
import {getJournalView} from "../simulation/egg-journal.mjs";
const KEY="project-wisp-egg-preview-v2";
const $=id=>document.getElementById(id);
const randomSeed=()=>{const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0]};
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.schemaVersion===2&&s?.hatch&&s?.development)return s}catch{}return createEgg(randomSeed())}
let state=load();
let hatchTimer=null;
const reduceMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function finishHatch(){if(hatchTimer!==null){clearTimeout(hatchTimer);hatchTimer=null}if(state.hatch.status==="hatching"){state=completeHatch(state);render()}}
function progressHatch(){if(state.hatch.status==="ready"){state=beginHatch(state);persist()}if(state.hatch.status==="hatching"){if(reduceMotion()){finishHatch();return}if(hatchTimer===null)hatchTimer=setTimeout(finishHatch,1800)}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn("Preview save unavailable",e)}}
function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node}
function render(){
 const hatched=state.hatch.status==="hatched";
 $("stage").textContent=hatched?"A new beginning":state.stage.charAt(0).toUpperCase()+state.stage.slice(1);
 $("title").textContent=hatched?"Your "+state.hatch.family:"The Little Egg";
 $("story").textContent=hatched?"Your companion has emerged, carrying the memories of its egg days.":state.hatch.status==="ready"||state.hatch.status==="hatching"?"The shell trembles softly. A new life is about to begin.":"The egg responds to your presence. Spend time together and discover its personality.";
 const stageVisual=hatched?"hatched":state.hatch.status==="hatching"?"hatching":state.stage;
 document.querySelector(".scene").dataset.stage=stageVisual;
 document.querySelector(".scene").dataset.family=hatched?state.hatch.family:"";
 const dedicatedArt=hatched&&state.hatch.family==="mossling";
 $("art").hidden=hatched&&!dedicatedArt;
 $("art").src=dedicatedArt?"../assets/mossling.svg":"../assets/living-egg.svg";
 $("family-symbol").hidden=!hatched||dedicatedArt;
 $("family-symbol").textContent=hatched?({glimlet:"✦",mistril:"☁",pebblin:"◆"}[state.hatch.family]||"✧"):"";
 $("art").alt=hatched?"A newly hatched companion":"An illustrated magical egg";
 document.querySelectorAll("[data-care]").forEach(b=>b.disabled=state.hatch.status!=="incubating");
 $("hatch-notice").hidden=!(state.hatch.status==="ready"||state.hatch.status==="hatching");
 $("hatch-notice").textContent="The egg is hatching naturally…";
 $("skip-hatch").hidden=state.hatch.status!=="hatching"||reduceMotion();
 const journal=$("journal");journal.replaceChildren();
 for(const section of getJournalView(state)){
  const details=el("details");details.open=section.section==="observations"||section.section==="milestones";
  details.append(el("summary",section.section.charAt(0).toUpperCase()+section.section.slice(1)+" ("+section.entries.length+")"));
  for(const entry of section.entries){const article=el("article");article.append(el("strong",entry.title),el("p",entry.description));details.append(article)}
  journal.append(details);
 }
 persist();
 progressHatch();
}
document.querySelectorAll("[data-care]").forEach(button=>button.addEventListener("click",()=>{state=applyCare(state,button.dataset.care);render()}));
$("skip-hatch").addEventListener("click",finishHatch);
$("reset").addEventListener("click",()=>{if(confirm("Start a new preview egg?")){if(hatchTimer!==null){clearTimeout(hatchTimer);hatchTimer=null}state=createEgg(randomSeed());render()}});
render();
