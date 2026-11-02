/* ORBIT ARCADE / Strategy Pack: full decisions, AI opponents and reward loops. */
(()=>{'use strict';
window.ORBIT_STRATEGY_META={
 checkers:{name:'星盘跳棋',sub:'国际跳棋式棋盘 · 强制吃子 · 对战电脑',instruction:'你执红棋，点击棋子和目标位置。斜向前移动、跨越敌方棋子吃子；吃子可连跳，抵达底线升王。',hint:'有吃子机会时必须优先吃子，王可以双向移动。',accent:'#ffbdad'},
 cooking:{name:'星际料理实验室',sub:'选择食材 · 组合菜谱 · 限时交付',instruction:'阅读订单后选出三种所需食材，按“制作”提交。正确制作加分，不符合配方扣时间。',hint:'订单中显示全部三个食材，先选齐再制作。',accent:'#ffca97'},
 farm:{name:'空间农场经营',sub:'种植浇水 · 收获出售 · 资源循环',instruction:'选择工具，再点击土地：种植需要种子，浇水使作物成熟，成熟后用收获工具采集，再出售换取资金。',hint:'先种满一排，再批量浇水与收获。达到 550 资金通关。',accent:'#a6f5b9'},
 gomoku:{name:'五子星阵',sub:'15×15 · 单人对弈智能对手 · 连五获胜',instruction:'你执青色棋子，点击棋盘交点落子，连成五子即获胜；电脑会阻挡即将成型的棋线。',hint:'用开放三连与双向进攻形成难以阻挡的威胁。',accent:'#96e9e5'},
 'tic-tac-toe':{name:'三连星棋',sub:'九宫棋盘 · 三种难度 · 连续对局',instruction:'你执 X，点击空格落子。电脑会尝试占领三子直线；按空格切换普通/专家难度。',hint:'先占据中心或角落，再制造双线威胁。',accent:'#b6b1ff'},
 'word-chain':{name:'成语星链',sub:'真实首尾接龙 · 12 轮挑战 · 三选一',instruction:'选出与当前成语最后一个字相接的四字成语；不能重复使用已选词。错选会扣除生命。',hint:'检查上一个成语的最后一个字，以及新成语的第一个字。',accent:'#f3d099'}
};
window.ORBIT_STRATEGY=api=>{
 const {ctx,fill,text,points,level,finish,notify,tone,clamp,rand}=api;
 const R=(x,y,w,h,c,r=9)=>fill(x,y,w,h,c,r);
 const T=(s,x,y,z=20,c='#e8f9ff')=>text(String(s),x,y,z,c,'center');
 const hit=(x,y,l,t,w,h)=>x>=l&&x<l+w&&y>=t&&y<t+h;
 const circ=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const k=Math.floor(rand(0,i+1));[a[i],a[k]]=[a[k],a[i]]}return a;};
 const drawBtn=(s,x,y,w,h,c='#2d5071')=>{R(x,y,w,h,c,12);T(s,x+w/2,y+h/2,18);};
 const bg=(name,detail)=>{fill(0,0,800,500,'#101c34');for(let i=0;i<48;i++)circ((i*121+43)%800,(i*81+51)%500,i%3?1:1.9,'#6c98ca44');text(name,31,34,22,'#e9f7ff');text(detail,32,67,14,'#aecfe6');};
 return {
 checkers:()=>({
  init(){this.b=Array.from({length:8},()=>Array(8).fill(null));for(let y=0;y<3;y++)for(let x=0;x<8;x++)if((x+y)%2===1)this.b[y][x]={c:'b',k:false};for(let y=5;y<8;y++)for(let x=0;x<8;x++)if((x+y)%2===1)this.b[y][x]={c:'r',k:false};this.sel=null;this.moves=[];this.chain=null;this.turn='r';this.ply=0;notify('红方先走。有机会吃子时必须吃子。');level('RED TO MOVE');},
  allowed(c,chain=null){const all=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){const p=this.b[y][x];if(!p||p.c!==c||(chain&&(x!==chain.x||y!==chain.y)))continue;const dirs=p.k?[-1,1]:[c==='r'?-1:1],steps=[];for(const dy of dirs)for(const dx of [-1,1]){const xx=x+dx,yy=y+dy,tx=x+dx*2,ty=y+dy*2;if(xx<0||xx>7||yy<0||yy>7)continue;if(this.b[yy][xx]){if(this.b[yy][xx].c!==c&&tx>=0&&tx<8&&ty>=0&&ty<8&&!this.b[ty][tx])steps.push({x,y,tx,ty,jump:{x:xx,y:yy}});}else if(!chain)steps.push({x,y,tx:xx,ty:yy,jump:null});}all.push(...steps);}const jumps=all.filter(m=>m.jump);return jumps.length?jumps:chain?[]:all;},
  make(m){const p=this.b[m.y][m.x];this.b[m.y][m.x]=null;this.b[m.ty][m.tx]=p;if(m.jump)this.b[m.jump.y][m.jump.x]=null;if((p.c==='r'&&m.ty===0)||(p.c==='b'&&m.ty===7))p.k=true;this.ply++;tone(570);const next=m.jump?this.allowed(p.c,{x:m.tx,y:m.ty}):[];if(m.jump&&next.length){this.chain={x:m.tx,y:m.ty};this.sel={x:m.tx,y:m.ty};this.moves=next;notify('连续吃子！选择下一格。');return true;}this.chain=null;this.sel=null;this.moves=[];this.turn=p.c==='r'?'b':'r';const available=this.allowed(this.turn);if(!available.length){finish(p.c==='r'?'红方胜利！':'电脑胜利');return false;}level(this.turn==='r'?'RED TO MOVE':'BLACK TO MOVE');points(this.b.flat().filter(p=>p?.c==='r').length*50+(12-this.b.flat().filter(p=>p?.c==='b').length)*100);return true;},
  computer(){let loops=0;while(this.turn==='b'&&loops++<10){const opts=this.allowed('b',this.chain);if(!opts.length){this.turn='r';break;}opts.sort((a,b)=>(b.jump?7:0)-(a.jump?7:0)+rand(-.4,.4));if(!this.make(opts[0]))break;}notify('轮到红方，请选择棋子。');},
  click(px,py){if(this.turn!=='r')return;const x=Math.floor((px-190)/52),y=Math.floor((py-62)/52);if(x<0||y<0||x>7||y>7)return;let opts=this.allowed('r',this.chain);if(this.sel){const move=opts.find(m=>m.x===this.sel.x&&m.y===this.sel.y&&m.tx===x&&m.ty===y);if(move){if(this.make(move)&&this.turn==='b')this.computer();return;}}if(this.b[y][x]?.c==='r'){this.sel={x,y};this.moves=opts.filter(m=>m.x===x&&m.y===y);notify('可行动位置 '+this.moves.length+' 个');}else{this.sel=null;this.moves=[];}},
  update(){},
  draw(){bg('星盘跳棋','你执红棋 · 强制吃子 · 剩余红 '+this.b.flat().filter(p=>p?.c==='r').length+' / 黑 '+this.b.flat().filter(p=>p?.c==='b').length);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const xx=190+x*52,yy=62+y*52,sel=this.sel?.x===x&&this.sel?.y===y,hint=this.moves.some(m=>m.tx===x&&m.ty===y);R(xx,yy,52,52,sel?'#7d8e63':(x+y)%2?'#3a5373':'#b7c9d6',1);if(hint)circ(xx+26,yy+26,8,'#9bffe0');const p=this.b[y][x];if(p){circ(xx+26,yy+26,19,p.c==='r'?'#f28c8c':'#233a60');circ(xx+26,yy+26,12,p.c==='r'?'#e55d65':'#121f33');if(p.k)T('♛',xx+26,yy+26,20,'#fff0bf');}}text('点击棋子，再点发光位置',290,485,16,'#bde8ed');}
 }),
 cooking:()=>({
  foods:[['太空汉堡',['🥩','🥬','🍞']],['银河披萨',['🧀','🍅','🍞']],['新星寿司',['🍚','🐟','🥒']],['星港沙拉',['🥬','🍅','🥒']],['星际蛋包饭',['🍚','🥚','🧀']],['船员热汤',['🥔','🥩','🥚']],['云端三明治',['🍞','🥚','🥬']]],
  ingredients:['🥩','🥬','🍞','🧀','🍅','🍚','🐟','🥒','🥚','🥔'],
  init(){this.stage=0;this.total=0;this.time=90;this.selected=[];this.combo=0;this.newOrder();notify('选择订单中的三种食材，再点击制作。');},
  newOrder(){const [name,items]=this.foods[this.stage%this.foods.length];this.order={name,items};this.selected=[];level('ORDER '+(this.stage+1)+'/8');},
  click(x,y){for(let i=0;i<this.ingredients.length;i++){const col=i%5,row=Math.floor(i/5),xx=99+col*124,yy=256+row*84;if(hit(x,y,xx,yy,108,72)){const item=this.ingredients[i],index=this.selected.indexOf(item);if(index>=0)this.selected.splice(index,1);else if(this.selected.length<3)this.selected.push(item);tone(450);return;}}if(hit(x,y,276,438,248,48)){if(this.selected.length!==3){notify('需要恰好选出三种食材');return;}const equal=this.selected.every(s=>this.order.items.includes(s));if(equal){this.combo++;this.total+=150+this.combo*25;points(this.total);tone(840);this.stage++;if(this.stage>=8){finish('八份订单全部成功交付！');return;}this.newOrder();notify('订单交付成功，连击 '+this.combo);}else{this.combo=0;this.time-=7;tone(160);notify('配方不匹配，-7 秒。检查订单食材。');}}},
  update(dt){this.time-=dt;if(this.time<=0)finish('餐厅打烊 · 完成 '+this.stage+' 份订单');},
  draw(){bg('星际料理实验室','完成 '+this.stage+' / 8 份订单 · 剩余 '+Math.ceil(this.time)+' 秒');R(157,95,486,125,'#263d60',19);T(this.order.name,400,135,31,'#ffe2a8');T('配方：'+this.order.items.join(' + '),400,191,22,'#a9eac9');for(let i=0;i<this.ingredients.length;i++){const x=99+i%5*124,y=256+Math.floor(i/5)*84,item=this.ingredients[i];drawBtn(item,x,y,108,72,this.selected.includes(item)?'#3e796e':'#2c4a70');}drawBtn('制作 / 交付',276,438,248,48,'#3a7773');}
 }),
 farm:()=>({
  init(){this.plots=Array.from({length:24},()=>({state:0,age:0,water:false}));this.tool='seed';this.seeds=12;this.harvest=0;this.cash=100;this.time=0;this.total=0;this.actions=0;level('CASH 100 / 550');notify('工具：播种（种子）→ 浇水 → 收获 → 出售。');},
  click(x,y){const tools=['seed','water','harvest','sell','buy'];for(let i=0;i<5;i++)if(hit(x,y,69+i*142,418,126,58)){this.tool=tools[i];if(this.tool==='sell'){if(this.harvest){this.cash+=this.harvest*55;this.harvest=0;this.updateScore();tone(820);}else notify('仓库没有作物可以出售');}if(this.tool==='buy'){if(this.cash>=45){this.cash-=45;this.seeds+=6;this.updateScore();tone(490);}else notify('资金不足以购买种子');}return;}const sx=114,sy=93,w=91,h=50,gx=9,gy=7;const cx=Math.floor((x-sx)/(w+gx)),cy=Math.floor((y-sy)/(h+gy)),idx=cy*6+cx;if(cx<0||cy<0||cx>=6||cy>=4||!hit(x,y,sx+cx*(w+gx),sy+cy*(h+gy),w,h))return;const p=this.plots[idx];if(this.tool==='seed'){if(p.state!==0){notify('这块地已有作物');return;}if(this.seeds<=0){notify('种子不足，需要购买');return;}this.seeds--;p.state=1;p.age=0;p.water=false;tone(460);}else if(this.tool==='water'){if(p.state!==1){notify('只有刚播种的土地需要浇水');return;}p.water=true;tone(500);}else if(this.tool==='harvest'){if(p.state!==2){notify('还没成熟，先浇水等待生长');return;}p.state=0;p.water=false;this.harvest++;this.total+=35;points(this.total);tone(670);}this.actions++;this.updateScore();},
  updateScore(){level('CASH '+this.cash+' / 550');if(this.cash>=550)finish('空间农场经营成功 · 资金 '+this.cash);},
  update(dt){this.time+=dt;for(const p of this.plots)if(p.state===1&&p.water){p.age+=dt;if(p.age>=4.5){p.state=2;tone(540);}}},
  draw(){bg('空间农场经营','资金 '+this.cash+' / 550 · 种子 '+this.seeds+' · 仓库 '+this.harvest+' · '+Math.floor(this.time)+' 秒');const glyph=['·','🌱','🌽'];for(let i=0;i<24;i++){const x=114+i%6*100,y=93+Math.floor(i/6)*57,p=this.plots[i];R(x,y,91,50,p.state===2?'#466b45':p.state===1?'#514b3b':'#273f4b',8);T(glyph[p.state],x+45,y+25,25);}const tools=[['🌱 播种','seed'],['💧 浇水','water'],['🌽 收获','harvest'],['💰 出售','sell'],['🧺 买种','buy']];tools.forEach(([label,id],i)=>drawBtn(label,69+i*142,418,126,58,this.tool===id?'#3f7c70':'#2a4866'));}
 }),
 gomoku:()=>({
  init(){this.board=Array.from({length:15},()=>Array(15).fill(0));this.last=null;this.moves=0;this.turn='you';level('YOU / FIRST');notify('五子连线获胜。电脑会检查你的四连和三连。');},
  count(x,y,dx,dy,p){let n=0;while(x>=0&&x<15&&y>=0&&y<15&&this.board[y][x]===p){n++;x+=dx;y+=dy;}return n;},
  win(x,y,p){return [[1,0],[0,1],[1,1],[1,-1]].some(([dx,dy])=>this.count(x,y,dx,dy,p)+this.count(x-dx,y-dy,-dx,-dy,p)-1>=5);},
  score(x,y,p){let total=0;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){const a=this.count(x+dx,y+dy,dx,dy,p),b=this.count(x-dx,y-dy,-dx,-dy,p),v=a+b;total+=v===4?100000:v===3?9000:v===2?700:v===1?38:8;}return total;},
  ai(){let best=-1e9,move=null;for(let y=0;y<15;y++)for(let x=0;x<15;x++){if(this.board[y][x])continue;const attack=this.score(x,y,2),defend=this.score(x,y,1),center=15-Math.abs(7-x)-Math.abs(7-y),v=attack*1.05+defend*.95+center+rand(0,10);if(v>best){best=v;move={x,y};}}if(!move){finish('棋盘已满 · 平局');return;}this.board[move.y][move.x]=2;this.last=move;this.moves++;if(this.win(move.x,move.y,2)){finish('电脑五子连线 · 请再挑战');return;}this.turn='you';level('YOU / TURN');},
  click(px,py){if(this.turn!=='you'||!hit(px,py,190,78,421,421))return;const x=Math.round((px-204)/28),y=Math.round((py-91)/28);if(x<0||x>14||y<0||y>14||this.board[y][x])return;this.board[y][x]=1;this.moves++;this.last={x,y};tone(480);if(this.win(x,y,1)){points(3000);finish('你完成了五子连珠！');return;}points(this.moves*25);this.turn='computer';this.ai();},
  update(){},
  draw(){bg('五子星阵','青色是你 · 粉色为电脑 · 双方轮流落子');R(176,64,450,450,'#294466',12);for(let i=0;i<15;i++){ctx.strokeStyle='#779bb3';ctx.beginPath();ctx.moveTo(204+i*28,91);ctx.lineTo(204+i*28,483);ctx.moveTo(204,91+i*28);ctx.lineTo(596,91+i*28);ctx.stroke();}for(let y=0;y<15;y++)for(let x=0;x<15;x++){const p=this.board[y][x];if(p){const xx=204+x*28,yy=91+y*28;circ(xx,yy,11,p===1?'#9cf2d9':'#f3b3ce');if(this.last?.x===x&&this.last?.y===y)circ(xx,yy,3,'#263d54');}}}
 }),
 'tic-tac-toe':()=>({
  init(){this.b=Array(9).fill(0);this.hard=true;this.wins=0;this.losses=0;this.draws=0;this.newGame();notify('点击任意空格落子。按空格切换 AI 难度。');},
  newGame(){this.b.fill(0);this.turn=1;level(this.hard?'EXPERT AI':'CASUAL AI');},
  victory(b){for(const [a,c,d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(Boolean)?3:0;},
  minimax(b,p){const w=this.victory(b);if(w)return w===2?10:w===1?-10:0;let best=p===2?-11:11;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const v=this.minimax(b,p===1?2:1);b[i]=0;best=p===2?Math.max(best,v):Math.min(best,v);}return best;},
  click(x,y){const l=232,t=92,s=117,g=9;if(!hit(x,y,l,t,3*(s+g),3*(s+g)))return;const cx=Math.floor((x-l)/(s+g)),cy=Math.floor((y-t)/(s+g)),i=cy*3+cx;if(cx>=3||cy>=3||this.b[i])return;this.b[i]=1;tone(450);if(this.check())return;const opts=this.b.map((v,j)=>v?-1:j).filter(j=>j>=0);let target=opts[Math.floor(rand(0,opts.length))];if(this.hard){let best=-100;for(const j of opts){this.b[j]=2;let v=this.minimax(this.b,1);this.b[j]=0;if(v>best){best=v;target=j;}}}this.b[target]=2;this.check();},
  check(){const w=this.victory(this.b);if(!w)return false;if(w===1)this.wins++;else if(w===2)this.losses++;else this.draws++;points(this.wins*100);this.lastResult=w===1?'你赢了！':w===2?'电脑胜利':'平局';notify(this.lastResult+' 点击棋盘开始下一局。');this.b.fill(0);level('W '+this.wins+' / L '+this.losses+' / D '+this.draws);return true;},
  key(k){if(k==='Space'){this.hard=!this.hard;this.newGame();notify('切换至 '+(this.hard?'专家':'休闲')+' 难度');}},
  update(){},
  draw(){bg('三连星棋','本次胜 '+this.wins+' · 负 '+this.losses+' · 平 '+this.draws+' · 空格切换 AI');for(let i=0;i<9;i++){const x=232+i%3*126,y=92+Math.floor(i/3)*126;R(x,y,117,117,'#253e61',13);if(this.b[i])T(this.b[i]===1?'X':'O',x+59,y+59,58,this.b[i]===1?'#9ef5d6':'#e6aed9');}text('目标：横向 / 纵向 / 斜向三连',270,474,17,'#b6daec');}
 }),
 'word-chain':()=>({
  chain:['一心一意','意气风发','发奋图强','强人所难','难以置信','信口开河','河清海晏','晏然自若','若无其事','事半功倍','倍道而进','进退两难','难能可贵','贵人多忘','忘恩负义','义无反顾','顾名思义','义薄云天','天长地久','久别重逢','逢凶化吉','吉人天相'],
  distract:['天南地北','四海为家','海阔天空','无与伦比','美轮美奂','风和日丽','开门见山','实事求是','风驰电掣','生龙活虎','万众一心','心花怒放','春暖花开','一帆风顺','前程似锦','山清水秀'],
  init(){this.round=0;this.total=0;this.lives=3;this.used=new Set([this.chain[0]]);this.options=[];this.build();notify('选择下一句：首字必须等于上一句末字。');},
  build(){this.current=this.chain[this.round];const correct=this.chain[this.round+1];const wrong=shuffle(this.distract.filter(s=>s[0]!==this.current.at(-1))).slice(0,2);this.options=shuffle([correct,...wrong]);level('LINK '+(this.round+1)+'/12');},
  answer(i){const s=this.options[i];if(s===this.chain[this.round+1]){this.round++;this.used.add(s);this.total+=120+this.round*10;points(this.total);tone(720);notify('连接成功！正确字为「'+s[0]+'」');if(this.round>=12){finish('12 轮成语星链全部完成！');return;}this.build();}else{this.lives--;tone(160);notify('首字错误：应以「'+this.current.at(-1)+'」开头。');if(this.lives<=0)finish('星链中断 · 已完成 '+this.round+' 轮');}},
  click(x,y){for(let i=0;i<3;i++)if(hit(x,y,190,252+i*68,420,57))this.answer(i);},
  key(k){if(/^Digit[1-3]$/.test(k))this.answer(+k.slice(-1)-1);},
  update(){},
  draw(){bg('成语星链','已连 '+this.round+' / 12 · 生命 '+this.lives+' · 不接受重复接龙');R(168,98,464,126,'#294464',20);T(this.current,400,151,43,'#fce7aa');T('用「'+this.current.at(-1)+'」接下一句',400,210,17,'#a1e6db');for(let i=0;i<3;i++)drawBtn((i+1)+' · '+this.options[i],190,252+i*68,420,57,'#2d5071');}
 })
 };
};
})();