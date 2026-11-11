import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync,readFileSync} from 'node:fs';
import {spritePath,CREATURE_FAMILIES,CREATURE_ACTIONS} from '../preview/creature-player.mjs';
const root=new URL('../preview/',import.meta.url);
test('all 64 planned creature frame paths are unique and safe',()=>{
 const paths=new Set();
 for(const family of CREATURE_FAMILIES)for(const action of CREATURE_ACTIONS)for(let frame=0;frame<4;frame++){
  const path=spritePath(family,action,frame);
  assert.match(path,/^\.\/art\/creatures\/[a-z]+_(idle|walk|sleep|interact)_0[0-3]\.png$/);
  paths.add(path);
 }
 assert.equal(paths.size,64);
});
test('any installed creature frames are nonempty; missing artwork remains optional until release',()=>{
 let installed=0;
 for(const family of CREATURE_FAMILIES)for(const action of CREATURE_ACTIONS)for(let frame=0;frame<4;frame++){
  const url=new URL(spritePath(family,action,frame),root);
  if(existsSync(url)){assert.ok(statSync(url).size>100,'Empty frame: '+url);installed++}
 }
 console.log('Creature frames installed: '+installed+'/64; remaining: '+(64-installed));
 assert.ok(installed===0||installed===64,'Partial artwork installation: complete all 64 frames together');
});

test('egg artwork installation is all-or-nothing across four families and stages',()=>{
 const stages=['dormant','awakening','forming','emergence'];
 let installed=0;
 for(const family of CREATURE_FAMILIES)for(const stage of stages){
  const url=new URL('../preview/art/eggs/'+family+'_egg_'+stage+'.png',import.meta.url);
  if(existsSync(url)){assert.ok(statSync(url).size>100,'Empty egg art: '+url);installed++}
 }
 console.log('Egg frames installed: '+installed+'/16; remaining: '+(16-installed));
 assert.ok(installed===0||installed===16,'Partial egg art installation: complete all 16 frames together');
});

function inspectPng(url,width,height){
 const bytes=readFileSync(url);
 assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Invalid PNG signature: '+url);
 assert.equal(bytes.toString('ascii',12,16),'IHDR','Missing PNG header: '+url);
 assert.equal(bytes.readUInt32BE(16),width,'Incorrect PNG width: '+url);
 assert.equal(bytes.readUInt32BE(20),height,'Incorrect PNG height: '+url);
 assert.equal(bytes[25],6,'Artwork must use RGBA colour type: '+url);
}
test('installed artwork is valid RGBA PNG at approved pixel dimensions',()=>{
 for(const family of CREATURE_FAMILIES){
  for(const action of CREATURE_ACTIONS)for(let frame=0;frame<4;frame++){
   const url=new URL(spritePath(family,action,frame),root);
   if(existsSync(url))inspectPng(url,64,64);
  }
  for(const stage of ['dormant','awakening','forming','emergence']){
   const url=new URL('../preview/art/eggs/'+family+'_egg_'+stage+'.png',import.meta.url);
   if(existsSync(url))inspectPng(url,96,96);
  }
 }
});
