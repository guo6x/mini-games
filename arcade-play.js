(() => {
'use strict';
const MODE=document.body.dataset.game;
const W=800,H=500,canvas=document.getElementById('stage'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const map={
 racing:{name:'霓虹赛车',sub:'躲避车流 · 收集能量 · 尽量跑远',instruction:'← / → 或 A / D 变换车道；触控端用底部按钮。收集金色能量，撞到车辆会损失护盾。',hint:'保持移动，看准车距。',accent:'#6ee9ff'},
 platformer:{name:'跃动星球',sub:'穿越星际平台 · 收集星币 · 抵达终点',instruction:'方向键或 A / D 移动，空格 / ↑ / W 跳跃。掉落会消耗生命，从最近的平台重新出发。',hint:'先观察下一块平台，再起跳。',accent:'#b29eff'},
 'tower-defense':{name:'星际防线',sub:'自由布塔 · 自动瞄准 · 无限波次',instruction:'点击空地建造防御塔（80 能量），点击已有塔升级（100 能量）。保护核心，敌人每波都会更强。',hint:'优先覆盖路径拐角，可提升命中率。',accent:'#78f7c1'},
 match3:{name:'宝石三消',sub:'交换相邻宝石 · 连锁反应 · 60 秒限时',instruction:'点击两颗相邻的宝石交换位置，至少连成三个相同颜色才能消除。连锁消除有额外分数。',hint:'寻找可以同时造成两处消除的交换。',accent:'#ffb0e4'},
 'maze-runner':{name:'迷宫突围',sub:'随机生成 · 三重关卡 · 时间挑战',instruction:'方向键或 WASD 控制角色穿过迷宫，抵达右下角出口。每一关都会重新生成迷宫。',hint:'走过的路会留下蓝色痕迹，尽量减少回头。',accent:'#82dfff'}
};
if(!map[MODE])return;
const meta=map[MODE], keys=new Set();
let engine,playing=false,paused=false,ended=false,last=0,score=0,best=0,elapsed=0;
try{best=Number(localStorage.getItem('orbit-best-'+MODE))||0;}catch(e){}
document.documentElement.style.setProperty('--game-accent',meta.accent);
document.title=meta.name+' · ORBIT ARCADE';
$('gameName').textContent=meta.name;$('gameSubtitle').textContent=meta.sub;$('gameInstructions').textContent=meta.instruction;$('gameHint').textContent=meta.hint;
$('bestValue').textContent=best;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const rand=(a,b)=>a+Math.random()*(b-a);
const R=(x,y,w,h,r=8)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);};
const fill=(x,y,w,h,color,r=0)=>{ctx.fillStyle=color;if(r){R(x,y,w,h,r);ctx.fill();}else ctx.fillRect(x,y,w,h);};
const text=(s,x,y,size=16,color='#eef6ff',align='left',weight=700)=>{ctx.font=weight+' '+size+'px system-ui,sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,x,y);ctx.textAlign='left';};
function notify(s){$('liveFeedback').textContent=s;}
function points(n){score=Math.max(0,Math.floor(n));$('scoreValue').textContent=score;}
function level(s){$('levelValue').textContent=s;}
function tone(freq=500){if($('soundToggle').getAttribute('aria-pressed')!=='true')return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=tone.context||(tone.context=new AC());if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.07,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.095);o.start();o.stop(ac.currentTime+.1);}catch(e){}}
function finish(message){if(ended)return;playing=false;ended=true;paused=false;keys.clear();$('pauseBtn').textContent='暂停';$('statusPill').textContent='已完成';best=Math.max(best,score);$('bestValue').textContent=best;try{localStorage.setItem('orbit-best-'+MODE,String(best));}catch(e){}$('overlay').hidden=false;$('overlayKicker').textContent='ROUND COMPLETE';$('overlayTitle').textContent=message;$('overlayDescription').textContent='本局 '+score+' 分 · 个人最佳 '+best+' 分';$('startBtn').textContent='再来一局';notify(message);tone(750);}
function begin(){engine=engines[MODE]();points(0);level('01');elapsed=0;engine.init();ended=false;paused=false;playing=true;$('overlay').hidden=true;$('statusPill').textContent='进行中';$('pauseBtn').textContent='暂停';$('startBtn').textContent='重新开始';notify('挑战开始，祝你好运！');tone(520);}
function togglePause(){if(!playing||ended)return;paused=!paused;keys.clear();$('pauseBtn').textContent=paused?'继续':'暂停';$('statusPill').textContent=paused?'已暂停':'进行中';notify(paused?'游戏暂停':'继续挑战');}
function frame(t){requestAnimationFrame(frame);if(!engine)return;const dt=last?Math.min(.04,(t-last)/1000):0;last=t;if(playing&&!paused){elapsed+=dt;engine.update(dt);}engine.draw();}
const controlKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','KeyP','KeyR']);
document.addEventListener('keydown',e=>{if(!controlKeys.has(e.code)||e.target.closest('input,textarea,select'))return;e.preventDefault();if(e.code==='KeyR'){begin();return;}if(e.code==='KeyP'){togglePause();return;}if(!playing||paused)return;if(!keys.has(e.code)&&engine.key)engine.key(e.code);keys.add(e.code);});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();if(playing&&!paused)togglePause();});
canvas.addEventListener('pointerdown',e=>{if(!playing||paused||!engine.click)return;const r=canvas.getBoundingClientRect();engine.click((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height);});
document.querySelectorAll('[data-key]').forEach(b=>{const code=b.dataset.key;const down=e=>{e.preventDefault();if(!playing||paused)return;keys.add(code);if(engine.key)engine.key(code);b.classList.add('pressed');try{b.setPointerCapture(e.pointerId);}catch(_){}};const up=e=>{e.preventDefault();keys.delete(code);b.classList.remove('pressed');};b.addEventListener('pointerdown',down);['pointerup','pointercancel','lostpointercapture'].forEach(k=>b.addEventListener(k,up));});
$('startBtn').addEventListener('click',begin);$('resetBtn').addEventListener('click',begin);$('pauseBtn').addEventListener('click',togglePause);
$('soundToggle').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'声音开':'静音';});
$('helpBtn').addEventListener('click',()=>{const d=$('helpDialog');if(d.open)d.close();else{if(playing&&!paused)togglePause();d.showModal();}});
const engines={
racing:()=>({
 init(){this.lane=1;this.x=0;this.cars=[];this.spawn=.5;this.dist=0;this.bonus=0;this.health=3;this.inv=0;this.t=0;this.x=312.5;},
 key(c){if(['ArrowLeft','KeyA'].includes(c))this.lane=clamp(this.lane-1,0,3);if(['ArrowRight','KeyD'].includes(c))this.lane=clamp(this.lane+1,0,3);},
 update(dt){this.t+=dt;const speed=215+Math.min(315,this.dist*.18);this.dist+=speed*dt/8;this.inv=Math.max(0,this.inv-dt);this.spawn-=dt;const laneX=l=>215+l*105;if(this.spawn<=0){this.spawn=clamp(.97-this.dist/1300,.33,.97);this.cars.push({lane:Math.floor(rand(0,4)),y:-70,kind:Math.random()<.24?'charge':'traffic',color:['#ef778a','#9f93ff','#68d1c7'][Math.floor(Math.random()*3)]});}
 this.x+=(laneX(this.lane)-this.x)*Math.min(1,dt*13);this.cars.forEach(c=>{c.y+=speed*dt;if(!c.hit&&c.y>361&&c.y<438&&Math.abs(laneX(c.lane)-this.x)<43){c.hit=true;if(c.kind==='charge'){this.bonus+=75;notify('能量 +75');tone(740);}else if(this.inv<=0){this.health--;this.inv=1.5;notify('护盾受损！还剩 '+this.health+' 层');tone(160);if(this.health<=0)finish('赛道挑战结束');}}});this.cars=this.cars.filter(c=>c.y<580&&!c.hit);points(this.dist+this.bonus);level('LV '+(1+Math.floor(this.dist/250)));},
 draw(){fill(0,0,W,H,'#091122');for(let i=0;i<35;i++){const x=(i*73+11)%800,y=(i*119+this.t*18)%500;fill(x,y,2,2,'#abc8f455');}fill(165,0,470,H,'#192941',18);fill(173,0,454,H,'#243754');for(let i=0;i<5;i++)fill(162+i*105,0,4,H,'#79c0ff44');for(let y=-90+(this.dist*8)%90;y<H;y+=90)for(let i=1;i<4;i++)fill(165+i*105-2,y,4,40,'#b6e6ff8f',3);
 for(const c of this.cars){const x=215+c.lane*105;if(c.kind==='charge'){ctx.shadowColor='#ffe382';ctx.shadowBlur=22;fill(x-22,c.y,44,44,'#f7bc55',13);text('✦',x,c.y+22,31,'#fff', 'center');ctx.shadowBlur=0;}else{fill(x-29,c.y,58,69,c.color,13);fill(x-19,c.y+13,38,16,'#142941',5);fill(x-22,c.y+51,11,6,'#fff2b1',3);fill(x+11,c.y+51,11,6,'#fff2b1',3);}}
 if(!(this.inv>0&&Math.floor(this.t*10)%2===0)){ctx.shadowColor='#70f0ff';ctx.shadowBlur=25;fill(this.x-30,382,60,78,'#57b8f5',15);ctx.shadowBlur=0;fill(this.x-22,396,44,20,'#172b4b',8);fill(this.x-21,438,11,6,'#ffd5d3',2);fill(this.x+10,438,11,6,'#ffd5d3',2);}
 text('SHIELDS',26,32,12,'#8fb6de');text('♥'.repeat(this.health)+'♡'.repeat(3-this.health),26,62,26,'#ff91a1');text('DISTANCE',26,128,12,'#8fb6de');text(Math.floor(this.dist)+' m',26,164,26,'#fff');text('BOOST',675,32,12,'#8fb6de');text('+'+this.bonus,675,62,23,'#ffd882');text('← →',678,454,20,'#a9c8ea');}
}),
platformer:()=>({
 init(){this.plats=[{x:0,y:440,w:350},{x:420,y:415,w:180},{x:665,y:375,w:170},{x:900,y:420,w:195},{x:1155,y:385,w:175},{x:1395,y:345,w:190},{x:1650,y:400,w:200},{x:1910,y:360,w:170},{x:2145,y:420,w:300}];this.coins=this.plats.slice(1).flatMap(p=>[p.x+40,p.x+p.w-40].map(x=>({x,y:p.y-40,taken:false})));this.p={x:70,y:390,w:27,h:40,vy:0,ground:false};this.cam=0;this.lives=3;this.picked=0;this.safe={x:70,y:390};this.t=0;},
 key(c){if(['Space','ArrowUp','KeyW'].includes(c)&&this.p.ground){this.p.vy=-665;this.p.ground=false;tone(540);}},
 update(dt){const p=this.p;this.t+=dt;const lr=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));p.x=clamp(p.x+lr*295*dt,0,2420);const old=p.y+p.h;p.vy+=1550*dt;p.y+=p.vy*dt;p.ground=false;
 if(p.vy>=0)for(const a of this.plats){if(p.x+p.w>a.x+4&&p.x<a.x+a.w-4&&old<=a.y+10&&p.y+p.h>=a.y){p.y=a.y-p.h;p.vy=0;p.ground=true;this.safe={x:a.x+22,y:a.y-p.h};break;}}
 this.coins.forEach(c=>{if(!c.taken&&Math.abs(p.x+13-c.x)<27&&Math.abs(p.y+18-c.y)<28){c.taken=true;this.picked++;notify('收集星币 '+this.picked);tone(780);}});
 if(p.y>H+110){this.lives--;if(this.lives<=0){finish('闯关失败，再试一次');return;}p.x=this.safe.x;p.y=this.safe.y;p.vy=0;notify('掉落！剩余 '+this.lives+' 次机会');tone(180);}
 if(p.x>2380)finish('成功抵达星球终点！');this.cam=clamp(p.x-175,0,1660);points(this.picked*100+Math.floor(p.x/12));level('STAGE '+(Math.min(3,Math.floor(p.x/820)+1)));},
 draw(){const c=this.cam;fill(0,0,W,H,'#0c1430');for(let i=0;i<45;i++){const x=(i*113-c*.15)%830,y=(i*67)%380;fill((x+830)%830,y,2,2,'#86b5ed8c');}ctx.fillStyle='#263c75';for(let i=0;i<6;i++){const x=((i*320-c*.24)%1950+1950)%1950-200;ctx.beginPath();ctx.arc(x,430,180,Math.PI,0);ctx.fill();}ctx.save();ctx.translate(-c,0);for(const a of this.plats){fill(a.x,a.y,a.w,500-a.y,'#243351',10);fill(a.x,a.y,a.w,13,'#91dbf7',7);for(let x=a.x+15;x<a.x+a.w-10;x+=35)fill(x,a.y+23,3,9,'#456d90',2);}
 this.coins.filter(x=>!x.taken).forEach(q=>{ctx.shadowColor='#f9d271';ctx.shadowBlur=16;ctx.fillStyle='#ffd783';ctx.beginPath();ctx.arc(q.x,q.y+Math.sin(this.t*5+q.x)*4,10,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
 fill(2380,280,12,140,'#8cf6cd');text('★',2390,273,50,'#acffdb','center');const p=this.p;ctx.shadowColor='#83d1ff';ctx.shadowBlur=15;fill(p.x,p.y,p.w,p.h,'#78b7fd',8);ctx.shadowBlur=0;fill(p.x+5,p.y+10,17,10,'#101d38',4);ctx.restore();text('♥ '.repeat(this.lives),25,32,24,'#ff99ae');text('★ '+this.picked+' / '+this.coins.length,25,65,18,'#ffe29b');text('RUN →',665,34,14,'#92b8ed');}
}),
'tower-defense':()=>({
 init(){this.path=[{x:-30,y:238},{x:185,y:238},{x:185,y:112},{x:422,y:112},{x:422,y:360},{x:695,y:360},{x:835,y:360}];this.segs=[];this.total=0;for(let i=1;i<this.path.length;i++){const a=this.path[i-1],b=this.path[i],len=Math.hypot(b.x-a.x,b.y-a.y);this.segs.push({a,b,len,start:this.total});this.total+=len;}this.towers=[];this.enemies=[];this.wave=1;this.health=12;this.cash=180;this.kills=0;this.queue=8;this.spawnt=1;this.breaking=false;this.breaktime=0;this.bullets=[];notify('点击路径附近的空地建塔（80 能量）');},
 pos(d){const s=this.segs.find(q=>d<q.start+q.len)||this.segs[this.segs.length-1];const t=clamp((d-s.start)/s.len,0,1);return {x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t};},
 distPath(x,y){let d=999;for(const s of this.segs){const t=clamp(((x-s.a.x)*(s.b.x-s.a.x)+(y-s.a.y)*(s.b.y-s.a.y))/(s.len*s.len),0,1);d=Math.min(d,Math.hypot(x-(s.a.x+(s.b.x-s.a.x)*t),y-(s.a.y+(s.b.y-s.a.y)*t)));}return d;},
 click(x,y){const tower=this.towers.find(t=>Math.hypot(t.x-x,t.y-y)<29);if(tower){if(this.cash>=100){this.cash-=100;tower.level++;notify('防御塔升级至 LV'+tower.level);tone(770);}else notify('升级需要 100 能量');return;}if(x<35||x>765||y<38||y>465||this.distPath(x,y)<48||this.towers.some(t=>Math.hypot(t.x-x,t.y-y)<53)){notify('此处无法建塔');return;}if(this.cash<80){notify('建塔需要 80 能量');return;}this.cash-=80;this.towers.push({x,y,level:1,cool:0,flash:0});notify('部署完成 · 剩余 '+this.cash+' 能量');tone(430);},
 update(dt){if(this.breaking){this.breaktime-=dt;if(this.breaktime<=0){this.breaking=false;this.wave++;this.queue=6+this.wave*3;this.spawnt=.4;notify('第 '+this.wave+' 波敌人来袭！');}}else if(this.queue>0){this.spawnt-=dt;if(this.spawnt<=0){this.queue--;this.spawnt=Math.max(.29,.85-this.wave*.025);const hp=75+this.wave*24;this.enemies.push({d:0,hp,maxhp:hp,speed:57+Math.min(45,this.wave*3)});}}
 for(const e of this.enemies){e.d+=e.speed*dt;e.pos=this.pos(e.d);if(e.d>=this.total)e.dead=true;}
 const escapes=this.enemies.filter(e=>e.dead);this.health-=escapes.length;this.enemies=this.enemies.filter(e=>!e.dead);
 if(this.health<=0){this.health=0;finish('核心失守 · 已坚持 '+this.wave+' 波');return;}
 this.bullets=this.bullets.filter(b=>(b.ttl-=dt)>0);
 for(const t of this.towers){t.cool-=dt;t.flash=Math.max(0,t.flash-dt);if(t.cool<=0){const target=this.enemies.filter(e=>Math.hypot(e.pos.x-t.x,e.pos.y-t.y)<130+t.level*13).sort((a,b)=>b.d-a.d)[0];if(target){target.hp-=29+t.level*20;t.cool=Math.max(.23,.63-t.level*.09);t.flash=.13;this.bullets.push({x:t.x,y:t.y,tx:target.pos.x,ty:target.pos.y,ttl:.1});if(target.hp<=0){target.dead=true;this.kills++;this.cash+=24+this.wave*3;tone(600);}}}}
 this.enemies=this.enemies.filter(e=>!e.dead);
 if(this.queue===0&&this.enemies.length===0&&!this.breaking){this.breaking=true;this.breaktime=3;this.cash+=35+this.wave*8;notify('第 '+this.wave+' 波已清除，奖励能量！');tone(820);}
 points(this.kills*25+this.wave*100);level('WAVE '+this.wave);},
 draw(){fill(0,0,W,H,'#0b182b');for(let x=0;x<W;x+=32)for(let y=0;y<H;y+=32){fill(x,y,1,1,'#41607b40');}
 ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();this.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineWidth=58;ctx.strokeStyle='#283e53';ctx.stroke();ctx.lineWidth=42;ctx.strokeStyle='#405d6c';ctx.stroke();ctx.lineWidth=3;ctx.setLineDash([9,18]);ctx.strokeStyle='#b8edff66';ctx.stroke();ctx.setLineDash([]);
 for(const t of this.towers){ctx.strokeStyle='#8af7d733';ctx.beginPath();ctx.arc(t.x,t.y,130+t.level*13,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=t.flash?25:9;ctx.shadowColor='#88ffdf';fill(t.x-22,t.y-22,44,44,'#295e69',13);fill(t.x-9,t.y-9,18,18,'#86ffce',6);ctx.shadowBlur=0;text(String(t.level),t.x+17,t.y-15,11,'#d7fff5','center');}
 for(const e of this.enemies){const p=e.pos;fill(p.x-18,p.y-16,36,32,'#ef8190',10);fill(p.x-18,p.y-28,36,5,'#281f32',3);fill(p.x-18,p.y-28,36*clamp(e.hp/e.maxhp,0,1),5,'#9dffbd',3);}
 for(const b of this.bullets){ctx.strokeStyle='#b1ffe7';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.tx,b.ty);ctx.stroke();}
 fill(16,15,237,54,'#101a30de',14);text('♥ '+this.health+'    ⚡ '+this.cash+'    ⛨ '+this.towers.length,30,42,18,'#e5f6ff');text(this.breaking?'下一波 '+Math.ceil(this.breaktime)+'s':'敌方单位 '+(this.enemies.length+this.queue),620,40,15,'#bfe4f8');}
}),
match3:()=>({
 init(){this.size=8;this.n=6;this.board=[];this.selected=null;this.time=60;this.moves=0;this.chain=0;this.total=0;this.generate();},
 generate(){for(let y=0;y<8;y++){this.board[y]=[];for(let x=0;x<8;x++){let a;do{a=Math.floor(rand(0,this.n));}while((x>1&&this.board[y][x-1]===a&&this.board[y][x-2]===a)||(y>1&&this.board[y-1][x]===a&&this.board[y-2][x]===a));this.board[y][x]=a;}}if(!this.hasMove())this.generate();},
 find(){const s=new Set();for(let y=0;y<8;y++)for(let x=0;x<8;x++){const v=this.board[y][x];if(v===null)continue;if(x<6&&v===this.board[y][x+1]&&v===this.board[y][x+2]){let k=x;while(k<8&&this.board[y][k]===v)s.add(y*8+k++);}if(y<6&&v===this.board[y+1][x]&&v===this.board[y+2][x]){let k=y;while(k<8&&this.board[k][x]===v)s.add(k++*8+x);}}return s;},
 swap(a,b){const t=this.board[a.y][a.x];this.board[a.y][a.x]=this.board[b.y][b.x];this.board[b.y][b.x]=t;},
 hasMove(){for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(const d of [[1,0],[0,1]]){const nx=x+d[0],ny=y+d[1];if(nx>=8||ny>=8)continue;const a={x,y},b={x:nx,y:ny};this.swap(a,b);const ok=this.find().size>0;this.swap(a,b);if(ok)return true;}return false;},
 click(px,py){const x=Math.floor((px-200)/50),y=Math.floor((py-44)/50);if(x<0||x>=8||y<0||y>=8)return;const target={x,y};if(!this.selected){this.selected=target;tone(420);return;}const a=this.selected;this.selected=null;if(a.x===x&&a.y===y)return;if(Math.abs(a.x-x)+Math.abs(a.y-y)!==1){this.selected=target;return;}this.swap(a,target);if(!this.find().size){this.swap(a,target);notify('至少连成三个才可以交换');tone(190);return;}this.moves++;this.chain=0;for(let n=0;n<25;n++){const found=this.find();if(!found.size)break;this.chain++;this.total+=found.size*15*this.chain;for(const id of found)this.board[Math.floor(id/8)][id%8]=null;for(let xx=0;xx<8;xx++){const vals=[];for(let yy=7;yy>=0;yy--)if(this.board[yy][xx]!==null)vals.push(this.board[yy][xx]);for(let yy=7;yy>=0;yy--)this.board[yy][xx]=vals[7-yy]??Math.floor(rand(0,this.n));}}if(!this.hasMove())this.generate();points(this.total);level('COMBO x'+this.chain);notify(this.chain>1?'连锁 '+this.chain+' 次！':'漂亮的消除！');tone(530+this.chain*120);},
 update(dt){this.time-=dt;if(this.time<=0){this.time=0;finish('时间到！宝石大师');}level('剩余 '+Math.ceil(this.time)+'s');},
 draw(){fill(0,0,W,H,'#120e2a');const cols=['#76d9ff','#f291c4','#f8c56d','#90efbe','#b09aff','#fa887e'];fill(190,34,420,420,'#232043',19);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const bx=200+x*50,by=44+y*50;fill(bx+2,by+2,46,46,'#ffffff0b',10);const k=this.board[y][x],cx=bx+25,cy=by+25;ctx.shadowColor=cols[k];ctx.shadowBlur=11;ctx.fillStyle=cols[k];ctx.beginPath();ctx.moveTo(cx,cy-17);ctx.lineTo(cx+16,cy-5);ctx.lineTo(cx+11,cy+15);ctx.lineTo(cx-11,cy+15);ctx.lineTo(cx-16,cy-5);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ffffff91';ctx.stroke();if(this.selected&&this.selected.x===x&&this.selected.y===y){ctx.strokeStyle='#fff';ctx.lineWidth=3;R(bx+2,by+2,46,46,9);ctx.stroke();ctx.lineWidth=1;}}
 text('TIME',34,75,15,'#c9b8ee');text(Math.ceil(this.time)+'s',34,122,37,'#ffffff');text('MOVES',34,210,15,'#c9b8ee');text(String(this.moves),34,245,30,'#ffffff');text('COMBO',640,75,15,'#c9b8ee');text('x'+this.chain,640,114,32,'#ffcde9');text('SCORE',638,210,15,'#c9b8ee');text(String(this.total),638,246,26,'#fff');text('交换相邻宝石',638,434,13,'#b4a6db');}
}),
'maze-runner':()=>({
 init(){this.levelNum=1;this.totalScore=0;this.totalTime=0;this.create();},
 create(){this.w=29;this.h=17;this.grid=Array.from({length:this.h},()=>Array(this.w).fill(1));this.visited=new Set();const st=[[1,1]];this.grid[1][1]=0;while(st.length){const [x,y]=st[st.length-1];const choices=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>x+dx>0&&y+dy>0&&x+dx<this.w-1&&y+dy<this.h-1&&this.grid[y+dy][x+dx]===1);if(!choices.length){st.pop();continue;}const [dx,dy]=choices[Math.floor(rand(0,choices.length))];this.grid[y+dy/2][x+dx/2]=0;this.grid[y+dy][x+dx]=0;st.push([x+dx,y+dy]);}this.x=1;this.y=1;this.steps=0;this.time=0;this.visited.add('1,1');notify('找到右下角的出口');},
 key(c){const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};const d=dirs[c];if(!d)return;const nx=this.x+d[0],ny=this.y+d[1];if(!this.grid[ny]||this.grid[ny][nx]!==0){tone(180);return;}this.x=nx;this.y=ny;this.steps++;this.visited.add(nx+','+ny);if(nx===this.w-2&&ny===this.h-2){const reward=Math.max(80,600-this.time*9-this.steps*2);this.totalScore+=Math.floor(reward);points(this.totalScore);tone(810);if(this.levelNum===3){finish('三关通关！迷宫大师');return;}this.levelNum++;this.create();level('MAZE '+this.levelNum);}},
 update(dt){this.time+=dt;this.totalTime+=dt;},
 draw(){fill(0,0,W,H,'#0c1428');const s=24,ox=52,oy=42;for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const px=ox+x*s,py=oy+y*s;if(this.grid[y][x]===1){fill(px+1,py+1,s-2,s-2,'#254268',4);fill(px+3,py+2,s-6,3,'#5c83b44d');}else fill(px,py,s,s,this.visited.has(x+','+y)?'#244d69':'#15263b');}fill(ox+(this.w-2)*s+4,oy+(this.h-2)*s+4,s-8,s-8,'#b3f9c0',6);ctx.shadowBlur=22;ctx.shadowColor='#83e9ff';ctx.beginPath();ctx.fillStyle='#78e1ff';ctx.arc(ox+this.x*s+12,oy+this.y*s+12,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;text('关卡 '+this.levelNum+'/3',27,22,16,'#c9e6ff');text('计时 '+Math.floor(this.time)+'s',675,22,15,'#c9e6ff');text('步数 '+this.steps,675,481,15,'#c9e6ff');}
})
};
engine=engines[MODE]();engine.init();engine.draw();
requestAnimationFrame(frame);
})();
