/* NEBULA STRIKE — bespoke visual and input adapter for the existing ORBIT ARCADE shell.
 * Canvas art is procedural and licensed as repository source; no CDN, image fetch or audio assets.
 */
(function(){
'use strict';
const Core=window.NebulaStrikeCore;
if(!Core)throw new Error('NebulaStrikeCore must be loaded before orbit-nebula-strike.js');
window.ORBIT_FLAGSHIP_META={
 'space-shooter':{
   name:'NEBULA STRIKE · 星云突围',
   sub:'三波战役 · 武装升级 · 相位冲刺 · 最终 Boss',
   instruction:'移动：WASD / 方向键，手机在战场拖动战机。自动开火；空格或屏幕操作按钮发动无敌冲刺。每波结束后选择 1–3 项升级之一，最后击败星云核心。闪光红色预警带会变成危险光束。',
   hint:'靠近敌弹但不碰撞可获得擦弹加分并加速冲刺充能；优先在移动中躲弹幕，用冲刺穿越密集火力；升级卡可点击或按数字 1、2、3。战役完成或船体归零结算。',
   accent:'#85f6db'
 }
};
window.ORBIT_FLAGSHIP=function({ctx,fill,text,points,level,finish,notify,tone,keys}){
const W=800,H=500;
const palette={mint:'#85f6db',cyan:'#7be5ff',gold:'#ffd994',rose:'#ff83b1',violet:'#b7a5ff'};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const R=(x,y,w,h,c,r=0)=>fill(x,y,w,h,c,r);
const T=(s,x,y,size=16,color='#edfaff',align='left',weight=700)=>text(s,x,y,size,color,align,weight);
const ring=(x,y,r,color,lw=2)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();};
const disc=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
const glow=(x,y,r,color)=>{const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
const starfield=Array.from({length:76},(_,i)=>({
 x:((i*163+29)%781)+7,
 y:((i*i*47+i*31)%440)+45,
 speed:7+(i*17)%29,
 size:i%9===0?1.8:.8
}));
function shipShape(x,y,t,inv){
 ctx.save();ctx.translate(x,y);
 if(inv>0&&Math.floor(t*17)%2===0)ctx.globalAlpha=.6;
 const flame=14+Math.sin(t*29)*7;
 const trail=ctx.createLinearGradient(0,9,0,flame+32);
 trail.addColorStop(0,'#aafcf9c0');trail.addColorStop(.36,'#52bff0a3');trail.addColorStop(1,'#5a65ff00');
 ctx.fillStyle=trail;ctx.beginPath();ctx.moveTo(-9,13);ctx.lineTo(0,flame+28);ctx.lineTo(9,13);ctx.fill();
 ctx.shadowBlur=17;ctx.shadowColor='#8ef9e2';
 ctx.fillStyle='#8ceee0';ctx.strokeStyle='#e9fffd';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(13,-7);ctx.lineTo(24,15);ctx.lineTo(7,9);ctx.lineTo(0,15);ctx.lineTo(-7,9);ctx.lineTo(-24,15);ctx.lineTo(-13,-7);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#0d3e59';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(7,-2);ctx.lineTo(0,5);ctx.lineTo(-7,-2);ctx.fill();
 ring(0,0,25,'#65bde735',1);
 ctx.restore();
}
function enemyShape(e,t){
 ctx.save();ctx.translate(e.x,e.y);
 const c=e.kind==='gunner'?palette.rose:e.kind==='weaver'?palette.violet:palette.gold;
 ctx.shadowBlur=12;ctx.shadowColor=c;
 ctx.fillStyle='#213351';ctx.strokeStyle=c;ctx.lineWidth=2.4;
 if(e.kind==='gunner'){
  ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(23,-7);ctx.lineTo(21,15);ctx.lineTo(0,19);ctx.lineTo(-21,15);ctx.lineTo(-23,-7);ctx.closePath();ctx.fill();ctx.stroke();
  disc(0,1,7,c);
 }else if(e.kind==='weaver'){
  ctx.rotate(t*1.3+e.seed);ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?10:22;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
  ctx.closePath();ctx.fill();ctx.stroke();
  disc(0,0,5,'#ebf8ff');
 }else{
  ctx.beginPath();ctx.moveTo(0,17);ctx.lineTo(-18,-13);ctx.lineTo(0,-7);ctx.lineTo(18,-13);ctx.closePath();ctx.fill();ctx.stroke();
  R(-7,-5,14,8,c,3);
 }
 ctx.restore();
}
function bossShape(b,t){
 const x=b.x,y=b.y;
 glow(x,y,116,'#9240ac44');ctx.save();ctx.translate(x,y);
 for(let i=0;i<3;i++){
  ctx.save();ctx.rotate(t*(i%2?-0.38:.29)+i*2.1);
  ctx.strokeStyle=['#b6a6ff77','#ff87bd99','#77e7f5aa'][i];
  ctx.lineWidth=i===2?4:2;
  ctx.beginPath();ctx.ellipse(0,0,65+i*10,37+i*7,0,0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
 ctx.rotate(Math.sin(t*.7)*.16);
 ctx.shadowBlur=25;ctx.shadowColor='#f48dd2';
 ctx.fillStyle='#3c2e67';ctx.strokeStyle='#f5a9da';ctx.lineWidth=3;
 ctx.beginPath();
 for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,r=i%2?35:56;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
 ctx.closePath();ctx.fill();ctx.stroke();
 glow(0,0,35,'#ffc2f899');disc(0,0,17,'#f8b8f2');disc(0,0,7,'#fff');
 ctx.restore();
}
function progressBar(x,y,w,f,color){
 R(x,y,w,6,'#2c435b',4);R(x,y,w*clamp(f,0,1),6,color,4);
}
function drawBackground(run){
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#071326');g.addColorStop(.55,'#0c1c38');g.addColorStop(1,'#0c1230');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const t=run.clock;
 glow(142+Math.sin(t*.18)*45,151,240,'#246ce127');
 glow(610+Math.cos(t*.12)*42,260,210,'#9a4fd825');
 glow(405,430,230,'#12a4a019');
 for(const s of starfield){
  const y=70+((s.y-70+(t*s.speed)%415+415)%415);
  ctx.globalAlpha=.38+Math.sin(t*2+s.x)*.18;
  disc(s.x,y,s.size,'#b0dffc');
 }
 ctx.globalAlpha=1;
 ctx.strokeStyle='#81c1ea10';ctx.lineWidth=1;
 for(let x=42;x<800;x+=52){ctx.beginPath();ctx.moveTo(x,72);ctx.lineTo(x,480);ctx.stroke();}
 for(let y=88;y<480;y+=52){ctx.beginPath();ctx.moveTo(35,y);ctx.lineTo(765,y);ctx.stroke();}
 const h=ctx.createLinearGradient(0,72,0,486);h.addColorStop(0,'#96dbf10b');h.addColorStop(.65,'#3b5c6b00');h.addColorStop(1,'#7fc6f20c');
 ctx.fillStyle=h;ctx.fillRect(35,72,730,415);
 ctx.strokeStyle='#7bdcff29';ctx.lineWidth=1.2;ctx.strokeRect(34,74,732,408);
}
function drawHud(run){
 R(0,0,800,73,'#071528e6');R(0,72,800,1,'#86e0ff30');
 T('N E B U L A  S T R I K E',23,20,14,palette.mint);T('CAMPAIGN // 01',23,43,10,'#85b2d0');
 const p=run.player;
 for(let i=0;i<p.maxHp;i++){const x=277+i*24;ctx.fillStyle=i<p.hp?'#ff9daf':'#3a4058';ctx.beginPath();ctx.moveTo(x,23);ctx.lineTo(x+8,16);ctx.lineTo(x+16,23);ctx.lineTo(x+8,36);ctx.closePath();ctx.fill();}
 if(p.shield>0)T('◈'+p.shield,410,27,16,palette.cyan);
 T(String(run.score).padStart(6,'0'),601,26,23,'#f2f9ff','right');
 T('SCORE',602,48,10,'#9ab9d2','right');
 T(run.phase==='boss'?'BOSS':run.phase==='draft'?'UPGRADE':'WAVE '+run.wave+'/3',747,23,16,palette.gold,'right');
 T('KILLS '+run.kills+'  /  GRAZE '+run.grazes,744,47,11,'#98bad8','right');
 if(run.phase==='wave'){progressBar(35,77,730,run.waveTime/(16+run.wave*3),palette.mint);}
 if(run.phase==='boss'&&run.boss){progressBar(220,77,360,run.boss.hp/run.boss.maxHp,palette.rose);}
 const left=run.player.dashLeft;
 R(593,438,178,39,left<=0?'#1e756eaa':'#1b3458d8',10);
 T(left<=0?'SPACE · 相位冲刺':'冲刺冷却 '+left.toFixed(1)+'s',682,457,14,left<=0?'#c3fff4':'#c1d7f1','center');
 T('拖动飞船 / WASD 移动',34,462,12,'#93cce7');
}
function drawRun(run,fx){
 drawBackground(run);
 for(const h of run.hazards){
  if(h.time>=0){
   const opacity=.24+(Math.sin(run.clock*25)+1)*.21;ctx.fillStyle='rgba(255,97,141,'+opacity+')';
   ctx.fillRect(h.x-31,80,62,390);
   ctx.strokeStyle='#ffa0ae';ctx.strokeRect(h.x-31,80,62,390);
  }else{ctx.fillStyle='#f9b6d5c4';ctx.shadowColor='#ff77a7';ctx.shadowBlur=18;ctx.fillRect(h.x-28,80,56,390);ctx.shadowBlur=0;}
 }
 for(const e of run.enemies)enemyShape(e,run.clock);
 if(run.boss&&run.phase==='boss')bossShape(run.boss,run.clock);
 for(const s of run.shots){
  ctx.strokeStyle='#b7fff1';ctx.shadowColor='#58fce7';ctx.shadowBlur=8;ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(s.x,s.y+11);ctx.lineTo(s.x+s.vx*.02,s.y-12);ctx.stroke();ctx.shadowBlur=0;
 }
 for(const b of run.hostile){glow(b.x,b.y,16,'#ff86ad6e');disc(b.x,b.y,6,palette.rose);disc(b.x,b.y,2,'#fff');}
 for(const v of fx){disc(v.x,v.y,v.r,'rgba('+v.rgb+','+v.life/v.max+')');}
 const p=run.player;glow(p.x,p.y,55,'#5cfff13a');shipShape(p.x,p.y,run.clock,p.inv);
 if(run.phase==='boss'){
  T('SIGNAL LOST // THE CORE AWAKENS',400,106,13,palette.rose,'center');
 }
 if(run.phase==='wave'&&run.waveTime<2)T('SECTOR 0'+run.wave+' · '+['航道突破','火线交错','终端封锁'][run.wave-1],400,122,24,'#e4f8ff','center');
 drawHud(run);
}
function drawDraft(run){
 drawRun(run,[]);
 R(42,89,716,346,'#07172bf3',20);
 ctx.strokeStyle='#91ddfe88';ctx.lineWidth=1;ctx.strokeRect(43,90,714,344);
 T('SECTOR CLEARED',400,120,12,palette.gold,'center');
 T('选择本波战利品',400,159,27,'#f5fbff','center');
 for(let i=0;i<3;i++){
  const x=84+i*217,id=run.choices[i],item=Core.UPGRADES[id];
  R(x,197,198,170,'#1a304f',14);R(x,197,198,4,item.color,3);
  ctx.strokeStyle='#80b8e84b';ctx.strokeRect(x+1,198,196,168);
  T('0'+(i+1),x+99,226,18,item.color,'center');
  ring(x+99,264,20,item.color,2);T(['✶','⬡','◆'][i],x+99,266,19,item.color,'center');
  T(item.name,x+99,316,18,'#f3fbff','center');
  T(item.desc,x+99,343,12,'#bcd7ee','center',500);
 }
 T('按 1 / 2 / 3 或点击升级卡 · 继续战役',400,398,14,palette.mint,'center');
}
function particleBurst(fx,x,y,rgb,n=11){
 for(let i=0;i<n;i++){
  const a=i*Math.PI*2/n,v=38+(i%5)*24,t=.32+(i%3)*.08;
  fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:t,max:t,r:1.5+(i%3),rgb});
 }
 if(fx.length>170)fx.splice(0,fx.length-170);
}
return {'space-shooter':()=>({
 init(){
  this.fx=[];this.pointer=null;this.endShown=false;this.queue=[];
  this.run=new Core({seed:(Date.now()>>>0)||12345,emit:e=>this.queue.push(e)});
  points(0);level('WAVE 1 / 3');
  document.querySelector('.game-intro .eyebrow').textContent='PLAY / FLAGSHIP CAMPAIGN';
  notify('第 1 波：拖动飞船或使用 WASD，自动射击，空格触发相位冲刺。');
  const action=document.querySelector('.touch-panel [data-key="Space"]');
  if(action){action.textContent='冲刺';action.setAttribute('aria-label','相位冲刺');}
  const full=document.querySelector('.immersive-dpad [data-key="Space"]');
  if(full)full.textContent='冲刺';
 },
 key(code){
  if(/^Digit[1-3]$/.test(code)&&this.run.phase==='draft'){this.choose(Number(code.slice(-1))-1);return;}
  if(code==='Space')this.run.unlockDash();
 },
 choose(index){
  if(this.run.pickUpgrade(index)){points(this.run.score);level(this.run.phase==='boss'?'BOSS / FINAL':'WAVE '+this.run.wave+' / 3');}
 },
 click(x,y){
  if(this.run.phase==='draft'){
   if(y>=197&&y<=370){for(let i=0;i<3;i++){const l=84+i*217;if(x>=l&&x<=l+198){this.choose(i);return;}}}
   return;
  }
  if(x>581&&y>423){this.run.unlockDash();return;}
  this.pointer={x,y};
 },
 pointerMove(x,y){
  if(this.run.phase==='wave'||this.run.phase==='boss')this.pointer={x,y};
 },
 pointerUp(){this.pointer=null;},
 update(dt){
  const run=this.run;
  const input={left:keys.has('ArrowLeft')||keys.has('KeyA'),right:keys.has('ArrowRight')||keys.has('KeyD'),
   up:keys.has('ArrowUp')||keys.has('KeyW'),down:keys.has('ArrowDown')||keys.has('KeyS'),pointer:this.pointer};
  run.update(dt,input);
  for(const v of this.fx){v.x+=v.vx*dt;v.y+=v.vy*dt;v.life-=dt;}
  this.fx=this.fx.filter(v=>v.life>0);
  for(const e of this.queue.splice(0)){
   if(e.type==='graze'){particleBurst(this.fx,e.x,e.y,'130,238,255',5);if(e.chain%5===0)notify('擦弹连击 '+e.chain+' · 冲刺充能加速');}
   if(e.type==='kill')particleBurst(this.fx,e.x,e.y,'134,245,211',13);
   if(e.type==='impact')particleBurst(this.fx,e.x,e.y,'255,165,212',4);
   if(e.type==='hurt'){tone(155);notify('船体受损！剩余 '+e.hp+' 点船体值。');}
   if(e.type==='shield-hit'){tone(320);notify('屏障抵挡了一次攻击。');}
   if(e.type==='dash'){tone(630);}
   if(e.type==='upgrade'){tone(785);notify('已装配 '+e.name+'，准备下一波。');}
   if(e.type==='draft'){tone(880);notify('已清理第 '+e.wave+' 波，选一项强化才能继续。');}
   if(e.type==='boss'){tone(230);notify('最终 Boss 出现！注意红色预警光束。');}
   if(e.type==='warning')notify('红色区域预警！尽快撤离危险轨道。');
  }
  points(run.score);
  level(run.phase==='draft'?'UPGRADE':run.phase==='boss'?'BOSS':run.phase==='wave'?'WAVE '+run.wave+'/3':run.phase==='victory'?'CLEAR':'GAME OVER');
  if(!this.endShown&&(run.phase==='victory'||run.phase==='defeat')){
   this.endShown=true;
   finish(run.phase==='victory'?'星云突围成功 · 核心已击破':'战机损毁 · 挑战结束');
   const rank=run.phase==='victory'?(run.player.hp>=4?'S':run.player.hp>=2?'A':'B'):'—';
   const endCard=document.getElementById('overlayDescription');
   if(endCard)endCard.textContent='评价 '+rank+' · 击落 '+run.kills+' 架 · '+run.score+' 分 · 战役时间 '+Math.floor(run.totalTime)+' 秒 · 武装 '+run.upgradeHistory.length+'/3';

  }
 },
 draw(){
  if(!this.run){R(0,0,W,H,'#07152a');return;}
  if(this.run.phase==='draft')drawDraft(this.run);
  else drawRun(this.run,this.fx);
 },
})};
};
})();