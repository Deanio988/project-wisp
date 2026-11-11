import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
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
