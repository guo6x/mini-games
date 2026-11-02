// Focused rule regressions for the upgraded game families.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1024,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function start(id){await page.goto('http://127.0.0.1:4173/'+id+'.html');await page.locator('#startBtn').click();}
 async function tap(x,y){const c=page.locator('#stage'),b=await c.boundingBox();await c.click({position:{x:x*b.width/800,y:y*b.height/500}});}
 await start('minesweeper');await tap(106,86);assert.ok(Number(await page.locator('#scoreValue').textContent())>0,'First mine click must be safe and reveal cells');
 await start('tic-tac-toe');await tap(275,137);assert.ok((await page.locator('#levelValue').textContent()).length>0);
 await start('sudoku');await tap(180,92);await page.keyboard.press('Digit5');assert.ok((await page.locator('#levelValue').textContent()).includes('EMPTY'));
 await start('snake');await page.keyboard.press('ArrowDown');assert.ok((await page.locator('#levelValue').textContent()).length>0);
 await start('typing-game');await page.locator('#kineticTyping').fill('rocket');await page.locator('#kineticTyping').press('Enter');
 await start('word-chain');await tap(260,281);assert.ok((await page.locator('#levelValue').textContent()).length>0);
 await start('tower-defense');await tap(80,80);assert.match(await page.locator('#liveFeedback').textContent(),/部署完成/);
 await start('racing');await page.waitForTimeout(500);assert.ok(Number(await page.locator('#scoreValue').textContent())>0);
 await start('reversi');await tap(323,223);assert.ok(Number(await page.locator('#scoreValue').textContent())>=40);
 await start('sokoban');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#levelValue').textContent(),'LEVEL 2');
 assert.deepEqual(errors,[],'Page errors: '+errors.join('\n'));
 console.log('Cross-family rule smoke passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
