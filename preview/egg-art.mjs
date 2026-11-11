/* Family-neutral eggs. Never flash an outdated SVG while switching stages. */
export const EGG_STAGES=Object.freeze(["dormant","awakening","forming","emergence"]);
export const NEUTRAL_EGG_ART="../assets/living-egg.svg";
export function eggArtPath(stage){
 return EGG_STAGES.includes(stage)?"./art/eggs/neutral_egg_"+stage+".png":NEUTRAL_EGG_ART;
}
export function setEggArtwork(image,stage){
 const candidate=eggArtPath(stage);
 const generation=String(Number(image.dataset.eggRequest||0)+1);
 image.dataset.eggRequest=generation;
 image.dataset.eggStage=stage;
 if(image.getAttribute("src")===candidate&&image.complete&&image.naturalWidth>0)return;
 const probe=new Image();
 probe.onload=()=>{
  if(image.dataset.eggRequest!==generation||image.dataset.eggStage!==stage)return;
  image.src=candidate;
 };
 probe.onerror=()=>{
  if(image.dataset.eggRequest!==generation||image.dataset.eggStage!==stage)return;
  // Keep the previous valid stage visible instead of flashing an unrelated SVG.
  if(image.complete&&image.naturalWidth>0)return;
  image.src=NEUTRAL_EGG_ART;
 };
 probe.src=candidate;
}
