/* VECTOR RUN browser controls and game loop. No external JS, images, analytics or accounts. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const view=$('vectorView'),hud=$('vectorHud'),ui={};
const core=new window.VectorRunCore({seed:20261103,onEvent:e=>onGameEvent(e)});
const renderer=new window.VectorRunRenderer(view,hud);
const held=new Set();let pointer=null,dragId=null,last=0;
let audio=null,muted=true,highscore=0;
try{highscore=Number(localStorage.getItem('orbit-vector-best')||0);}catch(_){}
const dom={overlay:$('overlay'),start:$('startBtn'),title:$('overlayTitle'),text:$('overlayText'),
 kicker:$('overlayKicker'),state:$('gameState'),status:$('statusLine'),
 score:$('scoreValue'),progress:$('progressValue'),bar:$('progressBar'),
 life:$('lifeValue'),combo:$('comboValue'),ability:$('abilityText'),mode:$('rendererText')};
function audioBlip(freq=500,time=.065){
 if(muted)return;try{
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  audio=audio||new A();
  if(audio.state==='suspended')audio.resume();
  const o=audio.createOscillator(),gain=audio.createGain();
  o.type='triangle';o.frequency.setValueAtTime(freq,audio.currentTime);
  o.connect(gain);gain.connect(audio.destination);
  gain.gain.setValueAtTime(.028,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+time);
  o.start();o.stop(audio.currentTime+time);
 }catch(_){}
}
function status(s){dom.status.textContent=s;}
function onGameEvent(e){
 switch(e.type){
  case 'start':status('推进器就绪 · 对准第 1 道星门');audioBlip(700);break;
  case 'spawn':status('下一道星门进入雷达 · 第 '+e.id+' / 12');break;
  case 'pass':status((e.phased?'相位穿越':'完美通过')+' · 连击 x'+e.combo+' · +'+e.score);audioBlip(680+e.combo*30);break;
  case 'impact':status('撞击！船体剩余 '+e.hp+' 点');audioBlip(170,.17);break;
  case 'checkpoint':status('航段 '+e.stage+' 完成 · 检查点'+(e.recovered?'已恢复船体':'已抵达'));audioBlip(850);break;
  case 'pulse':status('相位护盾启动 · 1 秒临时保护');audioBlip(790);break;
  case 'win':status('任务完成 · 12 道星门全部通过');audioBlip(1040,.2);break;
  case 'lose':status('飞行失败 · 船体完整性归零');audioBlip(110,.2);break;
 }
}
function start(){
 held.clear();pointer=null;dragId=null;core.start();
 dom.overlay.hidden=true;dom.state.textContent='MISSION ACTIVE / 飞行中';
 $('pauseBtn').textContent='暂停';
 status('向着第一道星门飞行');
 last=performance.now();
 renderHud();
}
function showFinal(){
 let won=core.state==='won';
 dom.overlay.hidden=false;
 dom.kicker.textContent=won?'MISSION COMPLETE // 3D':'MISSION FAILED // RETRY';
 dom.title.textContent=won?'星门航线，成功突破。':'飞船受损，重新挑战。';
 dom.text.textContent='完成 '+core.resolved+' / 12 道星门 · 得分 '+core.score+
   ' · 最高连击 x'+core.bestCombo+' · '+Math.floor(core.time)+' 秒'+
   ' · 个人最佳 '+highscore;
 dom.start.textContent='重新出发 →';
 dom.state.textContent=won?'MISSION CLEAR / 通过':'MISSION FAILED / 失败';
 if(core.score>highscore){
  highscore=core.score;
  try{localStorage.setItem('orbit-vector-best',String(highscore));}catch(_){}
 }
}
function pause(){
 if(!core.pause())return;
 const paused=core.state==='paused';
 dom.state.textContent=paused?'PAUSED / 暂停':'MISSION ACTIVE / 飞行中';
 $('pauseBtn').textContent=paused?'继续':'暂停';
 held.clear();pointer=null;dragId=null;
 if(paused)status('飞行暂停');else status('已恢复飞行');
 last=performance.now();
}
function input(){
 return {
  left:held.has('left')||held.has('ArrowLeft')||held.has('KeyA'),
  right:held.has('right')||held.has('ArrowRight')||held.has('KeyD'),
  up:held.has('up')||held.has('ArrowUp')||held.has('KeyW'),
  down:held.has('down')||held.has('ArrowDown')||held.has('KeyS'),
  target:pointer
 };
}
function renderHud(){
 const p=core.player;
 dom.progress.textContent=String(core.resolved).padStart(2,'0')+' / 12';
 dom.bar.style.width=(core.resolved/12*100).toFixed(1)+'%';
 dom.life.textContent=String(Math.max(0,p.hp)).padStart(2,'0')+' / 04';
 dom.score.textContent=String(core.score).padStart(6,'0');
 dom.combo.textContent='x'+String(core.combo).padStart(2,'0');
 dom.ability.textContent=p.shield>0?'ACTIVE / '+p.shield.toFixed(1)+'s':p.cooldown>0?'COOLDOWN / '+p.cooldown.toFixed(1)+'s':'READY / SPACE';
 view.dataset.playerX=p.x.toFixed(3);view.dataset.playerY=p.y.toFixed(3);
 view.dataset.phase=core.state;view.dataset.gates=String(core.resolved);
}
function tick(now){
 requestAnimationFrame(tick);
 if(!last)last=now;
 const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
 if(core.state==='running')core.advance(dt,input());
 renderer.draw(core);
 renderHud();
 if((core.state==='won'||core.state==='lost')&&dom.overlay.hidden)showFinal();
}
function pointerToWorld(e){
 const r=view.getBoundingClientRect();
 const nx=((e.clientX-r.left)/r.width-.5)*2,ny=(.5-(e.clientY-r.top)/r.height)*2;
 return {x:Math.max(-3.2,Math.min(3.2,nx*4.4)),y:Math.max(-2.15,Math.min(2.15,ny*2.85))};
}
view.addEventListener('pointerdown',e=>{
 if(core.state!=='running')return;
 dragId=e.pointerId;pointer=pointerToWorld(e);
 try{view.setPointerCapture(e.pointerId);}catch(_){}
});
view.addEventListener('pointermove',e=>{
 if(e.pointerId===dragId&&core.state==='running')pointer=pointerToWorld(e);
});
function release(e){if(e.pointerId!==dragId)return;pointer=null;dragId=null;}
view.addEventListener('pointerup',release);view.addEventListener('pointercancel',release);
document.addEventListener('keydown',e=>{
 const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyP','Escape'];
 if(!keys.includes(e.code)||e.target.closest('input,textarea,select'))return;
 e.preventDefault();
 if(e.repeat&&['Space','KeyP','Escape'].includes(e.code))return;
 if(e.code==='KeyP'||e.code==='Escape'){pause();return;}
 if(e.code==='Space'){if(core.state==='running'){core.pulse();renderHud();}return;}
 held.add(e.code);
});
document.addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('[data-dir]').forEach(b=>{
 const d=b.dataset.dir;
 b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(d);b.classList.add('is-down');try{b.setPointerCapture(e.pointerId);}catch(_){}});
 const clear=()=>{held.delete(d);b.classList.remove('is-down');};
 b.addEventListener('pointerup',clear);b.addEventListener('pointercancel',clear);b.addEventListener('lostpointercapture',clear);
});
$('pulseBtn').addEventListener('click',()=>{core.pulse();renderHud();});
$('pauseBtn').addEventListener('click',pause);
$('resetBtn').addEventListener('click',start);
dom.start.addEventListener('click',start);
$('muteBtn').addEventListener('click',()=>{
 muted=!muted;$('muteBtn').textContent=muted?'声音：关':'声音：开';
 $('muteBtn').setAttribute('aria-pressed',String(!muted));if(!muted)audioBlip();
});
window.addEventListener('blur',()=>{held.clear();pointer=null;if(core.state==='running')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&core.state==='running')pause();});
window.addEventListener('resize',renderer.resize);
renderer.resize();dom.mode.textContent=renderer.mode==='webgl'?'WEBGL / 实时 3D':'3D SOFTWARE / 降级';
if(renderer.mode!=='webgl')$('fallbackNotice').hidden=false;
renderer.draw(core);renderHud();requestAnimationFrame(tick);
})();