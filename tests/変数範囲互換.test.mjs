import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareValidation,finishValidation} from '../変数整合性検証.js';
const fixture=()=>({世界:{地点:'峠',探索:{}},キャラ:{HP:40},任務:{リスト:{}},資産:{},関係リスト:{},システム状態:{},噂:{}});
const record=()=>({取引:[],変数変化:[],戦闘精算:[],根拠:[]});
const wrap=r=>'<Analysis>'+JSON.stringify(r)+'</Analysis>';
const commands=ps=>ps.map(p=>({reason:'json_patch',full_match:JSON.stringify(p)}));
function validate(b,a,r,ps=[]){return finishValidation(prepareValidation(b,commands(ps),wrap(r),'test:2'),a);}
test('world, quest, actor, asset and rumor changes use their actual paths',()=>{
 const b=fixture(),a=structuredClone(b),r=record();a.世界.探索.駅={説明:'駅前'};a.任務.リスト.護衛={状態:'完了'};a.キャラ.HP=35;a.資産.馬車={完全度:90};a.噂.話題='市';
 r.変数変化=[{対象パス:'/世界/探索/駅',終了値:{説明:'駅前'}},{対象パス:'/任務/リスト/護衛/状態',終了値:'完了'},{対象パス:'/キャラ/HP',終了値:35},{対象パス:'/資産/馬車/完全度',終了値:90},{対象パス:'/噂/話題',終了値:'市'}];
 assert.equal(validate(b,a,r).状態,'一致');
 a.任務.リスト.護衛.状態='進行中';assert(validate(b,a,r).不一致.some(x=>x.パス==='/任務/リスト/護衛/状態'));
});
test('historical world/quest entries under 人物変化 are checked, not rejected by category',()=>{
 const b=fixture(),a=structuredClone(b),r={最終地点:'峠',取引:[],人物変化:[{対象パス:'/世界/地点',終了値:'峠'},{対象パス:'/任務/リスト',終了値:{}}],戦闘精算:[],根拠:[]};
 assert.equal(validate(b,a,r).状態,'一致');
 r.人物変化[1].終了値={missing:{}};assert.equal(validate(b,a,r).状態,'不一致');
});
test('invalid and protected paths still fail instead of being ignored',()=>{
 for(const p of ['/探索/駅','/世界/バックステージ/x','/キャラ/最終属性/筋力','/システム状態/変数検証','/関係リスト/__proto__/HP']){const r=record();r.変数変化=[{対象パス:p,終了値:1}];assert(validate(fixture(),fixture(),r).不一致.some(x=>x.種別==='変数形式'),p);}
});
test('new location uses one actual variable and catches a missing update',()=>{
 const b=fixture(),r=record();r.変数変化=[{対象パス:'/世界/地点',終了値:'山道',理由:'下山'}];
 assert.equal(validate(b,structuredClone(b),r).状態,'不一致');const a=structuredClone(b);a.世界.地点='山道';assert.equal(validate(b,a,r,[{op:'replace',path:'/世界/地点',value:'山道'}]).状態,'一致');
});
test('historical alternate location text is a review note only if the actual patch persisted',()=>{
 const b=fixture(),a=structuredClone(b),r={最終地点:'熱海峠・山道',取引:[],人物変化:[],戦闘精算:[],根拠:[]};a.世界.地点='山道';
 const out=validate(b,a,r,[{op:'replace',path:'/世界/地点',value:'山道'}]);assert.equal(out.状態,'要確認');assert.equal(out.不一致.length,0);assert(out.注意[0].説明.includes('熱海峠・山道'));assert(out.注意[0].説明.includes('保存済み: 山道'));
 assert.equal(validate(b,structuredClone(b),r).状態,'不一致');
});
test('deletion needs an actual remove and absent target',()=>{
 const b=fixture();b.関係リスト.旅人={HP:10};const a=structuredClone(b);delete a.関係リスト.旅人;const r=record();r.変数変化=[{対象パス:'/関係リスト/旅人',操作:'remove',理由:'記録不要の退場'}];
 assert.equal(validate(b,a,r,[{op:'remove',path:'/関係リスト/旅人'}]).状態,'一致');assert.equal(validate(b,a,r).状態,'不一致');
});
test('unchanged or empty declared changes never claim full narrative verification',()=>{
 const out=validate(fixture(),fixture(),record());assert.equal(out.状態,'一致');assert.match(out.検証範囲,/本文.*未検証/);
});
test('actual HP changes caused by initialization remain visible as mismatches',()=>{
 const b=fixture(),a=structuredClone(b),r=record();r.変数変化=[{対象パス:'/関係リスト/旅人',終了値:{HP:45,EP:20}}];a.関係リスト.旅人={HP:48,EP:28,HP_MAX:48,EP_MAX:28};assert(validate(b,a,r).不一致.some(x=>x.種別==='変数未反映'));
});
