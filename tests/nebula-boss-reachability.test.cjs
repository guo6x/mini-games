/* Deterministic automated-pilot safety gates for the genuine NEBULA STRIKE rules engine.
 * No mock damage, no invulnerability, no direct mutation during the dodge itself.
 * These tests prove bounded reachable escape paths, not that a human will find them.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../orbit-nebula-core.js');
const STEP=1/60;
function makeStage3(x,y,{volley=true,beam=true}={}){
 const g=new Core({seed:901});
 g.startBoss();g.boss.hp=35;g.player.x=x;g.player.y=y;g.player.inv=0;
 g.fireTime=100;g.spawnTime=100;g.bossFire=volley?0:100;g.bossBeam=beam?0:100;
 g.update(STEP);
 assert.equal(g.phase,'boss');assert.equal(g.boss.stage,3);
 if(volley)assert.equal(g.hostile.length,7);
 if(beam)assert.equal(g.hazards.length,2);
 // Isolate the spawned wave and warning pair: no fresh volleys during this probe.
 g.bossFire=100;g.bossBeam=100;
 return g;
}
function pilot(g,x,y,seconds=2){
 const frames=Math.ceil(seconds/STEP);
 for(let i=0;i<frames;i++){
  if(g.phase!=='boss')break;
  g.update(STEP,{pointer:{x,y}});
 }
 return {hp:g.player.hp,phase:g.phase,x:g.player.x,y:g.player.y};
}
test('every sampled horizontal position can escape both announced stage-3 beams before activation',()=>{
 for(let x=95;x<=705;x+=10){
  const g=makeStage3(x,420,{volley:false});
  const away=x<400?Math.max(33,x-85):Math.min(767,x+85);
  const result=pilot(g,away,420,1.5);
  assert.equal(result.hp,5,'announced dual-beam dodge failed from x='+x);
  assert.ok(g.hazards.length===0,'beam warning must have resolved');
 }
});
test('seven-shot fan has a reachable no-damage horizontal route from sampled positions',()=>{
 const candidates=Array.from({length:31},(_,i)=>33+i*24).concat(767);
 for(let x=95;x<=705;x+=40){
  let route=null;
  for(const target of candidates){
   const g=makeStage3(x,420,{beam:false});
   const result=pilot(g,target,420,2);
   if(result.hp===5){route=target;break;}
  }
  assert.notEqual(route,null,'no safe movement target found for shot fan at x='+x);
 }
});
test('overlapping seven-shot fan and dual beam offer reachable no-damage routes',()=>{
 const candidates=Array.from({length:31},(_,i)=>33+i*24).concat(767);
 for(const x of [130,220,310,400,490,580,670]){
  let route=null;
  for(const target of candidates){
   const g=makeStage3(x,420);
   const result=pilot(g,target,420,2);
   if(result.hp===5){route=target;break;}
  }
  assert.notEqual(route,null,'combined beam and fan has no simple safe lane from x='+x);
 }
});
