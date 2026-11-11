import test from "node:test";
import assert from "node:assert/strict";
import {spritePath,CREATURE_FAMILIES,CREATURE_ACTIONS} from "../preview/creature-player.mjs";
test("all four families have predictable four-frame paths for four animations",()=>{
 const paths=new Set();
 for(const family of CREATURE_FAMILIES)for(const action of CREATURE_ACTIONS)for(let frame=0;frame<4;frame++){
  const path=spritePath(family,action,frame);
  assert.match(path,/^\.\/art\/creatures\/[a-z]+_(idle|walk|sleep|interact)_0[0-3]\.png$/);
  paths.add(path);
 }
 assert.equal(paths.size,64);
});
test("rejects invalid sprite paths",()=>{
 for(const args of [["../../secret","idle",0],["mossling","other",0],["mossling","idle",4],["mossling","idle",-1]])assert.throws(()=>spritePath(...args),RangeError);
});
