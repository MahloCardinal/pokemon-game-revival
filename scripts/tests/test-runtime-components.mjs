import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildRuntimeComponents} from '../runtime-components.mjs';
import {BattleManager} from '../../app/engine/battle-manager.js';
import {Pokemon} from '../../app/engine/pokemon.js';
import {Team} from '../../app/engine/team.js';
import {createMove} from '../../app/engine/moves.js';
import {tackle} from '../../app/data/moves.js';
import {serializeBattleManager} from '../../app/engine/battle-runtime.js';
import {createRngState} from '../../app/engine/deterministic-rng.js';
const root=resolve(import.meta.dirname, "../..");
const manifest=JSON.parse(readFileSync(join(root,'supabase/functions/_shared/game-runtime/manifest.json')));
const files=manifest.files.map(f=>({...f,content:readFileSync(join(root,f.source),'utf8')}));
const baseline=buildRuntimeComponents(files);
const cases=[
 ['app/data/capture-zones.js','common: 190','common: 191',['capture']],
 ['app/data/capture-zones.js','common: 1000','common: 1001',['encounters']],
 ['app/data/progression.js','SHINY_ODDS_DENOMINATOR = 8000','SHINY_ODDS_DENOMINATOR = 8001',['encounters']],
 ['app/data/items.js','value: 1.3','value: 1.4',['capture']],
 ['app/engine/held-items.js','function heldItemCacheKey','// bugfix\nfunction heldItemCacheKey',['held_items']],
 ['app/data/moves.js','function buildMoveLibrary','// bugfix\nfunction buildMoveLibrary',['move_effects']]
];
for(const [path,before,after,expected]of cases){
 const source=files.find(f=>f.source===path);assert.ok(source.content.includes(before));
 const updated=buildRuntimeComponents(files.map(f=>f.source===path?{...f,content:f.content.replace(before,after)}:f));
 assert.deepEqual(Object.keys(updated).filter(key=>updated[key].checksum!==baseline[key].checksum).sort(),expected.sort(),path);
}
const presentation=buildRuntimeComponents([...files,{source:'app/i18n/it/test.js',content:'export const text="changed";'}]);
assert.deepEqual(Object.keys(presentation).filter(key=>presentation[key].checksum!==baseline[key].checksum),['presentation']);
const pokemon=new Pokemon({speciesKey:'1',name:'Fixture',ndex:1,level:10,type:['grass'],maxHp:100,moves:[createMove(tackle,{power:20,stats:5})]});
const manager=new BattleManager(new Team('Player',[pokemon]),new Team('NPC',[pokemon]));
const active=manager.playerTeam.getActive();active.pendingMove=active.pokemon.moves[0];active.hp=37;active.trappedTurns=2;active._focusBandCharges=1;
const snapshot=serializeBattleManager(manager,createRngState(123),{playerItems:[[103,2]]});
// A pre-update snapshot may still contain obsolete catalog metadata.
snapshot.playerTeam.pokemon[0].moves[0].state.bindTurns=3;
const temporaryRoot=resolve(tmpdir());const fixture=mkdtempSync(join(temporaryRoot,'revival-live-rules-'));
try{
 for(const file of files){let content=file.content;
  if(file.source==='app/data/moves.js')content=content.replace('library.push(Object.freeze(definition));',`if(key==='tackle'){definition.bindTurns=99;definition.effect_before=function(){this.runtimeBugFix=true;};}\n    library.push(Object.freeze(definition));`);
  const path=join(fixture,file.source);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);
 }
 const runtime=await import(pathToFileURL(join(fixture,'app/engine/battle-runtime.js')));
 const restored=runtime.restoreBattleManager(snapshot);const combatant=restored.manager.playerTeam.getActive();
 assert.equal(combatant.pendingMove,combatant.pokemon.moves[0]);
 assert.equal(combatant.pendingMove.bindTurns,99,'Charged move loads updated metadata');
 combatant.pendingMove.before();assert.equal(combatant.pendingMove.runtimeBugFix,true,'Charged move executes updated effect');
 assert.equal(combatant.hp,37);assert.equal(combatant.trappedTurns,2);assert.equal(combatant._focusBandCharges,1);
 assert.deepEqual(restored.playerItems,[[103,2]]);assert.deepEqual(restored.rngState,snapshot.rng);
 assert.equal(snapshot.playerTeam.pokemon[0].moves[0].state.bindTurns,3,'Restore must not rewrite the input snapshot');
}finally{const path=relative(temporaryRoot,resolve(fixture));assert.ok(path&&!path.startsWith('..'));rmSync(fixture,{recursive:true,force:true});}
console.log('Runtime components: independent hashes, charged move hot update, HP/status/charges, inventory and RNG preserved.');
