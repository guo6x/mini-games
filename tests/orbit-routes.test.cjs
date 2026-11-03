const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../orbit-routes-core.js');
function solveCurrent(game){
 const level=Core.LEVELS[game.stage];
 for(let color=0;color<level.routes.length;color++){
  const route=level.routes[color];assert.equal(game.select(color,route[0]),true);
  for(const cell of route.slice(1))assert.equal(game.step(cell),true,'route '+color+' cell '+cell);
  assert.equal(game.connected(color),true);
 }
 assert.equal(game.progress.coverage,game.size*game.size);
 assert.equal(game.solved,true);
 assert.equal(game.active,null);
}
test('all five hand-designed solutions are legal, connected, non-crossing and cover every cell',()=>{
 const g=new Core();for(let level=0;level<Core.LEVELS.length;level++){
  assert.equal(g.stage,level);
  assert.equal(Core.verifyLevel(Core.LEVELS[level]),true);
  solveCurrent(g);assert.equal(g.advance(),true);
 }
 assert.equal(g.completed,true);
 assert.equal(g.advance(),false);
});
test('paths cannot jump, cross another colour or steal its endpoint',()=>{
 const g=new Core();
 assert.equal(g.select(0,5),true);
 assert.equal(g.step(0),false,'diagonal not allowed');
 assert.equal(g.step(1),true);
 assert.equal(g.step(12),false,'long jump not allowed');
 assert.equal(g.step(15),false,'other pair terminal forbidden');
 assert.equal(g.select(1,12),true);
 assert.equal(g.step(8),false,'different route terminal forbidden');
 assert.equal(g.step(13),true);
 assert.equal(g.step(9),true);
 assert.equal(g.select(0,5),true);
 assert.equal(g.step(1),true);
 assert.equal(g.step(0),true);
 assert.equal(g.step(4),true);
 assert.equal(g.step(8),true);
 assert.equal(g.select(1,12),true);
 assert.equal(g.step(8),false,'cannot occupy completed green route');
});
test('backtrack, explicit undo and clear restore a consistent exact game state',()=>{
 const g=new Core();
 g.select(0,5);g.step(1);g.step(0);
 assert.equal(g.progress.coverage,3);
 assert.equal(g.step(1),true,'stepping to immediate predecessor backtracks');
 assert.deepEqual(g.paths[0],[5,1]);
 assert.equal(g.undo(),true);
 assert.deepEqual(g.paths[0],[5,1,0]);
 assert.equal(g.clear(),true);
 assert.deepEqual(g.paths[0],[]);
 assert.equal(g.active,null);
 assert.equal(g.undo(),true);
 assert.deepEqual(g.paths[0],[5,1,0]);
 assert.equal(g.active,0);
});
test('hint reveals an authored route temporarily without completing puzzle or inflating progress',()=>{
 const g=new Core();const before=g.progress.coverage;
 const h=g.hint();assert.equal(h.color,0);
 assert.deepEqual(h.route,Core.LEVELS[0].routes[0]);
 assert.equal(g.hints,1);assert.equal(g.progress.coverage,before);
 assert.equal(g.hintTTL,4);g.tick(5);assert.equal(g.hintTTL,0);
 solveCurrent(g);assert.equal(g.hint(),null);
});
test('playing from reversed terminal is legal and cannot artificially claim a solved board',()=>{
 const g=new Core();const r=Core.LEVELS[0].routes[0];
 assert.equal(g.select(0,r.at(-1)),true);
 for(const i of [...r].reverse().slice(1))assert.equal(g.step(i),true);
 assert.equal(g.connected(0),true);
 assert.equal(g.solved,false,'other pairs still missing');
 assert.equal(g.coverage(),r.length);
 assert.equal(g.select(0,r[0]),true,'selection of completed colour is allowed to redraw'); 
 assert.equal(g.connected(0),false,'redrawn path is not immediately complete');
});
test('invalid authored puzzle with crossing, gaps or unfilled space is rejected',()=>{
 assert.throws(()=>Core.verifyLevel({size:4,routes:[[0,1,2],[2,3],[4,5,6]]}),/route|crossing|uncovered/);
 assert.throws(()=>Core.verifyLevel({size:4,routes:[[0,6,7],[1,2,3],[4,5,9]]}),/non-adjacent|uncovered/);
});
