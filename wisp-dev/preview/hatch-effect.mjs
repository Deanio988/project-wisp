/* Licensed PixelFX spritesheet playback. Visual only; never changes simulation state. */
const ROOT="./art/effects/spawn/egg-hatch/";
export function createHatchEffect(canvas,{reducedMotion=()=>false}={}){
 const ctx=canvas.getContext("2d");
 let token=0,raf=0;
 const stop=()=>{token++;cancelAnimationFrame(raf);canvas.hidden=true;ctx?.clearRect(0,0,canvas.width,canvas.height)};
 async function play(){
  stop();
  if(reducedMotion()||!ctx)return false;
  const request=token;
  try{
   const [response,img]=await Promise.all([fetch(ROOT+"egg-hatch.json"),new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=ROOT+"egg-hatch.png"})]);
   if(!response.ok)throw Error("Missing PixelFX frames");
   const data=await response.json();
   if(request!==token)return false;
   const frames=data.frames;
   if(!Array.isArray(frames)||!frames.length)throw Error("Invalid PixelFX metadata");
   const first=frames[0].frame;
   canvas.width=first.w;canvas.height=first.h;
   canvas.hidden=false;
   const started=performance.now();
   function tick(now){
    if(request!==token)return;
    const elapsed=now-started;
    let index=Math.floor(elapsed/(1000/(data.meta?.pixelfx?.fps||30)));
    index=Math.min(frames.length-1,index);
    const f=frames[index].frame;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,f.x,f.y,f.w,f.h,0,0,canvas.width,canvas.height);
    if(index<frames.length-1)raf=requestAnimationFrame(tick);
   }
   raf=requestAnimationFrame(tick);
   return true;
  }catch(error){console.warn("PixelFX unavailable; CSS hatch animation retained",error);canvas.hidden=true;return false}
 }
 return {play,stop};
}
