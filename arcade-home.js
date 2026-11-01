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
function navigate(g){state.recent=[g.id,...state.recent.filter(x=>x!==g.id)].slice(0,12);state.visits++;save();location.href=g.file;}
function playable(){return games.filter(g=>g.status==='playable');}
function card(g){
  const article=el('article','game-card');
  const cover=el('div','card-cover',g.icon);cover.style.setProperty('--glow',['#243c7c','#1f5670','#543a85','#28505f'][Math.abs(g.id.length*13)%4]);
  cover.setAttribute('aria-hidden','true');cover.append(el('span','tiny-status',g.revamped?'玩法重制':g.status==='playable'?'可探索':'待完善'));
  const b=el('div','game-body');b.append(el('h3','',g.name),el('p','',g.description));
  const end=el('div','game-bottom');end.append(el('span','category',label(g)));
  if(g.status==='playable'){const play=el('a','play-link','开始挑战 ↗');play.href=g.file;play.setAttribute('aria-label','开始'+g.name);play.addEventListener('click',e=>{e.preventDefault();navigate(g);});end.append(play);}
  else end.append(el('span','preview-message','暂不作为正式游戏'));
  b.append(end);article.append(cover,b);
  const fav=el('button','heart'+(state.favorites.has(g.id)?' active':''),state.favorites.has(g.id)?'♥':'♡');fav.type='button';fav.setAttribute('aria-label',(state.favorites.has(g.id)?'取消收藏':'收藏')+g.name);fav.addEventListener('click',()=>{state.favorites.has(g.id)?state.favorites.delete(g.id):state.favorites.add(g.id);save();render();});article.append(fav);
  return article;
}
function render(){
 $('readyCount').textContent=playable().length;$('previewCount').textContent=games.filter(g=>g.status!=='playable').length;$('revampedCount').textContent=games.filter(g=>g.revamped).length;$('playedCount').textContent=state.visits;$('favoriteCount').textContent=state.favorites.size;
 const term=state.search.toLocaleLowerCase();let list=games.filter(g=>(state.view==='all'||(state.view==='favorites'&&state.favorites.has(g.id))||(state.view==='prototype'&&g.status!=='playable')||(state.view==='playable'&&g.status==='playable'))&&(state.category==='all'||g.category===state.category)&&(!term||[g.name,g.description,...g.tags].join(' ').toLocaleLowerCase().includes(term)));
 if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hans-CN'));else if(state.sort==='recent')list.sort((a,b)=>{const ia=state.recent.indexOf(a.id),ib=state.recent.indexOf(b.id);return (ia<0?999:ia)-(ib<0?999:ib)});else list.sort((a,b)=>Number(b.revamped)-Number(a.revamped)||Number(b.featured)-Number(a.featured)||a.name.localeCompare(b.name,'zh-Hans-CN'));
 $('gamesGrid').replaceChildren(...list.map(card));$('emptyState').hidden=list.length!==0;$('resultSummary').textContent='找到 '+list.length+' 款作品 · '+(state.view==='playable'?'可玩目录':state.view==='prototype'?'研发清单':state.view==='favorites'?'我的收藏':'全部作品');
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);b.setAttribute('aria-pressed',String(b.dataset.view===state.view));});
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===state.category);b.setAttribute('aria-pressed',String(b.dataset.category===state.category));});
}
function featured(){
 const list=playable();const pool=[...list.filter(x=>x.revamped),...list.filter(x=>x.featured&&!x.revamped),...list.filter(x=>!x.featured&&!x.revamped)];const offset=Number(featured.offset)||0;const picks=Array.from({length:Math.min(3,pool.length)},(_,i)=>pool[(offset+i)%pool.length]);const box=$('spotlightGrid');box.replaceChildren(...picks.map((g,i)=>{const a=el('a','feature');a.href=g.file;a.addEventListener('click',e=>{e.preventDefault();navigate(g);});const tag=el('span','label',g.revamped?'REBUILT / PLAY NOW':'PICK 0'+(i+1));const icon=el('span','feature-icon',g.icon);icon.setAttribute('aria-hidden','true');a.append(tag,icon,el('h3','',g.name),el('p','',g.description),el('span','feature-bottom','立即开玩 ↗'));return a;}));
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