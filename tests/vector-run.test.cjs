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
 assert.equal(g.state,'won');assert.equal(g.player.hp,4);assert.equal(g.passed,12);assert.equal(g.missed,0);assert.equal(g.grade,'S');
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

test('hit gates do not count as successful clearances; a minimum of eight passes is required',()=>{
 const g=new Core({seed:57,mode:'training'});g.start();
 // Keep the hull alive to exercise the qualification gate rather than the HP fail state.
 g.player.hp=100;
 for(let i=0;i<7;i++)crossAt(g,{aligned:true});
 for(let i=0;i<5;i++)crossAt(g,{aligned:false});
 assert.equal(g.resolved,12);assert.equal(g.passed,7);assert.equal(g.missed,5);assert.equal(g.shielded,0);
 assert.equal(g.state,'lost');assert.equal(g.grade,'INSUFFICIENT PASSES');
});
test('a surviving run with eight valid passes can win, with an honest C grade',()=>{
 const g=new Core({seed:58});g.start();g.player.hp=100;
 for(let i=0;i<12;i++)crossAt(g,{aligned:![2,6,9,11].includes(i)});
 assert.equal(g.state,'won');assert.equal(g.passed,8);assert.equal(g.missed,4);assert.equal(g.grade,'C');
});
test('training mode has wider gates and additional health, and cannot change mid-flight',()=>{
 const standard=new Core({seed:101}),training=new Core({seed:101,mode:'training'});
 standard.start();training.start();
 const gs=standard.spawn(),gt=training.spawn();
 assert.equal(standard.player.hp,4);assert.equal(training.player.hp,5);
 assert.ok(gt.halfW>gs.halfW&&gt.halfH>gs.halfH&&gt.velocity<gs.velocity);
 assert.equal(training.setMode('standard'),false);
 training.state='lost';assert.equal(training.setMode('standard'),true);assert.equal(training.mode,'standard');
 assert.equal(training.player.maxHp,4);
});
test('shielded misses are tracked separately from perfectly aligned passages',()=>{
 const g=new Core({seed:77});g.start();
 assert.equal(g.pulse(),true);crossAt(g,{aligned:false});
 assert.equal(g.passed,0);assert.equal(g.shielded,1);assert.equal(g.missed,0);
 assert.equal(g.resolved,1);assert.equal(g.player.hp,4);
});
test('gate wall renderer matches the logical world box, not an offset y center',()=>{
 const s=fs.readFileSync(require('node:path').join(__dirname,'../orbit-vector-render.js'),'utf8');
 assert.match(s,/cube\(\(left\+x-xx\)\/2,0,z,/);
 assert.match(s,/cube\(\(x\+xx\+right\)\/2,0,z,/);
});

test('center precision gates reward actual 3D alignment without weakening clearance collision',()=>{
 const g=new Core({seed:280});g.start();
 crossAt(g);assert.equal(g.bullseyes,1);assert.equal(g.precisionCombo,1);
 assert.equal(g.score,200,'first precision gate awards combo plus exact-center bonus');
 crossAt(g);assert.equal(g.bullseyes,2);assert.equal(g.precisionCombo,2);
 assert.equal(g.score,440,'consecutive bullseyes add a meaningful streak bonus');
 const gate=g.spawn();g.spawnClock=100;
 g.player.x=gate.x+(gate.halfW-g.player.r)*.86;g.player.y=gate.y;
 gate.z=g.player.z+.2;step(g,2);
 assert.equal(g.passed,3,'safe but off-center clearance still qualifies');
 assert.equal(g.bullseyes,2);assert.equal(g.precisionCombo,0);
 assert.equal(g.bestPrecisionCombo,2);
});
test('phase shield never creates free bullseyes and collisions break precision combo',()=>{
 const g=new Core({seed:281});g.start();crossAt(g);
 assert.equal(g.precisionCombo,1);
 crossAt(g,{aligned:false});assert.equal(g.precisionCombo,0);
 assert.equal(g.bullseyes,1);
 const h=new Core({seed:282});h.start();h.pulse();crossAt(h,{aligned:false});
 assert.equal(h.shielded,1);assert.equal(h.bullseyes,0);
 assert.equal(h.score,45);
});
test('ACE difficulty has faster smaller gates, three HP and ten required clears',()=>{
 const normal=new Core({seed:283}),ace=new Core({seed:283,mode:'ace'});
 normal.start();ace.start();
 const g1=normal.spawn(),g2=ace.spawn();
 assert.equal(ace.player.maxHp,3);
 assert.ok(g2.halfW<g1.halfW&&g2.halfH<g1.halfH);
 assert.ok(g2.velocity>g1.velocity);
 const lost=new Core({seed:284,mode:'ace'});lost.start();
 for(let i=0;i<12;i++)crossAt(lost,{aligned:![0,4,8].includes(i)});
 assert.equal(lost.resolved,12);assert.equal(lost.passed,9);
 assert.equal(lost.state,'lost');assert.equal(lost.grade,'INSUFFICIENT PASSES');
 assert.ok(lost.player.hp>0,'failure is qualification, not hull depletion');
 const won=new Core({seed:285,mode:'ace'});won.start();
 for(let i=0;i<12;i++)crossAt(won,{aligned:![0,4].includes(i)});
 assert.equal(won.state,'won');assert.equal(won.passed,10);
 assert.equal(won.bullseyes,10);assert.equal(won.player.hp>0,true);
 assert.equal(won.setMode('training'),true);assert.equal(won.player.hp,5);
});
test('ACE perfect S grade demands center mastery rather than merely zero misses',()=>{
 const g=new Core({seed:286,mode:'ace'});g.start();
 for(let i=0;i<12;i++){
  const gate=g.spawn();g.spawnClock=100;
  g.player.x=gate.x+(gate.halfW-g.player.r)*.8;g.player.y=gate.y;
  gate.z=g.player.z+.2;step(g,2);
 }
 assert.equal(g.state,'won');assert.equal(g.passed,12);
 assert.equal(g.bullseyes,0);assert.equal(g.grade,'A');
});
