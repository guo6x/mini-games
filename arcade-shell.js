(() => {
'use strict';
const id=decodeURIComponent(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
if(!id||id==='index')return;
const guides={
'snake':'方向键或 WASD 控制蛇头，吃掉食物延长身体；速度会随难度提高。避开边界和自身，空格可暂停。',
'tetris':'移动与旋转正在下落的方块，凑满横行消除；关注右侧下一块的预览，合理留下长条空间。',
'2048':'方向键或触屏滑动，合并相同数字，尽量形成 2048。保持最大数字在角落通常更稳定。',
'flappy-bird':'点击画面或按空格拍翅，保持飞行高度，在管道间穿行。',
'pac-man':'方向键穿越迷宫，吃完豆子、躲避幽灵；吃到强化豆后可短暂反击。',
'plane-combat':'方向键或 WASD 移动；空格射击，躲避子弹与敌机，合理规划飞行路线。',
'minesweeper':'左键开格，右键插旗；先用数字推理雷的位置，不要盲猜安全格。',
'sudoku':'在行、列与九宫格均不重复的条件下填入 1–9。优先推理候选数最少的空格。',
'time-guardian':'注意时间、生命值与技能冷却，在波次压力下合理移动，暂停后可以继续挑战。',
'brick-breaker':'左右移动挡板反弹小球，逐层清除砖块；尽量利用边缘改变反弹方向。',
'card-memory':'快速记住翻开的卡片位置，寻找成对图案；尝试在更高难度里减少错误翻牌。',
'checkers':'轮流移动棋子，斜向前进并跳过对手棋子完成吃子；赢得更多棋子形成优势。',
'color-match':'识别目标颜色，迅速选择匹配项，尽量保持连续正确。',
'connect-dots':'观察连点规则并在限定步数内完成连接，必要时重新洗牌。',
'cooking':'检查食材清单，按照订单选择食材、完成烹饪与上菜，避免顺序错误。',
'farm':'选择作物、种植和收获，使用收益拓展农场；注意每次选择的投入与回报。',
'gomoku':'黑白棋轮流落子，先形成五子连线获胜；观察对手连续三子的威胁。',
'hangman':'输入字母猜出隐藏单词。试试常见元音，再根据出现位置推理。',
'memory-game':'翻开两张卡片寻找配对，用尽可能少的尝试完成全部卡片。',
'music-rhythm':'按 A、S、D、F 对应四个节奏轨道，音符到达判定线时点击或按键。',
'number-memory':'短暂观察出现的数字，记住顺序再输入答案，逐级挑战记忆容量。',
'pong':'控制挡板接住来球，瞄准球的反弹角度击败对手。',
'puzzle':'点击相邻的数字或图案交换位置，把碎片恢复到原来的顺序。',
'reaction-test':'等待画面给出开始信号再点击，抢跑会失败；尝试刷新最佳反应时间。',
'sliding-puzzle':'移动与空格相邻的数字方块，将它们按序恢复到目标位置。',
'space-invaders':'移动战机并射击逐步下降的敌阵；优先避开敌方炮火。',
'space-shooter':'驾驶宇宙飞船躲避弹幕并持续射击，利用道具提高生存能力。',
'spot-difference':'细看两幅画面中的细节差异，点击不一样的位置；提示次数有限。',
'tic-tac-toe':'在九宫格轮流落子，先连成横、竖或斜三子获胜；防守对手的双线威胁。',
'typing-game':'根据显示文本输入准确的字母，关注正确率，再逐步提高速度。',
'word-chain':'成语接龙：根据上一个成语的末尾汉字，输入以该字开头的四字成语。'
};
function init(){
document.body.classList.add('arcade-game');
const nav=document.createElement('nav');nav.className='arcade-utility';nav.setAttribute('aria-label','游戏快捷导航');
const back=document.createElement('a');back.href='index.html';back.textContent='← 大厅';nav.append(back);
const help=document.createElement('button');help.type='button';help.textContent='玩法';help.setAttribute('aria-label','查看玩法说明');nav.append(help);
const full=document.createElement('button');full.type='button';full.textContent='全屏';full.setAttribute('aria-label','切换全屏游玩');full.addEventListener('click',()=>{const target=document.querySelector('.game-container,.tetris-container,.container,main')||document.documentElement;if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});}else{target.requestFullscreen?.().catch(()=>{});}});nav.append(full);
const random=document.createElement('button');random.type='button';random.textContent='再来';random.title='重新加载当前游戏';random.addEventListener('click',()=>location.reload());nav.append(random);
document.body.append(nav);
const d=document.createElement('dialog');d.className='arcade-dialog';const h=document.createElement('h2');h.textContent=document.title.split('-')[0].trim()||'玩法提示';const p=document.createElement('p');p.textContent=guides[id]||'此游戏属于旧版作品，按游戏内部指引操作。部分早期原型尚未达到正式发布标准。';const f=document.createElement('form');f.method='dialog';const close=document.createElement('button');close.textContent='明白了';f.append(close);d.append(h,p,f);document.body.append(d);
help.addEventListener('click',()=>d.showModal());
const controllerIds=new Set(['tetris','pac-man','space-invaders']);
if(controllerIds.has(id)&&matchMedia('(pointer:coarse)').matches&&!document.querySelector('.direction-btn')){
 const ctrl=document.createElement('div');ctrl.className='arcade-virtual';ctrl.setAttribute('aria-label','屏幕方向键');
 const keyNames={ArrowUp:'↑',ArrowLeft:'←',ArrowDown:'↓',ArrowRight:'→',...(id==='space-invaders'?{Space:'发射'}:{})};
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
// Prevent legacy fixed-size canvases from falling outside mobile viewports.
for(const canvas of document.querySelectorAll('canvas')){canvas.style.maxWidth='100%';canvas.style.height='auto';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();