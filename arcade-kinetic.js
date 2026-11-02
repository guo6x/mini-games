/* ORBIT ARCADE / Kinetic Pack. Distinct action mechanics and feedback loops. */
(()=>{'use strict';
window.ORBIT_KINETIC_META={
 'brick-breaker':{name:'霓虹破壁',sub:'弹射反弹 · 清空砖阵 · 三条生命',instruction:'←→或 A/D 移动挡板；用击球位置控制反弹角度，清空砖阵进下一关。',hint:'球打在挡板边缘会获得更大的横向速度。',accent:'#90ffda'},
 'flappy-bird':{name:'星翼穿梭',sub:'一键飞行 · 穿越能量门 · 连续得分',instruction:'点击游戏画面、空格或↑让飞翼上升；别碰能量柱或屏幕边缘。',hint:'节奏稳定的小幅上升比连续狂点更容易控制。',accent:'#ffc48d'},
 'music-rhythm':{name:'脉冲节奏',sub:'A S D F 四轨打击 · 连击评分 · 90 秒',instruction:'按 A、S、D、F 或点击四轨下方判定区域，在音符抵达发光判定线附近击打。',hint:'观察音符落下速度，按节拍预判击打，不要过早。',accent:'#f7acfc'},
 'pac-man':{name:'星际迷宫追逐',sub:'吃点 · 追踪幽灵 · 能量反击',instruction:'方向键 / WASD 在迷宫穿行，吃完光点过关。吃大能量球后可短暂反制追踪幽灵。',hint:'留意幽灵位置，利用岔路和能量球。',accent:'#f7d882'},
 'plane-combat':{name:'空域拦截者',sub:'纵向空战 · 自动射击 · 三次护盾',instruction:'方向键或 WASD 躲避敌机和弹幕；持续自动射击，击落敌机得分并累积波次。',hint:'别在原地停留太久，先清掉离自己最近的敌机。',accent:'#9ce8ff'},
 pong:{name:'脉冲乒乓',sub:'经典双挡板 · AI 对战 · 先得 7 分',instruction:'使用 ↑↓ 或 W/S 控制左侧挡板，迎击 AI 控制的右侧挡板。先得 7 分获胜。',hint:'击球的位置决定反弹角度，尽量打向球场的边缘。',accent:'#9bffd8'},
 'reaction-test':{name:'闪光反射实验',sub:'捕捉绿灯 · 避免抢跑 · 五轮测验',instruction:'开始后等待区域从红色变绿，再立即点击或按空格。提前操作会记一次抢跑。',hint:'等待信号时尽量别预判，以免抢跑误判。',accent:'#c2ffb3'},
 snake:{name:'星轨贪吃蛇',sub:'吃取能量 · 身体增长 · 难度渐进',instruction:'方向键 / WASD 控制蛇的运动方向，吃到能量球增长；撞墙或撞自己结束。',hint:'尽量绕场地外圈走，保留转向空间。',accent:'#9bf4d1'},
 'space-invaders':{name:'入侵者阵列',sub:'队列推进 · 弹幕穿梭 · 多重波次',instruction:'←→或 A/D 横向移动，空格发射；敌阵会左右移动并逐步下降。消灭整波敌人进入下一波。',hint:'优先清除低处的入侵者，不要被逼到边缘。',accent:'#d9a4fb'},
 'space-shooter':{name:'深空弹幕',sub:'自由飞行 · 追踪敌机 · 生存挑战',instruction:'方向键或 WASD 自由移动，空格发射或等待自动射击。躲开穿梭的弹幕，获得连击。',hint:'在弹幕之间的小空档移动，不要只关注自己的子弹。',accent:'#8dd9ff'},
 tetris:{name:'方块轨道',sub:'七种标准方块 · 旋转下落 · 连续消行',instruction:'←→移动，↑ / W旋转，↓加速，空格直接落到底部。完整横行即会消除。',hint:'留出空竖井供长条方块使用，避免顶部堆积。',accent:'#9cbbfa'},
 'time-guardian':{name:'时空守卫',sub:'生存波次 · 时间缓滞 · 能量冲刺',instruction:'WASD/方向键移动，在自动射击中求生。空格发动持续两秒的时缓，能量会缓慢恢复。',hint:'敌人越多，越要合理利用空间和减速能力。',accent:'#b3a2ff'},
 'typing-game':{name:'宇航打字挑战',sub:'键入星际词汇 · 正确率 · 连击',instruction:'在下方输入框准确输入屏幕显示的英文单词，回车提交；连续答对会提高连击和难度。',hint:'先确保拼写正确，再追求速度。',accent:'#8ceadb'}
};
window.ORBIT_KINETIC=api=>{
 const {ctx,fill,text,points,level,finish,notify,tone,clamp,rand,keys}=api;
 const R=(x,y,w,h,c,r=10)=>fill(x,y,w,h,c,r);
 const T=(s,x,y,size=20,c='#eaf8ff')=>text(String(s),x,y,size,c,'center');
 const hit=(x,y,l,t,w,h)=>x>=l&&x<l+w&&y>=t&&y<t+h;
 const circ=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const button=(s,x,y,w,h,color='#2a4f72')=>{R(x,y,w,h,color,11);T(s,x+w/2,y+h/2,20);};
 const bg=(heading,sub)=>{fill(0,0,800,500,'#0e1930');for(let i=0;i<64;i++)circ((i*113+51)%800,(i*67+38)%500,i%5===0?1.8:.8,'#7b9ed044');text(heading,32,34,22,'#e5f4ff');if(sub)text(sub,33,66,14,'#abcce7');};
 const held=(...codes)=>codes.some(k=>keys.has(k));
 const stage=(x=100,y=90,w=600,h=340)=>{R(x,y,w,h,'#182d49',16);ctx.strokeStyle='#46688d';ctx.strokeRect(x+1,y+1,w-2,h-2);};
 const shooter=(type)=>()=>({
  init(){this.type=type;this.player={x:400,y:420,hp:3,cool:0,inv:0};this.bullets=[];this.enemies=[];this.shots=[];this.particles=[];this.time=0;this.score=0;this.kills=0;this.wave=1;this.spawn=0;this.fireTime=0;this.combo=0;this.formation=Array.from({length:type==='invaders'?24:0},(_,i)=>({x:170+i%8*65,y:112+Math.floor(i/8)*50,alive:true}));this.direction=1;this.shift=0;level('WAVE 1');notify('移动躲避，射击敌人。初始 3 点护盾。');},
  hurt(){if(this.player.inv>0)return;this.player.hp--;this.player.inv=1.5;this.combo=0;tone(150);notify('护盾受损 · 剩余 '+this.player.hp+' 点');if(this.player.hp<=0)finish('防线失守 · 获得 '+this.score+' 分');},
  key(code){if(code==='Space'){this.fireTime=0;this.fire();}},
  fire(){if(this.player.cool>0)return;this.bullets.push({x:this.player.x,y:this.player.y-21,vy:-530});this.player.cool=this.type==='invaders'?.19:.16;tone(430);},
  update(dt){
   this.time+=dt;const p=this.player;if(p.inv>0)p.inv-=dt;if(p.cool>0)p.cool-=dt;
   if(held('ArrowLeft','KeyA'))p.x-=265*dt;if(held('ArrowRight','KeyD'))p.x+=265*dt;
   if(this.type!=='invaders'){if(held('ArrowUp','KeyW'))p.y-=250*dt;if(held('ArrowDown','KeyS'))p.y+=250*dt;}
   p.x=clamp(p.x,125,675);p.y=clamp(p.y,240,457);
   this.fireTime-=dt;if(this.type!=='invaders'&&this.fireTime<=0){this.fire();this.fireTime=.18;}if(held('Space'))this.fire();
   this.bullets.forEach(b=>b.y+=b.vy*dt);this.bullets=this.bullets.filter(b=>b.y>80);
   this.shots.forEach(b=>{b.x+=(b.vx||0)*dt;b.y+=b.vy*dt;});this.shots=this.shots.filter(b=>b.y<485&&b.y>70&&b.x>95&&b.x<705);
   if(this.type==='invaders'){
    this.shift+=this.direction*dt*(22+this.wave*7);
    if(this.shift>65||this.shift< -65){this.direction*=-1;this.shift=clamp(this.shift,-65,65);for(const q of this.formation)if(q.alive)q.y+=13;}
    for(const q of this.formation){if(!q.alive)continue;const x=q.x+this.shift;if(q.y>398){finish('入侵者抵达防线');return;}if(Math.random()<dt*(.12+this.wave*.03))this.shots.push({x,y:q.y+12,vx:0,vy:170+this.wave*10});}
    for(const b of this.bullets){const q=this.formation.find(e=>e.alive&&Math.abs((e.x+this.shift)-b.x)<20&&Math.abs(e.y-b.y)<16);if(q){q.alive=false;b.y=-500;this.score+=50+this.wave*10;this.kills++;tone(750);}}
    if(this.formation.every(q=>!q.alive)){this.wave++;this.formation=Array.from({length:24},(_,i)=>({x:170+i%8*65,y:112+Math.floor(i/8)*50,alive:true}));level('WAVE '+this.wave);}
   }else{
    this.spawn-=dt;if(this.spawn<=0){this.spawn=Math.max(.22,.83-this.wave*.055);this.enemies.push({x:rand(130,670),y:72,hp:type==='space'?2:1,speed:rand(80,140)+this.wave*7,phase:rand(0,7),fire:rand(.5,1.8)});}
    for(const e of this.enemies){e.y+=e.speed*dt;e.x+=Math.sin(this.time*2.2+e.phase)*42*dt;e.fire-=dt;if(e.fire<=0){e.fire=rand(1.2,2.5);this.shots.push({x:e.x,y:e.y+11,vx:clamp((p.x-e.x)*.17,-65,65),vy:180+this.wave*9});}}
    for(const b of this.bullets){const e=this.enemies.find(e=>!e.dead&&Math.hypot(e.x-b.x,e.y-b.y)<22);if(e){e.hp--;b.y=-500;if(e.hp<=0){e.dead=true;this.kills++;this.combo++;this.score+=40+this.combo*6;tone(720);}}}
    for(const e of this.enemies)if(!e.dead&&e.y>468){e.dead=true;this.combo=0;}
    this.enemies=this.enemies.filter(e=>!e.dead);
    if(this.kills>=this.wave*12){this.wave++;level('WAVE '+this.wave);notify('进入第 '+this.wave+' 波 · 敌人更密集');}
   }
   for(const b of this.shots){if(Math.hypot(b.x-p.x,b.y-p.y)<17){b.y=900;this.hurt();}}
   if(this.type!=='invaders')for(const e of this.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<21){e.dead=true;this.hurt();}
   this.enemies=this.enemies.filter(e=>!e.dead);
   points(this.score);
  },
  draw(){bg(this.type==='plane'?'空域拦截者':this.type==='invaders'?'入侵者阵列':'深空弹幕','击落 '+this.kills+' 目标 · '+this.wave+' 波');stage();const p=this.player;ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=p.inv>0&&Math.floor(p.inv*13)%2? .35:1;ctx.fillStyle='#9de4ff';ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(17,21);ctx.lineTo(0,13);ctx.lineTo(-17,21);ctx.closePath();ctx.fill();ctx.restore();for(const b of this.bullets)R(b.x-3,b.y-12,6,20,'#9dffe6',3);for(const b of this.shots)circ(b.x,b.y,5,'#ff829e');if(this.type==='invaders'){for(const e of this.formation)if(e.alive){const x=e.x+this.shift;R(x-18,e.y-12,36,25,'#b7a5ff',8);T('◆',x,e.y,19,'#24315a');}}else for(const e of this.enemies){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.PI);ctx.fillStyle=this.type==='space'?'#eb89b4':'#f4a3ab';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(20,15);ctx.lineTo(-20,15);ctx.closePath();ctx.fill();ctx.restore();}text('护盾 '+'●'.repeat(Math.max(0,p.hp))+'○'.repeat(Math.max(0,3-p.hp)),122,469,19,'#a6f2dd');text('连击 '+this.combo+' · SPACE 射击',465,469,16,'#b8d8ea');}
 });
 const shooter2=shooter('space');
 return {
 'brick-breaker':()=>({
  init(){this.b={x:400,y:388,vx:174,vy:-235};this.paddle=400;this.lives=3;this.wave=1;this.score=0;this.bricks=[];this.make();level('LEVEL 1');notify('移动挡板，清除砖块。');},
  make(){this.bricks=[];for(let y=0;y<5;y++)for(let x=0;x<9;x++)this.bricks.push({x:136+x*60,y:112+y*26,hp:y<2?2:1});},
  key(k){if(k==='ArrowLeft'||k==='KeyA')this.paddle-=38;if(k==='ArrowRight'||k==='KeyD')this.paddle+=38;},
  click(x){this.paddle=clamp(x,145,655);},
  update(dt){if(held('ArrowLeft','KeyA'))this.paddle-=290*dt;if(held('ArrowRight','KeyD'))this.paddle+=290*dt;this.paddle=clamp(this.paddle,144,656);const b=this.b;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<114||b.x>686){b.x=clamp(b.x,114,686);b.vx*=-1;}if(b.y<94){b.y=94;b.vy=Math.abs(b.vy);}if(b.vy>0&&b.y>=411&&b.y<442&&Math.abs(b.x-this.paddle)<56){b.y=410;const angle=(b.x-this.paddle)/56*1.05,speed=Math.min(430,Math.hypot(b.vx,b.vy)+5);b.vx=Math.sin(angle)*speed;b.vy=-Math.max(90,Math.cos(angle)*speed);tone(350);}if(b.y>455){this.lives--;tone(130);if(this.lives===0){finish('能量球耗尽 · '+this.score+' 分');return;}b.x=this.paddle;b.y=384;b.vx=rand(-170,170);b.vy=-240;}for(const brick of this.bricks){if(brick.hp<=0)continue;if(hit(b.x,b.y,brick.x-7,brick.y-7,62,29)){brick.hp--;b.vy*=-1;this.score+=15;points(this.score);tone(730);break;}}if(this.bricks.every(q=>q.hp<=0)){this.wave++;this.make();level('LEVEL '+this.wave);this.score+=350;points(this.score);b.y=385;b.vy=-245;notify('新砖阵出现！奖励 350 分');}},
  draw(){bg('霓虹破壁','清空所有能量砖 · 已击破 '+this.bricks.filter(q=>q.hp<=0).length+' / 45');stage();for(const b of this.bricks)if(b.hp>0)R(b.x,b.y,55,22,b.hp===2?'#cfa3ed':'#6ddfc8',6);R(this.paddle-53,420,106,13,'#abffef',7);circ(this.b.x,this.b.y,9,'#f7e6ff');text('LIVES '+this.lives,124,468,17,'#a7dfe9');}
 }),
 'flappy-bird':()=>({
  init(){this.y=247;this.v=0;this.pipes=[];this.timer=0;this.score=0;this.time=0;this.started=false;notify('按空格或点击画面，开始拍动翅膀。');},
  flap(){this.v=-275;this.started=true;tone(520);},
  key(k){if(k==='Space'||k==='ArrowUp'||k==='KeyW')this.flap();},
  click(){this.flap();},
  update(dt){if(!this.started)return;this.time+=dt;this.v+=680*dt;this.y+=this.v*dt;this.timer-=dt;if(this.timer<=0){this.timer=1.55;this.pipes.push({x:730,gap:rand(190,315),scored:false});}for(const p of this.pipes){p.x-=170*dt;if(!p.scored&&p.x<280){p.scored=true;this.score++;points(this.score*100);tone(820);}if(p.x>263&&p.x<310&&(this.y<p.gap-79||this.y>p.gap+79)){finish('飞翼碰撞 · 穿越 '+this.score+' 扇能量门');return;}}this.pipes=this.pipes.filter(p=>p.x>85);if(this.y<105||this.y>440)finish('飞翼失控 · 穿越 '+this.score+' 扇能量门');},
  draw(){bg('星翼穿梭','空格 / 点击 = 拍翼 · 能量门 '+this.score);stage();for(const p of this.pipes){R(p.x,90,63,p.gap-79-90,'#5486af',9);R(p.x,p.gap+79,63,440-(p.gap+79),'#5486af',9);R(p.x-5,p.gap-90,73,16,'#91f8cb',4);R(p.x-5,p.gap+75,73,16,'#91f8cb',4);}circ(280,this.y,17,'#ffda93');ctx.beginPath();ctx.moveTo(281,this.y);ctx.lineTo(260,this.y+11);ctx.lineTo(268,this.y-8);ctx.closePath();ctx.fillStyle='#ffae74';ctx.fill();if(!this.started)T('点击或按 SPACE 开始翱翔',400,265,24,'#e9f3ff');}
 }),
 'music-rhythm':()=>({
  init(){this.time=0;this.beat=0;this.notes=[];this.score=0;this.combo=0;this.good=0;this.miss=0;this.end=75;this.seed=0;notify('A S D F，命中屏幕下方的发光判定线。');},
  hitLane(i){let best=null,d=999;for(const n of this.notes){if(n.lane!==i||n.hit)continue;const dx=Math.abs(n.y-392);if(dx<d){d=dx;best=n;}}if(!best||d>42){this.combo=0;this.miss++;tone(170);notify('空击！留意音符接近判定线');return;}best.hit=true;this.combo++;this.good++;this.score+=d<13?150+this.combo*6:90+this.combo*3;points(this.score);tone(490+i*115);},
  key(k){const index={KeyA:0,KeyS:1,KeyD:2,KeyF:3};if(k in index)this.hitLane(index[k]);},
  click(x,y){if(y>260&&x>135&&x<665)this.hitLane(clamp(Math.floor((x-135)/133),0,3));},
  update(dt){this.time+=dt;this.beat-=dt;if(this.beat<=0){this.beat=.48;const i=Math.floor(rand(0,4));this.notes.push({lane:i,y:99,hit:false});if(Math.random()<.25)this.notes.push({lane:(i+2)%4,y:99,hit:false});}for(const n of this.notes)n.y+=270*dt;for(const n of this.notes)if(n.y>439&&!n.hit){n.hit=true;this.miss++;this.combo=0;}this.notes=this.notes.filter(n=>!n.hit&&n.y<470);level('COMBO '+this.combo);if(this.time>=this.end)finish('节奏挑战完成 · 命中 '+this.good+' 次');},
  draw(){bg('脉冲节奏','命中 '+this.good+' · 失误 '+this.miss+' · 剩余 '+Math.ceil(this.end-this.time)+' 秒');const cols=['#9bb4fc','#b0f0e0','#edb6fc','#f4d69e'];for(let i=0;i<4;i++){const x=135+i*133;R(x,93,125,354,'#1c3351',6);R(x,384,125,15,cols[i],4);T(['A','S','D','F'][i],x+62,438,23,cols[i]);}for(const n of this.notes)circ(197+n.lane*133,n.y,22,cols[n.lane]);text('COMBO '+this.combo+'  /  音乐由你演奏',272,477,17,'#c9e6f8');}
 }),
 'pac-man':()=>({
  map:['###############','#...#.........#','#.#.#.###.###.#','#.#...#.....#.#','#.###.#.###.#.#','#.....#o#.....#','###.###.###.###','#...#.....#...#','#.#.#.###.#.#.#','#.#.....#...#.#','###############'],
  init(){this.wall=this.map.map(r=>r.split(''));this.dots=0;for(let y=0;y<this.wall.length;y++)for(let x=0;x<15;x++)if(this.wall[y][x]==='.'||this.wall[y][x]==='o')this.dots++;this.x=1;this.y=1;this.ghosts=[{x:13,y:9},{x:13,y:1}];this.moveTime=0;this.power=0;this.total=0;this.lives=3;this.intent=[1,0];this.tick=0;level('DOTS '+this.dots);notify('吃完豆子过关，大能量球可短暂驱散幽灵。');},
  path(x,y){return this.wall[y]?.[x]&&this.wall[y][x]!=='#';},
  key(k){const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]};if(d[k])this.intent=d[k];},
  step(){const [dx,dy]=this.intent;const x=this.x+dx,y=this.y+dy;if(this.path(x,y)){this.x=x;this.y=y;const p=this.wall[y][x];if(p==='.'||p==='o'){this.wall[y][x]=' ';this.dots--;this.total+=p==='o'?120:20;if(p==='o')this.power=6;points(this.total);level('DOTS '+this.dots);if(this.dots===0){finish('星际迷宫清空！');return;}}}for(const g of this.ghosts){if(this.tick%2===0){const opts=[[0,1],[0,-1],[1,0],[-1,0]].filter(([a,b])=>this.path(g.x+a,g.y+b));opts.sort((a,b)=>{const da=Math.abs(g.x+a[0]-this.x)+Math.abs(g.y+a[1]-this.y);const db=Math.abs(g.x+b[0]-this.x)+Math.abs(g.y+b[1]-this.y);return this.power>0?db-da:da-db;});const move=Math.random()<.75?opts[0]:opts[Math.floor(rand(0,opts.length))];if(move){g.x+=move[0];g.y+=move[1];}}if(g.x===this.x&&g.y===this.y){if(this.power>0){this.total+=150;g.x=13;g.y=9;points(this.total);}else{this.lives--;this.x=1;this.y=1;g.x=13;g.y=9;tone(130);if(this.lives===0){finish('被幽灵捕获 · '+this.total+' 分');return;}}}}this.tick++;},
  update(dt){this.moveTime+=dt;if(this.power>0)this.power-=dt;if(this.moveTime>=.155){this.moveTime=0;this.step();}},
  draw(){bg('星际迷宫追逐','剩余豆子 '+this.dots+' · 生命 '+this.lives+' · '+(this.power>0?'反击 '+this.power.toFixed(1)+'s':'正常状态'));const size=30,sx=176,sy=95;for(let y=0;y<this.wall.length;y++)for(let x=0;x<15;x++){const q=this.wall[y][x],px=sx+x*size,py=sy+y*size;if(q==='#')R(px,py,size-2,size-2,'#294b79',5);else if(q==='.')circ(px+15,py+15,3,'#a6e2ec');else if(q==='o')circ(px+15,py+15,9,'#f9d484');}circ(sx+(this.x+.5)*size,sy+(this.y+.5)*size,12,'#ffe391');for(const g of this.ghosts)circ(sx+(g.x+.5)*size,sy+(g.y+.5)*size,12,this.power>0?'#6ccfeb':'#f6a1bf');}
 }),
 'plane-combat':shooter('plane'), 'space-invaders':shooter('invaders'),'space-shooter':shooter2,
 pong:()=>({
  init(){this.ball={x:400,y:260,vx:230,vy:rand(-120,120)};this.player=250;this.ai=250;this.left=0;this.right=0;this.cool=.8;notify('先得七分的一方获胜。');},
  key(k){if(k==='ArrowUp'||k==='KeyW')this.player-=45;if(k==='ArrowDown'||k==='KeyS')this.player+=45;},
  click(x,y){if(x<340)this.player=y;},
  update(dt){if(held('ArrowUp','KeyW'))this.player-=350*dt;if(held('ArrowDown','KeyS'))this.player+=350*dt;this.player=clamp(this.player,130,428);this.ai+=clamp(this.ball.y-this.ai,-230*dt,230*dt);this.ai=clamp(this.ai,130,428);if(this.cool>0){this.cool-=dt;return;}const b=this.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<105||b.y>439){b.vy*=-1;b.y=clamp(b.y,105,439);}if(b.x<141&&Math.abs(b.y-this.player)<44&&b.vx<0){b.vx=Math.abs(b.vx)*1.05;b.vy+=(b.y-this.player)*3;tone(350);}if(b.x>659&&Math.abs(b.y-this.ai)<44&&b.vx>0){b.vx=-Math.abs(b.vx)*1.05;b.vy+=(b.y-this.ai)*3;tone(400);}if(b.x<100||b.x>700){if(b.x<100)this.right++;else this.left++;points(this.left*100);level(this.left+' : '+this.right);if(this.left>=7||this.right>=7){finish(this.left>=7?'你赢了这场比赛！':'电脑获胜 · 再来挑战');return;}this.ball={x:400,y:260,vx:(this.left+this.right)%2?220:-220,vy:rand(-170,170)};this.cool=.8;}},
  draw(){bg('脉冲乒乓','先得七分获胜 · 你 '+this.left+' : '+this.right+' AI');stage();for(let y=96;y<435;y+=28)R(399,y,3,14,'#6e99bd');R(126,this.player-43,12,86,'#8df4d7',6);R(663,this.ai-43,12,86,'#c4aeff',6);circ(this.ball.x,this.ball.y,10,'#fff');T(this.left+' : '+this.right,400,138,38,'#e3efff');}
 }),
 'reaction-test':()=>({
  init(){this.round=0;this.total=0;this.results=[];this.state='ready';this.delay=rand(1.8,4.2);this.falseStarts=0;notify('等待画面亮绿时，立即点击或按空格。');},
  press(){if(this.state==='ready'){this.falseStarts++;this.delay=rand(1.5,3.6);this.state='early';this.early=.85;notify('抢跑！请等信号变绿');tone(160);return;}if(this.state!=='go')return;const ms=Math.round(this.signal*1000);this.results.push(ms);this.round++;this.total+=Math.max(0,500-ms);points(this.total);if(this.round>=5){finish('五轮测试完成 · 平均 '+Math.round(this.results.reduce((a,b)=>a+b,0)/5)+' ms');return;}this.state='wait';this.delay=rand(1.4,4.1);notify('第 '+(this.round+1)+' 轮即将开始');},
  click(x,y){if(hit(x,y,145,105,510,326))this.press();},
  key(k){if(k==='Space')this.press();},
  update(dt){if(this.state==='early'){this.early-=dt;if(this.early<=0)this.state='wait';}else if(this.state==='wait'||this.state==='ready'){this.delay-=dt;if(this.delay<=0){this.state='go';this.signal=0;}}else if(this.state==='go')this.signal+=dt;},
  draw(){bg('闪光反射实验','第 '+(this.round+1)+' / 5 轮 · 抢跑 '+this.falseStarts+' 次');const go=this.state==='go';R(145,105,510,326,go?'#246d5c':this.state==='early'?'#9b4a4b':'#662f48',26);T(go?'现在点击！':this.state==='early'?'抢跑了！':'等待信号',400,245,42,'#fff');text('点击大区域或按空格 · 绿灯亮起时反应',219,473,17,'#b6deef');}
 }),
 snake:()=>({
  init(){this.nx=24;this.ny=14;this.body=[{x:8,y:7},{x:7,y:7},{x:6,y:7}];this.dir=[1,0];this.intent=[1,0];this.food={x:16,y:8};this.moves=0;this.elapsed=0;this.speed=.125;this.total=0;notify('吃到能量点便可增长，不要撞墙或碰到自身。');},
  key(k){const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};const d=dirs[k];if(d&&d[0]!==-this.dir[0]&&d[1]!==-this.dir[1])this.intent=d;},
  eat(){let free=[];for(let y=0;y<this.ny;y++)for(let x=0;x<this.nx;x++)if(!this.body.some(b=>b.x===x&&b.y===y))free.push({x,y});if(!free.length){finish('全屏占领 · 完美通关！');return;}this.food=free[Math.floor(rand(0,free.length))];},
  update(dt){this.elapsed+=dt;if(this.elapsed<this.speed)return;this.elapsed=0;this.dir=this.intent.slice();const head={x:this.body[0].x+this.dir[0],y:this.body[0].y+this.dir[1]},eats=head.x===this.food.x&&head.y===this.food.y;if(head.x<0||head.x>=this.nx||head.y<0||head.y>=this.ny||this.body.slice(0,eats?undefined:-1).some(b=>b.x===head.x&&b.y===head.y)){finish('飞行失误 · '+this.total+' 分');return;}this.body.unshift(head);if(eats){this.total+=100;points(this.total);this.speed=Math.max(.068,this.speed-.002);tone(710);this.eat();}else this.body.pop();level('LENGTH '+this.body.length);},
  draw(){bg('星轨贪吃蛇','吃点增长 · 长度 '+this.body.length+' · 速度 '+(1/this.speed).toFixed(1));const sx=101,sy=101,cw=25,ch=24;R(sx-3,sy-3,this.nx*cw+6,this.ny*ch+6,'#182d49',12);for(let y=0;y<this.ny;y++)for(let x=0;x<this.nx;x++)if((x+y)%2)R(sx+x*cw,sy+y*ch,cw-1,ch-1,'#1b3450',3);this.body.forEach((p,i)=>R(sx+p.x*cw+2,sy+p.y*ch+2,cw-4,ch-4,i===0?'#a6ffe1':'#61bcb5',6));circ(sx+this.food.x*cw+12,sy+this.food.y*ch+12,9,'#ffd58e');}
 }),
 tetris:()=>({
  defs:[
   [[1,1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1],[1,1]],[[0,1,1],[1,1,0]],[[0,1,0],[1,1,1]],[[1,1,0],[0,1,1]]
  ],
  cols:['#79d9ff','#9cb7ff','#f6c48e','#ffe49e','#9df4d3','#d4afff','#ff9fab'],
  init(){this.board=Array.from({length:20},()=>Array(10).fill(-1));this.score=0;this.lines=0;this.fall=0;this.next=Math.floor(rand(0,7));this.spawn();notify('方向键移动，上键旋转，空格硬降。');},
  spawn(){const i=this.next;this.next=Math.floor(rand(0,7));this.cur={i,m:this.defs[i].map(r=>r.slice()),x:4,y:0};if(this.collide(0,0,this.cur.m))finish('方块堆到顶端 · 共消 '+this.lines+' 行');},
  collide(dx,dy,m){return m.some((r,y)=>r.some((v,x)=>v&&(this.cur.x+x+dx<0||this.cur.x+x+dx>=10||this.cur.y+y+dy>=20||(this.cur.y+y+dy>=0&&this.board[this.cur.y+y+dy][this.cur.x+x+dx]!==-1))));},
  move(dx){if(!this.collide(dx,0,this.cur.m))this.cur.x+=dx;},
  rotate(){const m=this.cur.m[0].map((_,i)=>this.cur.m.map(row=>row[i]).reverse());for(const nudge of [0,-1,1,-2,2])if(!this.collide(nudge,0,m)){this.cur.m=m;this.cur.x+=nudge;tone(380);return;}},
  lock(){for(let y=0;y<this.cur.m.length;y++)for(let x=0;x<this.cur.m[y].length;x++)if(this.cur.m[y][x]){if(this.cur.y+y<0){finish('方块触顶');return;}this.board[this.cur.y+y][this.cur.x+x]=this.cur.i;}let clear=0;for(let y=19;y>=0;y--){if(this.board[y].every(v=>v>=0)){this.board.splice(y,1);this.board.unshift(Array(10).fill(-1));clear++;y++;}}this.lines+=clear;if(clear){this.score+=[0,100,280,510,880][clear]*(1+Math.floor(this.lines/10));points(this.score);tone(760);}level('LINES '+this.lines);this.spawn();},
  down(){if(!this.collide(0,1,this.cur.m))this.cur.y++;else this.lock();},
  key(k){if(k==='ArrowLeft'||k==='KeyA')this.move(-1);if(k==='ArrowRight'||k==='KeyD')this.move(1);if(k==='ArrowUp'||k==='KeyW')this.rotate();if(k==='ArrowDown'||k==='KeyS'){this.down();this.score++;points(this.score);}if(k==='Space'){let steps=0;while(!this.collide(0,1,this.cur.m)&&steps++<21)this.cur.y++;this.score+=steps*2;points(this.score);this.lock();}},
  update(dt){this.fall+=dt;if(this.fall>Math.max(.09,.68-this.lines*.014)){this.fall=0;this.down();}},
  draw(){bg('方块轨道','消行 '+this.lines+' · 空格硬降');const sx=266,sy=67,size=20;R(sx-8,sy-7,216,418,'#172940',9);for(let y=0;y<20;y++)for(let x=0;x<10;x++){const v=this.board[y][x],color=v<0?(x+y)%2?'#1b344e':'#1a3048':this.cols[v];R(sx+x*size,sy+y*size,19,19,color,2);}for(let y=0;y<this.cur.m.length;y++)for(let x=0;x<this.cur.m[y].length;x++)if(this.cur.m[y][x])R(sx+(this.cur.x+x)*size,sy+(this.cur.y+y)*size,19,19,this.cols[this.cur.i],3);text('NEXT',532,106,19,'#bce0f0');this.defs[this.next].forEach((r,y)=>r.forEach((v,x)=>{if(v)R(542+x*22,138+y*22,20,20,this.cols[this.next],3);}));text('← → 移动',535,292,17,'#b9dce9');text('↑ 旋转',535,326,17,'#b9dce9');text('SPACE 直落',535,360,17,'#b9dce9');}
 }),
 'time-guardian':()=>({
  init(){this.p={x:400,y:250,hp:5,energy:100,inv:0};this.enemies=[];this.shots=[];this.spawn=0;this.fire=0;this.time=0;this.kills=0;this.slow=0;this.total=0;notify('存活 90 秒，空格开启两秒时缓。');level('SURVIVE 90S');},
  key(k){if(k==='Space'&&this.p.energy>=45&&this.slow<=0){this.p.energy-=45;this.slow=2;notify('时间减速！');tone(520);}},
  click(x,y){if(hit(x,y,593,433,160,40))this.key('Space');},
  update(dt){this.time+=dt;const p=this.p;if(p.inv>0)p.inv-=dt;if(this.slow>0)this.slow-=dt;else p.energy=clamp(p.energy+11*dt,0,100);const d=dt*(this.slow>0?.36:1);if(held('ArrowLeft','KeyA'))p.x-=260*dt;if(held('ArrowRight','KeyD'))p.x+=260*dt;if(held('ArrowUp','KeyW'))p.y-=260*dt;if(held('ArrowDown','KeyS'))p.y+=260*dt;p.x=clamp(p.x,124,674);p.y=clamp(p.y,110,422);this.spawn-=d;if(this.spawn<=0){this.spawn=Math.max(.18,.78-this.time*.004);this.enemies.push({x:rand(125,675),y:rand(110,415),speed:rand(28,58),hp:1});}this.fire-=dt;if(this.fire<=0){this.fire=.19;const target=this.enemies.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(target){const a=Math.atan2(target.y-p.y,target.x-p.x);this.shots.push({x:p.x,y:p.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.2});}}for(const e of this.enemies){const a=Math.atan2(p.y-e.y,p.x-e.x);e.x+=Math.cos(a)*e.speed*d;e.y+=Math.sin(a)*e.speed*d;if(Math.hypot(e.x-p.x,e.y-p.y)<24&&p.inv<=0){p.hp--;p.inv=1;notify('生命损失 · 剩余 '+p.hp+' 点');tone(160);if(p.hp<=0){finish('时空守卫倒下 · 生存 '+this.time.toFixed(1)+' 秒');return;}}}for(const b of this.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;const e=this.enemies.find(e=>!e.dead&&Math.hypot(e.x-b.x,e.y-b.y)<17);if(e){e.dead=true;b.life=0;this.kills++;this.total+=30;points(this.total);tone(580);}}this.enemies=this.enemies.filter(e=>!e.dead);this.shots=this.shots.filter(b=>b.life>0);level('TIME '+Math.ceil(Math.max(0,90-this.time))+'S');if(this.time>=90)finish('时空防线守住了 · '+this.kills+' 次击杀！');},
  draw(){bg('时空守卫','生存 '+this.time.toFixed(1)+' / 90 秒 · 击杀 '+this.kills+' 次');stage();const p=this.p;for(const e of this.enemies)circ(e.x,e.y,13,'#fa9cb4');for(const b of this.shots)circ(b.x,b.y,5,'#b8f5ff');ctx.globalAlpha=p.inv>0&&Math.floor(p.inv*14)%2?.4:1;circ(p.x,p.y,17,'#bcafff');ctx.globalAlpha=1;R(113,444,300,11,'#26324f',5);R(113,444,p.energy*3,11,'#89dbec',5);text('LIFE '+p.hp+'  · ENERGY '+Math.ceil(p.energy),114,473,16,'#c4e7fa');button(this.slow>0?'缓滞生效':'SPACE 时缓',593,433,160,40,'#3c5083');}
 }),
 'typing-game':()=>({
  pool:['rocket','orbital','galaxy','engine','thrust','vector','mission','planet','physics','cosmos','module','future','launch','velocity','gravity','control','science','astronaut','reentry','telemetry'],
  init(){this.time=60;this.score=0;this.combo=0;this.correct=0;this.round=0;this.word=this.pool[0];this.next();if(!document.getElementById('kineticTyping')){const input=document.createElement('input');input.id='kineticTyping';input.placeholder='输入单词，然后按 Enter';input.autocomplete='off';input.spellcheck=false;input.autocapitalize='off';input.setAttribute('aria-label','输入目标英文单词');input.style.cssText='display:block;box-sizing:border-box;margin:14px auto;padding:13px 18px;width:min(95%,450px);border-radius:14px;border:1px solid #8ac8ed;background:#1d3452;color:#f5fbff;font-size:18px;text-align:center;';document.querySelector('.game-actions').append(input);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.answer(input.value);input.value='';}});}}, 
  next(){this.round++;this.word=this.pool[Math.floor(rand(0,this.pool.length))];level('WORD '+this.round);},
  answer(w){if(this.time<=0)return;if(w.trim().toLowerCase()===this.word){this.correct++;this.combo++;this.score+=100+this.combo*15;points(this.score);tone(780);notify('拼写正确，继续连击！');}else{this.combo=0;this.time=Math.max(0,this.time-3);notify('拼写不符，-3 秒');tone(160);}this.next();},
  click(x,y){if(hit(x,y,253,356,294,66))document.getElementById('kineticTyping')?.focus();},
  update(dt){this.time-=dt;if(this.time<=0)finish('打字挑战完成 · 正确 '+this.correct+' 个');},
  draw(){bg('宇航打字挑战','输入下方单词，Enter 提交 · 剩余 '+Math.ceil(Math.max(0,this.time))+' 秒');T(this.word.toUpperCase(),400,218,49,'#9df2da');button('点此聚焦输入框',253,356,294,66,'#2a5271');text('正确 '+this.correct+'   连击 '+this.combo,280,468,17,'#bce4f4');}
 })
 };
};
})();