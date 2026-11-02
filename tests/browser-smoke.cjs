const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const vmContext={};vm.runInNewContext(fs.readFileSync('games-data.js','utf8')+'\n;globalThis.items=GAMES_DATA;',vmContext);const games=Array.from(vmContext.items);
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const errors=[];
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:960}});
 desktop.on('pageerror',e=>errors.push('desktop: '+e.message));
 await desktop.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 
 assert.equal(await desktop.locator('.game-card').count(),40,'Main catalog must avoid showing laboratory games');
 await desktop.locator('[data-view="lab"]').click();
 assert.equal(await desktop.locator('.game-card').count(),17,'17 lab games must remain reachable');
 assert.equal(await desktop.locator('.quality-note').count(),17,'Each lab game should declare its limitations');
 await desktop.locator('[data-view="all"]').click();
 assert.equal(await desktop.locator('.game-card').count(),57,'All 57 games remain browseable');
 await desktop.locator('[data-view="playable"]').click();

 assert.equal(await desktop.locator('canvas.game-poster').count(),40,'Curated homepage posters should render');
 const posterPixels=await desktop.locator('canvas.game-poster').first().evaluate(c=>{const d=c.getContext('2d').getImageData(15,20,1,1).data;return d[3]});
 assert.ok(posterPixels>0,'Poster canvas must actually draw pixels');
 await desktop.locator('#gameSearch').fill('赛车');assert.equal(await desktop.locator('.game-card').count(),1);
 for(const g of games){
  await desktop.goto('http://127.0.0.1:4173/'+g.file,{waitUntil:'domcontentloaded'});
  assert.equal(await desktop.locator('#stage').count(),1,'Missing stage '+g.id);
  assert.equal(await desktop.locator('#immersiveBtn').count(),1,'Missing fullscreen control '+g.id);
  await desktop.locator('#startBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'进行中','Start '+g.id);
  await desktop.keyboard.press('ArrowRight');
  await desktop.locator('#pauseBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'已暂停','Pause '+g.id);
  await desktop.locator('#pauseBtn').click();
  await desktop.locator('#resetBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'进行中','Reset '+g.id);
 }

 await desktop.goto('http://127.0.0.1:4173/crossword.html',{waitUntil:'domcontentloaded'});
 await desktop.locator('#startBtn').click();
 await desktop.keyboard.press('KeyR');
 await desktop.keyboard.press('KeyP');
 assert.equal(await desktop.locator('#statusPill').textContent(),'进行中','R/P typing must not restart or pause crossword');
 await desktop.goto('http://127.0.0.1:4173/music-rhythm.html',{waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('.lab-notice').count(),1,'Lab game must carry experimental status on its own page');
 
 await desktop.goto('http://127.0.0.1:4173/space-shooter.html',{waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('#gameName').textContent(),'NEBULA STRIKE · 星云突围');
 await desktop.locator('#startBtn').click();
 await desktop.keyboard.press('Space');
 await desktop.waitForTimeout(900);
 assert.equal(await desktop.locator('#statusPill').textContent(),'进行中');
 assert.ok((await desktop.locator('#levelValue').textContent()).includes('WAVE'));
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
 for(const g of games){
  await mobile.goto('http://127.0.0.1:4173/'+g.file,{waitUntil:'domcontentloaded'});
  await mobile.locator('#startBtn').tap();
  assert.equal(await mobile.locator('#statusPill').textContent(),'进行中','Mobile start '+g.id);
  assert.ok(await mobile.locator('#stage').isVisible(),'Stage hidden '+g.id);

  if(g.id==='space-shooter'){
   const c=mobile.locator('#stage'),b=await c.boundingBox();
   await mobile.mouse.move(b.x+b.width*.5,b.y+b.height*.75);
   await mobile.mouse.down();await mobile.mouse.move(b.x+b.width*.62,b.y+b.height*.60,{steps:5});await mobile.mouse.up();
   await mobile.locator('.touch-panel [data-key="Space"]').tap();
   assert.equal(await mobile.locator('#statusPill').textContent(),'进行中');
  }
  await mobile.locator('.touch-panel [data-key="ArrowRight"]').tap();
  await mobile.locator('#pauseBtn').tap();
  assert.equal(await mobile.locator('#statusPill').textContent(),'已暂停','Mobile pause '+g.id);
  await mobile.locator('#resetBtn').tap();
  assert.equal(await mobile.locator('#statusPill').textContent(),'进行中','Mobile reset '+g.id);
  const overflow=await mobile.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
  assert.ok(overflow<=20,'Horizontal overflow in '+g.id+': '+overflow+'px');
 }
 assert.deepEqual(errors,[],'Runtime JS errors: '+errors.join('\n'));
 console.log('57 games desktop/mobile launch, controls, pause, reset and overflow passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
