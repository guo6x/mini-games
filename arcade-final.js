/* ORBIT ARCADE final-quality puzzle and creative mechanics. */
(()=>{
'use strict';
window.ORBIT_FINAL_META={
 mahjong:{name:'霓虹麻将消消乐',sub:'成对配牌 · 开放边缘 · 48 张牌挑战',instruction:'只能选择左右至少一侧畅通的牌，点击两张图案一致的开放牌即可消除。用最少操作清空 48 张牌。',hint:'从最外侧开路，优先找同一行的对称牌。',accent:'#adf3d6'},
 'sudoku-killer':{name:'杀手数独入门',sub:'4×4 数独 · 双格加法 · 三重挑战',instruction:'行、列及2×2宫都必须填1–4且不能重复。虚线笼区域显示两格之和，使用下方数字填写选中格子。',hint:'先观察已给数字与每个笼子的数字和。',accent:'#b2c8ff'},
 'dress-up':{name:'未来造型实验室',sub:'四大潮流主题 · 调配服饰 · 舞台评审',instruction:'依照每轮的造型主题选择发型、上衣、下装和饰品，再点击“走上舞台”获得评分。每轮达到 75 分进入下一主题。',hint:'注意主题描述：霓虹、森林、云端和宇宙各有偏好的搭配。',accent:'#ffc2e4'},
 pinball:{name:'霓虹弹珠竞技',sub:'反弹撞击 · 触发机关 · 三球冲高分',instruction:'方向键左右击打下方两侧拨杆，也可点击弹珠台左下/右下区域。击中霓虹机关得分，避免球落出底部。',hint:'盯紧球接近下方时再拨杆，击中彩色机关得分更快。',accent:'#95aaff'}
};
window.ORBIT_FINAL=api=>{
 const {ctx,fill,text,points,level,finish,notify,tone,clamp,rand}=api;
 const circ=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
 return {
 mahjong:()=>({
  glyphs:['一','二','三','四','五','六','七','八','九','東','南','中'],
  init(){this.tiles=Array.from({length:4},()=>Array(12).fill(null));const ids=Array.from({length:24},(_,i)=>i%12).sort(()=>Math.random()-.5);let k=0;for(let r=0;r<4;r++)for(let c=0;c<6;c++){this.tiles[r][c]=ids[k];this.tiles[r][11-c]=ids[k];k++;}this.selected=null;this.removed=0;this.time=0;this.lastMatch=0;this.combo=0;this.score=0;},
  free(r,c){if(this.tiles[r][c]===null)return false;return c===0||c===11||this.tiles[r][c-1]===null||this.tiles[r][c+1]===null;},
  click(px,py){const c=Math.floor((px-62)/56),r=Math.floor((py-92)/79);if(c<0||c>=12||r<0||r>=4)return;if(!this.free(r,c)){notify('这张牌还被两侧挡住');return;}if(!this.selected){this.selected={r,c};return;}const a=this.selected;this.selected=null;if(a.r===r&&a.c===c)return;if(this.tiles[a.r][a.c]!==this.tiles[r][c]){notify('牌面不同，重新寻找配对');tone(180);return;}this.tiles[a.r][a.c]=null;this.tiles[r][c]=null;this.removed+=2;this.combo=this.time-this.lastMatch<6?this.combo+1:1;this.lastMatch=this.time;this.score+=100+this.combo*12;points(this.score);level('CLEAR '+this.removed+'/48');notify('成功消除一对！连击 x'+this.combo);tone(840);if(this.removed===48)finish('48 张麻将全部消除！');},
  update(dt){this.time+=dt;},
  draw(){fill(0,0,800,500,'#101d2c');for(let r=0;r<4;r++)for(let c=0;c<12;c++){const v=this.tiles[r][c];if(v===null)continue;const x=62+c*56,y=92+r*79;const selected=this.selected&&this.selected.r===r&&this.selected.c===c,free=this.free(r,c);fill(x+3,y+6,49,68,'#0c1421',9);fill(x,y,49,67,selected?'#fff4ae':free?'#ecf6ef':'#8897aa',9);fill(x+5,y+5,39,57,'#f9fcf2',6);text(this.glyphs[v],x+24,y+29,28,v>8?'#cd6d7e':'#35766f','center');text('✧',x+24,y+51,14,'#9bbaa7','center');if(selected){ctx.strokeStyle='#ffe6a2';ctx.lineWidth=3;ctx.strokeRect(x,y,49,67);ctx.lineWidth=1;}}text('麻将连连看',62,50,25,'#d5fff2');text('剩余 '+(48-this.removed)+' 张',588,50,18,'#b9f2df');text('只能选择两侧未被挡住的牌',75,450,16,'#a0cfc4');text('连击 x'+this.combo,615,450,18,'#c3dafe');}
 }),
 'sudoku-killer':()=>({
  pairs:[[0,1],[2,3],[4,8],[5,6],[7,11],[9,10],[12,13],[14,15]],
  init(){this.stage=0;this.total=0;this.failures=0;this.build();},
  build(){const base=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],order=[1,2,3,4].sort(()=>Math.random()-.5);this.solution=base.flat().map(n=>order[n-1]);this.cages=this.pairs.map(pair=>({indices:pair,sum:pair.reduce((s,i)=>s+this.solution[i],0)}));this.given=new Set([0,3,9,12]);this.board=this.solution.map((v,i)=>this.given.has(i)?v:0);this.selected=null;this.done=0;level('KILLER '+(this.stage+1)+'/3');notify('完成4×4数独，笼子数字代表两格相加');},
  click(x,y){if(y>=410){const n=Math.floor((x-217)/82)+1;if(n>=1&&n<=4)this.input(n);return;}const col=Math.floor((x-218)/78),row=Math.floor((y-70)/78);if(col<0||col>3||row<0||row>3)return;const i=row*4+col;if(!this.given.has(i)){this.selected=i;notify('选择位置：第'+(row+1)+'行第'+(col+1)+'列');}},
  key(c){const n={Digit1:1,Digit2:2,Digit3:3,Digit4:4}[c];if(n)this.input(n);},
  input(n){if(this.selected===null)return;const i=this.selected;if(this.given.has(i))return;if(this.solution[i]!==n){this.failures++;notify('与行列或笼子线索不符！错误 '+this.failures+'/5');tone(160);if(this.failures>=5)finish('错误次数耗尽，重新挑战');return;}if(this.board[i]===n)return;this.board[i]=n;this.total+=100;points(this.total);tone(770);if(this.board.every((v,k)=>v===this.solution[k])){if(this.stage===2){finish('三道杀手数独全部解开！');return;}this.stage++;this.build();}},
  update(){},
  draw(){fill(0,0,800,500,'#15192e');fill(205,56,336,332,'#24324f',18);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const i=y*4+x,px=217+x*78,py=68+y*78;fill(px+2,py+2,74,74,this.selected===i?'#526f92':this.given.has(i)?'#334861':'#253552',9);const cage=this.cages.find(g=>g.indices.includes(i));if(cage&&cage.indices[0]===i)text(String(cage.sum)+'+',px+8,py+11,12,'#edce96');if(this.board[i])text(String(this.board[i]),px+38,py+42,30,this.given.has(i)?'#fcdbac':'#ddf6ff','center');}ctx.lineWidth=3;ctx.strokeStyle='#b5cbea';for(let t=0;t<3;t++){const p=217+t*156;ctx.beginPath();ctx.moveTo(p,68);ctx.lineTo(p,380);ctx.stroke();const py=68+t*156;ctx.beginPath();ctx.moveTo(217,py);ctx.lineTo(529,py);ctx.stroke();}ctx.lineWidth=1;text('4×4 KILLER',28,42,21,'#c5d8ff');text('错误 '+this.failures+' / 5',28,82,17,'#e8b3c0');text('每个笼子两格',576,106,17,'#c1d6ef');text('小字是数字和',576,134,15,'#91b4db');for(let i=0;i<4;i++){const x=217+i*82;fill(x,410,74,67,'#3c5275',11);text(String(i+1),x+37,443,30,'#fff','center');}text('先选择格子，再输入数字',35,451,15,'#b2c9e8');}
 }),
 'dress-up':()=>({
  themes:[
   {name:'霓虹派对',subtitle:'高亮发色 · 金属服装 · 霓虹鞋',win:[1,2,1,0]},
   {name:'森林漫游',subtitle:'自然松弛 · 草木气息 · 轻便鞋',win:[2,0,2,1]},
   {name:'云端旅行',subtitle:'干净清爽 · 轻柔层次 · 白蓝色',win:[0,1,3,2]},
   {name:'宇宙舞台',subtitle:'大胆撞色 · 星光金属 · 未来感',win:[3,3,0,3]}
  ],
  names:['发型','上衣','下装','饰品'],
  init(){this.stage=0;this.total=0;this.tries=0;this.style=[0,0,0,0];this.message='按主题挑选四件单品';this.ratings=[];},
  click(x,y){const row=Math.floor((y-107)/72);if(x>=35&&x<318&&row>=0&&row<4){const n=Math.floor((x-35)/67);if(n>=0&&n<4){this.style[row]=n;tone(420);return;}}if(y>=422&&x>=320&&x<612)this.submit();},
  submit(){const th=this.themes[this.stage],matches=this.style.filter((n,i)=>n===th.win[i]).length;const score=matches*25;this.tries++;this.message='本轮造型评分：'+score+' 分';notify(this.message);tone(score>=75?900:240);if(score>=75){this.total+=score;points(this.total);this.stage++;this.tries=0;this.style=[0,0,0,0];if(this.stage===4){finish('潮流四连冠，未来造型师！');return;}level('STYLE '+(this.stage+1)+'/4');}else if(this.tries>=4){this.tries=0;this.message='本轮尚未达标，请重新挑选主题单品';}},
  update(){},
  draw(){fill(0,0,800,500,'#211a35');const theme=this.themes[this.stage];if(!theme)return;ctx.shadowColor='#8e66c8';ctx.shadowBlur=35;ctx.beginPath();ctx.ellipse(513,246,171,203,0,0,Math.PI*2);ctx.fillStyle='#54416a';ctx.fill();ctx.shadowBlur=0;fill(37,32,710,51,'#372b56',17);text(theme.name,57,57,24,'#f9edff');text(theme.subtitle,352,58,15,'#ebc7fb');const colors=['#b8defa','#ff91c6','#97cbaa','#c2a0fe'],jacket=['#8ac7b3','#b0cce9','#eb92c5','#9e8bee'],pants=['#b3accd','#99d4ed','#9fcdad','#654e9b'],acc=['#f4d48f','#83efc4','#b3d7ff','#eeb2ff'];for(let row=0;row<4;row++){const y=107+row*72;text(this.names[row],38,y-7,14,'#dbc6f5');for(let i=0;i<4;i++){const x=35+i*67;fill(x,y+8,59,44,i===this.style[row]?'#706095':'#352b52',11);ctx.shadowColor=[colors,jacket,pants,acc][row][i];ctx.shadowBlur=9;fill(x+15,y+15,29,29,[colors,jacket,pants,acc][row][i],8);ctx.shadowBlur=0;}}
 ctx.fillStyle='#e9bbab';ctx.beginPath();ctx.ellipse(513,152,35,44,0,0,Math.PI*2);ctx.fill();const hair=colors[this.style[0]];ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(513,129,47,30,0,Math.PI,Math.PI*2);ctx.fill();fill(466,139,12,this.style[0]%2?45:23,hair,5);fill(548,139,12,this.style[0]%2?45:23,hair,5);fill(496,147,7,5,'#302b47',4);fill(526,147,7,5,'#302b47',4);
 fill(490,186,46,52,'#ecc5b1',9);ctx.fillStyle=jacket[this.style[1]];ctx.beginPath();ctx.moveTo(477,196);ctx.lineTo(549,196);ctx.lineTo(556,310);ctx.lineTo(472,310);ctx.closePath();ctx.fill();fill(464,205,18,115,jacket[this.style[1]],9);fill(546,205,18,115,jacket[this.style[1]],9);
 fill(483,310,28,117,pants[this.style[2]],7);fill(515,310,28,117,pants[this.style[2]],7);fill(478,421,40,17,'#d6ddef',9);fill(512,421,40,17,'#d6ddef',9);const accessory=acc[this.style[3]];ctx.shadowColor=accessory;ctx.shadowBlur=12;fill(491,201,44,13,accessory,8);ctx.shadowBlur=0;text(['✦','☘','◈','✧'][this.style[3]],513,221,21,'#fcf9ff','center');fill(320,422,292,56,'#efb4ef',13);text('走上舞台 · 提交造型',466,450,19,'#2e1d44','center');text(this.message,643,459,12,'#e8d0fa','center');}
 }),
 pinball:()=>({
  bumpers:[{x:300,y:140,r:32},{x:500,y:141,r:33},{x:400,y:225,r:37},{x:285,y:303,r:27},{x:518,y:306,r:27}],
  init(){this.score=0;this.balls=3;this.t=0;this.left=0;this.right=0;this.spawn();},
  spawn(){this.ball={x:400,y:72,vx:rand(-130,130),vy:60,r:10};notify('球已发射！方向键左右操纵拨杆');},
  impulse(side){const b=this.ball;if(!b)return;const p=side==='left'?{x:330,y:421}:{x:470,y:421};if(Math.hypot(b.x-p.x,b.y-p.y)<115&&b.y>355){b.vy=-575;b.vx=(side==='left'?1:-1)*rand(100,250);this.score+=40;points(this.score);tone(650);}if(side==='left')this.left=.16;else this.right=.16;},
  key(c){if(c==='ArrowLeft'||c==='KeyA')this.impulse('left');else if(c==='ArrowRight'||c==='KeyD')this.impulse('right');},
  click(x,y){if(y>310)this.impulse(x<400?'left':'right');},
  update(dt){this.t+=dt;this.left=Math.max(0,this.left-dt);this.right=Math.max(0,this.right-dt);const b=this.ball;if(!b)return;b.vy+=510*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<214+b.r){b.x=214+b.r;b.vx=Math.abs(b.vx)*.94;}if(b.x>586-b.r){b.x=586-b.r;b.vx=-Math.abs(b.vx)*.94;}if(b.y<62+b.r){b.y=62+b.r;b.vy=Math.abs(b.vy);}
  for(const q of this.bumpers){const dx=b.x-q.x,dy=b.y-q.y,dist=Math.hypot(dx,dy),min=q.r+b.r+2;if(dist<min){const nx=dx/(dist||1),ny=dy/(dist||1),v=b.vx*nx+b.vy*ny;b.x=q.x+nx*min;b.y=q.y+ny*min;b.vx-=2*v*nx;b.vy-=2*v*ny;b.vx+=rand(-50,50);b.vy-=65;this.score+=120;points(this.score);tone(800);}}
  if(b.y>482){this.balls--;if(this.balls<=0){finish('弹珠挑战结束，得分 '+this.score);return;}this.spawn();level('BALL '+this.balls+'/3');}
  if(this.score>=9000)finish('霓虹弹珠大师，满分通关！');},
  draw(){fill(0,0,800,500,'#10142e');fill(202,51,396,445,'#1f274f',32);ctx.strokeStyle='#7a96e3';ctx.lineWidth=7;ctx.strokeRect(209,60,382,432);ctx.lineWidth=1;for(let i=0;i<18;i++){const x=240+(i*83)%320,y=86+(i*67)%370;circ(x,y,2,'#bbbcff8c');}for(const q of this.bumpers){ctx.shadowColor='#c6a8ff';ctx.shadowBlur=25;circ(q.x,q.y,q.r,'#735dbf');ctx.shadowBlur=0;circ(q.x,q.y,q.r-9,'#b1a3ee');circ(q.x,q.y,8,'#fcdeff');}const b=this.ball;if(b){ctx.shadowColor='#d6f4ff';ctx.shadowBlur=18;circ(b.x,b.y,b.r,'#eff5ff');ctx.shadowBlur=0;}ctx.lineWidth=16;ctx.lineCap='round';for(const [side,px] of [['left',335],['right',465]]){const active=side==='left'?this.left:this.right;const yy=419-(active?28:0);ctx.strokeStyle=active?'#e6faff':'#7ddaff';ctx.beginPath();ctx.moveTo(px,435);ctx.lineTo(px+(side==='left'?57:-57),yy);ctx.stroke();}ctx.lineWidth=1;text('PINBALL / NEON',26,46,19,'#c9ceff');text('剩余球 '+this.balls,26,88,17,'#b5c4ff');text('BUMPERS',626,51,16,'#d5c8f8');text('120 PTS / HIT',625,81,15,'#bdb2e6');text('← FLIP',232,473,16,'#c7e8ff');text('FLIP →',505,473,16,'#c7e8ff');}
 })
 };
};
})();