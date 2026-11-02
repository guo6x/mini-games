/* ORBIT ARCADE / Cortex Pack: real puzzle rules, deterministic input contracts, self-contained assets. */
(()=>{'use strict';
window.ORBIT_CORTEX_META={
 '2048':{name:'2048 · 光谱矩阵',sub:'合并能量 · 规划空间 · 目标 2048',instruction:'方向键或滑动控制全部方块，同数字合并，每回合产生新块。无法移动时结束。',hint:'保持大数字靠近一个角，并保留可腾挪的空格。',accent:'#ffdb9a'},
 'card-memory':{name:'星图记忆',sub:'16 张卡牌 · 8 组匹配 · 步数挑战',instruction:'翻开两张卡牌寻找相同符号，错误匹配会短暂展示再翻回；全部配对完成。',hint:'记住错过的两张牌所在位置，连续配对获得奖励。',accent:'#b6a2ff'},
 'memory-game':{name:'记忆超频',sub:'20 张卡 · 10 组匹配 · 限时',instruction:'翻开两张卡片并记住位置，配对成功会锁定；在倒计时结束前消除所有卡片。',hint:'相邻区域逐步排查，比随机点击更有效。',accent:'#86e9fa'},
 'color-match':{name:'色彩干扰实验',sub:'斯特鲁普挑战 · 读颜色而非汉字',instruction:'看大字显示的墨水颜色，选择对应颜色名称，而不是阅读字面含义。持续 40 秒。',hint:'快速盯住字形的颜色；连对会提升倍率。',accent:'#ffd383'},
 'connect-dots':{name:'星际连线',sub:'依次连接序号 · 清晰路径 · 三轮挑战',instruction:'从 1 开始依次点击发光节点连接星际路线。点击错误节点扣时间，通关开启下一张星图。',hint:'先扫视路线再点击，留意较远的编号。',accent:'#9cdefb'},
 hangman:{name:'解码单词',sub:'英文猜词 · 字母推理 · 八次失误机会',instruction:'使用键盘 A–Z，或点击字母选择区。猜对显示对应位置，猜错失去一次尝试。',hint:'从 E、A、O、I 等常见元音开始。',accent:'#b9ffc8'},
 minesweeper:{name:'深空扫雷',sub:'9×9 方格 · 10 颗地雷 · 推理求生',instruction:'点击格子揭开，首次点击一定安全；点击右侧“旗帜模式”按钮或按空格切换标记，找出全部安全格。',hint:'数字表示周围八格中地雷的数量。',accent:'#8cdaff'},
 'number-memory':{name:'数字闪忆',sub:'闪现记忆 · 序列还原 · 十轮挑战',instruction:'观察数字短暂出现，然后选择正确的数字序列。回答正确会增加长度、缩短观察时间。',hint:'尝试按 2–3 位分组记忆，而非逐位背诵。',accent:'#ffdb9a'},
 puzzle:{name:'九宫数字迷阵',sub:'3×3 滑块 · 20 次随机打乱 · 思路训练',instruction:'点击与空白格相邻的数字使它移动，恢复 1–8 的正确顺序。',hint:'先处理顶部一行，再处理最后两行。',accent:'#97eaff'},
 'sliding-puzzle':{name:'15 数码挑战',sub:'4×4 滑块 · 真实可解 · 步数统计',instruction:'点击空白格上下左右相邻的方块，目标是从 1 排列到 15，空格位于右下角。',hint:'从左上角开始逐行归位，避免打乱已经完成的部分。',accent:'#b9b2ff'},
 'spot-difference':{name:'星图找不同',sub:'双画面对比 · 找出 5 处差异 · 三幅作品',instruction:'比较左右两侧场景，点击任意一侧不同的位置；每轮找全 5 处进入下一关。',hint:'从形状、亮度、位置和多出的物体找线索。',accent:'#ffbdd7'},
 sudoku:{name:'经典数独 · 逻辑九宫',sub:'9×9 完整数独 · 合法棋盘 · 笔记挑战',instruction:'点击方格选中，用数字键 1–9 或画面下方数字键盘填数；按 Delete 清空，填满且满足数独规则通关。',hint:'优先寻找缺数最少的行、列和九宫格。',accent:'#a7fad6'}
};
window.ORBIT_CORTEX=api=>{
 const {ctx,fill,text,points,level,finish,notify,tone,clamp,rand}=api;
 const R=(x,y,w,h,c,r=9)=>fill(x,y,w,h,c,r);
 const T=(s,x,y,size=20,c='#eaf8ff')=>text(String(s),x,y,size,c,'center');
 const hit=(x,y,l,t,w,h)=>x>=l&&y>=t&&x<l+w&&y<t+h;
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rand(0,i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const spark=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
 const backdrop=(label,sub='')=>{fill(0,0,800,500,'#111d34');for(let i=0;i<45;i++){const x=(i*157+47)%800,y=(i*83+27)%500;spark(x,y,i%4===0?2:1,'#79a7d64b');}text(label,34,34,23,'#e6f6ff');if(sub)text(sub,34,65,14,'#92b9d6');};
 const tile=(x,y,w,h,s,c='#24405e',sel=false)=>{R(x,y,w,h,c,10);if(sel){ctx.strokeStyle='#72f7d7';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,w-4,h-4);ctx.lineWidth=1;}if(s!==undefined)T(s,x+w/2,y+h/2,Math.min(30,w*.43));};
 const pairFactory=(count,secs)=>{
  const glyphs=['✦','◆','☄','♠','☀','◈','❖','✿','⬡','☾','★','♣'];
  return ()=>({
   init(){this.total=0;this.moves=0;this.streak=0;this.time=secs;this.hold=0;this.open=[];const data=shuffle(Array.from({length:count*2},(_,i)=>glyphs[i%count]));this.cards=data.map(v=>({v,done:false}));level('PAIRS 0 / '+count);notify('每次翻开两张卡，寻找匹配符号。');},
   click(x,y){if(this.hold||this.open.length>=2||this.cards.every(c=>c.done))return;const cols=5,rows=Math.ceil(count*2/cols),w=116,h=Math.min(80,345/rows),sx=99,sy=96,gx=10,gy=10;const col=Math.floor((x-sx)/(w+gx)),row=Math.floor((y-sy)/(h+gy)),i=row*cols+col;if(col<0||row<0||col>=cols||i>=this.cards.length||!hit(x,y,sx+col*(w+gx),sy+row*(h+gy),w,h))return;const card=this.cards[i];if(card.done||this.open.includes(i))return;this.open.push(i);if(this.open.length===2){this.moves++;const [a,b]=this.open;if(this.cards[a].v===this.cards[b].v){this.cards[a].done=this.cards[b].done=true;this.streak++;this.total+=120+this.streak*20;this.open=[];points(this.total);tone(780);const matches=this.cards.filter(c=>c.done).length/2;level('PAIRS '+matches+' / '+count);if(matches===count)finish('星图完全复原 · '+this.moves+' 次尝试');}else{this.streak=0;this.hold=.85;tone(210);}}},
   update(dt){if(secs){this.time-=dt;if(this.time<=0)finish('倒计时结束 · 已得 '+this.total+' 分');}if(this.hold){this.hold-=dt;if(this.hold<=0){this.hold=0;this.open=[];}}},
   draw(){backdrop(count===8?'星图记忆':'记忆超频',secs?'剩余 '+Math.ceil(Math.max(0,this.time))+' 秒':'没有时间压力，尽量减少翻牌');const cols=5,rows=Math.ceil(count*2/cols),w=116,h=Math.min(80,345/rows),sx=99,sy=96,gx=10,gy=10;for(let i=0;i<this.cards.length;i++){const c=this.cards[i],x=sx+(i%cols)*(w+gx),y=sy+Math.floor(i/cols)*(h+gy),open=c.done||this.open.includes(i);tile(x,y,w,h,open?c.v:'✳',c.done?'#236b62':open?'#425b89':'#203656',open&&!c.done);}text('尝试 '+this.moves+'   连击 '+this.streak,34,472,17,'#b7d9fa');}
  });
 };
 const sliding=(n)=>()=>({
  init(){this.n=n;this.a=Array.from({length:n*n},(_,i)=>(i+1)%(n*n));this.empty=n*n-1;this.moves=0;this.elapsed=0;let prev=-1;for(let i=0;i<(n===3?35:115);i++){let opts=this.neighbors(this.empty).filter(x=>x!==prev);if(!opts.length)opts=this.neighbors(this.empty);const pick=opts[Math.floor(rand(0,opts.length))];prev=this.empty;this.a[this.empty]=this.a[pick];this.a[pick]=0;this.empty=pick;}level('MOVES 0');notify('每个打乱状态都由合法移动生成，保证可以解开。');},
  neighbors(i){const x=i%this.n,y=Math.floor(i/this.n),out=[];if(x>0)out.push(i-1);if(x<this.n-1)out.push(i+1);if(y>0)out.push(i-this.n);if(y<this.n-1)out.push(i+this.n);return out;},
  move(i){if(!this.neighbors(this.empty).includes(i))return;this.a[this.empty]=this.a[i];this.a[i]=0;this.empty=i;this.moves++;points(Math.max(0,3000-this.moves*12));level('MOVES '+this.moves);tone(440);if(this.a.every((v,j)=>v===(j+1)%(this.n*this.n)))finish('解谜成功 · '+this.moves+' 步');},
  click(x,y){const size=this.n===3?104:84,g=9,sx=(800-(size+g)*this.n+g)/2,sy=88;if(!hit(x,y,sx,sy,(size+g)*this.n,(size+g)*this.n))return;const col=Math.floor((x-sx)/(size+g)),row=Math.floor((y-sy)/(size+g));if(col<this.n&&row<this.n)this.move(row*this.n+col);},
  key(code){const row=Math.floor(this.empty/this.n),col=this.empty%this.n;const m={ArrowLeft:col<this.n-1?this.empty+1:-1,ArrowRight:col>0?this.empty-1:-1,ArrowUp:row<this.n-1?this.empty+this.n:-1,ArrowDown:row>0?this.empty-this.n:-1};if(m[code]>=0)this.move(m[code]);},
  update(dt){this.elapsed+=dt;},
  draw(){backdrop(this.n===3?'九宫数字迷阵':'15 数码挑战','完成从 1 到 '+(this.n*this.n-1)+' 的排列 · '+Math.floor(this.elapsed)+' 秒');const size=this.n===3?104:84,g=9,sx=(800-(size+g)*this.n+g)/2,sy=88;for(let i=0;i<this.a.length;i++){const v=this.a[i],x=sx+(i%this.n)*(size+g),y=sy+Math.floor(i/this.n)*(size+g);tile(x,y,size,size,v||'',v===0?'#111f35':v===i+1?'#235c5d':'#29446b');}text('只可移动邻接空格的方块 · 支持方向键',190,461,16,'#b2dded');}
 });
 return {
 '2048':()=>({
  init(){this.a=Array(16).fill(0);this.total=0;this.win=false;this.spawn();this.spawn();notify('用方向键让相同数值碰撞并合并。');},
  spawn(){const spaces=this.a.map((v,i)=>v?-1:i).filter(i=>i>=0);if(spaces.length){this.a[spaces[Math.floor(rand(0,spaces.length))]]=Math.random()<.9?2:4;}},
  key(c){const dirs={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,KeyA:0,KeyW:1,KeyD:2,KeyS:3};if(!(c in dirs))return;const d=dirs[c],prev=this.a.join(',');for(let line=0;line<4;line++){let ids=Array.from({length:4},(_,k)=>d%2===0?line*4+(d===0?k:3-k):(d===1?k:3-k)*4+line);let nums=ids.map(i=>this.a[i]).filter(Boolean),merged=[];for(let i=0;i<nums.length;i++){if(nums[i]===nums[i+1]){const v=nums[i]*2;merged.push(v);this.total+=v;i++;if(v>=2048)this.win=true;}else merged.push(nums[i]);}ids.forEach((i,k)=>this.a[i]=merged[k]||0);}if(this.a.join(',')===prev)return;this.spawn();points(this.total);level('MAX '+Math.max(...this.a));tone(450);if(this.win){finish('合成 2048！');return;}if(!this.a.some(v=>v===0)&&!this.a.some((v,i)=>i%4<3&&v===this.a[i+1]||i<12&&v===this.a[i+4]))finish('空间已锁定 · 最高 '+Math.max(...this.a));},
  click(x,y){const sx=156,sy=92,w=116;if(hit(x,y,sx,sy,480,360)){const cx=x<400?'ArrowLeft':'ArrowRight';this.key(cx);}},
  update(){},
  draw(){backdrop('2048 · 光谱矩阵','合并相同数字 · 大数字尽量靠角落');const colors={0:'#1b304b',2:'#2a5865',4:'#376c76',8:'#5d657c',16:'#987c6b',32:'#b36d62',64:'#c65e66',128:'#bb7c48',256:'#b9984c',512:'#9d8ada',1024:'#c58bca',2048:'#edca5a'};for(let i=0;i<16;i++){const x=158+(i%4)*122,y=92+Math.floor(i/4)*91,v=this.a[i];tile(x,y,111,82,v||'',colors[v]||'#d6aeff');}text('↑ ↓ ← → 移动 · 每一步都很重要',200,473,17,'#bcdced');}
 }),
 'card-memory':pairFactory(8,0),'memory-game':pairFactory(10,95),
 'color-match':()=>({
  colors:[['红','#fd7c8c'],['蓝','#78bffe'],['绿','#86edc2'],['黄','#f8d76f'],['紫','#c7a5ff'],['橙','#ffc18d']],
  init(){this.time=40;this.total=0;this.combo=0;this.question();notify('选“墨水颜色”，不是字面意思。');},
  question(){this.ink=Math.floor(rand(0,6));this.word=Math.floor(rand(0,6));this.opts=shuffle(Array.from({length:6},(_,i)=>i)).slice(0,4);if(!this.opts.includes(this.ink))this.opts[Math.floor(rand(0,4))]=this.ink;shuffle(this.opts);},
  answer(i){if(this.opts[i]===this.ink){this.combo++;this.total+=50+this.combo*10;points(this.total);tone(650);}else{this.combo=0;this.time=Math.max(0,this.time-2);tone(170);notify('这是“'+this.colors[this.ink][0]+'”，不要被文字骗了。');}this.question();},
  click(x,y){for(let i=0;i<4;i++){const px=155+i%2*255,py=284+Math.floor(i/2)*83;if(hit(x,y,px,py,235,67)){this.answer(i);return;}}},
  key(k){const v={Digit1:0,Digit2:1,Digit3:2,Digit4:3};if(k in v)this.answer(v[k]);},
  update(dt){this.time-=dt;if(this.time<=0)finish('颜色实验结束 · '+this.total+' 分');},
  draw(){backdrop('色彩干扰实验','选择文字显示的【颜色】，忽略文字本身');fill(138,76,520,9,'#253b57',6);fill(138,76,520*clamp(this.time/40,0,1),9,'#77edcb',6);T(this.colors[this.word][0]+'色',400,187,96,this.colors[this.ink][1]);for(let i=0;i<4;i++){const x=155+i%2*255,y=284+Math.floor(i/2)*83;tile(x,y,235,67,(i+1)+' · '+this.colors[this.opts[i]][0],'#274467');}text('TIME '+Math.ceil(this.time),34,468,18,'#b9e6f0');text('COMBO ×'+this.combo,585,468,18,'#b9e6f0');}
 }),
 'connect-dots':()=>({
  init(){this.stage=0;this.total=0;this.build();notify('按照序号点击并连接所有节点。');},
  build(){this.idx=0;this.nodes=shuffle(Array.from({length:8+this.stage*3},(_,i)=>({id:i+1,x:136+(i%4)*150+rand(-35,35),y:140+Math.floor(i/4)*105+rand(-25,25)})));this.time=45+this.stage*12;level('MAP '+(this.stage+1)+'/3');},
  click(x,y){const n=this.nodes.find(n=>n.id===this.idx+1&&Math.hypot(n.x-x,n.y-y)<30);if(n){this.idx++;this.total+=80+Math.floor(this.time);points(this.total);tone(710);if(this.idx===this.nodes.length){if(this.stage===2){finish('星路全线连通！');return;}this.stage++;this.build();}}else{this.time-=2;notify('节点顺序不正确，损失 2 秒');tone(140);}},
  update(dt){this.time-=dt;if(this.time<=0)finish('探索结束 · 已连通 '+this.idx+' 个节点');},
  draw(){backdrop('星际连线','节点 '+this.idx+' / '+this.nodes.length+' · 剩余 '+Math.ceil(this.time)+' 秒');const done=this.nodes.filter(n=>n.id<=this.idx).sort((a,b)=>a.id-b.id);ctx.strokeStyle='#67f2dd';ctx.lineWidth=4;ctx.beginPath();done.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();for(const n of this.nodes){const active=n.id===this.idx+1,completed=n.id<=this.idx;spark(n.x,n.y,active?25:21,completed?'#286e6d':active?'#70f0d1':'#284561');T(n.id,n.x,n.y,19,active?'#083245':'#e4f3ff');}text('目标 '+(this.idx+1)+'    错点 -2 秒',34,469,17,'#b7deed');}
 }),
 hangman:()=>({
  pool:[['ORBIT','围绕天体的轨道'],['ROCKET','能够自行推进的飞行器'],['ENGINE','将能量转化为机械动力'],['GALAXY','恒星组成的巨大系统'],['MISSION','需要执行的任务'],['PLANET','绕恒星运行的大型天体'],['THRUST','推进力'],['GRAVITY','物体之间的引力'],['VECTOR','有方向和大小的量'],['FLIGHT','飞行'],['COMPUTER','电子计算设备']],
  init(){this.round=0;this.total=0;this.next();},
  next(){const idx=Math.floor(rand(0,this.pool.length));[this.answer,this.clue]=this.pool[idx];this.guesses=new Set();this.wrong=0;level('ROUND '+(this.round+1)+'/5');notify('输入英文字符，最多允许 8 次猜错。');},
  guess(letter){if(!/^[A-Z]$/.test(letter)||this.guesses.has(letter))return;this.guesses.add(letter);if(!this.answer.includes(letter)){this.wrong++;tone(190);}else tone(560);if([...this.answer].every(l=>this.guesses.has(l))){this.total+=Math.max(20,180-this.wrong*20);points(this.total);this.round++;if(this.round>=5){finish('全部单词解码成功！');return;}this.next();return;}if(this.wrong>=8)finish('解码失败 · 正确答案 '+this.answer);},
  key(k){if(/^Key[A-Z]$/.test(k))this.guess(k[3]);},
  click(x,y){if(!hit(x,y,60,310,700,148))return;const col=Math.floor((x-60)/54),row=Math.floor((y-310)/74),i=row*13+col;if(col>=0&&col<13&&row<2&&i<26)this.guess(String.fromCharCode(65+i));},
  update(){},
  draw(){backdrop('解码单词','线索：'+this.clue);const letters=[...this.answer].map(l=>this.guesses.has(l)?l:'_');T(letters.join(' '),400,179,43,'#f3f6ff');text('剩余机会 '+(8-this.wrong)+' / 8',300,244,22,this.wrong>5?'#ffc1a2':'#a5eddd');for(let i=0;i<26;i++){const l=String.fromCharCode(65+i),x=60+(i%13)*54,y=310+Math.floor(i/13)*74;tile(x,y,47,61,l,this.guesses.has(l)?'#27374b':'#2e5679');}}
 }),
 minesweeper:()=>({
  init(){this.size=9;this.mines=10;this.first=true;this.flags=false;this.open=Array(81).fill(false);this.mark=Array(81).fill(false);this.b=Array(81).fill(false);this.start=0;notify('点击揭开方块。按空格在揭开/旗帜模式之间切换。');},
  near(i){const x=i%9,y=Math.floor(i/9),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&xx<9&&yy>=0&&yy<9)out.push(yy*9+xx);}return out;},
  setup(safe){let choices=shuffle(Array.from({length:81},(_,i)=>i).filter(i=>i!==safe&&!this.near(safe).includes(i)));choices.slice(0,this.mines).forEach(i=>this.b[i]=true);this.first=false;},
  reveal(i){if(this.open[i]||this.mark[i])return;if(this.first)this.setup(i);if(this.b[i]){this.open[i]=true;finish('探测失败 · 引爆了地雷');return;}let stack=[i];while(stack.length){let p=stack.pop();if(this.open[p]||this.mark[p])continue;this.open[p]=true;const n=this.near(p).filter(k=>this.b[k]).length;if(n===0)stack.push(...this.near(p).filter(k=>!this.open[k]));}const count=this.open.filter(Boolean).length;points(count*13);level('SAFE '+count+' / 71');if(count===71)finish('雷区完全清除！');},
  click(x,y){if(hit(x,y,620,125,150,67)){this.flags=!this.flags;notify(this.flags?'旗帜模式：点击标记地雷':'探测模式：点击揭开安全格');return;}const sx=98,sy=80,g=7,size=39;if(!hit(x,y,sx,sy,9*(size+g),9*(size+g)))return;const cx=Math.floor((x-sx)/(size+g)),cy=Math.floor((y-sy)/(size+g));if(cx>=9||cy>=9)return;const i=cy*9+cx;if(this.flags&&!this.open[i])this.mark[i]=!this.mark[i];else this.reveal(i);},
  key(k){if(k==='Space'){this.flags=!this.flags;notify(this.flags?'旗帜模式':'探测模式');}},
  update(){},
  draw(){backdrop('深空扫雷','第一个点击总是安全的。绿色区域表示已揭开。');const sx=98,sy=80,g=7,size=39,colors=['#9fc6e8','#b1e4fc','#95cbb4','#eec69e','#e992aa','#d4b3ff','#fedac7','#a7e2db'];for(let i=0;i<81;i++){const x=sx+i%9*(size+g),y=sy+Math.floor(i/9)*(size+g),open=this.open[i],n=this.near(i).filter(k=>this.b[k]).length;tile(x,y,size,size,open?(this.b[i]?'✹':n||''):this.mark[i]?'⚑':'',open?this.b[i]?'#b64b65':'#2c665d':'#284363');if(open&&n&&!this.b[i])T(n,x+size/2,y+size/2,18,colors[n-1]||'#f9c1c1');}tile(620,125,150,67,this.flags?'⚑ 旗帜':'▣ 探测',this.flags?'#316f69':'#294669',this.flags);text('剩余旗帜 '+(this.mines-this.mark.filter(Boolean).length),620,250,17,'#b9e5eb');text('空格切换模式',620,288,14,'#a6cee7');}
 }),
 'number-memory':()=>({
  init(){this.round=0;this.total=0;this.newRound();},
  newRound(){this.answer=String(Math.floor(rand(10**Math.min(8,this.round+2),10**Math.min(9,this.round+3))));this.options=shuffle([this.answer,...Array.from({length:3},()=>{const a=this.answer.split('');let pos=Math.floor(rand(0,a.length));a[pos]=String((+a[pos]+Math.ceil(rand(1,8)))%10);return a.join('');})]);this.delay=Math.max(1.2,3.1-this.round*.2);this.phase='show';level('LEVEL '+(this.round+1)+'/10');notify('集中注意力，记住屏幕中央的数字。');},
  answerAt(i){if(this.phase!=='choose')return;if(this.options[i]===this.answer){this.total+=150+this.round*30;points(this.total);tone(770);this.round++;if(this.round>=10){finish('十轮数字记忆全部完成！');return;}this.newRound();}else finish('记忆偏差 · 正确答案 '+this.answer);},
  key(k){if(this.phase==='choose'&&/^Digit[1-4]$/.test(k))this.answerAt(Number(k.slice(-1))-1);},
  click(x,y){if(this.phase!=='choose')return;for(let i=0;i<4;i++)if(hit(x,y,139+i%2*268,249+Math.floor(i/2)*101,247,78))this.answerAt(i);},
  update(dt){if(this.phase==='show'){this.delay-=dt;if(this.delay<=0)this.phase='choose';}},
  draw(){backdrop('数字闪忆',this.phase==='show'?'正在记忆 · '+Math.max(0,this.delay).toFixed(1)+'s':'选出刚才出现过的完整数字串');T(this.phase==='show'?this.answer:'••••••',400,178,57,'#b2ffe6');if(this.phase==='choose')for(let i=0;i<4;i++)tile(139+i%2*268,249+Math.floor(i/2)*101,247,78,(i+1)+' · '+this.options[i],'#2b4d71');}
 }),
 puzzle:sliding(3),'sliding-puzzle':sliding(4),
 'spot-difference':()=>({
  init(){this.stage=0;this.total=0;this.generate();},
  generate(){this.found=new Set();this.objects=Array.from({length:20},(_,i)=>({type:i%5,x:25+(i%5)*61+rand(-10,10),y:23+Math.floor(i/5)*86+rand(-12,12),r:10+((i*3)%9),c:['#83e8dc','#fdcb8b','#a9b2fc','#f6a6c4','#9bdcf1'][i%5]}));this.diffs=shuffle(Array.from({length:20},(_,i)=>i)).slice(0,5);level('SCENE '+(this.stage+1)+'/3');notify('左右两幅画有 5 处不同，点击物体附近即可标记。');},
  click(x,y){const side=x>400?1:0,sx=side?412:24,sy=113;let localX=x-sx,localY=y-sy;if(!hit(x,y,sx,sy,364,305))return;let best=-1,dist=999;for(const i of this.diffs){const o=this.objects[i],d=Math.hypot(localX-o.x,localY-o.y);if(d<dist){best=i;dist=d;}}if(dist>26||this.found.has(best)){notify('继续寻找不同的细节');return;}this.found.add(best);this.total+=110;points(this.total);tone(790);if(this.found.size===5){if(this.stage===2){finish('三幅星图全部勘误！');return;}this.stage++;this.generate();}},
  update(){},
  scene(side){const sx=side?412:24,sy=113;R(sx,sy,364,305,'#223d64',13);for(let i=0;i<this.objects.length;i++){const o=this.objects[i],changed=side&&this.diffs.includes(i);const x=sx+o.x,y=sy+o.y;ctx.save();ctx.translate(x,y);ctx.rotate((o.type*.33)+(changed?.5:0));ctx.fillStyle=changed?'#f8ef84':o.c;ctx.strokeStyle='#e3faffaa';ctx.lineWidth=2;if(o.type===0){ctx.beginPath();ctx.arc(0,0,o.r,0,7);ctx.fill();}else if(o.type===1){ctx.fillRect(-o.r,-o.r,o.r*2,o.r*2);}else{ctx.beginPath();ctx.moveTo(0,-o.r);ctx.lineTo(o.r,o.r);ctx.lineTo(-o.r,o.r);ctx.closePath();ctx.fill();}ctx.restore();if(this.found.has(i)){ctx.strokeStyle='#7fffca';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,24,0,7);ctx.stroke();}}if(!side)text('ORIGINAL',sx+12,sy+286,13,'#e2f5ff');else text('ALTERED',sx+12,sy+286,13,'#e2f5ff');},
  draw(){backdrop('星图找不同','已找到 '+this.found.size+' / 5 处 · 可点击左图或右图');this.scene(0);this.scene(1);text('颜色 · 旋转 · 形状，仔细比对',258,466,17,'#bbdeef');}
 }),
 sudoku:()=>({
  init(){const seed=Array.from({length:9},(_,y)=>Array.from({length:9},(_,x)=>(y*3+Math.floor(y/3)+x)%9+1));const nums=shuffle(Array.from({length:9},(_,i)=>i+1));const rp=shuffle([0,1,2]),cp=shuffle([0,1,2]);const rows=rp.flatMap(q=>shuffle([q*3,q*3+1,q*3+2]));const cols=cp.flatMap(q=>shuffle([q*3,q*3+1,q*3+2]));this.solution=rows.map(y=>cols.map(x=>nums[seed[y][x]-1]));this.board=this.solution.map(a=>a.slice());this.lock=Array.from({length:9},()=>Array(9).fill(true));const spots=shuffle(Array.from({length:81},(_,i)=>i));for(const i of spots.slice(0,41)){const y=Math.floor(i/9),x=i%9;this.board[y][x]=0;this.lock[y][x]=false;}this.selected={x:0,y:0};this.mistakes=0;this.elapsed=0;notify('已生成合法数独，请填满全部空格。');level('EMPTY 41');},
  set(n){const {x,y}=this.selected;if(this.lock[y][x]){notify('这是题目给出的数字，不能修改');return;}this.board[y][x]=n;if(n&&n!==this.solution[y][x]){this.mistakes++;tone(150);notify('数字不符合唯一解，再试一次');}else tone(620);const empty=this.board.flat().filter(v=>!v).length;level('EMPTY '+empty);points(Math.max(0,(41-empty)*60-this.mistakes*12));if(this.board.every((row,y)=>row.every((v,x)=>v===this.solution[y][x])))finish('全部空格正确 · 数独通关！');},
  key(k){if(/^Digit[1-9]$/.test(k))this.set(+k.slice(-1));if(k==='Backspace'||k==='Delete')this.set(0);const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(d[k]){this.selected.x=clamp(this.selected.x+d[k][0],0,8);this.selected.y=clamp(this.selected.y+d[k][1],0,8);}},
  click(x,y){const sx=158,sy=71,size=42;if(hit(x,y,sx,sy,378,378)){this.selected={x:Math.floor((x-sx)/size),y:Math.floor((y-sy)/size)};return;}for(let i=0;i<9;i++)if(hit(x,y,574+(i%3)*61,171+Math.floor(i/3)*61,55,52))this.set(i+1);if(hit(x,y,572,376,182,49))this.set(0);},
  update(dt){this.elapsed+=dt;},
  draw(){backdrop('经典数独 · 逻辑九宫','错误尝试 '+this.mistakes+' · 用数字键盘填入 1–9');const sx=158,sy=71,size=42;for(let y=0;y<9;y++)for(let x=0;x<9;x++){const selected=this.selected.x===x&&this.selected.y===y,v=this.board[y][x],px=sx+x*size,py=sy+y*size;R(px,py,size-1,size-1,selected?'#355b86':this.lock[y][x]?'#243b59':'#1a324e',1);if(v)T(v,px+size/2,py+size/2,22,this.lock[y][x]?'#c3def4':v===this.solution[y][x]?'#90efd1':'#fd92a5');}ctx.strokeStyle='#8cc9e7';ctx.lineWidth=3;for(let i=0;i<=3;i++){ctx.beginPath();ctx.moveTo(sx+i*126,sy);ctx.lineTo(sx+i*126,sy+378);ctx.moveTo(sx,sy+i*126);ctx.lineTo(sx+378,sy+i*126);ctx.stroke();}ctx.lineWidth=1;for(let i=0;i<9;i++)tile(574+(i%3)*61,171+Math.floor(i/3)*61,55,52,i+1,'#2c4c6e');tile(572,376,182,49,'清除','\x232a3f62');text('TIMER '+Math.floor(this.elapsed)+'s',568,120,16,'#a7cee8');}
 })
 };
};
})();