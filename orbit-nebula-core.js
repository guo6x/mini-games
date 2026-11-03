/* NEBULA STRIKE — deterministic rules kernel. No DOM/Canvas dependency.
 * Uses a seeded RNG, fixed-step physics and separate state snapshots for reproducible gameplay tests.
 * A game run is intentionally small: three escalating waves, three meaningful upgrade drafts and one boss.
 */
(function(root,factory){
  const Game=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=Game;
  if(root)root.NebulaStrikeCore=Game;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const WIDTH=800,HEIGHT=500,MIN_X=33,MAX_X=767,MIN_Y=92,MAX_Y=472;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const UPGRADE={
   spread:{name:'双翼火力',desc:'增加两侧的扩散副炮',color:'#9ef5d9'},
   rapid:{name:'脉冲增压',desc:'射击间隔减少 22%',color:'#92c9ff'},
   hull:{name:'装甲修复',desc:'立即恢复 2 点船体值',color:'#ffd1a0'},
   dash:{name:'相位引擎',desc:'冲刺冷却缩短 32%',color:'#c5a7ff'},
   power:{name:'等离子弹头',desc:'单发伤害提升 45%',color:'#ff9fc9'},
   barrier:{name:'能量屏障',desc:'获得 1 层抵挡伤害的屏障',color:'#89e9f4'}
 };
 class NebulaStrike {
   constructor({seed=419,emit=()=>{}}={}){
     this.seed=seed>>>0||419;this.emit=emit;
     this.upgrades=UPGRADE;this.reset();
   }
   rnd(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
   between(a,b){return a+(b-a)*this.rnd();}
   event(type,detail={}){this.emit({type,...detail});}
   reset(){
     this.phase='wave';this.wave=1;this.waveTime=0;this.totalTime=0;this.draftCount=0;
     this.player={x:400,y:404,hp:5,maxHp:5,shield:0,inv:0,dashLeft:0,dashDuration:0,dx:0,dy:-1};
     this.mods={spread:0,rapid:0,power:0,dash:0};
     this.enemies=[];this.shots=[];this.hostile=[];this.hazards=[];
     this.boss=null;this.spawnTime=.55;this.fireTime=.2;this.bossFire=1.2;this.bossBeam=4.5;
     this.clock=0;this.acc=0;this.score=0;this.kills=0;this.combo=0;this.grazes=0;this.grazeChain=0;
     this.nextId=0;this.choices=[];this.upgradeHistory=[];this.finished=false;
     this.events=[];
     this.event('start');
   }
   unlockDash(){
     const p=this.player;if(p.dashLeft>0||this.phase==='draft'||this.phase==='victory'||this.phase==='defeat')return false;
     const length=Math.hypot(p.dx,p.dy)||1;p.dx/=length;p.dy/=length;
     p.dashDuration=.22;p.inv=Math.max(p.inv,.29);
     p.dashLeft=Math.max(2.2,6.8-this.mods.dash*2.2);
     this.event('dash');return true;
   }
   pickUpgrade(index){
     if(this.phase!=='draft'||!Number.isInteger(index)||index<0||index>=this.choices.length)return false;
     const id=this.choices[index];this.upgradeHistory.push(id);
     if(id==='hull')this.player.hp=clamp(this.player.hp+2,0,this.player.maxHp);
     else if(id==='barrier')this.player.shield+=1;
     else this.mods[id]+=1;
     this.event('upgrade',{id,name:UPGRADE[id].name});
     this.choices=[];this.draftCount++;
     if(this.wave>=3)this.startBoss();
     else this.startWave(this.wave+1);
     return true;
   }
   startWave(n){
     this.phase='wave';this.wave=n;this.waveTime=0;this.spawnTime=.65;this.fireTime=.1;
     this.enemies=[];this.hostile=[];this.shots=[];this.hazards=[];
     this.combo=0;this.player.inv=Math.max(this.player.inv,1.2);
     this.event('wave',{wave:n});
   }
   startBoss(){
     this.phase='boss';this.wave=4;this.waveTime=0;
     this.enemies=[];this.hostile=[];this.shots=[];this.hazards=[];
     this.boss={id:++this.nextId,x:400,y:142,r:52,hp:138,maxHp:138,phase:0,stage:1};
     this.bossFire=.55;this.bossBeam=3;this.fireTime=.1;
     this.player.inv=Math.max(this.player.inv,1.4);
     this.event('boss');
   }
   draft(){
     this.phase='draft';this.enemies=[];this.shots=[];this.hostile=[];this.hazards=[];
     const pool=['spread','rapid','hull','dash','power','barrier'];
     for(let i=pool.length-1;i>0;i--){const j=Math.floor(this.rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
     this.choices=pool.slice(0,3);
     this.score+=350*this.wave;
     this.event('draft',{wave:this.wave,options:this.choices.slice()});
   }
   spawn(kind){
     const n=++this.nextId,x=this.between(78,722);
     const enemy={
       id:n,kind:kind||'scout',x,y:67,
       hp:kind==='gunner'?6:kind==='weaver'?4:3,
       maxHp:kind==='gunner'?6:kind==='weaver'?4:3,
       r:kind==='gunner'?21:kind==='weaver'?17:15,
       age:0,seed:this.between(0,6.283),speed:this.between(78,112)+this.wave*13,
       nextShot:kind==='gunner'?1.1:this.between(1.5,2.8),
       dead:false
     };
     this.enemies.push(enemy);this.event('spawn',{kind:enemy.kind});
   }
   firePlayer(){
     const p=this.player;
     const interval=Math.max(.08,.23*Math.pow(.78,this.mods.rapid));
     this.fireTime=interval;
     const amount=1+(this.mods.spread>0?2:0);
     for(let i=0;i<amount;i++){
       const angle=amount===1?0:(i-1)*.18;
       const v=540;
       this.shots.push({
         x:p.x+(i-1)*8,y:p.y-22,vx:Math.sin(angle)*v,vy:-Math.cos(angle)*v,
         r:4,damage:1.6+this.mods.power*.72,ttl:1.3,hit:new Set()
       });
     }
     this.event('shot');
   }
   fireHostile(x,y,speed=195,angle=null){
     const target=this.player,rad=angle===null?Math.atan2(target.y-y,target.x-x):angle;
     this.hostile.push({x,y,vx:Math.cos(rad)*speed,vy:Math.sin(rad)*speed,r:6,ttl:4,grazed:false});
   }
   hitPlayer(){
     const p=this.player;
     if(p.inv>0||p.dashDuration>0||this.phase==='defeat')return;
     p.inv=1.1;this.combo=0;this.grazeChain=0;
     if(p.shield>0){p.shield--;this.event('shield-hit');return;}
     p.hp--;this.event('hurt',{hp:p.hp});
     if(p.hp<=0){
       this.phase='defeat';this.finished=true;
       this.event('defeat',{score:this.score,kills:this.kills});
     }
   }
   hitEnemy(target,shot){
     if(shot.hit.has(target.id)||target.dead)return;
     shot.hit.add(target.id);shot.ttl=0;
     target.hp-=shot.damage;
     this.event('impact',{x:target.x,y:target.y});
     if(target.hp>0)return;
     target.dead=true;this.kills++;this.combo=Math.min(30,this.combo+1);
     this.score+=(target.kind==='gunner'?120:target.kind==='weaver'?95:70)+this.combo*5;
     this.event('kill',{x:target.x,y:target.y,kind:target.kind});
   }
   endBoss(){
     if(this.phase!=='boss')return;
     this.boss.hp=0;this.phase='victory';this.finished=true;this.score+=5000+this.player.hp*250;
     this.event('victory',{score:this.score,kills:this.kills,hp:this.player.hp});
   }
   update(dt,input={}){
     if(!Number.isFinite(dt)||dt<=0)return;
     if(this.phase==='draft'||this.finished)return;
     this.acc=Math.min(.2,this.acc+Math.min(dt,.1));
     const step=1/60;let guard=0;
     while(this.acc+1e-10>=step&&guard++<12){
       this.acc-=step;this.tick(step,input);
       if(this.phase==='draft'||this.finished){this.acc=0;break;}
     }
   }
   tick(dt,input){
     const p=this.player;
     this.clock+=dt;this.totalTime+=dt;this.waveTime+=dt;
     p.inv=Math.max(0,p.inv-dt);
     p.dashLeft=Math.max(0,p.dashLeft-dt);
     const dx=(input.right?1:0)-(input.left?1:0);
     const dy=(input.down?1:0)-(input.up?1:0);
     const length=Math.hypot(dx,dy);
     if(length>0){p.dx=dx/length;p.dy=dy/length;}
     if(p.dashDuration>0){
       p.dashDuration=Math.max(0,p.dashDuration-dt);
       p.x+=p.dx*865*dt;p.y+=p.dy*865*dt;
     }else if(input.pointer&&Number.isFinite(input.pointer.x)&&Number.isFinite(input.pointer.y)){
       const tx=clamp(input.pointer.x,MIN_X,MAX_X),ty=clamp(input.pointer.y,MIN_Y,MAX_Y);
       const mx=tx-p.x,my=ty-p.y,mag=Math.hypot(mx,my);
       const speed=Math.min(mag,360*dt);
       if(mag>1){p.x+=mx/mag*speed;p.y+=my/mag*speed;}
     }else if(length>0){p.x+=dx/length*270*dt;p.y+=dy/length*270*dt;}
     p.x=clamp(p.x,MIN_X,MAX_X);p.y=clamp(p.y,MIN_Y,MAX_Y);
     this.fireTime-=dt;if(this.fireTime<=0)this.firePlayer();
     for(const s of this.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.ttl-=dt;}
     for(const h of this.hostile){h.x+=h.vx*dt;h.y+=h.vy*dt;h.ttl-=dt;}
     if(this.phase==='wave')this.tickWave(dt);
     else if(this.phase==='boss')this.tickBoss(dt);
     // Simultaneous projectiles may not inflict multiple hits during invulnerability.
     for(const s of this.shots){
       if(s.ttl<=0)continue;
       if(this.boss&&this.phase==='boss'&&distance(s,this.boss)<this.boss.r+s.r){
         this.hitEnemy(this.boss,s);
         if(this.boss.dead){this.endBoss();break;}
       }else{
         for(const e of this.enemies){
           if(!e.dead&&distance(s,e)<e.r+s.r){this.hitEnemy(e,s);break;}
         }
       }
     }
     if(this.finished)return;
     for(const h of this.hostile){if(h.ttl<=0)continue;const gap=distance(h,p);if(gap<h.r+12){h.ttl=0;this.hitPlayer();}else if(!h.grazed&&gap<h.r+30&&p.inv<=0&&p.dashDuration<=0){h.grazed=true;this.grazes++;this.grazeChain=Math.min(20,this.grazeChain+1);const bonus=10+this.grazeChain*3;this.score+=bonus;p.dashLeft=Math.max(0,p.dashLeft-.32);this.event('graze',{x:h.x,y:h.y,chain:this.grazeChain,bonus});}}
     for(const e of this.enemies){
       if(!e.dead&&distance(e,p)<e.r+13){e.dead=true;this.hitPlayer();}
     }
     for(const beam of this.hazards){
       beam.time-=dt;
       if(beam.time<0&&beam.time>-.42&&Math.abs(p.x-beam.x)<33)this.hitPlayer();
     }
     this.enemies=this.enemies.filter(e=>!e.dead&&e.y<MAX_Y+40);
     this.shots=this.shots.filter(s=>s.ttl>0&&s.y>56&&s.y<HEIGHT+30);
     this.hostile=this.hostile.filter(h=>h.ttl>0&&h.y>52&&h.y<HEIGHT+30&&h.x>-30&&h.x<WIDTH+30);
     this.hazards=this.hazards.filter(b=>b.time>-.44);
   }
   tickWave(dt){
     this.spawnTime-=dt;
     if(this.spawnTime<=0){
       const dice=this.rnd();
       const kind=this.wave===1?(dice<.24?'weaver':'scout'):dice<.27?'gunner':dice<.58?'weaver':'scout';
       this.spawn(kind);this.spawnTime=Math.max(.38,.98-this.wave*.13)*this.between(.82,1.18);
     }
     for(const e of this.enemies){
       e.age+=dt;
       e.y+=e.speed*dt;
       if(e.kind==='weaver')e.x+=Math.sin(e.age*5.2+e.seed)*85*dt;
       if(e.kind==='gunner'){e.y-=e.speed*.46*dt;e.nextShot-=dt;if(e.nextShot<=0){this.fireHostile(e.x,e.y,179+this.wave*9);e.nextShot=1.55;}}
       if(e.kind==='scout'&&this.wave>=3){e.nextShot-=dt;if(e.nextShot<=0){this.fireHostile(e.x,e.y,158);e.nextShot=2.4;}}
       e.x=clamp(e.x,32,768);
     }
     const target=16+this.wave*3;
     if(this.waveTime>=target)this.draft();
   }
   tickBoss(dt){
     const b=this.boss;
     b.phase+=dt;
     b.x=400+Math.sin(b.phase*.83)*169;
     b.y=138+Math.sin(b.phase*1.53)*20;
     const stage=b.hp<=46?3:b.hp<=92?2:1;
     if(stage!==b.stage){b.stage=stage;this.bossFire=Math.min(this.bossFire,.45);this.bossBeam=Math.min(this.bossBeam,1.2);this.event('boss-stage',{stage});}
     this.bossFire-=dt;
     if(this.bossFire<=0){
       // Three aimed bullets leave a genuine navigable safe gap.
       const a=Math.atan2(this.player.y-b.y,this.player.x-b.x);
       const spread=stage===1?[-.25,0,.25]:stage===2?[-.48,-.24,0,.24,.48]:[-.66,-.44,-.22,0,.22,.44,.66];
       for(const offset of spread)this.fireHostile(b.x,b.y+30,205+stage*12,a+offset);
       this.bossFire=stage===1?.94:stage===2?.79:.68;
       this.event('volley');
     }
     this.bossBeam-=dt;
     if(this.bossBeam<=0){
       const x=clamp(this.player.x,95,705);
       this.hazards.push({x,time:.93});
       if(stage===3){const other=x<400?Math.min(705,x+185):Math.max(95,x-185);this.hazards.push({x:other,time:.93});}
       this.bossBeam=stage===1?4.1:stage===2?3.4:2.9;this.event('warning');
     }
     if(b.hp<95){
       this.spawnTime-=dt;
       if(this.spawnTime<=0){this.spawn('weaver');this.spawnTime=4.3;}
     }
     for(const e of this.enemies){e.age+=dt;e.y+=e.speed*dt;e.x+=Math.sin(e.age*4.2+e.seed)*45*dt;}
   }
 }
 NebulaStrike.UPGRADES=UPGRADE;
 return NebulaStrike;
});