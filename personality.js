"use strict";
// Project Wisp v0.2 — deterministic, local-first personality development.
const KEY="project-wisp-v1";
const TRAITS=["curiosity","sociability","calm","courage","affection","playfulness"];
const ACTIONS={
 warm:{affection:3,calm:1,trust:8,warmth:15,words:["The shell glows beneath your hand.","A gentle warmth spreads through the nest."]},
 sing:{sociability:3,playfulness:1,trust:8,warmth:3,words:["The egg taps back in a tiny rhythm.","A faint melody seems to echo inside."]},
 rest:{calm:3,affection:1,trust:7,warmth:8,words:["The egg settles peacefully into the moss.","A quiet heartbeat answers your patience."]},
 explore:{curiosity:3,courage:2,trust:7,warmth:-2,words:["The egg leans toward the sound of the forest.","Something inside seems eager to discover more."]},
 play:{playfulness:3,courage:1,trust:7,warmth:-3,words:["The egg gives a delighted wobble.","A quick series of taps comes from within."]},
 story:{curiosity:2,sociability:2,trust:7,warmth:0,words:["The shell pulses softly as you tell your story.","The egg seems to listen to every word."]}
};
const $=id=>document.getElementById(id);
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const fresh=()=>({warmth:50,trust:0,hatched:false,name:"Mossling",messages:[],actions:0,traits:Object.fromEntries(TRAITS.map(t=>[t,0])),careKinds:[],personalityVersion:1,hatchedProfile:null});
let state;
try{state={...fresh(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{state=fresh()}
state.traits=Object.fromEntries(TRAITS.map(t=>[t,clamp(Number(state.traits?.[t])||0)]));
state.careKinds=Array.isArray(state.careKinds)?state.careKinds.filter(k=>k in ACTIONS):[];
state.messages=Array.isArray(state.messages)?state.messages.slice(-24):[];
state.warmth=clamp(Number(state.warmth)||0);
state.trust=clamp(Number(state.trust)||0);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn("Save unavailable",e)}};
function speak(message,who="Wisp"){state.messages.push({who,text:message});state.messages=state.messages.slice(-24)}
function profile(){
 const ordered=[...TRAITS].sort((a,b)=>state.traits[b]-state.traits[a]||TRAITS.indexOf(a)-TRAITS.indexOf(b));
 return {primary:ordered[0],secondary:ordered[1],traits:{...state.traits}};
}
function readiness(){
 const values=TRAITS.map(t=>state.traits[t]);
 const developed=values.filter(v=>v>=6).length;
 const variety=new Set(state.careKinds).size;
 return {ready:state.trust>=55&&state.warmth>=40&&developed>=3&&variety>=3,developed,variety};
}
let hatchAnimating=false;let worldTimer=null;
function render(){
 const born=state.hatched&&!hatchAnimating,egg=$("creature");
 const world=$("living-world");world.hidden=!born;$("world-status").hidden=!born;$("creature").closest(".scene").classList.toggle("world-active",born);
 if(born){egg.textContent="🌱"}else if(!$("egg-art")){egg.innerHTML='<img id="egg-art" src="assets/living-egg.svg" alt="">'}
 egg.className=born?"egg hatched":"egg";
 egg.setAttribute("aria-label",born?"Your newly hatched forest companion":"An illustrated magical egg");
 $("phase").textContent=state.hatched?"A new friendship":"Personality taking shape";
 $("pet-name").textContent=state.hatched?state.name:"The Living Egg";
 const p=state.hatchedProfile||profile(),r=readiness();
 $("story").textContent=state.hatched?"Your companion emerged with a "+p.primary+" spirit and a "+p.secondary+" streak. Its personality can continue to grow.":"Care for the egg in different ways. Its developing personality, trust and warmth will determine when it is ready to hatch.";
 for(const k of ["warmth","trust"]){$(k).value=state[k];$(k+"-text").textContent=state[k]}
 $("trait-list").replaceChildren();
 for(const trait of TRAITS){const label=document.createElement("label");label.className="trait";const title=document.createElement("span");title.textContent=trait[0].toUpperCase()+trait.slice(1);const meter=document.createElement("progress");meter.max=30;meter.value=Math.min(30,state.traits[trait]);meter.setAttribute("aria-label",trait+" development");label.append(title,meter);$("trait-list").append(label)}
 $("readiness").textContent=state.hatched?"Hatched — "+p.primary+" / "+p.secondary:"Developing traits: "+r.developed+"/3 · Different care activities: "+r.variety+"/3";
 document.querySelectorAll(".milestones span").forEach((el,i)=>el.classList.toggle("active",i<=(state.hatched?3:r.ready?2:r.developed>0?1:0)));
 $("messages").replaceChildren();
 for(const m of state.messages){const div=document.createElement("div");div.className="bubble "+(m.who==="You"?"you":"");const strong=document.createElement("strong");strong.textContent=m.who;const body=document.createElement("span");body.textContent=m.text;div.append(strong,body);$("messages").append(div)}
 if(born){const p=state.hatchedProfile||profile();$("world-status").textContent=state.name+" has entered the woodland home. "+(state.worldActivity||("Feeling "+p.primary+" and looking around."));startWorld()}else{stopWorld()}
 $("messages").scrollTop=$("messages").scrollHeight;
 save();
}
function stopWorld(){if(worldTimer!==null){clearInterval(worldTimer);worldTimer=null}}
function startWorld(){if(worldTimer!==null)return;worldTimer=setInterval(()=>{if(!state.hatched||hatchAnimating)return;const p=state.hatchedProfile||profile();const options={curiosity:["Investigating a trail of glowing spores.","Exploring near the old tree."],sociability:["Looking toward you for company.","Practising a little greeting."],calm:["Resting beneath the shade.","Watching clouds drift overhead."],courage:["Venturing toward the pond.","Exploring beyond the cottage."],affection:["Returning to the cottage to see you.","Curling up near the doorway."],playfulness:["Chasing a drifting leaf.","Hopping between the flowers."]};const choices=options[p.primary]||options.curiosity;state.worldSteps=Number(state.worldSteps||0)+1;state.worldActivity=choices[state.worldSteps%choices.length];const positions=[30,48,67,42,58];$("world-pet").style.left=positions[state.worldSteps%positions.length]+"%";$("world-status").textContent=state.name+": "+state.worldActivity;save()},7000)}
function hatch(){
 if(state.hatched||!readiness().ready)return;
 state.hatched=true;state.hatchedProfile=profile();state.worldActivity="Taking the first steps into a new woodland home.";
 hatchAnimating=true;
 speak("...peep! The shell opens. A "+state.hatchedProfile.primary+" little spirit peeks out, with a hint of "+state.hatchedProfile.secondary+".");
 render();
 $("creature").classList.add("cracking");$("hatch-flash").classList.add("active");
 setTimeout(()=>{hatchAnimating=false;$("hatch-flash").classList.remove("active");render()},1800);
}
function act(action){
 const a=ACTIONS[action];if(!a)return;
 state.actions++;state.trust=clamp(state.trust+a.trust);state.warmth=clamp(state.warmth+a.warmth);
 for(const trait of TRAITS)if(a[trait])state.traits[trait]=clamp(state.traits[trait]+a[trait]);
 if(!state.careKinds.includes(action))state.careKinds.push(action);
 speak(a.words[(state.actions-1)%a.words.length]);
 if(!state.hatched&&readiness().ready){hatch()}else{render();if(!state.hatched){$("creature").classList.add("wiggle");setTimeout(()=>$("creature").classList.remove("wiggle"),1300)}}
}
document.querySelectorAll("[data-action]").forEach(button=>button.addEventListener("click",()=>act(button.dataset.action)));
$("chat-form").addEventListener("submit",event=>{
 event.preventDefault();const input=$("message"),message=input.value.trim();if(!message)return;
 speak(message,"You");input.value="";
 state.trust=clamp(state.trust+2);
 // Conversations are intentionally scripted until a secure AI backend is connected.
 speak(state.hatched?"I'm listening. Tell me more about that.":"The egg gives a gentle tap. It knows your voice.");
 render();
});
$("reset").addEventListener("click",()=>{if(confirm("Start a new story? This erases your saved egg and personality.")){stopWorld();state=fresh();$("world-pet").style.left="45%";render()}});
render();