/* Guided end-to-end playthrough: real DOM input, real simulation and final victory.
 * The pilot reads the public aim hint coordinates shown in the HUD, never mutates
 * the simulation or bypasses collisions. Virtual clock makes 12 gates affordable in CI.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
  await page.clock.install();
  await page.goto('http://127.0.0.1:4173/vector-run.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#vectorView').count(),1);
  await page.locator('[data-flight-mode="ace"]').click();
  assert.equal(await page.locator('#lifeValue').textContent(),'03 / 03');
  assert.equal(await page.locator('[data-flight-mode="ace"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-flight-mode="training"]').click();
  assert.equal(await page.locator('#lifeValue').textContent(),'05 / 05');
  await page.locator('#startBtn').click();
  const canvas=page.locator('#vectorView');
  assert.equal(await canvas.getAttribute('data-phase'),'running');

  const pixels=await canvas.evaluate(async c=>{
   const img=new Image();img.src=c.toDataURL('image/png');await img.decode();
   const out=document.createElement('canvas');out.width=48;out.height=32;
   const cx=out.getContext('2d');cx.drawImage(img,0,0,48,32);
   const data=cx.getImageData(0,0,48,32).data,colors=new Set();
   for(let i=0;i<data.length;i+=4)colors.add([data[i]>>4,data[i+1]>>4,data[i+2]>>4].join(':'));
   return colors.size;
  });
  assert.ok(pixels>=3,'3D renderer must produce a non-uniform rendered frame, distinct colors='+pixels);

  const box=await canvas.boundingBox();
  const worldPoint=(x,y)=>({
   x:box.x+box.width*(.5+x/8.8),
   y:box.y+box.height*(.5-y/5.7)
  });
  const center=worldPoint(0,0);
  await page.mouse.move(center.x,center.y);
  await page.mouse.down();
  let final='running',steps=0,maximum=320;
  let lastGate=0;
  for(;steps<maximum;steps++){
   const data=await canvas.evaluate(c=>({
    phase:c.dataset.phase,
    x:Number(c.dataset.nextX),y:Number(c.dataset.nextY),
    next:c.dataset.nextX!==undefined,
    resolved:Number(c.dataset.gates),passed:Number(c.dataset.passes),
    misses:Number(c.dataset.misses)
   }));
   final=data.phase;
   if(final!=='running')break;
   if(data.next&&Number.isFinite(data.x)&&Number.isFinite(data.y)){
    const target=worldPoint(data.x,data.y);
    await page.mouse.move(target.x,target.y,{steps:2});
   }
   await page.clock.runFor(200);
   if(data.resolved>lastGate)lastGate=data.resolved;
  }
  await page.mouse.up();
  const result=await canvas.evaluate(c=>({state:c.dataset.phase,checked:Number(c.dataset.gates),
   passed:Number(c.dataset.passes),missed:Number(c.dataset.misses)}));
  assert.equal(result.state,'won','A guided honest UI pilot should finish the real 12-gate campaign: '+JSON.stringify({result,steps}));
  assert.equal(result.checked,12);
  const bullseyes=Number(await canvas.getAttribute('data-bullseyes'));
  assert.ok(bullseyes>=1,'guided true-center flight should earn at least one precision gate');
  assert.equal(await page.locator('#bullseyeValue').textContent(),String(bullseyes).padStart(2,'0'));
  assert.equal(Number(await page.evaluate(()=>localStorage.getItem('orbit-vector-best-training'))),Number(await page.locator('#scoreValue').textContent()));
  assert.ok(result.passed>=8,'At least eight gates must be passed without collision');
  assert.equal(await page.locator('#overlay').isVisible(),true);
  assert.match(await page.locator('#overlayTitle').textContent(),/成功突破/);
  assert.match(await page.locator('#overlayText').textContent(),/精准/);
  assert.deepEqual(errors,[]);
  const mobile=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  await mobile.goto('http://127.0.0.1:4173/vector-run.html',{waitUntil:'domcontentloaded'});
  await mobile.locator('[data-flight-mode="ace"]').click();
  assert.equal(await mobile.locator('#lifeValue').textContent(),'03 / 03');
  await mobile.locator('#startBtn').click();
  assert.equal(await mobile.locator('#vectorView').getAttribute('data-phase'),'running');
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no mobile horizontal overflow');
  await mobile.close();
  console.log('VECTOR RUN guided browser playthrough success:',JSON.stringify({result,steps,renderer:await page.locator('#rendererText').textContent(),colors:pixels}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});