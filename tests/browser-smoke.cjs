const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.game-card').count(),36);
  await page.locator('[data-view="prototype"]').click();
  assert.equal(await page.locator('.game-card').count(),21);
  await page.locator('[data-view="playable"]').click();
  await page.locator('#gameSearch').fill('赛车');
  assert.equal(await page.locator('.game-card').count(),1);
  for(const id of ['racing','platformer','tower-defense','match3','maze-runner']){
   await page.goto('http://127.0.0.1:4173/'+id+'.html',{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('canvas#stage').count(),1);
   await page.locator('#startBtn').click();
   await page.waitForTimeout(400);
   assert.equal(await page.locator('#overlay').isHidden(),true);
   assert.equal(await page.locator('#statusPill').textContent(),'进行中');
   await page.keyboard.press('ArrowRight');
   if(id==='tower-defense'||id==='match3')await page.locator('canvas#stage').click({position:{x:260,y:180}});
   await page.locator('#pauseBtn').click();
   assert.equal(await page.locator('#statusPill').textContent(),'已暂停');
   await page.locator('#pauseBtn').click();
   await page.locator('#resetBtn').click();
  }
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  assert.equal(await mobile.locator('#surprise').count(),1);
  await mobile.goto('http://127.0.0.1:4173/racing.html',{waitUntil:'networkidle'});
  await mobile.locator('#startBtn').click();
  await mobile.locator('[data-key="ArrowRight"]').tap();
  assert.equal(await mobile.locator('#stage').count(),1);
  assert.deepEqual(errors,[],'Page errors: '+errors.join('\n'));
  console.log('Browser smoke passed: hub, 5 games, mobile touch.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
