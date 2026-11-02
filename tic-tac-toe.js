/* Tic Tac Toe: local multiplayer and optional computer challenge. */
(() => {
'use strict';
function init(){
const root=document.getElementById('ttt-board'),status=document.getElementById('ttt-status'),restart=document.getElementById('ttt-restart');
if(!root||!status||!restart)return;
let cells=Array(9).fill(''),turn='X',ended=false,thinking=null,wins=0,losses=0,draws=0;
const modes=document.createElement('label');modes.style.cssText='display:inline-flex;gap:7px;align-items:center;margin:10px;color:#d6edff';
modes.textContent='模式';
const mode=document.createElement('select');
mode.setAttribute('aria-label','对战模式');
for(const [value,label] of [['normal','人机 · 标准'],['easy','人机 · 新手'],['hard','人机 · 高手'],['local','本地双人']]){const o=document.createElement('option');o.value=value;o.textContent=label;mode.append(o);}
modes.append(mode);restart.parentNode.insertBefore(modes,restart);
const score=document.createElement('p');score.style.cssText='color:#a8d9ef;font-weight:700;text-align:center;margin:10px';restart.parentNode.append(score);
const winLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner=b=>{for(const line of winLines){const [a,c,d]=line;if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];}return b.every(Boolean)?'T':null;};
function render(){
 root.replaceChildren(...cells.map((v,i)=>{const b=document.createElement('button');b.type='button';b.className='ttt-cell';b.textContent=v;b.setAttribute('aria-label','第'+(i+1)+'格'+(v?'，'+v:'，空'));b.disabled=ended||!!v||(mode.value!=='local'&&turn==='O');b.addEventListener('click',()=>play(i));return b;}));
 score.textContent='胜 '+wins+' · 负 '+losses+' · 平 '+draws;
 if(!ended)status.textContent='轮到 '+(turn==='X'?'X（你）':mode.value==='local'?'O（玩家二）':'O（电脑）');
}
function finish(result){
 ended=true;clearTimeout(thinking);thinking=null;
 if(result==='T'){status.textContent='平局！两边都很谨慎。';draws++;}
 else if(result==='X'){status.textContent='X 获胜！';wins++;}
 else{status.textContent='O 获胜！';losses++;}
 try{localStorage.setItem('orbit-ttt-score',JSON.stringify({wins,losses,draws}));}catch(e){}
 render();
}
function play(i){
 if(ended||cells[i]||(mode.value!=='local'&&turn==='O'))return;
 cells[i]=turn;const result=winner(cells);if(result){finish(result);return;}
 turn=turn==='X'?'O':'X';render();
 if(turn==='O'&&mode.value!=='local')thinking=setTimeout(ai,220);
}
function evaluate(b,depth,maximizing){
 const w=winner(b);if(w==='O')return 10-depth;if(w==='X')return depth-10;if(w==='T')return 0;
 const moves=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
 let best=maximizing?-100:100;
 for(const i of moves){b[i]=maximizing?'O':'X';const value=evaluate(b,depth+1,!maximizing);b[i]='';best=maximizing?Math.max(best,value):Math.min(best,value);}
 return best;
}
function ai(){
 thinking=null;if(ended||turn!=='O'||mode.value==='local')return;
 const moves=cells.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!moves.length)return;
 let pick=moves[Math.floor(Math.random()*moves.length)];
 if(mode.value!=='easy'){
  const ranked=moves.map(i=>{cells[i]='O';const v=evaluate(cells,0,false);cells[i]='';return {i,v}}).sort((a,b)=>b.v-a.v);
  if(mode.value==='hard'||Math.random()>.20)pick=ranked[0].i;
 }
 cells[pick]='O';const result=winner(cells);if(result){finish(result);return;}
 turn='X';render();
}
function reset(){
 clearTimeout(thinking);thinking=null;cells=Array(9).fill('');turn='X';ended=false;render();
}
try{const saved=JSON.parse(localStorage.getItem('orbit-ttt-score')||'{}');wins=saved.wins||0;losses=saved.losses||0;draws=saved.draws||0;}catch(e){}
restart.addEventListener('click',reset);mode.addEventListener('change',reset);window.addEventListener('beforeunload',()=>clearTimeout(thinking));reset();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();