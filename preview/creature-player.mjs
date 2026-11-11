/* Optional sprite playback for the canonical sanctuary. Never changes egg state. */
export const CREATURE_FAMILIES=Object.freeze(["mossling","glimlet","mistril","pebblin"]);
export const CREATURE_ACTIONS=Object.freeze(["idle","walk","sleep","interact"]);
const FRAMES=4;
export function spritePath(family,action,frame){
 if(!CREATURE_FAMILIES.includes(family)||!CREATURE_ACTIONS.includes(action)||!Number.isInteger(frame)||frame<0||frame>=FRAMES)throw new RangeError("Invalid sprite reference");
 return "./art/creatures/"+family+"_"+action+"_"+String(frame).padStart(2,"0")+".png";
}
export function createCreaturePlayer({image,fallback,onStatus=()=>{},reducedMotion=()=>false,frameMs=220}){
 let family=null,action="idle",frame=0,timer=null,token=0;
 const stop=()=>{if(timer!==null){clearInterval(timer);timer=null}};
 const showFallback=()=>{image.hidden=true;fallback.hidden=false;onStatus("fallback")};
 const loadFrame=()=>{
  if(!family)return;
  const request=++token;
  const path=spritePath(family,action,frame);
  const probe=new Image();
  probe.onload=()=>{if(request!==token)return;image.src=path;image.alt=family+" "+action+" animation";image.hidden=false;fallback.hidden=true;onStatus("sprite")};
  probe.onerror=()=>{if(request===token)showFallback()};
  probe.src=path;
 };
 function play(nextFamily,nextAction="idle"){
  stop();
  if(!CREATURE_FAMILIES.includes(nextFamily)||!CREATURE_ACTIONS.includes(nextAction)){family=null;showFallback();return}
  family=nextFamily;action=nextAction;frame=0;loadFrame();
  if(!reducedMotion())timer=setInterval(()=>{frame=(frame+1)%FRAMES;loadFrame()},frameMs);
 }
 function dispose(){stop();token++;family=null}
 return {play,dispose,get state(){return {family,action,frame,playing:timer!==null}}};
}
