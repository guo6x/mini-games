const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1200,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/hyperfold.html');await page.waitForSelector('#field');
assert.equal(await page.locator('#position').textContent(),'X0 Y2 Z0 W0');
await page.locator('[data-axis="0"][data-sign="1"]').click();assert.equal(await page.locator('#position').textContent(),'X1 Y2 Z0 W0');
await page.locator('[data-axis="0"][data-sign="1"]').click();assert.equal(await page.locator('#position').textContent(),'X1 Y2 Z0 W0','wall must block');
await page.locator('[data-axis="3"][data-sign="1"]').click();assert.equal(await page.locator('#position').textContent(),'X1 Y2 Z0 W1');
await page.locator('#undo').click();assert.equal(await page.locator('#position').textContent(),'X1 Y2 Z0 W0');
await page.locator('#reset').click();
const colors=await page.locator('#field').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let set=new Set();for(let i=0;i<d.length;i+=200)set.add(d[i]+','+d[i+1]+','+d[i+2]);return set.size;});assert.ok(colors>=5,'render must not be blank');
const route=await page.evaluate(()=>HyperfoldCore.solve(0));for(const [a,s] of route)await page.locator('[data-axis="'+a+'"][data-sign="'+s+'"]').click();
assert.equal(await page.locator('#win').isVisible(),true);await page.locator('#continue').click();assert.match(await page.locator('#levelNum').textContent(),/02/);
const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:4173/hyperfold.html');await mobile.locator('[data-axis="3"][data-sign="1"]').tap();assert.equal(await mobile.locator('#position').textContent(),'X0 Y2 Z0 W1');const overflow=await mobile.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));assert.ok(overflow<=20,'mobile overflow '+overflow);assert.deepEqual(errors,[]);console.log('HYPERFOLD desktop + mobile + real full-level UI completion passed');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});