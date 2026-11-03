/* STAR ROUTES rendering and input adapter for the existing ORBIT ARCADE shell. */
(function(){
'use strict';
const Core=window.OrbitRoutesCore;
if(!Core||!window.ORBIT_CORTEX)throw Error('STAR ROUTES must load after the original cortex');
const oldFactory=window.ORBIT_CORTEX;
window.ORBIT_CORTEX_META['connect-dots']={
 name:'STAR ROUTES · 星际连线',
 sub:'五张星图 · 多色不交叉线路 · 填满每一格',
 instruction:'从彩色圆点出发，拖动或逐格点击相邻格，让同色端点相连。不同颜色不可相交，全部连接并填满棋盘才算成功。键盘数字 1–4 选线，方向键延长，Z 撤销，空格提示。',
 hint:'先规划受限的长路径，再填短路径。允许后退和重新布线；“提示”会短暂显示当前颜色的一条可行路线。',
 accent:'#83f5dc'
};
window.ORBIT_CORTEX=(api)=>{
 const old=oldFactory(api);
 const {ctx,fill,text,points,level,finish,notify,tone}=api;
 const canvas=document.getElementById('stage');
 const colors=['#67f6d9','#f4bb78','#be9dff','#fb86af'];
 const labels=['翡翠','琥珀','星紫','绯红'];
 const W=800,H=500,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const button=(x,y,w,h,label,active=false)=>{
  fill(x,y,w,h,active?'#1e655f':'#20344d',12);
  ctx.strokeStyle=active?'#8cf8e0':'#6686b34d';ctx.lineWidth=1.5;
  ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  text(label,x+w/2,y+h/2,14,active?'#e3fff8':'#c4d9ef','center',750);
 };
 const starfield=Array.from({length:64},(_,i)=>({x:(i*137+29)%800,y:(i*i*47+19)%500,r:i%11===0?1.7:.65}));
 return {...old,'connect-dots':()=>({
  init(){
   this.core=new Core();this.total=0;this.flash=0;
   canvas.style.touchAction='none';
   const action=document.querySelector('.touch-panel [data-key="Space"]');
   if(action){action.textContent='提示';action.setAttribute('aria-label','展示当前颜色提示路线');}
   const immersive=document.querySelector('.immersive-dpad [data-key="Space"]');
   if(immersive)immersive.textContent='提示';
   level('MAP 1 / 5');points(0);
   notify('选择同色端点并连接，所有彩色路线必须填满整张棋盘。');
  },
  geom(){
   const n=this.core.size,cell=n===4?78:n===5?67:56;
   return {n,cell,x:n===4?113:n===5?109:111,y:n===4?93:n===5?89:88};
  },
  at(x,y){
   const g=this.geom(),cx=Math.floor((x-g.x)/g.cell),cy=Math.floor((y-g.y)/g.cell);
   return cx>=0&&cy>=0&&cx<g.n&&cy<g.n?cy*g.n+cx:-1;
  },
  mid(i){const g=this.geom();return {x:g.x+(i%g.n+.5)*g.cell,y:g.y+(Math.floor(i/g.n)+.5)*g.cell};},
  score(){
   const c=this.core;
   return Math.max(150,800-c.moves*9-c.hints*110);
  },
  proceed(){
   if(!this.core.solved)return;
   this.total+=this.score();points(this.total);tone(830);
   const wasLast=this.core.stage===Core.LEVELS.length-1;
   if(wasLast){this.core.advance();finish('STAR ROUTES · 五图全线连通！');return;}
   this.core.advance();this.flash=1.0;
   level('MAP '+(this.core.stage+1)+'/5');notify('新星图已解锁：'+this.core.name);
  },
  update(dt){this.core.tick(dt);this.flash=Math.max(0,this.flash-dt);},
  interact(i){
   const c=this.core;
   if(i<0||c.solved)return false;
   const endpoint=c.source(i);
   if(endpoint>=0){
    if(endpoint===c.active&&c.paths[endpoint].length&&i!==c.paths[endpoint][0]){
     return c.step(i);
    }
    c.select(endpoint,i);return true;
   }
   return c.step(i);
  },
  click(x,y){
   const c=this.core;
   if(x>=526&&x<=760){
    if(c.solved&&y>=385&&y<=453){this.proceed();return;}
    if(y>=261&&y<=304){if(c.undo()){tone(550);notify(c.status);}return;}
    if(y>=316&&y<=359){if(c.hint()){tone(640);notify(c.status);}return;}
    if(y>=370&&y<=412&&!c.solved){if(c.clear()){tone(340);notify(c.status);}return;}
    if(y>=137&&y<242){
     const color=Math.floor((y-137)/50)*2+(x>=647?1:0);
     if(color<c.paths.length){c.select(color);notify(c.status);}return;
    }
   }
   const i=this.at(x,y);if(i>=0&&this.interact(i)){tone(420);notify(c.status);}
  },
  pointerMove(x,y){
   const c=this.core;if(c.active===null||c.solved)return;
   const dest=this.at(x,y),p=c.paths[c.active];if(dest<0||!p.length)return;
   const n=c.size,src=p[p.length-1];if(src===dest)return;
   // Interpolate skipped cells when a fast finger crosses several tiles.
   let ax=src%n,ay=Math.floor(src/n),bx=dest%n,by=Math.floor(dest/n),guard=0;
   while((ax!==bx||ay!==by)&&guard++<n*2){
    const dx=bx-ax,dy=by-ay;
    if(Math.abs(dx)>=Math.abs(dy)&&dx)ax+=Math.sign(dx);
    else if(dy)ay+=Math.sign(dy);
    const next=ay*n+ax;
    if(!c.step(next))break;
   }
  },
  pointerUp(){},
  key(k){
   const c=this.core;
   if(/^Digit[1-4]$/.test(k)){c.select(+k.slice(-1)-1);notify(c.status);return;}
   if(k==='KeyZ'||k==='Backspace'){if(c.undo())notify(c.status);return;}
   if(k==='Space'){if(c.hint())notify(c.status);return;}
   if(k==='Delete'){if(c.clear())notify(c.status);return;}
   if(k==='Enter'&&c.solved){this.proceed();return;}
   const dirs={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
   const dir=dirs[k];if(!dir||c.solved)return;
   if(c.active===null){const a=c.paths.findIndex((_,i)=>!c.connected(i));if(a<0)return;c.select(a);}
   const p=c.paths[c.active];if(!p.length)return;
   const i=p[p.length-1],nx=i%c.size+dir[0],ny=Math.floor(i/c.size)+dir[1];
   if(nx>=0&&nx<c.size&&ny>=0&&ny<c.size&&c.step(ny*c.size+nx))notify(c.status);
  },
  draw(){
   const c=this.core,g=this.geom(),width=g.cell*g.n;
   const bg=ctx.createLinearGradient(0,0,800,500);
   bg.addColorStop(0,'#071526');bg.addColorStop(.5,'#132342');bg.addColorStop(1,'#110f31');
   fill(0,0,W,H,bg);
   for(const s of starfield){ctx.globalAlpha=.2+.2*Math.sin((this.core.moves+s.x)*.07);ctx.fillStyle='#c4edff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}
   ctx.globalAlpha=1;
   const halo=ctx.createRadialGradient(270,235,5,270,235,270);
   halo.addColorStop(0,'#266e8d31');halo.addColorStop(1,'#12204100');
   fill(0,0,560,500,halo);
   text('S T A R   R O U T E S',32,31,14,'#96f5e6','left',850);
   text('PATH PLANNING / '+c.name,32,54,11,'#92aeca');
   fill(g.x-13,g.y-13,width+26,width+26,'#0b1d33d9',17);
   ctx.strokeStyle='#6faec152';ctx.lineWidth=1.5;ctx.strokeRect(g.x-13,g.y-13,width+26,width+26);
   for(let i=0;i<g.n*g.n;i++){
    const pos=this.mid(i);
    fill(g.x+(i%g.n)*g.cell+3,g.y+Math.floor(i/g.n)*g.cell+3,g.cell-6,g.cell-6,'#1b3453a9',9);
    ctx.strokeStyle='#95b8d31c';ctx.lineWidth=1;ctx.strokeRect(g.x+(i%g.n)*g.cell+3,g.y+Math.floor(i/g.n)*g.cell+3,g.cell-6,g.cell-6);
    ctx.fillStyle='#84b4ce42';ctx.beginPath();ctx.arc(pos.x,pos.y,2.4,0,Math.PI*2);ctx.fill();
   }
   if(c.hintTTL>0&&c.hintRoute){
    const pts=c.hintRoute.route;ctx.save();ctx.globalAlpha=Math.min(.6,c.hintTTL/1.8);ctx.setLineDash([7,7]);ctx.strokeStyle=colors[c.hintRoute.color];ctx.lineWidth=13;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
    pts.forEach((cell,i)=>{const p=this.mid(cell);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.restore();
   }
   for(let color=0;color<c.paths.length;color++){
    const path=c.paths[color];if(path.length){
     ctx.save();ctx.strokeStyle=colors[color];ctx.lineWidth=g.cell*.3;ctx.lineJoin='round';ctx.lineCap='round';
     ctx.shadowColor=colors[color];ctx.shadowBlur=12;ctx.beginPath();
     path.forEach((cell,i)=>{const p=this.mid(cell);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.restore();
    }
   }
   for(let color=0;color<c.endpoints.length;color++){
    for(const endpoint of c.endpoints[color]){
     const p=this.mid(endpoint),radius=g.cell*.265;
     ctx.save();ctx.shadowColor=colors[color];ctx.shadowBlur=17;
     ctx.fillStyle=colors[color];ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();
     ctx.shadowBlur=0;ctx.strokeStyle='#efffff';ctx.lineWidth=2.5;ctx.stroke();
     ctx.fillStyle='#0a2339';ctx.beginPath();ctx.arc(p.x,p.y,radius*.38,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    if(c.active===color&&c.paths[color].length){
     const p=this.mid(c.paths[color][c.paths[color].length-1]);
     ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,g.cell*.33,0,Math.PI*2);ctx.stroke();
    }
   }
   // The right-hand command deck doubles as touch-accessible controls.
   fill(503,66,268,407,'#0a1b33e6',19);
   ctx.strokeStyle='#7ec8d432';ctx.strokeRect(503.5,66.5,267,406);
   text('STAR MAP 0'+(c.stage+1),526,96,19,'#e6fcff','left',850);
   text(c.progress.coverage+' / '+c.progress.cells+'   CELLS FILLED',526,120,13,'#9dbfda');
   for(let color=0;color<c.paths.length;color++){
    const x=526+(color%2)*121,y=138+Math.floor(color/2)*50;
    fill(x,y,112,42,c.active===color?'#35536a':'#21354d',11);
    ctx.fillStyle=colors[color];ctx.beginPath();ctx.arc(x+19,y+21,8,0,Math.PI*2);ctx.fill();
    text((color+1)+' '+labels[color],x+34,y+21,13,'#e5effb');
    if(c.connected(color))text('✓',x+96,y+21,17,colors[color],'center');
   }
   fill(526,244,225,6,'#203b55',4);
   fill(526,244,225*c.progress.coverage/c.progress.cells,6,'#6ff4d2',4);
   button(526,261,225,44,'↶  撤销一步  /  Z');
   button(526,316,225,44,'✦  显示推荐线路  /  空格');
   if(c.solved)button(526,385,225,68,c.stage===4?'完成战役  ↗':'进入下一张星图  ↗',true);
   else button(526,370,225,43,'×  清空当前线路',false);
   text(c.solved?'棋盘全部填满，线路无交叉':'端点必须配对，线路不可交叉',528,455,11,c.solved?'#97fbd4':'#9baec5');
   text('MOVES '+c.moves+'    HINTS '+c.hints,35,474,14,'#bad4ea');
   if(this.flash>0){ctx.globalAlpha=this.flash*.2;fill(0,0,800,500,'#b0fff3');ctx.globalAlpha=1;}
   canvas.dataset.routeStage=String(c.stage+1);
   canvas.dataset.routeSolved=String(c.solved);
   canvas.dataset.routeCoverage=String(c.progress.coverage);
   canvas.dataset.routePairs=String(c.progress.connected);
   canvas.dataset.routeActive=String(c.active??-1);
   canvas.dataset.routeMoves=String(c.moves);
  }
 })};
};
})();
