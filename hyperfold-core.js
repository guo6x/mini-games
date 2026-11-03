(function(root,factory){const C=factory();if(typeof module==='object'&&module.exports)module.exports=C;if(root)root.HyperfoldCore=C;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const eq=(a,b)=>a.every((x,i)=>x===b[i]),id=a=>a.join(',');
const levels=[
{name:'超越平面',hint:'W 轴绕过当前平面中的整堵墙。',size:[5,5,1,2],start:[0,2,0,0],goal:[4,2,0,0],walls:Array.from({length:5},(_,y)=>[2,y,0,0]),limit:18},
{name:'层间折叠',hint:'两道屏障迫使你同时利用 Z 和 W 轴。',size:[5,5,2,2],start:[0,2,0,0],goal:[4,2,0,0],walls:[...Array.from({length:5},(_,y)=>[2,y,0,0]),...Array.from({length:5},(_,y)=>[3,y,1,0]),...Array.from({length:5},(_,y)=>[3,y,0,1])],limit:23},
{name:'第四维钥匙',hint:'必须进入另一个 Z/W 截面拿到晶体，再返回终点。',size:[5,5,2,2],start:[0,0,0,0],goal:[4,4,0,0],keys:[[4,0,1,1]],walls:[[2,1,0,0],[2,2,0,0],[2,3,0,0],[2,1,1,0],[2,2,1,0],[2,3,1,0]],limit:26},
{name:'双重封锁',hint:'同一 XY 位置在不同的 Z/W 截面可能是墙、空地或晶体。',size:[5,5,2,3],start:[0,2,0,0],goal:[4,2,1,2],keys:[[1,4,1,1],[4,0,0,2]],walls:[...Array.from({length:5},(_,y)=>[2,y,0,0]),...Array.from({length:5},(_,y)=>[2,y,1,1]),[3,1,0,2],[3,2,0,2],[3,3,0,2]],limit:32},
{name:'超立方归航',hint:'四条独立空间轴、三枚晶体与步数挑战。',size:[5,5,3,3],start:[0,0,0,0],goal:[4,4,2,2],keys:[[4,0,0,1],[0,4,1,2],[2,2,2,0]],walls:[...Array.from({length:5},(_,y)=>[2,y,0,0]),...Array.from({length:5},(_,x)=>[x,2,1,1]),[3,2,2,2],[3,3,2,2]],limit:42}
];
class Core{
constructor(level=0){this.load(level);}
load(i){if(!Number.isInteger(i)||i<0||i>=levels.length)throw RangeError('level');this.level=i;this.map=levels[i];this.pos=[...this.map.start];this.collected=0;this.steps=0;this.state='ready';this.history=[];this.message='选择方向开始';return this.snapshot();}
get allKeys(){return (1<<(this.map.keys||[]).length)-1;}
countKeys(){let n=0;for(let b=this.collected;b;b>>=1)n+=b&1;return n;}
move(axis,sign){if(this.state==='won'||!Number.isInteger(axis)||axis<0||axis>3||![-1,1].includes(sign))return false;const next=[...this.pos];next[axis]+=sign;if(next.some((v,i)=>v<0||v>=this.map.size[i])){this.message='已到空间边界';return false;}if(this.map.walls.some(w=>eq(w,next))){this.message='该空间被阻挡：尝试切换 Z/W';return false;}this.history.push({pos:[...this.pos],collected:this.collected,state:this.state});this.pos=next;this.steps++;this.state='playing';(this.map.keys||[]).forEach((p,i)=>{if(eq(p,next))this.collected|=1<<i;});if(eq(next,this.map.goal)&&this.collected===this.allKeys){this.state='won';this.message='四维航线完成！';}else if(eq(next,this.map.goal))this.message='尚未收集全部晶体';else this.message='沿 '+['X','Y','Z','W'][axis]+' 轴移动';return true;}
undo(){if(!this.history.length)return false;const p=this.history.pop();this.pos=p.pos;this.collected=p.collected;this.state=p.state;this.steps--;this.message='撤回成功';return true;}
reset(){return this.load(this.level);}
snapshot(){return{level:this.level,pos:[...this.pos],goal:[...this.map.goal],size:[...this.map.size],keys:(this.map.keys||[]).map(k=>[...k]),walls:this.map.walls.map(w=>[...w]),collected:this.collected,steps:this.steps,state:this.state};}
static solve(index,from){const m=levels[index];if(!m)return null;const keys=m.keys||[],wall=new Set(m.walls.map(id)),full=(1<<keys.length)-1,start=from?{pos:from.pos,mask:from.collected}:{pos:m.start,mask:0},q=[{...start,path:[]}],seen=new Set([id(start.pos)+'|'+start.mask]);for(let h=0;h<q.length;h++){const s=q[h];if(eq(s.pos,m.goal)&&s.mask===full)return s.path;for(let axis=0;axis<4;axis++)for(const sign of [-1,1]){const p=[...s.pos];p[axis]+=sign;if(p.some((v,i)=>v<0||v>=m.size[i])||wall.has(id(p)))continue;let mask=s.mask;keys.forEach((k,i)=>{if(eq(k,p))mask|=1<<i;});const k=id(p)+'|'+mask;if(seen.has(k))continue;seen.add(k);q.push({pos:p,mask,path:[...s.path,[axis,sign]]});}}return null;}
}
Core.LEVELS=levels;return Core;
});