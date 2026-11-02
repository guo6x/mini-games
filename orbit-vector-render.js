/* VECTOR RUN renderer: genuine WebGL 3D with perspective depth buffer.
 * A Canvas2D software-perspective fallback keeps the game playable without GPU acceleration.
 */
(function(){
'use strict';
function Renderer(canvas,hud){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,preserveDrawingBuffer:true})
       ||canvas.getContext('experimental-webgl',{alpha:false,antialias:true,depth:true,preserveDrawingBuffer:true});
 const overlay=hud.getContext('2d');
 const fallback=!gl?canvas.getContext('2d'):null;
 let w=0,h=0,aspect=1,dpr=1,program,buffer,posLoc,colLoc,stars=[];
 const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
 const colors={
  blue:[.32,.73,1],cyan:[.22,.94,.86],violet:[.74,.43,1],
  white:[.87,.97,1],dark:[.06,.19,.31],pink:[1,.34,.68],
  gold:[1,.78,.39],steel:[.16,.37,.55]
 };
 const seedStars=()=>{let n=181;for(let i=0;i<92;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;let x=(n/4294967295)*13-6.5;n=(Math.imul(n,1664525)+1013904223)>>>0;let y=(n/4294967295)*9-4.5;n=(Math.imul(n,1664525)+1013904223)>>>0;const z=12+(n/4294967295)*105;stars.push({x,y,z,s:.015+(i%5)*.006});}};
 seedStars();
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 if(gl){
  try{
   const vs=shader(gl.VERTEX_SHADER,
    'attribute vec3 aPos; attribute vec3 aCol; uniform float uAspect; varying vec3 vCol; void main(){float z=max(aPos.z,.1);float f=1.65;gl_Position=vec4(aPos.x*f/uAspect,aPos.y*f,z*1.006-.603,z);vCol=aCol;}');
   const fs=shader(gl.FRAGMENT_SHADER,
    'precision mediump float; varying vec3 vCol; void main(){vec3 c=pow(vCol,vec3(.90));gl_FragColor=vec4(c,1.0);}');
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   gl.useProgram(program);posLoc=gl.getAttribLocation(program,'aPos');colLoc=gl.getAttribLocation(program,'aCol');
   gl.enableVertexAttribArray(posLoc);gl.enableVertexAttribArray(colLoc);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(colLoc,3,gl.FLOAT,false,24,12);
   gl.uniform1f(gl.getUniformLocation(program,'uAspect'),1.6);
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  }catch(e){canvas.dataset.rendererError=String(e.message);throw e;}
 }
 function resize(){
  const r=canvas.getBoundingClientRect(),width=Math.max(200,r.width),height=Math.max(120,r.height);
  dpr=Math.min(2,window.devicePixelRatio||1);w=width;h=height;aspect=width/height;
  const cw=Math.round(width*dpr),ch=Math.round(height*dpr);
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
  if(hud.width!==cw||hud.height!==ch){hud.width=cw;hud.height=ch;}
  if(gl){gl.viewport(0,0,cw,ch);gl.useProgram(program);gl.uniform1f(gl.getUniformLocation(program,'uAspect'),aspect);}
  overlay.setTransform(dpr,0,0,dpr,0,0);
 }
 const faces=[
  [0,1,2,0,2,3],[5,4,7,5,7,6],
  [4,0,3,4,3,7],[1,5,6,1,6,2],
  [3,2,6,3,6,7],[4,5,1,4,1,0]
 ];
 const verts=[],primitive=[];
 function cube(x,y,z,sx,sy,sz,col){
  if(sx<=0||sy<=0||sz<=0)return;
  const xx=sx/2,yy=sy/2,zz=sz/2;
  const c=[
   [x-xx,y-yy,z-zz],[x+xx,y-yy,z-zz],[x+xx,y+yy,z-zz],[x-xx,y+yy,z-zz],
   [x-xx,y-yy,z+zz],[x+xx,y-yy,z+zz],[x+xx,y+yy,z+zz],[x-xx,y+yy,z+zz]
  ];
  const contrast=[1,.62,.74,.84,1.15,.51];
  if(gl){for(let f=0;f<6;f++)for(const i of faces[f]){
   const p=c[i],l=contrast[f];verts.push(p[0],p[1],p[2],...col.map(v=>Math.min(1,v*l)));
  }}else primitive.push({x,y,z,sx,sy,sz,col});
 }
 function project(x,y,z){const zz=Math.max(.61,z),scale=1.65/zz;return{x:w/2+x*scale*w/2/aspect,y:h/2-y*scale*h/2,size:scale*h/2};}
 function drawCube2d(obj){
  const p=project(obj.x,obj.y,obj.z),sx=obj.sx*p.size,sy=obj.sy*p.size;
  if(obj.z<.6||p.x+sx<0||p.x-sx>w||p.y+sy<0||p.y-sy>h)return;
  fallback.fillStyle='rgb('+obj.col.map(v=>Math.floor(255*v)).join(',')+')';
  fallback.fillRect(p.x-sx/2,p.y-sy/2,Math.max(1,sx),Math.max(1,sy));
  fallback.strokeStyle='#ffffff44';fallback.strokeRect(p.x-sx/2,p.y-sy/2,sx,sy);
 }
 function gate(g){
  const c=g.stage===1?colors.cyan:g.stage===2?colors.blue:colors.violet;
  const x=g.x,y=g.y,z=g.z,xx=g.halfW,yy=g.halfH;
  // A full rectangular blocking plane with an authentic 3D opening.
  const left=-4.4,right=4.4,bottom=-3.2,top=3.2;
  cube((left+x-xx)/2,y,z,(x-xx)-left,6.4,.28,colors.dark);
  cube((x+xx+right)/2,y,z,right-(x+xx),6.4,.28,colors.dark);
  cube(x,(top+y+yy)/2,z,xx*2,top-(y+yy),.28,colors.dark);
  cube(x,(bottom+y-yy)/2,z,xx*2,(y-yy)-bottom,.28,colors.dark);
  cube(x-xx,y,z,.13,yy*2+.2,.4,c);cube(x+xx,y,z,.13,yy*2+.2,.4,c);
  cube(x,y-yy,z,xx*2,.13,.4,c);cube(x,y+yy,z,xx*2,.13,.4,c);
  for(const sign of [-1,1])for(const sy of [-1,1]){
   cube(x+sign*xx,y+sy*yy,z,.21,.21,.5,colors.white);
  }
  const s=project(x,y,z);
  return s;
 }
 function scene(core){
  verts.length=0;primitive.length=0;
  for(const s of stars){const z=12+((s.z-core.time*4)%105+105)%105;
   cube(s.x,s.y,z,s.s,s.s,s.s,colors.white);
  }
  // Longitudinal rails + cross braces express actual perspective and depth.
  for(const x of [-4.15,4.15])for(const y of [-2.85,2.85]){
   cube(x,y,55,.035,.035,95,colors.steel);
  }
  const offset=(core.time*17)%13;
  for(let z=13-offset;z<102;z+=13){
   if(z<=.8)continue;
   cube(0,-2.85,z,8.3,.035,.05,colors.steel);
   cube(0,2.85,z,8.3,.035,.05,colors.steel);
   cube(-4.15,0,z,.05,5.7,.05,colors.steel);
   cube(4.15,0,z,.05,5.7,.05,colors.steel);
  }
  const gates=core.gates.slice().sort((a,b)=>b.z-a.z);
  for(const g of gates)gate(g);
  const p=core.player;
  if(core.state==='running'||core.state==='paused'||core.state==='ready'){
   const c=p.shield>0?colors.gold:colors.cyan;
   cube(p.x,p.y,10,.48,.13,.92,c);
   cube(p.x,p.y,9.34,.16,.22,.93,colors.white);
   cube(p.x-.47,p.y-.08,10.25,.65,.11,.26,c);
   cube(p.x+.47,p.y-.08,10.25,.65,.11,.26,c);
   cube(p.x-.19,p.y-.06,10.74,.08,.13,.34,colors.pink);
   cube(p.x+.19,p.y-.06,10.74,.08,.13,.34,colors.pink);
   cube(p.x,p.y+.07,9.93,.22,.16,.40,colors.blue);
   if(p.shield>0){cube(p.x,p.y,10,.94,.035,.94,colors.gold);}
  }
  if(gl){
   gl.clearColor(.018,.038,.087,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.DYNAMIC_DRAW);
   gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(colLoc,3,gl.FLOAT,false,24,12);
   gl.drawArrays(gl.TRIANGLES,0,verts.length/6);
  }else{
   fallback.fillStyle='#061126';fallback.fillRect(0,0,w,h);
   primitive.sort((a,b)=>b.z-a.z);for(const o of primitive)drawCube2d(o);
  }
  overlay.clearRect(0,0,w,h);
  overlay.save();
  overlay.strokeStyle='#a8e7ee4e';overlay.lineWidth=1;
  for(const [x,y] of [[w/2-16,h/2],[w/2+16,h/2]]){overlay.beginPath();overlay.moveTo(x,y-6);overlay.lineTo(x,y+6);overlay.stroke();}
  const next=core.gates.filter(g=>!g.resolved).sort((a,b)=>a.z-b.z)[0];
  if(next){
   const gp=project(next.x,next.y,next.z),radius=Math.max(14,Math.min(74,gp.size*next.halfW));
   overlay.beginPath();overlay.arc(gp.x,gp.y,radius,0,Math.PI*2);
   overlay.strokeStyle='#9ffff17a';overlay.lineWidth=1.5;overlay.stroke();
   overlay.font='600 11px system-ui';overlay.fillStyle='#b6ffea';
   overlay.textAlign='center';overlay.fillText('GATE '+next.id+' · '+Math.round(Math.max(0,next.z-core.player.z))+'m',gp.x,gp.y-radius-9);
  }
  overlay.restore();
 }
 return {resize,draw:scene,mode:gl?'webgl':'software-perspective',project};
}
window.VectorRunRenderer=Renderer;
})();