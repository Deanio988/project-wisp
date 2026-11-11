/* Sprite-based creature performance. Preload frames; preserve game state. */
export const CREATURE_FAMILIES=Object.freeze(["mossling","glimlet","mistril","pebblin"]);
export const CREATURE_ACTIONS=Object.freeze(["idle","walk","sleep","interact"]);
const FRAMES=4;
export function spritePath(family,action,frame){
 if(!CREATURE_FAMILIES.includes(family)||!CREATURE_ACTIONS.includes(action)||!Number.isInteger(frame)||frame<0||frame>=FRAMES)throw new RangeError("Invalid sprite reference");
 return "./art/creatures/"+family+"_"+action+"_"+String(frame).padStart(2,"0")+".png";
}
export function createCreaturePlayer({image,fallback,onStatus=()=>{},reducedMotion=()=>false,frameMs=220}){
 let family=null,action="idle",frame=0,timer=null,token=0,sequence=0;
 const stop=()=>{if(timer!==null){clearInterval(timer);timer=null}};
 const showFallback=()=>{image.hidden=true;fallback.hidden=false;onStatus("fallback")};
 const cached=new Map();
 const getFrame=(f,a,n)=>{
  const path=spritePath(f,a,n);
  if(!cached.has(path)){
   const probe=new Image();
   const ready=new Promise(resolve=>{probe.onload=()=>resolve(true);probe.onerror=()=>resolve(false)});
   probe.src=path;
   cached.set(path,ready);
  }
  return cached.get(path).then(ok=>ok?path:null);
 };
 const loadFrame=async()=>{
  if(!family)return;
  const request=++token,f=family,a=action,n=frame;
  const path=await getFrame(f,a,n);
  if(request!==token)return;
  if(path){image.src=path;image.alt=f+" "+a+" animation";image.hidden=false;fallback.hidden=true;onStatus("sprite")}
  else if(image.hidden)showFallback();
 };
 function play(nextFamily,nextAction="idle"){
  stop();token++;sequence=0;
  if(!CREATURE_FAMILIES.includes(nextFamily)||!CREATURE_ACTIONS.includes(nextAction)){family=null;showFallback();return}
  family=nextFamily;action=nextAction;frame=0;loadFrame();
  // Preload expressive actions so changing poses doesn't flash empty frames.
  for(const a of ["idle","interact","walk","sleep"])for(let i=0;i<FRAMES;i++)void getFrame(family,a,i);
  if(!reducedMotion())timer=setInterval(()=>{
   sequence++;
   // A non-repeating performance: mostly idle, with short curious looks and turns.
   const phase=sequence%64;
   const nextAction=phase>=32&&phase<40?"interact":phase>=50&&phase<56?"walk":"idle";
   if(nextAction!==action){action=nextAction;frame=0}
   else frame=(frame+1)%FRAMES;
   image.dataset.pose=action;
   loadFrame();
  },frameMs);
 }
 function dispose(){stop();token++;family=null;image.removeAttribute("data-pose")}
 return {play,dispose,get state(){return {family,action,frame,playing:timer!==null}}};
}
