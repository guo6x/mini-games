/* STAR ROUTES visual and true browser interaction regression.
 * The pilot uses genuine mouse/touch events; no direct mutation of game state.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../artifacts/routes-visual');fs.mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:4173/connect-dots.html';
function loc(cell,n){
 const size=n===4?78:n===5?67:56,x=n===4?113:n===5?109:111,y=n===4?93:n===5?89:88;
 return{x:x+(cell%n+.5)*size,y:y+(Math.floor(cell/n)+.5)*size};
}
async function tap(page,cell,n){
 const pt=loc(cell,n),canvas=page.locator('#stage'),r=await canvas.boundingBox();
 await canvas.click({position:{x:pt.x*r.width/800,y:pt.y*r.height/500},timeout:15000});
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1250,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  assert.match(await page.locator('#gameName').textContent(),/STAR ROUTES/);
  await page.locator('#startBtn').click();
  const canvas=page.locator('#stage');
  const levels=await page.evaluate(()=>window.OrbitRoutesCore.LEVELS.map(l=>({size:l.size,routes:l.routes})));
  // Validate rejection by physical UI, without calling gameplay internals.
  await tap(page,levels[0].routes[0][0],4);
  await tap(page,0,4);assert.equal(await canvas.getAttribute('data-route-coverage'),'1','diagonal jump must not count');
  await page.keyboard.press('KeyZ');
  for(let stage=0;stage<levels.length;stage++){
   const l=levels[stage];
   for(const r of l.routes){
    for(const cell of r)await tap(page,cell,l.size);
   }
   assert.equal(await canvas.getAttribute('data-route-stage'),String(stage+1));
   assert.equal(await canvas.getAttribute('data-route-solved'),'true','full-cover puzzle '+(stage+1));
   assert.equal(Number(await canvas.getAttribute('data-route-coverage')),l.size*l.size);
   assert.equal(Number(await canvas.getAttribute('data-route-pairs')),l.routes.length);
   if(stage===0)await page.locator('#stage').screenshot({path:path.join(out,'desktop-solved.png')});
   if(stage<levels.length-1){
    const r=await canvas.boundingBox();
    await canvas.click({position:{x:640*r.width/800,y:419*r.height/500}});
   }
  }
  const r=await canvas.boundingBox();
  await canvas.click({position:{x:640*r.width/800,y:419*r.height/500}});
  assert.equal(await page.locator('#overlay').isVisible(),true);
  assert.match(await page.locator('#overlayTitle').textContent(),/五图全线连通/);
  assert.ok(Number(await page.locator('#scoreValue').textContent())>1000);
  assert.deepEqual(errors,[]);
  // A real mobile drag should connect an endpoint through multiple cells.
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errs=[];mobile.on('pageerror',e=>errs.push(e.message));
  await mobile.goto(url,{waitUntil:'domcontentloaded'});
  await mobile.locator('#startBtn').click();
  const cv=mobile.locator('#stage');await cv.scrollIntoViewIfNeeded();
  const box=await cv.boundingBox();
  const pos=cell=>{const p=loc(cell,4);return{x:box.x+p.x*box.width/800,y:box.y+p.y*box.height/500};};
  const touch=await mobile.context().newCDPSession(mobile);
  const cells=levels[0].routes[0];
  const first=pos(cells[0]);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:first.x,y:first.y,id:9}]});
  for(const cell of cells.slice(1)){
   const p=pos(cell);await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y,id:9}]});
   await mobile.waitForTimeout(22);
  }
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(Number(await cv.getAttribute('data-route-pairs')),1);
  assert.equal(Number(await cv.getAttribute('data-route-coverage')),5);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await cv.screenshot({path:path.join(out,'mobile-drag.png')});
  assert.deepEqual(errs,[]);
  await touch.detach();
  console.log('STAR ROUTES complete 5-level browser pilot and mobile drag: PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
