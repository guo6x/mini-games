const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Core=require('../orbit-vector-core.js');
const step=(g,n,input={})=>{for(let i=0;i<n;i++)g.advance(1/60,input);};
function crossAt(g,{aligned=true}={}){
 const gate=g.spawn();g.spawnClock=100;
 g.player.x=aligned?gate.x:3.2;g.player.y=aligned?gate.y:2.15;
 gate.z=g.player.z+.25;step(g,2);return gate;
}
test('deterministic world state and real x/y/z gate coordinates',()=>{
 const a=new Core({seed:201}),b=new Core({seed:201});a.start();b.start();
 step(a,190,{right:true,up:true});step(b,190,{right:true,up:true});
 assert.deepEqual(a.snapshot(),b.snapshot());
 assert.ok(a.gates.length>=1);
 assert.ok(a.gates.every(g=>Number.isFinite(g.x)&&Number.isFinite(g.y)&&Number.isFinite(g.z)));
 assert.equal(a.player.z,10);
});
test('3D collision requires alignment in both lateral and vertical coordinates',()=>{
 const a=new Core({seed:1});a.start();const ga=crossAt(a,{aligned:true});
 assert.ok(ga.resolved);assert.equal(a.score>0,true);assert.equal(a.combo,1);assert.equal(a.player.hp,4);
 const b=new Core({seed:1});b.start();const gb=b.spawn();
 b.spawnClock=100;b.player.x=gb.x;b.player.y=2.15;gb.z=b.player.z+.2;step(b,2);
 assert.equal(b.player.hp,3,'wrong vertical slice is a collision even when x matches');
 const c=new Core({seed:1});c.start();const gc=c.spawn();
 c.spawnClock=100;c.player.x=3.2;c.player.y=gc.y;gc.z=c.player.z+.2;step(c,2);
 assert.equal(c.player.hp,3,'wrong horizontal slice is a collision even when y matches');
});
test('phase shield has cooldown and saves one misaligned gate without changing the 3D rule',()=>{
 const g=new Core({seed:10});g.start();
 assert.equal(g.pulse(),true);assert.equal(g.pulse(),false);
 crossAt(g,{aligned:false});
 assert.equal(g.player.hp,4);assert.equal(g.score,45);assert.equal(g.combo,1);
 step(g,65);assert.equal(g.player.shield,0);assert.ok(g.player.cooldown>0);
 assert.equal(g.pulse(),false);
});
test('12 real gate crossings yield three checkpoint segments and final victory',()=>{
 const events=[],g=new Core({seed:999,onEvent:e=>events.push(e)});g.start();g.player.hp=3;
 for(let i=0;i<12;i++){
  const gate=crossAt(g);
  assert.equal(g.resolved,i+1);
  assert.equal(gate.stage,Math.floor(i/4)+1);
  if(i<11)assert.equal(g.state,'running');
 }
 assert.equal(g.state,'won');assert.equal(g.player.hp,4);
 assert.equal(g.spawned,12);assert.ok(g.score>12*100);
 assert.equal(events.filter(x=>x.type==='checkpoint').length,2);
 assert.equal(events.filter(x=>x.type==='win').length,1);
 const score=g.score;step(g,100);assert.equal(g.score,score);
});
test('four collisions produce definite game over with frozen score and no phantom victory',()=>{
 const g=new Core({seed:19});g.start();
 for(let i=0;i<4;i++)crossAt(g,{aligned:false});
 assert.equal(g.player.hp,0);assert.equal(g.state,'lost');
 const old=g.resolved;step(g,180);assert.equal(g.resolved,old);
 assert.equal(g.pulse(),false);
});
test('pause freezes time, ship movement and all gate depth; resume continues',()=>{
 const g=new Core({seed:2});g.start();step(g,75);const state=g.snapshot();
 assert.equal(g.pause(),true);step(g,180,{left:true});
 assert.deepEqual(g.snapshot(),{...state,state:'paused'});
 assert.equal(g.pause(),true);step(g,20,{left:true});
 assert.ok(g.player.x<state.player.x);
});
test('pointer targeting, keyboard diagonals and bounds are clamped',()=>{
 const g=new Core({seed:4});g.start();
 step(g,400,{target:{x:500,y:-400}});
 assert.equal(g.player.x,3.2);assert.equal(g.player.y,-2.15);
 g.start();step(g,60,{right:true,up:true});
 assert.ok(g.player.x>1&&g.player.y>1);
 const norm=Math.hypot(g.player.x/4.1,g.player.y/3.6);
 assert.ok(norm<1.01,'diagonal movement must be normalized');
});
test('three-dimensional WebGL shader and software projection both exist and require no CDN',()=>{
 const render=fs.readFileSync(require('node:path').join(__dirname,'../orbit-vector-render.js'),'utf8');
 assert.match(render,/getContext\('webgl'/);
 assert.match(render,/gl\.enable\(gl\.DEPTH_TEST\)/);
 assert.match(render,/gl_Position=vec4\(aPos\.x\*f\/uAspect,aPos\.y\*f/);
 assert.match(render,/function project\(x,y,z\)/);
 assert.match(render,/software-perspective/);
 const html=fs.readFileSync(require('node:path').join(__dirname,'../vector-run.html'),'utf8');
 assert.doesNotMatch(html,/src="https?:\/\/|href="https?:\/\//);
});
