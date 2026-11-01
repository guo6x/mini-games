(() => {
'use strict';
const id=decodeURIComponent(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
if(!id||id==='index')return;
const guides={
'snake':'方向键或 WASD 控制贪吃蛇，吃掉食物，避开边界与蛇身。',
'tetris':'方向键移动并旋转方块，消除整行；空格通常用于暂停或快速放置。',
'2048':'使用方向键合并数字，尝试获得 2048。',
'flappy-bird':'按空格或点击屏幕让小鸟上升，穿过管道。',
'pac-man':'使用方向键穿梭迷宫，吃掉豆子，躲开敌人。',
'plane-combat':'使用方向键或 WASD 移动，躲避敌方火力。',
'minesweeper':'点击格子揭开安全区域，标记你认为有雷的位置。',
'sudoku':'填入 1–9，让每行、每列及九宫格都不重复。',
'time-guardian':'观察游戏内技能与生命值，合理利用时空能力完成挑战。'};
function init(){
document.body.classList.add('arcade-game');
const nav=document.createElement('nav');nav.className='arcade-utility';nav.setAttribute('aria-label','游戏快捷导航');
const back=document.createElement('a');back.href='index.html';back.textContent='← 大厅';nav.append(back);
const help=document.createElement('button');help.type='button';help.textContent='玩法';help.setAttribute('aria-label','查看玩法说明');nav.append(help);
const random=document.createElement('button');random.type='button';random.textContent='再来';random.title='重新加载当前游戏';random.addEventListener('click',()=>location.reload());nav.append(random);
document.body.append(nav);
const d=document.createElement('dialog');d.className='arcade-dialog';const h=document.createElement('h2');h.textContent=document.title.split('-')[0].trim()||'玩法提示';const p=document.createElement('p');p.textContent=guides[id]||'此游戏属于旧版作品，按游戏内部指引操作。部分早期原型尚未达到正式发布标准。';const f=document.createElement('form');f.method='dialog';const close=document.createElement('button');close.textContent='明白了';f.append(close);d.append(h,p,f);document.body.append(d);
help.addEventListener('click',()=>d.showModal());
const controllerIds=new Set(['snake','tetris','2048','pac-man','gomoku','flappy-bird','plane-combat','space-shooter']);
if(controllerIds.has(id)&&matchMedia('(pointer:coarse)').matches){
 const ctrl=document.createElement('div');ctrl.className='arcade-virtual';ctrl.setAttribute('aria-label','屏幕方向键');
 const keyNames={ArrowUp:'↑',ArrowLeft:'←',ArrowDown:'↓',ArrowRight:'→'};
 for(const [code,label] of Object.entries(keyNames)){
 const b=document.createElement('button');b.type='button';b.dataset.code=code;b.textContent=label;b.setAttribute('aria-label',label==='↑'?'向上':label==='↓'?'向下':label==='←'?'向左':'向右');
 let timer;
 const send=type=>document.dispatchEvent(new KeyboardEvent(type,{key:code,code,bubbles:true,cancelable:true}));
 b.addEventListener('pointerdown',e=>{e.preventDefault();send('keydown');timer=setInterval(()=>send('keydown'),150);try{b.setPointerCapture(e.pointerId)}catch(_){}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{clearInterval(timer);send('keyup')});
 ctrl.append(b);
 }
 document.body.append(ctrl);
}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();