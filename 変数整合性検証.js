// 輪廻戦場JP: 純粋な検証関数。通信、タイマー、モデル呼出しは行わない。
export const ledgerVersion = '1.0.0';
const own = (o,k) => o != null && Object.prototype.hasOwnProperty.call(o,k);
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const num = (value,fallback=0) => finite(value) ? value : fallback;
const safeKey = k => !['__proto__','prototype','constructor'].includes(k);
function parts(pointer) {
    if (typeof pointer !== 'string' || !pointer.startsWith('/')) return null;
    const p=pointer.slice(1).split('/').map(s=>s.replace(/~1/g,'/').replace(/~0/g,'~'));
    return p.every(safeKey) ? p : null;
}
export function readPointer(root,pointer) {
    const p=parts(pointer); if(!p)return undefined;
    return p.reduce((o,k)=>own(o,k)?o[k]:undefined,root);
}
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const statuses = n => Object.keys(n?.状態 || {});
export function unitKind(n) {
    return n?.単位種別 === '集団' || (!n?.単位種別 && num(n?.数量,1)>1) ? '集団' : '個体';
}
export function isDead(n) {
    if(!n)return false;
    if(statuses(n).some(k=>/^(死亡|全滅)$/.test(k)))return true;
    return unitKind(n)==='集団' ? num(n.HP)+num(n.THP)<=0 : finite(n.HP)&&n.HP<=0;
}
export function isIncapacitated(n) {
    return isDead(n)||statuses(n).some(k=>/気絶|昏睡|昏迷|行動不能|戦闘不能|失神/.test(k));
}
export function stateLabel(n) {
    if(isDead(n))return '死亡';
    const names=statuses(n);
    return names.length?names.join(' / '):'異常なし';
}
export function syncGroupPool(char,before) {
    if(!char || unitKind(char)!=='集団')return;
    char.単位種別='集団';
    const max=Math.max(1,num(char.HP_MAX,1));
    const qty=Math.max(0,Math.floor(num(char.数量,1)));
    let pool=Math.max(0,num(char.THP));
    if(!before)pool=max*Math.max(0,qty-1);
    else if(qty>Math.max(0,num(before.数量,1)) && pool<=Math.max(0,num(before.THP))) {
        // 増援のみを加える。生き残った既存メンバーの損失は回復しない。
        pool=Math.max(0,num(before.THP))+max*(qty-Math.max(0,num(before.数量,1)));
    }
    char.THP=pool;
    char.数量=(num(char.HP)>0?1:0)+Math.ceil(pool/max);
}
export function clearRecordBonuses(actor) {
    for(const state of Object.values(actor?.状態||{}))if(state?.用途==='記録') {
        state.原始属性={}; state.真属性={};
    }
}
function parseBlock(text,tag) {
    const re=new RegExp('<'+tag+'>\\s*([\\s\\S]*?)\\s*</'+tag+'>','gi');
    const all=[...String(text||'').matchAll(re)];
    if(!all.length)return undefined;
    let body=all.at(-1)[1].trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
    try{return JSON.parse(body);}catch{return undefined;}
}
function commandPatch(command) {
    if(command?.reason!=='json_patch')return null;
    try{return JSON.parse(command.full_match);}catch{return null;}
}
function quantityAt(data,p) {
    const v=readPointer(data,p);
    if(finite(v))return v;
    const node=readPointer(data,p?.replace(/\/数量$/,''));
    return node===undefined?0:undefined;
}
function allowedQuantity(p) {
    return typeof p==='string' && parts(p) && (/^\/キャラ\/スペースコイン$/.test(p)||/^\/(キャラ|関係リスト\/[^/]+)\/アイテム\/[^/]+\/数量$/.test(p));
}
function touches(path,target) {
    return path===target || target.startsWith(path+'/') || path.startsWith(target+'/');
}
function issue(code,path,detail) { return {種別:code,パス:path||'',説明:detail}; }
export function prepareValidation(before,commands,text,turnKey) {
    const analysis=parseBlock(text,'Analysis');
    const record=analysis && typeof analysis==='object'&&!Array.isArray(analysis)?analysis:null;
    const context={before:clone(before),record,turnKey:String(turnKey||''),issues:[],transactions:[],patches:[],blocked:[],structured:!!record};
    const history=before?.システム状態?.決算履歴||{};
    const deny=new Set();
    if(!record)context.issues.push(issue('形式不足','','構造化されたAnalysisがない。本文から変化を推測して補完しない。'));
    else {
        if(typeof record.最終地点!=='string'||!record.最終地点.trim())context.issues.push(issue('地点未記載','/世界/地点','最終地点を明記する必要がある。'));
        for(const k of ['取引','人物変化','戦闘精算','根拠'])if(!Array.isArray(record[k]))context.issues.push(issue('形式不足',k,'配列が必要。'));
        const seen=new Set();
        for(const t of Array.isArray(record.取引)?record.取引:[]) {
            const p=t?.対象パス,id=t?.イベントID;
            if(!allowedQuantity(p)||typeof id!=='string'||!id.trim()||!safeKey(id)||id.length>180) {
                context.issues.push(issue('取引形式',p,'対象パスまたはイベントIDが不正。'));continue;
            }
            const started=quantityAt(before,p);
            const prior=own(history,id)?history[id]:undefined;
            const duplicate=prior?.確定===true;
            const invalid=!finite(t.開始数量)||!finite(t.増減)||!finite(t.終了数量)||t.終了数量<0||t.開始数量+t.増減!==t.終了数量||started!==t.開始数量;
            if(duplicate||seen.has(id)) {
                deny.add(p);context.issues.push(issue('重複決算',p,'既に決算されたイベント、または同じIDの重複。'));
            } else if(invalid) {
                deny.add(p);context.issues.push(issue('収支不一致',p,'開始値、増減、終了値が保存値または算式と一致しない。'));
            } else context.transactions.push(clone(t));
            seen.add(id);
        }
    }
    // MVUの可変コマンド配列から確定した不正操作だけを除く。addの互換は維持する。
    for(let i=commands.length-1;i>=0;i--) {
        const p=commandPatch(commands[i]);if(!p)continue;
        const path=p.path||p.to||'';
        let reason='';
        if(['/システム状態/決算履歴','/システム状態/変数検証'].some(x=>touches(path,x)))reason='プログラム専用フィールド';
        else if([...deny].some(x=>touches(path,x)))reason='不正または重複した取引';
        else if(record && p.op==='remove' && /^\/(キャラ|関係リスト\/[^/]+)\/アイテム\/[^/]+$/.test(path)) {
            const quantity=readPointer(before,path+'/数量');
            if(num(quantity)>0&&!context.transactions.some(t=>t.対象パス===path+'/数量'&&t.終了数量===0))reason='残量のある物品を決算根拠なしで削除';
        }
        if(reason){context.blocked.push(p);context.issues.push(issue('操作拒否',path,reason));commands.splice(i,1);}
        else context.patches.unshift(p);
    }
    return context;
}
function hasPatch(context,path) {return context.patches.some(p=>touches(p.path||p.to||'',path));}
export function finishValidation(context,after) {
    if(!context||!after?.システム状態)return;
    const issues=[...context.issues],before=context.before,record=context.record;
    // AIが同名フィールドを出しても、履歴は直前の確定値からのみ構築する。
    const history=clone(before?.システム状態?.決算履歴||{});
    for(const t of context.transactions) {
        const actual=quantityAt(after,t.対象パス),updated=hasPatch(context,t.対象パス);
        if(actual!==t.終了数量||(!updated&&t.増減!==0))issues.push(issue('取引未反映',t.対象パス,'取引清算とJSONPatchまたは計算後の値が一致しない。'));
        else history[t.イベントID]={応答ID:context.turnKey,対象パス:t.対象パス,開始数量:t.開始数量,増減:t.増減,終了数量:t.終了数量,確定:true};
        if(t.相手パス) {
            const pair=context.transactions.find(x=>x.対象パス===t.相手パス&&x.増減===-t.増減&&x.相手パス===t.対象パス);
            if(!pair)issues.push(issue('受渡不一致',t.対象パス,'受渡相手の対応する数量変更がない。'));
        }
    }
    if(record) {
        if(record.最終地点!==after.世界?.地点)issues.push(issue('地点不一致','/世界/地点','最終地点と保存予定の現在地点が一致しない。'));
        for(const change of Array.isArray(record.人物変化)?record.人物変化:[]) {
            if(!change||!parts(change.対象パス)||!/^\/関係リスト\//.test(change.対象パス)) {issues.push(issue('人物形式','','人物変化の対象パスが不正。'));continue;}
            if(!own(change,'終了値')||!equal(readPointer(after,change.対象パス),change.終了値))issues.push(issue('人物未反映',change.対象パス,'人物変化の終了値と保存値が一致しない。'));
        }
        for(const battle of Array.isArray(record.戦闘精算)?record.戦闘精算:[]) {
            if(!battle||typeof battle!=='object')continue;
            const p=battle.対象パス;
            if(!parts(p)||!/^\/(キャラ|関係リスト\/[^/]+)$/.test(p)) {issues.push(issue('戦闘形式',p,'対象のキャラクターパスが不正。'));continue;}
            if(battle.判定種別==='攻撃'&&finite(battle.判定値)&&finite(battle.DC)&&battle.判定値<battle.DC&&num(battle.損害)>0&&!battle.例外)issues.push(issue('失敗命中損害',p,'通常攻撃がDC未達なのに損害を与えている。'));
            if(battle.判定種別==='戦意'&&(battle.結果==='死亡'||num(battle.死亡数)>0))issues.push(issue('戦意死亡',p,'戦意判定だけで死亡を確定している。'));
            for(const key of ['HP','THP','EP']) {
                const start=battle['開始'+key],end=battle['終了'+key];
                if(finite(start)&&start!==readPointer(before,p+'/'+key))issues.push(issue('戦闘開始値',p+'/'+key,'開始値が直前の保存値と異なる。'));
                if(finite(end)&&end!==readPointer(after,p+'/'+key))issues.push(issue('戦闘終了値',p+'/'+key,'清算値が計算後の保存値と異なる。'));
            }
        }
    }
    // 派生値以外の明示的なreplace/deltaが計算処理で消えた場合を独立して記録する。
    for(const p of context.patches) {
        const target=p.path||'';
        if(!/^\/(世界\/地点|キャラ\/アイテム\/[^/]+\/数量|キャラ\/スペースコイン)$/.test(target))continue;
        const expected=p.op==='replace'?p.value:p.op==='delta'&&finite(readPointer(before,target))?readPointer(before,target)+p.value:undefined;
        const actual=allowedQuantity(target)?quantityAt(after,target):readPointer(after,target);
        if(expected!==undefined&&!equal(expected,actual))issues.push(issue('計算後不一致',target,'明示した更新値と計算後の値が一致しない。'));
    }
    after.システム状態.決算履歴=history;
    after.システム状態.変数検証={状態:issues.length?'不一致':'一致',応答ID:context.turnKey,不一致:issues.slice(0,100)};
    return after.システム状態.変数検証;
}
