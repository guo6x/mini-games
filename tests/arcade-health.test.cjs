const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
const sandbox={};vm.runInNewContext(read('games-data.js')+'\n;globalThis.games=GAMES_DATA;',sandbox);
const games=sandbox.games;
test('catalog is exactly the game HTML pages, with no missing links or duplicates',()=>{
 const pages=fs.readdirSync(root).filter(s=>s.endsWith('.html')&&!['index.html','game-template.html'].includes(s)).sort();
 const catalog=games.map(g=>g.file).sort();
 assert.equal(pages.length,57);assert.deepEqual(catalog,pages);
 assert.equal(new Set(catalog).size,catalog.length);
});
test('catalog statuses reflect the static placeholder audit',()=>{
 assert.equal(games.filter(g=>g.status==='prototype').length,21);
 assert.equal(games.filter(g=>g.status==='playable').length,36);
 for(const g of games){assert.ok(['playable','prototype'].includes(g.status));assert.ok(g.id);assert.ok(g.name);assert.ok(g.icon)}
});
test('all rebuilt games are wired to a canvas and common gameplay engine',()=>{
 const ids=['racing','platformer','tower-defense','match3','maze-runner'];
 for(const id of ids){
 const g=games.find(x=>x.id===id);
 assert.equal(g.revamped,true);assert.equal(g.status,'playable');
 const page=read(id+'.html');
 assert.match(page,new RegExp('data-game="'+id+'"'));
 assert.match(page,/id="stage"/);assert.match(page,/arcade-play\.js/);
 assert.doesNotMatch(page,/模拟游戏逻辑|游戏特定逻辑可以在这里添加/);
 }
 for(const id of ['index.html','arcade-home.js','arcade-home.css','arcade-play.js','arcade-play.css'])assert.ok(fs.existsSync(path.join(root,id)));
});
test('pages have no duplicate declared catalogue game IDs',()=>{assert.equal(new Set(games.map(g=>g.id)).size,games.length)});
