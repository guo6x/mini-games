/* Creative arcade puzzles, maps and quizzes; no third-party assets or services. */
(()=>{
'use strict';
window.ORBIT_MORE_META={
 quiz:{name:'脑力快问',sub:'12 道趣味问题 · 连续答对 · 15 秒限时',instruction:'每道题在倒计时内选择一个答案，可点击选项或按数字 1–4。答对有连击加成，每题结束显示正确答案。',hint:'脑力与速度并重，但稳定的正确率更重要。',accent:'#ffc67e'},
 geography:{name:'世界定位挑战',sub:'不看名称标记 · 在地图上定位城市',instruction:'根据城市名称和所在地区，在简化世界地图上点击它的大致位置。越接近正确位置分数越高。12 座城市后结算。',hint:'先确认所属大洲，再估算东西和南北位置。',accent:'#8fdfd6'},
 'word-search':{name:'太空字母迷阵',sub:'寻词挑战 · 横竖斜方向 · 找出全部词语',instruction:'在字母矩阵中点击一个起点，再点击终点。沿直线选中的字母必须是右边列出的完整单词，可正向或反向。',hint:'先找较长的单词，再检查斜线与反向排列。',accent:'#b5d2ff'},
 'jigsaw-puzzle':{name:'星景拼图工坊',sub:'原创画面 · 逐块还原 · 三幅场景',instruction:'从左侧选择一块拼图，再点击右侧相应位置。摆对才会固定；完成一幅图后解锁下一幅星景。',hint:'优先寻找太阳、山峰和建筑边缘的连续图案。',accent:'#bbf5d1'}
};
window.ORBIT_MORE=api=>{
 const {ctx,fill,text,points,level,finish,notify,tone,clamp,rand}=api;
 const circ=(x,y,r,color)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();};
 return {
 quiz:()=>({
  pool:[
   ['太阳系体积最大的行星是哪一个？',['金星','木星','地球','火星'],1,'木星是太阳系体积最大的行星。'],
   ['飞机机翼产生升力的关键是什么？',['空气流动与压力分布','发动机颜色','燃油箱大小','机身长度'],0,'机翼周围的流动与压力分布产生气动力。'],
   ['下面哪种材料通常能被磁铁吸引？',['铜','铝','铁','玻璃'],2,'铁是常见的铁磁性材料。'],
   ['光在真空中的速度约为多少？',['每秒300公里','每秒3000公里','每秒3万公里','每秒30万公里'],3,'真空光速约为每秒30万公里。'],
   ['水在标准大气压下的沸点约是？',['0℃','100℃','50℃','150℃'],1,'标准大气压下水在约100℃沸腾。'],
   ['地球绕太阳公转一周约需多久？',['24小时','7天','365天','10年'],2,'一年约365.24天。'],
   ['编程中 HTTP 404 通常意味着什么？',['文件或资源未找到','服务器内存不足','网络速度过慢','电量过低'],0,'404 表示请求的目标资源未找到。'],
   ['最先登上月球的人类宇航员是谁？',['加加林','阿姆斯特朗','特斯拉','牛顿'],1,'阿姆斯特朗于1969年登月。'],
   ['DNA 常见的空间结构是什么？',['正方体','环形立方体','双螺旋','平面直线'],2,'DNA的经典模型是双螺旋。'],
   ['音调的高低主要与什么有关？',['声波频率','物体颜色','空气气味','光线亮度'],0,'频率越高通常感知到的音调越高。'],
   ['二进制数字 1010 等于十进制多少？',['8','9','10','12'],2,'1010₂ = 8 + 2 = 10。'],
   ['哪颗行星拥有显著的环系？',['水星','地球','火星','土星'],3,'土星的环系最为明显。']
  ],
  init(){this.order=[...this.pool].sort(()=>Math.random()-.5);this.i=0;this.time=15;this.total=0;this.combo=0;this.reveal=null;this.wait=0;this.correct=0;},
  choose(n){if(this.reveal!==null||n<0||n>3)return;const row=this.order[this.i],ok=n===row[2];this.correct+=Number(ok);this.combo=ok?this.combo+1:0;this.total+=ok?100+Math.min(8,this.combo)*18:0;points(this.total);this.reveal=n;this.wait=1.25;notify((ok?'答对！':'答错：')+row[3]);tone(ok?810:170);},
  key(c){const n={Digit1:0,Digit2:1,Digit3:2,Digit4:3}[c];if(n!==undefined)this.choose(n);},
  click(x,y){for(let i=0;i<4;i++){const px=90+(i%2)*315,py=240+Math.floor(i/2)*85;if(x>=px&&x<px+300&&y>=py&&y<py+73){this.choose(i);return;}}},
  update(dt){if(this.reveal!==null){this.wait-=dt;if(this.wait<=0){this.i++;if(this.i>=this.order.length){finish('答对 '+this.correct+' / 12 题，挑战结束！');return;}this.reveal=null;this.time=15;level('Q '+(this.i+1)+'/12');}return;}this.time-=dt;if(this.time<=0){this.choose(-2);this.reveal=-1;this.wait=1;notify('时间到！正确答案：'+this.order[this.i][1][this.order[this.i][2]]);}},
  draw(){fill(0,0,800,500,'#171629');const row=this.order[this.i];if(!row)return;fill(70,43,660,155,'#293452',22);text('KNOWLEDGE / '+String(this.i+1).padStart(2,'0')+' / 12',96,71,13,'#9fcbe9');const parts=row[0].length>24?[row[0].slice(0,24),row[0].slice(24)]:[row[0]];parts.forEach((v,j)=>text(v,400,121+j*38,parts.length===2?24:30,'#fff','center'));fill(90,215,620,8,'#303d5b',4);fill(90,215,620*clamp(this.time/15,0,1),8,'#c8b4ff',4);for(let i=0;i<4;i++){const x=90+(i%2)*315,y=240+Math.floor(i/2)*85;let bg='#2d3b55';if(this.reveal!==null)bg=i===row[2]?'#2d7e72':this.reveal===i?'#813e5b':bg;fill(x,y,300,73,bg,14);fill(x+13,y+18,35,35,'#556786',9);text(String(i+1),x+31,y+35,17,'#f1f7ff','center');text(row[1][i],x+59,y+36,18,'#edf4ff');}text('正确 '+this.correct+'  ·  连击 '+this.combo,100,460,17,'#aad9ee');text('剩余 '+Math.ceil(this.time)+'s',630,460,19,'#ffdc9c');}
 }),
 geography:()=>({
  cities:[
   ['北京','东亚',116.4,39.9],['东京','东亚',139.7,35.7],['伦敦','西欧',-.12,51.5],['巴黎','西欧',2.35,48.86],
   ['华盛顿','北美洲东部',-77,38.9],['里约热内卢','南美洲东部',-43.2,-22.9],['开罗','非洲北部',31.2,30],
   ['悉尼','澳大利亚东部',151.2,-33.9],['新德里','南亚',77.2,28.6],['开普敦','非洲南端',18.4,-33.9],
   ['莫斯科','东欧',37.6,55.75],['布宜诺斯艾利斯','南美洲南部',-58.4,-34.6]
  ],
  continents:[
   [[-168,70],[-128,68],[-100,58],[-83,49],[-60,52],[-78,16],[-104,11],[-116,28],[-137,51]],
   [[-81,14],[-52,10],[-35,-7],[-49,-34],[-71,-56],[-81,-26]],
   [[-15,37],[4,48],[27,61],[73,60],[103,74],[166,62],[179,44],[145,26],[107,-9],[55,9],[34,30],[12,36]],
   [[-17,37],[37,31],[51,11],[35,-34],[13,-35],[-12,0]],
   [[112,-11],[153,-10],[154,-42],[128,-45],[113,-24]]
  ],
  init(){this.index=0;this.total=0;this.guess=null;this.wait=0;this.order=[...this.cities].sort(()=>Math.random()-.5);this.time=115;},
  pos(lon,lat){return{x:75+(lon+180)/360*650,y:69+(82-lat)/164*342};},
  click(x,y){if(this.guess)return;if(x<60||x>745||y<70||y>420)return;const c=this.order[this.index],target=this.pos(c[2],c[3]),distance=Math.hypot(x-target.x,y-target.y),score=Math.max(0,Math.round(150-distance*1.7));this.total+=score;points(this.total);this.guess={x,y,tx:target.x,ty:target.y,distance,score};this.wait=1.35;notify(distance<24?'定位非常精准！ +'+score:'偏差 '+Math.round(distance)+' 像素，得分 +'+score);tone(distance<65?800:250);},
  update(dt){if(this.guess){this.wait-=dt;if(this.wait<=0){this.index++;if(this.index>=this.order.length){finish('世界定位完成，总分 '+this.total);return;}this.guess=null;level('CITY '+(this.index+1)+'/12');}return;}this.time-=dt;if(this.time<=0)finish('时间用尽，地理探索结束');},
  draw(){fill(0,0,800,500,'#0a1f30');fill(54,61,690,365,'#12334a',22);ctx.strokeStyle='#31577555';ctx.lineWidth=1;for(let i=0;i<11;i++){ctx.beginPath();ctx.moveTo(75+i*65,72);ctx.lineTo(75+i*65,408);ctx.stroke();}for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(60,80+i*56);ctx.lineTo(739,80+i*56);ctx.stroke();}this.continents.forEach((poly,i)=>{ctx.beginPath();poly.forEach(([lon,lat],k)=>{const p=this.pos(lon,lat);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fillStyle=['#2d776f','#287268','#39777b','#307966','#2e7a78'][i];ctx.fill();ctx.strokeStyle='#67cbbb33';ctx.stroke();});const c=this.order[this.index];if(c){text('请在地图上找到：'+c[0],60,33,23,'#e6fbff');text('地区提示 / '+c[1],552,34,15,'#b7dfdf');}if(this.guess){const g=this.guess;ctx.strokeStyle='#ffe29a';ctx.setLineDash([7,8]);ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.tx,g.ty);ctx.stroke();ctx.setLineDash([]);circ(g.x,g.y,9,'#ffcb86');circ(g.tx,g.ty,8,'#97f8cc');text('+'+g.score,g.tx,g.ty-23,20,'#ffe49e','center');}text('ROUND '+(this.index+1)+'/12',62,455,16,'#b4dce6');text('剩余 '+Math.ceil(this.time)+'s',632,454,17,'#b4dce6');}
 }),
 'word-search':()=>({
  words:['ROCKET','ORBIT','MOON','EARTH','LASER','SPACE','COMET','SOLAR'],
  init(){this.n=12;this.board=Array.from({length:12},()=>Array(12).fill(''));this.positions=[];this.selected=null;this.found=new Set();this.time=150;this.seed();},
  seed(){const dirs=[[1,0],[0,1],[1,1],[1,-1]];for(const word of this.words){let placed=false;for(let n=0;n<500&&!placed;n++){const [dx,dy]=dirs[Math.floor(rand(0,4))],x=Math.floor(rand(0,12)),y=Math.floor(rand(0,12));const cells=Array.from({length:word.length},(_,i)=>[x+dx*i,y+dy*i]);if(cells.some(([xx,yy],i)=>xx<0||xx>=12||yy<0||yy>=12||(this.board[yy][xx]&&this.board[yy][xx]!==word[i])))continue;cells.forEach(([xx,yy],i)=>this.board[yy][xx]=word[i]);this.positions.push({word,cells});placed=true;}if(!placed)throw Error('Could not place word '+word);}const chars='ABCDEFGHJKLMNPQRSTUVWXYZ';for(let y=0;y<12;y++)for(let x=0;x<12;x++)if(!this.board[y][x])this.board[y][x]=chars[Math.floor(rand(0,chars.length))];},
  click(px,py){const x=Math.floor((px-94)/34),y=Math.floor((py-48)/34);if(x<0||x>=12||y<0||y>=12)return;if(!this.selected){this.selected={x,y};return;}const sx=this.selected.x,sy=this.selected.y;this.selected=null;const dx=x-sx,dy=y-sy,steps=Math.max(Math.abs(dx),Math.abs(dy));if(!(dx===0||dy===0||Math.abs(dx)===Math.abs(dy))||steps===0)return;const vx=Math.sign(dx),vy=Math.sign(dy),cells=Array.from({length:steps+1},(_,i)=>[sx+vx*i,sy+vy*i]);const found=this.positions.find(p=>!this.found.has(p.word)&&(p.cells.length===cells.length)&&[false,true].some(reverse=>p.cells.every((v,i)=>v[0]===cells[reverse?cells.length-1-i:i][0]&&v[1]===cells[reverse?cells.length-1-i:i][1])));if(found){this.found.add(found.word);points(this.found.size*180+Math.floor(this.time));level(this.found.size+' / '+this.words.length);notify('发现 '+found.word+'！');tone(850);if(this.found.size===this.words.length)finish('全部单词找齐！');}else{notify('未找到完整词语，请重试');tone(160);}},
  update(dt){this.time-=dt;if(this.time<=0)finish('寻词时间结束');},
  draw(){fill(0,0,800,500,'#131b31');fill(83,37,428,428,'#20304b',18);for(let y=0;y<12;y++)for(let x=0;x<12;x++){const xx=94+x*34,yy=48+y*34;const chosen=this.selected&&this.selected.x===x&&this.selected.y===y;const has=this.positions.some(p=>this.found.has(p.word)&&p.cells.some(q=>q[0]===x&&q[1]===y));fill(xx+1,yy+1,32,32,chosen?'#a1d4f0':has?'#39786e':'#2a3856',6);text(this.board[y][x],xx+17,yy+17,17,chosen?'#102038':'#ecf8ff','center');}text('DISCOVER',563,70,17,'#8cbdf0');this.words.forEach((w,i)=>{const found=this.found.has(w);fill(555,95+i*44,195,35,found?'#2a6b66':'#263a55',9);text((found?'✓  ':'◇  ')+w,573,113+i*44,17,found?'#affed3':'#cbdaf6');});text('剩余 '+Math.ceil(this.time)+' s',555,479,16,'#b3c8eb');}
 }),
 'jigsaw-puzzle':()=>({
  scenes:['落日山谷','未来城市','月球基地'],
  init(){this.stage=0;this.total=0;this.moves=0;this.build();},
  build(){this.img=document.createElement('canvas');this.img.width=399;this.img.height=360;const g=this.img.getContext('2d');const base=['#6d95bf','#3b597d','#242c50'][this.stage];g.fillStyle=base;g.fillRect(0,0,399,360);const grad=g.createLinearGradient(0,0,0,360);grad.addColorStop(0,['#425b9b','#14284d','#121d3a'][this.stage]);grad.addColorStop(1,['#f4b181','#6d70a9','#39435d'][this.stage]);g.fillStyle=grad;g.fillRect(0,0,399,360);g.fillStyle=['#ffe2a2','#aeeaff','#ebecf9'][this.stage];g.beginPath();g.arc([288,298,311][this.stage],[93,75,83][this.stage],39,0,Math.PI*2);g.fill();for(let k=0;k<20;k++){g.fillStyle='#ffffff80';g.fillRect((k*67)%399,(k*47)%160,2,2);}if(this.stage===0){g.fillStyle='#536e94';g.beginPath();g.moveTo(0,285);g.lineTo(135,112);g.lineTo(218,232);g.lineTo(309,158);g.lineTo(399,286);g.fill();g.fillStyle='#283d61';g.beginPath();g.moveTo(0,350);g.lineTo(123,218);g.lineTo(232,340);g.lineTo(345,211);g.lineTo(399,327);g.fill();}else if(this.stage===1){for(let i=0;i<12;i++){const x=i*37,h=55+(i*27)%166;g.fillStyle=i%2?'#233d62':'#2e527a';g.fillRect(x,360-h,32,h);g.fillStyle='#e4ffbd';for(let y=360-h+12;y<345;y+=17)for(let xx=x+8;xx<x+30;xx+=13)g.fillRect(xx,y,4,6);}}else{g.fillStyle='#5c6a85';g.beginPath();g.moveTo(0,294);g.lineTo(106,246);g.lineTo(209,284);g.lineTo(320,223);g.lineTo(399,288);g.lineTo(399,360);g.lineTo(0,360);g.fill();for(let i=0;i<4;i++){g.fillStyle='#becde5';g.fillRect(38+i*91,249+i%2*15,70,36);g.fillStyle='#7ebddb';g.fillRect(49+i*91,258+i%2*15,20,15);}}this.placed=Array(9).fill(false);this.order=[0,1,2,3,4,5,6,7,8].sort(()=>Math.random()-.5);this.selected=null;level('SCENE '+(this.stage+1)+'/3');notify('选择左侧碎片，再放到右侧正确位置');},
  click(x,y){if(x>=34&&x<307&&y>=100&&y<388){const col=Math.floor((x-34)/90),row=Math.floor((y-100)/96),i=row*3+col;if(i>=0&&i<9&&!this.placed[this.order[i]])this.selected=i;return;}if(x>=343&&x<742&&y>=70&&y<430&&this.selected!==null){const col=Math.floor((x-343)/133),row=Math.floor((y-70)/120),target=row*3+col,piece=this.order[this.selected];if(target===piece){this.placed[target]=true;this.selected=null;this.total+=130;points(this.total);notify('拼对一块！');tone(830);if(this.placed.every(Boolean)){if(this.stage===2){finish('三幅星景全部复原！');return;}this.stage++;this.build();}}else{notify('位置不对，再试试');tone(170);}}},
  update(){},
  draw(){fill(0,0,800,500,'#141b2e');text('碎片库',39,67,19,'#b4dff5');text(this.scenes[this.stage],345,41,24,'#ebf8ff');for(let i=0;i<9;i++){const piece=this.order[i],col=piece%3,row=Math.floor(piece/3),dx=34+(i%3)*90,dy=100+Math.floor(i/3)*96;if(this.placed[piece]){fill(dx,dy,83,77,'#1f3445',9);text('✓',dx+41,dy+38,27,'#91f9bf','center');continue;}if(this.selected===i)fill(dx-4,dy-4,91,85,'#e6f7ff',9);ctx.drawImage(this.img,col*133,row*120,133,120,dx,dy,83,77);ctx.strokeStyle='#b7ddf78c';ctx.strokeRect(dx,dy,83,77);}
 ctx.save();ctx.globalAlpha=.12;ctx.drawImage(this.img,343,70,399,360);ctx.restore();for(let i=0;i<9;i++){const x=343+(i%3)*133,y=70+Math.floor(i/3)*120;if(this.placed[i])ctx.drawImage(this.img,(i%3)*133,Math.floor(i/3)*120,133,120,x,y,133,120);else fill(x+1,y+1,131,118,'#16304745',6);ctx.strokeStyle='#bcd9ed55';ctx.strokeRect(x,y,133,120);}
 text('已完成 '+this.placed.filter(Boolean).length+' / 9',45,453,18,'#b9e8d2');}
 })
 };
};
})();