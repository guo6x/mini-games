/* STAR ROUTES: deterministic multicolour path-cover puzzle.
 * No canvas dependency: every game rule can be validated in Node.
 * Authored solutions guarantee a way to join all pairs and fill the board.
 */
(function(root,factory){
 const Core=factory();if(typeof module!=='undefined'&&module.exports)module.exports=Core;
 if(root)root.OrbitRoutesCore=Core;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const LEVELS=[
  {name:'星港起航',size:4,routes:[[5,1,0,4,8],[12,13,9,10,14],[15,11,7,6,2,3]]},
  {name:'折返航线',size:5,routes:[[2,3,4,9,14,19,24],[23,22,21,20,15,10,5,0,1],[6,11,16,17,18,13,12,7,8]]},
  {name:'螺旋禁区',size:5,routes:[[0,1,2,3,4,9,8,7,6],[5,10,15,20,21,16,11,12],[17,22,23,24,19,18,13,14]]},
  {name:'四频交织',size:6,routes:[[7,6,0,1,2,8,14,13],[12,18,19,20,26,25,24,30,31],[32,33,34,35,29,28,27,21,15],[9,3,4,5,11,10,16,22,23,17]]},
  {name:'最终跃迁',size:6,routes:[[12,18,24,30,31,25,19,13,14],[20,26,32,33,27,21,15,9,8],[7,6,0,1,2,3,4,5,11],[10,16,17,23,22,28,34,35,29]]}
 ];
 const neighbours=(a,b,n)=>Math.abs(a%n-b%n)+Math.abs(Math.floor(a/n)-Math.floor(b/n))===1;
 function verifyLevel(level){
  if(!Number.isInteger(level.size)||level.size<4||level.size>6||!Array.isArray(level.routes)||level.routes.length<3)throw Error('invalid level');
  const used=new Set();
  for(const route of level.routes){
   if(route.length<3||!route.every(i=>Number.isInteger(i)&&i>=0&&i<level.size**2))throw Error('invalid route');
   for(let k=0;k<route.length;k++){
    const i=route[k];if(used.has(i))throw Error('crossing solution');used.add(i);
    if(k&&!neighbours(route[k-1],i,level.size))throw Error('non-adjacent solution');
   }
  }
  if(used.size!==level.size**2)throw Error('uncovered cell in solution');
  return true;
 }
 LEVELS.forEach(verifyLevel);
 class Routes{
  constructor(){this.stage=0;this.completed=false;this.reset();}
  reset(){
   const a=LEVELS[this.stage];this.size=a.size;this.name=a.name;
   this.endpoints=a.routes.map(r=>[r[0],r[r.length-1]]);
   this.paths=a.routes.map(()=>[]);
   this.active=null;this.undoStack=[];this.moves=0;this.hints=0;this.penalty=0;
   this.solved=false;this.hintRoute=null;this.hintTTL=0;this.status='选择一个彩色端点开始连线';
  }
  source(i){
   for(let color=0;color<this.endpoints.length;color++)if(this.endpoints[color].includes(i))return color;
   return -1;
  }
  occupied(i,exclude=-1){return this.paths.some((p,c)=>c!==exclude&&p.includes(i));}
  select(color,endpoint){
   if(!Number.isInteger(color)||color<0||color>=this.paths.length||this.solved||this.completed)return false;
   if(endpoint===undefined)endpoint=this.endpoints[color][0];
   if(!this.endpoints[color].includes(endpoint))return false;
   this.record();
   this.paths[color]=[endpoint];this.active=color;this.moves++;
   this.status='正在布设 '+(color+1)+' 号航线';return true;
  }
  record(){
   this.undoStack.push({paths:this.paths.map(p=>p.slice()),active:this.active,moves:this.moves,penalty:this.penalty});
   if(this.undoStack.length>300)this.undoStack.shift();
  }
  step(i){
   const color=this.active;if(color===null||this.solved||this.completed||!Number.isInteger(i)||i<0||i>=this.size*this.size)return false;
   const path=this.paths[color],last=path[path.length-1];if(last===i||!neighbours(last,i,this.size))return false;
   const existing=path.indexOf(i);
   if(existing===path.length-2){
    this.record();path.pop();this.moves++;this.status='已经回退一格';return true;
   }
   if(existing>=0||this.occupied(i,color))return false;
   const endpointColor=this.source(i);
   if(endpointColor>=0&&(endpointColor!==color||i===path[0]))return false;
   if(this.connected(color))return false;
   this.record();path.push(i);this.moves++;
   this.status='航线 '+(color+1)+' 已延伸';
   if(this.connected(color)){this.active=null;this.status='一条星路连通，继续规划其他颜色';}
   if(this.coverage()===this.size*this.size&&this.paths.every((_,c)=>this.connected(c))){
    this.solved=true;this.status='全图填满！星际线路已连通';
   }
   return true;
  }
  connected(color){
   const p=this.paths[color],e=this.endpoints[color];
   return p.length>1&&((p[0]===e[0]&&p[p.length-1]===e[1])||(p[0]===e[1]&&p[p.length-1]===e[0]));
  }
  coverage(){return this.paths.reduce((sum,p)=>sum+p.length,0);}
  undo(){
   if(!this.undoStack.length||this.completed)return false;
   const u=this.undoStack.pop();this.paths=u.paths;this.active=u.active;this.moves=u.moves;this.penalty=u.penalty;this.solved=false;this.status='上一步已撤销';return true;
  }
  clear(){
   if(this.active===null||this.completed||this.solved)return false;
   this.record();this.paths[this.active]=[];this.active=null;this.moves++;this.status='当前颜色已清空';return true;
  }
  hint(){
   if(this.solved||this.completed)return null;
   const color=this.active===null?this.paths.findIndex((_,i)=>!this.connected(i)):this.active;
   if(color<0)return null;
   this.hints++;this.hintRoute={color,route:LEVELS[this.stage].routes[color].slice()};
   this.hintTTL=4;this.status='展示 '+(color+1)+' 号推荐路线 4 秒（扣除奖励）';
   return this.hintRoute;
  }
  tick(dt){if(Number.isFinite(dt)&&dt>0)this.hintTTL=Math.max(0,this.hintTTL-dt);}
  advance(){
   if(!this.solved||this.completed)return false;
   if(this.stage===LEVELS.length-1){this.completed=true;return true;}
   this.stage++;this.reset();return true;
  }
  get progress(){return {stage:this.stage+1,total:LEVELS.length,coverage:this.coverage(),cells:this.size*this.size,connected:this.paths.filter((_,c)=>this.connected(c)).length,pairs:this.paths.length,moves:this.moves,hints:this.hints};}
 }
 Routes.LEVELS=LEVELS;Routes.verifyLevel=verifyLevel;
 return Routes;
});
