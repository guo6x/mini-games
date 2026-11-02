/* VECTOR RUN — self-contained 3D arcade flight simulation.
 * World positions and collision volumes are real (x,y,z) coordinates.
 * Renderer and tests consume the same deterministic fixed-step kernel.
 */
(function(root,factory){
 const C=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=C;
 if(root)root.VectorRunCore=C;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 class VectorRunCore {
  constructor(options={}){
   this.initialSeed=(options.seed>>>0)||20261103;
   this.mode=options.mode==='training'?'training':'standard';
   this.events=typeof options.onEvent==='function'?options.onEvent:()=>{};
   this.reset();
  }
  setMode(mode){if(this.state==='running'||this.state==='paused')return false;this.mode=mode==='training'?'training':'standard';this.reset();return true;}
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
  emit(type,detail={}){this.events({type,...detail});}
  reset(){
   this.seed=this.initialSeed;this.state='ready';this.acc=0;this.time=0;this.spawnClock=.6;
   this.spawned=0;this.resolved=0;this.passed=0;this.shielded=0;this.missed=0;this.score=0;this.combo=0;this.bestCombo=0;this.grade='';
   this.gates=[];this.nextId=1;this.player={x:0,y:0,z:10,r:.3,hp:this.mode==='training'?5:4,maxHp:this.mode==='training'?5:4,shield:0,cooldown:0};
   this.goal=12;this.lastOutcome='';this.emit('reset');
  }
  start(){this.reset();this.state='running';this.emit('start');}
  pause(){if(this.state==='running'){this.state='paused';return true;}if(this.state==='paused'){this.state='running';return true;}return false;}
  pulse(){
   if(this.state!=='running'||this.player.cooldown>0)return false;
   this.player.shield=1.05;this.player.cooldown=8;this.emit('pulse');return true;
  }
  spawn(){
   const i=this.spawned,stage=Math.floor(i/4)+1,profile=[[-1.3,.15],[1.1,-.35],[-.45,.65],[.8,-.45]][i%4];
   // Every gate requires 3D alignment: lateral and vertical aperture vary independently.
   const x=clamp(profile[0]+(this.random()-.5)*.52,-2,2);
   const y=clamp(profile[1]+(this.random()-.5)*.48,-1.25,1.25);
   const size=(stage===1?1.7:stage===2?1.55:1.4)+(this.mode==='training'?.24:0);
   const gate={id:this.nextId++,x,y,z:85,halfW:size,halfH:size*.72,
      stage,kind:i%4,velocity:this.mode==='training'?18+stage*2.2:21+stage*2.8,
      resolved:false,spin:(this.random()-.5)*.18};
   this.gates.push(gate);this.spawned++;this.emit('spawn',{id:gate.id,stage});
   return gate;
  }
  cross(g){
   if(g.resolved)return false;
   g.resolved=true;this.resolved++;
   const p=this.player;
   const aligned=Math.abs(p.x-g.x)<=g.halfW-p.r&&Math.abs(p.y-g.y)<=g.halfH-p.r;
   if(aligned||p.shield>0){
    if(aligned)this.passed++;else this.shielded++;
    this.combo++;this.bestCombo=Math.max(this.combo,this.bestCombo);
    const reward=aligned?100+Math.min(this.combo,10)*25:45;
    this.score+=reward;this.lastOutcome=aligned?'PERFECT GATE':'PHASE SAVE';
    this.emit('pass',{id:g.id,score:reward,combo:this.combo,phased:!aligned});
   }else{
    this.missed++;
    p.hp--;this.combo=0;this.lastOutcome='HULL IMPACT';
    this.emit('impact',{id:g.id,hp:p.hp});
    if(p.hp<=0){
     this.state='lost';this.grade='HULL LOST';this.emit('lose',{score:this.score,passed:this.passed,shielded:this.shielded,missed:this.missed,reason:'hull'});
     return true;
    }
   }
   if(this.resolved===4||this.resolved===8){
    const before=p.hp;p.hp=clamp(p.hp+1,0,p.maxHp);
    this.emit('checkpoint',{stage:this.resolved/4,hp:p.hp,recovered:p.hp>before});
   }
   if(this.resolved>=this.goal){
    const clear=this.passed+this.shielded;
    if(clear<8){
     this.state='lost';this.grade='INSUFFICIENT PASSES';
     this.emit('lose',{score:this.score,passed:this.passed,shielded:this.shielded,missed:this.missed,reason:'qualification'});
    }else{
     this.state='won';this.grade=this.missed===0&&this.shielded===0?'S':this.missed<=1?'A':this.missed<=3?'B':'C';
     this.score+=Math.max(0,Math.round(1500-this.time*10))+p.hp*100;
     this.emit('win',{score:this.score,hp:p.hp,time:this.time,grade:this.grade,passed:this.passed,shielded:this.shielded,missed:this.missed});
    }
   }
   return true;
  }
  advance(seconds,input={}){
   if(!Number.isFinite(seconds)||seconds<=0||this.state!=='running')return;
   this.acc=Math.min(this.acc+Math.min(.12,seconds),.18);
   let steps=0;
   while(this.acc+1e-10>=1/60&&steps++<12){
    this.acc-=1/60;this.tick(1/60,input);
    if(this.state!=='running'){this.acc=0;break;}
   }
  }
  tick(dt,input){
   const p=this.player;this.time+=dt;
   p.cooldown=Math.max(0,p.cooldown-dt);p.shield=Math.max(0,p.shield-dt);
   let dx=(input.right?1:0)-(input.left?1:0),dy=(input.up?1:0)-(input.down?1:0);
   const len=Math.hypot(dx,dy);if(len>0){dx/=len;dy/=len;}
   if(input.target&&Number.isFinite(input.target.x)&&Number.isFinite(input.target.y)){
    const tx=clamp(input.target.x,-3.2,3.2),ty=clamp(input.target.y,-2.15,2.15);
    const vx=tx-p.x,vy=ty-p.y,dist=Math.hypot(vx,vy),move=Math.min(dist,5.5*dt);
    if(dist>0.001){p.x+=vx/dist*move;p.y+=vy/dist*move;}
   }else{p.x+=dx*4.1*dt;p.y+=dy*3.6*dt;}
   p.x=clamp(p.x,-3.2,3.2);p.y=clamp(p.y,-2.15,2.15);
   this.spawnClock-=dt;
   if(this.spawned<this.goal&&this.spawnClock<=0){
    this.spawn();
    this.spawnClock+=2.83-Math.floor((this.spawned-1)/4)*.16;
   }
   for(const g of this.gates){
    if(g.resolved)continue;
    g.z-=g.velocity*dt;
    if(g.z<=p.z){this.cross(g);if(this.state!=='running')break;}
   }
   this.gates=this.gates.filter(g=>!g.resolved&&g.z>-5);
  }
  snapshot(){
   return {state:this.state,mode:this.mode,time:this.time,spawned:this.spawned,resolved:this.resolved,passed:this.passed,shielded:this.shielded,missed:this.missed,score:this.score,
    combo:this.combo,player:{...this.player},gates:this.gates.map(g=>({...g}))};
  }
 }
 return VectorRunCore;
});