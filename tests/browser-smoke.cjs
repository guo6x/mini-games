const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const vmContext={};vm.runInNewContext(fs.readFileSync('games-data.js','utf8')+'\n;globalThis.items=GAMES_DATA;',vmContext);const games=Array.from(vmContext.items);
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const errors=[];
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:960}});
 desktop.on('pageerror',e=>errors.push('desktop: '+e.message));
 await desktop.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('.game-card').count(),57);
 await desktop.locator('#gameSearch').fill('赛车');assert.equal(await desktop.locator('.game-card').count(),1);
 for(const g of games){
  await desktop.goto('http://127.0.0.1:4173/'+g.file,{waitUntil:'domcontentloaded'});
  assert.equal(await desktop.locator('#stage').count(),1,'Missing stage '+g.id);
  await desktop.locator('#startBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'进行中','Start '+g.id);
  await desktop.keyboard.press('ArrowRight');
  await desktop.locator('#pauseBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'已暂停','Pause '+g.id);
  await desktop.locator('#pauseBtn').click();
  await desktop.locator('#resetBtn').click();
  assert.equal(await desktop.locator('#statusPill').textContent(),'进行中','Reset '+g.id);
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
 for(const g of games){
  await mobile.goto('http://127.0.0.1:4173/'+g.file,{waitUntil:'domcontentloaded'});
  await mobile.locator('#startBtn').tap();
  assert.equal(await mobile.locator('#statusPill').textContent(),'进行中','Mobile start '+g.id);
  assert.ok(await mobile.locator('#stage').isVisible(),'Stage hidden '+g.id);
  await mobile.locator('[data-key="ArrowRight"]').tap();
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
