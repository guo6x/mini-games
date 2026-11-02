const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const state={};vm.runInNewContext(read('games-data.js')+'\n;globalThis.games=GAMES_DATA',state);const games=Array.from(state.games);
const newGroups={"arcade-cortex.js":["2048","card-memory","memory-game","color-match","connect-dots","hangman","minesweeper","number-memory","puzzle","sliding-puzzle","spot-difference","sudoku"],"arcade-kinetic.js":["brick-breaker","flappy-bird","music-rhythm","pac-man","plane-combat","pong","reaction-test","snake","space-invaders","space-shooter","tetris","time-guardian","typing-game"],"arcade-strategy.js":["checkers","cooking","farm","gomoku","tic-tac-toe","word-chain"]};
test('exactly 58 unique concrete game pages and all catalog statuses are playable',()=>{
 const pages=fs.readdirSync(root).filter(x=>x.endsWith('.html')&&!['index.html','game-template.html'].includes(x)).sort();
 assert.equal(pages.length,58);assert.deepEqual(games.map(x=>x.file).sort(),pages);
 assert.equal(new Set(games.map(x=>x.id)).size,58);
 assert.equal(games.filter(x=>x.status==='playable').length,58);
});
test('31 newly rewritten games are distinct, catalogued, and loaded with the right module',()=>{
 const fresh=Object.values(newGroups).flat();assert.equal(fresh.length,31);assert.equal(new Set(fresh).size,31);
 for(const [module,ids] of Object.entries(newGroups)){assert.ok(fs.existsSync(path.join(root,module)));
  const content=read(module);assert.match(content,/ORBIT_/);
  for(const id of ids){assert.ok(content.includes("'"+id+"'")||content.includes(id+':'));const g=games.find(x=>x.id===id);assert.equal(g.revamped,true);assert.equal(g.edition,id==='space-shooter'?'flagship-v1':'unified-v3');const page=read(id+'.html');assert.match(page,new RegExp('data-game="'+id+'"'));if(id!=='space-shooter')assert.ok(page.indexOf(module)>0&&page.indexOf(module)<page.indexOf('arcade-play.js'));else assert.ok(page.includes('orbit-nebula-core.js')&&page.includes('orbit-nebula-strike.js'));assert.doesNotMatch(page,/模拟游戏逻辑|游戏特定逻辑可以在这里添加/);}
 }
});
test('all original 57 pages keep legacy shell, and new 3D uses dedicated shell',()=>{
 for(const g of games.filter(g=>g.dimension==='2d')){const page=read(g.file);for(const s of ['id="stage"','id="startBtn"','id="pauseBtn"','id="resetBtn"','aria-label="游戏主画面"'])assert.ok(page.includes(s),g.id+' missing '+s);assert.ok(page.includes('arcade-play.js'));}
});
test('all static assets and stage modules exist',()=>{for(const x of ['arcade-home.js','arcade-home.css','arcade-play.js','arcade-play.css','arcade-extra.js','arcade-more.js','arcade-final.js','arcade-completion.js',...Object.keys(newGroups)])assert.ok(fs.existsSync(path.join(root,x)),x);});

test('editorial tiers remain honest for all 58 playable games',()=>{
 const picks=games.filter(g=>g.qualityTier==='candidate');
 const lab=games.filter(g=>g.qualityTier==='lab');
 const other=games.filter(g=>g.qualityTier==='standard');
 assert.equal(picks.length,10);assert.equal(lab.length,18);assert.equal(other.length,30);
 for(const g of games){
  assert.ok(['2d','3d'].includes(g.dimension));
  assert.equal(g.featured,g.qualityTier==='candidate');
  assert.ok(['candidate','standard','lab'].includes(g.qualityTier));
  if(g.qualityTier==='lab')assert.ok(g.qualityNote&&g.qualityNote.length>8);
  assert.ok(fs.existsSync(path.join(root,g.file)));
 }
 assert.ok(fs.existsSync(path.join(root,'docs/QUALITY_ROADMAP.md')));
});
test('crossword letter modes cannot be swallowed by restart/pause shortcuts',()=>{
 const source=read('arcade-play.js');
 assert.match(source,/\['hangman','crossword'\]\.includes\(MODE\)/);
});

test('2D flagship has original rules/renderer scripts and remains one of ten candidates',()=>{
 const g=games.find(g=>g.id==='space-shooter');
 assert.equal(g.qualityTier,'candidate');assert.equal(g.edition,'flagship-v1');
 assert.equal(g.dimension,'2d');
 assert.equal(games.filter(g=>g.qualityTier==='candidate').length,10);
 const s=read('space-shooter.html');
 for(const p of ['orbit-nebula-core.js','orbit-nebula-strike.js','arcade-play.js'])assert.ok(s.includes(p),p);
 assert.ok(s.indexOf('orbit-nebula-core.js')<s.indexOf('orbit-nebula-strike.js'));
 assert.ok(s.indexOf('orbit-nebula-strike.js')<s.indexOf('arcade-play.js'));
 assert.ok(!s.includes('arcade-kinetic.js'));
 assert.ok(fs.existsSync(path.join(root,'tests/nebula-strike.test.cjs')));
});

test('3D flight has a real independent renderer, simulation, lab disclosure and assets',()=>{
 const g=games.find(g=>g.id==='vector-run');
 assert.equal(g.dimension,'3d');assert.equal(g.status,'playable');
 assert.equal(g.qualityTier,'lab');assert.equal(g.edition,'experimental-3d-v1');
 assert.equal(games.filter(g=>g.dimension==='3d').length,1);
 const html=read(g.file);
 for(const name of ['vectorView','vectorHud','pauseBtn','resetBtn','startBtn'])assert.ok(html.includes('id="'+name+'"'));
 for(const script of ['orbit-vector-core.js','orbit-vector-render.js','orbit-vector-game.js'])assert.ok(html.includes(script)&&fs.existsSync(path.join(root,script)));
 assert.ok(html.indexOf('orbit-vector-core.js')<html.indexOf('orbit-vector-render.js'));
 assert.ok(html.indexOf('orbit-vector-render.js')<html.indexOf('orbit-vector-game.js'));
 assert.ok(fs.existsSync(path.join(root,'tests/vector-run.test.cjs')));
});
