/* VECTOR RUN visual regression artifacts: real WebGL, mobile ACE, software fallback.
 * Technically validates non-blank rendering and usable controls; screenshots are
 * retained for visual review, not treated as subjective proof of art quality.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=path.join(__dirname,'../artifacts/vector-visual');
fs.mkdirSync(out,{recursive:true});
const endpoint='http://127.0.0.1:4173/vector-run.html';
async function visualAudit(page,label,mode='standard'){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(endpoint,{waitUntil:'domcontentloaded'});
 if(mode!=='standard')await page.locator('[data-flight-mode="'+mode+'"]').click();
 if(mode==='ace')assert.equal(await page.locator('#lifeValue').textContent(),'03 / 03');
 await page.locator('#startBtn').click();
 await page.waitForTimeout(1400);
 const canvas=page.locator('#vectorView');
 assert.equal(await canvas.getAttribute('data-phase'),'running');
 const sample=await canvas.evaluate(c=>{
  const cv=document.createElement('canvas');cv.width=64;cv.height=40;
  const ctx=cv.getContext('2d');ctx.drawImage(c,0,0,64,40);
  const d=ctx.getImageData(0,0,64,40).data,colors=new Set();
  for(let i=0;i<d.length;i+=4)colors.add([d[i]>>4,d[i+1]>>4,d[i+2]>>4].join(','));
  return {colors:colors.size,width:c.width,height:c.height};
 });
 assert.ok(sample.colors>=4,label+' should render non-flat content: '+JSON.stringify(sample));
 // The earlier screenshot test would pass even with a completely missing ship:
 // rails and stars alone already satisfy a non-uniform canvas.
 const foreground=await canvas.evaluate(c=>{
  const probe=document.createElement('canvas');probe.width=120;probe.height=75;
  const ctx=probe.getContext('2d');ctx.drawImage(c,0,0,120,75);
  const pixels=ctx.getImageData(0,0,120,75).data;
  let hull=0;
  for(let y=30;y<62;y++)for(let x=24;x<96;x++){
   const i=(y*120+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
   if(g>140&&b>130&&g>r*1.2)hull++;
  }
  return hull;
 });
 assert.ok(foreground>=65,label+' must show a substantial visible cyan starfighter silhouette, got '+foreground);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,label+' should not overflow horizontally');
 await page.locator('#viewport').screenshot({path:path.join(out,label+'.png')});
 assert.deepEqual(errors,[],label+' browser errors');
 console.log(label,JSON.stringify({sample,renderer:await page.locator('#rendererText').textContent()}));
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  await visualAudit(await browser.newPage({viewport:{width:1280,height:900}}),'webgl-desktop');
  await visualAudit(await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),'mobile-ace','ace');
  const fallback=await browser.newPage({viewport:{width:1100,height:780}});
  await fallback.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...rest){
    if(type==='webgl'||type==='experimental-webgl')return null;
    return original.call(this,type,...rest);
   };
  });
  await visualAudit(fallback,'software-perspective');
  assert.match(await fallback.locator('#rendererText').textContent(),/SOFTWARE/);
  assert.equal(await fallback.locator('#fallbackNotice').isVisible(),true);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
