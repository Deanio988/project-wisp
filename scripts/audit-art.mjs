import {existsSync,readFileSync} from 'node:fs';
import {CREATURE_FAMILIES,CREATURE_ACTIONS,spritePath} from '../preview/creature-player.mjs';
const stages=['dormant','awakening','forming','emergence'];
const assets=[];
for(const family of CREATURE_FAMILIES){
 for(const action of CREATURE_ACTIONS)for(let frame=0;frame<4;frame++)assets.push({type:'creature',path:new URL(spritePath(family,action,frame),new URL('../preview/',import.meta.url)),width:64,height:64});
 for(const stage of stages)assets.push({type:'egg',path:new URL('../preview/art/eggs/'+family+'_egg_'+stage+'.png',import.meta.url),width:96,height:96});
}
for(const stage of stages)assets.push({type:'neutral-egg',path:new URL('../preview/art/eggs/neutral_egg_'+stage+'.png',import.meta.url),width:96,height:96});
let present=0,invalid=0;
for(const asset of assets){
 if(!existsSync(asset.path))continue;
 present++;
 try{
  const b=readFileSync(asset.path);
  if(b.length<26||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||b.toString('ascii',12,16)!=='IHDR'||b.readUInt32BE(16)!==asset.width||b.readUInt32BE(20)!==asset.height||b[25]!==6)throw Error('invalid dimensions/format');
 }catch(e){invalid++;console.error('INVALID '+asset.path.pathname+': '+e.message)}
}
console.log(JSON.stringify({expected:assets.length,present,missing:assets.length-present,invalid,productionArtReady:present===assets.length&&invalid===0},null,2));
if(process.argv.includes('--strict')&&(present!==assets.length||invalid))process.exitCode=1;
