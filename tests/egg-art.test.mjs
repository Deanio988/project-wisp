import test from 'node:test';
import assert from 'node:assert/strict';
import {eggArtPath,EGG_STAGES,NEUTRAL_EGG_ART} from '../preview/egg-art.mjs';
test('pre-hatch art requests use neutral filenames only',()=>{
 for(const stage of EGG_STAGES){
  const path=eggArtPath(stage);
  assert.equal(path,'./art/eggs/neutral_egg_'+stage+'.png');
  assert.doesNotMatch(path,/mossling|glimlet|mistril|pebblin/);
 }
});
test('invalid stage falls back safely',()=>{
 for(const value of ['hatched','hatching',null,undefined,'../../secret'])assert.equal(eggArtPath(value),NEUTRAL_EGG_ART);
});
