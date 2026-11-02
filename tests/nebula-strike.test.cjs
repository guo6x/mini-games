const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../orbit-nebula-core.js');
const frames=(g,n,input={})=>{for(let i=0;i<n;i++)g.update(1/60,input);};
const advance=(g,w)=>{const deadline=16+w*3;g.waveTime=deadline-1/30;frames(g,4);assert.equal(g.phase,'draft');};

test('rules kernel works without DOM and starts a reproducible three-wave campaign',()=>{
 const a=new Core({seed:1201}),b=new Core({seed:1201});
 assert.equal(a.phase,'wave');assert.equal(a.wave,1);assert.equal(a.player.hp,5);
 assert.equal(a.shots.length,0);assert.equal(a.score,0);
 frames(a,300,{right:true});frames(b,300,{right:true});
 const view=g=>({seed:g.seed,score:g.score,hp:g.player.hp,wave:g.wave,phase:g.phase,x:g.player.x,y:g.player.y,enemy:g.enemies.map(e=>[e.id,e.kind,e.x,e.y,e.hp]),hostile:g.hostile.length});
 assert.deepEqual(view(a),view(b),'Two equal seeded simulations with equal input must agree');
 assert.ok(a.shots.length>0||a.kills>0,'Automatic fire should spawn bullets');
});
test('each wave leads to a distinct meaningful upgrade offer and eventually a boss',()=>{
 const run=new Core({seed:49}),events=[];run.emit=e=>events.push(e);
 for(let wave=1;wave<=3;wave++){
  assert.equal(run.wave,wave);
  advance(run,wave);
  assert.equal(run.choices.length,3);
  assert.equal(new Set(run.choices).size,3);
  assert.equal(run.pickUpgrade(-1),false,'Invalid index must not change phase');
  assert.equal(run.pickUpgrade(0),true);
  assert.equal(run.upgradeHistory.length,wave);
  assert.equal(run.phase,wave===3?'boss':'wave');
 }
 assert.equal(run.wave,4);assert.ok(run.boss.hp>0);
 assert.ok(events.some(e=>e.type==='boss'));
});
test('draft freezes gameplay until a valid player choice and does not grant score repeatedly',()=>{
 const g=new Core({seed:207});advance(g,1);
 const score=g.score,p={...g.player},phase=g.phase,choices=g.choices.slice();
 frames(g,900,{down:true,right:true});
 assert.equal(g.phase,phase);assert.equal(g.score,score);
 assert.equal(g.player.x,p.x);assert.equal(g.player.y,p.y);
 assert.deepEqual(g.choices,choices);
 assert.equal(g.pickUpgrade(99),false);
 assert.equal(g.pickUpgrade(1),true);
 assert.equal(g.phase,'wave');
});
test('shield, invulnerability frames and dash cooldown enforce bounded damage',()=>{
 const g=new Core({seed:33});g.hitPlayer();assert.equal(g.player.hp,4);
 g.hitPlayer();assert.equal(g.player.hp,4,'Invulnerability prevents repeated hits on same frame');
 g.player.inv=0;g.player.shield=1;g.hitPlayer();
 assert.equal(g.player.shield,0);assert.equal(g.player.hp,4,'Shield is consumed first');
 g.player.inv=0;g.player.dx=1;g.player.dy=0;
 assert.equal(g.unlockDash(),true);
 assert.equal(g.unlockDash(),false,'Dash cannot be spammed while cooling down');
 const x=g.player.x;frames(g,4,{right:true});assert.ok(g.player.x>x);
 const hp=g.player.hp;g.hitPlayer();assert.equal(g.player.hp,hp,'Dash grants brief invulnerability');
});
test('player projectiles actually damage enemies and award kill score only once',()=>{
 const g=new Core({seed:11});g.spawnTime=100;
 g.enemies=[{id:220,kind:'scout',x:402,y:300,hp:1,maxHp:1,r:15,age:0,seed:0,speed:0,nextShot:100,dead:false}];
 g.shots=[{x:402,y:300,vx:0,vy:0,r:4,damage:2,ttl:2,hit:new Set()}];
 frames(g,1);
 assert.equal(g.enemies.length,0);assert.equal(g.kills,1);assert.ok(g.score>0);
 frames(g,2);assert.equal(g.kills,1);
});
test('boss death reaches genuine victory state and cannot be scored twice',()=>{
 const g=new Core({seed:22});
 for(let w=1;w<=3;w++){advance(g,w);g.pickUpgrade(0);}
 assert.equal(g.phase,'boss');
 g.boss.hp=1;
 g.shots.push({x:400,y:g.boss.y,vx:0,vy:0,r:5,damage:3,ttl:2,hit:new Set()});
 frames(g,1);
 assert.equal(g.phase,'victory');assert.equal(g.finished,true);assert.ok(g.score>=5000);
 const score=g.score;frames(g,200);assert.equal(g.score,score);
});
test('hull reaching zero causes defeat and locks controls permanently',()=>{
 const g=new Core({seed:23});g.player.inv=0;
 for(let i=0;i<5;i++){g.player.inv=0;g.hitPlayer();}
 assert.equal(g.phase,'defeat');assert.equal(g.player.hp,0);assert.equal(g.finished,true);
 assert.equal(g.unlockDash(),false);
 frames(g,200);assert.equal(g.phase,'defeat');
 g.reset();assert.equal(g.phase,'wave');assert.equal(g.player.hp,5);
});
test('weapon upgrades change firing interval and fire pattern',()=>{
 const g=new Core({seed:8});
 const first=g.shots.length;g.firePlayer();assert.equal(g.shots.length-first,1);
 g.mods.spread=1;g.mods.rapid=1;g.mods.power=1;
 const prev=g.shots.length;g.firePlayer();
 assert.equal(g.shots.length-prev,3);
 assert.ok(g.fireTime<.23);
 assert.ok(g.shots.at(-1).damage>1.6);
});
