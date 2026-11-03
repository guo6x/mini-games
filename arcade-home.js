(() => {
'use strict';
const games = typeof GAMES_DATA === 'undefined' ? [] : GAMES_DATA;
const KEY = 'orbit-arcade-v2';
const categories = [{id:'all',label:'全部'},{id:'action',label:'动作街机'},{id:'puzzle',label:'益智解谜'},{id:'strategy',label:'策略对战'},{id:'casual',label:'轻松休闲'},{id:'classic',label:'经典重温'}];
const state = {category:'all',view:'playable',search:'',sort:'curated',favorites:new Set(),recent:[],visits:0};
try {const saved=JSON.parse(localStorage.getItem(KEY)||'{}');state.favorites=new Set(Array.isArray(saved.favorites)?saved.favorites:[]);state.recent=Array.isArray(saved.recent)?saved.recent:[];state.visits=Number(saved.visits)||0;}catch(e){}
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({favorites:[...state.favorites],recent:state.recent,visits:state.visits}));}catch(e){}};
const label=g=>({action:'动作',puzzle:'益智',strategy:'策略',casual:'休闲',classic:'经典'})[g.category]||'探索';
const toast=s=>{const el=$('toast');el.textContent=s;el.classList.add('show');window.clearTimeout(toast.id);toast.id=window.setTimeout(()=>el.classList.remove('show'),2200);};
const el=(name,cl,text)=>{const x=document.createElement(name);if(cl)x.className=cl;if(text!==undefined)x.textContent=text;return x;};

/* Procedural arcade covers: original, self-contained illustrations. No external images. */
function renderPoster(canvas,g){
 const c=canvas.getContext('2d');if(!c)return;
 const W=canvas.width,H=canvas.height,seed=Array.from(g.id).reduce((n,ch)=>((n*33+ch.charCodeAt(0))>>>0),5381);
 let k=seed;const random=()=>{k=(1664525*k+1013904223)>>>0;return k/4294967296;};
 const palettes={action:['#203769','#091a39','#80e6ff'],puzzle:['#33325f','#121e40','#b9a9ff'],strategy:['#184c55','#091c35','#91fbd5'],classic:['#2f426a','#0b1b37','#a5d3ff'],casual:['#3b3154','#17223b','#f9c5a1']};
 const [top,bottom,glow]=palettes[g.category]||palettes.action;
 let bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,top);bg.addColorStop(1,bottom);c.fillStyle=bg;c.fillRect(0,0,W,H);
 let halo=c.createRadialGradient(W*.7,H*.36,2,W*.7,H*.36,156);halo.addColorStop(0,glow+'55');halo.addColorStop(1,glow+'00');c.fillStyle=halo;c.fillRect(0,0,W,H);
 c.strokeStyle='#b5e9ff19';c.lineWidth=1;
 for(let x=-60;x<W+60;x+=36){c.beginPath();c.moveTo(x,0);c.lineTo(x+34,H);c.stroke();}
 for(let y=18;y<H;y+=34){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
 for(let i=0;i<42;i++){const x=random()*W,y=random()*H,r=random()*1.4+.4;c.fillStyle=i%4?'#d6ecff55':glow;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
 c.save();c.translate(W*.52,H*.52);c.rotate((seed%9-4)*.055);c.shadowColor=glow;c.shadowBlur=18;
 if(g.id==='vector-run'){
  // 3D wireframe tunnel with converging perspective and an approaching portal.
  c.save();
  c.strokeStyle='#78e8f4';c.lineWidth=1.6;c.shadowColor='#5fdefd';c.shadowBlur=11;
  for(const z of [0.1,0.35,0.75,1]){const ww=95*z,hh=55*z; c.strokeRect(-ww,-hh,2*ww,2*hh);}
  for(const sign of [-1,1]){for(const y of [-1,1]){c.beginPath();c.moveTo(sign*10,y*5);c.lineTo(sign*95,y*55);c.stroke();}}
  c.strokeStyle='#8afcdb';c.lineWidth=5;c.strokeRect(-50,-35,100,70);
  c.strokeStyle='#e8ffff';c.lineWidth=2;c.strokeRect(-32,-22,64,44);
  c.fillStyle='#aaffed';c.beginPath();c.moveTo(0,7);c.lineTo(-23,22);c.lineTo(-6,18);c.lineTo(0,26);c.lineTo(6,18);c.lineTo(23,22);c.closePath();c.fill();
  c.restore();
  c.fillStyle='#edffff';c.font='bold 20px system-ui';c.textAlign='left';c.fillText('VECTOR RUN',-157,-52);
  c.fillStyle='#90ffe4';c.font='bold 11px system-ui';c.fillText('3D / PERSPECTIVE FLIGHT',-157,-33);
 }else if(g.id==='space-shooter'){
  // Original key art for our first authored campaign: hero craft, orbiting enemy core and projectile trails.
  c.save();
  c.translate(29,28);
  let aura=c.createRadialGradient(53,-22,2,53,-22,79);aura.addColorStop(0,'#f09bd4b0');aura.addColorStop(1,'#f09bd400');
  c.fillStyle=aura;c.fillRect(-32,-102,164,164);
  c.strokeStyle='#f3b5f8';c.lineWidth=2;c.shadowBlur=14;c.shadowColor='#df83f3';
  c.rotate(.2);
  for(let r=27;r<=51;r+=24){c.beginPath();c.ellipse(54,-28,r,r*.55,1,0,Math.PI*2);c.stroke();}
  c.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6,r=i%2?15:29;c.lineTo(54+Math.cos(a)*r,-28+Math.sin(a)*r);}c.closePath();
  c.fillStyle='#442b75';c.fill();c.stroke();
  c.fillStyle='#ffeaff';c.beginPath();c.arc(54,-28,9,0,Math.PI*2);c.fill();
  c.restore();
  c.save();c.translate(-22,39);c.shadowColor='#8fffe5';c.shadowBlur=19;
  c.strokeStyle='#e5fffa';c.lineWidth=3;c.fillStyle='#75ddcf';
  c.beginPath();c.moveTo(0,-45);c.lineTo(16,-11);c.lineTo(42,14);c.lineTo(6,6);c.lineTo(0,13);c.lineTo(-6,6);c.lineTo(-42,14);c.lineTo(-16,-11);c.closePath();c.fill();c.stroke();
  c.shadowBlur=0;c.fillStyle='#c6e7ff';c.fillRect(-5,-27,10,14);
  c.strokeStyle='#85fff0';c.lineWidth=4;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*16,-42);c.lineTo(i*22,-88);c.stroke();}
  c.restore();
  c.fillStyle='#effdff';c.font='bold 21px system-ui';c.textAlign='left';c.fillText('NEBULA',-161,-49);
  c.fillStyle='#9dfde6';c.font='bold 10px system-ui';c.fillText('STRIKE  //  2D CAMPAIGN',-160,-31);
 }else if(g.id==='snake'||g.id==='pac-man'||g.id==='flappy-bird'){
  for(let i=0;i<8;i++){c.fillStyle=i%2?'#84f3d9':'#a9c3ff';c.beginPath();c.arc(-85+i*23,Math.sin(i*.8)*23,13,0,7);c.fill();}
 }else if(g.id==='tetris'||g.id==='2048'||g.category==='puzzle'){
  for(let y=0;y<3;y++)for(let x=0;x<4;x++){const v=(x+y*4+seed)%7;c.fillStyle=['#6f9ce5','#72dcbe','#c3a9ff','#edc18d','#9dd8f8','#bdc5fa','#f2a3cd'][v];const xx=-90+x*47,yy=-65+y*43;c.beginPath();c.roundRect(xx,yy,39,35,6);c.fill();c.globalAlpha=.28;c.fillStyle='#ffffff';c.fillRect(xx+5,yy+5,28,2);c.globalAlpha=1;}
 }else if(g.category==='strategy'){
  for(let y=0;y<5;y++)for(let x=0;x<7;x++){c.fillStyle=(x+y)%2?'#2c5470':'#7790a9';c.fillRect(-95+x*28,-72+y*28,28,28);}
  for(let i=0;i<7;i++){c.fillStyle=i%2?'#d7b5f5':'#90f3db';c.beginPath();c.arc(-70+i*22,-40+(i%3)*31,9,0,7);c.fill();}
 }else if(g.category==='casual'){
  c.fillStyle='#6bdac770';c.beginPath();c.ellipse(0,68,134,37,0,0,7);c.fill();
  for(let i=0;i<6;i++){const x=-108+i*42;c.strokeStyle=glow;c.lineWidth=5;c.beginPath();c.moveTo(x,38);c.lineTo(x+4,4-random()*45);c.stroke();c.fillStyle='#c9edb4';c.beginPath();c.arc(x+4,9-random()*36,10,0,7);c.fill();}
 }else{
  c.fillStyle=glow;c.beginPath();c.moveTo(0,-61);c.lineTo(33,28);c.lineTo(0,9);c.lineTo(-33,28);c.closePath();c.fill();
  c.fillStyle='#e6eefd';c.beginPath();c.moveTo(0,-32);c.lineTo(12,-6);c.lineTo(-12,-6);c.fill();
  c.strokeStyle='#ffdea1';c.lineWidth=4;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*19,48);c.lineTo(i*22,74);c.stroke();}
 }
 c.restore();
 let vignette=c.createLinearGradient(0,0,W,0);vignette.addColorStop(0,'#0910209c');vignette.addColorStop(.38,'#09102000');vignette.addColorStop(1,'#09102038');c.fillStyle=vignette;c.fillRect(0,0,W,H);
}
function navigate(g){state.recent=[g.id,...state.recent.filter(x=>x!==g.id)].slice(0,12);state.visits++;save();location.href=g.file;}
function playable(){return games.filter(g=>g.status==='playable'&&g.qualityTier!=='lab');}
function card(g){
  const article=el('article','game-card');article.dataset.quality=g.qualityTier;
  const cover=el('div','card-cover');cover.style.setProperty('--glow',['#243c7c','#1f5670','#543a85','#28505f'][Math.abs(g.id.length*13)%4]);const poster=el('canvas','game-poster');poster.width=350;poster.height=168;poster.setAttribute('aria-hidden','true');cover.append(poster);renderPoster(poster,g);const emblem=el('span','poster-emblem',g.icon);emblem.setAttribute('aria-hidden','true');cover.append(emblem);
  cover.setAttribute('aria-hidden','true');cover.append(el('span','tiny-status',g.qualityTier==='candidate'?'优先体验':g.qualityTier==='lab'?'实验版':'基础可玩'));
  const b=el('div','game-body');b.append(el('h3','',g.name),el('p','',g.description));if(g.qualityTier==='lab'&&g.qualityNote)b.append(el('p','quality-note','待改进：'+g.qualityNote));
  const end=el('div','game-bottom');end.append(el('span','category',label(g)));
  if(g.status==='playable'){const play=el('a','play-link',g.qualityTier==='lab'?'试玩实验版 ↗':'开始挑战 ↗');play.href=g.file;play.setAttribute('aria-label','开始'+g.name);play.addEventListener('click',e=>{e.preventDefault();navigate(g);});end.append(play);}
  else end.append(el('span','preview-message','暂不作为正式游戏'));
  b.append(end);article.append(cover,b);
  const fav=el('button','heart'+(state.favorites.has(g.id)?' active':''),state.favorites.has(g.id)?'♥':'♡');fav.type='button';fav.setAttribute('aria-label',(state.favorites.has(g.id)?'取消收藏':'收藏')+g.name);fav.addEventListener('click',()=>{state.favorites.has(g.id)?state.favorites.delete(g.id):state.favorites.add(g.id);save();render();});article.append(fav);
  return article;
}
function render(){
 $('readyCount').textContent=playable().length;
 $('previewCount').textContent=games.filter(g=>g.qualityTier==='lab').length;
 $('revampedCount').textContent=games.filter(g=>g.qualityTier==='candidate').length;
 $('playedCount').textContent=state.visits;
 $('favoriteCount').textContent=state.favorites.size;
 const term=state.search.toLocaleLowerCase();
 const list=games.filter(g=>
  (state.view==='all'||(state.view==='favorites'&&state.favorites.has(g.id))||(state.view==='lab'&&g.qualityTier==='lab')||(state.view==='playable'&&g.status==='playable'&&g.qualityTier!=='lab'))
  &&(state.category==='all'||g.category===state.category)
  &&(!term||[g.name,g.description,...g.tags].join(' ').toLocaleLowerCase().includes(term)));
 const rank={candidate:0,standard:1,lab:2};
 if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hans-CN'));
 else if(state.sort==='recent')list.sort((a,b)=>{
  const ia=state.recent.indexOf(a.id),ib=state.recent.indexOf(b.id);
  return (ia<0?999:ia)-(ib<0?999:ib);
 });
 else list.sort((a,b)=>rank[a.qualityTier]-rank[b.qualityTier]||a.name.localeCompare(b.name,'zh-Hans-CN'));
 $('gamesGrid').replaceChildren(...list.map(card));$('emptyState').hidden=list.length!==0;
 $('resultSummary').textContent='找到 '+list.length+' 款 · '+(state.view==='playable'?'主游戏库':state.view==='lab'?'公开实验室':state.view==='favorites'?'我的收藏':'全部 59 款');
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);b.setAttribute('aria-pressed',String(b.dataset.view===state.view));});
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===state.category);b.setAttribute('aria-pressed',String(b.dataset.category===state.category));});
}
function featured(){
 const pool=games.filter(g=>g.qualityTier==='candidate'&&g.status==='playable');const offset=Number(featured.offset)||0;const picks=Array.from({length:Math.min(3,pool.length)},(_,i)=>pool[(offset+i)%pool.length]);const box=$('spotlightGrid');box.replaceChildren(...picks.map((g,i)=>{const a=el('a','feature');a.href=g.file;a.addEventListener('click',e=>{e.preventDefault();navigate(g);});const tag=el('span','label','EDITOR PICK / BETA');const icon=el('span','feature-icon',g.icon);icon.setAttribute('aria-hidden','true');a.append(tag,icon,el('h3','',g.name),el('p','',g.description),el('span','feature-bottom','立即开玩 ↗'));return a;}));
}
function init(){
 $('categoryFilters').replaceChildren(...categories.map(c=>{const b=el('button','',''+c.label);b.type='button';b.dataset.category=c.id;b.addEventListener('click',()=>{state.category=c.id;render();});return b;}));
 $('gameSearch').addEventListener('input',e=>{state.search=e.target.value.trim();render();});
 $('sortBy').addEventListener('change',e=>{state.sort=e.target.value;render();});
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;render();}));
 $('favoriteTop').addEventListener('click',()=>{state.view='favorites';state.category='all';state.search='';$('gameSearch').value='';render();$('library').scrollIntoView({behavior:'smooth'});});
 $('clearFilters').addEventListener('click',()=>{state.category='all';state.search='';state.view='playable';$('gameSearch').value='';render();});
 $('surprise').addEventListener('click',()=>{const p=playable();if(p.length)navigate(p[Math.floor(Math.random()*p.length)]);else toast('暂无可玩作品');});
 $('refreshFeatured').addEventListener('click',()=>{featured.offset=(Number(featured.offset)||0)+3;featured();});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('gameSearch').focus();$('library').scrollIntoView({behavior:'smooth'});}});
 render();featured();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();