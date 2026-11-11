/* Family-neutral egg art. Never reveal hidden hatch genetics in pre-hatch requests. */
export const EGG_STAGES=Object.freeze(['dormant','awakening','forming','emergence']);
export const NEUTRAL_EGG_ART='../assets/living-egg.svg';
export function eggArtPath(stage){
 if(!EGG_STAGES.includes(stage))return NEUTRAL_EGG_ART;
 return './art/eggs/neutral_egg_'+stage+'.png';
}
export function setEggArtwork(image,stage){
 const candidate=eggArtPath(stage);
 image.dataset.eggStage=stage;
 image.src=NEUTRAL_EGG_ART;
 if(candidate===NEUTRAL_EGG_ART)return;
 const probe=new Image();
 probe.onload=()=>{if(image.dataset.eggStage===stage)image.src=candidate};
 probe.onerror=()=>{if(image.dataset.eggStage===stage)image.src=NEUTRAL_EGG_ART};
 probe.src=candidate;
}
