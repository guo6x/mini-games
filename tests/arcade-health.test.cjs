const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const state={};vm.runInNewContext(read('games-data.js')+'\n;globalThis.games=GAMES_DATA',state);const games=Array.from(state.games);
const newGroups={"arcade-cortex.js":["2048","card-memory","memory-game","color-match","connect-dots","hangman","minesweeper","number-memory","puzzle","sliding-puzzle","spot-difference","sudoku"],"arcade-kinetic.js":["brick-breaker","flappy-bird","music-rhythm","pac-man","plane-combat","pong","reaction-test","snake","space-invaders","space-shooter","tetris","time-guardian","typing-game"],"arcade-strategy.js":["checkers","cooking","farm","gomoku","tic-tac-toe","word-chain"]};
test('exactly 57 unique concrete game pages and all catalog statuses are playable',()=>{
 const pages=fs.readdirSync(root).filter(x=>x.endsWith('.html')&&!['index.html','game-template.html'].includes(x)).sort();
 assert.equal(pages.length,57);assert.deepEqual(games.map(x=>x.file).sort(),pages);
 assert.equal(new Set(games.map(x=>x.id)).size,57);
 assert.equal(games.filter(x=>x.status==='playable').length,57);
});
test('31 newly rewritten games are distinct, catalogued, and loaded with the right module',()=>{
 const fresh=Object.values(newGroups).flat();assert.equal(fresh.length,31);assert.equal(new Set(fresh).size,31);
 for(const [module,ids] of Object.entries(newGroups)){assert.ok(fs.existsSync(path.join(root,module)));
  const content=read(module);assert.match(content,/ORBIT_/);
  for(const id of ids){assert.ok(content.includes("'"+id+"'")||content.includes(id+':'));const g=games.find(x=>x.id===id);assert.equal(g.revamped,true);assert.equal(g.edition,'unified-v3');const page=read(id+'.html');assert.match(page,new RegExp('data-game="'+id+'"'));assert.ok(page.indexOf(module)>0&&page.indexOf(module)<page.indexOf('arcade-play.js'));assert.doesNotMatch(page,/模拟游戏逻辑|游戏特定逻辑可以在这里添加/);}
 }
});
test('all 57 pages share the stage, overlay, help, pause, reset and accessibility labels',()=>{
 for(const g of games){const page=read(g.file);for(const s of ['id="stage"','id="startBtn"','id="pauseBtn"','id="resetBtn"','aria-label="游戏主画面"'])assert.ok(page.includes(s),g.id+' missing '+s);assert.ok(page.includes('arcade-play.js'));}
});
test('all static assets and stage modules exist',()=>{for(const x of ['arcade-home.js','arcade-home.css','arcade-play.js','arcade-play.css','arcade-extra.js','arcade-more.js','arcade-final.js','arcade-completion.js',...Object.keys(newGroups)])assert.ok(fs.existsSync(path.join(root,x)),x);});
