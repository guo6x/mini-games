// Diagnostics only: do not confuse "loads without an exception" with "fun and complete".
const {chromium}=require('playwright'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const data={};vm.runInNewContext(fs.readFileSync('games-data.js','utf8')+'\n;globalThis.items=GAMES_DATA;',data);
 const list=Array.from(data.items).filter(x=>!x.revamped);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 try{
 for(const g of list){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message.slice(0,180)));
  page.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url().split('/').pop())});
  let status='loaded';
  try{const r=await page.goto('http://127.0.0.1:4173/'+g.file,{waitUntil:'domcontentloaded',timeout:9000});if(!r||!r.ok())status='http-error';await page.waitForTimeout(220);}catch(e){status=e.message.slice(0,90)}
  const metrics=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),title:document.title.slice(0,80)})).catch(()=>({overflow:-1,title:''}));
  results.push({id:g.id,status:g.status,page:status,errors:[...new Set(errors)],missing:[...new Set(missing)],overflow:metrics.overflow,title:metrics.title});
  await page.close();
 }
 }finally{await browser.close()}
 console.log('LEGACY AUDIT SUMMARY '+JSON.stringify({count:results.length,pageErrors:results.filter(x=>x.errors.length).length,missingResources:results.filter(x=>x.missing.length).length,mobileOverflow:results.filter(x=>x.overflow>20).length}));
 for(const x of results.filter(x=>x.errors.length||x.missing.length||x.overflow>20))console.log('LEGACY AUDIT ISSUE '+JSON.stringify(x));
})();
