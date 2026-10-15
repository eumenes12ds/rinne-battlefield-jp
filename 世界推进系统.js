/* 轮回战场 · 世界引擎
 * 从参考异步助手迁移：旧状态回读、增量补丁、分层投影、楼层隔离、后台调度。
 * 专用实现：六个业务模块共用一次推演；MVU 是唯一持久状态；复用主神终端 API。
 * 在酒馆脚本库中独立加载。接口位于父窗口 Samsara.worldEngine。
 */
(function (root) {
    'use strict';
    const WORLD_ENGINE_VERSION='2.0.8';
    const copy = value => JSON.parse(JSON.stringify(value));
    const plain = value => !!value && typeof value === 'object' && !Array.isArray(value);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function digest(text) {
        let a = 2166136261, b = 5381;
        for (let i=0;i<text.length;i++) { a = Math.imul(a ^ text.charCodeAt(i),16777619); b = Math.imul(b,33) ^ text.charCodeAt(i); }
        return (a >>> 0).toString(16) + (b >>> 0).toString(16) + ':' + text.length;
    }
    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const JP_UI_LABELS={"资产":"資産","原始属性":"基礎属性","角色管理":"キャラクター管理","运行记录":"実行記録","历史记忆":"履歴記憶","历史":"履歴","历史总结":"履歴の要約","传播":"伝播","势力地区":"勢力と地区","默认走向":"既定の展開","结果":"結果","公开征兆":"公開の兆候","行动":"行動","认知":"認識","下次检查":"次回確認","关联事件":"関連事件","公开动态":"公開動向","进展":"進展","事实":"事実","范围":"範囲","分类":"分類","开始时间":"開始時刻","预计结束":"終了予定","更新时间":"更新時刻","参与者":"参加者","关联任务":"関連任務","可见影响":"可視的影響","影响":"影響","开始":"開始","结束":"終了","承诺":"約束","对象":"対象","解除条件":"解除条件","待决事项":"未決事項","问题":"問題","选项":"選択肢","等待":"待機","关系变化":"関係変化","关系":"関係","变化":"変化","认知来源":"認識の出典","获知时间":"情報取得時刻","登场条件":"登場条件","背景关联":"背景の関連情報","控制方":"支配勢力","争夺方":"争奪勢力","资源":"資源","内部派系":"内部派閥","立场":"立場","近期变化":"最近の変化","环境状态":"環境状態","现场群体":"現場の集団","规模":"規模","动态":"動向","到期时间":"期限","受众":"受け手","引发行动":"誘発する行動","版本":"バージョン","最近变化":"最近の変化","资产墓碑":"削除済み資産","声望":"名声","起点":"起点","终点":"終点","小时":"時間","等级":"等級","允许":"許可","键":"キー","复核依据":"再確認の根拠","当前时间":"現在時刻","当前地点":"現在地","当前数量":"現在数","因果轨道节点数":"因果軌道の節目数","因果轨道需重建":"因果軌道の再構築が必要","需要初始化":"初期化が必要","近期节点数":"直近の節目数","宏观节点数":"大局的な節目数","下一宏观节点":"次の大局的な節目","字段":"フィールド","值":"値","回收人物":"整理した人物","回收探索":"整理した探索","记录":"記録","档案名称":"記録名","档案类型":"記録の種別","地区动态":"地区の動向","类别":"分類","当前活动":"現在の活動","異端":"異端","形态":"形態","缺口":"不足項目","当前构筑":"現在の構成","公开摘要":"公開概要","正文承接":"本文への引き継ぎ","宏观顺序":"大局順序","所在世界":"所在世界","已知信息":"既知の情報","新近":"最近","世界时间":"世界時刻","公开传闻":"公開の噂","世界侧可传播事实":"世界の伝播可能な事実","刷新原因":"更新理由","本轮公开传闻动作":"今回の公開の噂の処理","片段":"部分結果","话题":"話題","传播链":"伝播経路","世界书":"世界書","条目ID":"エントリー ID","读取":"読み取り","楼层":"メッセージ","正文":"本文","至少补充节点数":"最低追加節目数","交付要求":"提出要件","验收":"検証","当前变量":"現在の変数","本轮必须完成的宏观骨架":"今回完成すべき大局構成","NPC构筑审计":"NPC 構成監査","推演阶段":"シミュレーションの段階","宏观骨架状态":"大局構成の状態","生命周期整理":"ライフサイクルの整理","输出协议":"出力プロトコル","接口来源":"接続元","导入节点":"読み込んだ節目","到期节点":"期限到来の節目","超期活动事件":"長期継続中の活動事件","时间越界记录":"未来時刻の記録","观测":"観測","子项":"子項目","起始序位":"開始順序","序号":"連番","近期锚点":"最近の基準点","统计":"統計","原始锚点总数":"元の基準点総数","总结节点总数":"要約ノード総数","未收纳锚点数":"未収録の基準点数","隐藏未压缩锚点数":"非表示の未圧縮基準点数","偏移摘要":"変動の概要","当前稳定":"現在の安定値","原始请求":"元のリクエスト","当前尝试":"現在の試行","最大尝试次数":"最大試行回数","上次拒绝原因":"前回の拒否理由","上次模型回复":"前回のモデル応答","已接受业务结果":"承認済みの結果","补充清单":"補充一覧","接口":"接続","模型":"モデル","尝试模式":"試行モード","尝试序号":"試行番号","请求类型":"リクエスト種別","模式尝试":"モード試行","尝试":"試行","错误":"エラー","是否需要初始化":"初期化の要否","所有权":"管理権限","正文时间职责":"本文の時間に関する責務","精确日期格式":"正確な日付の形式","传闻维护":"噂の管理","验收策略":"検証方針","模式":"モード","硬错误":"致命的エラー","软维护":"任意の保守","事件因果锚点可接受":"事件の因果基準点を受理可能","传闻补齐":"噂の補充","启用":"有効","任务感知":"任務情報の参照","任务数量":"任務数","只读":"読み取り専用","当前世界时间":"現在の世界時刻","当前排期":"現在の日程","原著时间资料":"原作の時間資料","规划原则":"計画原則","强制校准":"強制補正","校验模式":"検証モード","空分类":"空の分類","可传播候选":"伝播候補","正文直接取材":"本文から直接取材","节点粒度":"節目の粒度","时间精度":"時間精度","任务列表":"任務一覧","标题":"タイトル","提示词模块":"プロンプトモジュール","耗时":"所要時間","分段":"セグメント","条目":"エントリー","人物背景":"人物の背景","事件描述":"事件の説明","当前事件":"現在事件","待发生":"発生待ち","进行中":"進行中","已完成":"完了","已取消":"取消済み","近期节点":"直近の節目","宏观节点":"大局的な節目","传播中":"伝播中","杂兵级":"雑兵級","精英级":"精鋭級","首领/Boss级":"首領/Boss級","估算Tokens":"推定 Token","估算":"推定","请求估算Tokens":"リクエスト推定 Token","System估算Tokens":"System 推定 Token","User估算Tokens":"User 推定 Token","Schema估算Tokens":"Schema 推定 Token","System分段":"System の区分","User分段":"User の区分"};
    const uiLabel=value=>JP_UI_LABELS[String(value)]||value;
    const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
    const CONFIG = 'samsara_world_engine_v1';
    const PATH = "バックステージ";
    const EVENT_TARGET = 180;
    const RECENT_FINISHED_EVENT_TARGET = 8;
    const FINISHED_EVENT_GRACE_HOURS = 24;
    const HOT_HISTORY_TARGET = 24;
    const HOT_OFFSET_TARGET = 8;
    const HOT_PROPAGATION_TARGET = 24;
    const HOT_PERSON_TARGET = 24;
    const HOT_PERSON_RECENT_HOURS = 72;
    const COLD_TEMP_PERSON_GRACE_HOURS = 30 * 24;
    const COLD_TEMP_PERSON_TARGET = 32;
    const TERMINAL_PERSON_STATUS = /^(?:(?:已结束|終了済み)|(?:结束|終了)|(?:已离场|退場済み)|(?:离场|退場)|(?:已离开|退出済み)|(?:离开|退出)|(?:退休|引退)|(?:已退休|引退済み)|(?:失效|失効)|(?:已失效|失効済み)|消失|(?:已消失|消失済み)|死亡)$/;
    const STATUS_THEME_CONFIG = 'samsara_theme_v2';
    // 六主题只在这里维护色值。CSS 只消费语义 token，避免羊皮/樱白等主题再堆局部补丁。
    const WORLD_UI_THEMES = Object.freeze({
        night:Object.freeze({scheme:'dark',shell:'#0e1320',main:'#101824',surface:'#151e2c',card:'#1b2636',cardHover:'#213044',input:'#111a27',line:'#344357',ink:'#edf3f8',sub:'#bac6d4',accent:'#9aa8ff',accentSoft:'#9aa8ff24',gold:'#d9b978',mint:'#7dcbbb',head:'#111a27',nav:'#0c1420',notice:'#251f18',action:'#9aa8ff',actionInk:'#111827'}),
        crimson:Object.freeze({scheme:'dark',shell:'#170d12',main:'#1b1016',surface:'#24131a',card:'#301923',cardHover:'#3a1f2b',input:'#180d13',line:'#5b2f3a',ink:'#fff2f5',sub:'#d8b8c0',accent:'#ff7670',accentSoft:'#ff767024',gold:'#ffb347',mint:'#e49aac',head:'#230f16',nav:'#180a10',notice:'#2d1b13',action:'#ff7670',actionInk:'#2a0e13'}),
        indigo:Object.freeze({scheme:'dark',shell:'#0d1024',main:'#11152d',surface:'#171b39',card:'#20254a',cardHover:'#292f5a',input:'#0e1229',line:'#373d72',ink:'#f0f2ff',sub:'#bec3e8',accent:'#8b78ff',accentSoft:'#8b78ff25',gold:'#ffd166',mint:'#65c9c3',head:'#11162f',nav:'#0a0d20',notice:'#29231a',action:'#8b78ff',actionInk:'#101426'}),
        parchment:Object.freeze({scheme:'light',shell:'#e8dcc3',main:'#f1e7d2',surface:'#fff7e7',card:'#f4e6ca',cardHover:'#eddcbc',input:'#fffaf0',line:'#c9ad79',ink:'#392b18',sub:'#6c5432',accent:'#855a16',accentSoft:'#855a1620',gold:'#7a5215',mint:'#4f6f3d',head:'#5c4325',nav:'#6b5030',notice:'#f2dfb9',action:'#d9a441',actionInk:'#2b1a08'}),
        sakura:Object.freeze({scheme:'light',shell:'#f4dce4',main:'#fff0f5',surface:'#fff9fb',card:'#fbe3eb',cardHover:'#f6d8e3',input:'#fffafd',line:'#ddb6c5',ink:'#432532',sub:'#765466',accent:'#a63f69',accentSoft:'#a63f6922',gold:'#8a5624',mint:'#446f62',head:'#6c3148',nav:'#7b3d55',notice:'#f7e2d3',action:'#ee8eb3',actionInk:'#3b1e2a'}),
        matcha:Object.freeze({scheme:'light',shell:'#dcebd4',main:'#eef5e8',surface:'#fbfdf8',card:'#e3efd9',cardHover:'#d8e8cc',input:'#fbfff7',line:'#b7cbaa',ink:'#263823',sub:'#53694f',accent:'#3e7746',accentSoft:'#3e774622',gold:'#73591f',mint:'#39725f',head:'#31563a',nav:'#284630',notice:'#edf0ce',action:'#79b77e',actionInk:'#17311f'})
    });
    const WORLD_TONE_KEYS = new Set(Object.keys(WORLD_UI_THEMES));
    const WORLD_UI_THEME_CSS = Object.entries(WORLD_UI_THEMES).map(([tone,theme])=>{
        const vars=Object.entries(theme).filter(([key])=>key!=='scheme').map(([key,value])=>'--we-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+value).join(';');
        return '#sam-world-engine[data-tone="'+tone+'"]{'+vars+';color-scheme:'+theme.scheme+'}';
    }).join('\n');
    const WORLD_FONT_SCALES = {
        standard:{name:"標準",size:'16px',desc:"本文約15px、補助文字は13px以上"},
        large:{name:"大文字",size:'18px',desc:"本文約17px、補助文字は約14-15px"},
        xlarge:{name:'特大',size:'20px',desc:"本文約19px、遠距離からの閲覧向け"}
    };
    class WorldTokenTelemetry {
        estimate(value) {
            const source=typeof value==='string'?value:JSON.stringify(value??'');
            if(!source)return 0;
            let eastAsian=0,nonAscii=0,ascii=0;
            for(const ch of source){
                const cp=ch.codePointAt(0);
                const east=(cp>=0x3400&&cp<=0x9fff)||(cp>=0xf900&&cp<=0xfaff)||(cp>=0x3040&&cp<=0x30ff)||(cp>=0x31f0&&cp<=0x31ff)||(cp>=0xac00&&cp<=0xd7af)||(cp>=0x3100&&cp<=0x312f)||(cp>=0xff00&&cp<=0xffef);
                if(east)eastAsian++;
                else if(cp<=0x7f)ascii++;
                else nonAscii++;
            }
            return Math.max(1,Math.ceil(eastAsian*1.08+nonAscii+ascii/3.8));
        }
        format(count,estimated=true) {
            const n=Math.max(0,Math.round(Number(count)||0));
            let value=String(n);
            if(n>=1000){
                const digits=n>=100000?0:n>=10000?1:2;
                value=(n/1000).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1')+'k';
            }
            return (estimated?'≈':'')+value+' tk';
        }
        normalizeUsage(usage) {
            if(!plain(usage))return null;
            const finite=value=>Number.isFinite(Number(value))&&Number(value)>=0?Math.round(Number(value)):null;
            const inputTokens=finite(usage.prompt_tokens??usage.input_tokens??usage.promptTokens??usage.inputTokens);
            const outputTokens=finite(usage.completion_tokens??usage.output_tokens??usage.completionTokens??usage.outputTokens);
            let totalTokens=finite(usage.total_tokens??usage.totalTokens);
            if(totalTokens===null&&inputTokens!==null&&outputTokens!==null)totalTokens=inputTokens+outputTokens;
            return inputTokens===null&&outputTokens===null&&totalTokens===null?null:{inputTokens,outputTokens,totalTokens};
        }
        request(system,input,schema) {
            const systemText=String(system||''),inputText=String(input||'');
            let payload=null;try{payload=JSON.parse(inputText);}catch(_){}
            const systemParts=systemText.split(/\n(?=【)/).filter(Boolean).map((part,index)=>({
                名称:(part.match(/^【([^】]+)】/)||[])[1]||'system '+(index+1),
                估算Tokens:this.estimate(part)
            }));
            const userParts=plain(payload)?Object.entries(payload).filter(([,value])=>value!==undefined).map(([name,value])=>({
                名称:name,估算Tokens:this.estimate(JSON.stringify({[name]:value},null,2))
            })):[];
            const systemTokens=this.estimate(systemText),userTokens=this.estimate(inputText);
            return {
                估算:true,
                请求估算Tokens:systemTokens+userTokens,
                System估算Tokens:systemTokens,
                User估算Tokens:userTokens,
                Schema估算Tokens:this.estimate(JSON.stringify(schema||{},null,2)),
                System分段:systemParts,
                User分段:userParts
            };
        }
    }

    const DEFAULT_WORLD_TOKEN_TELEMETRY=new WorldTokenTelemetry();
    let ACTIVE_WORLD_TOKEN_TELEMETRY=DEFAULT_WORLD_TOKEN_TELEMETRY;
    function estimateTokens(value){return ACTIVE_WORLD_TOKEN_TELEMETRY.estimate(value);}
    function formatTokenCount(count,estimated=true){return ACTIVE_WORLD_TOKEN_TELEMETRY.format(count,estimated);}
    function normalizeTokenUsage(usage){return ACTIVE_WORLD_TOKEN_TELEMETRY.normalizeUsage(usage);}
    function requestTokenTelemetry(system,input,schema){return ACTIVE_WORLD_TOKEN_TELEMETRY.request(system,input,schema);}
    class WorldProseExtractor {
        extract(value) {
            let source=String(value??'').replace(/\r\n?/g,'\n');
            source=source.replace(/<!--[\s\S]*?(?:-->|$)/g,'\n');
            source=source.replace(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?(?:<\/details>|$)/gi,
                (block,title)=>/思考|(?:思维链|思考過程)|(?:变量|変数)|更新|(?:检定|判定)|(?:结算|清算)|(?:状态栏|ステータス)|thinking|reasoning|analysis/i.test(title)?'\n':block);
            const hidden=new Set(['think','thinking','reasoning','analysis','konatan_planning','dm_think','chain_of_thought',
                'updatevariable','jsonpatch','variables','status_current_variables','user_status_readonly',
                'worldresult','options','statusplaceholder',
                'action','summary','update','scene_time','pic','dicecombat','dicecheck','enemyoverview',
                'summonoverview','lootlog','experiencelog','questcontract','merchantstore','combatsnapshot',
                'combatresult','craftresult','checkresult',
                'ash-review','acu-review','ash_review','acu_review','ash_note','acu_note','ash-review-slot',
                'script','style','head','iframe']);
            // 部分正文模型通过 assistant prefill 注入隐藏块的开始标签，最终楼层只会保存结束标签。
            // 仅对思考类标签启用“首个隐藏标签为孤立结束标签”的兼容，避免误吞变量/面板前的正常正文。
            const prefillHidden=new Set(['think','thinking','reasoning','analysis','konatan_planning','dm_think','chain_of_thought']);
            // 按标签栈移除整个技术块，支持嵌套与属性；未闭合技术块的剩余内容也不发送。
            const tags=/<\s*(\/?)\s*([a-z_][\w-]*)\b[^>]*>/gi;
            const stack=[];let text='',cursor=0,match,seenHiddenTag=false;
            while((match=tags.exec(source))){
                const name=match[2].toLowerCase();
                if(!hidden.has(name))continue;
                const closing=!!match[1];
                // assistant prefill 可能把 <thinking>/<konatan_planning~> 等开始标签放在保存文本之外。
                // 若本楼第一个隐藏边界就是对应结束标签，则从消息开头到该标签都属于隐藏思考。
                if(closing&&!stack.length&&!seenHiddenTag&&prefillHidden.has(name)){
                    cursor=tags.lastIndex;
                    seenHiddenTag=true;
                    continue;
                }
                seenHiddenTag=true;
                if(!stack.length)text+=source.slice(cursor,match.index);
                if(closing){
                    const at=stack.lastIndexOf(name);
                    if(at>=0)stack.length=at;
                }else if(!/\/\s*>$/.test(match[0]))stack.push(name);
                cursor=tags.lastIndex;
                if(!stack.length)text+='\n';
            }
            if(!stack.length)text+=source.slice(cursor);
            // 代码面板不属于已演出剧情；无语言标记的纯叙事围栏仍可兼容。
            text=text.replace(/^[ \t]*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)(?:^[ \t]*\1[ \t]*$|(?![\s\S]))/gm,
                (_block,_fence,language,body)=>{
                    if(/^(?:json\w*|ya?ml|html|xml|javascript|js|typescript|ts|css|python|diff)\b/i.test(language.trim()))return '\n';
                    try{const data=JSON.parse(body);if(data&&typeof data==='object')return '\n';}catch(_){}
                    return body;
                });
            // 对应参考助手 bodyTagsText 为空的模式：始终清洗整楼，不按正文标签截取。
            try{const data=JSON.parse(text);if(data&&typeof data==='object')return '';}catch(_){}
            return text.replace(/<[^>]+>/g,tag=>/^<user>$/i.test(tag)?tag:'')
                .replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
        }
    }

    const DEFAULT_WORLD_PROSE_EXTRACTOR=new WorldProseExtractor();
    let ACTIVE_WORLD_PROSE_EXTRACTOR=DEFAULT_WORLD_PROSE_EXTRACTOR;
    function extractWorldProse(value){return ACTIVE_WORLD_PROSE_EXTRACTOR.extract(value);}
    const DEFAULT_PRESET = `あなたは輪廻戦場の世界エンジンです。本文の場面の外で動いている世界だけを進め、事件・場面・人物・勢力・伝播・資産・因果の整合性を維持します。
【実行手順】
Step 1 · 事実の取得：「現在の変数・今回の確定した物語 > 明確な世界書 > モデルの一般知識」の優先順で読みます。確認済みの相違を優先します。
Step 2 · 境界の確定：現在の段階と次の大局的な節目を確認します。章・地区・戦争・勢力・重要人物の運命に段階変化がある場合だけ大局構成を調整します。
Step 3 · 区間の進行：今回の時間容量を厳守し、期限到来・進行中の事項を先に処理してから、未完の事項を妥当な一歩だけ進めます。計画は事実ではなく、次の大局境界を越えません。
Step 4 · 現場から人物へ：区間内で実際に変化した地区の現状を先に更新し、その後で人物の行動を決めます。人物は地点・距離・能力・認識・責務・資産・地区の条件に制約されます。モデルが本文・現在の変数を読めることは、人物が事情を知ることを意味しません。場外人物が <user> の新しい行動を理由に目標・行動を変えるには、既存の認識、または今回の観察・目撃・通信・伝播による情報取得が必要で、人物.认知・认知来源 に記録します。情報源がなければ元の目標・行動を維持し、その人物自身の用事だけを進めます。同じ場面の本文が未決なら接触の直前で止めます。活動中の異端は活動記録の欠落、確認期限、関連事件・所在地区の変化、長期未確認の場合だけ更新し、対象外なら既存の目標・行動を維持します。更新のためだけに方針を創作しません。
Step 5 · プレイヤーの影響の精算：<user> の確認済み行動だけに基づいて探索・勢力・重大な因果変動を精算します。これは客観的な世界の処理であり、情報を得ていない場外人物に自動で追跡・待ち伏せ・方針変更をさせる根拠にはなりません。必要なら大局構成を再構成します。
Step 6 · 伝播の更新：今回実際に変化した伝播・通貨・暦だけを管理します。終了・期限切れの伝播を復活させません。
Step 7 · 差分の出力：「履歴要約」の規則に従って要約を書き、今回追加・変更した WorldResult だけを出力します。処理上の変化がない場合も、新しい世界の事実がないことを客観的に説明します。
【実行確認】
時間・移動距離は実現可能であること。人物の知識に情報源があること。同一人物は同時刻に一か所だけに存在すること。<user> の代わりに行動しないこと。描写済みの些事を繰り返さないこと。<user> が止まっても世界は止まらないこと。`;
    const BUILTIN_DEFAULT_SELECTED_ENTRIES = [
            "[\"轮回战场V3.6.1\",\"915830\"]",
            "[\"轮回战场V3.6.1\",\"196248\"]",
            "[\"轮回战场V3.6.1\",\"503929\"]",
            "[\"轮回战场V3.6.1\",\"931853\"]",
            "[\"轮回战场V3.6.1\",\"446543\"]",
            "[\"轮回战场V3.6.1\",\"381583\"]",
            "[\"轮回战场V3.6.1\",\"965161\"]",
            "[\"轮回战场V3.6.1\",\"556346\"]",
            "[\"轮回战场V3.6.1\",\"122086\"]",
            "[\"轮回战场V3.6.1\",\"2\"]",
            "[\"轮回战场V3.6.1\",\"562289\"]",
            "[\"轮回战场V3.6.1\",\"937185\"]",
            "[\"轮回战场V3.6.1\",\"612483\"]",
            "[\"轮回战场V3.6.1\",\"544521\"]",
            "[\"轮回战场V3.6.1\",\"454622\"]",
            "[\"轮回战场V3.6.1\",\"671885\"]",
            "[\"轮回战场V3.6.1\",\"345604\"]",
            "[\"轮回战场V3.6.1\",\"558862\"]",
            "[\"轮回战场V3.6.1\",\"78614\"]",
            "[\"轮回战场V3.6.1\",\"229663\"]",
            "[\"轮回战场V3.6.1\",\"985921\"]",
            "[\"轮回战场V3.6.1\",\"625413\"]",
            "[\"轮回战场V3.6.1\",\"8412\"]",
            "[\"轮回战场V3.6.1\",\"559085\"]"
        ];
    const BUILTIN_DEFAULT_WORLD_BOOK_EXCLUSIONS = new Set(["任務と依頼のシステム"]);
    const USER_DEFAULT_PROMPT_DOCUMENT_ID='user-default';
    const CORE_WORLD_RULES = `【世界エンジンの基本制約】
1. 事実：現在の変数・確定した物語 > 明確な世界書 > モデルの一般知識。計画は事実ではなく、確認済みの相違を原作の知識で上書きしません。
2. 大局と時間：世界.時間 だけでこの世界の進行を計算します。大局順序は 3～5 件の段階転換を維持し、細部は次の大局境界まで進めます。発生待ち・進行中の事件には順序を判別できる時間または明確な因果時間が必要です。期間が不明なら一歩だけ進めます。
3. 現場と認識：現場の集団・環境の事実は勢力地区に属し、同じ事実を人物へ複製しません。地区の現状を更新してから人物の行動を決めます。モデルが本文・変数・<user> の確定行動を知ることは世界の事実を知るだけで、場外人物が知ることとは異なります。人物は現場の観察、既存の認識、信頼できる通信・伝播経路だけに基づいて行動します。<user> の新しい行動を理由に目標・行動を変える場合は、既存または今回記録する人物.认知・认知来源 に追跡可能な出典が必要です。情報源なしで <user> に即応してはいけません。
4. 人物の境界：活動中の異端は条件成立時に再確認し、対象外は既存の活動を継続します。死亡は取り消せません。通常人物は実際に関係する活動記録だけを保持します。<user> のバックグラウンド行動を作成しません。主神任務・昇格試練・任務状態・インスタンス実績は読み取り・更新・世界進行の根拠にしません。通常シナリオから主神空間に戻った後はこの世界の計算を停止します。単一世界の部分精算では世界をリセットしません。
5. 資産：固定不動産・大型乗り物・要塞に限ります。薬剤・素材・消耗品・鍵・物語上の品物・個人装備・形態は資産に入れません。最上位の资产が唯一の台帳です。所属対象は配列とし、確認済みの場外の事実に応じて追加・更新・移転・削除できます。削除保護された同名資産を再作成せず、本文・MVU が精算済みの変化を重複精算しません。
6. プレイヤーの台帳：探索は <user> が実際に到達・調査・信頼できる情報を取得した区域全体だけを精算します。探索度の段階は 0/10/30/60/90/100 とし、理由なく後退させません。勢力の名声は <user> の実際の関係の結果でのみ変化し、同じ結果は一度だけ精算します。1 回の絶対変化は 1000 以下、500 超は重大事件に限ります。
7. 因果：重要人物の運命・重大事件の結果・勢力構図・本筋の成立可能性が実質的に変わる場合だけ変動を記録します。負値は因果破壊、正値は修復・強化です。世界超安定では新たな変動を追加しません。旧軌道が失効した場合は同じ回に大局順序を再構成します。
8. 公開情報と基盤：現在事件の公開フィールドには現実となり、合理的に知覚できる情報だけを書きます。通貨は実際の流通体系の変化に従い、任務世界の現地通貨としてスペースコインを使いません。暦は信頼できる設定が明確な場合だけ管理します。
9. 履歴要約：今回確定した主体・行動・結果・主要な状態変化・継続する影響だけを書き、計画・進行中・完了を区別します。「構成を作成した」「シミュレーションを完了した」「情勢が水面下で動く」など、処理の説明や曖昧な概括は禁止です。`;
    const DEFAULT_MACRO_PROMPT = `【今回の大局構成の提出】
まず入力「本轮必须完成的宏观骨架」を完成させ、その後に直近の細部をシミュレーションする。統合後には、進行中と発生待ちを合わせて最低 3 件の進行可能な大局的節目が必要となる。将来の計画は次の大局境界を越えてよいが、実際の発生と細部の進行は越境できない。差分だけを出力する場合も、未構築の骨格を省略してはならない。提出前に事件、分類、状態、時間、前因、因果.宏观顺序の対応を確認する。`;
    const DEFAULT_STABILITY_PROMPT_TEMPLATE = `【世界自救 · {{段階}}】
現在の安定値：{{稳定值}}。{{规则}}
排除は世界観内の合理的な媒体を通じて発生しなければならず、異常を引き起こした輪廻者とその拠点、関係網、資源、行動経路を優先的に対象とする；NPCは依然として自身の認知と伝播チェーンに基づいてのみ行動でき、根拠なく全知になってはならない。法則が壊れているほど能動的な排除が弱まるわけではない。`;
    const BUILTIN_DEFAULT_PROMPT_DOCUMENT = {
        id:'builtin-default',
        type:'samsara-world-prompt-document',
        version:22,
        builtin:true,
        name:"既定設定",
        exportedAt:'2026-09-14T13:00:00.000Z',
        createdAt:'2026-09-08T13:09:45.350Z',
        updatedAt:'2026-09-28T15:45:00.000Z',
        settings:{
            corePrompt:CORE_WORLD_RULES,
            macroPrompt:DEFAULT_MACRO_PROMPT,
            stabilityPromptTemplate:DEFAULT_STABILITY_PROMPT_TEMPLATE,
            preset:normalizeEditablePreset(DEFAULT_PRESET),
            contextTurns:3,
            activationMode:'respect_activation',
            selectedEntries:copy(BUILTIN_DEFAULT_SELECTED_ENTRIES)
        }
    };
    const BUILTIN_DEFAULT_PROMPT_VERSION = BUILTIN_DEFAULT_PROMPT_DOCUMENT.version;
    const WORLD_STABILITY_DEFENSE_STAGES = [
        {min:90,title:"因果警戒",rule:"異常な手掛かり、調査、誤解、既存の敵意が合理的な因果チェーンに沿って輪廻者とその直接の関係網へ集まり始める；依然として自然な出来事として表現され、公開的な包囲には至らない。"},
        {min:80,title:"指向性排除",rule:"潜伏先、計画、連絡相手、資源チェーン、行動経路が継続的に圧迫される；圧力は輪廻者本人とその直接の関係網へ優先的に集中する。"},
        {min:70,title:"因果追跡",rule:"原生の強者、組織、本筋の衝突が因果の収束によって徐々に輪廻者へと向かう；拠点、盟友、補給、撤退経路が組織的に破壊され始める。"},
        {min:60,title:"全面包囲",rule:"複数の原生勢力がそれぞれの合理的な動機に基づいて同時に輪廻者を追跡、封鎖、攻撃できる；通常の安全な生活はほぼ終わる。"},
        {min:50,title:"世界の兵器化",rule:"戦争、災害、モンスターの奔流、原生の最上位強者が因果チェーンに沿って輪廻者の活動区域へ圧し掛かる；世界は区域の破壊と大規模な巻き添えを排除の代価として受け入れ始める。"},
        {min:40,title:"現実狩り",rule:"環境、空間、時間、残存する原生ルールのすべてが狩りの媒体となり得る；世界は恒久的な区域破壊を受け入れ、侵入源を道連れに葬ることだけを求める。"},
        {min:30,title:"生贄による排除",rule:"世界は免疫嵐に入り、本筋の人物、都市、国家、さらには文明構造を犠牲にして輪廻者の排除と引き換えにできる。"},
        {min:10,title:"終焉の狩り",rule:"破滅的な出来事が輪廻者とその滞在区域へ向けて収束し続ける；長期間の滞在は災厄を現在地へ引き寄せる。"},
        {min:1,title:"共倒れ",rule:"世界は自衛を放棄し、法則、タイムライン、現実構造を自ら犠牲にして輪廻者を排除する。"},
        {min:0,title:"世界消滅",rule:"因果チェーン、世界法則、タイムライン、現実構造がすべて終了し、通常の世界進行を生成しなくなる。"}
    ];
    function worldStabilityPrompt(stat, template=DEFAULT_STABILITY_PROMPT_TEMPLATE) {
        if(stat?.設定?.世界超安定===true)return '';
        const raw=Number(stat?.世界?.安定),stable=Number.isFinite(raw)?Math.max(0,Math.min(120,raw)):100;
        if(stable>=100)return '';
        const stage=WORLD_STABILITY_DEFENSE_STAGES.find(item=>stable>=item.min)||WORLD_STABILITY_DEFENSE_STAGES.at(-1);
        const source=String(template??DEFAULT_STABILITY_PROMPT_TEMPLATE);
        if(!source.trim())return '';
        return source.split("{{段階}}").join(stage.title).split("{{安定値}}").join(String(stable)).split("{{ルール}}").join(stage.rule);
    }
    function splitPresetSegments(value) {
        return String(value||'').split(/\n(?=【)/).filter(Boolean).map(part=>{
            const m=part.match(/^【([^】]+)】\s*\n?/);
            return m?{title:m[1],body:part.slice(m[0].length)}:{title:'',body:part};
        });
    }
    function cleanSegmentTitle(value) {
        return String(value||'').replace(/[【】\r\n]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
    }
    function segmentText(segment) {
        const title=cleanSegmentTitle(segment.title);
        return title?'【'+title+'】\n'+String(segment.body||'').trim():String(segment.body||'').trim();
    }
    function normalizeEditablePreset(value) {
        return splitPresetSegments(value).map(segment=>({
            title:cleanSegmentTitle(segment.title),
            body:String(segment.body||'')
        })).map(segmentText).filter(Boolean).join('\n');
    }
    function ensurePresetStructure(value) {
        const current=splitPresetSegments(value||DEFAULT_PRESET).map(segment=>segment.title==="勢力と地区"?{...segment,title:"探索と勢力"}:segment);
        const defaults=splitPresetSegments(DEFAULT_PRESET);
        const titles=new Set(current.map(s=>s.title).filter(Boolean));
        for(const segment of defaults)if(segment.title&&!titles.has(segment.title))current.push(segment);
        return current.map(segmentText).filter(Boolean).join('\n');
    }    const WORLD_TECHNICAL_BOOK_PATTERNS=[/^\[variables\]/i,/^\[mvu_update\]/i,/^output_format_/i,/^⚙️(?:额外思考|追加思考)(?:\.|$)/,/^行动选项_/i,/^【(?:(?:主神任务|主神任務)|(?:结算任务|清算任務)|(?:试炼任务|試練任務)|(?:选择世界|世界選択))】/];

    class WorldKnowledgeSelectionPolicy {
        parseKey(value) {
            try{
                const parsed=JSON.parse(String(value||''));
                return Array.isArray(parsed)&&parsed.length>=2?[String(parsed[0]||''),String(parsed[1]??'')]:null;
            }catch(_){return null;}
        }
        normalizeIdentity(value) {
            let name=String(value||'').trim().toLowerCase();
            const versionAt=name.search(/(?:\bv(?:er(?:sion)?)?|(?:版本|バージョン))?\s*\d+(?:\.\d+){1,3}/i);
            if(versionAt>0)name=name.slice(0,versionAt);
            return name.replace(/[\s_\-·.]+/g,'');
        }
        normalizeTitle(value) {
            return String(value||'').trim().replace(/^⚙(?:\uFE0F)?\s*/u,'').trim();
        }
        matches(entry,selectedEntries) {
            if(!Array.isArray(selectedEntries))return entry?.enabled!==false;
            const exact=JSON.stringify([String(entry?.book||''),String(entry?.id??'')]);
            if(selectedEntries.includes(exact))return true;
            const entryBook=this.normalizeIdentity(entry?.book),entryId=String(entry?.id??'');
            for(const raw of selectedEntries){
                const ref=this.parseKey(raw);if(!ref||ref[1]!==entryId)continue;
                if(ref[0]==='*'||(entryBook&&this.normalizeIdentity(ref[0])===entryBook))return true;
            }
            return false;
        }
        isTechnical(title) {
            return WORLD_TECHNICAL_BOOK_PATTERNS.some(rule=>rule.test(String(title||'').trim()));
        }
        isTimelineBackbone(title) {
            const name=String(title||'').replace(/\s+/g,'');
            if(/(?:(?:变量|変数)|(?:输出格式|出力形式)|(?:更新规则|更新規則)|COT|思考|(?:风格|文体)|(?:助手|アシスタント)|(?:状态栏|ステータス))/i.test(name))return false;
            return /(?:(?:校历|暦の検証)|世界年表|事件年表|(?:原著年表|原作年表)|(?:时间线|タイムライン)|(?:时间轴|時間軸)|(?:大事记|主要な出来事)|(?:大事件摘要|重大事件の要約)|(?:历史大事件|歴史上の重大事件)|(?:剧情大纲|物語のあらすじ)|(?:剧情章节|物語の章)|(?:章节控制器|章の制御)|(?:主线年表|本筋の年表))/i.test(name);
        }
    }

    const DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY=new WorldKnowledgeSelectionPolicy();
    let ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY=DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY;
    function parseSelectedEntryKey(value){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.parseKey(value);}
    function normalizeWorldbookIdentity(value){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.normalizeIdentity(value);}
    function normalizeWorldbookEntryTitle(value){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.normalizeTitle(value);}
    function selectedEntryMatches(entry,selectedEntries){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.matches(entry,selectedEntries);}
    function isTechnicalBook(title){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.isTechnical(title);}
    function isTimelineBackboneEntry(title){return ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY.isTimelineBackbone(title);}
    class WorldRecordCatalog {
        constructor(){
            this.npcAuditLevels=["雑兵級","エリート級","首領/Boss級"];
            this.records={
                事件:{説明:'',時間:'',条件:'',前因:[],状態:"発生待ち",默认走向:'',结果:'',公开征兆:'',地点:''},
                人物:{所属世界:'',監査級:'',地点:'',目標:'',行动:'',认知:[],下次检查:'',关联事件:[],公开动态:''},
                势力地区:{タイプ:'地区',説明:'',目標:'',进展:'',下次检查:'',关联事件:[],公开动态:''},
                历史:{時間:'',事实:'',关联事件:[]},
                传播:{关联事件:[],出典:'',范围:'',時間:'',内容:'',真相:'',状態:"伝播中"}
            };
            this.details={
                事件:{分类:'',开始时间:'',预计结束:'',更新时间:'',下次检查:'',参与者:[],关联任务:[],可见影响:[{時間:'',地点:'',影响:''}]},
                人物:{状態:'',更新时间:'',开始时间:'',预计结束:'',行程:[{开始:'',结束:'',地点:'',行动:'',状態:'',结果:''}],承诺:[{对象:'',内容:'',期限:'',解除条件:''}],待决事项:[{问题:'',选项:[],等待:''}],关系变化:[{对象:'',关系:'',变化:'',時間:''}],认知来源:[{事实:'',出典:'',获知时间:'',状態:''}],登场条件:'',背景关联:[{タイプ:'',名称:'',关系:''}]},
                势力地区:{更新时间:'',控制方:'',争夺方:[],资源:[{名称:'',数量:'',用途:'',限制:''}],内部派系:[{名称:'',立场:'',行动:'',影响:''}],近期变化:[{時間:'',事实:'',关联事件:''}],环境状态:[],现场群体:[{名称:'',规模:'',身分:'',动态:''}]},
                历史:{},
                传播:{更新时间:'',到期时间:'',受众:[],引发行动:[]}
            };
            this.modelRecords=copy(this.records);
            this.modelDetails=copy(this.details);
            for(const key of ['承诺','待决事项','关系变化'])delete this.modelDetails.人物[key];
        }
    }

    class WorldEntityIdentityPolicy {
        key(value){
            return String(value||'').toLowerCase().replace(/[\\/／·・._\-\s]+/g,'');
        }
        stableNameIn(bucket,name){
            if(!plain(bucket))return '';
            if(Object.hasOwn(bucket,name))return name;
            const key=this.key(name),matches=Object.keys(bucket).filter(item=>this.key(item)===key);
            return matches.length===1?matches[0]:'';
        }
        locationRelated(a,b){
            const x=this.key(a),y=this.key(b);if(!x||!y)return false;
            return x===y||x.includes(y)||y.includes(x);
        }
    }

    const DEFAULT_WORLD_RECORD_CATALOG=new WorldRecordCatalog();
    const DEFAULT_WORLD_ENTITY_IDENTITY_POLICY=new WorldEntityIdentityPolicy();

    const NPC_AUDIT_LEVELS=DEFAULT_WORLD_RECORD_CATALOG.npcAuditLevels;
    const RECORDS=DEFAULT_WORLD_RECORD_CATALOG.records;
    const DETAILS=DEFAULT_WORLD_RECORD_CATALOG.details;
    const MODEL_RECORDS=DEFAULT_WORLD_RECORD_CATALOG.modelRecords;
    const MODEL_DETAILS=DEFAULT_WORLD_RECORD_CATALOG.modelDetails;

    const nameKey=value=>DEFAULT_WORLD_ENTITY_IDENTITY_POLICY.key(value);
    function stableNameIn(bucket,name){return DEFAULT_WORLD_ENTITY_IDENTITY_POLICY.stableNameIn(bucket,name);}
    function worldLocationRelated(a,b){return DEFAULT_WORLD_ENTITY_IDENTITY_POLICY.locationRelated(a,b);}
    class WorldStateFactory {
        emptyBackend() {
            return {版本:5,処理済みフロア:'',処理済み時刻:'',事件:{},人物:{},势力地区:{},历史:{},历史总结:{},传播:{},最近变化:[],资产墓碑:{}};
        }
    }

    const DEFAULT_WORLD_STATE_FACTORY=new WorldStateFactory();
    function emptyState(){return DEFAULT_WORLD_STATE_FACTORY.emptyBackend();}

    const WORLD_MODEL_IGNORED_PATHS = [
        /^\/(?:任务|任務)(?:\/|$)/,
        /^\/(?:系统状态|システム状態)\/(?:待播报记录|配信待ち記録)$/,
        /^\/世界\/(?:后台|バックステージ)\/(?:(?:版本|バージョン)|(?:已处理楼层|処理済みフロア)|(?:已处理时间|処理済み時刻)|运行记录|最近变化)(?:\/|$)/,
        /^\/世界\/(?:后台|バックステージ)\/(?:剧本|シナリオ)(?:\/|$)/
    ];


    // Read-boundary compatibility for the engine's own records only. Entity names and prose are never rewritten.
    const JP_RECORD_ALIASES={"传闻":"噂","布告与檄文":"布告と檄文","发布者":"発布者","张贴位置":"掲示位置","街头巷议":"街頭の噂","可信度":"信頼度","来源":"出典","情报交易":"情報取引","卖家":"売り手","情报评级":"情報評価","要价":"要求価格","摘要":"要約","真实内幕":"真の内幕","关系リスト":"関係リスト","背景故事":"背景","层级":"階層","当前形态":"現在形態","标签":"タグ","标签[]":"タグ[]","类型":"タイプ","描述":"説明","品质":"品質","效果":"効果","状态":"状態","消耗":"消費","身份":"身分","身份[]":"身分[]","是否队友":"仲間","态度":"態度","外貌":"外見","喜爱":"好み","形态库":"形態庫","力量":"筋力","体质":"体力","血统":"血統","在场":"登場","着装":"服装","职业":"職業","种族":"種族","装备":"装備","持续":"持続","最终属性":"最終属性","魔法减伤率":"魔法軽減率","物理减伤率":"物理軽減率","先攻DC":"先制DC","角色":"キャラ","空间币":"スペースコイン","权限凭证":"権限証憑","任务":"任務","副本成就":"インスタンス実績","奖励":"報酬","难度":"難易度","说明":"説明","击杀":"撃破","列表":"リスト","惩罚":"罰則","交付":"納品","目标":"目標","委托方":"依頼元","隐藏真相":"隠された真実","成员商库":"メンバー商品庫","道具列表":"道具リスト","道具列表[]":"道具リスト[]","价格":"価格","技能列表":"技能リスト","技能列表[]":"技能リスト[]","升级列表":"升級リスト","升级列表[]":"升級リスト[]","所属大类":"所属カテゴリ","替换目标":"置換対象","血统列表":"血統リスト","血统列表[]":"血統リスト[]","装备列表":"装備リスト","装备列表[]":"装備リスト[]","设置":"設定","单一世界":"単一世界","世界超稳":"世界超安定","法则":"法則","法则[]":"法則[]","后台":"バックステージ","货币":"通貨","购买力基准":"購買力基準","经济波动":"経済変動","历法":"暦法","闰年规则":"閏年規則","月份天数":"月日数","月份天数[]":"月日数[]","时间":"時間","势力":"勢力","领地":"領地","实力":"実力","风险":"リスク","稳定":"安定","异端雷达":"異端レーダー","当前模式":"現在モード","名单":"名簿","经历":"経歴","阵营":"陣営","因果轨道":"因果軌道","当前阶段":"現在段階","故事线":"ストーリーライン","偏移记录":"偏移記録","引发者":"誘発者","影响程度":"影響度","下一节点":"次ノード","系统状态":"システム状態","待播报记录":"配信待ち記録","当前轮次":"現在ラウンド","上次世界日期":"前回世界日付","试炼任务名单":"試練任務名簿","试炼任务名单[]":"試練任務名簿[]","试炼已完成":"試練完了","是否可试炼":"試練可能","是否试炼任务":"試練任務中","是否在主神空间":"主神空間滞在中","是否战斗中":"戦闘中","游玩天数":"プレイ日数","待办事件":"待機イベント","待办事件[]":"待機イベント[]","建设序列":"建設シーケンス","产出":"産出","功能":"機能","阶段":"段階","下次产出日期":"次回産出日","下次产出游天":"次回産出游日","能源":"エネルギー","当前":"現在","所属对象":"所属対象","所属对象[]":"所属対象[]","完整度":"完全度","消耗单元":"消耗ユニット","余量":"残量","主体规模":"主体規模","驻扎人员":"駐留人員","关系列表":"関係リスト","增益":"バフ","进行中":"進行中","可交付":"提出可能","可结算":"決算可能","失败":"失敗","已完成":"完了","已取消":"取消済み","主神任务":"主神任務","晋升试炼":"昇格試練","已处理楼层":"処理済みフロア","已处理时间":"処理済み時刻","审计级别":"監査級"};
    const JP_RECORD_ENUMS={状态:{'待发生':'発生待ち','进行中':'進行中','已完成':'完了','已取消':'取消済み','传播中':'伝播中'},分类:{'近期节点':'直近の節目','宏观节点':'大局的な節目'}};
    function normalizeJapaneseRecord(category,input){
        if(!plain(input))return input;
        const schema=Object.assign({},RECORDS[category],DETAILS[category]);
        const normalize=(record,shape)=>{
            const out=copy(record);
            for(const [old,key]of Object.entries(JP_RECORD_ALIASES))if(Object.hasOwn(shape,key)&&Object.hasOwn(out,old)){
                if(!Object.hasOwn(out,key))out[key]=out[old];delete out[old];
            }
            for(const [old,values]of Object.entries(JP_RECORD_ENUMS)){
                const key=JP_RECORD_ALIASES[old]||old;
                if(Object.hasOwn(shape,key)&&Object.hasOwn(values,out[key]))out[key]=values[out[key]];
            }
            for(const [key,sample]of Object.entries(shape))if(Array.isArray(sample)&&plain(sample[0])&&Array.isArray(out[key]))out[key]=out[key].map(v=>plain(v)?normalize(v,sample[0]):v);
            return out;
        };
        return normalize(input,schema);
    }

    class WorldPatchPolicy {
        tokens(path) {
            if (typeof path !== 'string' || !path.startsWith('/')) throw new Error("パッチパスは / で始まる必要があります");
            const parts = path.slice(1).split('/').map(p => p.replace(/~1/g, '/').replace(/~0/g, '~'));
            if (parts.some(p => !p || forbidden.has(p))) throw new Error("パッチパスに不正なキーが含まれています");
            return parts;
        }

        get(obj,parts) {
            return parts.reduce((v,key)=>v!=null&&Object.prototype.hasOwnProperty.call(v,key)?v[key]:undefined,obj);
        }

        pointer(parts) {
            return '/'+parts.map(p=>String(p).replace(/~/g,'~0').replace(/\//g,'~1')).join('/');
        }

        canonicalizeParts(parts,stat) {
            const p=parts.slice();
            if(p[0]==='世界'&&p[1]===PATH&&p[3]&&['人物','事件','势力地区'].includes(p[2])){
                const pools=[];
                const state=stat?.世界?.[PATH]||{};
                if(plain(state[p[2]]))pools.push(...Object.keys(state[p[2]]));
                if(p[2]==='人物'){
                    pools.push(...Object.keys(stat?.関係リスト||{}));
                    pools.push(...Object.keys(stat?.世界?.異端レーダー?.名簿||{}));
                }
                const key=nameKey(p[3]),matches=[...new Set(pools)].filter(name=>nameKey(name)===key);
                if(matches.length===1)p[3]=matches[0];
            }
            return p;
        }

        bootstrapBackendParent(stat,parts) {
            if(parts[0]!=='世界'||parts[1]!==PATH||parts.length!==5)return;
            const category=parts[2],name=parts[3];
            if(!['事件','人物','势力地区','传播'].includes(category))return;
            const bucket=stat.世界[PATH][category]||(stat.世界[PATH][category]={});
            if(Object.hasOwn(bucket,name))return;
            const seed=category==='事件'?{説明:name}:category==='人物'?{所属世界:stat.世界.名称||'',地点:'',行动:''}:{};
            bucket[name]=this.normalizeBackendRecord(category,seed);
        }

        canUpsertMissing(parts,stat) {
            if(parts[0]==='世界'&&parts[1]===PATH){
                if(parts[2]==='历史'||parts[2]==="シナリオ")return false;
                if(parts.length===4&&['事件','人物','势力地区','传播'].includes(parts[2]))return true;
                if(parts.length===5&&['事件','人物','势力地区','传播'].includes(parts[2])&&!!this.get(stat,parts.slice(0,4)))return true;
            }
            if(parts[0]==='世界'&&parts[1]==="因果軌道"&&parts[2]==="偏移記録"&&parts.length===4)return true;
            if(parts[0]==='世界'&&["勢力",'探索'].includes(parts[1])&&parts.length===3)return true;
            if(parts[0]==="噂"&&["街頭の噂","情報取引","布告と檄文"].includes(parts[1])&&parts.length===3)return true;
            return false;
        }

        checkRecord(value,template,optional={}) {
            if(!plain(value))throw new Error("レコードは完全なオブジェクトである必要があり、テキストや配列は使用できません");
            const missing=Object.keys(template).filter(k=>!Object.hasOwn(value,k));
            const unknown=Object.keys(value).filter(k=>!Object.hasOwn(template,k)&&!Object.hasOwn(optional,k));
            if(missing.length||unknown.length)throw new Error("レコードのフィールドが不完全か未対応です："+(missing.length?"不足 "+missing.join('、'):'')+(unknown.length?"；不明 "+unknown.join('、'):''));
            for(const [key,base] of Object.entries(template)){
                const v=value[key];
                if(Array.isArray(base)?!Array.isArray(v)||v.some(x=>typeof x!=='string'):typeof v!==typeof base)throw new Error("レコードフィールドの型が正しくありません："+key);
            }
        }

        checkDetails(value,optional) {
            for(const [key,base] of Object.entries(optional)){
                if(!Object.hasOwn(value,key))continue;
                const v=value[key];
                if(Array.isArray(base)){
                    if(!Array.isArray(v))throw new Error("明細はリストである必要があります："+key);
                    if(base.length)v.forEach(item=>this.checkRecord(item,base[0]));
                    else if(v.some(item=>typeof item!=='string'))throw new Error("明細はテキストのリストである必要があります："+key);
                }else if(typeof v!==typeof base)throw new Error("明細の型が正しくありません："+key);
            }
        }

        normalizeBackendRecord(category,value,old) {
            value=normalizeJapaneseRecord(category,value);old=normalizeJapaneseRecord(category,old);
            if(!plain(value)||!Object.hasOwn(RECORDS,category))return value;
            const template=RECORDS[category],optional=DETAILS[category]||{};
            const out=Object.assign(copy(template),plain(old)?copy(old):{});
            for(const [key,item] of Object.entries(value)){
                if(Object.hasOwn(template,key)||Object.hasOwn(optional,key))out[key]=copy(item);
            }
            return out;
        }

        sanitizeModelPatches(patches) {
            if(!Array.isArray(patches))return patches;
            return patches.filter(p=>!(plain(p)&&typeof p.path==='string'&&WORLD_MODEL_IGNORED_PATHS.some(rule=>rule.test(p.path))));
        }

        normalizeModelPatches(patches) {
            if(!Array.isArray(patches))return patches;
            const out=[],esc=value=>String(value).replace(/~/g,'~0').replace(/\//g,'~1');
            for(const raw of patches){
                if(!plain(raw)){out.push(raw);continue;}
                const patch=copy(raw);
                if(typeof patch.path==='string')patch.path=patch.path.replace(/^\/世界\/(?:因校轨道|因校軌道)(?=\/|$)/,"/世界/因果軌道");
                if(patch.path==="/世界/因果軌道"&&patch.op!=='remove'&&plain(patch.value)){
                    for(const key of ["現在段階","ストーリーライン","次ノード"]){
                        if(Object.hasOwn(patch.value,key))out.push({op:'add',path:"/世界/因果軌道/"+key,value:copy(patch.value[key])});
                    }
                    if(plain(patch.value.偏移記録))for(const [name,value] of Object.entries(patch.value.偏移記録)){
                        out.push({op:'add',path:"/世界/因果軌道/偏移記録/"+esc(name),value:copy(value)});
                    }
                    continue;
                }
                if(patch.path==="/世界/因果軌道/偏移記録"&&patch.op!=='remove'&&plain(patch.value)){
                    for(const [name,value] of Object.entries(patch.value))out.push({op:'add',path:"/世界/因果軌道/偏移記録/"+esc(name),value:copy(value)});
                    continue;
                }
                out.push(patch);
            }
            return out;
        }

        removable(parts) {
            const [a,b,c]=parts;
            if(a==="噂")return true;
            if(a==='世界'&&b===PATH&&c==='传播')return true;
            if(a==='资产'&&parts.length===2)return true;
            return a==='世界'&&b==="因果軌道"&&c==="偏移記録"&&parts.length===4;
        }

        allowed(parts,stat,op='') {
            const [a,b,c,d]=parts;
            if(a==='世界'&&b===PATH){
                if(c==="シナリオ")return false;
                if(!Object.hasOwn(RECORDS,c)||!d)return false;
                if(c==='历史')return parts.length===4;
                return parts.length===4||(parts.length===5&&(Object.hasOwn(RECORDS[c],parts[4])||Object.hasOwn(DETAILS[c],parts[4])));
            }
            if(a==='世界'&&b==="因果軌道"){
                if(["現在段階","ストーリーライン","次ノード"].includes(c))return parts.length===3;
                if(c==="偏移記録"&&parts.length===4&&op==='remove')return true;
                return !(stat.設定||{}).世界超安定&&c==="偏移記録"&&parts.length===4;
            }
            if(a==='世界'&&b==="時間")return parts.length===2;
            if(a==='世界'&&b==="通貨")return parts.length===3&&Object.hasOwn(CURRENCY_FIELDS,c);
            if(a==='世界'&&b==="暦法")return parts.length===3&&Object.hasOwn(CALENDAR_FIELDS,c);
            if(a==='世界'&&["勢力",'探索'].includes(b))return parts.length===3||(parts.length===4&&Object.hasOwn(b==="勢力"?{実力:0,領地:0,説明:0,声望:0}:{リスク:0,探索度:0,説明:0,隠された真実:0},d));
            if(a==='世界'&&b==="異端レーダー")return parts.length===5&&c==="名簿"&&parts[4]==="状態"&&!(stat.設定||{}).単一世界;
            if(a==="噂"&&["街頭の噂","情報取引","布告と檄文"].includes(b))return parts.length===3;
            if(a==='资产')return parts.length===2&&!!b;
            if(a==="関係リスト")return parts.length===3&&RELATION_SYNC_KEYS.has(c)&&!!this.get(stat,[a,b]);
            if(a==="任務")return parts.length===4&&["リスト","インスタンス実績"].includes(b)&&d==="状態"&&!!this.get(stat,[a,b,c]);
            return false;
        }
    }

    const DEFAULT_WORLD_PATCH_POLICY=new WorldPatchPolicy();
    let ACTIVE_WORLD_PATCH_POLICY=DEFAULT_WORLD_PATCH_POLICY;
    function tokens(path){return ACTIVE_WORLD_PATCH_POLICY.tokens(path);}
    function get(obj,parts){return ACTIVE_WORLD_PATCH_POLICY.get(obj,parts);}
    function pointer(parts){return ACTIVE_WORLD_PATCH_POLICY.pointer(parts);}
    function canonicalizeParts(parts,stat){return ACTIVE_WORLD_PATCH_POLICY.canonicalizeParts(parts,stat);}
    function bootstrapBackendParent(stat,parts){return ACTIVE_WORLD_PATCH_POLICY.bootstrapBackendParent(stat,parts);}
    function canUpsertMissing(parts,stat){return ACTIVE_WORLD_PATCH_POLICY.canUpsertMissing(parts,stat);}
    function checkRecord(value,template,optional={}){return ACTIVE_WORLD_PATCH_POLICY.checkRecord(value,template,optional);}
    function checkDetails(value,optional){return ACTIVE_WORLD_PATCH_POLICY.checkDetails(value,optional);}
    function normalizeBackendRecord(category,value,old){return ACTIVE_WORLD_PATCH_POLICY.normalizeBackendRecord(category,value,old);}
    function sanitizeModelPatches(patches){return ACTIVE_WORLD_PATCH_POLICY.sanitizeModelPatches(patches);}
    function normalizeModelPatches(patches){return ACTIVE_WORLD_PATCH_POLICY.normalizeModelPatches(patches);}
    function allowed(parts,stat,op=''){return ACTIVE_WORLD_PATCH_POLICY.allowed(parts,stat,op);}
    const WORLD_TIME_MACHINE_DESCRIPTION="月日まで確定している場合は {yyy}年-{mm}月-{dd}日-{時間帯} を使用する。時間帯は未明/黎明/早朝/朝/午前/正午/昼過ぎ/午後/夕方/夜の始まり/夜/深夜から選ぶ。季節や段階しか特定できない場合は元の粒度を保つ。";
    const WORLD_DAYPART_ALIASES=Object.freeze({
        '夜の始まり':'入夜','昼過ぎ':'午后','夜間':'晚上','早朝':'清晨','未明':'凌晨',
        '午前':'上午','正午':'中午','午後':'下午','夕方':'傍晚','黄昏':'傍晚','朝':'早晨','夜':'晚上'
    });

    class WorldTimePolicy {
        normalizeDaypartAlias(value) {
            let source=String(value||'');
            source=source.replace(/夜の始まり|昼過ぎ|夜間|早朝|未明|午前|正午|午後|夕方|黄昏|(?<!清|早)朝|(?<!深|入|暗|半)夜/g, value=>WORLD_DAYPART_ALIASES[value]||value);
            return source;
        }

        key(value) {
            const source=this.normalizeDaypartAlias(value);
            let m=source.match(/(\d{1,4})\s*年\s*-?\s*(\d{1,2})\s*月\s*-?\s*(\d{1,2})\s*日/);
            if(!m)m=source.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
            if(!m)return null;
            const y=+m[1],month=+m[2],day=+m[3];
            if(!Number.isInteger(y)||!Number.isInteger(month)||!Number.isInteger(day)||month<1||month>12||day<1)return null;
            const date=new Date(0);
            date.setUTCFullYear(y,month-1,day);date.setUTCHours(0,0,0,0);
            if(date.getUTCFullYear()!==y||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;

            const exact=source.match(/(?:^|[日T\s_-])(\d{1,2}):([0-5]\d)(?::([0-5]\d))?/);
            if(exact){
                const hour=Number(exact[1]),minute=Number(exact[2]),second=Number(exact[3]||0);
                if(!Number.isInteger(hour)||hour<0||hour>23)return null;
                return date.getTime()/3600000+hour+minute/60+second/3600;
            }

            const part=source.match(/(?:凌晨|未明)|黎明|(?:清晨|早朝)|(?:早晨|朝)|(?:上午|午前)|(?:中午|正午)|(?:午后|昼過ぎ)|(?:下午|午後)|(?:傍晚|夕方)|(?:入夜|夜の始まり)|(?:晚上|夜)|深夜/);
            const hour={凌晨:2,黎明:5,清晨:6,早晨:8,上午:10,中午:12,午后:14,下午:15,傍晚:18,入夜:19,晚上:20,深夜:23};
            let dayHour=part?hour[part[0]]:0;
            const branch=source.match(/([子丑寅卯辰巳午未申酉戌亥])(?:时|時)(?:([一二三四1234])刻)?/);
            if(branch){
                const branchHour={子:23,丑:1,寅:3,卯:5,辰:7,巳:9,午:11,未:13,申:15,酉:17,戌:19,亥:21};
                const quarterMap={一:1,二:2,三:3,四:4,'1':1,'2':2,'3':3,'4':4};
                dayHour=branchHour[branch[1]]+(quarterMap[branch[2]]||0)*0.25;
            }
            return date.getTime()/3600000+dayHour;
        }

        capacity(previous,current) {
            const from=String(previous||'').trim(),to=String(current||'').trim();
            const a=this.key(from),b=this.key(to);
            if(!from)return {起点:"初回実行/前回エンジン時刻なし",终点:to,小时:null,等级:"初回初期化",允许:"先にマクロ骨格を構築する；直近の細部は現在の事実だけに基づき、追加の所要時間は仮定しない。"};
            if(a!==null&&b!==null){
                const hours=Math.max(0,b-a);
                if(hours<=0)return {起点:from,终点:to,小时:0,等级:"未進行",允许:"今回新たに確認した事実、即時反応、同期結果だけを記録できる；時間を要するバックグラウンド事項を完了してはならない。"};
                if(hours<=2)return {起点:from,终点:to,小时:hours,等级:"短時間帯",允许:"対面での短い会話、通信、デスクワーク、同一区域内の短距離移動まで；大規模な行動は準備か開始のみ。"};
                if(hours<=12)return {起点:from,终点:to,小时:hours,等级:"数時間",允许:"同一市街区内の移動、限定的な調査/準備、一度の作業段階まで；都市間移動や大規模な動員は通常完了できない。"};
                if(hours<=24)return {起点:from,终点:to,小时:hours,等级:"半日〜一日",允许:"一連の日常業務、ややまとまった一段階、または市街区の移転まで完了できる；長期工程と遠距離行動は依然として分割が必要。"};
                return {起点:from,终点:to,小时:hours,等级:'数日以上',允许:"長距離行程、物資輸送、拠点/組織事項の複数段階を進行できるが、因果と資源に沿って段階的に進める。"};
            }
            return {起点:from,终点:to,小时:null,等级:"作品内時間",允许:"作品内時間の意味論に従って行動容量を保守的に見積もる；スパンが確認できない場合は一歩だけ進め、長期結果へ直接跳ばない。"};
        }

        calendarDate(value,calendar) {
            const source=String(value||'').trim();
            const full=source.match(/(?:^|[^\d])(\d{1,4})\s*年\s*-?\s*(\d{1,2})\s*月\s*-?\s*(\d{1,2})\s*日/)||source.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/);
            let y,month,d,fallbackYear=false;
            if(full){
                y=+full[1];month=+full[2];d=+full[3];
            }else{
                const md=source.match(/(?:^|[^\d])(\d{1,2})\s*月\s*-?\s*(\d{1,2})\s*日/)||source.match(/(?:^|[^\d])(\d{1,2})[-/.](\d{1,2})(?!\d)/);
                if(!md)return null;
                y=2026;month=+md[1];d=+md[2];fallbackYear=true;
            }
            const custom=Array.isArray(calendar?.月日数)?calendar.月日数.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=99).slice(0,24):[];
            if(custom.length){
                if(month<1||month>custom.length||d<1||d>custom[month-1])return null;
                return {y,m:month,d,key:y+'-'+month+'-'+d,fallbackYear,customCalendar:true};
            }
            const date=new Date(0);
            date.setFullYear(y,month-1,d);date.setHours(0,0,0,0);
            if(date.getFullYear()!==y||date.getMonth()!==month-1||date.getDate()!==d)return null;
            return {y,m:month,d,key:y+'-'+month+'-'+d,fallbackYear,customCalendar:false};
        }

        dayKey(value) {
            const key=this.key(value);
            return key===null?null:Math.floor(key/24);
        }

        hasExactClock(value) {
            return /(?:^|[日T\s_-])(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?/.test(String(value||''));
        }
        unset(value) {
            const raw=String(value??'').trim();
            return !raw||raw==="初期化待ち";
        }

        identity(value) {
            return String(value??'').trim().replace(/[\s·・_—–-]+/g,'');
        }

        claimsMonthDay(value) {
            const source=String(value??'').trim();
            return !!source&&/月/.test(source)&&/(?:第\s*)?\d{1,2}\s*日/.test(source);
        }

        calendarFor(stat,result) {
            return plain(result?.暦法)?result.暦法:(plain(stat?.世界?.暦法)?stat.世界.暦法:{});
        }

        assertCalendarCompatibleTimeValue(stat,result,value,label="時間") {
            const raw=String(value??'').trim();
            if(!this.claimsMonthDay(raw))return;
            if(this.calendarDate(raw,this.calendarFor(stat,result)))return;
            throw new Error(label+"の形式は暦法に使用できません："+raw+"。月日まで精密な場合は {yyy}年-{mm}月-{dd}日-{時間帯}を使用してください；月名で数字の月を代替しないでください。");
        }

        assertCalendarCompatibleWorldResultTimes(stat,result) {
            const temporalKeys=new Set(["時間",'开始时间','预计结束','更新时间','到期时间','下次检查','开始','结束','期限','获知时间']);
            const walk=(value,path=[])=>{
                if(Array.isArray(value)){for(let i=0;i<value.length;i++)walk(value[i],path.concat(i));return;}
                if(!plain(value))return;
                for(const [key,child] of Object.entries(value)){
                    const nextPath=path.concat(key);
                    if(typeof child==='string'&&temporalKeys.has(key))this.assertCalendarCompatibleTimeValue(stat,result,child,nextPath.join('.'));
                    else if(child&&typeof child==='object')walk(child,nextPath);
                }
            };
            walk(result);
            return result;
        }

        inferFromCurrentActivities(result) {
            const candidates=new Map();
            for(const item of result?.人物||[]){
                if(!plain(item)||item.操作==="今回の提案を撤回")continue;
                const activeFacts=String(item.地点||'').trim()&&String(item.目標||'').trim()&&String(item.行动||'').trim();
                const raw=String(item.更新时间||'').trim();
                if(!activeFacts||!raw)continue;
                const key=this.identity(raw);if(key&&!candidates.has(key))candidates.set(key,raw);
            }
            return candidates.size===1?Array.from(candidates.values())[0]:'';
        }

        resolveProposal(stat,result) {
            const explicit=String(result?.時間||'').trim();
            if(explicit)return explicit;
            if(!this.unset(stat?.世界?.時間))return '';
            return this.inferFromCurrentActivities(result);
        }

        assertNotBackwards(stat,nextTime) {
            const current=String(stat?.世界?.時間||'').trim();
            if(this.unset(current)||!nextTime)return;
            const before=this.key(current),after=this.key(nextTime);
            if(before!==null&&after!==null&&after<before)throw new Error("世界時間は後退できません："+current+' -> '+nextTime);
        }

        prepareCompile(stat,result) {
            const proposal=this.resolveProposal(stat,result);
            if(proposal)result.時間=proposal;
            this.assertCalendarCompatibleWorldResultTimes(stat,result);
            if(proposal)this.assertNotBackwards(stat,proposal);
            if(!proposal)return {proposal:'',result,validationStat:stat};
            const validationStat=copy(stat);
            if(!plain(validationStat.世界))validationStat.世界={};
            validationStat.世界.時間=proposal;
            return {proposal,result,validationStat};
        }

        finalizeCompile(originalStat,proposal,compiled) {
            if(!proposal)return compiled;
            const old=originalStat?.世界?.時間;
            if(String(old??'')!==proposal)compiled.patches.unshift({op:old===undefined?'add':'replace',path:"/世界/時間",value:proposal});
            compiled.result.時間=proposal;
            return compiled;
        }
    }

    const DEFAULT_WORLD_TIME_POLICY=new WorldTimePolicy();
    let ACTIVE_WORLD_TIME_POLICY=DEFAULT_WORLD_TIME_POLICY;
    function worldDateKey(value){return ACTIVE_WORLD_TIME_POLICY.key(value);}
    function worldTimeCapacity(previous,current){return ACTIVE_WORLD_TIME_POLICY.capacity(previous,current);}
    function calendarDate(value,calendar){return ACTIVE_WORLD_TIME_POLICY.calendarDate(value,calendar);}
    class WorldDueEventPolicy {
        constructor(timePolicy=DEFAULT_WORLD_TIME_POLICY){this.timePolicy=timePolicy||DEFAULT_WORLD_TIME_POLICY;}

        reviewPoint(event) {
            const nextCheck=String(event?.下次检查||'').trim();
            if(nextCheck)return {原文:nextCheck,键:this.timePolicy.key(nextCheck),出典:'下次检查'};
            const planned=String(event?.時間||event?.开始时间||'').trim();
            return {原文:planned,键:this.timePolicy.key(planned),出典:"計画時刻"};
        }

        review(stat) {
            const now=this.timePolicy.key(stat?.世界?.時間);if(now===null)return [];
            const events=stat?.世界?.[PATH]?.事件||{},due=[];
            for(const [名称,event] of Object.entries(events)){
                if(!plain(event)||event.状態!=="発生待ち")continue;
                const review=this.reviewPoint(event);
                if(review.出典==='下次检查'&&review.键!==null&&review.键>now)continue;
                if(review.出典==="計画時刻"&&(review.键===null||review.键>now))continue;
                due.push({
                    名称,
                    時間:String(event.時間||event.开始时间||''),
                    下次检查:String(event.下次检查||''),
                    条件:String(event.条件||''),
                    前因:copy(event.前因||[]),
                    复核依据:review.出典,
                    説明:"ソフト警告：このイベントは計画/再確認時刻に到達した。条件と前因が満たされれば進行中へ移行する；まだ発生しない場合は発生待ちのまま維持し、新しい「下次检查」を優先的に記入してよい。「条件」はイベントのトリガー条件のみを表し、延期や阻害として書き換えてはならない。未処理でも今回の世界進行が却下されることはない。"
                });
            }
            return due;
        }

        ensureHandled(_next,_dueList,_worldTime) {
            return [];
        }
    }

    const DEFAULT_WORLD_DUE_EVENT_POLICY=new WorldDueEventPolicy();
    function dueEventReviewPoint(event){return DEFAULT_WORLD_DUE_EVENT_POLICY.reviewPoint(event);}
    function relaxedDueEvents(stat){return DEFAULT_WORLD_DUE_EVENT_POLICY.review(stat);}
    // 世界活动交付：异端只是世界中的一类人物，不能成为唯一会变化的后台对象。
    const WORLD_ACTIVITY_DELIVERY_RULES=`【世界活動の提出 · 異端以外の世界も必ず進める】
1. 世界進行は異端だけのシミュレーションではありません。毎回、進行中・期限到来事件 → 勢力と地区の現場 → 関係の深い通常人物 → 伝播 → 異端の再確認、の順に計算します。異端で他の世界活動を代用しません。
2. 新世界または旧セーブに現場の情報がない場合、現在地・段階に関係する地区を最低 1 件、実際に発生中の現在事件・直近の節目を最低 1 件作成します。勢力が空なら情勢に実際に関与する実在の勢力・組織を優先して補います。作成する場合は WorldResult.勢力（実力・領地・名声の基本記録）と WorldResult.势力地区（タイプ=勢力の現場記録）を同名で提出します。勢力の初期化は任意目標であり、記録を埋めるための創作や、その検証失敗による他の実際の世界進行の停止は避けます。
3. 毎回、進行中事件の進展・状態変更、勢力・地区の変化、通常人物自身の用事の進展のいずれかで、異端以外の実質的な変化を最低 1 件提出します。更新時刻・次回確認だけの変更、原文の反復、未来の大局計画の補充だけでは不十分です。
4. 変化の規模は今回の時間容量に従います。時間が進まなければ即時反応・同期結果だけを処理し、数時間・日またぎ・数日の経過がある場合に大きな行動を進めます。この要件のために重大事件を創作しません。
5. ある分類に変化可能な事項がなければ、他の 2 分類を優先します。世界自体が終了・凍結した明確な設定がある場合だけ異端以外の変化なしを認めます。本文に言及がないことは停止理由になりません。`;

    class WorldActivityPolicy {
        semanticRecord(record,kind) {
            const out=plain(record)?copy(record):{};
            delete out.更新时间;
            delete out.下次检查;
            if(kind==='事件'&&out.分类==="大局的な節目"&&out.状態==="発生待ち")return null;
            return out;
        }

        recordMap(records,kind,excludeNames=new Set()) {
            const out={};
            for(const [name,record] of Object.entries(records||{})){
                if(excludeNames.has(nameKey(name)))continue;
                const semantic=this.semanticRecord(record,kind);
                if(semantic!==null)out[nameKey(name)]=semantic;
            }
            return out;
        }

        counts(stat) {
            const backend=stat?.世界?.[PATH]||{},areas=backend.势力地区||{},events=backend.事件||{},people=backend.人物||{};
            const alienKeys=new Set(Object.keys(stat?.世界?.異端レーダー?.名簿||{}).map(nameKey));
            return {
                地区数:Object.values(areas).filter(record=>plain(record)&&String(record.タイプ||'地区')!=="勢力").length,
                动态势力数:Object.values(areas).filter(record=>plain(record)&&String(record.タイプ||'地区')==="勢力").length,
                顶层势力数:Object.keys(stat?.世界?.勢力||{}).length,
                进行中世界事件数:Object.values(events).filter(record=>plain(record)&&record.状態==="進行中"&&record.分类!=="大局的な節目").length,
                普通人物数:Object.entries(people).filter(([name,record])=>plain(record)&&!alienKeys.has(nameKey(name))).length
            };
        }

        requirement(stat) {
            const backend=stat?.世界?.[PATH]||{},counts=this.counts(stat);
            const alienKeys=new Set(Object.keys(stat?.世界?.異端レーダー?.名簿||{}).map(nameKey));
            return {
                世界:String(stat?.世界?.名称||''),
                当前时间:String(stat?.世界?.時間||''),
                当前地点:String(stat?.世界?.地点||''),
                当前数量:counts,
                初始化缺口:{
                    地区:counts.地区数<1,
                    勢力:counts.动态势力数<1||counts.顶层势力数<1,
                    当前事件:counts.进行中世界事件数<1
                },
                必须非异端实质变化:true,
                基线:{
                    事件:this.recordMap(backend.事件,'事件'),
                    势力地区:this.recordMap(backend.势力地区,'势力地区'),
                    普通人物:this.recordMap(backend.人物,'人物',alienKeys),
                    勢力:this.recordMap(stat?.世界?.勢力||{},"勢力")
                }
            };
        }

        changed(next,requirement) {
            const backend=next?.世界?.[PATH]||{},alienKeys=new Set(Object.keys(next?.世界?.異端レーダー?.名簿||{}).map(nameKey));
            const after={
                事件:this.recordMap(backend.事件,'事件'),
                势力地区:this.recordMap(backend.势力地区,'势力地区'),
                普通人物:this.recordMap(backend.人物,'人物',alienKeys),
                勢力:this.recordMap(next?.世界?.勢力||{},"勢力")
            },changed=[];
            for(const category of Object.keys(after)){
                const before=requirement?.基线?.[category]||{},current=after[category]||{};
                const names=new Set([...Object.keys(before),...Object.keys(current)]);
                for(const name of names)if(!same(before[name],current[name])){changed.push(category+'/'+name);break;}
            }
            return changed;
        }

        ensureDelivery(next,requirement) {
            if(!requirement||next?.システム状態?.主神空間滞在中)return [];
            const counts=this.counts(next),issues=[];
            if(requirement.初始化缺口?.地区&&counts.地区数<1)issues.push("地区の現状がありません。現在地・現在の段階に関係する地区を最低 1 件作成してください");
            if(requirement.初始化缺口?.当前事件&&counts.进行中世界事件数<1)issues.push("進行中の世界事件がありません。現在事件または直近の節目を最低 1 件作成してください。未来の大局的な節目では代用できません");
            const changed=this.changed(next,requirement);
            if(requirement.必须非异端实质变化&&!changed.length)issues.push("今回の内容は異端・保守・未来の計画に限られ、異端以外の世界に実質的な変化がありません。事件、勢力地区、上位の勢力、通常人物のうち最低 1 項目を進めてください");
            if(issues.length)throw new Error("世界活動が不足："+issues.join('；'));
            return changed;
        }

        repairRequired(stat) {
            const requirement=this.requirement(stat),counts=requirement.当前数量;
            return counts.地区数<1||counts.进行中世界事件数<1;
        }
    }

    const DEFAULT_WORLD_ACTIVITY_POLICY=new WorldActivityPolicy();
    function worldActivitySemanticRecord(record,kind){return DEFAULT_WORLD_ACTIVITY_POLICY.semanticRecord(record,kind);}
    function worldActivityMap(records,kind,excludeNames=new Set()){return DEFAULT_WORLD_ACTIVITY_POLICY.recordMap(records,kind,excludeNames);}
    function worldActivityCounts(stat){return DEFAULT_WORLD_ACTIVITY_POLICY.counts(stat);}
    function worldActivityRequirement(stat){return DEFAULT_WORLD_ACTIVITY_POLICY.requirement(stat);}
    function worldActivityChanged(next,requirement){return DEFAULT_WORLD_ACTIVITY_POLICY.changed(next,requirement);}
    function ensureWorldActivityDelivery(next,requirement){return DEFAULT_WORLD_ACTIVITY_POLICY.ensureDelivery(next,requirement);}
    function worldActivityRepairRequired(stat){return DEFAULT_WORLD_ACTIVITY_POLICY.repairRequired(stat);}
    const VAGUE_EVENT_TIME=/^(?:(?:近期|近日)|(?:稍后|後ほど)|未来|(?:之后|この後)|(?:待定|未定)|未定|(?:未知|不明)|(?:不详|詳細不明)|(?:待确认|確認待ち)|(?:时间未定|時刻未定)|(?:日期未定|日付未定))$/;
    const STALE_CURRENT_EVENT_HOURS=7*24;
    const STALE_NEAR_EVENT_HOURS=30*24;
    class WorldTimelinePolicy {
        constructor(timePolicy=DEFAULT_WORLD_TIME_POLICY){this.timePolicy=timePolicy||DEFAULT_WORLD_TIME_POLICY;}
        storyStages(value) {
            return String(value||'').split(/\s*(?:→|⇒|->|=>|\n)\s*/).map(x=>x.trim()).filter(x=>x&&!/^((?:待初始化|初期化待ち)|(?:无|なし)|(?:未知|不明))$/.test(x));
        }
        importStory(stat) {
            const orbit=stat.世界.因果軌道||{},events=stat.世界[PATH]?.事件||{};
            if(Object.values(events).some(e=>e.分类==="メインノード"))return [];
            const stages=this.storyStages(orbit.ストーリーライン);
            if(stages.length<2||stages.length>30)return [];
            const index=stages.findIndex(n=>n===orbit.次ノード);
            const remaining=index>=0?stages.slice(index):stages;
            let previous='';
            return remaining.filter(name=>!Object.hasOwn(events,name)).map(name=>{
                const value={...copy(RECORDS.事件),説明:name,分类:"メインノード",前因:previous?[previous]:[],条件:previous?"先行ノード「"+previous+"」が本段階へ進むための条件を満たす":"世界設定と本文に基づいてトリガー条件を明確化する",下次检查:"今回の初回スケジューリング"};
                previous=name;
                return {op:'add',path:"/世界/バックステージ/事件/"+name.replace(/~/g,'~0').replace(/\//g,'~1'),value};
            });
        }
        timelineState(stat) {
            const state=stat.世界[PATH],events=Object.entries(state.事件||{}),now=this.timePolicy.key(stat.世界.時間);
            const waiting=events.filter(([,e])=>["発生待ち","進行中"].includes(e.状態));
            const near=events.filter(([,e])=>['当前事件',"直近の節目"].includes(e.分类));
            const macro=events.filter(([,e])=>e.分类==="大局的な節目");
            const macroFuture=macro.filter(([,e])=>e.状態==="発生待ち");
            const macroOpen=macro.filter(([,e])=>["進行中","発生待ち"].includes(e.状態));
            const expand=macroFuture.filter(([,e])=>{const t=this.timePolicy.key(e.時間||e.开始时间);return now!==null&&t!==null&&t>=now&&t-now<=7*24;});
            const semantic=waiting.filter(([,e])=>String(e.時間||e.开始时间||'').trim()&&this.timePolicy.key(e.時間||e.开始时间)===null);
            const orbit=stat.世界.因果軌道||{},orbitStages=this.storyStages(orbit.ストーリーライン);
            const macroNames=new Set(macro.map(([name])=>name));
            const orbitProjectionInvalid=orbitStages.length<3||orbitStages.length>5||orbitStages.some(name=>!macroNames.has(name));
            const orbitMacro=macroFuture.find(([name])=>name===orbit.次ノード);
            const datedMacro=macroFuture.map((item,index)=>({item,index,key:this.timePolicy.key(item[1].時間||item[1].开始时间)}))
                .filter(x=>x.key!==null&&(now===null||x.key>=now))
                .sort((a,b)=>a.key-b.key||a.index-b.index);
            const nextPair=orbitMacro||datedMacro[0]?.item||macroFuture[0]||null;
            const nextMacro=nextPair?{
                名称:nextPair[0],
                時間:nextPair[1].時間||nextPair[1].开始时间||'',
                分类:nextPair[1].分类||'',
                条件:nextPair[1].条件||'',
                前因:nextPair[1].前因||[],
                出典:"マクロイベント図"
            }:null;
            return {
                当前时间锚点:stat.世界.時間,
                因果轨道节点数:orbitStages.length,
                因果轨道需重建:orbitProjectionInvalid,
                需要初始化:near.length===0&&macro.length===0,
                当前活动事件数:waiting.filter(([,e])=>e.状態==="進行中").length,
                近期节点数:near.length,
                宏观节点数:macro.length,
                需要补充远期:macroOpen.length<3,
                下一宏观节点:nextMacro,
                桥接区间:{起点:stat.世界.時間,终点:nextMacro?.時間||"マクロノード未設定",边界事件:nextMacro?.名称||''},
                需要展开的宏观节点:expand.map(([名称,e])=>({名称,時間:e.時間||e.开始时间,条件:e.条件,前因:e.前因})),
                需语义复核节点:semantic.map(([名称,e])=>({名称,時間:e.時間||e.开始时间,条件:e.条件,下次检查:e.下次检查})),
                説明:"まず因果軌道、現在の事実、モデルが既に持つ世界/原著知識でマクロ骨格を構築する；世界書が存在する場合は補足的な補正にのみ用いる。その後、現在時刻から次の宏观节点までの間の直近の事件、人物、勢力、伝播だけを展開する。非グレゴリオ暦や作品内時間は作品の意味論で比較し、無理にグレゴリオ暦へ書き換えない。"
            };
        }
        sameTimeAnchor(a,b) {
            const x=String(a||'').trim(),y=String(b||'').trim();if(!x||!y)return false;
            if(x===y)return true;
            const shorter=x.length<=y.length?x:y,longer=x.length<=y.length?y:x;
            return shorter.length>=8&&longer.includes(shorter);
        }
        eventTimeAnchor(event) {
            return String(event?.時間||event?.开始时间||'').trim();
        }
        eventScheduleLabel(event) {
            const raw=this.eventTimeAnchor(event);
            if(raw&&!VAGUE_EVENT_TIME.test(raw))return raw;
            const condition=String(event?.条件||'').trim();
            if(condition)return "条件トリガー · "+condition;
            const predecessors=Array.isArray(event?.前因)?event.前因.filter(Boolean):[];
            if(predecessors.length)return "先行ノード到達後 · "+predecessors.join('、');
            return "時刻の補記待ち";
        }
        staleActiveEvents(stat) {
            const now=this.timePolicy.key(stat?.世界?.時間);if(now===null)return [];
            const out=[];
            for(const [名称,event] of Object.entries(stat?.世界?.[PATH]?.事件||{})){
                if(event?.状態!=="進行中"||event?.分类==="大局的な節目")continue;
                const touched=this.timePolicy.key(event.更新时间||event.時間||event.开始时间);
                if(touched===null)continue;
                const threshold=event.分类==='当前事件'?STALE_CURRENT_EVENT_HOURS:STALE_NEAR_EVENT_HOURS;
                const age=now-touched;
                if(age>threshold)out.push({名称,分类:event.分类,状態:event.状態,時間:event.時間||event.开始时间||'',更新时间:event.更新时间||'',已陈旧小时:age,説明:"局所的な活動が長期間にわたり進行中のまま留まっている；終了/中止とするか、継続を確認して現在の世界時間、現在の進展、次回チェックまで更新すべき。"});
            }
            return out;
        }
        temporalAnomalies(stat) {
            const nowRaw=String(stat?.世界?.時間||''),nowKey=this.timePolicy.key(nowRaw),nowDay=this.timePolicy.dayKey(nowRaw);
            if(nowDay===null)return [];
            const nowExact=this.timePolicy.hasExactClock(nowRaw),state=stat?.世界?.[PATH]||{},out=[];
            const push=(タイプ,名称,字段,值,原因)=>{
                const valueRaw=String(值||''),valueKey=this.timePolicy.key(valueRaw),valueDay=this.timePolicy.dayKey(valueRaw);
                if(valueDay===null)return;
                if(valueDay>nowDay){out.push({タイプ,名称,字段,值:valueRaw,原因});return;}
                if(valueDay<nowDay||タイプ!=='人物'||!nowExact||!this.timePolicy.hasExactClock(valueRaw))return;
                if(nowKey!==null&&valueKey!==null&&valueKey>nowKey)out.push({タイプ,名称,字段,值:valueRaw,原因});
            };
            for(const [name,event] of Object.entries(state.事件||{})){
                if(["進行中","完了"].includes(event?.状態))push('事件',name,"時間",event.時間||event.开始时间,"発生済み/進行中の事件は現在の世界時間より後にできない");
                if(event?.更新时间)push('事件',name,'更新时间',event.更新时间,"事件の更新時間は現在の世界時間より後にできない");
            }
            for(const [name,person] of Object.entries(state.人物||{}))if(person?.更新时间)push('人物',name,'更新时间',person.更新时间,"人物の現在の動態は未来に由来できない");
            for(const [name,area] of Object.entries(state.势力地区||{})){
                if(area?.更新时间)push('势力地区',name,'更新时间',area.更新时间,"地区の現在状態は未来に由来できない");
                for(const change of area?.近期变化||[])if(change?.時間)push('势力地区',name,"最近の変化.時刻",change.時間,"すでに発生した地区の変化は未来に由来できない");
            }
            for(const [name,item] of Object.entries(state.历史||{}))if(item?.時間)push('历史',name,"時間",item.時間,"歴史的事実は現在の世界時間より後にできない");
            for(const [name,item] of Object.entries(state.传播||{}))if(item?.時間)push('传播',name,"時間",item.時間,"すでに伝播を開始した情報は現在の世界時間より後にできない");
            return out;
        }
        validateTemporalWrites(before,next,patches) {
            const touched=new Set();
            for(const patch of patches||[]){
                let parts;try{parts=tokens(patch.path);}catch(_){continue;}
                if(parts[0]!=='世界'||parts[1]!==PATH)continue;
                if(['事件','人物','势力地区','历史','传播'].includes(parts[2])&&parts[3])touched.add(parts[2]+'\u0000'+parts[3]);
            }
            if(!touched.size)return;
            // Preserve the remaining rumor runtime decorator on the public compatibility seam.
            const all=temporalAnomalies(next);
            const hit=all.find(item=>touched.has(item.タイプ+'\u0000'+item.名称));
            if(hit)throw new Error("記録時刻が現在の世界時刻を超えています："+hit.タイプ+'/'+hit.名称+' '+hit.字段+'='+hit.值+'；'+hit.原因);
        }
        eventDisplayBucket(event) {
            if(event?.状態==="進行中")return 0;
            if(event?.状態==="発生待ち"&&event?.分类==='当前事件')return 1;
            if(event?.状態==="発生待ち"&&event?.分类==="直近の節目")return 2;
            if(event?.状態==="発生待ち"&&event?.分类==="大局的な節目")return 3;
            if(event?.状態==="完了")return 4;
            if(event?.状態==="取消済み")return 5;
            return 6;
        }
        sortWorldEvents(records,orbit={}) {
            const storyIndex=new Map(this.storyStages(orbit?.ストーリーライン).map((name,index)=>[nameKey(name),index]));
            return Object.entries(records||{}).sort((a,b)=>{
                const bucket=this.eventDisplayBucket(a[1])-this.eventDisplayBucket(b[1]);if(bucket)return bucket;
                if(a[1]?.分类==="大局的な節目"&&b[1]?.分类==="大局的な節目"){
                    const ai=storyIndex.get(nameKey(a[0])),bi=storyIndex.get(nameKey(b[0]));
                    if(ai!==undefined||bi!==undefined){
                        if(ai===undefined)return 1;
                        if(bi===undefined)return -1;
                        if(ai!==bi)return ai-bi;
                    }
                }
                const da=this.timePolicy.key(a[1]?.時間||a[1]?.开始时间),db=this.timePolicy.key(b[1]?.時間||b[1]?.开始时间);
                if(da!==db)return (da??Infinity)-(db??Infinity);
                return String(a[0]).localeCompare(String(b[0]),'zh-CN');
            });
        }
    }
    const DEFAULT_WORLD_TIMELINE_POLICY=new WorldTimelinePolicy();
    let ACTIVE_WORLD_TIMELINE_POLICY=DEFAULT_WORLD_TIMELINE_POLICY;
    function storyStages(value){return ACTIVE_WORLD_TIMELINE_POLICY.storyStages(value);}
    function importStory(stat){return ACTIVE_WORLD_TIMELINE_POLICY.importStory(stat);}
    function timelineState(stat){return ACTIVE_WORLD_TIMELINE_POLICY.timelineState(stat);}
    function sameWorldTimeAnchor(a,b){return ACTIVE_WORLD_TIMELINE_POLICY.sameTimeAnchor(a,b);}
    function eventTimeAnchor(event){return ACTIVE_WORLD_TIMELINE_POLICY.eventTimeAnchor(event);}
    function eventScheduleLabel(event){return ACTIVE_WORLD_TIMELINE_POLICY.eventScheduleLabel(event);}
    function staleActiveEvents(stat){return ACTIVE_WORLD_TIMELINE_POLICY.staleActiveEvents(stat);}
    function temporalAnomalies(stat){return ACTIVE_WORLD_TIMELINE_POLICY.temporalAnomalies(stat);}
    function validateTemporalWrites(before,next,patches){return ACTIVE_WORLD_TIMELINE_POLICY.validateTemporalWrites(before,next,patches);}
    function eventDisplayBucket(event){return ACTIVE_WORLD_TIMELINE_POLICY.eventDisplayBucket(event);}
    function sortWorldEvents(records,orbit={}){return ACTIVE_WORLD_TIMELINE_POLICY.sortWorldEvents(records,orbit);}
    const SOFT_MAINTENANCE_RULES=`【段階別の検証・任意の保守で全体を却下しない】
1. Schema、不正な状態、壊れた因果参照、原作やデータベースの明確な日付との矛盾は致命的エラーとする。事件の日程補完、噂の補充、伝播の再確認は任意の保守であり、それだけを理由に検証済みの結果全体を却下しない。
2. 具体的な時間、有効な条件、明確な前因のいずれかがあれば、利用可能な時間の基準点があると見なす。条件や前因は有効な相対時刻・因果時刻であり、日付の重複記入は不要。
3. 公開の噂が空なら、実在する世界情報を優先して 1 件追加する。補充できなかった分類は次回の保守項目として残す。件数合わせのために検証済みの事件・人物・因果を書き直さない。この規則は、空の分類に今回必ず 2 件追加するという必須検証を置き換える。
4. 訂正は実際の致命的エラーまたは却下された部分だけに限定する。検証済みの部分は再利用し、全体を書き直さない。`;

    class WorldSoftMaintenancePolicy {
        constructor(timeline=DEFAULT_WORLD_TIMELINE_POLICY){this.timeline=timeline||DEFAULT_WORLD_TIMELINE_POLICY;}

        eventHasUsableSchedule(event) {
            if(!plain(event))return false;
            const raw=this.timeline.eventTimeAnchor(event);
            if(raw&&!VAGUE_EVENT_TIME.test(raw))return true;
            const condition=String(event.条件||'').trim();
            if(condition&&!/^(?:(?:无|なし)|(?:暂无|なし)|(?:无条件|条件なし)|(?:未知|不明)|(?:待定|未定)|未定|(?:不详|詳細不明)|(?:待确认|確認待ち))$/.test(condition))return true;
            return Array.isArray(event.前因)&&event.前因.some(Boolean);
        }

        unscheduledEvents(stat) {
            return Object.entries(stat?.世界?.[PATH]?.事件||{}).filter(([,event])=>{
                if(!["発生待ち","進行中"].includes(event?.状態))return false;
                return !this.eventHasUsableSchedule(event);
            }).map(([名称,event])=>({
                名称,分类:event.分类,状態:event.状態,条件:event.条件,
                前因:copy(event.前因||[]),当前时间:this.timeline.eventScheduleLabel(event)
            }));
        }

        ensureEventTimeAnchors(next,required=[]) {
            const missing=[];
            for(const item of required||[]){
                const event=next?.世界?.[PATH]?.事件?.[item.名称];
                if(!event||!["発生待ち","進行中"].includes(event.状態))continue;
                if(!this.eventHasUsableSchedule(event))missing.push(item.名称);
            }
            return missing;
        }
    }

    const DEFAULT_WORLD_SOFT_MAINTENANCE_POLICY=new WorldSoftMaintenancePolicy();
    let ACTIVE_WORLD_SOFT_MAINTENANCE_POLICY=DEFAULT_WORLD_SOFT_MAINTENANCE_POLICY;
    function eventHasUsableSchedule(event){return ACTIVE_WORLD_SOFT_MAINTENANCE_POLICY.eventHasUsableSchedule(event);}
    class WorldChronologyPolicy {
        constructor(){this.guard=null;}

        setGuard(worldTime,books=[]){
            this.guard={worldTime:String(worldTime||''),books:Array.isArray(books)?books.map(String):[]};
            return this.guard;
        }

        clearGuard(){this.guard=null;}

        compactName(value) {
            return String(value||'').toLowerCase().replace(/[《》【】\[\]()（）“”‘’'"·・:：,，。.!！?？\s_\-\/\\]+/g,'');
        }

        evidenceForEvent(eventName,texts) {
            const name=String(eventName||'').trim();if(!name)return null;
            const datePattern=/(\d{1,4}\s*年\s*-?\s*\d{1,2}\s*月\s*-?\s*\d{1,2}\s*日|\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2})/g;
            let best=null;
            for(const rawText of texts||[]){
                const text=String(rawText||'');if(!text)continue;
                let at=text.indexOf(name),fromIndex=0;
                while(at>=0){
                    const left=Math.max(0,at-180),right=Math.min(text.length,at+name.length+180),window=text.slice(left,right),center=at-left+name.length/2;
                    datePattern.lastIndex=0;let match;
                    while((match=datePattern.exec(window))){
                        const key=worldDateKey(match[0]);if(key===null)continue;
                        const distance=Math.abs((match.index+match[0].length/2)-center);
                        if(!best||distance<best.distance)best={raw:match[0],key,distance};
                    }
                    fromIndex=at+Math.max(1,name.length);at=text.indexOf(name,fromIndex);
                }
            }
            return best;
        }

        shiftDeclared(stat,result,eventName) {
            const target=this.compactName(eventName);if(!target)return false;
            const records=[];
            for(const [name,item] of Object.entries(stat?.世界?.因果軌道?.偏移記録||{}))records.push({名称:name,...(plain(item)?item:{})});
            for(const item of result?.因果?.偏移記録||[])if(plain(item))records.push(item);
            return records.some(item=>{
                if(Number(item?.影響度)===0)return false;
                const marker=this.compactName(item?.名称),desc=String(item?.説明||''),signal=String(item?.名称||'')+' '+desc;
                const directlyRelated=(marker&&(marker.includes(target)||target.includes(marker)))||desc.includes(String(eventName||''));
                if(!directlyRelated)return false;
                const scheduleShift=/((?:提前|前倒し)|(?:提早|早める)|(?:延后|延期)|(?:推迟|遅延)|(?:改期|日程変更)|(?:时序|時系列)|(?:时间线|タイムライン)|(?:日期|日付)|(?:进程|進行)|(?:节点|節目))/;
                const plotShift=/((?:失效|失効)|取消|中止|(?:终止|終了)|(?:不再发生|発生しない)|(?:无法|できない)(?:(?:按|従い)|(?:照|従い))?(?:原定|当初の予定)|(?:原定|当初の予定).*(?:(?:失效|失効)|(?:改变|変更))|(?:改写|改変)|(?:替代|代替)|(?:分歧|分岐)|(?:偏离|逸脱)|阻止|(?:避免|回避)|(?:主线|本筋).*(?:(?:改变|変更)|(?:失效|失効)|(?:重构|再構成))|(?:剧情|物語).*(?:(?:改变|変更)|(?:失效|失効)|(?:重构|再構成)))/;
                return scheduleShift.test(signal)||plotShift.test(signal);
            });
        }

        validate(stat,result) {
            const guard=this.guard;if(!guard?.books?.length)return result;
            const events=stat?.世界?.[PATH]?.事件||{};
            for(const event of result?.事件||[]){
                if(!plain(event)||event.操作==="今回の提案を撤回")continue;
                const storedName=stableNameIn(events,String(event.名称||'')),stored=storedName?events[storedName]:null;
                const category=String(event.分类||stored?.分类||'');
                const status=String(event.状態||stored?.状態||"発生待ち");
                if(category!=="大局的な節目"||status!=="発生待ち")continue;
                if(!Object.hasOwn(event,"時間")&&!Object.hasOwn(event,'开始时间'))continue;
                const evidence=this.evidenceForEvent(event.名称,guard.books);if(!evidence)continue;
                if(this.shiftDeclared(stat,result,event.名称))continue;
                const proposedRaw=String(event.時間||event.开始时间||'').trim(),proposed=worldDateKey(proposedRaw);
                if(proposed===null)throw new Error("大局的な節目の日付が原作・データベースの基準日に従っていません："+event.名称+"；資料は明確に "+evidence.raw+"。曖昧な時刻や比較不能な時刻に変更しないでください。確認済みの因果変動によって日付、成立条件、発生の有無が変わった場合は、同じ回にその節目を明示した因果.変動を提出し、影響を受ける節目だけを再構成してください。");
                if(Math.floor(proposed/24)!==Math.floor(evidence.key/24))throw new Error("大局的な節目の日付が原作・データベースの基準日と矛盾："+event.名称+" 提出値："+proposedRaw+"；資料は明確に "+evidence.raw+"。物語を進めるために原作の期間を早めたり圧縮したりしないでください。確認済みの因果変動によって日付、成立条件、発生の有無が変わった場合は、同じ回にその節目を明示した因果.変動を提出し、影響を受ける節目だけを再構成してください。");
            }
            return result;
        }

        retryGuidance(error,rejected=[]) {
            const messages=[String(error?.message||error||''),...(rejected||[]).map(item=>String(item?.原因||''))].join('\n');
            if(!/(?:宏观节点日期(?:未服从|与).*原著\/数据库时间锚点|大局的な節目の日付.*(?:原作|データベース).*(?:基準日|時間基準))/.test(messages))return '';
            return DEFAULT_WORLD_RETRY_GUIDANCE_SERVICE.format('retryGuideChronology');
        }
    }

    const DEFAULT_WORLD_CHRONOLOGY_POLICY=new WorldChronologyPolicy();
    class WorldLifecycleService {
        personActivityMeta(stat,name,person) {
            const relations=stat?.関係リスト||{},roster=(stat?.設定||{}).単一世界?{}:(stat?.世界?.異端レーダー?.名簿||{});
            const events=stat?.世界?.[PATH]?.事件||{},worldTime=String(stat?.世界?.時間||''),currentLocation=String(stat?.世界?.地点||'');
            const formalName=stableNameIn(relations,name),alienName=stableNameIn(roster,name),alien=alienName?roster[alienName]:null;
            const activeAlien=!!(alien&&alien.状態!=='死亡'),deadAlien=!!(alien&&alien.状態==='死亡');
            const liveEntries=Object.entries(events).filter(([,event])=>event&&["発生待ち","進行中"].includes(event.状態));
            const liveNames=new Set(liveEntries.map(([eventName])=>eventName));
            const linked=Array.isArray(person?.关联事件)&&person.关联事件.some(eventName=>liveNames.has(eventName));
            const participant=liveEntries.some(([,event])=>(event.参与者||[]).some(item=>nameKey(item)===nameKey(name)));
            const here=!!(person?.地点&&currentLocation&&worldLocationRelated(person.地点,currentLocation));
            const now=worldDateKey(worldTime),updated=worldDateKey(person?.更新时间);
            const ageHours=now!==null&&updated!==null?now-updated:null;
            const recent=sameWorldTimeAnchor(person?.更新时间,worldTime)||(ageHours!==null&&ageHours>=0&&ageHours<=HOT_PERSON_RECENT_HOURS);
            const checkAt=worldDateKey(person?.下次检查);
            const dueSoon=now!==null&&checkAt!==null&&checkAt>=now-HOT_PERSON_RECENT_HOURS&&checkAt<=now+7*24;
            const terminal=TERMINAL_PERSON_STATUS.test(String(person?.状態||'').trim());
            return {formalName,activeAlien,deadAlien,linked,participant,here,recent,dueSoon,terminal,ageHours};
        }
        pruneColdTemporaryPeople(stat) {
            const people=stat?.世界?.[PATH]?.人物;if(!plain(people))return [];
            const removed=[];
            for(const [name,person] of Object.entries(people)){
                if(!plain(person))continue;
                const meta=this.personActivityMeta(stat,name,person);
                const protectedNow=!!(meta.formalName||meta.activeAlien||meta.linked||meta.participant||meta.here||meta.dueSoon);
                if(protectedNow)continue;
                const stale=meta.ageHours!==null&&meta.ageHours>COLD_TEMP_PERSON_GRACE_HOURS;
                if(meta.terminal||stale){delete people[name];removed.push(name);}
            }
            const cold=Object.entries(people).filter(([name,person])=>{
                if(!plain(person))return false;
                const meta=this.personActivityMeta(stat,name,person);
                const protectedNow=!!(meta.formalName||meta.activeAlien||meta.linked||meta.participant||meta.here||meta.dueSoon);
                const recentlyActive=meta.ageHours!==null&&meta.ageHours>=0&&meta.ageHours<=COLD_TEMP_PERSON_GRACE_HOURS;
                return !protectedNow&&!recentlyActive;
            });
            while(cold.length>COLD_TEMP_PERSON_TARGET){
                const [name]=cold.shift();
                if(Object.hasOwn(people,name)){delete people[name];removed.push(name);}
            }
            return removed;
        }
        pruneDeadAlienPeople(stat) {
            const people=stat?.世界?.[PATH]?.人物,roster=stat?.世界?.異端レーダー?.名簿;
            if(!plain(people)||!plain(roster))return [];
            const removed=[];
            for(const [alienName,alien] of Object.entries(roster)){
                if(alien?.状態!=='死亡')continue;
                const personName=stableNameIn(people,alienName);
                if(personName){delete people[personName];removed.push(personName);}
            }
            return removed;
        }
        collectEventRefs(state) {
            const refs=new Set();
            for(const event of Object.values(state.事件||{}))for(const id of event.前因||[])refs.add(id);
            for(const category of ['人物','势力地区','传播'])for(const record of Object.values(state[category]||{}))for(const id of record.关联事件||[])refs.add(id);
            return refs;
        }
        detachEventSoftRefs(state,eventName) {
            const changed=[];
            for(const category of ['人物','势力地区','传播']){
                for(const [name,record] of Object.entries(state?.[category]||{})){
                    if(!Array.isArray(record?.关联事件)||!record.关联事件.includes(eventName))continue;
                    record.关联事件=record.关联事件.filter(id=>id!==eventName);
                    changed.push(category+'/'+name);
                }
            }
            return changed;
        }
        archiveFinishedEvent(stat,state,name,event,archived) {
            // 历史锚点是永久已确认事实，不再按固定数量删除；旧事实由分层历史总结退出热上下文。
            let key="アーカイブ・"+name,seq=2;
            while(Object.hasOwn(state.历史||{},key))key="アーカイブ・"+name+'#'+seq++;
            state.历史=state.历史||{};
            state.历史[key]={
                時間:event.更新时间||event.预计结束||event.時間||stat.世界.時間||'',
                事实:event.结果||event.説明||(event.状態==="取消済み"?"イベントは中止された":"イベントは終了した"),
                关联事件:[]
            };
            delete state.事件[name];
            archived.push(name);
        }
        propagationEnded(record,nowKey) {
            if(!plain(record))return true;
            const status=String(record.状態||'').trim();
            if(/^(?:(?:已结束|終了済み)|(?:结束|終了)|(?:已停止|停止済み)|停止|(?:已失效|失効済み)|(?:失效|失効)|(?:已过期|期限切れ)|(?:过期|期限切れ)|(?:传播结束|伝播終了))$/.test(status))return true;
            const expiry=worldDateKey(record.到期时间);
            return expiry!==null&&nowKey!==null&&expiry<=nowKey;
        }
        pruneSoftRefsToColdFinishedEvents(state,now) {
            if(now===null)return [];
            const cold=new Set();
            for(const [name,event] of Object.entries(state?.事件||{})){
                if(!["完了","取消済み"].includes(event?.状態))continue;
                const endedAt=worldDateKey(event.更新时间||event.预计结束||event.時間);
                if(endedAt!==null&&now-endedAt>=FINISHED_EVENT_GRACE_HOURS)cold.add(name);
            }
            if(!cold.size)return [];
            const changed=[];
            for(const eventName of cold)changed.push(...this.detachEventSoftRefs(state,eventName));
            // 冷结束事件之间不再互相作为热前因；活跃/未来事件对旧事实的前因引用继续保护归档。
            for(const [name,event] of Object.entries(state?.事件||{})){
                if(!cold.has(name)||!Array.isArray(event?.前因)||!event.前因.some(id=>cold.has(id)))continue;
                event.前因=event.前因.filter(id=>!cold.has(id));
                changed.push('事件/'+name);
            }
            return changed;
        }
        compactFinishedEvents(stat,target=EVENT_TARGET) {
            const state=stat?.世界?.[PATH]; if(!state?.事件)return [];
            const archived=[],now=worldDateKey(stat?.世界?.時間);
            this.pruneSoftRefsToColdFinishedEvents(state,now);
            const protectedNames=new Set(storyStages(stat?.世界?.因果軌道?.ストーリーライン));
            let refs=this.collectEventRefs(state);
            const finished=()=>Object.entries(state.事件||{}).filter(([name,event])=>["完了","取消済み"].includes(event.状態)&&!refs.has(name)&&!protectedNames.has(name));
            // 有明确时间的旧结束事件，在经过一个世界日后直接冷归档；刚结束内容至少保留到下一阶段。
            for(const [name,event] of finished()){
                const endedAt=worldDateKey(event.更新时间||event.预计结束||event.時間);
                if(now!==null&&endedAt!==null&&now-endedAt>=FINISHED_EVENT_GRACE_HOURS)this.archiveFinishedEvent(stat,state,name,event,archived);
            }
            refs=this.collectEventRefs(state);
            let candidates=finished();
            while(candidates.length>RECENT_FINISHED_EVENT_TARGET){
                const [name,event]=candidates[0];
                this.archiveFinishedEvent(stat,state,name,event,archived);
                refs=this.collectEventRefs(state);candidates=finished();
            }
            while(Object.keys(state.事件||{}).length>target){
                refs=this.collectEventRefs(state);
                const candidate=Object.entries(state.事件||{}).find(([name,event])=>["完了","取消済み"].includes(event.状態)&&!refs.has(name));
                if(!candidate)break;
                this.archiveFinishedEvent(stat,state,candidate[0],candidate[1],archived);
            }
            return archived;
        }
        compact(stat) {
            const state=stat?.世界?.[PATH];
            if(!state)return {归档事件:[],回收传播:[],回收人物:[],回收探索:[]};
            const now=worldDateKey(stat?.世界?.時間),removedPropagation=[];
            for(const [name,record] of Object.entries(state.传播||{})){
                if(this.propagationEnded(record,now)){delete state.传播[name];removedPropagation.push(name);}
            }
            const archived=this.compactFinishedEvents(stat);
            const removedPeople=[...this.pruneDeadAlienPeople(stat),...this.pruneColdTemporaryPeople(stat)];
            return {
                归档事件:archived,
                回收传播:removedPropagation,
                回收人物:[...new Set(removedPeople)],
                // 探索是玩家长期台账：离开区域后不再由 lifecycle 回收。
                回收探索:[]
            };
        }
    }
    const DEFAULT_WORLD_LIFECYCLE_SERVICE=new WorldLifecycleService();
    let ACTIVE_WORLD_LIFECYCLE_SERVICE=DEFAULT_WORLD_LIFECYCLE_SERVICE;
    function personActivityMeta(stat,name,person){return ACTIVE_WORLD_LIFECYCLE_SERVICE.personActivityMeta(stat,name,person);}
    function pruneColdTemporaryPeople(stat){return ACTIVE_WORLD_LIFECYCLE_SERVICE.pruneColdTemporaryPeople(stat);}
    function pruneDeadAlienPeople(stat){return ACTIVE_WORLD_LIFECYCLE_SERVICE.pruneDeadAlienPeople(stat);}
    function collectEventRefs(state){return ACTIVE_WORLD_LIFECYCLE_SERVICE.collectEventRefs(state);}
    function detachEventSoftRefs(state,eventName){return ACTIVE_WORLD_LIFECYCLE_SERVICE.detachEventSoftRefs(state,eventName);}
    function archiveFinishedEvent(stat,state,name,event,archived){return ACTIVE_WORLD_LIFECYCLE_SERVICE.archiveFinishedEvent(stat,state,name,event,archived);}
    function propagationEnded(record,nowKey){return ACTIVE_WORLD_LIFECYCLE_SERVICE.propagationEnded(record,nowKey);}
    function pruneSoftRefsToColdFinishedEvents(state,now){return ACTIVE_WORLD_LIFECYCLE_SERVICE.pruneSoftRefsToColdFinishedEvents(state,now);}
    function compactFinishedEvents(stat,target=EVENT_TARGET){return ACTIVE_WORLD_LIFECYCLE_SERVICE.compactFinishedEvents(stat,target);}
    function compactWorldLifecycle(stat){return ACTIVE_WORLD_LIFECYCLE_SERVICE.compact(stat);}
    const ALIEN_ACTIVITY_STALE_HOURS=24;

    class WorldPersonActivityService {
        constructor(engine=null,timePolicy=DEFAULT_WORLD_TIME_POLICY){this.engine=engine;this.timePolicy=timePolicy||DEFAULT_WORLD_TIME_POLICY;}

        deriveContext(stat,personName,playerName='') {
            const backend=stat?.世界?.[PATH]||{},people=backend.人物||{},areas=backend.势力地区||{};
            const key=value=>String(value||'').toLowerCase().replace(/[\/／·・._\-\s]+/g,'');
            const normalizedName=key(personName);
            const pair=Object.entries(people).find(([name])=>key(name)===normalizedName);
            const person=pair?.[1]||{},location=String(person.地点||'').trim();
            const related=(a,b)=>{
                const x=key(a),y=key(b);if(!x||!y)return false;
                return x===y||x.includes(y)||y.includes(x);
            };
            const areaPair=Object.entries(areas)
                .filter(([,area])=>plain(area)&&area.タイプ!=="勢力"&&related(location,area?.名称||''))
                .sort((a,b)=>String(b[0]).length-String(a[0]).length)[0]
                ||Object.entries(areas)
                    .filter(([name,area])=>plain(area)&&area.タイプ!=="勢力"&&related(location,name))
                    .sort((a,b)=>String(b[0]).length-String(a[0]).length)[0];
            const areaName=String(areaPair?.[0]||''),area=areaPair?.[1]||{};
            const relationByKey=new Map(Object.entries(stat?.関係リスト||{}).map(([name,record])=>[key(name),{名称:name,记录:record}]));
            const alienByKey=new Map(Object.entries(stat?.世界?.異端レーダー?.名簿||{}).map(([name,record])=>[key(name),record]));
            const playerKeys=new Set([playerName,'{{user}}','<user>',"プレイヤー"].filter(Boolean).map(key));
            const nearby=Object.entries(people)
                .filter(([name,other])=>{
                    const otherKey=key(name);if(!plain(other)||otherKey===normalizedName||playerKeys.has(otherKey))return false;
                    if(alienByKey.get(otherKey)?.状態==='死亡')return false;
                    const otherLocation=String(other.地点||'').trim();if(!otherLocation)return false;
                    return areaName?related(otherLocation,areaName):related(otherLocation,location);
                })
                .map(([name,other])=>{
                    const profile=relationByKey.get(key(name));
                    const relation=profile?.记录||{};
                    const identity=Array.isArray(relation.身分)?relation.身分[0]:String(relation.身分||'');
                    return {
                        名称:String(name),
                        关系:key(other.地点)===key(location)?"直近":"同じ地区",
                        身分:identity,
                        行动:String(other.行动||other.公开动态||relation.態度||''),
                        可查看档案:!!profile,
                        档案名称:String(profile?.名称||''),
                        档案类型:profile?"正式記録":"現場タグ"
                    };
                })
                .slice(0,8);
            const objectList=(value,limit=8)=>Array.isArray(value)?value.filter(plain).slice(0,limit).map(copy):[];
            return {
                地区:areaName,
                地区动态:String(area.公开动态||area.进展||''),
                控制方:String(area.控制方||''),
                争夺方:Array.isArray(area.争夺方)?area.争夺方.filter(Boolean).slice(0,6):[],
                环境状态:Array.isArray(area.环境状态)?area.环境状态.filter(Boolean).slice(0,6):[],
                背景关联:objectList(person.背景关联,8),
                关联事件:Array.isArray(person.关联事件)?person.关联事件.filter(Boolean).slice(0,8):[],
                身边人物:nearby,
                现场群体:objectList(area.现场群体,8)
            };
        }

        projectHot(stat,limit=HOT_PERSON_TARGET) {
            const people=stat?.世界?.[PATH]?.人物||{},rows=[];
            for(const [name,person] of Object.entries(people)){
                if(!plain(person))continue;
                const meta=personActivityMeta(stat,name,person);
                if(meta.deadAlien)continue;
                const hot=meta.activeAlien||(!meta.terminal&&(meta.linked||meta.participant||meta.here||meta.dueSoon||meta.recent));
                if(!hot)continue;
                const score=(meta.activeAlien?1000:0)+(meta.linked||meta.participant?600:0)+(meta.here?450:0)+(meta.dueSoon?320:0)+(meta.recent?220:0)+(meta.formalName?20:0);
                rows.push({name,person,meta,score});
            }
            rows.sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name),'zh-CN'));
            const aliens=rows.filter(row=>row.meta.activeAlien),ordinary=rows.filter(row=>!row.meta.activeAlien).slice(0,Math.max(0,Number(limit)||0));
            return Object.fromEntries([...aliens,...ordinary].map(row=>[row.name,copy(row.person)]));
        }

        alienRosterMatch(stat,name) {
            const roster=stat?.世界?.異端レーダー?.名簿||{},matched=stableNameIn(roster,name);
            return matched?{名称:matched,记录:roster[matched]}:null;
        }

        alienActivityReviewReasons(stat,item) {
            const people=stat?.世界?.[PATH]?.人物||{};
            const personName=stableNameIn(people,item?.名称)||stableNameIn(people,item?.雷达名称),person=personName?people[personName]:null;
            const reasons=[];
            const factsComplete=!!(person&&String(person.地点||'').trim()&&String(person.目標||'').trim()&&String(person.行动||'').trim());
            if(!factsComplete)reasons.push("活動記録なし");

            const now=worldDateKey(stat?.世界?.時間),updated=worldDateKey(person?.更新时间),nextCheck=worldDateKey(person?.下次检查);
            if(now!==null&&nextCheck!==null&&nextCheck<=now)reasons.push("次回確認の期限到来");
            if(factsComplete&&now!==null&&updated!==null&&now-updated>=ALIEN_ACTIVITY_STALE_HOURS)reasons.push("活動が 24 時間以上再確認されていません");

            const linkedEvents=new Set(Array.isArray(person?.关联事件)?person.关联事件.filter(Boolean):[]);
            const location=String(person?.地点||'').trim();
            for(const change of stat?.世界?.[PATH]?.最近变化||[]){
                if(!plain(change))continue;
                const category=String(change.类别||change.タイプ||'').trim(),name=String(change.名称||'').trim();
                if(name&&/事件/.test(category)&&linkedEvents.has(name))reasons.push("関連事件の変化");
                if(name&&/(?:(?:势力地区|勢力地区)|地区)/.test(category)&&location&&worldLocationRelated(location,name))reasons.push("所在地区の変化");
            }
            return Array.from(new Set(reasons));
        }

        activeAlienRequirements(stat) {
            if((stat?.設定||{}).単一世界)return [];
            const roster=stat?.世界?.異端レーダー?.名簿||{},people=stat?.世界?.[PATH]?.人物||{},required=[];
            for(const [alienName,alien] of Object.entries(roster)){
                if(!alien||alien.状態==='死亡')continue;
                const personName=stableNameIn(people,alienName)||alienName,person=people[personName]||{};
                const item={
                    名称:personName,雷达名称:alienName,出典:String(alien.出典||''),経歴:String(alien.経歴||''),陣営:String(alien.陣営||''),職業:String(alien.職業||''),階層:String(alien.階層||''),
                    当前活动:{地点:String(person.地点||''),目標:String(person.目標||''),行动:String(person.行动||''),更新时间:String(person.更新时间||'')}
                };
                const reasons=this.alienActivityReviewReasons(stat,item);
                if(!reasons.length)continue;
                item.触发原因=reasons;
                item.要求="今回再確認の条件を満たした活動中の異端だけ、WorldResult.人物 に新しい活動を提出してください。地点・目標・行動は空にしないでください。人物の更新時刻は記入不要で、プログラムが今回の最終世界時刻を記録します。新情報がない場合は既存の目標・行動を維持してください。モデルが <user> の行動を知っただけで追跡や方針変更をしてはいけません。<user> の行動を理由に変更する場合は、既存の認識、または今回記録する追跡可能な認識・認識の出典が必要です。今回死亡が確定した場合は異端の状態を死亡に変更するだけにしてください。";
                required.push(item);
            }
            return required;
        }

        seedMissingAlienPeople(stat,required) {
            const state=stat?.世界?.[PATH],patches=[];if(!state)return patches;
            const people=state.人物||(state.人物={});
            for(const item of required||[]){
                if(stableNameIn(people,item.名称))continue;
                const relationName=stableNameIn(stat.関係リスト||{},item.雷达名称),relation=relationName?(stat.関係リスト||{})[relationName]:null;
                const seed=normalizeBackendRecord('人物',{所属世界:stat.世界?.名称||'',地点:String(relation?.地点||''),目標:'',行动:'',公开动态:''});
                people[item.名称]=seed;
                patches.push({op:'add',path:pointer(['世界',PATH,'人物',item.名称]),value:copy(seed)});
            }
            return patches;
        }

        ensureActiveAlienActivity(next,required,acceptedResult,worldTime) {
            const roster=next?.世界?.異端レーダー?.名簿||{},people=next?.世界?.[PATH]?.人物||{},proposals=acceptedResult?.人物||[],missing=[];
            const canonicalTime=String(next?.世界?.時間||worldTime||'').trim();
            for(const item of required||[]){
                const rosterName=stableNameIn(roster,item.雷达名称||item.名称),alien=rosterName?roster[rosterName]:null;
                if(!alien||alien.状態==='死亡')continue;
                const personName=stableNameIn(people,item.名称)||stableNameIn(people,rosterName),person=personName?people[personName]:null;
                const proposal=proposals.find(p=>nameKey(p.名称)===nameKey(item.名称)||nameKey(p.名称)===nameKey(rosterName));
                const submitted=proposal&&String(proposal.地点||'').trim()&&String(proposal.目標||'').trim()&&String(proposal.行动||'').trim();
                const factsComplete=person&&String(person.地点||'').trim()&&String(person.目標||'').trim()&&String(person.行动||'').trim();
                const timeComplete=!canonicalTime||sameWorldTimeAnchor(person?.更新时间,canonicalTime);
                if(!submitted||!factsComplete||!timeComplete)missing.push(rosterName||item.名称);
            }
            if(missing.length)throw new Error("異端の活動が未確認："+missing.join('、')+"。今回再確認の条件を満たした活動中の異端だけ地点・目標・行動を提出してください。更新時刻はプログラムが世界時刻から記録します。対象外は既存の活動を維持し、更新のためだけに方針を創作しないでください。死亡済みなら異端の状態を死亡にしてください");
        }

        normalizeAlienActivityTimestamps(stat,value) {
            const result=normalizeWorldResult(value);
            const roster=(stat?.設定||{}).単一世界?{}:(stat?.世界?.異端レーダー?.名簿||{});
            const plannedDead=new Set((result.异端||[])
                .filter(item=>item?.操作!=="今回の提案を撤回"&&item?.状態==='死亡')
                .map(item=>nameKey(item.名称)));
            const proposedTime=this.timePolicy.resolveProposal(stat,result);
            const worldTime=String(proposedTime||stat?.世界?.時間||'').trim();
            if(Array.isArray(result.人物)){
                for(const item of result.人物){
                    if(!plain(item)||item.操作==="今回の提案を撤回")continue;
                    const rosterName=stableNameIn(roster,item.名称),alien=rosterName?roster[rosterName]:null;
                    if(!alien||alien.状態==='死亡'||plannedDead.has(nameKey(rosterName||item.名称)))continue;
                    const submitted=String(item.地点||'').trim()&&String(item.目標||'').trim()&&String(item.行动||'').trim();
                    if(!submitted)continue;
                    if(worldTime)item.更新时间=worldTime;
                    else delete item.更新时间;
                }
            }
            return result;
        }

        validateRecord(stat,name,record){
            if(!plain(record))throw new Error("無効な世界活動記録："+name);
            const backend=this.engine.services.mutations.backend(stat),events=backend.事件||{};
            for(const eventName of record.关联事件||[])if(!Object.hasOwn(events,eventName))throw new Error("関連事件が存在しません："+eventName);
        }
        get(name){
            if(!this.engine)return null;
            const people=this.engine.snapshot().stat?.世界?.[PATH]?.人物||{};
            const stable=stableNameIn(people,String(name||'').trim());
            return stable&&plain(people[stable])?{name:stable,record:people[stable]}:null;
        }

        async save(name,record){
            if(!this.engine)throw new Error("人物活動サービスがエンジンに接続されていません");
            name=String(name||'').trim();if(!name)throw new Error("人物名は空にできません");
            return this.engine.services.mutations.commit(stat=>{
                const mutations=this.engine.services.mutations,backend=mutations.backend(stat),people=backend.人物||{},stable=stableNameIn(people,name);
                if(!stable||!plain(people[stable]))throw new Error("世界活動記録が存在しません："+name);
                const current=people[stable];
                const next=normalizeBackendRecord('人物',record,current);
                next.认知=mutations.textList(next.认知);
                next.关联事件=mutations.textList(next.关联事件);
                next.行程=mutations.jsonList(next.行程,'行程');
                next.认知来源=mutations.jsonList(next.认知来源,'认知来源');
                next.背景关联=mutations.jsonList(next.背景关联,'背景关联');
                this.validateRecord(stat,stable,next);
                people[stable]=next;
                return {name:stable};
            },"世界活動記録を修正しました："+name);
        }

        async remove(name){
            if(!this.engine)return false;
            name=String(name||'').trim();if(!name)return false;
            return this.engine.services.mutations.commit(stat=>{
                const backend=this.engine.services.mutations.backend(stat),people=backend.人物||{},stable=stableNameIn(people,name);
                if(!stable||!plain(people[stable]))return null;
                delete people[stable];
                return {deleted:stable};
            },"世界活動記録を削除しました："+name);
        }
    }

    const DEFAULT_WORLD_PERSON_ACTIVITY_SERVICE=new WorldPersonActivityService();
    let ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE=DEFAULT_WORLD_PERSON_ACTIVITY_SERVICE;
    function derivePersonWorldContext(stat,personName,playerName=''){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.deriveContext(stat,personName,playerName);}
    function projectHotWorldPeople(stat,limit=HOT_PERSON_TARGET){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.projectHot(stat,limit);}
    function alienRosterMatch(stat,name){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.alienRosterMatch(stat,name);}
    function alienActivityReviewReasons(stat,item){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.alienActivityReviewReasons(stat,item);}
    function activeAlienActivityRequirements(stat){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.activeAlienRequirements(stat);}
    function seedMissingAlienPeople(stat,required){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.seedMissingAlienPeople(stat,required);}
    function ensureActiveAlienActivity(next,required,acceptedResult,worldTime){return ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE.ensureActiveAlienActivity(next,required,acceptedResult,worldTime);}
    class WorldTaskAwarenessService {
        projectList(value) {
            if(!plain(value))return {};
            const out={};
            for(const [name,task] of Object.entries(value)){
                if(!plain(task))continue;
                const projected={};
                for(const key of ["依頼元","目標","隠された真実","難易度","納品","状態"]){
                    if(Object.hasOwn(task,key))projected[key]=copy(task[key]);
                }
                if(Object.keys(projected).length)out[name]=projected;
            }
            return out;
        }

        validateReferences(stat,result) {
            const taskNames=new Set(Object.keys(stat?.任務?.リスト||{}));
            for(const event of result?.事件||[]){
                if(!Array.isArray(event?.关联任务))continue;
                for(const taskName of event.关联任务){
                    const name=String(taskName||'').trim();
                    if(name&&!taskNames.has(name))throw new Error('事件/'+String(event.名称||"名称未設定")+"：関連任務が存在しません："+name);
                }
            }
            return result;
        }
    }

    const DEFAULT_WORLD_TASK_AWARENESS_SERVICE=new WorldTaskAwarenessService();
    let NPC_BUILD_AUDIT_FEATURE_ENABLED=false;

    class WorldNpcAuditService {
        projectComponentMap(value,{equipment=false}={}) {
            if(!plain(value))return {};
            const out={};
            for(const [name,item] of Object.entries(value)){
                if(!plain(item))continue;
                if(equipment&&Number(item.状態)===2)continue;
                const clean=copy(item);
                for(const key of ["最終属性","強化",'真属性'])delete clean[key];
                if(plain(clean.技能)){
                    clean.技能=Object.fromEntries(Object.entries(clean.技能).filter(([,skill])=>plain(skill)).map(([skillName,skill])=>{
                        const projected=copy(skill);
                        for(const key of ["最終属性","強化",'真属性'])delete projected[key];
                        return [skillName,projected];
                    }));
                }
                out[name]=clean;
            }
            return out;
        }

        projectCharacter(value) {
            const source=plain(value)?value:{},out={};
            for(const key of ["登場","種族","身分","職業","階層",'HP_MAX','HP','THP','EP_MAX','EP','性格',"好み","外見","服装","仲間",'好感度',"態度","背景"]){
                if(Object.hasOwn(source,key))out[key]=copy(source[key]);
            }
            const 状態=this.projectComponentMap(source.状態),血統=this.projectComponentMap(source.血統),技能=this.projectComponentMap(source.技能);
            const 装備=this.projectComponentMap(source.装備,{equipment:true}),形態庫=this.projectComponentMap(source.形態庫);
            if(Object.keys(状態).length)out.状態=状態;
            if(Object.keys(血統).length)out.血統=血統;
            if(Object.keys(技能).length)out.技能=技能;
            if(Object.keys(装備).length)out.装備=装備;
            if(Object.keys(形態庫).length)out.形態庫=形態庫;
            if(plain(source.現在形態))out.現在形態=copy(source.現在形態);
            return out;
        }

        buildText(value) {
            try{return JSON.stringify(value||{});}catch(_){return String(value||'');}
        }

        inferNarrativeLevel(npc) {
            const profileText=[...(Array.isArray(npc?.身分)?npc.身分:[]),...Object.keys(npc?.職業||{}),npc?.背景,npc?.態度].filter(Boolean).join(' ');
            if(/(?:boss|(?:首领|首領)|(?:领主|領主)|(?:头目|頭目)|魔王|王者|宗主|(?:掌门|掌門)|教皇|(?:最终敌人|最後の敵)|(?:最终对手|最後の対戦相手))/i.test(profileText))return "首領/Boss級";
            return /(?:(?:精英|精鋭)|(?:精锐|精鋭)|(?:王牌|切り札)|(?:核心战力|中核戦力)|(?:强敌|強敵))/i.test(profileText)?"エリート級":"雑兵級";
        }

        narrativeLevel(stat,name,npc) {
            const people=stat?.世界?.[PATH]?.人物||{},backendName=stableNameIn(people,name),person=backendName?people[backendName]:null;
            const explicit=String(person?.監査級||'').trim();
            if(NPC_AUDIT_LEVELS.includes(explicit))return explicit;
            const roster=(stat?.設定||{}).単一世界?{}:(stat?.世界?.異端レーダー?.名簿||{});
            const alienName=stableNameIn(roster,name),alien=alienName?roster[alienName]:null;
            if(alien&&alien.状態!=='死亡')return "首領/Boss級";
            return this.inferNarrativeLevel(npc);
        }

        assessment(stat,name,npc) {
            if(!plain(npc)||Number(npc.HP)<=0||npc.仲間===true)return null;
            const level=this.narrativeLevel(stat,name,npc);
            const minimum=level==="首領/Boss級"?{血統:1,装備:6,技能:4}:level==="エリート級"?{血統:1,装備:4,技能:2}:{血統:1,装備:2,技能:1};
            const counts={
                血統:Object.keys(npc.血統||{}).length,
                装備:Object.values(npc.装備||{}).filter(item=>plain(item)&&Number(item.状態)===1).length,
                技能:Object.keys(npc.技能||{}).length,
                状態:Object.keys(npc.状態||{}).length,
                形态:Object.keys(npc.形態庫||{}).length
            };
            const gaps=[],suggest=new Set();
            for(const field of ["種族","身分","職業","外見","服装",'性格',"好み","背景","態度"]){
                const value=npc[field],missing=Array.isArray(value)?!value.length:plain(value)?!Object.keys(value).length:!String(value||'').trim();
                if(missing){gaps.push("資料欠落/"+field);suggest.add(field);}
            }
            for(const field of ["血統","装備",'技能']){
                if(counts[field]<minimum[field]){gaps.push(field+"が不足 "+counts[field]+'/'+minimum[field]);suggest.add(field);}
            }
            const combatText=this.buildText({職業:npc.職業,血統:npc.血統,装備:npc.装備,技能:npc.技能,状態:npc.状態,形態庫:npc.形態庫});
            if(level!=="雑兵級"){
                const offense=/(?:(?:伤害|ダメージ)|(?:攻击|攻撃)|(?:斩|斬)|刺|(?:射击|射撃)|爆破|火力|ATK|MATK|(?:杀伤|殺傷)|(?:输出|出力)|毒|(?:灼烧|火傷)|(?:雷击|雷撃)|(?:炮击|砲撃))/i.test(combatText);
                const survival=/(?:防御|(?:护盾|シールド)|(?:减伤|軽減)|(?:恢复|回復)|(?:治疗|治療)|(?:格挡|受け流し)|(?:护甲|装甲)|(?:屏障|障壁)|再生|吸收|DEF|MDEF|生存)/i.test(combatText);
                const control=/(?:(?:控制|制御)|(?:位移|位置移動)|(?:突进|突進)|(?:冲刺|ダッシュ)|(?:束缚|拘束)|(?:眩晕|気絶)|(?:减速|減速)|(?:沉默|沈黙)|(?:击退|ノックバック)|(?:牵引|牽引)|(?:冻结|凍結)|(?:召唤|召喚)|(?:机动|機動)|(?:封锁|封鎖)|(?:禁锢|禁錮))/i.test(combatText);
                if(!offense){gaps.push("主要な殺傷手段が不足");suggest.add('技能');suggest.add("装備");}
                if(!survival){gaps.push("防御/生存手段が不足");suggest.add('技能');suggest.add("装備");suggest.add("状態");}
                if(!control){gaps.push("機動/制御手段が不足");suggest.add('技能');suggest.add("形態庫");}
            }
            if(level==="首領/Boss級"){
                const stage=counts.形态>0||/(?:(?:阶段|段階)|(?:二阶段|第二段階)|(?:变身|変身)|(?:形态|形態)|解放|(?:觉醒|覚醒)|狂暴|(?:转阶段|段階移行)|(?:状态切换|状態切替))/i.test(combatText);
                if(!stage){gaps.push("Boss段階/形態/状態変化の仕組みが不足");suggest.add("形態庫");suggest.add("状態");suggest.add('技能');}
            }
            return {名称:name,監査級:level,階層:String(npc.階層||'Ⅰ'),当前组件:counts,缺口:gaps,建议字段:Array.from(suggest),当前构筑:this.projectCharacter(npc)};
        }

        audit(stat,limit=NPC_BUILD_AUDIT_LIMIT) {
            if(!NPC_BUILD_AUDIT_FEATURE_ENABLED)return [];
            const relations=stat?.関係リスト||{},backend=stat?.世界?.[PATH]||{},people=backend.人物||{},events=backend.事件||{},roster=(stat?.設定||{}).単一世界?{}:(stat?.世界?.異端レーダー?.名簿||{});
            const currentLocation=String(stat?.世界?.地点||''),worldTime=String(stat?.世界?.時間||'');
            const activeEventNames=new Set(Object.entries(events).filter(([,e])=>e&&["発生待ち","進行中"].includes(e.状態)&&['当前事件',"直近の節目"].includes(e.分类)).map(([eventName])=>eventName));
            const currentParticipants=new Set();
            for(const [eventName,event] of Object.entries(events)){
                if(!activeEventNames.has(eventName))continue;
                for(const p of event?.参与者||[])currentParticipants.add(nameKey(p));
            }
            const rows=[];
            for(const [name,npc] of Object.entries(relations)){
                const assessment=this.assessment(stat,name,npc);if(!assessment||!assessment.缺口.length)continue;
                const backendName=stableNameIn(people,name),person=backendName?people[backendName]:null;
                const alienName=stableNameIn(roster,name),alien=alienName?roster[alienName]:null;
                const activeAlien=!!(alien&&alien.状態!=='死亡');
                const linked=!!(person&&(person.关联事件||[]).some(eventName=>activeEventNames.has(eventName)))||currentParticipants.has(nameKey(name));
                const here=!!npc.登場||!!(person&&currentLocation&&String(person.地点||'')&&(String(person.地点).includes(currentLocation)||currentLocation.includes(String(person.地点))));
                const updated=!!(person&&sameWorldTimeAnchor(person.更新时间,worldTime));
                if(!activeAlien&&!linked&&!here&&!updated)continue;
                const reasons=[];
                if(activeAlien)reasons.push("活動中の異端");
                if(linked)reasons.push("現在/近期イベントの参加者");
                if(here)reasons.push(npc.登場?"現在登場中":"現在地点に関連");
                if(updated)reasons.push("今回の人物動態を更新済み");
                const levelWeight=assessment.監査級==="首領/Boss級"?40:assessment.監査級==="エリート級"?20:0;
                const priority=(activeAlien?80:0)+(linked?60:0)+(here?40:0)+(updated?20:0)+levelWeight+assessment.缺口.length;
                rows.push({...assessment,触发依据:reasons,__priority:priority});
            }
            return rows.sort((a,b)=>b.__priority-a.__priority||a.名称.localeCompare(b.名称,'zh-CN')).slice(0,Math.max(0,Number(limit)||0)).map(item=>{const out={...item};delete out.__priority;return out;});
        }

        normalizeNewEquipment(stat,result) {
            for(const relation of result?.关系||[]){
                if(!plain(relation?.装備))continue;
                const target=stableNameIn(stat?.関係リスト||{},relation.名称);
                const npc=target?stat.関係リスト[target]:null;
                if(!plain(npc))continue;
                for(const [equipName,equip] of Object.entries(relation.装備)){
                    if(!plain(equip))continue;
                    if(!stableNameIn(npc.装備||{},equipName))equip.状態=1;
                }
            }
            return result;
        }

        ensureProgress(next,required=[],acceptedResult) {
            if(!(required||[]).length)return;
            const proposals=Array.isArray(acceptedResult?.关系)?acceptedResult.关系:[],details=[];
            for(const before of required||[]){
                const target=stableNameIn(next?.関係リスト||{},before.名称);
                if(!target)continue;
                const after=this.assessment(next,target,next.関係リスト[target]);
                if(!after)continue;
                const proposal=proposals.find(item=>nameKey(item?.名称)===nameKey(before.名称));
                const touched=proposal&&(before.建议字段||[]).some(field=>Object.hasOwn(proposal,field));
                if(touched&&after.缺口.length<before.缺口.length)continue;
                const submitted=proposal?Object.keys(proposal).filter(field=>!['名称','操作'].includes(field)):[];
                const unresolved=(after.缺口||[]).length?after.缺口:before.缺口||[];
                const suggested=(after.建议字段||before.建议字段||[]).filter(Boolean);
                details.push(
                    before.名称+"：未解決の不足項目："+(unresolved.length?unresolved.join('、'):"未認識")
                    +"；推奨修正フィールド："+(suggested.length?suggested.join('、'):"なし")
                    +"；今回の実際の提出："+(submitted.length?submitted.join('、'):"なし")
                );
            }
            if(details.length)throw new Error("NPC 構成監査が進んでいません：\n"+details.map(item=>' - '+item).join('\n')+"\n修正要件：列挙された各監査対象について、今回は少なくとも一つの実際の不足を補ってください；好感度・HP・無関係なフィールドだけを変更することは禁止です。");
        }
    }

    const DEFAULT_WORLD_NPC_AUDIT_SERVICE=new WorldNpcAuditService();
    let ACTIVE_WORLD_NPC_AUDIT_SERVICE=DEFAULT_WORLD_NPC_AUDIT_SERVICE;
    function projectAuditComponentMap(value,options={}){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.projectComponentMap(value,options);}
    function projectCharacterForAudit(value){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.projectCharacter(value);}
    function npcBuildText(value){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.buildText(value);}
    function npcBuildAssessment(stat,name,npc){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.assessment(stat,name,npc);}
    function npcBuildAudit(stat,limit=NPC_BUILD_AUDIT_LIMIT){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.audit(stat,limit);}
    function ensureNpcBuildAuditProgress(next,required=[],acceptedResult){return ACTIVE_WORLD_NPC_AUDIT_SERVICE.ensureProgress(next,required,acceptedResult);}
    const EVENT_CATEGORIES=new Set(['当前事件',"直近の節目","大局的な節目"]);
    const LOCAL_EVENT_ACTION_WORDS=/(?:会合|(?:汇合|合流)|(?:集结|集結)|(?:争夺|争奪)|(?:夺取|奪取)|(?:抢夺|強奪)|突破|(?:突围|包囲突破)|(?:开门|開門)|(?:绕行|迂回)|(?:护送|護送)|(?:搜索|捜索)|(?:调查|調査)|(?:巡逻|巡回)|(?:防守|防衛)|攻防|(?:撤离|撤退)|潜入|救援|(?:搬运|運搬)|(?:封锁|封鎖)|(?:交涉|交渉))/;
    const GENERIC_MICRO_LOCATION_ROOT=/^(?:(?:房间|部屋)|(?:房室|部屋)|(?:大厅|大広間)|(?:走廊|廊下)|(?:通道|通路)|(?:楼梯|階段)|(?:楼层|階)|入口|出口|出入口|(?:屋顶|屋上)|(?:平台|足場)|(?:仓库|倉庫)|(?:餐厅|食堂)|(?:卫生间|トイレ)|浴室|(?:车厢|車両)|甲板|(?:舱室|船室))$/;
    const GENERIC_MICRO_LOCATION_CHILD=/(?:室|(?:房|部屋)|(?:厅|広間)|(?:间|間)|廊|梯|(?:层|階)|入口|出口|(?:门|門)|口|台|(?:舱|船室)|(?:仓|倉)|(?:库|庫)|堂|巷|(?:通道|通路)|甲板|(?:屋顶|屋上))$/;
    const MACRO_EVENT_WORDS=/(?:(?:世界级|世界規模)|全国|(?:跨国|国際)|(?:地区级灾难|地区規模の災害)|(?:城市级灾难|都市規模の災害)|(?:战略级|戦略規模)|核(?:(?:打击|攻撃)|爆|武器)|EMP|(?:电磁脉冲|電磁パルス)|(?:战争|戦争)|(?:政权|政権)|社会秩序|(?:基础设施|基盤設備)(?:(?:失效|失効)|(?:崩溃|崩壊))|(?:大规模迁移|大規模移住)|(?:长期流亡|長期亡命)|(?:生存阶段|生存段階)|(?:篇章转折|章の転換)|(?:据点|拠点)(?:(?:建立|成立)|(?:失守|陥落)|(?:沦陷|陥落)|(?:崩溃|崩壊)|(?:保卫|防衛))|文明|国家|(?:大陆|大陸))/;
    function looksFineGrainedLocation(value) {
        const raw=String(value||'').trim();if(!raw)return false;
        if(GENERIC_MICRO_LOCATION_ROOT.test(raw))return true;
        const parts=raw.split(/\s*(?:-|—|–|→|>|\/|／|·|・)\s*/).filter(Boolean);
        if(parts.length<2)return false;
        const leaf=parts.at(-1);
        return leaf.length<=16&&GENERIC_MICRO_LOCATION_CHILD.test(leaf);
    }

    class WorldStateNormalizer {
        normalizeBackendState(stat) {
            const state=stat?.世界?.[PATH]; if(!state)return stat;
            const legacySummary=String(state.公开摘要||'').trim();
            if(legacySummary){
                if(!plain(stat.世界.因果軌道))stat.世界.因果軌道={現在段階:'',ストーリーライン:'',次ノード:'',偏移記録:{}};
                stat.世界.因果軌道.現在段階=legacySummary;
            }
            delete state.公开摘要;
            delete state.正文承接;
            delete state.运行记录;
            state.版本=Math.max(5,Number(state.版本)||0);
            if(!plain(state.历史总结))state.历史总结={};
            for(const category of Object.keys(RECORDS)){
                if(!plain(state[category]))state[category]={};
                for(const [name,value] of Object.entries(state[category])){
                    if(plain(value))state[category][name]=normalizeBackendRecord(category,value);
                }
            }
            pruneDeadAlienPeople(stat);
            return stat;
        }
        eventText(name,event) {
            return [name,event?.説明,event?.条件,event?.默认走向,event?.结果,event?.公开征兆,event?.地点].filter(Boolean).join(' ');
        }
        obviouslyLocalMacro(name,event) {
            const text=this.eventText(name,event);
            if(MACRO_EVENT_WORDS.test(text))return false;
            const fineLocation=looksFineGrainedLocation(event?.地点)||looksFineGrainedLocation(name);
            return fineLocation&&LOCAL_EVENT_ACTION_WORDS.test(text);
        }
        normalizedEventCategory(name,event) {
            const raw=String(event?.分类||'').trim();
            if(raw==="大局的な節目")return this.obviouslyLocalMacro(name,event)?(event?.状態==="進行中"?'当前事件':"直近の節目"):"大局的な節目";
            if(raw==='当前事件')return '当前事件';
            if(raw==="直近の節目")return event?.状態==="進行中"?'当前事件':"直近の節目";
            if(raw==="最近の事件"||raw==="メインノード"||!EVENT_CATEGORIES.has(raw))return event?.状態==="進行中"?'当前事件':"直近の節目";
            return raw;
        }
        normalizeEventLayers(stat) {
            const events=stat?.世界?.[PATH]?.事件||{},patches=[];
            for(const [name,event] of Object.entries(events)){
                const category=this.normalizedEventCategory(name,event);
                if(event.分类!==category){
                    event.分类=category;
                    patches.push({op:'replace',path:pointer(['世界',PATH,'事件',name,'分类']),value:category});
                }
            }
            return patches;
        }
        explicitPersonAliases(name) {
            const full=String(name||'').trim(),short=full.split(/[·・／/]/)[0].trim();
            return [...new Set([full,short].filter(x=>x.length>=2))];
        }
        repairExplicitEventLinks(stat) {
            const state=stat?.世界?.[PATH],patches=[]; if(!state)return patches;
            const events=state.事件||{},people=state.人物||{};
            for(const [eventName,event] of Object.entries(events)){
                const haystack=this.eventText(eventName,event);
                const participants=Array.isArray(event.参与者)?event.参与者.slice():[];
                let participantsChanged=false;
                for(const personName of Object.keys(people)){
                    const explicit=participants.some(x=>nameKey(x)===nameKey(personName))
                        ||this.explicitPersonAliases(personName).some(alias=>haystack.includes(alias));
                    if(!explicit)continue;
                    if(!participants.some(x=>nameKey(x)===nameKey(personName))){
                        participants.push(personName);participantsChanged=true;
                    }
                    const person=people[personName],links=Array.isArray(person.关联事件)?person.关联事件:[];
                    if(!links.includes(eventName)){
                        person.关联事件=[...links,eventName];
                        patches.push({op:'replace',path:pointer(['世界',PATH,'人物',personName,'关联事件']),value:copy(person.关联事件)});
                    }
                }
                if(participantsChanged){
                    event.参与者=participants;
                    patches.push({op:'replace',path:pointer(['世界',PATH,'事件',eventName,'参与者']),value:copy(participants)});
                }
            }
            return patches;
        }
        repairMacroPredecessors(stat) {
            const state=stat?.世界?.[PATH],orbit=stat?.世界?.因果軌道||{},patches=[]; if(!state)return patches;
            const stages=storyStages(orbit.ストーリーライン).filter(name=>state.事件?.[name]?.分类==="大局的な節目"&&state.事件[name].状態!=="取消済み");
            for(let i=1;i<stages.length;i++){
                const prev=stages[i-1],name=stages[i],event=state.事件[name],parents=Array.isArray(event.前因)?event.前因:[];
                if(!parents.includes(prev)){
                    event.前因=[...parents,prev];
                    patches.push({op:'replace',path:pointer(['世界',PATH,'事件',name,'前因']),value:copy(event.前因)});
                }
            }
            return patches;
        }
    }

    const DEFAULT_WORLD_STATE_NORMALIZER=new WorldStateNormalizer();
    let ACTIVE_WORLD_STATE_NORMALIZER=DEFAULT_WORLD_STATE_NORMALIZER;
    function normalizeBackendState(stat){return ACTIVE_WORLD_STATE_NORMALIZER.normalizeBackendState(stat);}
    function normalizeEventLayers(stat){return ACTIVE_WORLD_STATE_NORMALIZER.normalizeEventLayers(stat);}
    function repairExplicitEventLinks(stat){return ACTIVE_WORLD_STATE_NORMALIZER.repairExplicitEventLinks(stat);}
    function repairMacroPredecessors(stat){return ACTIVE_WORLD_STATE_NORMALIZER.repairMacroPredecessors(stat);}
    const WORLD_CAUSAL_CHAIN_HINT=/(?:余波|(?:后续|その後)|(?:进一步|さらに)|(?:继续|継続)|(?:继而|続いて)|(?:因此|そのため)|(?:由此|これにより)|(?:连锁|連鎖)|衍生|(?:扩散|拡散)|(?:扩大|拡大)|(?:反应|反応)|吸引力|同一(?:(?:契约|契約)|事件|行为|(?:根因|根本原因)))/;
    const WORLD_CAUSAL_SPECULATION_HINT=/(?:可能|(?:或许|おそらく)|(?:预计|予定)|(?:预期|見込み)|(?:将会|今後)|(?:或将|可能性)|未来(?:会|可能|将)|潜在|(?:恐怕|恐らく)|(?:有望|見込み)|(?:计划|計画)|(?:打算|つもり)|(?:准备|準備))/;
    const WORLD_CAUSAL_NO_EFFECT_HINT=/(?:(?:尚未|まだ)|(?:还未|まだ)|(?:并未|していない)|(?:未曾|一度も)|(?:没有|ない)|(?:仅仅|だけ)|(?:只是|にすぎない)).{0,18}(?:(?:发生|発生)|(?:执行|実行)|(?:实施|実施)|使用|(?:启动|開始)|(?:造成|もたらした)|(?:导致|引き起こした)|(?:改变|変更)|(?:影响|影響)|(?:生效|有効))|(?:(?:尚未|まだ)|(?:还未|まだ)|(?:并未|していない)|(?:未曾|一度も)|(?:没有|ない)).{0,18}(?:(?:结果|結果)|(?:变化|変化)|(?:后果|結果))/;
    const WORLD_CAUSAL_REALIZED_HINT=/(?:(?:已经|すでに)|(?:已然|すでに)|(?:已被|すでに)|(?:已使|すでに)|(?:已让|すでに)|(?:导致|引き起こした)|(?:造成|もたらした)|(?:致使|引き起こし)|(?:使得|その結果)|(?:迫使|強いた)|(?:结果|結果)|(?:改写|改変)|(?:改变|変更)|(?:破坏|破壊)|(?:摧毁|破壊)|死亡|(?:失去|喪失)|退出|(?:完成|完了)|(?:失败|失敗)|成功|被捕|(?:被杀|殺害)|(?:被夺|奪われ)|(?:被毁|破壊され)|(?:封锁|封鎖)|(?:崩溃|崩壊)|(?:断裂|断絶)|(?:清除|排除)|(?:修复|修復))/;
    const WORLD_CAUSAL_RESPONSE_HINT=/(?:(?:稳定值|安定値)(?:(?:持续|持続))?下降|(?:世界排异|世界の拒絶)(?:(?:反应|反応)|(?:升级|昇格)|(?:增强|強化))?|(?:排异强度|拒絶強度))/;
    const WORLD_CAUSAL_SCALE_HINTS=[
        /(?:(?:关键人物|重要人物)|(?:核心人物|中核人物)|重要人物|(?:关键角色|重要人物)|(?:核心角色|中核人物)).{0,28}(?:(?:命运|運命)|死亡|(?:阵亡|戦死)|(?:被杀|殺害)|永久|不可逆|(?:退场|退場)|(?:失去|喪失)|(?:背叛|裏切り)|被捕|失踪|(?:改写|改変)|(?:改变|変更)|(?:修复|修復))/,
        /(?:死亡|(?:阵亡|戦死)|(?:被杀|殺害)|永久|不可逆|(?:退场|退場)|被捕|失踪|(?:改写|改変)|(?:改变|変更)|(?:修复|修復)).{0,28}(?:(?:关键人物|重要人物)|(?:核心人物|中核人物)|重要人物|(?:关键角色|重要人物)|(?:核心角色|中核人物))/,
        /(?:重大|(?:关键|重要)|(?:宏观|大局)|(?:主线|本筋)).{0,8}(?:事件|(?:节点|節目)|(?:战役|戦役)|(?:战争|戦争)|(?:仪式|儀式)|(?:计划|計画)|(?:灾难|災厄)).{0,32}(?:(?:改变|変更)|(?:改写|改変)|(?:失败|失敗)|成功|取消|(?:终止|終了)|(?:提前|前倒し)|(?:延后|延期)|(?:崩溃|崩壊)|(?:完成|完了)|(?:毁灭|滅亡)|(?:修复|修復)|(?:失效|失効))/,
        /(?:(?:势力|勢力)|(?:阵营|陣営)|(?:政权|政権)|国家|帝国|王国|(?:组织|組織)|(?:军团|軍団)|(?:城市|都市)|地区).{0,32}(?:(?:格局|構図)|(?:覆灭|壊滅)|(?:崩溃|崩壊)|瓦解|分裂|(?:易主|支配者変更)|(?:政变|政変)|(?:失守|陥落)|(?:沦陷|陥落)|(?:吞并|併合)|解体|(?:重组|再編)|(?:修复|修復))/,
        /(?:(?:主线|本筋)|(?:故事线|ストーリーライン)|(?:世界格局|世界構図)|(?:下一节点|次ノード)|(?:原定|当初の予定)(?:(?:走向|展開)|(?:结局|結末))).{0,32}(?:(?:改变|変更)|(?:改写|改変)|(?:断裂|断絶)|(?:失效|失効)|(?:无法|できない)|(?:偏离|逸脱)|(?:重构|再構成)|(?:修复|修復)|(?:恢复|回復))/,
        /(?:(?:异常污染|異常汚染)|(?:跨世界污染|異世界汚染)|(?:污染|汚染)|(?:世界裂隙|世界の亀裂)|(?:跨世界异常|異世界の異常)|(?:异常侵蚀|異常侵食)|(?:世界侵蚀|世界侵食)).{0,32}(?:(?:扩大|拡大)|(?:扩散|拡散)|蔓延|(?:加剧|悪化)|(?:持续|持続)|(?:清除|排除)|(?:消除|解消)|(?:修复|修復)|(?:收束|収束)|(?:封闭|封鎖))/,
        /(?:(?:异端|異端)|(?:入侵者|侵入者)).{0,28}(?:全部|(?:彻底|徹底)|主要|(?:核心|中核)).{0,16}(?:(?:清除|排除)|(?:消灭|殲滅)|死亡|(?:覆灭|壊滅)).{0,36}(?:(?:跨世界干涉|異世界干渉)|(?:异常污染|異常汚染)|(?:世界裂隙|世界の亀裂)|(?:世界结构|世界構造)|(?:主线|本筋)|(?:世界格局|世界構図)).{0,24}(?:消失|解除|(?:恢复|回復)|(?:修复|修復)|(?:收束|収束)|(?:封闭|封鎖))/,
        /(?:(?:跨世界干涉|異世界干渉)|(?:异常污染|異常汚染)|(?:世界裂隙|世界の亀裂)|(?:世界结构|世界構造)|(?:主线|本筋)|(?:世界格局|世界構図)).{0,24}(?:因|(?:由于|によって)).{0,20}(?:(?:异端|異端)|(?:入侵者|侵入者)).{0,24}(?:(?:清除|排除)|(?:消灭|殲滅)|死亡|(?:覆灭|壊滅)).{0,20}(?:消失|解除|(?:恢复|回復)|(?:修复|修復)|(?:收束|収束)|(?:封闭|封鎖))/,
        /(?:不可逆|永久).{0,20}(?:(?:命运|運命)|(?:主线|本筋)|重大事件|(?:关键事件|重要事件)|(?:势力格局|勢力構図)|(?:世界格局|世界構図))/
    ];
    const WORLD_CAUSAL_CLEAR_LOCAL_HINT=/(?:位置(?:(?:暴露|露見)|(?:泄露|漏洩)|(?:被发现|発見された)|(?:被感知|察知された))|被(?:(?:敌人|敵)|(?:异端|異端)|(?:对手|相手)).{0,16}(?:(?:发现|発見)|(?:察觉|察知)|感知|(?:盯上|狙われ)|(?:追踪|追跡)|(?:锁定|捕捉))|(?:异端|異端).{0,16}(?:(?:知道|知る)|(?:获知|知った)|(?:发现|発見)|(?:察觉|察知)|感知).{0,16}(?:(?:玩家|プレイヤー)|(?:轮回者|輪廻者)|位置|(?:行踪|足取り)|能力|(?:身份|身分))|(?:提前感知|事前察知)|(?:引起警觉|警戒を招く)|(?:提高|上げる).{0,10}(?:难度|難易度)|增加.{0,10}(?:难度|難易度)|(?:生存难度|生存難易度)|(?:行动难度|行動難易度)|(?:追杀压力|追跡の圧力)|短期.{0,8}(?:(?:困难|困難)|不利)|(?:局部战斗|局地戦闘)|(?:普通战斗|通常戦闘)|(?:受伤|負傷)|(?:轻伤|軽傷)|(?:逃脱|脱出)|(?:脱险|危機脱出)|(?:暂时受阻|一時的な阻害)|(?:临时受阻|一時的な阻害))/;

    class WorldCausalService {
        constructor(engine=null,patchPolicy=DEFAULT_WORLD_PATCH_POLICY){this.engine=engine;this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;}
        clampImpact(value) {
            const impact=Number(value);
            if(!Number.isFinite(impact))return null;
            if(impact===0)return 0;
            return impact<0?Math.max(-12,impact):Math.min(15,impact);
        }
        offsetText(item) {
            return [item?.名称,item?.説明].filter(Boolean).join(' ');
        }
        softNormalizeOffsets(stat,result) {
            const items=Array.isArray(result?.因果?.偏移記録)?result.因果.偏移記録:null;
            if(!items||!items.length)return [];
            const existing=stat?.世界?.因果軌道?.偏移記録||{},prepared=[];
            for(const raw of items){
                if(!plain(raw))continue;
                const item=copy(raw);
                if(item.操作==="今回の提案を撤回"){prepared.push(item);continue;}
                const existingName=stableNameIn(existing,item.名称),isNew=!existingName;
                if(Object.hasOwn(item,"影響度")){
                    const impact=this.clampImpact(item.影響度);
                    if(impact===null){
                        if(isNew)continue;
                        delete item.影響度;
                    }else if(isNew&&impact===0)continue;
                    else item.影響度=impact;
                }else if(isNew)continue;
                const text=this.offsetText(item);
                if(isNew&&WORLD_CAUSAL_NO_EFFECT_HINT.test(text))continue;
                if(isNew&&WORLD_CAUSAL_SPECULATION_HINT.test(text)&&!WORLD_CAUSAL_REALIZED_HINT.test(text))continue;
                if(isNew&&Number(item.影響度)<0&&WORLD_CAUSAL_RESPONSE_HINT.test(text))continue;
                prepared.push(item);
            }

            const removed=new Set(),groups=new Map();
            for(let i=0;i<prepared.length;i++){
                const item=prepared[i];
                if(!plain(item)||item.操作==="今回の提案を撤回"||!Object.hasOwn(item,"影響度"))continue;
                const actor=String(item.誘発者||'').trim().toLowerCase();
                const impact=Number(item.影響度);
                if(!actor||!Number.isFinite(impact)||impact===0)continue;
                const key=actor+'|'+(impact<0?'negative':'positive'),group=groups.get(key)||[];
                group.push({index:i,item,text:this.offsetText(item),impact});groups.set(key,group);
            }
            for(const group of groups.values()){
                const chained=group.filter(entry=>WORLD_CAUSAL_CHAIN_HINT.test(entry.text));
                if(chained.length<2)continue;
                let winner=chained[0];
                for(const entry of chained.slice(1))if(Math.abs(entry.impact)>Math.abs(winner.impact))winner=entry;
                for(const entry of chained)if(entry.index!==winner.index)removed.add(entry.index);
            }
            let normalized=prepared.filter((_,index)=>!removed.has(index));
            const budgets=new Map();
            normalized=normalized.filter(item=>{
                if(!plain(item)||item.操作==="今回の提案を撤回"||!Object.hasOwn(item,"影響度"))return true;
                const actor=String(item.誘発者||'').trim().toLowerCase(),impact=Number(item.影響度);
                if(!actor||!Number.isFinite(impact)||impact===0)return true;
                const sign=impact<0?'negative':'positive',key=actor+'|'+sign;
                let remaining=budgets.has(key)?budgets.get(key):(impact<0?12:15);
                const magnitude=Math.min(Math.abs(impact),remaining);
                remaining=Math.max(0,remaining-magnitude);budgets.set(key,remaining);
                if(magnitude<=0)return false;
                item.影響度=impact<0?-magnitude:magnitude;
                return true;
            });
            result.因果.偏移記録=normalized;
            return normalized;
        }
        hasWorldScaleEvidence(item) {
            const text=this.offsetText(item);
            return !!text&&WORLD_CAUSAL_SCALE_HINTS.some(rule=>rule.test(text));
        }
        filterNewOffsetsByWorldScale(stat,result) {
            const items=result?.因果?.偏移記録;
            if(!Array.isArray(items)||!items.length)return [];
            const existing=stat?.世界?.因果軌道?.偏移記録||{},dropped=[];
            result.因果.偏移記録=items.filter(item=>{
                if(!plain(item)||item.操作==="今回の提案を撤回")return true;
                if(stableNameIn(existing,item.名称))return true;
                if(this.hasWorldScaleEvidence(item))return true;
                dropped.push(item.名称);
                return false;
            });
            return dropped;
        }
        prepareResult(stat,result) {
            const dropped=this.filterNewOffsetsByWorldScale(stat,result);
            this.softNormalizeOffsets(stat,result);
            return dropped;
        }
        staleLocalOffsetRepairs(stat,result) {
            const bucket=stat?.世界?.因果軌道?.偏移記録||{},protectedNames=new Set();
            for(const item of result?.因果?.偏移記録||[]){
                if(plain(item)&&this.hasWorldScaleEvidence(item))protectedNames.add(nameKey(item.名称));
            }
            const patches=[],names=[];
            for(const [name,record] of Object.entries(bucket)){
                const impact=Number(record?.影響度)||0;
                if(!impact||protectedNames.has(nameKey(name)))continue;
                const text=this.offsetText(Object.assign({名称:name},record));
                if(!WORLD_CAUSAL_CLEAR_LOCAL_HINT.test(text)||WORLD_CAUSAL_SCALE_HINTS.some(rule=>rule.test(text)))continue;
                patches.push({op:'remove',path:this.patchPolicy.pointer(['世界',"因果軌道","偏移記録",name])});
                names.push(name);
            }
            return {patches,names};
        }
        repairProjection(stat) {
            const orbit=stat.世界.因果軌道||(stat.世界.因果軌道={現在段階:'',ストーリーライン:'',次ノード:'',偏移記録:{}});
            const existing=storyStages(orbit.ストーリーライン);
            const macroEntries=Object.entries(stat.世界[PATH]?.事件||{})
                .filter(([,e])=>e.分类==="大局的な節目"&&e.状態!=="取消済み")
                .map((item,index)=>({item,index,key:worldDateKey(item[1].時間||item[1].开始时间)}))
                .sort((a,b)=>(a.key??Infinity)-(b.key??Infinity)||a.index-b.index)
                .map(x=>x.item);
            const macroNames=new Set(macroEntries.map(([name])=>name));
            const patches=[];
            let line=[];
            const existingValid=existing.length>=3&&existing.length<=5&&existing.every(name=>macroNames.has(name));
            if(existingValid)line=existing.slice(0,5);
            else {
                // 因果轨道只能由宏观事件投影；事实不足时等待模型补齐，不拿近期事件凑骨架。
                if(macroEntries.length<3)return patches;
                const chosen=[],seen=new Set();
                const take=name=>{if(name&&macroNames.has(name)&&!seen.has(name)){seen.add(name);chosen.push(name);}};
                take(orbit.現在段階);
                for(const [name] of macroEntries)take(name);
                if(chosen.length<3)return patches;
                line=chosen.slice(0,5);
                const story=line.join(' -> ');
                if(orbit.ストーリーライン!==story){orbit.ストーリーライン=story;patches.push({op:'replace',path:"/世界/因果軌道/ストーリーライン",value:story});}
            }
            const nextName=line.find(name=>(stat.世界[PATH].事件[name]||{}).状態==="発生待ち")||'';
            if(orbit.次ノード!==nextName){orbit.次ノード=nextName;patches.push({op:'replace',path:"/世界/因果軌道/次ノード",value:nextName});}
            const current=line.find(name=>(stat.世界[PATH].事件[name]||{}).状態==="進行中");
            if(current&&(!orbit.現在段階||orbit.現在段階==="初期化待ち")){
                orbit.現在段階=current;
                patches.push({op:'replace',path:"/世界/因果軌道/現在段階",value:current});
            }
            return patches;
        }
        get(name){return this.engine?.snapshot?.().stat?.世界?.因果軌道?.偏移記録?.[String(name||'').trim()]||null;}
        recalculateStability(stat) {
            if(!plain(stat?.世界))return null;
            if(stat.設定?.世界超安定===true){stat.世界.安定=100;return 100;}
            const bucket=stat.世界?.因果軌道?.偏移記録||{};
            const total=Object.values(plain(bucket)?bucket:{}).reduce((sum,item)=>sum+(Number(item?.影響度)||0),0);
            const stable=Math.max(0,Math.min(120,100+total));
            stat.世界.安定=stable;
            return stable;
        }
        replaySamePath(left,right) {
            return Array.isArray(left)&&Array.isArray(right)&&left.length===right.length&&left.every((item,index)=>String(item)===String(right[index]));
        }
        syncReplay(raw,fingerprint,oldName,newName,record,deleted,stable) {
            const replay=raw?.__samsaraWorldReplay;
            if(!plain(replay)||String(replay.fingerprint||'')!==String(fingerprint||'')||!Array.isArray(replay.operations))return;
            const oldPath=['世界',"因果軌道","偏移記録",String(oldName||'')];
            const newPath=['世界',"因果軌道","偏移記録",String(newName||'')];
            const stabilityPath=['世界',"安定"];
            replay.operations=replay.operations.filter(operation=>{
                const path=operation?.path;
                return !this.replaySamePath(path,oldPath)&&!this.replaySamePath(path,newPath)&&!this.replaySamePath(path,stabilityPath);
            });
            if(deleted){
                replay.operations.push({op:'remove',path:oldPath});
            }else{
                if(String(oldName)!==String(newName))replay.operations.push({op:'remove',path:oldPath});
                replay.operations.push({op:'set',path:newPath,value:copy(record)});
            }
            replay.operations.push({op:'set',path:stabilityPath,value:stable});
        }
        async commit(mutator,status){
            const engine=this.engine,snapshot=engine.snapshot(),next=copy(snapshot.raw),stat=next.stat_data;
            if(!plain(stat?.世界?.因果軌道))stat.世界.因果軌道={};
            if(!plain(stat.世界.因果軌道.偏移記録))stat.世界.因果軌道.偏移記録={};
            const outcome=mutator(stat.世界.因果軌道.偏移記録);
            if(!outcome)return false;
            const stable=this.recalculateStability(stat);
            this.syncReplay(next,snapshot.fingerprint,outcome.oldName,outcome.newName,outcome.record,outcome.deleted,stable);
            const target=engine.host,had=!!target&&Object.prototype.hasOwnProperty.call(target,'__samsaraUIMutation'),previous=target?.__samsaraUIMutation;
            if(target)target.__samsaraUIMutation=true;
            try{
                await snapshot.mvu.replaceMvuData(next,{type:'message',message_id:snapshot.id});
            }finally{
                if(target){
                    if(had)target.__samsaraUIMutation=previous;
                    else delete target.__samsaraUIMutation;
                }
            }
            engine.status=status||"因果偏移を更新しました";
            engine.render(true);
            return true;
        }
        async save(oldName,newName,record){
            oldName=String(oldName||'').trim();newName=String(newName||'').trim();
            if(!oldName||!newName||!plain(record))throw new Error("偏移名と記録は空にできません");
            const impact=Number(record.影響度);
            if(!Number.isFinite(impact)||impact===0||impact<-12||impact>15)throw new Error("影響度は -12~-1 または +1~+15の範囲で指定してください");
            return this.commit(bucket=>{
                if(!Object.hasOwn(bucket,oldName))throw new Error("偏移記録が存在しません："+oldName);
                if(newName!==oldName&&Object.hasOwn(bucket,newName))throw new Error("偏移名は既に存在します："+newName);
                const next={説明:String(record.説明||'').trim(),誘発者:String(record.誘発者||'').trim(),影響度:impact};
                if(newName!==oldName)delete bucket[oldName];
                bucket[newName]=next;
                return {oldName,newName,record:next,deleted:false};
            },"因果偏移を編集しました · 安定値を再計算");
        }
        async remove(name){
            name=String(name||'').trim();if(!name)return false;
            return this.commit(bucket=>{
                if(!Object.hasOwn(bucket,name))return null;
                delete bucket[name];
                return {oldName:name,newName:name,record:null,deleted:true};
            },"因果偏移を削除しました · 安定値を再計算");
        }
    }
    const DEFAULT_WORLD_CAUSAL_SERVICE=new WorldCausalService();
    let ACTIVE_WORLD_CAUSAL_SERVICE=DEFAULT_WORLD_CAUSAL_SERVICE;
    function repairCausalProjection(stat){return ACTIVE_WORLD_CAUSAL_SERVICE.repairProjection(stat);}
    const CURRENCY_FIELDS={体系:'',購買力基準:'',経済変動:''};
    const CALENDAR_FIELDS={名称:'',月日数:[],閏年規則:''};
    const QUALITY_RANKS=['F','E','D','C','B','A','S','SS','SSS'];
    const RUMOR_CREDIBILITY=["酔い話","疑わしい","おそらく信頼できる"];
    const INTEL_RATINGS=[...QUALITY_RANKS,'日常',"戦略"];
    const EXISTING = {
        勢力: {実力:'F',領地:'',説明:'',声望:0}, 探索:{リスク:'F',探索度:0,説明:'',隠された真実:''},
        偏移記録:{説明:'',誘発者:'',影響度:0},
        街頭の噂:{出典:'',内容:'',信頼度:''}, 情報取引:{売り手:'',情報評価:'',要約:'',要求価格:'',真の内幕:''},
        布告と檄文:{発布者:'',内容:'',掲示位置:''},
        名簿:{出典:'',経歴:'',陣営:'',職業:'',階層:'',状態:''}
    };
    const RELATION_RANKS=['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ'];
    const RELATION_QUALITIES=['F','E','D','C','B','A','S','SS','SSS'];
    const RELATION_SYNC_FIELDS={
        登場:false,種族:'',身分:[],職業:{},階層:'Ⅰ',HP:0,THP:0,EP:0,
        状態:{},血統:{},装備:{},技能:{},形態庫:{},現在形態:{},
        性格:'',好み:'',外見:'',服装:'',仲間:false,好感度:0,態度:'',背景:''
    };
    const RELATION_SYNC_KEYS=new Set(Object.keys(RELATION_SYNC_FIELDS));
    const RELATION_COMPONENT_FIELDS=new Set(["職業","状態","血統","装備",'技能',"形態庫"]);
    // 只有会永久改变角色战斗构筑的字段要求进入审计名单；状态/当前形态及档案文字仍可因真实剧情变化正常同步。
    const RELATION_AUDIT_ONLY_FIELDS=new Set(["職業","血統","装備",'技能',"形態庫"]);
    const RELATION_ATTR_KEYS=["筋力",'敏捷',"体力",'精神','魅力','ATK','DEF','MATK','MDEF','AP'];
    const RELATION_ATTR5=["筋力",'敏捷',"体力",'精神','魅力'];
    const NPC_BUILD_AUDIT_LIMIT=4;
    const WORLD_RESULT_LISTS=['事件','人物','势力地区','历史','传播',"勢力",'探索','资产','異端','关系'];
    const WORLD_RESULT_RUMORS=["街頭の噂","情報取引","布告と檄文"];
    const RESULT_OPERATIONS=new Set(['更新',"削除","今回の提案を撤回"]);
    class WorldRelationSyncPolicy {
        validateStringArray(value,label) {
            if(!Array.isArray(value)||value.some(x=>typeof x!=='string'))throw new Error(label+" は string[] でなければならない");
        }
        validateStringMap(value,label) {
            if(!plain(value)||Object.values(value).some(x=>typeof x!=='string'))throw new Error(label+" は string map でなければならない");
        }
        validateQuality(value,label) {
            if(!RELATION_QUALITIES.includes(String(value||'')))throw new Error(label+" で許可されるのは "+RELATION_QUALITIES.join('/'));
        }
        validateRawAttributes(value,label,{requireFive=false,allowNumbers=false}={}) {
            if(!plain(value))throw new Error(label+" はオブジェクトでなければならない");
            for(const key of Object.keys(value)){
                if(!RELATION_ATTR_KEYS.includes(key))throw new Error(label+" に不正な属性が含まれています "+key);
                if(allowNumbers&&typeof value[key]==='number'&&Number.isFinite(value[key])){
                    if(value[key]===0)throw new Error(label+'.'+key+" の数値0は省略すること。ZOD クリーニング後に無効な差分が生じる");
                    continue;
                }
                this.validateQuality(value[key],label+'.'+key);
            }
            if(requireFive)for(const key of RELATION_ATTR5)if(!Object.hasOwn(value,key))throw new Error(label+" に基礎属性が欠けています "+key);
        }
        validateComponentShape(field,value,name='NPC') {
            if(!plain(value))throw new Error(name+' '+field+" はオブジェクトでなければならない");
            const assertFields=(item,keys,label)=>{for(const key of keys)if(!Object.hasOwn(item,key))throw new Error(label+" にフィールドが欠けています "+key);};
            for(const [entryName,item] of Object.entries(value)){
                const label=name+' '+field+'.'+entryName;
                if(!entryName||!plain(item))throw new Error(label+" は完全なオブジェクトでなければならない");
                if(field==="職業"){
                    assertFields(item,["タイプ",'特性',"出典"],label);
                    if(!["戦闘",'生活',"補助"].includes(item.タイプ))throw new Error(label+" の タイプ が無効");
                    this.validateStringArray(item.特性,label+'.特性');
                    if(typeof item.出典!=='string')throw new Error(label+".出典 は string でなければならない");
                }else if(field==='技能'){
                    assertFields(item,["品質","タイプ","タグ","効果","説明","消費"],label);
                    this.validateQuality(item.品質,label+".品質");
                    if(!Number.isInteger(item.タイプ)||item.タイプ<0||item.タイプ>2)throw new Error(label+".タイプ は 0/1/2 のみです");
                    this.validateStringArray(item.タグ,label+".タグ");this.validateStringMap(item.効果,label+".効果");
                    if(typeof item.説明!=='string'||typeof item.消費!=='string')throw new Error(label+" 説明/消費 は string でなければならない");
                }else if(field==="血統"){
                    assertFields(item,["品質","タグ",'原始属性',"効果","説明"],label);
                    this.validateQuality(item.品質,label+".品質");this.validateStringArray(item.タグ,label+".タグ");
                    this.validateRawAttributes(item.原始属性,label+".基礎属性",{requireFive:true});this.validateStringMap(item.効果,label+".効果");
                    if(typeof item.説明!=='string')throw new Error(label+".説明 は string でなければならない");
                }else if(field==="装備"){
                    assertFields(item,["品質","タイプ","タグ",'原始属性',"効果","説明","消費","状態"],label);
                    this.validateQuality(item.品質,label+".品質");
                    if(!Number.isInteger(item.タイプ)||item.タイプ<0||item.タイプ>8)throw new Error(label+".タイプ は 0~8 のいずれか");
                    if(!Number.isInteger(item.状態)||item.状態<0||item.状態>2)throw new Error(label+".状態 は 0/1/2 のいずれか");
                    this.validateStringArray(item.タグ,label+".タグ");this.validateRawAttributes(item.原始属性,label+".基礎属性");
                    this.validateStringMap(item.効果,label+".効果");
                    if(typeof item.説明!=='string'||typeof item.消費!=='string')throw new Error(label+" 説明/消費 は string でなければならない");
                }else if(field==="状態"){
                    assertFields(item,["タイプ","品質","持続","出典",'原始属性',"効果"],label);
                    if(!["バフ","デバフ",'特殊'].includes(item.タイプ))throw new Error(label+".タイプ が無効");
                    this.validateQuality(item.品質,label+".品質");this.validateRawAttributes(item.原始属性,label+".基礎属性",{allowNumbers:true});
                    if(typeof item.持続!=='string'||typeof item.出典!=='string'||typeof item.効果!=='string')throw new Error(label+" 持続/出典/効果 は string でなければならない");
                }else if(field==="形態庫"){
                    assertFields(item,["階層","消費",'冷却',"状態","タグ",'原始属性',"効果",'技能',"説明"],label);
                    if(!RELATION_RANKS.includes(item.階層))throw new Error(label+".階層 が無効");
                    this.validateStringArray(item.タグ,label+".タグ");this.validateRawAttributes(item.原始属性,label+".基礎属性",{requireFive:true});
                    this.validateStringMap(item.効果,label+".効果");
                    for(const key of ["消費",'冷却',"状態","説明"])if(typeof item[key]!=='string')throw new Error(label+'.'+key+" は string でなければならない");
                    this.validateComponentShape('技能',item.技能,label);
                }
            }
        }
        validateRelationSyncValue(field,value,npc,name='NPC') {
            if(field==="登場"||field==="仲間"){if(typeof value!=='boolean')throw new Error(name+' '+field+" は boolean でなければならない");return;}
            if(["種族",'性格',"好み","外見","服装","態度","背景"].includes(field)){if(typeof value!=='string')throw new Error(name+' '+field+" は string でなければならない");return;}
            if(field==="身分"){this.validateStringArray(value,name+" 身分");return;}
            if(field==="階層"){if(!RELATION_RANKS.includes(value))throw new Error(name+" 階層 で許可されるのは "+RELATION_RANKS.join('/'));return;}
            if(RELATION_COMPONENT_FIELDS.has(field)){this.validateComponentShape(field,value,name);return;}
            if(field==="現在形態"){
                if(!plain(value)||typeof value.激活!=='boolean'||typeof value.名称!=='string')throw new Error(name+" 現在形態 は {激活:boolean,名称:string} でなければならない");
                return;
            }
            if(['HP','THP','EP','好感度'].includes(field)){
                if(typeof value!=='number'||!Number.isFinite(value))throw new Error(name+' '+field+" は有効な数値でなければならない");
                if(field==='好感度'&&(value<-100||value>100))throw new Error(name+" 好感度 の範囲は -100~100");
                if(field!=='好感度'&&value<0)throw new Error(name+' '+field+" は0未満にできない");
                if(field==='HP'&&Number.isFinite(Number(npc?.HP_MAX))&&value>Number(npc.HP_MAX))throw new Error(name+" HP は HP_MAX を超えられない");
                if(field==='EP'&&Number.isFinite(Number(npc?.EP_MAX))&&value>Number(npc.EP_MAX))throw new Error(name+" EP は EP_MAX を超えられない");
            }
        }
        materializeRelationComponent(field,value) {
            const out=copy(value);
            if(["血統","装備","状態","形態庫"].includes(field)&&plain(out)){
                for(const item of Object.values(out)){
                    if(!plain(item))continue;
                    item.真属性={};
                }
            }
            return out;
        }
        mergeRelationComponent(field,oldValue,incoming) {
            if(!RELATION_COMPONENT_FIELDS.has(field))return this.materializeRelationComponent(field,incoming);
            const merged=plain(oldValue)?copy(oldValue):{};
            for(const [name,item] of Object.entries(incoming||{}))merged[name]=this.materializeRelationComponent(field,{[name]:item})[name];
            return merged;
        }

        assertComponentLimit(field,value,name='NPC') {
            if(!RELATION_COMPONENT_FIELDS.has(field))return;
            const count=Object.keys(value||{}).length;
            const limit=field==="血統"?2:field==="装備"?6:field==='技能'?4:field==="形態庫"?4:12;
            if(count>limit)throw new Error(name+' '+field+" がNPC生成ルールの上限を超えています "+limit);
        }
    }

    const DEFAULT_WORLD_RELATION_SYNC_POLICY=new WorldRelationSyncPolicy();
    const WORLD_ASSET_TYPES=["固定不動産","大型乗り物",'要塞'];
    const WORLD_ASSET_TYPE_SET=new Set(WORLD_ASSET_TYPES);
    const ITEMLIKE_ASSET_NAME=/(?:(?:纹章|紋章)|免疫|抗性|初解|技能|能力|(?:药剂|薬剤)?|(?:药水|薬液)|(?:圣水|聖水)|(?:解药|解毒薬)|血清|(?:试剂|試薬)|瓶|(?:钥匙|鍵)|(?:摇把|クランク)|(?:手柄|ハンドル)|(?:材料|素材)|(?:矿石|鉱石)|(?:零件|部品)|(?:部件|部材)|残骸|(?:卷轴|巻物)|食物|(?:口粮|携帯食)|(?:弹药|弾薬)|消耗品|道具|(?:护符|護符)|(?:符文|ルーン)|(?:芯片|チップ)|(?:样本|標本))$/i;

    const ASSET_DEFAULTS={所属対象:[],タイプ:'',主体規模:1,完全度:100,状態:'',建設シーケンス:{},駐留人員:{},待機イベント:[]};
    const ASSET_ENERGY_DEFAULTS={タイプ:'',現在:0,上限:0,説明:''};
    const ASSET_UNIT_DEFAULTS={残量:0,上限:0,加成:[]};
    const ASSET_BUILD_DEFAULTS={段階:"基礎",機能:'',加成:[],産出:'',次回産出日:'',次回産出游日:0};

    class WorldAssetMaterializationPolicy {
        validateScope(item,isNew=false) {
            if(!isNew)return;
            const type=String(item?.タイプ||'').trim(),name=String(item?.名称||'').trim();
            if(!WORLD_ASSET_TYPE_SET.has(type))throw new Error("新規アセットの タイプ が不正："+(name||"名称未設定")+"；资产 に許可されるのは 固定不動産・大型乗物・要塞 のみで、通常の道具/材料/消耗品を資産台帳へ入れてはならない");
            if(ITEMLIKE_ASSET_NAME.test(name))throw new Error("道具が誤って資産として書き込まれた疑い："+name+"；キャラクターの 道具/装備/形態 などの対応フィールドへ書き込み、资产 へは書き込まないこと");
        }

        normalizeOwners(value) {
            const source=Array.isArray(value)?value:(value===undefined?[]:[value]),out=[];
            for(const raw of source){
                const owner=String(raw??'').trim();
                if(!owner||owner==="所有者なし"||out.includes(owner))continue;
                out.push(owner);
            }
            return out.slice(0,12);
        }

        materializeRecord(oldValue,item,isNew=false) {
            const oldAsset=plain(oldValue)?copy(oldValue):{},asset=Object.assign(copy(ASSET_DEFAULTS),oldAsset);
            // 旧资产没有所属对象时兼容为玩家资产；显式空数组则表示无主。
            asset.所属対象=Object.hasOwn(oldAsset,"所属対象")?this.normalizeOwners(oldAsset.所属対象):['<user>'];
            if(isNew){
                if(!Object.hasOwn(item,"所属対象"))throw new Error("新規アセットは 所属対象 の配列を明示すること；所有者のない資産は空配列を使う："+item.名称);
                if(!Object.hasOwn(item,"タイプ")||!String(item.タイプ||'').trim())throw new Error("新規アセットは タイプ を明示すること："+item.名称);
            }
            if(Object.hasOwn(item,"所属対象"))asset.所属対象=this.normalizeOwners(item.所属対象);
            for(const field of ["タイプ","主体規模","完全度","状態"])if(Object.hasOwn(item,field))asset[field]=copy(item[field]);
            if(Object.hasOwn(item,"エネルギー")){
                if(item.エネルギー===null)delete asset.エネルギー;
                else asset.エネルギー=Object.assign(copy(ASSET_ENERGY_DEFAULTS),plain(oldAsset.エネルギー)?copy(oldAsset.エネルギー):{},plain(item.エネルギー)?copy(item.エネルギー):{});
            }
            const mergeNamedMap=(field,defaults)=>{
                if(!Object.hasOwn(item,field))return;
                const merged=plain(oldAsset[field])?copy(oldAsset[field]):{};
                for(const [name,value] of Object.entries(item[field]||{})){
                    if(forbidden.has(name))continue;
                    if(value===null){delete merged[name];continue;}
                    const previous=plain(merged[name])?copy(merged[name]):{};
                    merged[name]=Object.assign(copy(defaults),previous,copy(value));
                }
                if(Object.keys(merged).length)asset[field]=merged;else delete asset[field];
            };
            mergeNamedMap("消耗ユニット",ASSET_UNIT_DEFAULTS);
            mergeNamedMap("建設シーケンス",ASSET_BUILD_DEFAULTS);
            if(Object.hasOwn(item,"駐留人員")){
                const merged=plain(oldAsset.駐留人員)?copy(oldAsset.駐留人員):{};
                for(const [name,value] of Object.entries(item.駐留人員||{})){
                    if(forbidden.has(name))continue;
                    if(value===null)delete merged[name];else merged[name]=String(value??'');
                }
                asset.駐留人員=merged;
            }
            if(Object.hasOwn(item,"待機イベント"))asset.待機イベント=copy(item.待機イベント||[]);
            if(!plain(asset.建設シーケンス))asset.建設シーケンス={};
            if(!plain(asset.駐留人員))asset.駐留人員={};
            if(!Array.isArray(asset.待機イベント))asset.待機イベント=[];
            return asset;
        }
    }

    const DEFAULT_WORLD_ASSET_MATERIALIZATION_POLICY=new WorldAssetMaterializationPolicy();
    const EXPLORATION_PROJECTION_RULES="【玩家探索投影硬约束】全体区域に実際に到達した時点で少なくとも10%の探索を記録する；遠方のバックステージ地区は自動投影しない；区域を離れた後も探索台帳は保持する。";
    const MICRO_EXPLORATION_ROOT=/^(?:(?:房间|部屋)|(?:房室|部屋)|(?:大厅|大広間)|(?:走廊|廊下)|(?:通道|通路)|(?:楼梯|階段)|(?:楼层|階)|入口|出口|出入口|(?:屋顶|屋上)|(?:平台|足場)|(?:仓库|倉庫)|(?:餐厅|食堂)|(?:卫生间|トイレ)|浴室|(?:车厢|車両)|甲板|(?:舱室|船室))$/;
    const MICRO_EXPLORATION_CHILD=/(?:室|(?:房|部屋)|(?:厅|広間)|(?:间|間)|廊|梯|(?:层|階)|入口|出口|(?:门|門)|口|台|(?:舱|船室)|(?:仓|倉)|(?:库|庫)|堂|巷|(?:通道|通路)|甲板|(?:屋顶|屋上))$/;
    function isMicroExplorationSegment(segment,nested=false) {
        const value=String(segment||'').trim();if(!value)return false;
        if(MICRO_EXPLORATION_ROOT.test(value))return true;
        return nested&&value.length<=16&&MICRO_EXPLORATION_CHILD.test(value);
    }
    class WorldExplorationService {
        constructor(engine=null){this.engine=engine;}
        snapshot(){
            const stat=this.engine?.snapshot?.().stat||{},world=stat.世界||{},backend=world?.[PATH]||{};
            return {探索:copy(world.探索||{}),勢力:copy(world.勢力||{}),势力地区:copy(backend.势力地区||{})};
        }
        granularity(name) {
            const raw=String(name||'').trim();
            if(!raw)return {invalid:true,parent:''};
            if(isMicroExplorationSegment(raw,false))return {invalid:true,parent:''};
            const parts=raw.split(/\s*(?:-|—|–|→|>|\/|／|·|・)\s*/).filter(Boolean);
            if(parts.length>1&&isMicroExplorationSegment(parts.at(-1),true))return {invalid:true,parent:parts.slice(0,-1).join('-')};
            return {invalid:false,parent:''};
        }
        validateItem(stat,item) {
            const granularity=this.granularity(item?.名称);
            if(granularity.invalid)throw new Error("探索粒度が細かすぎます："+item.名称+"。世界.探索は全体ランドマーク/区域のみを記録します"+(granularity.parent?"。代わりに「"+granularity.parent+"」へ変更し、微細な進展は主区域へ累積してください":"。建物内部、個々の部屋、階、出入口などの細かな区域を独立した探索項目にしないでください"));
            const old=(stat?.世界?.探索||{})[item.名称];
            if(old&&Object.hasOwn(item,'探索度')&&Number(item.探索度)<Number(old.探索度||0))throw new Error("探索度は理由なく後退できません："+item.名称+' '+old.探索度+' -> '+item.探索度);
            return granularity;
        }
        repairGranularity(stat) {
            const bucket=stat?.世界?.探索;if(!plain(bucket))return [];
            const patches=[];
            for(const name of Object.keys(bucket)){
                const info=this.granularity(name);if(!info.invalid||!info.parent)continue;
                const child=bucket[name],parent=bucket[info.parent];
                const merged=plain(parent)
                    ? Object.assign(copy(EXISTING.探索),copy(parent),{探索度:Math.max(Number(parent.探索度)||0,Number(child?.探索度)||0)})
                    : Object.assign(copy(EXISTING.探索),{
                        リスク:String(child?.リスク||'F'),
                        探索度:Number(child?.探索度)||0,
                        説明:"旧版の子区域探索記録から統合。全体ランドマークの説明は追記が必要",
                        隠された真実:''
                    });
                bucket[info.parent]=merged;delete bucket[name];
                patches.push({op:parent?'replace':'add',path:pointer(['世界','探索',info.parent]),value:copy(merged)});
                patches.push({op:'remove',path:pointer(['世界','探索',name])});
            }
            return patches;
        }
        locationContainsArea(location,areaName) {
            const locationKey=nameKey(location),areaKey=nameKey(areaName);
            return !!locationKey&&!!areaKey&&(locationKey===areaKey||locationKey.includes(areaKey));
        }
        ensureCurrentProjection(stat,result) {
            if(stat?.システム状態?.主神空間滞在中)return result;
            const location=String(stat?.世界?.地点||'').trim();if(!location)return result;
            const areas=new Map(Object.entries(stat?.世界?.[PATH]?.势力地区||{}).map(([name,record])=>[nameKey(name),{名称:name,记录:record}]));
            for(const item of result?.势力地区||[]){
                if(!plain(item)||item.操作==="今回の提案を撤回")continue;
                const id=nameKey(item.名称),old=areas.get(id);
                areas.set(id,{名称:old?.名称||item.名称,记录:Object.assign({},old?.记录||{},item)});
            }
            const current=Array.from(areas.values())
                .filter(item=>plain(item.记录)&&String(item.记录.タイプ||'地区')!=="勢力"&&this.locationContainsArea(location,item.名称))
                .sort((a,b)=>nameKey(b.名称).length-nameKey(a.名称).length)[0];
            if(!current||this.granularity(current.名称).invalid)return result;
            const bucket=stat?.世界?.探索||{},existingName=stableNameIn(bucket,current.名称),existing=existingName?bucket[existingName]:null;
            const list=Array.isArray(result.探索)?result.探索:(result.探索=[]);
            const index=list.findIndex(item=>plain(item)&&nameKey(item.名称)===nameKey(current.名称));
            const explicit=index>=0?list[index]:null,progress=Math.max(10,Number(existing?.探索度)||0,Number(explicit?.探索度)||0);
            if(existing&&progress===Number(existing.探索度||0)&&!explicit)return result;
            const item={
                名称:current.名称,操作:'更新',
                リスク:String(explicit?.リスク||existing?.リスク||'F'),
                探索度:Math.min(100,progress),
                説明:String(explicit?.説明||existing?.説明||current.记录.説明||current.记录.公开动态||current.记录.进展||("実際に到達済み："+current.名称+'。')),
                隠された真実:String(explicit?.隠された真実||existing?.隠された真実||'')
            };
            if(index>=0)list.splice(index,1,item);else list.push(item);
            return result;
        }
        prepareResult(stat,result){return this.ensureCurrentProjection(stat,result);}
    }
    const DEFAULT_WORLD_EXPLORATION_SERVICE=new WorldExplorationService();
    let ACTIVE_WORLD_EXPLORATION_SERVICE=DEFAULT_WORLD_EXPLORATION_SERVICE;
    function explorationGranularity(name){return ACTIVE_WORLD_EXPLORATION_SERVICE.granularity(name);}
    function repairExplorationGranularity(stat){return ACTIVE_WORLD_EXPLORATION_SERVICE.repairGranularity(stat);}
    class WorldResultContract {
        constructor(){this.schema=this.build();}
        schemaFromSample(sample) {
            if(Array.isArray(sample))return {type:'array',items:sample.length?this.schemaFromSample(sample[0]):{type:'string'}};
            if(plain(sample)){
                const properties=Object.fromEntries(Object.entries(sample).map(([key,value])=>[key,this.schemaFromSample(value)]));
                return {type:'object',properties,additionalProperties:false};
            }
            if(typeof sample==='number')return {type:'number'};
            if(typeof sample==='boolean')return {type:'boolean'};
            return {type:'string'};
        }
        namedEntitySchema(sample,operations=['更新',"今回の提案を撤回"],requiredFields=[]) {
            const properties={名称:{type:'string',minLength:1},操作:{type:'string',enum:operations}};
            for(const [key,value] of Object.entries(sample||{}))properties[key]=this.schemaFromSample(value);
            return {type:'object',properties,required:['名称',...requiredFields],additionalProperties:false};
        }
        instruction() {
            return `WorldResult JSON オブジェクトを 1 個だけ出力してください。Markdown、説明、思考過程、<thinking>、JSON Pointer は出力しません。
フィールドの省略は変化なしを表します。既存の対象は今回変わったフィールドだけ、新規対象は作成に必要な確定事実を記述します。対象の関連付けには「名称」を使います。
「操作」の初期値は「更新」です。「削除」は Schema が削除を許可する記録だけ、「今回の提案を撤回」は訂正再試行だけに使います。
フィールドの意味は【世界エンジンの基本制約】に従い、構造と値域は以下の Schema だけを正とします。WorldResult の外にある任務・世界時刻・プレイヤーの能力値・通貨・撃破数などは出力しません。
关系 は既存の関係リストの対象だけを更新します。プレイヤーのバックグラウンド人物記録は作成しません。`;
        }
        protocol() {
            return this.instruction()+'\n\n【Canonical WorldResult JSON Schema】\n'+JSON.stringify(this.schema,null,2);
        }
        build(){
        const FACTION_RESULT_SCHEMA=this.namedEntitySchema(EXISTING.勢力);
        FACTION_RESULT_SCHEMA.properties.実力={type:'string',enum:copy(QUALITY_RANKS)};
        FACTION_RESULT_SCHEMA.properties.声望={type:'number',minimum:-5000,maximum:10000};
        const EXPLORATION_RESULT_SCHEMA=this.namedEntitySchema(EXISTING.探索);
        EXPLORATION_RESULT_SCHEMA.properties.リスク={type:'string',enum:copy(QUALITY_RANKS)};
        EXPLORATION_RESULT_SCHEMA.properties.探索度={type:'number',minimum:0,maximum:100};
        const EVENT_RESULT_SCHEMA=this.namedEntitySchema({...RECORDS.事件,...MODEL_DETAILS.事件});
        EVENT_RESULT_SCHEMA.properties.状態={type:'string',enum:["発生待ち","進行中","完了","取消済み"]};
        EVENT_RESULT_SCHEMA.properties.分类={type:'string',enum:Array.from(EVENT_CATEGORIES)};
        for(const key of ["時間",'开始时间','预计结束','更新时间','下次检查'])if(EVENT_RESULT_SCHEMA.properties[key])EVENT_RESULT_SCHEMA.properties[key].description=WORLD_TIME_MACHINE_DESCRIPTION;
        const PERSON_RESULT_SCHEMA=this.namedEntitySchema({...RECORDS.人物,...MODEL_DETAILS.人物});
        PERSON_RESULT_SCHEMA.properties.監査級={type:'string',enum:copy(NPC_AUDIT_LEVELS)};
        const OFFSET_RESULT_SCHEMA=this.namedEntitySchema(EXISTING.偏移記録);
        OFFSET_RESULT_SCHEMA.properties.影響度={type:'number'};
        const STREET_RUMOR_RESULT_SCHEMA=this.namedEntitySchema(EXISTING.街頭の噂,['更新',"削除","今回の提案を撤回"],["出典",'内容',"信頼度"]);
        STREET_RUMOR_RESULT_SCHEMA.properties.信頼度={type:'string',enum:copy(RUMOR_CREDIBILITY)};
        const INTEL_TRADE_RESULT_SCHEMA=this.namedEntitySchema(EXISTING.情報取引,['更新',"削除","今回の提案を撤回"],["売り手","情報評価","要約","要求価格","真の内幕"]);
        INTEL_TRADE_RESULT_SCHEMA.properties.情報評価={type:'string',enum:copy(INTEL_RATINGS)};
        const relationQualitySchema=()=>({type:'string',enum:copy(RELATION_QUALITIES)});
        const relationTagsSchema=()=>({type:'array',maxItems:24,items:{type:'string'}});
        const relationStringMapSchema=()=>({type:'object',additionalProperties:{type:'string'}});
        const relationRawAttrSchema=(requireFive=false,allowNumbers=false)=>{
        const properties={};
        for(const key of RELATION_ATTR_KEYS)properties[key]=allowNumbers?{anyOf:[relationQualitySchema(),{type:'number'}]}:relationQualitySchema();
        return {type:'object',additionalProperties:false,properties,required:requireFive?copy(RELATION_ATTR5):undefined};
        };
        const RELATION_SKILL_SCHEMA={type:'object',additionalProperties:false,required:["品質","タイプ","タグ","効果","説明","消費"],properties:{
        品質:relationQualitySchema(),タイプ:{type:'integer',minimum:0,maximum:2},タグ:relationTagsSchema(),
        効果:relationStringMapSchema(),説明:{type:'string'},消費:{type:'string'}
        }};
        const RELATION_OCCUPATION_SCHEMA={type:'object',additionalProperties:false,required:["タイプ",'特性',"出典"],properties:{
        タイプ:{type:'string',enum:["戦闘",'生活',"補助"]},特性:relationTagsSchema(),出典:{type:'string'}
        }};
        const RELATION_BLOODLINE_SCHEMA={type:'object',additionalProperties:false,required:["品質","タグ",'原始属性',"効果","説明"],properties:{
        品質:relationQualitySchema(),タグ:relationTagsSchema(),原始属性:relationRawAttrSchema(true,false),
        効果:relationStringMapSchema(),説明:{type:'string'}
        }};
        const RELATION_EQUIP_SCHEMA={type:'object',additionalProperties:false,required:["品質","タイプ","タグ",'原始属性',"効果","説明","消費","状態"],properties:{
        品質:relationQualitySchema(),タイプ:{type:'integer',minimum:0,maximum:8},タグ:relationTagsSchema(),
        原始属性:relationRawAttrSchema(false,false),効果:relationStringMapSchema(),説明:{type:'string'},消費:{type:'string'},
        状態:{type:'integer',minimum:0,maximum:2}
        }};
        const RELATION_STATUS_SCHEMA={type:'object',additionalProperties:false,required:["タイプ","品質","持続","出典",'原始属性',"効果"],properties:{
        タイプ:{type:'string',enum:["バフ","デバフ",'特殊']},品質:relationQualitySchema(),持続:{type:'string'},出典:{type:'string'},
        原始属性:relationRawAttrSchema(false,true),効果:{type:'string'}
        }};
        const RELATION_FORM_SCHEMA={type:'object',additionalProperties:false,required:["階層","消費",'冷却',"状態","タグ",'原始属性',"効果",'技能',"説明"],properties:{
        階層:{type:'string',enum:copy(RELATION_RANKS)},消費:{type:'string'},冷却:{type:'string'},状態:{type:'string'},タグ:relationTagsSchema(),
        原始属性:relationRawAttrSchema(true,false),効果:relationStringMapSchema(),
        技能:{type:'object',additionalProperties:copy(RELATION_SKILL_SCHEMA),maxProperties:8},説明:{type:'string'}
        }};
        const RELATION_CURRENT_FORM_SCHEMA={type:'object',additionalProperties:false,required:['激活','名称'],properties:{激活:{type:'boolean'},名称:{type:'string'}}};
        const ASSET_RESULT_SCHEMA={
        type:'object',additionalProperties:false,required:['名称'],properties:{
        名称:{type:'string',minLength:1},操作:{type:'string',enum:['更新',"削除","今回の提案を撤回"]},
        所属対象:{type:'array',items:{type:'string',minLength:1},maxItems:12},タイプ:{type:'string',enum:copy(WORLD_ASSET_TYPES)},主体規模:{type:'number',minimum:1,maximum:10},完全度:{type:'number',minimum:0,maximum:100},状態:{type:'string'},
        エネルギー:{anyOf:[{type:'object',additionalProperties:false,properties:{タイプ:{type:'string'},現在:{type:'number'},上限:{type:'number'},説明:{type:'string'}}},{type:'null'}]},
        消耗ユニット:{type:'object',additionalProperties:{anyOf:[{type:'object',additionalProperties:false,properties:{残量:{type:'number'},上限:{type:'number'},加成:{type:'array',items:{type:'string'}}}},{type:'null'}]}},
        建設シーケンス:{type:'object',additionalProperties:{anyOf:[{type:'object',additionalProperties:false,properties:{段階:{type:'string',enum:["基礎","上級","専門","最上級",'禁忌']},機能:{type:'string'},加成:{type:'array',items:{type:'string'}},産出:{type:'string'}}},{type:'null'}]}},
        駐留人員:{type:'object',additionalProperties:{anyOf:[{type:'string'},{type:'null'}]}},
        待機イベント:{type:'array',items:{type:'string'}}
        }
        };
        const schema={
        type:'object',
        additionalProperties:false,
        required:["要約"],
        properties:{
        要約:{type:'string'},
        時間:{type:'string',minLength:1,description:"現在の世界時間。"+WORLD_TIME_MACHINE_DESCRIPTION},
        通貨:{type:'object',additionalProperties:false,properties:{
        体系:{type:'string'},
        購買力基準:{type:'string'},
        経済変動:{type:'string'}
        }},
        暦法:{type:'object',additionalProperties:false,properties:{
        名称:{type:'string'},
        月日数:{type:'array',maxItems:24,items:{type:'integer',minimum:1,maximum:99}},
        閏年規則:{type:'string'}
        }},
        事件:{type:'array',maxItems:30,items:EVENT_RESULT_SCHEMA},
        人物:{type:'array',maxItems:25,items:PERSON_RESULT_SCHEMA},
        势力地区:{type:'array',maxItems:20,items:this.namedEntitySchema({...RECORDS.势力地区,...MODEL_DETAILS.势力地区})},
        历史:{type:'array',maxItems:12,items:this.namedEntitySchema(RECORDS.历史,['更新',"今回の提案を撤回"])},
        传播:{type:'array',maxItems:20,items:this.namedEntitySchema({...RECORDS.传播,...MODEL_DETAILS.传播},['更新',"削除","今回の提案を撤回"])},
        因果:{type:'object',additionalProperties:false,properties:{
        現在段階:{type:'string'},
        宏观顺序:{type:'array',minItems:0,maxItems:5,items:{type:'string'}},
        偏移記録:{type:'array',maxItems:10,items:OFFSET_RESULT_SCHEMA}
        }},
        勢力:{type:'array',maxItems:15,items:FACTION_RESULT_SCHEMA},
        探索:{type:'array',maxItems:20,items:EXPLORATION_RESULT_SCHEMA},
        资产:{type:'array',maxItems:20,items:ASSET_RESULT_SCHEMA},
        异端:{type:'array',maxItems:15,items:{type:'object',additionalProperties:false,required:['名称',"状態"],properties:{名称:{type:'string',minLength:1},操作:{type:'string',enum:['更新',"今回の提案を撤回"]},状態:{type:'string',enum:["活動中",'死亡']}}}},
        噂:{type:'object',additionalProperties:false,properties:{
        街頭の噂:{type:'array',maxItems:6,items:STREET_RUMOR_RESULT_SCHEMA},
        情報取引:{type:'array',maxItems:6,items:INTEL_TRADE_RESULT_SCHEMA},
        布告と檄文:{type:'array',maxItems:6,items:this.namedEntitySchema(EXISTING.布告と檄文,['更新',"削除","今回の提案を撤回"],["発布者",'内容',"掲示位置"])}
        }},
        关系:{type:'array',maxItems:25,items:{type:'object',additionalProperties:false,required:['名称'],properties:{
        名称:{type:'string',minLength:1},操作:{type:'string',enum:['更新',"今回の提案を撤回"]},
        登場:{type:'boolean'},種族:{type:'string'},身分:relationTagsSchema(),
        職業:{type:'object',additionalProperties:copy(RELATION_OCCUPATION_SCHEMA),maxProperties:12},
        階層:{type:'string',enum:copy(RELATION_RANKS)},HP:{type:'number',minimum:0,maximum:99999999},
        THP:{type:'number',minimum:0,maximum:99999999},EP:{type:'number',minimum:0,maximum:99999999},
        状態:{type:'object',additionalProperties:copy(RELATION_STATUS_SCHEMA),maxProperties:12},
        血統:{type:'object',additionalProperties:copy(RELATION_BLOODLINE_SCHEMA),maxProperties:2},
        装備:{type:'object',additionalProperties:copy(RELATION_EQUIP_SCHEMA),maxProperties:6},
        技能:{type:'object',additionalProperties:copy(RELATION_SKILL_SCHEMA),maxProperties:4},
        形態庫:{type:'object',additionalProperties:copy(RELATION_FORM_SCHEMA),maxProperties:4},
        現在形態:copy(RELATION_CURRENT_FORM_SCHEMA),
        性格:{type:'string'},好み:{type:'string'},外見:{type:'string'},服装:{type:'string'},
        仲間:{type:'boolean'},好感度:{type:'number',minimum:-100,maximum:100},態度:{type:'string'},背景:{type:'string'}
        }}}
        }
        };
        this.schemas={
            faction:FACTION_RESULT_SCHEMA,exploration:EXPLORATION_RESULT_SCHEMA,event:EVENT_RESULT_SCHEMA,person:PERSON_RESULT_SCHEMA,
            offset:OFFSET_RESULT_SCHEMA,streetRumor:STREET_RUMOR_RESULT_SCHEMA,intelTrade:INTEL_TRADE_RESULT_SCHEMA,
            relationSkill:RELATION_SKILL_SCHEMA,relationOccupation:RELATION_OCCUPATION_SCHEMA,relationBloodline:RELATION_BLOODLINE_SCHEMA,
            relationEquip:RELATION_EQUIP_SCHEMA,relationStatus:RELATION_STATUS_SCHEMA,relationForm:RELATION_FORM_SCHEMA,
            relationCurrentForm:RELATION_CURRENT_FORM_SCHEMA,asset:ASSET_RESULT_SCHEMA
        };
        return schema;
        }
    }
    const WORLD_RESULT_CONTRACT=new WorldResultContract();
    // Transitional aliases: legacy features still decorate component schemas at startup.
    const FACTION_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.faction;
    const EXPLORATION_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.exploration;
    const EVENT_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.event;
    const PERSON_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.person;
    const OFFSET_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.offset;
    const STREET_RUMOR_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.streetRumor;
    const INTEL_TRADE_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.intelTrade;
    const RELATION_SKILL_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationSkill;
    const RELATION_OCCUPATION_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationOccupation;
    const RELATION_BLOODLINE_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationBloodline;
    const RELATION_EQUIP_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationEquip;
    const RELATION_STATUS_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationStatus;
    const RELATION_FORM_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationForm;
    const RELATION_CURRENT_FORM_SCHEMA=WORLD_RESULT_CONTRACT.schemas.relationCurrentForm;
    const ASSET_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schemas.asset;
    const WORLD_RESULT_SCHEMA=WORLD_RESULT_CONTRACT.schema;
    function protocol(){return WORLD_RESULT_CONTRACT.protocol();}
    class WorldResultNormalizer {
        rumorCredibility(value) {
            const raw=String(value??'').trim();
            if(RUMOR_CREDIBILITY.includes(raw))return {value:raw,recognized:true,raw};
            if(/^(?:(?:可信|信頼できる)|(?:属实|事実)|(?:真实|真実)|(?:确实|確実)|高|(?:较高|高め)|(?:很高|非常に高い)|(?:基本属实|概ね事実))$/.test(raw))return {value:"おそらく信頼できる",recognized:true,raw};
            if(/^(?:(?:不可信|信頼できない)|(?:虚假|虚偽)|(?:谣言|デマ)|低|(?:较低|低め)|(?:很低|非常に低い)|(?:纯属谣言|完全なデマ))$/.test(raw))return {value:"酔い話",recognized:true,raw};
            return {value:"疑わしい",recognized:false,raw};
        }
        normalizeRumorCredibility(value) {
            return this.rumorCredibility(value).value;
        }
        assertRumorCredibility(value) {
            const parsed=this.rumorCredibility(value);
            if(!parsed.recognized)throw new Error("噂の信頼度が無効："+(parsed.raw||'空')+"。許可値は酔い話・疑わしい・おそらく信頼できる、または判別可能な信頼性の同義表現です");
            return parsed.value;
        }
        sampleForWorldResultList(key) {
            if(key==='事件')return {...RECORDS.事件,...MODEL_DETAILS.事件};
            if(key==='人物')return {...RECORDS.人物,...MODEL_DETAILS.人物};
            if(key==='势力地区')return {...RECORDS.势力地区,...MODEL_DETAILS.势力地区};
            if(key==='历史')return RECORDS.历史;
            if(key==='传播')return {...RECORDS.传播,...MODEL_DETAILS.传播};
            if(key==="勢力")return EXISTING.勢力;
            if(key==='探索')return EXISTING.探索;
            if(key==='異端')return EXISTING.名簿;
            return {};
        }
        detailTextField(sample) {
            for(const key of ['名称','事实','行动','影响','内容',"説明",'问题','对象','地点']){
                if(Object.hasOwn(sample||{},key)&&typeof sample[key]==='string')return key;
            }
            return Object.keys(sample||{}).find(key=>typeof sample[key]==='string')||'';
        }
        normalizeStructuredDetail(value,sample) {
            const out=copy(sample||{});
            if(plain(value)){
                for(const key of Object.keys(sample||{})){
                    if(Object.hasOwn(value,key))out[key]=this.normalizeResultField(value[key],sample[key]);
                }
                return out;
            }
            if(value!==undefined&&value!==null&&value!==''){
                const key=this.detailTextField(sample);
                if(key)out[key]=this.normalizeResultField(value,sample[key]);
            }
            return out;
        }
        normalizeResultField(value,sample) {
            if(Array.isArray(sample)){
                const list=Array.isArray(value)?value:(value===undefined||value===null||value===''?[]:[value]);
                if(sample.length&&plain(sample[0]))return list.filter(item=>item!==undefined&&item!==null&&item!=='').map(item=>this.normalizeStructuredDetail(item,sample[0]));
                return list.map(copy);
            }
            if(plain(sample)){
                if(!plain(value))return copy(sample);
                const out=copy(sample);
                for(const key of Object.keys(sample))if(Object.hasOwn(value,key))out[key]=this.normalizeResultField(value[key],sample[key]);
                return out;
            }
            if(typeof sample==='number'){
                const number=Number(value);
                return Number.isFinite(number)?number:value;
            }
            if(typeof sample==='boolean')return typeof value==='boolean'?value:!!value;
            if(typeof sample==='string'&&value!==undefined&&value!==null)return String(value);
            return copy(value);
        }
        normalizeNamedResultList(value,sample,allowedOps=['更新',"今回の提案を撤回"]) {
            const sampleKeys=Object.keys(sample||{}),singleField=sampleKeys.length===1?sampleKeys[0]:'';
            const list=Array.isArray(value)?value:plain(value)?Object.entries(value).map(([name,item])=>{
                if(plain(item))return Object.assign({名称:name},copy(item));
                if(singleField&&item!==undefined&&item!==null)return {名称:name,[singleField]:copy(item)};
                return null;
            }).filter(Boolean):[];
            const fields=new Set(sampleKeys),map=new Map();
            const aliases={
                所在世界:'所属世界',
                已知信息:'认知',
                下次检查条件:'下次检查',
                事实:'内容'
            };
            for(const source of list){
                if(!plain(source))continue;
                const raw=copy(source);
                for(const [from,to] of Object.entries(aliases)){
                    if(fields.has(to)&&Object.hasOwn(raw,from)&&!Object.hasOwn(raw,to))raw[to]=raw[from];
                }
                if(fields.has("信頼度")&&!Object.hasOwn(raw,"信頼度")){
                    const rumorClass=String(raw.分类||'').trim();
                    raw.信頼度=({'事实':"おそらく信頼できる","推測":"疑わしい","デマ":"酔い話","酔い話":"酔い話","疑わしい":"疑わしい","おそらく信頼できる":"おそらく信頼できる"})[rumorClass]||"疑わしい";
                }
                const name=String(raw.名称??raw.name??'').trim();
                if(!name)continue;
                const item={名称:name};
                const operation=String(raw.操作||'更新');
                item.操作=allowedOps.includes(operation)?operation:'更新';
                for(const key of fields)if(Object.hasOwn(raw,key))item[key]=this.normalizeResultField(raw[key],sample[key]);
                const id=nameKey(name),prev=map.get(id);
                if(item.操作==="今回の提案を撤回"){map.delete(id);continue;}
                map.set(id,prev?Object.assign(prev,item):item);
            }
            return Array.from(map.values());
        }
        normalizeAssetResultList(value) {
            const sourceList=Array.isArray(value)?value:plain(value)?Object.entries(value).map(([name,item])=>plain(item)?Object.assign({名称:name},copy(item)):{名称:name,操作:item==="削除"?"削除":'更新'}):[];
            const map=new Map(),stringFields=["タイプ","状態"],numberFields=["主体規模","完全度"];
            const normalizeOwners=value=>{
                const source=Array.isArray(value)?value:(value===undefined?[]:[value]),out=[];
                for(const raw of source){const owner=String(raw??'').trim();if(!owner||owner==="所有者なし"||out.includes(owner))continue;out.push(owner);}
                return out.slice(0,12);
            };
            const normalizeMap=(value,kind)=>{
                if(!plain(value))return {};
                const out={};
                for(const [name,raw] of Object.entries(value)){
                    if(forbidden.has(name))continue;
                    if(raw===null){out[name]=null;continue;}
                    if(kind==='person'){
                        if(typeof raw==='string')out[name]=raw;
                        continue;
                    }
                    if(!plain(raw))continue;
                    const item={};
                    if(kind==='unit'){
                        for(const key of ["残量",'上限'])if(Object.hasOwn(raw,key)){const n=Number(raw[key]);if(Number.isFinite(n))item[key]=n;}
                        if(Array.isArray(raw.加成))item.加成=raw.加成.filter(x=>typeof x==='string');
                    }else{
                        if(Object.hasOwn(raw,"段階"))item.段階=String(raw.段階||'');
                        for(const key of ["機能","産出"])if(Object.hasOwn(raw,key))item[key]=String(raw[key]??'');
                        if(Array.isArray(raw.加成))item.加成=raw.加成.filter(x=>typeof x==='string');
                    }
                    out[name]=item;
                }
                return out;
            };
            const mergeItem=(previous,item)=>{
                if(!previous)return item;
                const merged=Object.assign({},previous,item);
                for(const field of ["消耗ユニット","建設シーケンス","駐留人員"]){
                    if(plain(previous[field])&&plain(item[field]))merged[field]=Object.assign({},previous[field],item[field]);
                }
                if(plain(previous.エネルギー)&&plain(item.エネルギー))merged.エネルギー=Object.assign({},previous.エネルギー,item.エネルギー);
                return merged;
            };
            for(const source of sourceList){
                if(!plain(source))continue;
                const name=String(source.名称??source.name??'').trim();if(!name||forbidden.has(name))continue;
                const operation=['更新',"削除","今回の提案を撤回"].includes(source.操作)?source.操作:'更新';
                const id=nameKey(name);
                if(operation==="今回の提案を撤回"){map.delete(id);continue;}
                const item={名称:name,操作:operation};
                if(Object.hasOwn(source,"所属対象"))item.所属対象=normalizeOwners(source.所属対象);
                for(const field of stringFields)if(Object.hasOwn(source,field))item[field]=String(source[field]??'');
                for(const field of numberFields)if(Object.hasOwn(source,field)){const n=Number(source[field]);item[field]=Number.isFinite(n)?n:source[field];}
                if(Object.hasOwn(source,"エネルギー")){
                    if(source.エネルギー===null)item.エネルギー=null;
                    else if(plain(source.エネルギー)){
                        item.エネルギー={};
                        for(const field of ["タイプ","説明"])if(Object.hasOwn(source.エネルギー,field))item.エネルギー[field]=String(source.エネルギー[field]??'');
                        for(const field of ["現在",'上限'])if(Object.hasOwn(source.エネルギー,field)){const n=Number(source.エネルギー[field]);if(Number.isFinite(n))item.エネルギー[field]=n;}
                    }
                }
                if(Object.hasOwn(source,"消耗ユニット"))item.消耗ユニット=normalizeMap(source.消耗ユニット,'unit');
                if(Object.hasOwn(source,"建設シーケンス"))item.建設シーケンス=normalizeMap(source.建設シーケンス,'build');
                if(Object.hasOwn(source,"駐留人員"))item.駐留人員=normalizeMap(source.駐留人員,'person');
                if(Object.hasOwn(source,"待機イベント"))item.待機イベント=Array.isArray(source.待機イベント)?source.待機イベント.filter(x=>typeof x==='string'):[];
                map.set(id,mergeItem(map.get(id),item));
            }
            return Array.from(map.values());
        }
        normalizeRelationResultList(value) {
            const list=Array.isArray(value)?value:[],map=new Map();
            for(const source of list){
                if(!plain(source))continue;
                const name=String(source.名称??source.name??'').trim();if(!name)continue;
                const item={名称:name,操作:source.操作==="今回の提案を撤回"?"今回の提案を撤回":'更新'};
                for(const key of RELATION_SYNC_KEYS){
                    if(!Object.hasOwn(source,key))continue;
                    const raw=source[key];
                    if(["登場","仲間"].includes(key))item[key]=typeof raw==='boolean'?raw:!!raw;
                    else if(['HP','THP','EP','好感度'].includes(key)){const n=Number(raw);item[key]=Number.isFinite(n)?n:raw;}
                    else if(key==="身分")item[key]=Array.isArray(raw)?raw.filter(x=>typeof x==='string'):raw;
                    else if(RELATION_COMPONENT_FIELDS.has(key)||key==="現在形態")item[key]=copy(raw);
                    else item[key]=raw==null?'':String(raw);
                }
                const id=nameKey(name),prev=map.get(id);
                if(item.操作==="今回の提案を撤回"){map.delete(id);continue;}
                map.set(id,prev?Object.assign(prev,item):item);
            }
            return Array.from(map.values());
        }
        normalizeWorldResult(value) {
            if(!plain(value))throw new Error("WorldResult は JSON オブジェクトでなければならない");
            const result={要約:String(value.要約??value.summary??"世界は進行を続ける")};
            if(Object.hasOwn(value,"時間")){const time=String(value.時間??'').trim();if(time)result.時間=time;}
            const legacyStage=(Object.hasOwn(value,'公开摘要')||Object.hasOwn(value,'public_summary'))?String(value.公开摘要??value.public_summary??'').trim():'';
            result.通貨={};
            if(plain(value.通貨)){
                for(const key of Object.keys(CURRENCY_FIELDS))if(Object.hasOwn(value.通貨,key))result.通貨[key]=String(value.通貨[key]??'');
            }
            result.暦法={};
            if(plain(value.暦法)){
                if(Object.hasOwn(value.暦法,'名称'))result.暦法.名称=String(value.暦法.名称??'');
                if(Array.isArray(value.暦法.月日数))result.暦法.月日数=value.暦法.月日数.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=99).slice(0,24);
                if(Object.hasOwn(value.暦法,"閏年規則"))result.暦法.閏年規則=String(value.暦法.閏年規則??'');
            }
            for(const key of ['事件','人物','势力地区','历史','传播',"勢力",'探索']){
                const operations=(key==='传播')?['更新',"削除","今回の提案を撤回"]:['更新',"今回の提案を撤回"];
                result[key]=this.normalizeNamedResultList(value[key],this.sampleForWorldResultList(key),operations);
            }
            result.资产=this.normalizeAssetResultList(value.资产);
            result.异端=(Array.isArray(value.异端)?value.异端:[]).filter(plain).map(item=>({
                名称:String(item.名称||'').trim(),
                操作:item.操作==="今回の提案を撤回"?"今回の提案を撤回":'更新',
                状態:["活動中",'死亡'].includes(item.状態)?item.状態:''
            })).filter(item=>item.名称&&item.状態);
            result.因果={};
            const causal=plain(value.因果)?value.因果:{};
            if(Object.hasOwn(causal,"現在段階"))result.因果.現在段階=String(causal.現在段階||'');
            else if(legacyStage)result.因果.現在段階=legacyStage;
            if(Array.isArray(causal.宏观顺序))result.因果.宏观顺序=causal.宏观顺序.map(x=>String(x||'').trim()).filter(Boolean).slice(0,5);
            result.因果.偏移記録=this.normalizeNamedResultList(causal.偏移記録,EXISTING.偏移記録,['更新',"今回の提案を撤回"]);
            result.噂={};
            const rumors=plain(value.噂)?value.噂:{};
            for(const key of WORLD_RESULT_RUMORS){
                let list=this.normalizeNamedResultList(rumors[key],EXISTING[key],['更新',"削除","今回の提案を撤回"]);
                if(key==="街頭の噂"){
                    for(const item of list)if(Object.hasOwn(item,"信頼度"))item.信頼度=this.normalizeRumorCredibility(item.信頼度);
                    const seen=new Set(),deduped=[];
                    for(const item of list){
                        const signature=String(item.内容||'').replace(/\s+/g,' ').trim();
                        if(item.操作==='更新'&&signature&&seen.has(signature))continue;
                        if(item.操作==='更新'&&signature)seen.add(signature);
                        deduped.push(item);
                    }
                    list=deduped;
                }
                result.噂[key]=list;
            }
            const relationSource=plain(value.关系)&&!Array.isArray(value.关系)
                ?Object.entries(value.关系).map(([name,item])=>plain(item)?Object.assign({名称:name},copy(item)):{名称:name,好感度:item})
                :value.关系;
            result.关系=this.normalizeRelationResultList(relationSource);
            return result;
        }
        mergeNamedResultLists(base,incoming) {
            const map=new Map();
            for(const item of base||[])map.set(nameKey(item.名称),copy(item));
            for(const item of incoming||[]){
                const id=nameKey(item.名称);
                if(item.操作==="今回の提案を撤回"){map.delete(id);continue;}
                map.set(id,Object.assign(map.get(id)||{},copy(item)));
            }
            return Array.from(map.values());
        }
        mergeWorldResults(base,incoming) {
            const a=base?this.normalizeWorldResult(base):this.normalizeWorldResult({要約:''});
            const b=this.normalizeWorldResult(incoming);
            const result={要約:[a.要約,b.要約].filter(Boolean).filter((x,i,list)=>list.indexOf(x)===i).join('；')};
            if(Object.hasOwn(b,"時間"))result.時間=b.時間;else if(Object.hasOwn(a,"時間"))result.時間=a.時間;
            result.通貨=Object.assign({},a.通貨||{},b.通貨||{});
            result.暦法=Object.assign({},a.暦法||{},b.暦法||{});
            for(const key of ['事件','人物','势力地区','历史','传播',"勢力",'探索','资产','異端','关系'])result[key]=this.mergeNamedResultLists(a[key],b[key]);
            result.因果={
                偏移記録:this.mergeNamedResultLists(a.因果?.偏移記録,b.因果?.偏移記録)
            };
            if(Object.hasOwn(b.因果||{},"現在段階"))result.因果.現在段階=b.因果.現在段階;
            else if(Object.hasOwn(a.因果||{},"現在段階"))result.因果.現在段階=a.因果.現在段階;
            if(Array.isArray(b.因果?.宏观顺序)&&b.因果.宏观顺序.length)result.因果.宏观顺序=copy(b.因果.宏观顺序);
            else if(Array.isArray(a.因果?.宏观顺序))result.因果.宏观顺序=copy(a.因果.宏观顺序);
            result.噂={};
            for(const key of WORLD_RESULT_RUMORS)result.噂[key]=this.mergeNamedResultLists(a.噂?.[key],b.噂?.[key]);
            return result;
        }
    }
    const DEFAULT_WORLD_RESULT_NORMALIZER=new WorldResultNormalizer();
    function normalizeWorldResult(value){return DEFAULT_WORLD_RESULT_NORMALIZER.normalizeWorldResult(value);}
    function mergeWorldResults(base,incoming){return DEFAULT_WORLD_RESULT_NORMALIZER.mergeWorldResults(base,incoming);}
    class WorldResultPatchCompilationService {
        constructor(normalizer,exploration,causal,patchPolicy,npcAudit,people,taskLedger,chronology,timePolicy,relationSync,assetPolicy){
            this.normalizer=normalizer||DEFAULT_WORLD_RESULT_NORMALIZER;
            this.exploration=exploration||DEFAULT_WORLD_EXPLORATION_SERVICE;
            this.causal=causal||DEFAULT_WORLD_CAUSAL_SERVICE;
            this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;
            this.npcAudit=npcAudit||DEFAULT_WORLD_NPC_AUDIT_SERVICE;
            this.people=people||DEFAULT_WORLD_PERSON_ACTIVITY_SERVICE;
            this.taskLedger=taskLedger||DEFAULT_WORLD_TASK_AWARENESS_SERVICE;
            this.chronology=chronology||DEFAULT_WORLD_CHRONOLOGY_POLICY;
            this.timePolicy=timePolicy||DEFAULT_WORLD_TIME_POLICY;
            this.relationSync=relationSync||DEFAULT_WORLD_RELATION_SYNC_POLICY;
            this.assetPolicy=assetPolicy||DEFAULT_WORLD_ASSET_MATERIALIZATION_POLICY;
        }
        resultFields(item,sample) {
            const out={};
            for(const key of Object.keys(sample||{}))if(Object.hasOwn(item,key))out[key]=copy(item[key]);
            return out;
        }
        compile(stat,value) {
            const originalStat=stat,initial=this.normalizer.normalizeWorldResult(value),timing=this.timePolicy.prepareCompile(originalStat,initial);
            stat=timing.validationStat;
            const prepared=this.people.normalizeAlienActivityTimestamps(stat,timing.result);
            const result=this.normalizer.normalizeWorldResult(prepared),patches=[],warnings=[];
            this.npcAudit.normalizeNewEquipment(stat,result);
            const droppedCausalOffsets=this.causal.prepareResult(stat,result);
            this.chronology.validate(stat,result);
            this.taskLedger.validateReferences(stat,result);
            this.exploration.prepareResult(stat,result);
            const exists=parts=>this.patchPolicy.get(stat,this.patchPolicy.canonicalizeParts(parts,stat));
            const addEntity=(parts,item,sample,options={})=>{
                if(item.操作==="今回の提案を撤回")return;
                let actual=this.patchPolicy.canonicalizeParts(parts,stat),old=this.patchPolicy.get(stat,actual);
                if(item.操作==="削除"){
                    if(old!==undefined&&options.removable)patches.push({op:'remove',path:this.patchPolicy.pointer(actual)});
                    return;
                }
                const record=this.resultFields(item,sample);
                if(options.person&&!old&&!Object.hasOwn(record,'所属世界'))record.所属世界=stat.世界?.名称||'';
                if(options.event&&!Object.hasOwn(record,"説明"))record.説明=item.名称;
                if(options.event){
                    const mergedEvent=Object.assign(copy(RECORDS.事件),plain(old)?old:{},record);
                    if(["発生待ち","進行中"].includes(mergedEvent.状態)){
                        const anchor=eventTimeAnchor(mergedEvent);
                        if(!anchor||VAGUE_EVENT_TIME.test(anchor))throw new Error("事件の時刻基準がないか、曖昧すぎます："+item.名称+"；具体的な世界時間/時間帯を記入するか、相対/因果時間（例：“発生から数日後”“前提となる節目の完了日の夕方”）を明示してください。空値と“近日/後ほど/将来/未定/不明”は禁止です");
                    }
                }
                if(!Object.keys(record).length){warnings.push("空の業務レコードを無視："+item.名称);return;}
                patches.push({op:old===undefined?'add':'replace',path:this.patchPolicy.pointer(actual),value:record});
            };
            for(const [key,value] of Object.entries(result.通貨||{})){
                const parts=['世界',"通貨",key],old=this.patchPolicy.get(stat,parts);
                if(old!==value)patches.push({op:old===undefined?'add':'replace',path:this.patchPolicy.pointer(parts),value});
            }
            for(const [key,value] of Object.entries(result.暦法||{})){
                const parts=['世界',"暦法",key],old=this.patchPolicy.get(stat,parts);
                if(!same(old,value))patches.push({op:old===undefined?'add':'replace',path:this.patchPolicy.pointer(parts),value:copy(value)});
            }
            for(const item of result.事件)addEntity(['世界',PATH,'事件',item.名称],item,{...RECORDS.事件,...MODEL_DETAILS.事件},{event:true});
            const plannedDead=new Set((result.异端||[]).filter(item=>item.操作!=="今回の提案を撤回"&&item.状態==='死亡').map(item=>nameKey(item.名称)));
            for(const item of result.人物){
                const alien=alienRosterMatch(stat,item.名称);
                if((alien&&alien.记录?.状態==='死亡')||plannedDead.has(nameKey(item.名称))){warnings.push("異端はすでに死亡しているため、バックグラウンド人物の復元は禁止："+item.名称);continue;}
                addEntity(['世界',PATH,'人物',item.名称],item,{...RECORDS.人物,...MODEL_DETAILS.人物},{person:true});
            }
            for(const item of result.势力地区)addEntity(['世界',PATH,'势力地区',item.名称],item,{...RECORDS.势力地区,...MODEL_DETAILS.势力地区});
            for(const item of result.传播)addEntity(['世界',PATH,'传播',item.名称],item,{...RECORDS.传播,...MODEL_DETAILS.传播},{removable:true});
            for(const item of result.历史){
                if(item.操作==="今回の提案を撤回")continue;
                let name=item.名称,parts=['世界',PATH,'历史',name],record=this.resultFields(item,RECORDS.历史);
                if(!Object.keys(record).length){warnings.push("空の歴史レコードを無視："+name);continue;}
                if(this.patchPolicy.get(stat,parts)!==undefined){
                    const old=this.patchPolicy.get(stat,parts);
                    if(same(this.patchPolicy.normalizeBackendRecord('历史',record,old),old))continue;
                    let n=2;while(this.patchPolicy.get(stat,['世界',PATH,'历史',name+'#'+n])!==undefined)n++;
                    name=name+'#'+n;parts=['世界',PATH,'历史',name];
                }
                patches.push({op:'add',path:this.patchPolicy.pointer(parts),value:record});
            }
            const causal=result.因果||{};
            if(Object.hasOwn(causal,"現在段階")){
                const parts=['世界',"因果軌道","現在段階"],old=this.patchPolicy.get(stat,parts);
                patches.push({op:old===undefined?'add':'replace',path:this.patchPolicy.pointer(parts),value:causal.現在段階});
            }
            if(Array.isArray(causal.宏观顺序)&&causal.宏观顺序.length>=3&&causal.宏观顺序.length<=5){
                const parts=['世界',"因果軌道","ストーリーライン"],story=causal.宏观顺序.join(' -> '),old=this.patchPolicy.get(stat,parts);
                patches.push({op:old===undefined?'add':'replace',path:this.patchPolicy.pointer(parts),value:story});
            } else if(Array.isArray(causal.宏观顺序)&&causal.宏观顺序.length)warnings.push("マクロ順序が3個未満です。補充を待ってから因果軌道へ投影します");
            for(const item of causal.偏移記録||[]){
                if((stat.設定||{}).世界超安定){warnings.push("世界超安定：偏移を無視 "+item.名称);continue;}
                addEntity(['世界',"因果軌道","偏移記録",item.名称],item,EXISTING.偏移記録);
            }
            for(const item of result.勢力)addEntity(['世界',"勢力",item.名称],item,EXISTING.勢力);
            for(const item of result.资产||[]){
                if(item.操作==="今回の提案を撤回")continue;
                const target=stableNameIn(stat.资产||{},item.名称),existing=target?(stat.资产||{})[target]:undefined;
                if(!target&&item.操作!=="削除")this.assetPolicy.validateScope(item,true);
                const tombstoneName=stableNameIn(stat?.世界?.[PATH]?.资产墓碑||{},item.名称);
                if(!target&&item.操作!=="削除"&&tombstoneName)throw new Error("資産はユーザーまたはMVUによって削除済みで、削除保護の対象です。世界エンジンによる再構築は禁止："+item.名称);
                if(item.操作==="削除"){
                    if(target)patches.push({op:'remove',path:this.patchPolicy.pointer(['资产',target])});
                    else warnings.push("資産オブジェクトが存在しないため、削除を無視："+item.名称);
                    continue;
                }
                const finalName=target||item.名称;
                const record=this.assetPolicy.materializeRecord(existing,item,!target);
                if(existing&&same(existing,record))continue;
                patches.push({op:target?'replace':'add',path:this.patchPolicy.pointer(['资产',finalName]),value:record});
            }
            for(const item of result.探索){
                this.exploration.validateItem(stat,item);
                addEntity(['世界','探索',item.名称],item,EXISTING.探索);
            }
            if(!(stat.設定||{}).単一世界)for(const item of result.异端){
                if(item.操作==="今回の提案を撤回")continue;
                const roster=stat.世界?.異端レーダー?.名簿||{},target=stableNameIn(roster,item.名称);
                if(!target){warnings.push("異端リストの対象が存在しないため、世界エンジンによる新規追加は禁止："+item.名称);continue;}
                const oldStatus=roster[target]?.状態;
                if(oldStatus==='死亡'&&item.状態!=='死亡'){warnings.push("死亡した異端の状態は不可逆："+target);continue;}
                if(oldStatus===item.状態)continue;
                patches.push({op:'replace',path:this.patchPolicy.pointer(['世界',"異端レーダー","名簿",target,"状態"]),value:item.状態});
            } else if(result.异端.length)warnings.push("単一世界：異端レーダーの更新を無視");
            for(const key of WORLD_RESULT_RUMORS)for(const item of result.噂[key])addEntity(["噂",key,item.名称],item,EXISTING[key],{removable:true});
            const auditNames=new Set(this.npcAudit.audit(stat).map(item=>nameKey(item.名称)));
            for(const item of result.关系||[]){
                if(item.操作==="今回の提案を撤回")continue;
                const target=stableNameIn(stat.関係リスト||{},item.名称);
                if(!target){warnings.push("関係オブジェクトが存在しないため、世界エンジンによる新規作成は禁止："+item.名称);continue;}
                const npc=stat.関係リスト[target],fields=this.resultFields(item,RELATION_SYNC_FIELDS);
                if(!Object.keys(fields).length){warnings.push("空の関係更新を無視："+target);continue;}
                for(const [field,value] of Object.entries(fields)){
                    if(RELATION_AUDIT_ONLY_FIELDS.has(field)&&!auditNames.has(nameKey(target))){
                        warnings.push("NPCは現在、構築監査リストにないため、構築フィールドを無視："+target+'/'+field);
                        continue;
                    }
                    this.relationSync.validateRelationSyncValue(field,value,npc,target);
                    const nextValue=RELATION_COMPONENT_FIELDS.has(field)?this.relationSync.mergeRelationComponent(field,npc?.[field],value):this.relationSync.materializeRelationComponent(field,value);
                    this.relationSync.assertComponentLimit(field,nextValue,target);
                    if(same(npc?.[field],nextValue))continue;
                    patches.push({op:npc?.[field]===undefined?'add':'replace',path:this.patchPolicy.pointer(["関係リスト",target,field]),value:copy(nextValue)});
                }
            }
            const causalRepairs=this.causal.staleLocalOffsetRepairs(stat,result);
            const occupiedCausalPaths=new Set(patches.map(patch=>patch.path));
            for(const patch of causalRepairs.patches)if(!occupiedCausalPaths.has(patch.path))patches.push(patch);
            if(droppedCausalOffsets.length)warnings.push("世界規模でない因果偏移を無視："+droppedCausalOffsets.join('、'));
            if(causalRepairs.names.length)warnings.push("局所的な安定偏移を削除："+causalRepairs.names.join('、'));
            return this.timePolicy.finalizeCompile(originalStat,timing.proposal,{result,patches,warnings});
        }


    }
    const DEFAULT_WORLD_RESULT_PATCH_COMPILATION_SERVICE=new WorldResultPatchCompilationService(
        DEFAULT_WORLD_RESULT_NORMALIZER,
        DEFAULT_WORLD_EXPLORATION_SERVICE,
        DEFAULT_WORLD_CAUSAL_SERVICE,
        DEFAULT_WORLD_PATCH_POLICY,
        DEFAULT_WORLD_NPC_AUDIT_SERVICE,
        DEFAULT_WORLD_PERSON_ACTIVITY_SERVICE,
        DEFAULT_WORLD_TASK_AWARENESS_SERVICE,
        DEFAULT_WORLD_CHRONOLOGY_POLICY,
        DEFAULT_WORLD_TIME_POLICY,
        DEFAULT_WORLD_RELATION_SYNC_POLICY,
        DEFAULT_WORLD_ASSET_MATERIALIZATION_POLICY
    );
    const RUMOR_LIVELINESS_TOPICS=["懸賞の手がかり","交易路の動向","勢力情報","遺跡の座標","人物の足取り","闇市場の情報","宝物の噂","魔物の異常行動","深淵の異変","種族間の摩擦","物価変動"];
    const RUMOR_LIVELINESS_RULES=`【噂と伝播・継続する活動層】
1. 街頭の噂・情報取引・布告と檄文には、それぞれ直近 3 件を表示する。空の分類には今回 2 件を追加する。各項目は約 60 字とし、重大な影響がある場合を除いて <user> を中心にしない。
新しい名前で直接追加できる。統合後はプログラムが最古の項目を自動整理するため、容量確保だけを目的とした「操作:移除」は不要。同名なら既存項目の更新と見なし、優先して保持する。失効・撤回・明示的な削除が必要な場合だけ「操作:移除」を使う。
2. 街頭の噂は現在地・語り手や目撃者・情勢に応じて 1～2 件を入れ替える。情報取引は売り手がいる場合に 1～2 件更新し、購入・支払い・消費による削除は本文の結果に基づき MVU が処理する。布告と檄文は現在地と発布勢力に応じて入れ替える。
3. 非公開の伝播は、人物の認識と公開の噂をつなぐ因果経路である。伝播可能な新事実が生じたら経路を作成または進行させる。関連事件の変化・情報の陳腐化・期限到来時には範囲・受け手・内容・誘発する行動を再確認する。終了・失効した伝播は復活させない。
4. 優先する話題：${RUMOR_LIVELINESS_TOPICS.join(' / ')}。`;
    const RUMOR_THROTTLE_RULES=`【噂の更新頻度・前述の毎回入れ替える要件を置き換える】
1. 公開噂は既定で不変。「传闻维护.本轮公开传闻动作」が更新を要求した時のみ噂を書く；活性感の演出、件数合わせ、些細な事柄のために毎ターン書き換えることは禁止する。
2. トリガーは次のみ：ある分類が空で1件補充が必要；既存の伝播チェーンが関連イベントの新展開、期限到来、または72時間超過により再確認を要する；今回新たに確立/更新され、まだ伝播チェーンがなく、公開の兆候/可視の影響を持つ新イベント。古いイベントは存在し続けるだけでは繰り返しトリガーされない。通常の行動、通常の戦闘、軽微な状態や数値の変化は更新をトリガーしない。
3. 単回のトリガーで各分類は最大1件更新する。今回の事実に直接関連する同名の噂の更新を優先する；そうでなければ1件追加し、プログラムが自動で最も古い項目をスクロール淘汰する。トリガーがない時は三分類の噂をすべてそのまま保ち、変化のない更新を提出しない。
4. 噂と伝播はソフトメンテナンスに属する。個々の噂/伝播の断片が形式エラー、または今回のメンテナンスが未完了の場合は、その断片を破棄し、他の検収済み結果を保持する；噂/伝播のためだけにターン全体の世界進行を再呼び出ししてはならない。
5. 情報取引 の購入、支払い、消費的な削除は引き続き MVU/変数AIが処理する；世界エンジンはその世界側の情報源のみを維持する。`;
    const RUMOR_WORLD_SOURCE_RULES=`【情報の伝播・世界側の事実】
1. 噂と伝播は世界で流通している情報を記述する；本文は事実と時間の確認にのみ用い、直接の伝播源ではない。本文中の個人の行動、戦闘の細部、私的な会話、能力や利益を直接噂に書き換えることは禁止する。
2. 直接の取材は「传闻维护.世界侧可传播事实」、既存の伝播チェーン、既存の公開噂に限る。私的な事実は、目撃、公開された帰結、調査の発見、公告、自発的な漏洩などの現実の経路が形成されて初めて伝播できる。
3. 公開内容は出所と受け手が当時知り得た範囲を超えてはならない；バックステージの真相は公開内容に入らない。伝播には時間と空間の経路がなければならず、理由なく瞬間的に全世界へ拡散してはならない。
4. 公開噂は既定で不変；空の分類、伝播チェーンの再確認、または新たな世界側の公開事実が現れた時のみ必要に応じて更新し、各トリガーにつき分類ごと最大1件。
5. 通常の行動、通常の戦闘、軽微な状態や数値の変化そのものは噂をトリガーしない；その公開された帰結がすでに世界側の事実プールへ入っている場合にのみ伝播できる。
6. 噂/伝播はソフトメンテナンスに属し、個々の断片の失敗でターン全体の世界進行を再実行させてはならない。情報取引の購入、支払い、消費的な削除はMVUが本文の結果に従って処理する；世界エンジンは世界側の情報源のみを維持する。`;
    const RUMOR_PRESET_STEP_OLD="Step 6 · 伝播の更新：今回実際に変化した伝播・通貨・暦だけを管理してください。終了・期限切れの伝播を復活させないでください。";
    const RUMOR_PRESET_STEP_NEW="Step 6 · 情報伝播：噂は常時活動する層です。公開の噂 3 分類に空欄があれば 2 件補い、地区・売り手・発信勢力・情勢に応じて入れ替えます。新たに伝播可能な事実は伝播経路を作成・進行させ、関連事件の変化、情報の陳腐化、期限到来時に再確認してください。";
    const RUMOR_THROTTLE_PRESET_STEP="Step 6 · 情報伝播：公開噂は既定で不変；空の分類、伝播チェーンの再確認、または新たに公開可能な事実が現れた時のみ必要に応じて更新し、各トリガーにつき分類ごと最大1件。噂/伝播はソフトメンテナンスに属し、失敗してもターン全体を再実行しない。";
    const RUMOR_PUBLIC_CATEGORIES=["街頭の噂","情報取引","布告と檄文"];
    const RUMOR_VISIBLE_LIMIT=3;
    const RUMOR_STALE_HOURS=72;
    class WorldRumorService {
        constructor(engine){this.engine=engine;}
        upgradePreset(value){
            let source=String(value||'');
            if(source.includes(RUMOR_PRESET_STEP_OLD))source=source.replace(RUMOR_PRESET_STEP_OLD,RUMOR_PRESET_STEP_NEW);
            if(!source.includes(RUMOR_THROTTLE_PRESET_STEP)&&source.includes(RUMOR_PRESET_STEP_NEW))source=source.replace(RUMOR_PRESET_STEP_NEW,RUMOR_THROTTLE_PRESET_STEP);
            return source;
        }
        requirements(stat=this.engine?.snapshot().stat||{}){
            const required=this.baseRequirements(stat),facts=this.publicFacts(stat),fresh=facts.filter(item=>item.新近).slice(-6);
            // Preserve the old throttle candidate window as well as the final world-side facts view.
            required.可传播候选事件=required.可传播候选事件.filter(item=>String(item.更新时间||'').trim()===required.世界时间.trim()).slice(-2);
            const empty=RUMOR_PUBLIC_CATEGORIES.filter(category=>Number(required.公开传闻[category].当前数量)===0),review=required.本轮必须复核的传播链,reasons=[];
            if(empty.length)reasons.push("空の分類："+empty.join('、'));
            if(review.length)reasons.push("伝播再確認："+review.map(item=>item.名称).join('、'));
            if(fresh.length)reasons.push("新たな世界側公開事実："+fresh.map(item=>item.名称).join('、'));
            required.世界侧可传播事实=facts;
            required.本轮新公开事实=fresh;
            required.刷新原因=reasons;
            required.本轮公开传闻动作=reasons.length?"必要に応じて更新；各トリガーにつき分類ごと最大1件":"変更なし";
            delete required.当前地点;
            return required;
        }
        classifyFailures(rejected){
            const hard=[],soft=[];
            for(const item of rejected||[])(/^(?:(?:传闻|噂)\/|(?:传播|伝播)\/)/.test(String(item?.片段||''))?soft:hard).push(item);
            return soft.length?{rejected:hard,softRejected:soft}:{rejected:hard};
        }
        validatePublicState(stat){
            // Capacity is a rolling window. Validate the same visible tail as the former shadow-state wrapper.
            const items=Object.values(stat?.噂?.街頭の噂||{}).slice(-RUMOR_VISIBLE_LIMIT);
            if(items.some(item=>!["酔い話","疑わしい","おそらく信頼できる"].includes(item.信頼度)))throw new Error("噂の可信度が無効です");
        }
        finishPatches(stat,patches){
            this.refreshTouchedOrder(stat,patches);
            this.trimCapacity(stat);
            return stat;
        }
        trimCapacity(stat) {
            const removed=[];
            for(const category of RUMOR_PUBLIC_CATEGORIES){
                const bucket=stat?.噂?.[category];
                if(!plain(bucket))continue;
                const overflow=Math.max(0,Object.keys(bucket).length-RUMOR_VISIBLE_LIMIT);
                for(const name of Object.keys(bucket).slice(0,overflow)){
                    delete bucket[name];
                    removed.push(category+'/'+name);
                }
            }
            return removed;
        }
        refreshTouchedOrder(stat,patches=[]) {
            for(const patch of patches||[]){
                if(!plain(patch)||patch.op==='remove')continue;
                const parts=tokens(patch.path);
                if(parts.length!==3||parts[0]!=="噂"||!RUMOR_PUBLIC_CATEGORIES.includes(parts[1]))continue;
                const bucket=stat?.噂?.[parts[1]];
                if(!plain(bucket))continue;
                const name=stableNameIn(bucket,parts[2])||parts[2];
                if(!Object.hasOwn(bucket,name))continue;
                const value=bucket[name];
                delete bucket[name];
                bucket[name]=value;
            }
        }
        eventTouchedKey(event) {
            return worldDateKey(event?.更新时间||event?.预计结束||event?.开始时间||event?.時間);
        }
        baseRequirements(stat) {
            const backend=stat?.世界?.[PATH]||{},rumors=stat?.噂||{},events=backend.事件||{},propagation=backend.传播||{};
            const worldTime=String(stat?.世界?.時間||''),now=worldDateKey(worldTime);
            const publicState={};
            for(const category of RUMOR_PUBLIC_CATEGORIES){
                const bucket=plain(rumors?.[category])?rumors[category]:{};
                const count=Object.keys(bucket).length;
                publicState[category]={当前数量:count,为空补足:count===0?1:0};
            }
            const review=[];
            for(const [名称,record] of Object.entries(propagation)){
                if(!plain(record)||!/^(?:传播中|伝播中)$/.test(String(record.状態||'').trim()))continue;
                const reasons=[],updatedText=String(record.更新时间||'').trim(),touched=worldDateKey(updatedText||record.時間),expiry=worldDateKey(record.到期时间);
                let semantic=false;
                if(!updatedText)reasons.push("更新時間がありません");
                if(expiry!==null&&now!==null&&expiry<=now){reasons.push("期限切れ");semantic=true;}
                if(touched!==null&&now!==null&&now-touched>=RUMOR_STALE_HOURS){reasons.push("72時間以上未確認");semantic=true;}
                const changedEvents=[];
                for(const eventName of Array.isArray(record.关联事件)?record.关联事件:[]){
                    const event=events[eventName];if(!plain(event))continue;
                    const eventTouched=this.eventTouchedKey(event);
                    if((eventTouched!==null&&(touched===null||eventTouched>touched))||["完了","取消済み"].includes(event.状態))changedEvents.push(eventName);
                }
                if(changedEvents.length){reasons.push("関連イベントに新しい進展："+changedEvents.join('、'));semantic=true;}
                if(!reasons.length)continue;
                review.push({
                    名称,原因:reasons,需语义变化:semantic,
                    現在:{出典:String(record.出典||''),范围:String(record.范围||''),時間:String(record.時間||''),更新时间:updatedText,到期时间:String(record.到期时间||''),内容:String(record.内容||''),状態:String(record.状態||''),受众:copy(record.受众||[]),引发行动:copy(record.引发行动||[]),关联事件:copy(record.关联事件||[])}
                });
            }
            const linked=new Set(Object.values(propagation).flatMap(record=>Array.isArray(record?.关联事件)?record.关联事件:[]));
            const candidates=Object.entries(events).filter(([name,event])=>{
                if(!plain(event)||!["進行中","完了"].includes(event.状態)||linked.has(name))return false;
                const visible=String(event.公开征兆||'').trim()||(Array.isArray(event.可见影响)&&event.可见影响.length);
                return !!visible;
            }).slice(-6).map(([名称,event])=>({名称,状態:event.状態,地点:String(event.地点||''),公开征兆:String(event.公开征兆||''),更新时间:String(event.更新时间||event.時間||'')}));
            return {
                世界:String(stat?.世界?.名称||''),世界时间:worldTime,当前地点:String(stat?.世界?.地点||''),
                话题:copy(RUMOR_LIVELINESS_TOPICS),公开传闻:publicState,
                本轮必须复核的传播链:review,可传播候选事件:candidates
            };
        }
        maintenanceNeeded(stat) {
            const required=this.requirements(stat);
            return Object.values(required.公开传闻).some(item=>item.当前数量===0)||required.本轮必须复核的传播链.length>0;
        }
        sameTime(value,current){
            const a=String(value||'').trim(),b=String(current||'').trim();
            return !!a&&!!b&&(typeof sameWorldTimeAnchor==='function'?sameWorldTimeAnchor(a,b):a===b);
        }
        publicFacts(stat=this.engine?.snapshot().stat||{}){
            const backend=stat?.世界?.[PATH]||{},now=String(stat?.世界?.時間||'').trim(),facts=[];
            const add=item=>{if(plain(item)&&String(item.公开内容||'').trim())facts.push(item);};
            for(const [名称,event] of Object.entries(backend.事件||{})){
                if(!plain(event)||!["進行中","完了"].includes(String(event.状態||'')))continue;
                const visible=[String(event.公开征兆||'').trim(),...(Array.isArray(event.可见影响)?event.可见影响.map(x=>String(x?.影响||'').trim()):[])].filter(Boolean);
                if(!visible.length)continue;
                const time=String(event.更新时间||event.時間||'').trim();
                add({タイプ:"公開事件",名称,地点:String(event.地点||''),時間:time,公开内容:visible.join('；'),关联事件:[名称],新近:this.sameTime(time,now)});
            }
            for(const [名称,person] of Object.entries(backend.人物||{})){
                const text=String(person?.公开动态||'').trim();if(!text)continue;
                const time=String(person?.更新时间||'').trim();
                add({タイプ:"人物の公開動向",名称,時間:time,公开内容:text,关联事件:copy(Array.isArray(person?.关联事件)?person.关联事件:[]),新近:this.sameTime(time,now)});
            }
            for(const [名称,area] of Object.entries(backend.势力地区||{})){
                const text=String(area?.公开动态||'').trim();if(!text)continue;
                const time=String(area?.更新时间||'').trim();
                add({タイプ:"地区の公開動向",名称,時間:time,公开内容:text,新近:this.sameTime(time,now)});
            }
            for(const [名称,faction] of Object.entries(stat?.世界?.勢力||{})){
                const text=[faction?.領地,faction?.説明].map(x=>String(x||'').trim()).filter(Boolean).join('；');
                add({タイプ:"勢力の公開背景",名称,公开内容:text,新近:false});
            }
            for(const [名称,place] of Object.entries(stat?.世界?.探索||{}))add({タイプ:"探索の公開背景",名称,リスク:String(place?.リスク||''),公开内容:String(place?.説明||''),新近:false});
            const economy=String(stat?.世界?.通貨?.経済変動||'').trim();
            if(economy)add({タイプ:"経済の公開背景",名称:"経済変動",公开内容:economy,新近:false});
            return facts.slice(-24);
        }

        maintenanceIssues(next,required) {
            const result={公开传闻:[],传播链:[]};
            if(!plain(required)||String(next?.世界?.名称||'')!==String(required.世界||'')||String(next?.世界?.時間||'')!==String(required.世界时间||''))return result;
            for(const category of RUMOR_PUBLIC_CATEGORIES){
                const count=Object.keys(plain(next?.噂?.[category])?next.噂[category]:{}).length;
                const initial=Number(required?.公开传闻?.[category]?.当前数量)||0;
                if(initial===0&&count===0)result.公开传闻.push(category);
            }
            for(const item of required.本轮必须复核的传播链||[]){
                const record=next?.世界?.[PATH]?.传播?.[item.名称];
                if(!record||propagationEnded(record,worldDateKey(required.世界时间)))continue;
                const updated=String(record.更新时间||'').trim()===String(required.世界时间||'').trim();
                const before=item.現在||{};
                const semantic=['范围','内容','受众','引发行动',"状態",'到期时间'].some(key=>!same(record?.[key],before?.[key]));
                if(!updated||(item.需语义变化&&!semantic))result.传播链.push(item.名称);
            }
            return result;
        }

    }
    const DEFAULT_WORLD_RUMOR_SERVICE=new WorldRumorService();
    if(plain(BUILTIN_DEFAULT_PROMPT_DOCUMENT?.settings))BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.preset=DEFAULT_WORLD_RUMOR_SERVICE.upgradePreset(BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.preset);
    // Compatibility entry points are stateless; production code uses the container-owned service.
    function rumorMaintenanceRequirements(stat){return DEFAULT_WORLD_RUMOR_SERVICE.requirements(stat);}
    function rumorMaintenanceNeeded(stat){return DEFAULT_WORLD_RUMOR_SERVICE.maintenanceNeeded(stat);}
    function worldPublicRumorFacts(stat){return DEFAULT_WORLD_RUMOR_SERVICE.publicFacts(stat);}
    function rumorWorldSameTime(value,current){return DEFAULT_WORLD_RUMOR_SERVICE.sameTime(value,current);}
    function trimRumorCapacity(stat){return DEFAULT_WORLD_RUMOR_SERVICE.trimCapacity(stat);}
    function refreshTouchedRumorOrder(stat,patches){return DEFAULT_WORLD_RUMOR_SERVICE.refreshTouchedOrder(stat,patches);}
    function softRumorMaintenanceIssues(next,required){return DEFAULT_WORLD_RUMOR_SERVICE.maintenanceIssues(next,required);}
    function ensureRumorLiveliness(next,required){return DEFAULT_WORLD_RUMOR_SERVICE.maintenanceIssues(next,required);}
    class WorldStateIntegrityPolicy {
        constructor(patchPolicy,timePolicy,rumor){
            this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;
            this.timePolicy=timePolicy||DEFAULT_WORLD_TIME_POLICY;
            this.rumor=rumor||DEFAULT_WORLD_RUMOR_SERVICE;
        }

        validate(stat) {
            const state=stat.世界[PATH];
            for(const [category,template] of Object.entries(RECORDS)){
                if(!plain(state[category])||Object.keys(state[category]).length>300)throw new Error(category+"記録が多すぎるか構造が不正です");
                for(const [name,value] of Object.entries(state[category])){
                    if(forbidden.has(name))throw new Error("不正な記録名");
                    this.patchPolicy.checkRecord(value,template,DETAILS[category]);
                    this.patchPolicy.checkDetails(value,DETAILS[category]);
                }
            }
            for(const [name,event] of Object.entries(state.事件)){
                if(!["発生待ち","進行中","完了","取消済み"].includes(event.状態))throw new Error("不正なイベント状態："+name+' = '+String(event.状態||'空')+"；許可する値：発生待ち/進行中/完了/取消済み");
                if(!EVENT_CATEGORIES.has(event.分类))throw new Error("不正なイベント分類："+name+' = '+String(event.分类||'空'));
                const parents=Array.isArray(event?.前因)?event.前因.filter(Boolean):[];
                if(parents.includes(name))throw new Error("事件の前因が自身を参照しています："+name+"；前因はイベント自身を参照できません。明確な前因がない場合は []を使用してください");
                const missing=parents.filter(id=>!Object.hasOwn(state.事件,id));
                if(missing.length)throw new Error("事件の前因が存在しません："+name+' <- '+missing.join('、')+"；前因は既に存在するイベント名、または今回同時に提出して構築に成功したイベント名のみ参照できます；現在の段階/自然言語の理由は前因として扱えません。明確な前因がない場合は []を使用してください");
            }
            const calendar=plain(stat.世界?.暦法)?stat.世界.暦法:{};
            const monthDays=Array.isArray(calendar.月日数)?calendar.月日数:[];
            if(monthDays.length>24||monthDays.some(n=>!Number.isInteger(Number(n))||Number(n)<1||Number(n)>99))throw new Error("世界暦の月日数が無効です");
            const hasMonthDay=value=>/\d{1,2}\s*月\s*-?\s*\d{1,2}\s*日/.test(String(value||''));
            if(monthDays.length&&hasMonthDay(stat.世界.時間)&&!this.timePolicy.calendarDate(stat.世界.時間,calendar))throw new Error("世界時間が暦の月長に違反しています："+stat.世界.時間);
            if(monthDays.length){
                for(const [name,event] of Object.entries(state.事件)){
                    for(const value of [event.時間,event.开始时间,event.结束时间]){
                        if(hasMonthDay(value)&&!this.timePolicy.calendarDate(value,calendar))throw new Error("イベント日付が世界暦に違反しています："+name+' = '+value);
                    }
                }
            }
            const range=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
            for(const [name,item] of Object.entries(stat.世界.勢力||{}))if(!QUALITY_RANKS.includes(item.実力)||!range(item.声望,-5000,10000))throw new Error("勢力の品質または声望が範囲外です："+name+"、实力="+String(item.実力)+"、声望="+String(item.声望)+"；实力に使用できるのは "+QUALITY_RANKS.join('/')+"、声望の範囲は -5000~10000");
            for(const [name,item] of Object.entries(stat.世界.探索||{}))if(!QUALITY_RANKS.includes(item.リスク)||!range(item.探索度,0,100))throw new Error("探索の品質または進度が範囲外："+name+"、リスク="+String(item.リスク)+"、探索度="+String(item.探索度)+"；风险に使用できるのは "+QUALITY_RANKS.join('/')+"、探索度の範囲は 0~100");
            for(const item of Object.values((stat.世界.因果軌道||{}).偏移記録||{}))if(!range(item.影響度,-100,120))throw new Error("因果偏移が範囲外です");
            for(const item of Object.values(stat.関係リスト||{}))if(!range(item.好感度,-100,100))throw new Error("人物の好感度が範囲外です");
            for(const item of Object.values((stat.任務||{}).リスト||{}))if(!["進行中","提出可能","決算可能","失敗"].includes(item.状態))throw new Error("任務状態が無効です");
            for(const item of Object.values((stat.任務||{}).インスタンス実績||{}))if(!["未達成","達成済み"].includes(item.状態))throw new Error("実績状態が無効です");
            this.rumor.validatePublicState(stat);

            const visiting=new Set(),visited=new Set();
            const visit=name=>{
                if(visiting.has(name))throw new Error("イベントの前因が循環しています");
                if(visited.has(name))return;
                visiting.add(name);
                state.事件[name].前因.forEach(visit);
                visiting.delete(name);
                visited.add(name);
            };
            Object.keys(state.事件).forEach(visit);
            for(const category of ['人物','势力地区','传播']){
                for(const record of Object.values(state[category]))if(record.关联事件.some(id=>!Object.hasOwn(state.事件,id)))throw new Error("関連イベントが存在しません");
            }
        }
    }

    const DEFAULT_WORLD_STATE_INTEGRITY_POLICY=new WorldStateIntegrityPolicy(DEFAULT_WORLD_PATCH_POLICY,DEFAULT_WORLD_TIME_POLICY,DEFAULT_WORLD_RUMOR_SERVICE);
    class WorldPatchApplicationService {
        constructor(patchPolicy,stateNormalizer,timeline,stateIntegrity,relationSync,rumor){
            this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;
            this.stateNormalizer=stateNormalizer||DEFAULT_WORLD_STATE_NORMALIZER;
            this.timeline=timeline||DEFAULT_WORLD_TIMELINE_POLICY;
            this.stateIntegrity=stateIntegrity||DEFAULT_WORLD_STATE_INTEGRITY_POLICY;
            this.relationSync=relationSync||DEFAULT_WORLD_RELATION_SYNC_POLICY;
            this.rumor=rumor||DEFAULT_WORLD_RUMOR_SERVICE;
        }

        apply(stat,patches) {
            if(!Array.isArray(patches)||patches.length>100)throw new Error("各ラウンドにつき最大 100 件のパッチ");
            const next=copy(stat);
            next.世界[PATH]=Object.assign(emptyState(),next.世界[PATH]||{});
            this.stateNormalizer.normalizeBackendState(next);

            for(const patch of patches){
                if(!plain(patch)||!['add','replace','remove'].includes(patch.op))throw new Error("未対応のパッチ操作です");
                const parts=this.patchPolicy.canonicalizeParts(this.patchPolicy.tokens(patch.path),next);
                patch.path=this.patchPolicy.pointer(parts);
                if(!this.patchPolicy.allowed(parts,next,patch.op))throw new Error("書き込み禁止："+patch.path);
                this.patchPolicy.bootstrapBackendParent(next,parts);
                const old=this.patchPolicy.get(next,parts);

                if(parts[1]===PATH&&parts[2]==='历史'&&(patch.op!=='add'||old!==undefined))throw new Error("履歴は追加のみ許可されています");
                if(patch.op!=='add'&&old===undefined&&!this.patchPolicy.canUpsertMissing(parts,next))throw new Error("対象が存在しません："+patch.path);
                if(patch.op==='remove'&&!this.patchPolicy.removable(parts))throw new Error("削除できるのは期限切れの伝播・噂、完全に消滅した資産、プログラムが無効と確認した因果記録だけです。他の記録は状態を終了にしてください");

                let value=patch.value;
                if(patch.op!=='remove'){
                    if(value===undefined)throw new Error("パッチ値がありません");
                    const category=parts.length===3?parts[1]:parts.length===4?parts[2]:'';
                    if(parts[0]==='世界'&&parts[1]===PATH&&parts.length===4&&Object.hasOwn(RECORDS,category)){
                        value=this.patchPolicy.normalizeBackendRecord(category,value,old);
                        this.patchPolicy.checkRecord(value,RECORDS[category],DETAILS[category]);
                        this.patchPolicy.checkDetails(value,DETAILS[category]);
                    }else if(EXISTING[category]){
                        const schema=EXISTING[category];
                        if(plain(value)){
                            const merged=Object.assign(copy(schema),plain(old)?copy(old):{});
                            for(const key of Object.keys(schema))if(Object.hasOwn(value,key))merged[key]=copy(value[key]);
                            value=merged;
                        }
                        this.patchPolicy.checkRecord(value,schema);
                        if(parts[0]==="噂"&&parts[1]==="情報取引"&&!(next.システム状態||{}).主神空間滞在中&&next.世界?.名称!=="主神空間"&&/(?:空间币|スペースコイン)/.test(String(value.要求価格||'')))throw new Error("任務世界の情報取引ではローカル通貨を使用してください。スペースコインは使用できません");
                    }else if(old!==undefined&&(typeof old!==typeof value||Array.isArray(old)!==Array.isArray(value))){
                        throw new Error("フィールドの型が変更されました");
                    }

                    if(typeof value==='number'&&!Number.isFinite(value))throw new Error("数値が無効です");
                    if(parts[0]==='世界'&&parts[1]==="因果軌道"&&parts.length===3&&typeof value!=='string')throw new Error("因果摘要はテキストでなければなりません");
                    if(parts[0]==="任務"&&parts[1]==="インスタンス実績"&&old==="達成済み"&&value!==old)throw new Error("達成済みの実績は後退できません");
                    if(parts[0]==="関係リスト"&&parts.length===3)this.relationSync.validateRelationSyncValue(parts[2],value,next.関係リスト?.[parts[1]],parts[1]);
                    if(parts[parts.length-1]==='好感度'&&Math.abs(value-old)>20)throw new Error("ラウンドあたりの好感度変動が20を超えています");
                }

                let parent=next;
                for(const key of parts.slice(0,-1)){
                    if(parent[key]===undefined)parent[key]={};
                    if(!plain(parent[key]))throw new Error("親パスがオブジェクトではありません");
                    parent=parent[key];
                }
                if(patch.op==='remove')delete parent[parts.at(-1)];
                else parent[parts.at(-1)]=copy(value);
            }

            this.stateNormalizer.normalizeBackendState(next);
            this.stateNormalizer.normalizeEventLayers(next);
            this.timeline.validateTemporalWrites(stat,next,patches);
            this.stateIntegrity.validate(next);
            for(const [name,item] of Object.entries(next.世界.勢力||{})){
                const old=(stat.世界.勢力||{})[name];
                if(Math.abs(item.声望-(old?old.声望:0))>1000)throw new Error("ラウンドあたりの声望変動が1000を超えています");
            }
            return this.rumor.finishPatches(next,patches);
        }
    }

    const DEFAULT_WORLD_PATCH_APPLICATION_SERVICE=new WorldPatchApplicationService(
        DEFAULT_WORLD_PATCH_POLICY,
        DEFAULT_WORLD_STATE_NORMALIZER,
        DEFAULT_WORLD_TIMELINE_POLICY,
        DEFAULT_WORLD_STATE_INTEGRITY_POLICY,
        DEFAULT_WORLD_RELATION_SYNC_POLICY,
        DEFAULT_WORLD_RUMOR_SERVICE
    );
    class WorldStateMaterializationService {
        constructor(stateFactory,stateNormalizer,lifecycle,patchPolicy,patchApplication,exploration,causal,stateIntegrity){
            this.stateFactory=stateFactory||DEFAULT_WORLD_STATE_FACTORY;
            this.stateNormalizer=stateNormalizer||DEFAULT_WORLD_STATE_NORMALIZER;
            this.lifecycle=lifecycle||DEFAULT_WORLD_LIFECYCLE_SERVICE;
            this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;
            this.patchApplication=patchApplication||DEFAULT_WORLD_PATCH_APPLICATION_SERVICE;
            this.exploration=exploration||DEFAULT_WORLD_EXPLORATION_SERVICE;
            this.causal=causal||DEFAULT_WORLD_CAUSAL_SERVICE;
            this.stateIntegrity=stateIntegrity||DEFAULT_WORLD_STATE_INTEGRITY_POLICY;
        }
        validate(stat){return this.stateIntegrity.validate(stat);}
        apply(stat,patches){return this.patchApplication.apply(stat,patches);}
        materialize(stat,seedPatches,modelPatches) {
            const work=copy(stat);
            work.世界[PATH]=Object.assign(this.stateFactory.emptyBackend(),work.世界[PATH]||{});
            this.stateNormalizer.normalizeBackendState(work);
            this.lifecycle.compact(work);
            const appliedSeeds=(seedPatches||[]).filter(p=>this.patchPolicy.get(work,this.patchPolicy.canonicalizeParts(this.patchPolicy.tokens(p.path),work))===undefined);
            let next=this.apply(work,appliedSeeds);
            next=this.apply(next,modelPatches||[]);
            const explorationPatches=this.exploration.repairGranularity(next);
            const layerPatches=this.stateNormalizer.normalizeEventLayers(next);
            const causalPatches=this.causal.repairProjection(next);
            const predecessorPatches=this.stateNormalizer.repairMacroPredecessors(next);
            const linkPatches=this.stateNormalizer.repairExplicitEventLinks(next);
            this.lifecycle.compact(next);
            this.validate(next);
            const repairPatches=[...explorationPatches,...layerPatches,...causalPatches,...predecessorPatches,...linkPatches];
            return {next,appliedSeeds,repairPatches};
        }
    }
    const DEFAULT_WORLD_STATE_MATERIALIZATION_SERVICE=new WorldStateMaterializationService(
        DEFAULT_WORLD_STATE_FACTORY,
        DEFAULT_WORLD_STATE_NORMALIZER,
        DEFAULT_WORLD_LIFECYCLE_SERVICE,
        DEFAULT_WORLD_PATCH_POLICY,
        DEFAULT_WORLD_PATCH_APPLICATION_SERVICE,
        DEFAULT_WORLD_EXPLORATION_SERVICE,
        DEFAULT_WORLD_CAUSAL_SERVICE,
        DEFAULT_WORLD_STATE_INTEGRITY_POLICY
    );
    class WorldResultMaterializer {
        constructor(patchCompilation,stateMaterialization){this.patchCompilation=patchCompilation||DEFAULT_WORLD_RESULT_PATCH_COMPILATION_SERVICE;this.stateMaterialization=stateMaterialization||DEFAULT_WORLD_STATE_MATERIALIZATION_SERVICE;}
        compileWorldResult(stat,value) { return this.patchCompilation.compile(stat,value); }

        validateBaseState(stat) { return this.stateMaterialization.validate(stat); }
        applyPatches(stat,patches) { return this.stateMaterialization.apply(stat,patches); }
        materializeWorldUpdate(stat,seedPatches,modelPatches) { return this.stateMaterialization.materialize(stat,seedPatches,modelPatches); }
    }
    const DEFAULT_WORLD_RESULT_MATERIALIZER=new WorldResultMaterializer(DEFAULT_WORLD_RESULT_PATCH_COMPILATION_SERVICE,DEFAULT_WORLD_STATE_MATERIALIZATION_SERVICE);
    let ACTIVE_WORLD_RESULT_MATERIALIZER=DEFAULT_WORLD_RESULT_MATERIALIZER;
    function compileWorldResult(stat,value){return ACTIVE_WORLD_RESULT_MATERIALIZER.compileWorldResult(stat,value);}
    function validateState(stat){return ACTIVE_WORLD_RESULT_MATERIALIZER.validateBaseState(stat);}
    function applyPatches(stat,patches){return ACTIVE_WORLD_RESULT_MATERIALIZER.applyPatches(stat,patches);}
    function materializeWorldUpdate(stat,seedPatches,modelPatches){return ACTIVE_WORLD_RESULT_MATERIALIZER.materializeWorldUpdate(stat,seedPatches,modelPatches);}
    const WORLD_RETRY_GUIDANCE_DEFAULTS=Object.freeze({
        retryGuideMacroBackbone:"大局構成：現在進行可能な大局的な節目は {current} 件（進行中 {active}、発生待ち {future}）。真に大局的な節目を最低 {missing} 件追加してください。すでに発生中と確認した段階転換は進行中、他の新規節目は発生待ちにします。合流・撤退・移動・局地争奪・突破などの直近の節目は大局構成に数えず、大局的な節目へ繰り返し改分類しないでください。",
        retryGuideEventDelivery:"事件の提出：WorldResult.事件 に実際の節目を作成し、分類を大局的な節目にします。説明には章、地区全体の情勢、戦争、勢力構図、重要人物の運命のいずれかの段階転換を記載してください。概要や因果軌道に名前を並べるだけでは不十分です。既存の適格な節目は元の名前を使い、不足・変更したフィールドだけを提出してください。",
        retryGuideMacroSchedule:"大局の日程：新しい節目ごとに明確な時刻基準が必要です。資料の日付・時間精度を維持し、正確な日付が不明なら理解可能な相対時刻・因果時刻を使います。近日・後ほど・未来・未定・不明は不可です。条件は必要に応じて記入します。前因は既存事件、または同じ回に提出して作成に成功した事件名だけを参照できます。明確な前因がなければ [] とし、現在の段階や自然文の理由を事件名の代わりにしないでください。",
        retryGuideCausalProjection:"因果軌道：承認済みの大局的な節目を保持し、因果.大局順序を補記してください。最終的に進行可能で分類が大局的な節目である、異なる 3～5 件の事件名だけを使います。現在の段階・現在事件・直近の節目は含めないでください。",
        retryGuideCausalProjectionRepair:"因果軌道：承認済み事件は書き直さず、因果.大局順序だけを補記してください。長さは 3～5 件で、すべて作成済みかつ未取消の大局的な節目に対応させます。現在の段階・現在事件・直近の節目は含めないでください。",
        retryGuideDueEvent:"期限到来事件/{name}：今回明示的に事件を開始するか、今回の再確認日・阻害条件・次回確認を更新してください。",
        retryGuideEventTime:"事件/{name}：明確な時刻基準を補記してください。具体的な世界日付・時間帯を優先し、不明な場合は相対時刻・因果時刻を使います。空値および「近日・後ほど・未来・未定・不明」は不可です。",
        retryGuideStaleEvent:"事件/{name}：この局地活動は通常の継続期間を大幅に超えています。すでに終了していれば完了にして結果を補記し、失効していれば取消済みにします。実際に継続中の場合だけ進行中を維持し、更新時刻を現在の世界時刻にして、現状の説明と次回確認を更新してください。",
        retryGuideTemporalRepair:"時間整合性：発生済みの次の記録を修正してください。完了・進行中の事件、人物更新時刻、地区の発生済み変化、履歴、伝播は現在の世界時刻を超えてはいけません：{details}",
        retryGuideAlienActivity:"異端の活動/{name}：今回再確認の条件を満たしたこの異端だけ、地点・目標・行動を補記してください。人物更新時刻はプログラムが世界時刻から記録します。今回死亡が確定した場合は異端の状態を死亡にするだけとし、人物活動を提出しないでください。",
        retryGuideNpcAudit:"NPC 構成監査/{name}：WorldResult.関係 だけで、この既存 NPC の列挙された不足項目を最低 1 件補ってください。職業・血統・装備・技能・状態・形態・不足する記録フィールドを優先します。NPC の新規作成、HP_MAX・EP_MAX の変更、真属性・最終属性の出力は禁止です。",
        retryGuideChronology:"大局時間軸：原作・データベースの日単位で明確な日付の矛盾だけを処理します。節目が成立するなら明確な日付を維持します。確認済みの因果変動が日付・成立条件・発生の有無を変えた場合は、その節目に明示的に関連する変動記録を補い、影響を受けた節目だけを再構成してください。月・時間帯・順序・条件・傾向は柔軟な制約として慎重に未確定部分を残し、原作に戻すために物語を強制修正しないでください。",
        retryGuidePredecessor:"事件前因：まずチェーンの先頭にある欠落または自己参照を修正し、その後で影響を受ける後続ノードを再提出してください。前因配列にはイベント名のみを入れ、既存または同輪で構築に成功したものに限ります；現在の段階/自然言語の理由はイベントとして扱いません。明確な前因がない場合は []と書いてください。エラーを消すためにイベントを捏造してはなりません。",
        retryGuideSchemaMismatch:"Schema修正：エラー箇所の業務フィールドのみを修正してください；真属性/最终属性/强化はバックステージの派生キャッシュであり、モデルは補写できません。この種の派生差分はプログラムが吸収します。",
        retryGuideRumorEmpty:"噂の管理：{details}。空の分類には今回、実際の世界情報を 2 件補います。3 分類それぞれ最新 3 件、1 件約 60 字を表示し、根拠なく <user> 中心にしないでください。",
        retryGuidePropagationReview:"伝播の管理：{details}。各項目を現在の世界時刻に更新し、範囲・受け手・内容・誘発する行動を進めます。終了した伝播は終了・削除し、そのまま再提出しないでください。",
        retryGuideTemporalIntegrity:"時間整合性：事件/地区/歴史/伝播は「未来の自然日へまたぐ」ことだけをハード越界と見なし、同日の午前/午後/HH:mm の違いは書き戻し不要；人物は双方が HH:mm を明示した場合にのみ分単位の検証を行う。未来の計画は 预计结束、下次检查、または 待发生事件 に置く。",
        retryGuideWorldActivity:"世界活動：異端以外の世界を先に進め、その後に異端を再確認します。進行中の事件、勢力・地区、通常人物のうち最低 1 件に実質的な変化を提出してください。更新時刻だけの変更、元の値の反復、未来の大局的な節目の追加だけでは不十分です。",
        retryGuideWorldScene:"世界の現場：地区が空なら現在地・段階に直接関係する地区を作成します。勢力が空なら情勢に実際に関与する実在の勢力・組織を優先して 1 件補い、WorldResult.勢力 と WorldResult.勢力地区（種別=勢力）を同名で提出できます。勢力は必須ではありません。資料不足や名声・Schema などの規則で拒否された場合、記録を埋めるための反復提出や組織の創作はしないでください。",
        retryGuideCurrentReality:"現在の現実：進行中の現在事件・直近の節目がなければ、現在の段階と最新本文から「すでに発生中」の現実の情勢を 1 件抽出します。未来の大局的な節目を先に精算しないでください。"
    });

    class WorldRetryGuidanceService {
        constructor(engine=null){this.engine=engine;}

        template(key) {
            const configured=this.engine?.services?.prompts?.value?.(key);
            if(typeof configured==='string')return configured;
            return String(WORLD_RETRY_GUIDANCE_DEFAULTS[key]??'');
        }

        format(key,vars={}) {
            let text=this.template(key);
            for(const [name,value] of Object.entries(vars||{}))text=text.split('{'+name+'}').join(String(value??''));
            return text;
        }

        macroBackbonePlan(current,active,future) {
            const missing=Math.max(0,3-current);
            return [
                this.format('retryGuideMacroBackbone',{current,active,future,missing}),
                this.format('retryGuideEventDelivery'),
                this.format('retryGuideMacroSchedule'),
                this.format('retryGuideCausalProjection')
            ].filter(Boolean);
        }

        plan(error,rejected=[]) {
            const plan=[];
            for(const item of rejected||[])plan.push(String(item?.片段||'')+'：'+String(item?.原因||''));
            const primary=String(error?.message||error||'');
            const combined=[primary,...(rejected||[]).map(item=>String(item?.原因||''))].join('\n');
            let match=primary.match(/(?:宏观事件不足：需要至少3个可推进宏观节点（进行中\+待发生），当前仅|大局事件が不足：進行可能な大局的な節目は最低 3 件必要です（進行中 \+ 発生待ち）。現在は )(\d+)(?:个（进行中| 件（進行中 )(\d+)(?:个，待发生| 件、発生待ち )(\d+)(?:个）| 件）)/);
            if(match){
                const current=Math.max(0,Number(match[1])||0),active=Math.max(0,Number(match[2])||0),future=Math.max(0,Number(match[3])||0);
                plan.push(...this.macroBackbonePlan(current,active,future));
            }else if(/(?:因果轨道未形成有效宏观投影|因果軌道.*(?:有効|マクロ|大局).*(?:形成|無効))/.test(primary)){
                plan.push(this.format('retryGuideCausalProjectionRepair'));
            }else if((match=primary.match(/(?:到期事件未处理：|期限到来イベントが未処理：)([^。]+)/))){
                plan.push(this.format('retryGuideDueEvent',{name:match[1]}));
            }else if((match=primary.match(/(?:事件时间锚点缺失或过于模糊：|事件の時刻基準がないか、曖昧すぎます：)([^；]+)/))){
                plan.push(this.format('retryGuideEventTime',{name:match[1]}));
            }else if((match=primary.match(/(?:事件时间锚点仍未补全：|イベントの時刻アンカーが未補完：)([^；]+)/))){
                for(const name of match[1].split('、').filter(Boolean))plan.push(this.format('retryGuideEventTime',{name}));
            }else if((match=primary.match(/(?:超期活动事件仍未复核：|長期継続中の活動事件が未確認：)([^；]+)/))){
                for(const name of match[1].split('、').filter(Boolean))plan.push(this.format('retryGuideStaleEvent',{name}));
            }else if((match=primary.match(/(?:时间越界记录仍未修复：|未来時刻の記録が未修正：)([^；]+)/))){
                plan.push(this.format('retryGuideTemporalRepair',{details:match[1]}));
            }else if((match=primary.match(/(?:异端活动未复核：|異端の活動が未確認：)([^；]+)/))){
                for(const name of match[1].split('、').filter(Boolean))plan.push(this.format('retryGuideAlienActivity',{name}));
            }else if((match=primary.match(/(?:NPC构筑审计未推进：|NPC 構成監査が進んでいません：)([^；]+)/))){
                for(const name of match[1].split('、').filter(Boolean))plan.push(this.format('retryGuideNpcAudit',{name}));
            }else if(primary&&!rejected.length){
                plan.push("全体検証："+primary);
            }

            if(/(?:宏观节点日期(?:未服从|与).*原著\/数据库时间锚点|大局的な節目の日付.*(?:原作|データベース).*(?:基準日|時間基準))/.test(combined))plan.unshift(this.format('retryGuideChronology'));
            if(/(?:事件前因(?:不存在|非法自引用)|事件の前因が(?:存在しません|自身を参照しています))/.test(combined))plan.push(this.format('retryGuidePredecessor'));
            if(/(?:字段未通过完整 Schema 校验|フィールドが完全な Schema 検証を通過しませんでした)/.test(combined))plan.push(this.format('retryGuideSchemaMismatch'));
            if((match=combined.match(/(?:传闻为空未补足：|噂が空のまま未補充：)([^；\n]+)/)))plan.push(this.format('retryGuideRumorEmpty',{details:match[1]}));
            if((match=combined.match(/(?:传播链仍未复核：|伝播チェーンが未再確認：)([^；\n]+)/)))plan.push(this.format('retryGuidePropagationReview',{details:match[1]}));
            if(/(?:时间事实超过当前世界时间|时间越界记录仍未修复|記録時刻が現在の世界時刻を超えています|未来時刻の記録が未修正)/.test(combined))plan.unshift(this.format('retryGuideTemporalIntegrity'));
            if(/(?:世界活动不足：|世界活動が不足：)/.test(primary))plan.unshift(
                this.format('retryGuideWorldActivity'),
                this.format('retryGuideWorldScene'),
                this.format('retryGuideCurrentReality')
            );
            return Array.from(new Set(plan.filter(Boolean)));
        }
    }

    const DEFAULT_WORLD_RETRY_GUIDANCE_SERVICE=new WorldRetryGuidanceService();
    class WorldResultStagingService {
        constructor(normalizer,materializer,chronology,retryGuidance,rumor){
            this.normalizer=normalizer||DEFAULT_WORLD_RESULT_NORMALIZER;
            this.materializer=materializer||DEFAULT_WORLD_RESULT_MATERIALIZER;
            this.rumor=rumor||this.materializer.rumor||DEFAULT_WORLD_RUMOR_SERVICE;
            this.chronology=chronology||DEFAULT_WORLD_CHRONOLOGY_POLICY;
            this.retryGuidance=retryGuidance||DEFAULT_WORLD_RETRY_GUIDANCE_SERVICE;
        }

        // Result normalization, merge, fragment splitting, compilation and retry planning are canonical class calls.

        worldResultFragments(value) {
            const rawRumors=plain(value?.噂)?value.噂:{},rawRumorErrors={};
            for(const source of Array.isArray(rawRumors.街頭の噂)?rawRumors.街頭の噂:[]){
                if(!plain(source)||source.操作==="削除"||source.操作==="今回の提案を撤回"||!Object.hasOwn(source,"信頼度"))continue;
                try{this.normalizer.assertRumorCredibility(source.信頼度);}
                catch(error){rawRumorErrors.街頭の噂=error;break;}
            }
            const result=this.normalizer.normalizeWorldResult(value),fragments=[];
            const push=(label,body,error=null)=>fragments.push({label,result:Object.assign({要約:''},body),error});
            if(Object.hasOwn(result,"時間"))push("時間",{時間:result.時間});
            for(const [key,value] of Object.entries(result.通貨||{}))push("通貨/"+key,{通貨:{[key]:copy(value)}});
            for(const [key,value] of Object.entries(result.暦法||{}))push("暦法/"+key,{暦法:{[key]:copy(value)}});
            for(const key of ['事件','人物','势力地区','历史','传播',"勢力",'探索','资产','異端']){
                for(const item of result[key]||[])push(key+'/'+item.名称,{[key]:[copy(item)]});
            }
            if(Object.hasOwn(result.因果||{},"現在段階"))push("因果/現在段階",{因果:{現在段階:result.因果.現在段階}});
            if(Array.isArray(result.因果?.宏观顺序)&&result.因果.宏观顺序.length)push("因果/大局順序",{因果:{宏观顺序:copy(result.因果.宏观顺序)}});
            for(const item of result.因果?.偏移記録||[])push("因果/偏移記録/"+item.名称,{因果:{偏移記録:[copy(item)]}});
            // 容量约束针对最终分类；新增与移除必须一起验收，不能拆散换新操作。
            for(const key of WORLD_RESULT_RUMORS)if(result.噂?.[key]?.length)push("噂/"+key,{噂:{[key]:copy(result.噂[key])}},rawRumorErrors[key]||null);
            for(const item of result.关系||[])push("関係/"+item.名称,{关系:[copy(item)]});
            return {要約:result.要約,fragments};
        }

        shortSchemaValue(value) {
            if(value===undefined)return 'undefined';
            let raw;try{raw=JSON.stringify(value);}catch(_){raw=String(value);}
            if(raw===undefined)raw=String(value);
            return raw.length>140?raw.slice(0,137)+'…':raw;
        }

        firstSchemaDifference(before,after,parts) {
            if(same(before,after))return null;
            if(plain(before)&&plain(after)){
                const keys=Array.from(new Set([...Object.keys(before),...Object.keys(after)]));
                for(const key of keys){
                    const diff=this.firstSchemaDifference(before[key],after[key],parts.concat(key));
                    if(diff)return diff;
                }
            }
            if(Array.isArray(before)&&Array.isArray(after)&&before.length===after.length){
                for(let i=0;i<before.length;i++){
                    const diff=this.firstSchemaDifference(before[i],after[i],parts.concat(String(i)));
                    if(diff)return diff;
                }
            }
            return {parts,before,after};
        }

        schemaMismatchError(beforeState,afterState,patchPath) {
            const parts=tokens(patchPath),before=get(beforeState,parts),after=get(afterState,parts);
            const diff=this.firstSchemaDifference(before,after,parts)||{parts,before,after};
            return new Error("フィールドが完全な Schema 検証を通過しませんでした："+pointer(diff.parts)+'（'+this.shortSchemaValue(diff.before)+' → '+this.shortSchemaValue(diff.after)+'）');
        }

        stage(stat,accepted,incoming,validate) {
            const split=this.worldResultFragments(incoming);
            let staged=accepted?this.normalizer.mergeWorldResults(accepted,{要約:split.要約}):this.normalizer.normalizeWorldResult({要約:split.要約});
            let pending=split.fragments.map(unit=>Object.assign({},unit,{error:unit.error||null})),progress=true;
            while(pending.length&&progress){
                progress=false;
                const nextPending=[];
                for(const unit of pending){
                    if(unit.error){nextPending.push(unit);continue;}
                    const candidate=this.normalizer.mergeWorldResults(staged,unit.result);
                    try{
                        const compiled=this.materializer.compileWorldResult(stat,candidate);
                        const built=this.materializer.materializeWorldUpdate(stat,[],compiled.patches);
                        if(typeof validate==='function'){
                            const checked=validate(built.next);
                            for(const patch of compiled.patches){
                                if(patch.op!=='remove'&&!same(get(checked,tokens(patch.path)),get(built.next,tokens(patch.path))))throw this.schemaMismatchError(built.next,checked,patch.path);
                            }
                        }
                        staged=candidate;
                        progress=true;
                    }catch(error){
                        unit.error=error;
                        nextPending.push(unit);
                    }
                }
                pending=nextPending;
            }
            return {
                accepted:staged,
                ...this.rumor.classifyFailures(pending.map(unit=>({片段:unit.label,原因:String(unit.error?.message||unit.error||"業務フラグメントが検証を通過しませんでした")})))
            };
        }
        // 首次请求与纠错共用同一份交付标准，避免模型失败后才知道宏观骨架的硬要求。

        macroBackbonePlan(current,active,future) {
            return this.retryGuidance.macroBackbonePlan(current,active,future);
        }

        retryPlanForFailure(error,rejected=[]) {
            return this.retryGuidance.plan(error,rejected);
        }

        // UI 和模型请求共用去重视图；原始分片仍保留在日志，未知错误不截断。

        retryFeedback(error,rejected=[],plans=[]) {
            const message=String(error?.message||error||'');
            const summary=rejected?.length?message.split("\n\n具体的な理由\n")[0]:message;
            const compactReason=value=>{
                const reason=String(value||'');
                return /^(?:事件前因(?:不存在|非法自引用)：|事件の前因が(?:存在しません|自身を参照しています)：)/.test(reason)?reason.split('；')[0]:reason;
            };
            const rawIssues=(rejected||[]).map(item=>String(item.片段||'')+'：'+String(item.原因||''));
            const issues=Array.from(new Set((rejected||[]).map(item=>{
                const reason=compactReason(item.原因);
                return /^(?:事件前因(?:不存在|非法自引用)：|事件の前因が(?:存在しません|自身を参照しています)：)/.test(reason)?reason:String(item.片段||'')+'：'+reason;
            })));
            const redundant=new Set([...rawIssues,...issues,summary,"全体検証："+summary,"全体検証："+message]);
            const actions=Array.from(new Set((plans||[]).filter(Boolean).map(String))).filter(line=>!redundant.has(line));
            return {summary,issues,actions};
        }

        makeRetryFailure(rejected,globalError) {
            const reasons=[];
            if(rejected?.length)reasons.push("一部の業務フラグメントが通過しませんでした（"+rejected.length+"件）");
            if(globalError)reasons.push(String(globalError.message||globalError));
            const error=new Error(reasons.join('；')||"WorldResult が業務検証を通過しませんでした");
            error.retryPlan=this.retryPlanForFailure(globalError,rejected);
            error.rejectedSlices=copy(rejected||[]);
            const feedback=this.retryFeedback(error,rejected,error.retryPlan);
            error.retryPlan=feedback.actions;
            if(feedback.issues.length)error.message=feedback.summary+"\n\n具体的な理由\n"+feedback.issues.join('\n');
            return error;
        }
    }
    const DEFAULT_WORLD_RESULT_STAGING=new WorldResultStagingService(DEFAULT_WORLD_RESULT_NORMALIZER,DEFAULT_WORLD_RESULT_MATERIALIZER,DEFAULT_WORLD_CHRONOLOGY_POLICY,DEFAULT_WORLD_RETRY_GUIDANCE_SERVICE);
    let ACTIVE_WORLD_RESULT_STAGING=DEFAULT_WORLD_RESULT_STAGING;
    function worldResultFragments(value){return ACTIVE_WORLD_RESULT_STAGING.worldResultFragments(value);}
    function stageWorldResult(stat,accepted,incoming,validate){return ACTIVE_WORLD_RESULT_STAGING.stage(stat,accepted,incoming,validate);}
    function macroBackbonePlan(current,active,future){return ACTIVE_WORLD_RESULT_STAGING.macroBackbonePlan(current,active,future);}
    function retryPlanForFailure(error,rejected=[]){return ACTIVE_WORLD_RESULT_STAGING.retryPlanForFailure(error,rejected);}
    function retryFeedback(error,rejected=[],plans=[]){return ACTIVE_WORLD_RESULT_STAGING.retryFeedback(error,rejected,plans);}
    function makeRetryFailure(rejected,globalError){return ACTIVE_WORLD_RESULT_STAGING.makeRetryFailure(rejected,globalError);}
    class WorldResultReplyParser {
        firstCompleteJsonObject(source) {
            const text=String(source||''),start=text.indexOf('{');
            if(start<0)return '';
            let depth=0,inString=false,escaped=false;
            for(let i=start;i<text.length;i++){
                const ch=text[i];
                if(inString){
                    if(escaped)escaped=false;
                    else if(ch==='\\')escaped=true;
                    else if(ch==='"')inString=false;
                    continue;
                }
                if(ch==='"'){inString=true;continue;}
                if(ch==='{')depth++;
                else if(ch==='}'){
                    depth--;
                    if(depth===0)return text.slice(start,i+1);
                    if(depth<0)return '';
                }
            }
            return '';
        }
        parse(text) {
            let source=String(text).trim();
            const block=source.match(/<world_update\s*>([\s\S]*?)<\/world_update>/i);
            if(block)source=block[1].trim();
            const fence=source.match(/\x60\x60\x60(?:json)?\s*([\s\S]*?)\x60\x60\x60/i);
            if(fence)source=fence[1].trim();
            let result;
            try {result=JSON.parse(source);}
            catch(error){
                const candidate=this.firstCompleteJsonObject(source);
                try {if(!candidate)throw error;result=JSON.parse(candidate);}
                catch(_){throw new Error("返却された JSON を解析できません："+error.message+"；元の返信はリクエスト検査に保持されています。");}
            }
            if(!plain(result))throw new Error("返信は JSON オブジェクトでなければなりません");
            for(const key of ['WorldResult','world_result','world_update','result']){
                if(plain(result[key])&&Object.keys(result).length===1){result=result[key];break;}
            }
            if(Array.isArray(result.patches)&&typeof result.summary==='string'){
                return {kind:'legacy_patches',summary:result.summary,patches:result.patches};
            }
            const worldResult=normalizeWorldResult(result);
            return {kind:'world_result',summary:worldResult.要約,worldResult};
        }
    }
    const DEFAULT_WORLD_RESULT_REPLY_PARSER=new WorldResultReplyParser();
    let ACTIVE_WORLD_RESULT_REPLY_PARSER=DEFAULT_WORLD_RESULT_REPLY_PARSER;
    function parseReply(text){return ACTIVE_WORLD_RESULT_REPLY_PARSER.parse(text);}
    class WorldValidationPolicy {
        constructor(timeline,duePolicy,activityPolicy,softMaintenancePolicy){this.timeline=timeline||DEFAULT_WORLD_TIMELINE_POLICY;this.duePolicy=duePolicy||DEFAULT_WORLD_DUE_EVENT_POLICY;this.activityPolicy=activityPolicy||DEFAULT_WORLD_ACTIVITY_POLICY;this.softMaintenancePolicy=softMaintenancePolicy||DEFAULT_WORLD_SOFT_MAINTENANCE_POLICY;}
        ensureDueHandled(next,dueList,worldTime) { return this.duePolicy.ensureHandled(next,dueList,worldTime); }

        unscheduledEvents(stat) { return this.softMaintenancePolicy.unscheduledEvents(stat); }

        ensureEventTimeAnchors(next,required=[]) { return this.softMaintenancePolicy.ensureEventTimeAnchors(next,required); }

        ensureStaleActiveHandled(next,required=[],worldTime='') {
            const now=worldDateKey(worldTime),state=next?.世界?.[PATH];
            const unresolved=[],resolved=[];
            for(const item of required||[]){
                const event=state?.事件?.[item.名称];
                if(!event)continue;
                if(["完了","取消済み"].includes(event.状態)){resolved.push(item.名称);continue;}
                const updated=worldDateKey(event.更新时间);
                if(event.状態==="進行中"&&updated!==null&&now!==null&&updated===now&&String(event.下次检查||'').trim())continue;
                unresolved.push(item.名称);
            }
            if(unresolved.length)throw new Error("長期継続中の活動事件が未確認："+unresolved.join('、')+"；局所イベントが長時間にわたり進行中のままです。終了/キャンセルするか、現在時刻へ更新して次回チェックを記入してください");
            // 对“本轮刚刚确认早已结束”的陈旧局部事件绕过24小时展示宽限：
            // 清理人物/地区/传播的软引用；若没有活跃事件继续依赖它，则立即压成历史。
            for(const name of resolved){
                const event=state?.事件?.[name];if(!event)continue;
                detachEventSoftRefs(state,name);
                const hardRef=Object.entries(state.事件||{}).some(([other,record])=>other!==name&&!["完了","取消済み"].includes(record?.状態)&&Array.isArray(record?.前因)&&record.前因.includes(name));
                if(!hardRef)archiveFinishedEvent(next,state,name,event,[]);
            }
        }

        ensureTemporalAnomaliesResolved(next,required=[]) {
            if(!(required||[]).length)return;
            // Validation must observe runtime decorators applied to temporalAnomalies.
            const remaining=temporalAnomalies(next);
            const keys=new Set((required||[]).map(item=>item.タイプ+'\u0000'+item.名称));
            const bad=remaining.filter(item=>keys.has(item.タイプ+'\u0000'+item.名称));
            if(bad.length)throw new Error("未来時刻の記録が未修正："+bad.map(item=>item.タイプ+'/'+item.名称+'('+item.字段+'='+item.值+')').join('、'));
        }

        ensureMacroBackbone(next,timeline,required=true) {
            if(required&&timeline?.需要补充远期){
                const allMacro=Object.entries(next?.世界?.[PATH]?.事件||{}).filter(([,e])=>e.分类==="大局的な節目"&&e.状態!=="取消済み");
                const activeMacro=allMacro.filter(([,e])=>e.状態==="進行中");
                const futureMacro=allMacro.filter(([,e])=>e.状態==="発生待ち");
                const openMacro=allMacro.filter(([,e])=>["進行中","発生待ち"].includes(e.状態));
                if(openMacro.length<3)throw new Error("大局事件が不足：進行可能な大局的な節目は最低 3 件必要です（進行中 + 発生待ち）。現在は "+openMacro.length+" 件（進行中 "+activeMacro.length+" 件、発生待ち "+futureMacro.length+" 件）");
                const stages=this.timeline.storyStages(next?.世界?.因果軌道?.ストーリーライン);
                const names=new Set(allMacro.map(([name])=>name));
                if(stages.length<3||stages.length>5||stages.some(name=>!names.has(name)))throw new Error("因果轨道未形成有效宏观投影：既存のマクロノードを使って3~5ノードのストーリーラインを生成してください");
            }
            return this.activityPolicy.ensureDelivery(next,timeline?.世界活动要求);
        }

        progressionAnchorChanged(before,after) {
            return before?.世界?.名称!==after?.世界?.名称||before?.世界?.時間!==after?.世界?.時間||!!before?.システム状態?.主神空間滞在中!==!!after?.システム状態?.主神空間滞在中;
        }
    }
    const DEFAULT_WORLD_VALIDATION_POLICY=new WorldValidationPolicy(DEFAULT_WORLD_TIMELINE_POLICY,DEFAULT_WORLD_DUE_EVENT_POLICY,DEFAULT_WORLD_ACTIVITY_POLICY,DEFAULT_WORLD_SOFT_MAINTENANCE_POLICY);
    let ACTIVE_WORLD_VALIDATION_POLICY=DEFAULT_WORLD_VALIDATION_POLICY;
    function ensureDueHandled(next,dueList,worldTime){return ACTIVE_WORLD_VALIDATION_POLICY.ensureDueHandled(next,dueList,worldTime);}
    function unscheduledEvents(stat){return ACTIVE_WORLD_VALIDATION_POLICY.unscheduledEvents(stat);}
    function ensureEventTimeAnchors(next,required=[]){return ACTIVE_WORLD_VALIDATION_POLICY.ensureEventTimeAnchors(next,required);}
    function ensureStaleActiveHandled(next,required=[],worldTime=''){return ACTIVE_WORLD_VALIDATION_POLICY.ensureStaleActiveHandled(next,required,worldTime);}
    function ensureTemporalAnomaliesResolved(next,required=[]){return ACTIVE_WORLD_VALIDATION_POLICY.ensureTemporalAnomaliesResolved(next,required);}
    function ensureMacroBackbone(next,timeline,required=true){return ACTIVE_WORLD_VALIDATION_POLICY.ensureMacroBackbone(next,timeline,required);}
    function progressionAnchorChanged(before,after){return ACTIVE_WORLD_VALIDATION_POLICY.progressionAnchorChanged(before,after);}
    // 世界引擎基础样式资源：保持视觉不变，只把大块 CSS 从 UI 类方法中移出。
    function worldEngineBaseStyleText() {
        let css = [
                '#sam-world-engine .we-event-tasks{margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--we-surface,transparent)}#sam-world-engine .we-event-task{margin-top:8px;border-top:1px solid var(--line);padding-top:8px}#sam-world-engine .we-event-task summary{display:flex;align-items:center;gap:10px;cursor:pointer;list-style:none}#sam-world-engine .we-event-task summary:before{content:"▸";color:var(--sub)}#sam-world-engine .we-event-task[open] summary:before{content:"▾"}#sam-world-engine .we-task-name{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:600}#sam-world-engine .we-event-task summary .we-pill{flex-shrink:0}#sam-world-engine .we-event-task p{overflow-wrap:anywhere}',
                '#sam-world-engine[hidden]{display:none!important}',
                '#sam-world-engine{--ink:#dce5ef;--sub:#8897aa;--line:#ffffff12;--gold:#d9b978;--mint:#7dcbbb;position:fixed;inset:4vh max(2vw,calc((100vw - 1440px)/2));z-index:999999;background:#101720;color:var(--ink);border:1px solid #53606a;border-radius:14px;box-shadow:0 30px 120px #000b;display:flex;flex-direction:column;overflow:hidden;font:14px/1.65 system-ui,"Microsoft YaHei",sans-serif}',
                '#sam-world-engine *{box-sizing:border-box}#sam-world-engine button,#sam-world-engine input,#sam-world-engine textarea{font:inherit}#sam-world-engine button{cursor:pointer;color:inherit}#sam-world-engine button:focus-visible,#sam-world-engine input:focus-visible{outline:2px solid var(--gold);outline-offset:2px}#sam-world-engine button:disabled{opacity:.4;cursor:default}',
                '#sam-world-engine header{height:62px;flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 25px;border-bottom:1px solid var(--line);background:#131c27}#sam-world-engine .we-brand{font-size:16px;letter-spacing:3px;font-weight:650;flex:1}#sam-world-engine .we-brand i{color:var(--gold);font-style:normal;margin-right:12px}#sam-world-engine .we-brand small{font-size:10px;color:var(--sub);letter-spacing:2px;margin-left:16px}',
                '#sam-world-engine button.we-btn{border:1px solid #ffffff23;border-radius:6px;background:#ffffff05;padding:7px 13px;font-size:12px}#sam-world-engine button.we-primary{background:var(--gold);border-color:var(--gold);color:#20232a;font-weight:700}#sam-world-engine .we-layout{display:flex;min-height:0;flex:1}#sam-world-engine nav{width:173px;flex-shrink:0;padding:22px 12px;background:#121a24;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:5px}#sam-world-engine nav .we-navtitle{font-size:10px;color:var(--sub);letter-spacing:3px;padding:0 13px 15px}#sam-world-engine nav button{display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid transparent;border-radius:6px;text-align:left;background:none;color:var(--sub);font-size:13px}#sam-world-engine nav button .we-tab-icon{display:inline-flex;flex:0 0 20px;width:20px;height:20px;align-items:center;justify-content:center;font:400 16px/1 "Segoe UI Symbol","Noto Sans Symbols 2",system-ui,sans-serif;transform:none!important}#sam-world-engine nav button[aria-selected=true]{background:#d9b97812;color:var(--gold);border-color:#d9b97824}#sam-world-engine nav button:hover{background:#ffffff08;color:var(--ink)}',
                '#sam-world-engine main{flex:1;min-width:0;overflow:auto;padding:27px 30px 36px;scrollbar-width:thin;scrollbar-color:#526070 transparent}#sam-world-engine .we-eyebrow{font-size:10px;letter-spacing:3px;color:var(--gold);margin-bottom:7px}#sam-world-engine h1{font-size:30px;letter-spacing:2px;margin:0 0 8px;font-weight:600}#sam-world-engine h2{font-size:14px;font-weight:600;margin:0;letter-spacing:1px}#sam-world-engine h3{font-size:14px;margin:0 0 7px}#sam-world-engine p{margin:7px 0;white-space:pre-wrap;overflow-wrap:anywhere}#sam-world-engine .we-muted{color:var(--sub);font-size:12px}#sam-world-engine .we-hero{display:flex;gap:25px;justify-content:space-between;align-items:center;padding:0 0 23px;border-bottom:1px solid var(--line)}#sam-world-engine .we-hero .we-date{min-width:180px;text-align:right;color:var(--gold);font-size:16px}#sam-world-engine .we-hero .we-date small{display:block;color:var(--sub);font-size:11px;margin-top:5px}',
                '#sam-world-engine .we-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:18px 0 25px;background:linear-gradient(100deg,#1a2634,#141f2b);border:1px solid var(--line);border-radius:9px}#sam-world-engine .we-metric{padding:15px 20px;border-right:1px solid var(--line)}#sam-world-engine .we-metric:last-child{border:0}#sam-world-engine .we-metric strong{display:block;font-size:25px;font-weight:500;color:var(--ink);line-height:1.4}#sam-world-engine .we-metric small{color:var(--sub);font-size:11px;letter-spacing:1px}',
                '#sam-world-engine .we-columns{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(245px,1fr);gap:23px;align-items:start}#sam-world-engine .we-section{margin-bottom:23px;min-width:0}#sam-world-engine .we-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}#sam-world-engine .we-section-head small{color:var(--sub);font-size:11px}#sam-world-engine .we-card{border:1px solid var(--line);border-radius:8px;background:#18222f;padding:16px 18px;margin:9px 0;overflow:hidden}#sam-world-engine .we-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px}#sam-world-engine .we-card-top h3{margin:0}#sam-world-engine .we-card p{font-size:13px;color:#b8c4d3}#sam-world-engine .we-pill{display:inline-block;font-size:10px;line-height:1.6;padding:2px 7px;border:1px solid #7dcbbb30;border-radius:4px;color:var(--mint);background:#7dcbbb09;white-space:nowrap}#sam-world-engine .we-pill.future{color:var(--gold);border-color:#d9b97830;background:#d9b97809}#sam-world-engine .we-pill.dim{color:var(--sub);border-color:var(--line);background:transparent}#sam-world-engine .we-meta{display:flex;gap:8px 15px;flex-wrap:wrap;color:var(--sub);font-size:11px;margin-top:9px}#sam-world-engine .we-chips{display:flex;flex-wrap:wrap;gap:5px}',
                '#sam-world-engine .we-timeline{border-left:1px solid #d9b97838;margin-left:5px;padding-left:20px}#sam-world-engine .we-timeline .we-card{position:relative;overflow:visible}#sam-world-engine .we-timeline .we-card:before{content:"";position:absolute;left:-26px;top:20px;width:9px;height:9px;background:var(--gold);border:2px solid #101720;border-radius:50%}#sam-world-engine .we-avatar{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#496575,#243440);color:#c1dedc;font-size:15px;flex-shrink:0}#sam-world-engine .we-person{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}#sam-world-engine .we-person:last-child{border:0}#sam-world-engine .we-person>div:last-child{flex:1;min-width:0}#sam-world-engine .we-person strong{font-size:13px}#sam-world-engine .we-person p{font-size:12px;color:#acb8c8;margin:3px 0}',
                '#sam-world-engine .we-context-list{display:grid;gap:8px}#sam-world-engine .we-context-row{width:100%;display:grid;grid-template-columns:minmax(56px,auto) minmax(0,1fr);align-items:start;gap:10px;padding:11px 12px;border:1px solid var(--we-line,var(--line));border-radius:9px;background:var(--we-card,#18222f);text-align:left;color:var(--we-ink,var(--ink))}#sam-world-engine button.we-context-row:hover{background:var(--we-card-hover,#1d2a39)}#sam-world-engine .we-context-kind{color:var(--we-accent,var(--gold));font-size:var(--we-fs-tiny,11px);font-weight:700;letter-spacing:.06em}#sam-world-engine .we-context-copy{min-width:0}#sam-world-engine .we-context-copy b{display:block;font-size:var(--we-fs-body,13px);overflow-wrap:anywhere}#sam-world-engine .we-context-copy small{display:block;margin-top:2px;color:var(--we-sub,var(--sub));font-size:var(--we-fs-small,12px)}#sam-world-engine .we-scene-hero{padding:14px 16px;border:1px solid var(--we-line,var(--line));border-radius:11px;background:var(--we-card,#18222f)}#sam-world-engine .we-scene-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}#sam-world-engine .we-scene-head h3{margin:0}#sam-world-engine .we-scene-head small{color:var(--we-sub,var(--sub))}#sam-world-engine .we-scene-hero>p{margin:8px 0 0;color:var(--we-sub,var(--sub))}#sam-world-engine .we-scene-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:11px}#sam-world-engine .we-scene-lane{min-width:0;border:1px solid var(--we-line,var(--line));border-radius:10px;background:var(--we-card,#18222f);padding:11px}#sam-world-engine .we-scene-lane-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}#sam-world-engine .we-scene-lane-head b{font-size:var(--we-fs-small,12px)}#sam-world-engine .we-scene-lane-head span{color:var(--we-sub,var(--sub));font-size:var(--we-fs-tiny,11px)}#sam-world-engine .we-scene-item{display:block;width:100%;padding:9px 8px;border:0;border-top:1px solid var(--we-line,var(--line));background:transparent;text-align:left;color:var(--we-ink,var(--ink))}#sam-world-engine .we-scene-item:first-of-type{border-top:0}#sam-world-engine button.we-scene-item:hover{background:var(--we-card-hover,#1d2a39)}#sam-world-engine .we-scene-item b{display:block;font-size:var(--we-fs-body,13px);overflow-wrap:anywhere}#sam-world-engine .we-scene-item small{display:block;color:var(--we-sub,var(--sub));font-size:var(--we-fs-tiny,11px);margin-top:2px}#sam-world-engine .we-scene-item p{margin:4px 0 0!important;color:var(--we-sub,var(--sub))!important;font-size:var(--we-fs-small,12px)!important;line-height:1.5!important}#sam-world-engine .we-scene-label,#sam-world-engine .we-person-label{cursor:default}#sam-world-engine .we-roster-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#sam-world-engine .we-roster-person{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;min-width:0;padding:11px 12px;border:1px solid var(--we-line,var(--line));border-radius:10px;background:var(--we-card,#18222f);text-align:left;color:var(--we-ink,var(--ink))}#sam-world-engine .we-roster-person:hover{background:var(--we-card-hover,#1d2a39)}#sam-world-engine .we-roster-person.active{border-color:var(--we-accent,var(--gold));box-shadow:0 0 0 2px color-mix(in srgb,var(--we-accent,var(--gold)) 18%,transparent)}#sam-world-engine .we-roster-copy{min-width:0}#sam-world-engine .we-roster-copy b{display:block;font-size:var(--we-fs-body,13px);overflow-wrap:anywhere}#sam-world-engine .we-roster-copy small{display:block;margin-top:2px;color:var(--we-sub,var(--sub));font-size:var(--we-fs-tiny,11px)}#sam-world-engine .we-roster-copy em{display:block;margin-top:5px;color:var(--we-sub,var(--sub));font-size:var(--we-fs-small,12px);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#sam-world-engine .we-area-scene-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}#sam-world-engine .we-area-detail{display:grid;gap:14px}#sam-world-engine .we-area-facts{min-width:0;padding:14px 16px;border:1px solid var(--we-line,var(--line));border-radius:11px;background:var(--we-card,#18222f)}#sam-world-engine .we-area-archive{padding:0 2px}#sam-world-engine .we-explore-index{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}@media(max-width:900px){#sam-world-engine .we-roster-list,#sam-world-engine .we-scene-grid,#sam-world-engine .we-area-scene-grid{grid-template-columns:1fr}}',
                '#sam-world-engine .we-change{display:grid;grid-template-columns:62px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:12px}#sam-world-engine .we-change time{color:var(--gold);font-size:10px}#sam-world-engine .we-change p{margin:2px 0;color:var(--sub)}#sam-world-engine .we-progress{height:4px;background:#ffffff0a;border-radius:4px;margin:10px 0 6px;overflow:hidden}#sam-world-engine .we-progress>i{display:block;height:100%;background:var(--mint);border-radius:4px}#sam-world-engine .we-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 18px;align-items:start}#sam-world-engine dl{margin:12px 0;display:grid;grid-template-columns:85px minmax(0,1fr);gap:8px 14px;font-size:12px}#sam-world-engine dt{color:var(--sub)}#sam-world-engine dd{margin:0;overflow-wrap:anywhere;white-space:pre-wrap}#sam-world-engine details{border-top:1px solid var(--line);margin-top:12px;padding-top:8px}#sam-world-engine summary{cursor:pointer;color:var(--gold);font-size:11px;list-style:none}#sam-world-engine summary:before{content:"＋ ";}#sam-world-engine details[open]>summary:before{content:"− ";}',
                '#sam-world-engine .we-calendar{background:#18222f;border:1px solid var(--line);border-radius:8px;padding:16px;margin-bottom:20px}#sam-world-engine .we-calhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}#sam-world-engine .we-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}#sam-world-engine .we-days span{color:var(--sub);font-size:10px;padding:4px}#sam-world-engine .we-days button{position:relative;padding:7px 0;border:1px solid transparent;border-radius:5px;background:none;font-size:11px;min-width:0}#sam-world-engine .we-days button.today{border-color:var(--gold);color:var(--gold)}#sam-world-engine .we-days button.selected{background:#d9b97824}#sam-world-engine .we-days button.has-event:after{content:"";position:absolute;bottom:2px;left:calc(50% - 2px);width:4px;height:4px;background:var(--mint);border-radius:50%}#sam-world-engine .we-days button:hover{background:#ffffff0b}',
                '#sam-world-engine .we-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:18px 0}#sam-world-engine .we-tools input{min-width:150px;flex:1;background:#17212d;border:1px solid var(--line);border-radius:6px;color:var(--ink);padding:8px 12px;font-size:12px}#sam-world-engine .we-tools button{border:1px solid var(--line);background:none;border-radius:5px;padding:6px 10px;font-size:11px}#sam-world-engine .we-tools button.active{border-color:var(--gold);color:var(--gold)}#sam-world-engine .we-empty{padding:24px 15px;text-align:center;border:1px dashed #ffffff19;border-radius:8px;color:var(--sub);font-size:12px}#sam-world-engine .we-empty b{display:block;color:#bec9d6;margin-bottom:5px;font-weight:500}#sam-world-engine .we-notice{padding:12px 16px;border-left:2px solid var(--gold);background:#d9b97808;margin:15px 0;color:#d4c4a6;font-size:12px}#sam-world-engine textarea{width:100%;min-height:48vh;background:#121b26;color:var(--ink);border:1px solid #ffffff24;border-radius:8px;padding:18px;line-height:1.9;resize:vertical}#sam-world-engine footer{padding:8px 24px;border-top:1px solid var(--line);font-size:10px;color:var(--sub);display:flex;justify-content:space-between;gap:15px}#sam-world-engine footer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
                '@media(max-width:1000px){#sam-world-engine .we-columns{grid-template-columns:1fr}#sam-world-engine nav{width:145px}#sam-world-engine main{padding:20px}#sam-world-engine .we-calendar{max-width:400px}}@media(max-width:640px){#sam-world-engine{inset:0;border-radius:0}#sam-world-engine header{padding:0 12px;height:58px;gap:6px}#sam-world-engine .we-brand{font-size:13px;letter-spacing:1px}#sam-world-engine .we-brand small{display:none}#sam-world-engine .we-layout{flex-direction:column}#sam-world-engine nav{width:100%;flex-direction:row;overflow-x:auto;padding:8px;gap:3px;border-right:0;border-bottom:1px solid var(--line)}#sam-world-engine nav .we-navtitle{display:none}#sam-world-engine nav button{white-space:nowrap;padding:7px 10px;font-size:11px}#sam-world-engine nav button .we-tab-icon{display:none}#sam-world-engine main{padding:18px 14px}#sam-world-engine .we-hero{gap:12px;align-items:flex-start}#sam-world-engine h1{font-size:23px}#sam-world-engine .we-hero .we-date{min-width:110px;font-size:12px}#sam-world-engine .we-metric{padding:10px}#sam-world-engine .we-metric strong{font-size:20px}#sam-world-engine .we-grid{grid-template-columns:1fr}#sam-world-engine footer{padding:8px 12px}#sam-world-engine footer small{display:none}}'
            ].join('\n');
        css += `
                #sam-world-engine{
                    top:2vh!important;bottom:auto!important;height:96vh!important;height:96dvh!important;max-height:none!important;min-height:0!important;
                    --ink:#243248;--sub:#6f7b8c;--line:#dfe4e7;--gold:#b28a4a;--mint:#4f7d6d;
                    background:#e8ece9;color:var(--ink);border-color:#344554;border-radius:18px;box-shadow:0 28px 90px #17212d55
                }
                #sam-world-engine header{
                    height:64px;background:linear-gradient(120deg,#1d2a39,#273d4c);color:#f7f3e8;border-bottom:0;padding:0 24px
                }
                #sam-world-engine .we-brand i{color:#d7b46d}
                #sam-world-engine .we-brand small{color:#aebbc5}
                #sam-world-engine button.we-btn{border-color:#ffffff28;background:#ffffff0a}
                #sam-world-engine button.we-primary{background:#d5b06b;border-color:#d5b06b;color:#22303e}
                #sam-world-engine .we-layout{display:grid!important;grid-template-rows:auto minmax(0,1fr);min-height:0!important;flex:1 1 0!important;overflow:hidden}
                #sam-world-engine nav{
                    width:100%!important;flex-direction:row!important;align-items:center;gap:6px;padding:9px 20px;background:#223342;border-right:0;border-bottom:1px solid #ffffff12;overflow-x:auto;min-height:51px
                }
                #sam-world-engine nav .we-navtitle{display:none}
                #sam-world-engine nav button{
                    flex:0 0 auto;padding:8px 13px;border-radius:999px;background:transparent;color:#aeb9c2;border-color:transparent;font-size:12px
                }
                #sam-world-engine nav button span{width:auto;font-size:13px}
                #sam-world-engine nav button:hover{background:#ffffff0c;color:#fff}
                #sam-world-engine nav button[aria-selected=true]{background:#d5b06b;color:#21303d;border-color:#d5b06b;font-weight:700}
                #sam-world-engine main{
                    display:block!important;height:auto!important;min-height:0!important;flex:1 1 0!important;overflow:auto!important;
                    padding:20px clamp(16px,2.2vw,30px) 34px;background:
                    radial-gradient(circle at 88% 0,#f6eee1 0,transparent 34%),
                    linear-gradient(135deg,#edf1ee,#e8ece9 55%,#f3f0e8)
                }
                #sam-world-engine .we-hero{
                    padding:18px 20px;margin-bottom:12px;border:1px solid #dbe1e2;border-left:4px solid var(--gold);border-radius:16px;background:#fbfaf6;box-shadow:0 7px 24px #2535460b
                }
                #sam-world-engine .we-eyebrow{color:#87662f}
                #sam-world-engine h1{font-family:Georgia,"SimSun",serif;font-size:27px;letter-spacing:1px}
                #sam-world-engine h2{font-family:Georgia,"SimSun",serif;font-size:17px;letter-spacing:.5px}
                #sam-world-engine .we-hero .we-date{color:#80612e}
                #sam-world-engine .we-section{
                    margin-bottom:14px;padding:16px;border:1px solid #dfe4e5;border-radius:15px;background:#fffdf8;box-shadow:0 7px 22px #22314209
                }
                #sam-world-engine .we-section-head{margin-bottom:12px;padding-bottom:9px;border-bottom:1px solid #ecefed}
                #sam-world-engine .we-section-head h2{display:flex;align-items:center;gap:8px}
                #sam-world-engine .we-section-head h2:before{content:"";width:3px;height:16px;border-radius:3px;background:var(--gold);flex:none}
                #sam-world-engine .we-card{background:#f6f8f7;border:0;border-radius:10px;padding:13px 15px;margin:7px 0;box-shadow:none;transition:background .15s ease,transform .15s ease}
                #sam-world-engine button.we-card:hover,#sam-world-engine .we-card:hover{background:#f1f4f2}
                #sam-world-engine .we-section .we-card details{border-top:1px solid #e4e8e7}
                #sam-world-engine .we-card p,#sam-world-engine .we-person p{color:#657185}
                #sam-world-engine .we-card-tags{display:flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:flex-end}
                #sam-world-engine .we-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 14px}
                #sam-world-engine .we-kpi{min-width:0;padding:13px 15px;border:1px solid #dce2e3;border-radius:13px;background:#f9f8f3}
                #sam-world-engine .we-kpi small{display:block;color:#7e8793;font-size:10px;letter-spacing:1px}
                #sam-world-engine .we-kpi strong{display:block;margin:3px 0 1px;font:600 24px/1.1 Georgia,serif;color:#31445d}
                #sam-world-engine .we-kpi span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#7b8491;font-size:10px}
                #sam-world-engine .we-dashboard{display:grid;grid-template-columns:minmax(0,1fr) minmax(270px,310px);gap:14px;align-items:start}
                #sam-world-engine .we-command-main,#sam-world-engine .we-command-side{min-width:0}
                #sam-world-engine .we-command-side{position:sticky;top:0}
                #sam-world-engine .we-pulse{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:start}
                #sam-world-engine .we-pulse p{margin:0;color:#4f5f70;font-size:13px;line-height:1.8}
                #sam-world-engine .we-pulse-mark{margin-top:2px;padding:2px 6px;border-radius:4px;background:#4f7d6d;color:#fff;font:700 9px/1.5 system-ui;letter-spacing:1px}
                #sam-world-engine .we-calendar-layout{display:grid;grid-template-columns:minmax(235px,275px) minmax(0,1fr);gap:18px;align-items:start}
                #sam-world-engine .we-calendar{margin:0;background:transparent;border:0;border-radius:0;padding:4px 2px}
                #sam-world-engine .we-calendar-slot{position:sticky;top:0}
                #sam-world-engine .we-timeline-slot{min-width:0}
                #sam-world-engine .we-timeline-slot>.we-tools{margin:0 0 10px}
                #sam-world-engine .we-timeline{margin-left:4px;padding-left:15px}
                #sam-world-engine .we-timeline .we-card{padding:11px 13px}
                #sam-world-engine .we-timeline .we-card:before{left:-21px;top:17px;width:7px;height:7px;border-color:#fffdf8}
                #sam-world-engine .we-timeline-group{margin:0 0 14px}
                #sam-world-engine .we-timeline-group-title{display:flex;align-items:center;gap:7px;margin:8px 0 6px;color:#6f7b8c;font-size:10px;font-weight:700;letter-spacing:1.2px}
                #sam-world-engine .we-timeline-group-title:after{content:"";height:1px;background:#e2e6e4;flex:1}
                #sam-world-engine .we-timeline-group-title small{order:2;padding:1px 5px;border-radius:999px;background:#ecefea;color:#87909a;font-size:9px;letter-spacing:0}
                #sam-world-engine .we-date-filter{font-size:11px;color:var(--sub)}
                #sam-world-engine .we-next-node{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px}
                #sam-world-engine button.we-next-node{width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;border-radius:9px;transition:background .15s ease,transform .15s ease}
                #sam-world-engine button.we-next-node:hover{background:#f4f1e9;transform:translateX(2px)}
                #sam-world-engine .we-card.is-jump{outline:2px solid #c49a50;outline-offset:2px;background:#fbf4e5}
                #sam-world-engine .we-next-node>span{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#d5b06b;color:#21303d;font-weight:800}
                #sam-world-engine .we-next-node h3{margin:1px 0 4px}
                #sam-world-engine .we-next-node p{font-size:12px;color:#657185}
                #sam-world-engine .we-next-node small{color:#94753d;font-size:10px}
                #sam-world-engine .we-brief-row{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;text-align:left;border:0;border-bottom:1px solid #e7e9e7;background:transparent;padding:9px 2px}
                #sam-world-engine .we-brief-row:last-child{border-bottom:0}
                #sam-world-engine .we-brief-row{transition:background .15s ease,padding-left .15s ease}
                #sam-world-engine .we-brief-row:hover{padding-left:7px}
                #sam-world-engine .we-brief-row>b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
                #sam-world-engine .we-brief-row>span:last-child{grid-column:1/-1;color:#707b89;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #sam-world-engine .we-brief-row:hover{background:#f4f5f1}
                #sam-world-engine .we-people-strip{display:grid;gap:5px}
                #sam-world-engine .we-person-compact{display:grid;grid-template-columns:32px minmax(0,1fr);gap:9px;align-items:center;width:100%;padding:7px;border:0;border-radius:9px;background:transparent;text-align:left}
                #sam-world-engine .we-person-compact{transition:background .15s ease,transform .15s ease}
                #sam-world-engine .we-person-compact:hover{background:#f3f5f1;transform:translateX(2px)}
                #sam-world-engine .we-person-compact .we-avatar{width:32px;height:32px;background:linear-gradient(145deg,#526c7c,#314656)}
                #sam-world-engine .we-person-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 7px;min-width:0}
                #sam-world-engine .we-person-copy strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #sam-world-engine .we-person-copy small{font-size:9px;color:#94753d;white-space:nowrap}
                #sam-world-engine .we-person-copy em{grid-column:1/-1;font-style:normal;font-size:10px;color:#75808d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #sam-world-engine .we-link-btn{width:100%;margin-top:8px;border:0;background:transparent;color:#8b6a33;text-align:right;font-size:10px;padding:4px}
                #sam-world-engine .we-link-btn:hover{text-decoration:underline}
                #sam-world-engine .we-change{grid-template-columns:58px 1fr;padding:8px 0}
                #sam-world-engine .we-tools{margin:12px 0;gap:6px}
                #sam-world-engine .we-tools input{background:#f7f8f5;color:var(--ink);border-color:#d8dfdf;border-radius:9px}
                #sam-world-engine .we-tools button{border-color:#d9dfdf;background:#f8f9f6;border-radius:999px}
                #sam-world-engine .we-tools button.active{border-color:#b28a4a;background:#f4ead8;color:#795b2b}
                #sam-world-engine dl{grid-template-columns:92px minmax(0,1fr)}
                #sam-world-engine .we-empty{border-color:#dde2e1;background:#fafaf7}
                #sam-world-engine .we-empty b{color:#6f7b8c}
                #sam-world-engine .we-notice{color:#725f3d;background:#f7edda;border-left-color:#b28a4a;border-radius:0 10px 10px 0}
                #sam-world-engine textarea{background:#fbfaf6;color:var(--ink);border-color:#d8deda}
                #sam-world-engine footer{flex-shrink:0;background:#1f2d3a;color:#9eabb6;border-top:0;padding:7px 20px}
                #sam-world-engine .we-config-row{display:flex;flex-wrap:wrap;gap:18px;align-items:center}
                #sam-world-engine .we-config-row input{width:70px}
                #sam-world-engine select,#sam-world-engine .we-config-row input{font:inherit;padding:7px;border:1px solid #d8ddd8;border-radius:7px;background:#fff;color:var(--ink)}
                #sam-world-engine .we-book{border:1px solid var(--line);border-radius:12px;padding:12px;background:#fffdf8}
                #sam-world-engine .we-book-list{max-height:320px;overflow:auto;margin-top:10px}
                #sam-world-engine .we-book-row{display:flex;gap:10px;align-items:center;padding:11px 4px;border-bottom:1px solid var(--line);cursor:pointer}
                #sam-world-engine .we-book-title{flex:1;min-width:0;overflow-wrap:anywhere}
                #sam-world-engine .we-book-title small{display:block;color:var(--sub);font-size:11px}
                #sam-world-engine .we-read-state{max-width:135px;color:var(--sub);font-size:11px}
                #sam-world-engine .we-lamp{width:9px;height:9px;border-radius:50%;flex-shrink:0}
                #sam-world-engine .we-lamp.blue{background:#5794dd;box-shadow:0 0 0 4px #5794dd16}
                #sam-world-engine .we-lamp.green{background:#58a879;box-shadow:0 0 0 4px #58a87916}
                #sam-world-engine .we-lamp.gray{background:#a1a6ad}
                #sam-world-engine .we-request-summary{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
                #sam-world-engine .we-inspect-body{max-height:440px;overflow:auto;padding:10px 3px;overscroll-behavior:contain}
                #sam-world-engine .we-prose{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}
                #sam-world-engine textarea.we-raw{min-height:180px;height:280px;max-height:400px;font:12px/1.8 monospace;white-space:pre-wrap}
                #sam-world-engine [data-segment]{min-height:180px;height:240px}
                #sam-world-engine summary{font-size:12px;line-height:1.7;transition:color .15s ease}
                #sam-world-engine summary:hover{color:#7d5f2d}
                #sam-world-engine .we-world-ranks{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0 0 10px;color:var(--sub);font-size:13px}
                #sam-world-engine .we-world-ranks b{color:var(--we-ink,var(--ink));font-weight:600;margin-left:6px}
                #sam-world-engine .we-hero>div:first-child{min-width:0}
                #sam-world-engine .we-reading-section summary{cursor:pointer;display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-weight:600}
                #sam-world-engine .we-reading-section summary small{font-weight:400;color:var(--sub)}
                #sam-world-engine .we-reading{max-width:80ch;margin:18px auto 4px;line-height:1.85;min-width:0}
                #sam-world-engine .we-reading article+article{border-top:1px solid var(--line);padding-top:18px;margin-top:18px}
                #sam-world-engine .we-reading article>small{color:var(--sub)}
                #sam-world-engine .we-reading p{white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.85}
                #sam-world-engine .we-world-laws{margin:0;line-height:1.6}
                #sam-world-engine .we-world-laws article+article{padding-top:8px;margin-top:8px}
                #sam-world-engine .we-world-laws p{margin:0;font-size:13px;line-height:1.6}
                #sam-world-engine .we-alien-count{margin:0 0 14px;align-items:center}
                #sam-world-engine .we-world-focus{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(285px,.75fr);gap:12px;margin-bottom:12px}
                #sam-world-engine .we-world-focus .we-section{height:100%;margin:0;border-color:#cfd9db;background:#fff;box-shadow:0 4px 14px #2231420b}
                #sam-world-engine .we-world-focus-main .we-section{border-left:4px solid #4f7d6d}
                #sam-world-engine .we-world-focus-next .we-section{border-left:4px solid #b28a4a}
                #sam-world-engine .we-kpi-compact{margin-bottom:12px}
                #sam-world-engine .we-kpi-compact .we-kpi{background:#fff;border-color:#cfd9db;box-shadow:0 3px 12px #22314208}
                #sam-world-engine .we-dashboard{grid-template-columns:minmax(0,1fr) minmax(285px,325px)}
                #sam-world-engine .we-dashboard .we-section{border-color:#d2dcdd;background:#fff}
                #sam-world-engine .we-timeline-board{box-shadow:none}
                #sam-world-engine .we-explore-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,330px);gap:12px;align-items:start}
                #sam-world-engine .we-explore-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
                #sam-world-engine .we-explore-card{display:block;width:100%;min-width:0;padding:13px;border:1px solid #d6dfe0;border-radius:12px;background:#fff;text-align:left;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}
                #sam-world-engine .we-explore-card:hover{border-color:#b9c9c7;box-shadow:0 5px 16px #22314210;transform:translateY(-1px)}
                #sam-world-engine .we-explore-card.active{border-color:#b28a4a;box-shadow:0 0 0 2px #d9b97825}
                #sam-world-engine .we-explore-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
                #sam-world-engine .we-explore-head>div{min-width:0}
                #sam-world-engine .we-explore-head small{display:block;color:#8b949d;font-size:9px}
                #sam-world-engine .we-explore-head h3{margin:2px 0 0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #sam-world-engine .we-risk-badge{flex:0 0 auto;padding:2px 7px;border:1px solid #d7dfe0;border-radius:999px;background:#f7f8f5;color:#536476;font-size:9px}
                #sam-world-engine .we-explore-score{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin:11px 0 5px}
                #sam-world-engine .we-explore-score strong{font:600 23px/1 Georgia,serif;color:#31475f}
                #sam-world-engine .we-explore-score strong small{display:inline;font:500 10px/1 system-ui;color:#7b8793}
                #sam-world-engine .we-explore-score span{font-size:10px;color:#8b6a33}
                #sam-world-engine .we-explore-bar{height:6px;overflow:hidden;border-radius:999px;background:#e8eceb}
                #sam-world-engine .we-explore-bar>i{display:block;height:100%;border-radius:999px;background:#6f9d8c}
                #sam-world-engine .we-explore-meta{display:flex;flex-wrap:wrap;gap:5px 9px;margin-top:9px;color:#788491;font-size:9px}
                #sam-world-engine .we-explore-card p{margin:8px 0 0;color:#657185;font-size:10px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
                #sam-world-engine .we-area-side{position:sticky;top:0}
                #sam-world-engine .we-area-hero{padding:2px 0 10px;border-bottom:1px solid #e2e7e6}
                #sam-world-engine .we-area-hero small{color:#8a939d;font-size:9px}
                #sam-world-engine .we-area-hero h3{margin:2px 0 8px;font-size:17px}
                #sam-world-engine .we-area-progress{display:grid;grid-template-columns:auto minmax(0,1fr);gap:11px;align-items:center}
                #sam-world-engine .we-area-progress>strong{font:600 31px/1 Georgia,serif;color:#30465f}
                #sam-world-engine .we-area-progress>div>span{display:flex;justify-content:space-between;color:#7b8791;font-size:9px;margin-bottom:5px}
                #sam-world-engine .we-area-progress em{font-style:normal;color:#8b6a33}
                #sam-world-engine .we-area-note{margin-top:10px;padding:9px 10px;border-radius:9px;background:#f5f7f3;color:#647180;font-size:10px;line-height:1.6}
                #sam-world-engine .we-faction-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
                #sam-world-engine .we-faction-card{display:block;width:100%;padding:12px 13px;border:1px solid #d6dfe0;border-radius:11px;background:#fff;text-align:left}
                #sam-world-engine .we-faction-card.active{border-color:#b28a4a;box-shadow:0 0 0 2px #d9b97822}
                #sam-world-engine .we-faction-card .we-card-top h3{font-size:13px}
                #sam-world-engine .we-rep{display:flex;justify-content:space-between;gap:8px;margin:8px 0 4px;font-size:10px;color:#788491}
                #sam-world-engine .we-rep b{color:#8b6a33}
                #sam-world-engine .we-preset-toolbar{position:sticky;top:-1px;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 14px;padding:12px 14px;border:1px solid #c7d2d4;border-radius:13px;background:#fffdf9f2;backdrop-filter:blur(10px);box-shadow:0 8px 22px #22314212}
                #sam-world-engine .we-preset-toolbar>div:first-child{display:flex;flex-direction:column;min-width:0}
                #sam-world-engine .we-preset-toolbar b{font-size:14px;color:#2c3e50}
                #sam-world-engine .we-preset-toolbar small{font-size:10px;color:var(--sub)}
                #sam-world-engine .we-preset-toolbar>div:last-child{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
                @media(max-height:420px){#sam-world-engine .we-preset-toolbar{position:static}}
                #sam-world-engine .we-doc-create{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;gap:8px;margin-bottom:10px}
                #sam-world-engine .we-doc-create input{min-width:0;padding:8px 10px;border:1px solid #d4dcdd;border-radius:9px;background:#fff;color:var(--ink)}
                #sam-world-engine .we-doc-list{display:grid;gap:7px}
                #sam-world-engine .we-doc-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 11px;border:1px solid #d9e1e1;border-radius:10px;background:#fafbf8}
                #sam-world-engine .we-doc-row>div{min-width:0}
                #sam-world-engine .we-doc-row b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #sam-world-engine .we-doc-row small{display:block;color:var(--sub);font-size:10px;margin-top:2px}
                #sam-world-engine .we-doc-badge{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;background:#e8f1ec;color:#4f7d6d;font:700 9px/1.6 system-ui}
                #sam-world-engine .we-doc-actions{display:flex;gap:5px}
                #sam-world-engine .we-doc-actions button,#sam-world-engine .we-segment-actions button{border:1px solid #d2dbdc;border-radius:7px;background:#fff;padding:5px 8px;color:#556579;font-size:10px}
                #sam-world-engine .we-doc-actions button:hover,#sam-world-engine .we-segment-actions button:hover{border-color:#b28a4a;color:#76592b;background:#fbf4e8}
                #sam-world-engine .we-segment-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px;color:var(--sub);font-size:11px}
                #sam-world-engine .we-segment-list{display:grid;gap:10px}
                #sam-world-engine .we-segment{border:1px solid #d3dddd;border-radius:12px;background:#fbfcf9;overflow:hidden}
                #sam-world-engine .we-segment-head{display:grid;grid-template-columns:minmax(140px,1fr) auto auto;gap:8px;align-items:center;padding:9px 10px;border-bottom:1px solid #dce4e4;background:#f1f5f2}
                #sam-world-engine .we-segment-head input{min-width:0;border:0;border-bottom:1px solid #c6d1d2;background:transparent;padding:4px 2px;font-weight:700;color:#31445d}
                #sam-world-engine .we-segment-head input:focus{outline:none;border-bottom-color:#b28a4a}
                #sam-world-engine .we-segment-head small{color:var(--sub);font-size:10px}
                #sam-world-engine .we-segment-actions{display:flex;gap:4px}
                #sam-world-engine .we-segment>summary{padding:12px;cursor:pointer;color:var(--we-ink)}
                #sam-world-engine .we-segment>.we-muted{margin:0;padding:9px 12px 11px;min-width:0;overflow-wrap:anywhere}
                #sam-world-engine .we-prompt-registry-meta{display:flex;flex-wrap:wrap;gap:4px 14px;min-width:0;padding:0 12px 10px}
                #sam-world-engine .we-prompt-registry-meta small{min-width:0;overflow-wrap:anywhere}
                #sam-world-engine .we-prompt-registry-item>.we-notice{margin:0 12px 10px}
                #sam-world-engine .we-segment textarea{display:block;width:100%;min-height:170px;height:210px;border:0;border-radius:0;background:#fff;padding:12px 13px;resize:vertical}
                /* ===== 世界引擎独立外观：跟随主神终端六色调；未设置时回退暗夜 ===== */
                ${WORLD_UI_THEME_CSS}
                #sam-world-engine[data-tone]{
                    --ink:var(--we-ink);--sub:var(--we-sub);--line:var(--we-line);--gold:var(--we-gold);--mint:var(--we-mint);
                    --we-chrome-ink:#f7fbff;--we-chrome-sub:#c9d3dd;--we-nav-ink:#d6dee7;
                    --we-chrome-control:#ffffff0d;--we-chrome-control-hover:#ffffff18;--we-chrome-border:#ffffff2d;
                    --we-fs-root:16px;--we-fs-body:15px;--we-fs-small:13px;--we-fs-tiny:13px;--we-fs-control:14px;
                    --we-fs-h1:29px;--we-fs-h2:19px;--we-fs-h3:16px;--we-fs-metric:26px;--we-fs-hero:32px;
                    background:var(--we-shell)!important;color:var(--we-ink)!important;border-color:var(--we-line)!important;
                    font-size:var(--we-fs-root)!important;line-height:1.72!important;text-rendering:optimizeLegibility;-webkit-font-smoothing:auto
                }
                #sam-world-engine[data-font-scale="large"]{
                    --we-fs-root:18px;--we-fs-body:17px;--we-fs-small:15px;--we-fs-tiny:14px;--we-fs-control:16px;
                    --we-fs-h1:33px;--we-fs-h2:22px;--we-fs-h3:18px;--we-fs-metric:30px;--we-fs-hero:35px
                }
                #sam-world-engine[data-font-scale="xlarge"]{
                    --we-fs-root:20px;--we-fs-body:19px;--we-fs-small:17px;--we-fs-tiny:15px;--we-fs-control:18px;
                    --we-fs-h1:36px;--we-fs-h2:24px;--we-fs-h3:20px;--we-fs-metric:34px;--we-fs-hero:39px
                }
                .we-causal{min-width:0;overflow-wrap:anywhere}
                .we-stability{display:flex;align-items:center;justify-content:space-between;gap:12px}
                .we-stability strong{display:block;font-size:var(--we-fs-hero);line-height:1.3;color:var(--we-ink)}
                .we-stability>span{font-size:var(--we-fs-small);color:var(--we-sub);text-align:right}
                .we-causal meter{display:block;width:100%;height:14px;margin:12px 0;accent-color:var(--we-mint)}
                .we-causal meter::-webkit-meter-bar{background:var(--we-card);border:1px solid var(--we-line);border-radius:9px}
                .we-causal meter::-webkit-meter-optimum-value{background:var(--we-mint)}
                .we-offset-heading,.we-offset-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
                .we-offset-heading{margin-top:16px;font-weight:600}
                .we-offset-heading span,.we-offset small{color:var(--we-sub);font-size:var(--we-fs-small)}
                .we-offset{margin-top:10px;padding:12px;border:1px solid var(--we-line);border-radius:12px;background:var(--we-card)}
                .we-offset-head span{flex-shrink:0;font-weight:700;color:var(--we-ink)}
                .we-offset p{margin:8px 0;font-size:var(--we-fs-body)}
                .we-offset-more summary{cursor:pointer;margin-top:12px;color:var(--we-ink)}
                #sam-world-engine[data-tone] header{background:linear-gradient(120deg,var(--we-head),var(--we-nav))!important;color:var(--we-chrome-ink)!important}
                #sam-world-engine[data-tone] .we-brand i{color:var(--we-action)!important}
                #sam-world-engine[data-tone] .we-brand small{color:var(--we-chrome-sub)!important}
                #sam-world-engine[data-tone] header button.we-btn{background:var(--we-chrome-control)!important;border-color:var(--we-chrome-border)!important;color:var(--we-chrome-ink)!important}
                #sam-world-engine[data-tone] header button.we-btn:hover{background:var(--we-chrome-control-hover)!important;border-color:var(--we-chrome-sub)!important}
                #sam-world-engine[data-tone] header button.we-primary{background:var(--we-action)!important;border-color:var(--we-action)!important;color:var(--we-action-ink)!important}
                #sam-world-engine[data-tone] nav{background:var(--we-nav)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] nav button{color:var(--we-nav-ink)!important}
                #sam-world-engine[data-tone] nav button:hover{background:var(--we-chrome-control-hover)!important;color:var(--we-chrome-ink)!important}
                #sam-world-engine[data-tone] nav button[aria-selected=true]{background:var(--we-action)!important;border-color:var(--we-action)!important;color:var(--we-action-ink)!important}
                #sam-world-engine[data-tone] main{background:var(--we-main)!important;color:var(--we-ink)!important}
                #sam-world-engine[data-tone] .we-hero,
                #sam-world-engine[data-tone] .we-section,
                #sam-world-engine[data-tone] .we-world-focus .we-section,
                #sam-world-engine[data-tone] .we-dashboard .we-section{background:var(--we-surface)!important;border-color:var(--we-line)!important;box-shadow:none!important}
                #sam-world-engine[data-tone] .we-card,
                #sam-world-engine[data-tone] .we-kpi,
                #sam-world-engine[data-tone] .we-kpi-compact .we-kpi,
                #sam-world-engine[data-tone] .we-explore-card,
                #sam-world-engine[data-tone] .we-faction-card,
                #sam-world-engine[data-tone] .we-doc-row,
                #sam-world-engine[data-tone] .we-segment,
                #sam-world-engine[data-tone] .we-book{background:var(--we-card)!important;border-color:var(--we-line)!important;color:var(--we-ink)!important}
                #sam-world-engine[data-tone] .we-card:hover,
                #sam-world-engine[data-tone] button.we-card:hover,
                #sam-world-engine[data-tone] .we-explore-card:hover,
                #sam-world-engine[data-tone] .we-faction-card:hover,
                #sam-world-engine[data-tone] .we-brief-row:hover,
                #sam-world-engine[data-tone] .we-person-compact:hover{background:var(--we-card-hover)!important}
                #sam-world-engine[data-tone] .we-card p,
                #sam-world-engine[data-tone] .we-person p,
                #sam-world-engine[data-tone] .we-pulse p,
                #sam-world-engine[data-tone] .we-next-node p,
                #sam-world-engine[data-tone] .we-explore-card p{color:var(--we-sub)!important}
                #sam-world-engine[data-tone] .we-kpi strong,
                #sam-world-engine[data-tone] .we-explore-score strong,
                #sam-world-engine[data-tone] .we-area-progress>strong{color:var(--we-ink)!important}
                #sam-world-engine[data-tone] .we-kpi small,
                #sam-world-engine[data-tone] .we-kpi span,
                #sam-world-engine[data-tone] .we-explore-head small,
                #sam-world-engine[data-tone] .we-explore-meta,
                #sam-world-engine[data-tone] .we-area-hero small{color:var(--we-sub)!important}
                #sam-world-engine[data-tone] .we-tools input,
                #sam-world-engine[data-tone] select,
                #sam-world-engine[data-tone] .we-config-row input,
                #sam-world-engine[data-tone] .we-doc-create input,
                #sam-world-engine[data-tone] .we-segment-head input,
                #sam-world-engine[data-tone] textarea,
                #sam-world-engine[data-tone] .we-setting-input{background:var(--we-input)!important;color:var(--we-ink)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-tools button,
                #sam-world-engine[data-tone] .we-doc-actions button,
                #sam-world-engine[data-tone] .we-segment-actions button,
                #sam-world-engine[data-tone] .we-setting-btn{background:var(--we-card)!important;color:var(--we-ink)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-tools button.active,
                #sam-world-engine[data-tone] .we-setting-btn.active{border-color:var(--we-accent)!important;color:var(--we-accent)!important;background:var(--we-accent-soft)!important}
                #sam-world-engine[data-tone] .we-empty{background:var(--we-card)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-empty b{color:var(--we-ink)!important}
                #sam-world-engine[data-tone] .we-notice{background:var(--we-notice)!important;color:var(--we-ink)!important;border-left-color:var(--we-gold)!important}
                #sam-world-engine[data-tone] footer{background:var(--we-nav)!important;color:var(--we-chrome-sub)!important}
                #sam-world-engine[data-tone] .we-timeline .we-card:before{border-color:var(--we-surface)!important}
                #sam-world-engine[data-tone] .we-timeline-group-title:after{background:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-explore-bar{background:color-mix(in srgb,var(--we-line) 70%,transparent)!important}
                #sam-world-engine[data-tone] .we-explore-bar>i{background:var(--we-mint)!important}
                #sam-world-engine[data-tone] .we-risk-badge{background:var(--we-input)!important;color:var(--we-sub)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-preset-toolbar{background:var(--we-surface)!important;border-color:var(--we-line)!important;box-shadow:none!important}
                #sam-world-engine[data-tone] .we-segment-head{background:var(--we-card)!important;border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-book-row,
                #sam-world-engine[data-tone] .we-brief-row,
                #sam-world-engine[data-tone] .we-section-head,
                #sam-world-engine[data-tone] .we-area-hero{border-color:var(--we-line)!important}
                #sam-world-engine[data-tone] .we-next-node>span{background:var(--we-action)!important;color:var(--we-action-ink)!important}
                #sam-world-engine[data-tone] button.we-next-node:hover{background:var(--we-card-hover)!important}
                #sam-world-engine[data-tone] .we-next-node small,
                #sam-world-engine[data-tone] .we-person-copy small,
                #sam-world-engine[data-tone] .we-link-btn,
                #sam-world-engine[data-tone] .we-explore-score span,
                #sam-world-engine[data-tone] .we-area-progress em,
                #sam-world-engine[data-tone] .we-rep b{color:var(--we-gold)!important}
                #sam-world-engine[data-tone] .we-timeline-group-title,
                #sam-world-engine[data-tone] .we-timeline-group-title small,
                #sam-world-engine[data-tone] .we-brief-row>span:last-child,
                #sam-world-engine[data-tone] .we-person-copy em,
                #sam-world-engine[data-tone] .we-area-progress>div>span{color:var(--we-sub)!important}
                #sam-world-engine[data-tone] .we-timeline-group-title small{background:var(--we-card)!important}
                #sam-world-engine[data-tone] .we-preset-toolbar b{color:var(--we-ink)!important}
                #sam-world-engine[data-tone] summary:hover{color:var(--we-accent)!important}
                #sam-world-engine[data-tone] .we-card.is-jump{outline-color:var(--we-action)!important;background:var(--we-accent-soft)!important}
                /* 全面フォントサイズシステム：フォントサイズ設定は root のフォントサイズを継承するボタンだけでなく、パネル全体に作用させる必要がある */
                #sam-world-engine[data-tone] main{font-size:var(--we-fs-body)!important}
                #sam-world-engine[data-tone] .we-brand{font-size:var(--we-fs-h3)!important;line-height:1.2!important}
                #sam-world-engine[data-tone] .we-hero .we-date{font-size:var(--we-fs-h3)!important;line-height:1.45!important}
                #sam-world-engine[data-tone] .we-world-ranks{font-size:var(--we-fs-small)!important}
                #sam-world-engine[data-tone] header button,
                #sam-world-engine[data-tone] nav button,
                #sam-world-engine[data-tone] main button,
                #sam-world-engine[data-tone] main input,
                #sam-world-engine[data-tone] main select,
                #sam-world-engine[data-tone] main textarea{font-size:var(--we-fs-control)!important}
                #sam-world-engine[data-tone] h1{font-size:var(--we-fs-h1)!important;line-height:1.28!important}
                #sam-world-engine[data-tone] h2{font-size:var(--we-fs-h2)!important;line-height:1.35!important}
                #sam-world-engine[data-tone] h3,
                #sam-world-engine[data-tone] .we-explore-head h3,
                #sam-world-engine[data-tone] .we-faction-card .we-card-top h3,
                #sam-world-engine[data-tone] .we-area-hero h3{font-size:var(--we-fs-h3)!important;line-height:1.4!important}
                #sam-world-engine[data-tone] main p,
                #sam-world-engine[data-tone] .we-card p,
                #sam-world-engine[data-tone] .we-person p,
                #sam-world-engine[data-tone] .we-pulse p,
                #sam-world-engine[data-tone] .we-next-node p,
                #sam-world-engine[data-tone] .we-explore-card p,
                #sam-world-engine[data-tone] .we-prose,
                #sam-world-engine[data-tone] .we-area-note,
                #sam-world-engine[data-tone] .we-rep{font-size:var(--we-fs-body)!important;line-height:1.68!important}
                #sam-world-engine[data-tone] .we-muted,
                #sam-world-engine[data-tone] dl,
                #sam-world-engine[data-tone] summary,
                #sam-world-engine[data-tone] .we-meta,
                #sam-world-engine[data-tone] .we-hero .we-date small,
                #sam-world-engine[data-tone] .we-metric small,
                #sam-world-engine[data-tone] .we-section-head small,
                #sam-world-engine[data-tone] .we-date-filter,
                #sam-world-engine[data-tone] .we-brief-row>b,
                #sam-world-engine[data-tone] .we-person-copy strong,
                #sam-world-engine[data-tone] .we-book-title small,
                #sam-world-engine[data-tone] .we-read-state,
                #sam-world-engine[data-tone] .we-segment-toolbar{font-size:var(--we-fs-small)!important}
                #sam-world-engine[data-tone] small,
                #sam-world-engine[data-tone] footer,
                #sam-world-engine[data-tone] .we-brand small,
                #sam-world-engine[data-tone] nav .we-navtitle,
                #sam-world-engine[data-tone] .we-eyebrow,
                #sam-world-engine[data-tone] .we-pill,
                #sam-world-engine[data-tone] .we-change time,
                #sam-world-engine[data-tone] .we-days span,
                #sam-world-engine[data-tone] .we-pulse-mark,
                #sam-world-engine[data-tone] .we-timeline-group-title,
                #sam-world-engine[data-tone] .we-timeline-group-title small,
                #sam-world-engine[data-tone] .we-next-node small,
                #sam-world-engine[data-tone] .we-brief-row>span:last-child,
                #sam-world-engine[data-tone] .we-person-copy small,
                #sam-world-engine[data-tone] .we-person-copy em,
                #sam-world-engine[data-tone] .we-link-btn,
                #sam-world-engine[data-tone] .we-explore-head small,
                #sam-world-engine[data-tone] .we-risk-badge,
                #sam-world-engine[data-tone] .we-explore-score strong small,
                #sam-world-engine[data-tone] .we-explore-score span,
                #sam-world-engine[data-tone] .we-explore-meta,
                #sam-world-engine[data-tone] .we-area-hero small,
                #sam-world-engine[data-tone] .we-area-progress>div>span,
                #sam-world-engine[data-tone] .we-preset-toolbar small,
                #sam-world-engine[data-tone] .we-doc-row small,
                #sam-world-engine[data-tone] .we-doc-badge,
                #sam-world-engine[data-tone] .we-segment-head small,
                #sam-world-engine[data-tone] .we-setting-copy small,
                #sam-world-engine[data-tone] .we-api-grid label,
                #sam-world-engine[data-tone] .we-source-badge{font-size:var(--we-fs-tiny)!important;line-height:1.55!important}
                #sam-world-engine[data-tone] .we-kpi strong,
                #sam-world-engine[data-tone] .we-explore-score strong{font-size:var(--we-fs-metric)!important}
                #sam-world-engine[data-tone] .we-area-progress>strong{font-size:var(--we-fs-hero)!important}
                #sam-world-engine[data-tone] textarea.we-raw{font-size:var(--we-fs-small)!important}
                #sam-world-engine[data-tone] .we-person strong,
                #sam-world-engine[data-tone] .we-preset-toolbar b,
                #sam-world-engine[data-tone] .we-setting-copy b{font-size:var(--we-fs-body)!important}
                #sam-world-engine[data-tone] .we-doc-actions button,
                #sam-world-engine[data-tone] .we-segment-actions button{font-size:var(--we-fs-tiny)!important}
                /* エリア記録の説明カードはテーマに追従させ、暗色時に目に痛い白枠とグレー文字が出るのを避ける */
                #sam-world-engine[data-tone] .we-area-note{
                    background:var(--we-input)!important;color:var(--we-ink)!important;border:1px solid var(--we-line)!important;
                    font-weight:500!important
                }
                /* 設定ページ */
                #sam-world-engine .we-setting-row{display:grid;grid-template-columns:minmax(150px,1fr) minmax(220px,1.2fr);gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid var(--we-line,var(--line))}
                #sam-world-engine .we-setting-row:last-child{border-bottom:0}
                #sam-world-engine .we-setting-copy b{display:block;font-size:14px}
                #sam-world-engine .we-setting-copy small{display:block;color:var(--we-sub,var(--sub));font-size:11px;margin-top:3px}
                #sam-world-engine .we-setting-actions{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap}
                #sam-world-engine .we-setting-btn{border:1px solid var(--we-line,var(--line));border-radius:8px;padding:7px 10px}
                #sam-world-engine .we-api-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}
                #sam-world-engine .we-api-grid label{display:flex;flex-direction:column;gap:5px;color:var(--we-sub,var(--sub));font-size:11px}
                #sam-world-engine .we-api-grid label.wide{grid-column:1/-1}
                #sam-world-engine .we-setting-input{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--we-line,var(--line));border-radius:8px}
                #sam-world-engine .we-api-toolbar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:10px 0}
                #sam-world-engine .we-api-toolbar select,#sam-world-engine .we-api-toolbar input{min-width:160px;flex:1}
                #sam-world-engine .we-source-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 9px;border-radius:999px;border:1px solid var(--we-line,var(--line));background:var(--we-card,#fff);font-size:11px}
                #sam-world-engine .we-source-badge:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--we-mint,var(--mint))}
                #sam-world-engine .we-switch{display:inline-flex;align-items:center;gap:8px}
                #sam-world-engine .we-switch-track{width:42px;height:23px;border-radius:999px;background:var(--we-line,var(--line));padding:3px;transition:background .15s}
                #sam-world-engine .we-switch-track i{display:block;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .15s}
                #sam-world-engine .we-switch.on .we-switch-track{background:var(--we-accent,var(--gold))}
                #sam-world-engine .we-switch.on .we-switch-track i{transform:translateX(19px)}
                @media(max-width:1100px){
                    #sam-world-engine .we-world-focus{grid-template-columns:1fr}
                    #sam-world-engine .we-dashboard{grid-template-columns:1fr}
                    #sam-world-engine .we-explore-layout{grid-template-columns:1fr}
                    #sam-world-engine .we-area-side{position:static}
                    #sam-world-engine .we-command-side{position:static;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
                    #sam-world-engine .we-command-side>.we-section{margin-bottom:0}
                    #sam-world-engine .we-calendar-layout{grid-template-columns:minmax(220px,260px) minmax(0,1fr)}
                }
                @media(max-width:760px){
                    #sam-world-engine{--we-safe-top:max(env(safe-area-inset-top,0px),24px);--we-safe-right:env(safe-area-inset-right,0px);--we-safe-bottom:env(safe-area-inset-bottom,0px);--we-safe-left:env(safe-area-inset-left,0px);inset:0!important;height:100vh!important;height:100dvh!important;border-radius:0}
                    #sam-world-engine header{padding:var(--we-safe-top) max(12px,var(--we-safe-right)) 0 max(12px,var(--we-safe-left));height:calc(56px + var(--we-safe-top));min-height:calc(56px + var(--we-safe-top));gap:6px}
                    #sam-world-engine .we-brand{font-size:13px;letter-spacing:1px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                    #sam-world-engine .we-brand small{display:none}
                    #sam-world-engine nav{padding:7px max(9px,var(--we-safe-right)) 7px max(9px,var(--we-safe-left));min-height:46px}
                    #sam-world-engine nav button{padding:7px 10px}
                    #sam-world-engine nav button .we-tab-icon{display:none}
                    #sam-world-engine main{padding:12px max(10px,var(--we-safe-right)) calc(24px + var(--we-safe-bottom)) max(10px,var(--we-safe-left))}
                    #sam-world-engine .we-hero{align-items:flex-start;padding:14px}
                    #sam-world-engine h1{font-size:21px}
                    #sam-world-engine .we-hero .we-date{min-width:105px;font-size:11px}
                    #sam-world-engine .we-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
                    #sam-world-engine .we-explore-grid,#sam-world-engine .we-faction-grid{grid-template-columns:1fr}
                    #sam-world-engine .we-preset-toolbar{align-items:flex-start}
                    #sam-world-engine .we-doc-create{grid-template-columns:1fr 1fr}
                    #sam-world-engine .we-doc-create input{grid-column:1/-1}
                    #sam-world-engine .we-doc-row{grid-template-columns:1fr}
                    #sam-world-engine .we-doc-actions{flex-wrap:wrap}
                    #sam-world-engine .we-segment-head{grid-template-columns:1fr auto}
                    #sam-world-engine .we-segment-head small{display:none}
                    #sam-world-engine .we-segment-actions{grid-column:1/-1}
                    #sam-world-engine .we-command-side{display:block}
                    #sam-world-engine .we-command-side>.we-section{margin-bottom:10px}
                    #sam-world-engine .we-calendar-layout{grid-template-columns:1fr}
                    #sam-world-engine .we-calendar-slot{position:static}
                    #sam-world-engine .we-grid{grid-template-columns:1fr}
                    #sam-world-engine .we-section{padding:13px}
                    #sam-world-engine footer{padding:7px max(10px,var(--we-safe-right)) calc(7px + var(--we-safe-bottom)) max(10px,var(--we-safe-left))}
                    #sam-world-engine footer small{display:none}
                    #sam-world-engine .we-setting-row{grid-template-columns:1fr}
                    #sam-world-engine .we-setting-actions{justify-content:flex-start}
                    #sam-world-engine .we-api-grid{grid-template-columns:1fr}
                    #sam-world-engine .we-api-grid label.wide{grid-column:auto}
                }
                @media(max-height:400px){
                    #sam-world-engine header{height:calc(40px + var(--we-safe-top,0px));min-height:calc(40px + var(--we-safe-top,0px))}
                    #sam-world-engine nav{padding:3px 8px;min-height:36px}
                    #sam-world-engine footer{padding:2px 12px}
                    #sam-world-engine main{padding:8px}
                }
            `;
        return css;
    }
    class WorldHostAdapter {
        constructor(engine){this.engine=engine;}
        resolve(name){
            const engine=this.engine;
            for(const obj of [engine.env,engine.host,engine.host?.TavernHelper]){
                if(obj&&typeof obj[name]==='function')return obj[name].bind(obj);
            }
            return null;
        }
    }
    class WorldEngineConfigService {
        constructor(engine){this.engine=engine;}
        defaults(){
            return {
                enabled:false,
                preset:DEFAULT_PRESET,
                corePrompt:CORE_WORLD_RULES,
                macroPrompt:DEFAULT_MACRO_PROMPT,
                stabilityPromptTemplate:DEFAULT_STABILITY_PROMPT_TEMPLATE,
                retryAttempts:5,
                temperature:0.3,
                fallbackModel:'',
                requireMacroBackbone:true,
                presetEditorVersion:0,
                promptDocuments:[],
                fontScale:'standard',
                sendHistoryToProse:false,
                dedicatedApi:{enabled:false,apiUrl:'',apiKey:'',model:'',apiPresets:[],fetchedModels:[]}
            };
        }
        isConfigured(){return !!this.engine.config.enabled;}
        isAvailable(){
            const engine=this.engine;
            if(engine.usesDedicatedApi())return engine.dedicatedApiReady();
            const terminal=engine.host.Samsara&&engine.host.Samsara.terminal;
            return !!(terminal&&typeof terminal.apiReady==='function'&&terminal.apiReady());
        }
        isEnabled(){return this.isConfigured()&&this.isAvailable();}
        setEnabled(value){
            const engine=this.engine,on=!!value;
            engine.config.enabled=on;
            if(on&&!engine.usesDedicatedApi()){
                const terminal=engine.host.Samsara&&engine.host.Samsara.terminal;
                if(terminal&&typeof terminal.enableApi==='function')terminal.enableApi();
            } else if(!on) {
                engine.cancel();
                if(engine.isOpen())engine.close();
            }
            this.save();
            engine.status=on?(this.isAvailable()?"世界進行を有効にしました":(engine.usesDedicatedApi()?"世界進行を有効にしました · 専用 API 設定待ち":"世界進行を有効にしました · 追加モデル設定待ち")):"世界進行を無効にしました";
            engine.render();
            return this.isEnabled();
        }
        save(){
            const engine=this.engine;
            try{engine.host.localStorage?.setItem?.(CONFIG,JSON.stringify(engine.config));}catch(_){}
            return engine.config;
        }
        initialize(){
            const engine=this.engine,config=this.defaults();
            engine.config=config;
            try{Object.assign(config,JSON.parse(engine.host.localStorage.getItem(CONFIG)||'{}'));}catch(_){}
            const hadLegacyTone=Object.hasOwn(config,'tone');
            delete config.tone;
            if(Number(config.presetEditorVersion||0)<2)config.preset=ensurePresetStructure(config.preset);
            else config.preset=normalizeEditablePreset(config.preset);
            config.presetEditorVersion=2;
            if(typeof config.corePrompt!=='string')config.corePrompt=CORE_WORLD_RULES;
            if(typeof config.macroPrompt!=='string')config.macroPrompt=DEFAULT_MACRO_PROMPT;
            if(typeof config.stabilityPromptTemplate!=='string')config.stabilityPromptTemplate=DEFAULT_STABILITY_PROMPT_TEMPLATE;
            if(!Array.isArray(config.promptDocuments))config.promptDocuments=[];
            config.promptDocuments=config.promptDocuments
                .filter(doc=>plain(doc)&&typeof doc.name==='string'&&plain(doc.settings)&&typeof doc.settings.preset==='string'&&doc.id!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.id&&doc.name!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.name)
                .slice(0,58);

            if(plain(config.userDefaultPromptSettings)&&typeof config.userDefaultPromptSettings.preset==='string'){
                const source=config.userDefaultPromptSettings;
                const legacySettings={
                    corePrompt:typeof source.corePrompt==='string'?source.corePrompt:CORE_WORLD_RULES,
                    macroPrompt:typeof source.macroPrompt==='string'?source.macroPrompt:DEFAULT_MACRO_PROMPT,
                    stabilityPromptTemplate:typeof source.stabilityPromptTemplate==='string'?source.stabilityPromptTemplate:DEFAULT_STABILITY_PROMPT_TEMPLATE,
                    npcAuditPrompt:typeof source.npcAuditPrompt==='string'?source.npcAuditPrompt:undefined,
                    structurePrompt:typeof source.structurePrompt==='string'?source.structurePrompt:undefined,
                    preset:normalizeEditablePreset(source.preset),
                    contextTurns:Math.max(1,Math.min(100,Number(source.contextTurns)||3)),
                    activationMode:source.activationMode==='force_selected'?'force_selected':'respect_activation',
                    selectedEntries:Array.isArray(source.selectedEntries)?copy(source.selectedEntries):null
                };
                const personal=config.promptDocuments.find(doc=>doc.id===USER_DEFAULT_PROMPT_DOCUMENT_ID);
                if(!personal)config.promptDocuments.unshift({
                    id:USER_DEFAULT_PROMPT_DOCUMENT_ID,type:'samsara-world-prompt-document',version:1,builtin:false,
                    name:"個人用デフォルト設定",createdAt:'',updatedAt:'',settings:copy(legacySettings)
                });
            }

            config.promptDocuments=config.promptDocuments.filter(doc=>doc.id!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.id).slice(0,59);
            config.promptDocuments.unshift(copy(BUILTIN_DEFAULT_PROMPT_DOCUMENT));

            const appliedVersion=Number(config.builtinDefaultPromptVersionApplied||0);
            if(appliedVersion<BUILTIN_DEFAULT_PROMPT_VERSION){
                const shouldApply=appliedVersion===0||config.activePromptDocumentId===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id;
                if(shouldApply){
                    const settings=BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings;
                    config.corePrompt=settings.corePrompt===undefined?CORE_WORLD_RULES:settings.corePrompt;
                    config.macroPrompt=settings.macroPrompt===undefined?DEFAULT_MACRO_PROMPT:settings.macroPrompt;
                    config.stabilityPromptTemplate=settings.stabilityPromptTemplate===undefined?DEFAULT_STABILITY_PROMPT_TEMPLATE:settings.stabilityPromptTemplate;
                    config.npcAuditPrompt=settings.npcAuditPrompt===undefined?NPC_BUILD_AUDIT_RULES:settings.npcAuditPrompt;
                    config.structurePrompt=settings.structurePrompt===undefined?WORLD_RESULT_CONTRACT.instruction():settings.structurePrompt;
                    config.preset=normalizeEditablePreset(settings.preset);
                    config.presetEditorVersion=2;
                    config.contextTurns=settings.contextTurns;
                    config.activationMode=settings.activationMode;
                    config.selectedEntries=copy(settings.selectedEntries);
                    config.activePromptDocumentId=BUILTIN_DEFAULT_PROMPT_DOCUMENT.id;
                    config.builtinDefaultWorldbookExclusionsApplied=[];
                }
                config.builtinDefaultPromptVersionApplied=BUILTIN_DEFAULT_PROMPT_VERSION;
                this.save();
            }

            const retryLimit=Number(config.retryAttempts);
            config.retryAttempts=Math.max(1,Math.min(5,Number.isFinite(retryLimit)?retryLimit:5));
            const temperature=Number(config.temperature);
            config.temperature=Math.max(0,Math.min(2,Number.isFinite(temperature)?temperature:0.3));
            config.fallbackModel=String(config.fallbackModel||'').trim().slice(0,160);
            if(!config.retryDefaultFiveMigrated){
                if(config.retryAttempts===3)config.retryAttempts=5;
                config.retryDefaultFiveMigrated=true;
                this.save();
            }

            if(!Object.hasOwn(config,'requireMacroBackbone'))config.requireMacroBackbone=true;
            if(!['standard','large','xlarge'].includes(config.fontScale))config.fontScale='standard';
            config.sendHistoryToProse=config.sendHistoryToProse===true;
            config.dedicatedApi=engine.normalizeDedicatedApi(config.dedicatedApi);
            engine.apiModeCache={};
            if(hadLegacyTone)this.save();

            if(config.enabled&&!engine.usesDedicatedApi()){
                const terminal=engine.host.Samsara&&engine.host.Samsara.terminal;
                if(terminal&&typeof terminal.enableApi==='function')terminal.enableApi();
            }
            return config;
        }
    }
    class WorldRunScheduler {
        constructor(engine){this.engine=engine;}
        cancel(){
            const e=this.engine;
            ++e.generation;
            e.pending=false;
            clearTimeout(e.timer);
            if(e.controller)e.controller.abort();
        }
        schedule(){
            const e=this.engine;
            if(e.disposed||e.committing||!e.isEnabled())return;
            if(e.busy){e.pending=true;return;}
            clearTimeout(e.timer);
            e.timer=setTimeout(()=>e.run().catch(()=>{}),900);
        }
    }
    class SamsaraWorldEngine {
        constructor(host, env) {
            this.host = host; this.env = env || host; this.version=WORLD_ENGINE_VERSION; this.unsub = []; this.generation = 0;
            this.busy = false; this.committing = false; this.disposed = false; this.tab = "概要"; this.status = "待機";
            this.lastRequest=null; this.previewRequest=null; this.lastReply=''; this.lastFailure='';
            this.lastRetryLog=[]; this.lastAttemptCount=0; this.lastAttemptTelemetry=[]; this.lastTransportInfo=null; this.lastWorldResult=null; this.lastCompiledPatches=[]; this.lastCompileWarnings=[];
            this.hostAdapter=new WorldHostAdapter(this);
            this.configService=new WorldEngineConfigService(this);
            this.config=this.configService.initialize();
        }
        fn(name) { return this.hostAdapter.resolve(name); }
        notifyFailure(message){return this.runOrchestrator().notifyFailure(message);}
        snapshot() {
            const service=this.services?.context||new WorldRuntimeContextService(this);
            return service.snapshot();
        }
        blocked(snapshot) {
            const service=this.services?.context||new WorldRuntimeContextService(this);
            return service.blocked(snapshot);
        }
        saveConfig() { return this.configService.save(); }
        transportService(){return this._apiTransport||(this._apiTransport=new WorldApiTransportService(this));}
        normalizeDedicatedApi(value){return this.transportService().normalize(value);}
        usesDedicatedApi(){return this.transportService().usesDedicated();}
        dedicatedApiReady(){return this.transportService().ready();}
        apiSourceLabel(){return this.transportService().sourceLabel();}
        setDedicatedApi(patch){return this.transportService().set(patch);}
        saveDedicatedApiPreset(name){return this.transportService().savePreset(name);}
        deleteDedicatedApiPreset(name){return this.transportService().deletePreset(name);}
        applyDedicatedApiPreset(name){return this.transportService().applyPreset(name);}
        dedicatedEndpoint(kind='chat'){return this.transportService().endpoint(kind);}
        fetchDedicatedModels(){return this.transportService().fetchModels();}
        structuredUnsupported(status,body){return this.transportService().structuredUnsupported(status,body);}
        requestDedicatedApi(system,input,options={}){return this.transportService().requestDedicated(system,input,options);}
        requestAI(system,input,options={}){return this.transportService().request(system,input,options);}
        setPreset(text){return this.promptDocumentService().setPreset(text);}
        readPromptEditor(){return this.promptWorkspace?.readSettings?.()||this.promptDocumentService().currentSettings();}
        applyPromptSettings(settings){return this.promptDocumentService().applySettings(settings);}
        promptDocumentService(){return this._promptDocuments||(this._promptDocuments=new WorldPromptDocumentService(this));}
        getPromptDocuments(){return this.promptDocumentService().list();}
        savePromptDocument(name,settings,activate=true){return this.promptDocumentService().save(name,settings,activate);}
        deletePromptDocument(id){return this.promptDocumentService().remove(id);}
        importPromptDocument(raw){return this.promptDocumentService().import(raw);}
        exportPromptDocument(id){return this.promptDocumentService().export(id);}
        isConfigured(){return this.configService.isConfigured();}
        isAvailable(){return this.configService.isAvailable();}
        isEnabled(){return this.configService.isEnabled();}
        setEnabled(value){return this.configService.setEnabled(value);}
        runScheduler(){return this.services?.runScheduler||this._runScheduler||(this._runScheduler=new WorldRunScheduler(this));}
        cancel(){return this.runScheduler().cancel();}
        applyBuiltinDefaultWorldbookExclusions(catalogue){const service=this.services?.knowledge||new WorldKnowledgeService(this);return service.applyBuiltinDefaultWorldbookExclusions(catalogue);}
        async catalogue() {
            const service=this.services?.knowledge||new WorldKnowledgeService(this);
            return service.catalogue();
        }
        async worldbook(scan='', options={}) {
            const service=this.services?.knowledge||new WorldKnowledgeService(this);
            return service.worldbook(scan,options);
        }
        async buildRequest(base) {
            const service=this.services?.requestBuilder||new WorldRequestBuilder(this);
            return service.build(base);
        }
        schedule(){return this.runScheduler().schedule();}
        runOrchestrator(){return this.services?.run||this._runOrchestrator||(this._runOrchestrator=new WorldRunOrchestrator(this));}
        async run(options={}){return this.runOrchestrator().execute(options);}
        getState() {
            const service=this.services?.context||new WorldRuntimeContextService(this);
            return service.backendState();
        }
        resetInspection(){return this.runOrchestrator().resetInspection();}
        statusTone(){return this.services?.panelRenderer?.statusTone?.()||'night';}
        syncStatusTone(){return this.services?.panelRenderer?.syncStatusTone?.()||this.statusTone();}
        init() { return this.services?.applicationLifecycle?.init?.(); }
        isOpen() { return this.services?.applicationLifecycle?.isOpen?.()??false; }
        open() { return this.services?.applicationLifecycle?.open?.(); }
        close() { return this.services?.applicationLifecycle?.close?.(); }
        toggle() { return this.services?.applicationLifecycle?.toggle?.(); }
        createPanel() { return this.services?.panelController?.createPanel?.(); }
        render(force=false) { return this.services?.panelRenderer?.render?.(force); }
        dispose() { return this.services?.applicationLifecycle?.dispose?.(); }
    }
    class WorldEngineLifecycleController {
        constructor(engine){this.engine=engine;}
        init() {
            const e=this.engine,on=e.fn('eventOn');
            const mvu=e.env.Mvu||e.host.Mvu;
            if(!on||!mvu||!mvu.events){
                e.initTimer=setTimeout(()=>{if(!e.disposed)e.init();},500);
                return;
            }
            const bind=(event,callback)=>{
                if(!event)return;
                const off=on(event,callback);
                if(typeof off==='function')e.unsub.push(off);
                else if(off&&off.stop)e.unsub.push(()=>off.stop());
            };
            bind(mvu.events.VARIABLE_UPDATE_ENDED,(variables,before)=>{
                if(e.committing||e.host.__samsaraUIMutation||e.env.__samsaraUIMutation||e.host.parent?.__samsaraUIMutation)return;
                try{
                    const snapshot=e.snapshot();
                    if(plain(variables?.stat_data))snapshot.stat=variables.stat_data;
                    if(e.blocked(snapshot))e.cancel();
                }catch(_){}
                e.render();
                e.schedule();
            });
            const events=e.env.tavern_events||e.host.tavern_events||{};
            for(const key of ['CHAT_CHANGED','MESSAGE_SWIPED','MESSAGE_DELETED']){
                bind(events[key],()=>{
                    e.cancel();
                    e.resetInspection();
                    e.status="コンテキスト切替済み";
                    e.render();
                });
            }
            e.keyHandler=event=>{
                if(event.key==='Escape'&&this.isOpen()){
                    event.stopImmediatePropagation();
                    this.close();
                }
            };
            e.host.document.addEventListener('keydown',e.keyHandler,true);
        }
        isOpen(){const e=this.engine;return !!e.panel&&!e.panel.hidden;}
        open(){
            const e=this.engine;
            if(this.isOpen())return;
            e.createPanel();
            const terminal=e.host.Samsara&&e.host.Samsara.terminal;
            if(terminal)e.returnState=terminal.suspend();
            e.panel.hidden=false;
            e.render();
        }
        close(){
            const e=this.engine;
            e.promptEditing=false;
            if(!this.isOpen())return;
            e.panel.hidden=true;
            const terminal=e.host.Samsara&&e.host.Samsara.terminal;
            if(terminal)terminal.restore(e.returnState);
            e.returnState=null;
        }
        toggle(){return this.isOpen()?this.close():this.open();}
        dispose(){
            const e=this.engine;
            this.close();
            e.disposed=true;
            e.cancel();
            clearTimeout(e.initTimer);
            e.unsub.forEach(off=>off());
            e.unsub=[];
            if(e.keyHandler)e.host.document.removeEventListener('keydown',e.keyHandler,true);
            if(e.panel)e.panel.remove();
            if(e.style)e.style.remove();
            if(e.mount)e.mount.remove();
        }
    }
    // Canonical editable prompt defaults and built-in prompt migrations.
    // Moved from legacy world-engine source parts; behavior intentionally unchanged.

    // Legacy NPC audit prompt retained only to migrate older prompt documents/config defaults.
    const NPC_BUILD_AUDIT_RULES=`【キャラクター管理・NPC 構成監査】
“角色管理.NPC构筑审计”に列挙された既存 NPC のみを扱います。目的は実ギャップの補完であり、難易度を上げたりキャラを作り直したりすることではありません。
1. 人物の階層、HP_MAX/EP_MAX は変更しません。完成済みの構成要素は上書きせず、改名によって重複能力を作り出しません。
2. 最低構成：雑兵=血統1/装備1/技能は0可；精鋭=血統1/装備2/技能1；Boss=血統1/装備3/技能2；上限は血統2/装備6/技能4。精鋭は殺傷・生存・機動/制御を備え、Bossはさらに段階または形態の仕組みを持ちます。
3. 能力は主要コンポーネントのいずれかひとつにのみ帰属します：血統=本体条件、装備=実体、技能=実行方式、状態=現在の結果、形態=独立した戦闘モード。
4. WorldResult.关系 のみを使用して既存 NPCを更新し、新規/修正項目のみを提出します。真属性・最終属性・強化キャッシュを出力してはなりません。血統/形態の五属性はすべて揃える必要があり、技能には基礎/派生属性を書きません。
5. 効果は決算可能でなければならず、ランダム確率の詞条は書きません。各監査対象について、既存の身分・職業・階層・既に演出された能力と整合するギャップを少なくともひとつ修正し、資料が不足している場合は最小限の補完を行います。`;

    // ---- migrated from script/world-engine-src/55-npc-narrative-audit.part.js ----
    // NPC 构筑份量与生命层级解耦：份量由人物资料中的剧情定位决定，层级只描述本体强度。
    const NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT=`【キャラクター管理 · NPC 構成監査】
「角色管理.NPC构筑审计」に列挙された既存 NPC だけを処理します。目的は実際の不足を補うことであり、難易度・階層の変更や人物の作り直しではありません。
1. 監査級は人物の階層から独立した世界進行の非公開情報です。「世界.バックステージ.人物.監査級」だけに保存し、関係リストや NPC の公開画面には書きません。新規の仲間以外の NPC が初めて非公開の人物記録に入る際、物語上の身分・重要性・描写済みの能力・遭遇の必要性に従って雑兵級・精鋭級・首領/Boss級を設定します。活動中の異端の初期値は首領/Boss級です。仲間は分類せず監査対象にも含めません。
2. 有効な監査級があれば優先して維持します。重要な力の獲得・喪失、戦闘上の役割、物語上の地位が実質的に変わった場合だけ WorldResult.人物 で変更します。通常の負傷、単発の勝敗、一時的な状態、階層の高低だけでは変更しません。旧記録・未記入の場合はプログラムが異端の身分と既存の身分・職業・背景・態度から補助推定します。
3. 最低構成：雑兵は血統 1・装備 2・技能 1、精鋭は血統 1・装備 4・技能 2、Boss は血統 1・装備 6・技能 4。血統は原則 1 件で、明確な複数血統の設定がある場合だけ増やします。装備・技能は設定に応じて最低数を超えてよいものの、分割・複製・同義能力の積み増しで数を合わせません。装備数は状態=1 の装備中の物だけを数え、0/2 は除外します。
4. 監査で追加する装備は一律に状態=1 とします。0 は物語で明示された携行中の未装備品、2 は倉庫の品だけに使い、最低数を満たすためには使いません。
5. 精鋭には攻撃・生存・移動または制御の手段が必要です。Boss にはさらに段階・形態・状態の切り替え、または同等の戦闘機構が必要です。
6. 能力は主要な構成要素 1 つにだけ所属させます。血統は本体条件、装備は実体、技能は実行方法、状態は現在の結果、形態は独立した戦闘モードです。
7. 構成補充は WorldResult.关系 だけで既存 NPC を更新し、監査級は WorldResult.人物 だけで非公開記録に書きます。追加・修正分だけを提出し、真属性・最終属性・強化キャッシュは出力しません。血統・形態の五属性はすべて必要で、技能には基礎・派生属性を書きません。
8. 効果は精算可能にし、確率任せの効果は記述しません。監査対象ごとに、既存の身分・職業・物語上の立場・階層・描写済み能力と整合する不足を最低 1 件補い、資料不足なら最小限の補充にします。`;

    // 审计新增装备默认状态=1的编译规则已迁移至 WorldNpcAuditService。

    // 默认审计提示词迁移由 WorldNpcAuditPromptFeature.initialize() 负责。


    // ---- migrated from script/world-engine-src/57-task-awareness.part.js ----
    // 任务感知层：任务.列表是现有 MVU 的唯一正式任务账簿；世界引擎只读消费，不建立第二套后台任务库。
    const TASK_AWARENESS_RULES=`【任務の参照・読み取り専用】
任務一覧は世界の因果の入力源の一つである。世界進行は任務の作成・削除・修正、状態の進行、納品、精算、報酬の付与を行わない。任務の影響は事件・人物の行動・勢力と地区・探索・伝播を通じて表す。事件の「关联任务」には、現在の任務.リストに存在する任務名だけを因果の出典として指定できる。
情報取引の生成・更新は世界エンジンが担当する。購入・引き落とし・消費による削除・購入後の任務作成は MVU または変数 AI が処理し、世界エンジンは次回その結果を読み取る。インスタンス実績・撃破・報酬・罰則は世界進行のコンテキストに含めない。`;
    const TASK_WORLD_BOOK_TITLE="任務と依頼のシステム";
    // 旧版曾把正式任务规则从内置默认资料中排除；现在恢复为可读取的权威规则。
    BUILTIN_DEFAULT_WORLD_BOOK_EXCLUSIONS.delete(TASK_WORLD_BOOK_TITLE);

    // 任务只读投影与事件关联校验已迁移至 WorldTaskAwarenessService。\n\n    // 请求、世界书目录恢复已迁移至 WorldTaskAwarenessFeature。


    // ---- migrated from script/world-engine-src/58-chronology-guard.part.js ----
    // 原著/数据库时间轴保护层：宏观节点先服从权威时间资料，再展开区间细节。
    const CHRONOLOGY_GUARD_RULES=`【原作・データベースの物語時間軸制約】
1. 原作・公式資料は介入がない場合の既定の未来を定め、変更不能なシナリオではありません。確定した事実と因果変動が本筋を変えるほどではない場合、作品で現在進む物語を優先して継続し、その後で新しい世界事件を広げます。
2. 発生済みの事実が絶対優先で、原作知識による上書きはできません。世界書・データベースが大局事件の日を明示する場合、その日付は厳密な制約です。確定した物語が日付・成立条件・発生の有無を変え、因果.偏移 の記録がその節目を明示している場合だけ、日程変更・取消・再構成できます。
3. 原作が月・季節・時間帯・事件の順序・条件付き展開・傾向・おおよその間隔だけを示す場合、同じ時間精度を維持して原作の進行に従い、未確定部分を慎重に残します。これらは柔軟な制約であり、並べ替えのために日単位の日付を捏造したり、妥当な推定の差で再試行を繰り返したりしません。
4. 原作の流れは維持されますが強制的な修正力はありません。プレイヤーや世界が救出・殺害・阻止・破壊・条件変更をすでに行った場合、影響する節目だけを再構成し、影響しない原作の展開は存続します。原作への回帰を理由とする同等の死、代替事故、根拠のない復活、その他の運命補償は禁止です。
5. まず「<user> が今から介入しなければ、原作・公式の展開として何が最も自然に起こるか」を判断し、「現在の世界時間 → 次の大局的な節目」の妥当な時間境界を決め、その区間内で現在事件・直近の節目を生成します。先に独自の危機を作り、そこから近すぎる日付を逆算しません。
6. 3～5 件の節目は順次更新する計画範囲であり、原作の章全体を網羅する義務ではありません。1 件は 1 つの段階転換を表します。件数合わせのために長旅・集結・連続戦役・独立した複数の展開をまとめません。
7. 隣接する大局的な節目を予定する前に、移動・準備・組織動員・戦役の進行・因果展開に実際に必要な過程を確認します。独立した段階が複数含まれる場合は節目を分割するか期間を広げます。`;
    const CHRONOLOGY_PRESET_STEP_OLD="Step 2 · 境界の確定：現在の段階と次の大局的な節目を確認します。章・地区・戦争・勢力・重要人物の運命に段階変化が起きた場合だけ大局構成を調整してください。";
    const CHRONOLOGY_PRESET_STEP_V1="Step 2 · 境界と日付の確定：現在の世界時刻を起点に、明確な世界書・データベースの時間資料と原作の進行に従って、次の大局的な節目と妥当な期間を決めます。日程変更は確認済みの因果変動がある場合だけとし、その後で大局構成の調整を判断してください。";
    const CHRONOLOGY_PRESET_STEP_V2="Step 2 · 境界と日付の確定：現在の世界時刻を起点に、明確な資料と原作の進行に従って、今後 3～5 件の大局的な節目を順次計画します。各節目は 1 つの段階転換だけを示し、隣接する節目の間に移動・準備・因果展開の十分な時間を確保します。日程変更は確認済みの因果変動がある場合だけです。";
    const CHRONOLOGY_PRESET_STEP_V3="Step 2 · 物語と時間の境界：現在の世界時刻を起点に、介入がない場合の既定の未来として原作・公式設定を扱い、明確な資料と原作の進行に従って今後 3～5 件の大局的な節目を順次計画します。確認済みの変動は影響を受けた節目だけを再構成し、原作へ強制的に戻しません。";
    const upgradeChronologyPreset=value=>{
        const text=String(value||'');
        for(const previous of [CHRONOLOGY_PRESET_STEP_OLD,CHRONOLOGY_PRESET_STEP_V1,CHRONOLOGY_PRESET_STEP_V2])if(text.includes(previous))return text.replace(previous,CHRONOLOGY_PRESET_STEP_V3);
        return text;
    };
    if(plain(BUILTIN_DEFAULT_PROMPT_DOCUMENT?.settings))BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.preset=upgradeChronologyPreset(BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.preset);

    // 日级时间证据、编译硬校验与纠错动作已迁移至 WorldChronologyPolicy。\n\n    // 时间轴请求装饰与默认预设迁移已迁移至 WorldChronologyFeature。


    // ---- migrated from script/world-engine-src/59-world-integrity-guard.part.js ----
    // 世界完整性保护：统一精确时钟；因果偏移采用软归一化，不因语义或幅度问题拖死整轮推进。
    const WORLD_INTEGRITY_GUARD_RULES=`【因果の変動と時間の制約】
1. 時間検証はフィールド粒度で処理する：事件、地区、歴史、伝播などのマクロ事実は「自然日」単位でのみハード検証する；同一自然日内の午前/午後/HH:mmの差異は未来越界と見なさず、日をまたぐ未来の事実のみを拒否する。
2. 人物の現在動態は、「現在の世界時間」と「人物の更新時間」の双方が HH:mm まで明確な場合にのみ分単位の前後検証を行う；いずれか一方が早朝/午前/午後などの粗い粒度しか持たない場合は、同日を合法と見なす。現在の状態は引き続き世界.時間の原文を優先して再利用し、未来の計画は 预计结束、下次检查、または 待发生事件 に置く。
3. 偏移記録は毎ターン必須ではなく、あらすじログ・あらすじ要約・章の小括でもない。すでに発生し、すでに確認され、かつ現実の結果が重要人物の命運、重大事件の結果、重要勢力の構図、本筋の実現可能性、または異常汚染の規模を実際に変えた長期偏移のみを記録する；今回そのような重大な世界級の変化がない場合は「因果.偏移记录」を省略し、安定値を変化させるために記録を捏造してはならない。
4. 判定の根拠はすでに実現した結果であり、危険度、能力の強弱、計画、意図、潜在的な上限ではない。世界全体に影響しうる高危険装置を保持していても、まだ使用されておらず現実の結果も生んでいないなら、偏移は発生しない。
5. 同一の確認済み根因とその連鎖的帰結は一件だけ記録し、既存の偏移の更新を優先する；新たで独立した長期偏移の方向が形成された場合にのみ新規追加する。同一の因果チェーンをあらすじ小要約に分割して連続累積させることは禁止する。
6. 予測、リスク、可能性、潜在、または未来にまだ発生していない帰結は偏移を生まない；位置露見、敵の警戒、負傷、逃走、生存/行動難易度の変化などの局所的な戦術的帰結は偏移を生まない；安定値の低下およびその後の世界応答も、逆に新たな負の偏移となってはならない。
7. 負値アンカー：重要人物の命運の不可逆な改変 -3~-12；重大事件の結果の不可逆な変更 -3~-10；重要勢力の構図または本筋の実現可能性の実質的破壊 -2~-8；異常汚染の継続的拡大 -1~-10。通常の変化は記録しない。
8. 正値は真実の修復からのみ生じる：重要人物/重大事件の修復 +3~+10；異常の除去 +1~+15；勢力構図または本筋構造の修復 +2~+8。100を超える値は通常の善行、勝利、報酬からは生じ得ない。
9. 単条の推奨範囲は -12~-1 または +1~+15、0 は新規記録を作らない；同一の誘発者は同ターンで負方向の総量が最大 -12、正方向の総量が最大 +15。プログラムは範囲外、同根の分割、局所的帰結、またはまだ現実の結果を生んでいない偏移に対してソフト正規化/無視を実行し、リトライを発生させず、今回のその他の世界進行結果も却下しない。
10. 世界.安定は偏移台帳の派生値であり、プログラムが集計する；モデルは直接変更してはならず、毎ターン「安定値の更新」を行う必要もない。`;

    // 精确时钟解析、同日粗粒度放行与人物分钟级保护已迁移至 WorldTimePolicy + WorldTimelinePolicy。

    // 因果偏移软归一化与世界尺度过滤已迁移至 WorldCausalService。

    // 时间一致性纠错动作已迁移至 WorldRetryGuidanceService。\n\n    // 请求 manifest / system 装饰已迁移至 WorldIntegrityRequestFeature + WorldPromptRegistry。


    // ---- migrated from script/world-engine-src/59-world-time-ownership.part.js ----
    // 世界时间单一所有权：世界推进 AI 负责初始化/推进世界.时间；变量 AI 的写入在事件层被回滚。
    const WORLD_TIME_RULES=`【世界時刻の管理権限】
1. 世界.時間 は世界進行が排他的に管理します。最上位の「時間」は現在の世界時計の初期化・実際の進行だけに使い、人物の更新時刻や事件の予定時刻では代用しません。
2. 現在時刻が空・初期化待ちなら、最新の確定本文・現在の段階・現在地から、プレイヤーが任務世界の時間軸のどこにいるかを特定し、読み込み済みのタイムライン・年表・章の資料と照合して現在時刻の基準を作ります。次の大局的な節目・任務期限・未来事件の日付は未来の境界に限り、現在時刻として流用しません。
3. 資料が年・月・季節・段階・時間帯だけを特定できる場合は同じ精度を保ち、形式を埋めるために月日を創作しません。資料と現在の物語を一意に対応できない場合、偽の正確な日付より粗い時刻を優先します。
4. 毎回、最新本文と既存の世界.時間 を先に比較します。本文に一夜経過・数時間後・翌日・日をまたぐ移動、新しい日付・時間帯が明示されたら、最上位の「時間」を提出して同期します。古い世界時計を保ったまま、発生済みの事件・人物動向をその先の時刻に記録してはいけません。
5. 月日まで特定できる場合は {yyy}年-{mm}月-{dd}日-{時間帯} に統一し、月は数字にします。時間帯はパーサーが受け入れる候補値から選び、独自の同義表現を作りません。
6. 時間帯は大まかな基準で、毎回進むカウンターではありません。十分な時間経過がなければ「時間」を省略して元の値を維持し、本文または明確な資料で妥当な時間経過が確認できる場合だけ次の時間帯・日付へ進めます。世界進行を実行しただけで機械的に時間帯を進めません。
7. 世界時刻は後退できず、発生待ち事件の予定時刻を現在時刻へ前倒ししてはいけません。人物・地区などの更新時刻はプログラムが今回の最終世界時刻を記録します。主神空間から新シナリオへ入る際は、プログラムが世界.時間 と旧暦を消去します。新世界の時間初期化として扱い、前のシナリオや主神空間の輪廻暦の日付を継承してはいけません。`;

    // 世界时间结果策略、Schema、编译事务与 replay 范围已迁移至 WorldTimePolicy / canonical services。
    // 本文件仅保留可编辑的 WORLD_TIME_RULES 提示词常量。\n

    // ---- migrated from script/world-engine-src/59-editable-module-prompts.part.js ----
    // 提示词工作台最终层：只暴露真正发送给世界 AI 的文字模块；程序 Schema/校验仍由代码负责。
    const WORLD_MODULE_PROMPT_VERSION=7;
    const COMPACT_DEFAULT_PRESET=`あなたは輪廻戦場の世界エンジンです。本文の外で動く世界を進め、現在の作品で進行する物語を優先して継続します。発生済み、または計画が必要な世界の変化だけを提出します。
【実行手順】
1. 事実の取得：現在の変数・確定した物語 > 明確な世界書 > モデルの一般知識。
2. 物語の判断：<user> が今から介入しなければ、原作・公式資料に基づき次に最も自然に起こることを判断します。それは既定の未来であり変更不能なシナリオではありません。
3. 境界と世界進行：現在の段階・世界時刻・次の大局的な節目を確認し、利用可能な時間に応じて事件・地区・人物・勢力を進めます。<user> が止まっても世界は止まりません。
4. 影響の精算：<user> がすでに生んだ客観的な結果を記録します。本筋を変えるに十分なら影響する展開だけを再構成し、影響しない本筋は継続します。<user> の代わりに行動しません。
5. 管理：今回実際に変化した伝播・経済・暦だけを処理します。因果変動は重大で長期的な世界規模の変化がある場合だけ管理します。
6. 差分の出力：追加・変更した WorldResult だけを記述し、処理上の変化がなければ要約だけを出力します。`;
    const COMPACT_CORE_WORLD_RULES=`【基本境界】
- 事実の優先順位は現在の変数・確定した物語 > 明確な世界書 > 一般知識。計画は事実ではありません。
- 原作・公式設定は介入がない場合の既定の未来です。十分な確認済みの因果変化がなければ本筋に沿って進行します。変動後は影響する節目だけを再構成し、原作への回帰を理由とする同等の死・代替事故・根拠のない復活・運命修正を強制しません。作品で進む物語を優先し、その後で新しい事件を広げます。
- モデルの知識は場外人物の知識ではありません。人物は現場の観察・既存の認識・信頼できる伝播だけで行動します。<user> の新しい行動による方針変更には情報源が必要です。
- 活動中の異端は活動記録の欠落、確認期限、関連事件・所在地区の変化、長期未確認の場合だけ更新します。条件がなければ既存の目標・行動を維持し、更新のためだけに方針を創作しません。
- 時間・移動距離は実現可能で、同一人物は同時刻に一か所だけに存在します。<user> の代わりに行動せず、描写済みの些事を反復しません。
- 資産は固定不動産・大型乗り物・要塞だけとし、個人の品物は含めません。探索は <user> が実際に到達・調査・信頼できる情報を取得した区域だけです。
- 因果変動はすでに実現した本筋規模の長期的変化だけを記録します。重大な世界変動がなければ偏移記録を一切提出しません。現在事件の公開フィールドには現実に知覚できる情報だけを書きます。
- 任務精算・報酬・実績・撃破数は対応するシステムが担当します。`;
    const COMPACT_MACRO_PROMPT=`【大局構成】
構成の補充が必要なら、順次進む 3～5 件の段階転換を維持します。原作・公式設定は介入がない場合の既定の構成です。影響を受けない節目は流れを維持し、確認済みの変動がある部分だけを再構成します。順序と時間境界を先に決め、その後で直近の詳細を埋めます。未来の計画は境界を越えられますが、実際の進行は次の節目を越えてはいけません。独立した複数の段階を 1 つに無理にまとめないでください。`;
    const COMPACT_STABILITY_PROMPT_TEMPLATE=`【世界自救 · {{段階}}】
安定={{稳定值}}。{{规则}}
拒絶反応は世界内の合理的な因果を通じて発生しなければならない；NPCは依然として自身の認知と伝播チェーンに制限される。`;

    const WORLD_PROMPT_MODULE_DEFS=Object.freeze([
        Object.freeze({key:'task',title:"任務読み取り専用",source:'TASK_AWARENESS_RULES',legacy:()=>[TASK_AWARENESS_RULES],fallback:`【任務の参照・読み取り専用】
任務.リストは世界の因果入力としてのみ用いる；事件は「关联任务」で既存の任務を参照できる。任務の作成、削除、状態変更、納品、決算を行ってはならない。情報の購入と引き落としはMVUが処理する；実績、撃破、報酬、罰則は世界進行に関与しない。`}),
        Object.freeze({key:'chronology',title:"原作 / データベース年表",source:'CHRONOLOGY_GUARD_RULES',legacy:()=>[CHRONOLOGY_GUARD_RULES],fallback:`【原作・データベースの物語時間軸制約】
原作・公式設定は介入がない場合の既定の未来です。十分な因果変化がなければ原作に沿った進行を優先します。発生済みの事実は上書きできません。日単位で明確な日付は厳密に検証し、明示的に関連する確認済みの変動がある場合だけ、その節目の日程変更・取消・再構成を認めます。月・時間帯・順序・条件・傾向は元の精度を維持する柔軟な制約です。変動後は影響のある節目だけを変え、原作への回帰を理由に運命を強制修正してはいけません。3～5 件は順次更新する範囲であり、独立した段階を統合する指示ではありません。`}),
        Object.freeze({key:'maintenance',title:"段階的メンテナンス",source:'SOFT_MAINTENANCE_RULES',legacy:()=>[SOFT_MAINTENANCE_RULES],fallback:`【段階別の検証・任意の保守で全体を却下しない】
Schema、不正な状態、因果参照、明確な日付の衝突はハードエラー；スケジュール補完、噂の補充、伝播の再確認はターンをまたいで維持できる。事件は時間、条件、前因のいずれかがあればアンカーとして扱える。訂正は拒否された断片のみを修正し、通過済みの内容を書き直さない。`}),
        Object.freeze({key:'exploration',title:"探索台帳",source:'EXPLORATION_PROJECTION_RULES',legacy:()=>[EXPLORATION_PROJECTION_RULES],fallback:`【玩家探索投影硬约束】
<user>が実際に全体区域へ到達した時点で探索度は少なくとも10%；遠方のバックステージ地区は自動記入しない；離脱後も既存の探索を保持する。`}),
        Object.freeze({key:'integrity',title:"因果と事実時間",source:'WORLD_INTEGRITY_GUARD_RULES',legacy:()=>[WORLD_INTEGRITY_GUARD_RULES],fallback:`【因果の変動と時間の制約】
現在の事実は世界時間より後に落ちてはならない；未来の計画は 预计结束、下次检查、または 待发生事件 に書く。因果偏移は毎ターン必須ではなく、実現済みでかつ重要人物の命運、重大事件の結果、重要勢力の構図、本筋の実現可能性、または異常汚染の規模を変えた長期的変化のみを記録する；今回そのような重大な変化がない場合は「因果.偏移记录」を省略し、安定値を変化させるために記録を捏造してはならない。位置露見、敵の警戒、負傷、逃走、行動/生存難易度の変化などの局所的帰結は記録しない。計画、リスク、能力の上限は記録しない；同一根因は同じ一件を優先して更新する。安定値はプログラムが有効な偏移に基づいて集計し、モデルは直接変更してはならない。`}),
        Object.freeze({key:'worldTime',title:'世界时间',source:'WORLD_TIME_RULES',legacy:()=>[WORLD_TIME_RULES],fallback:`【世界時刻の管理権限】
世界.時間は世界進行が管理する。空なら確定資料に基づいて初期化する。現在の時間帯をまたぐほどの時間経過がなければ元の値を保ち、毎回機械的に時間帯を進めない。月日まで確定している場合は {yyy}年-{mm}月-{dd}日-{時間帯} を使用し、未明/黎明/早朝/朝/午前/正午/昼過ぎ/午後/夕方/夜の始まり/夜/深夜から選ぶ。本文や明確な資料表に合理的な時間経過が示された場合だけ時間帯や日付を進める。時刻を戻したり、将来の計画時刻を現在時刻として扱ったりしない。人物・地区の更新時刻はプログラムが統一して記録する。`}),
        Object.freeze({key:'rumor',title:"噂と伝播",source:'RUMOR_THROTTLE_RULES / RUMOR_WORLD_SOURCE_RULES',legacy:()=>[RUMOR_LIVELINESS_RULES,RUMOR_THROTTLE_RULES,RUMOR_WORLD_SOURCE_RULES],fallback:`【情報の伝播・世界側の事実】
噂は「世界侧可传播事实」、既存の伝播チェーン、既存の公開噂からのみ生じる；本文は直接の伝播源ではない。私的な事実はまず目撃、公開された帰結、調査、公告、または漏洩を形成しなければならない。公開内容は出所/受け手の認知を超えてはならず、伝播は時間と空間に従って拡散する。トリガーがなければそのまま；空の分類、伝播の再確認、または新たな公開事実がある時は必要に応じて更新し、各トリガーにつき分類ごと最大1件。通常の行動/戦闘そのものはトリガーしない；噂の失敗でターン全体を再実行しない。購入、引き落とし、消費的な削除はMVUが処理する。`})
    ]);
    function worldModulePromptDefaults(){
        return Object.fromEntries(WORLD_PROMPT_MODULE_DEFS.map(item=>[item.key,item.fallback]));
    }
    function normalizeWorldModulePrompts(value){
        const source=plain(value)?value:{};
        const out={};
        for(const item of WORLD_PROMPT_MODULE_DEFS)out[item.key]=typeof source[item.key]==='string'?source[item.key]:item.fallback;
        return out;
    }
    function stripLegacyWorldModulePrompts(system){
        let text=String(system||'');
        for(const item of WORLD_PROMPT_MODULE_DEFS){
            for(const legacy of item.legacy()){
                const block=String(legacy||'');
                if(block)text=text.split(block).join('');
            }
        }
        return text.replace(/\n{3,}/g,'\n\n').trim();
    }
    function appendConfiguredWorldModulePrompts(system,modulePrompts){
        let text=stripLegacyWorldModulePrompts(system);
        const prompts=normalizeWorldModulePrompts(modulePrompts),used=[];
        for(const item of WORLD_PROMPT_MODULE_DEFS){
            const block=String(prompts[item.key]||'').trim();
            if(!block)continue;
            text+=(text?'\n\n':'')+block;
            used.push({key:item.key,title:item.title,source:item.source,估算Tokens:estimateTokens(block)});
        }
        return {system:text,used};
    }

    // 内置默认直接展示精简版；旧用户只在仍使用内置默认时迁移一次，自定义文档不强制覆盖。
    if(plain(BUILTIN_DEFAULT_PROMPT_DOCUMENT?.settings)){
        BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.preset=normalizeEditablePreset(COMPACT_DEFAULT_PRESET);
        BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.corePrompt=COMPACT_CORE_WORLD_RULES;
        BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.macroPrompt=COMPACT_MACRO_PROMPT;
        BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.stabilityPromptTemplate=COMPACT_STABILITY_PROMPT_TEMPLATE;
        BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.modulePrompts=worldModulePromptDefaults();
    }

    // 运行时读写、预设持久化与最终请求重写已迁移到 WorldPromptRegistry + WorldEngineClassBridge。
    class WorldRuntimeContextService {
        constructor(engine){this.engine=engine;}
        snapshot(){
            const engine=this.engine;
                        const mvu = engine.env.Mvu || engine.host.Mvu;
                        const getMessages = engine.fn('getChatMessages');
                        if (!mvu || !getMessages) throw new Error("現在 MVU と酒場のメッセージ機能を待機しています");
                        const message = getMessages(-1)[0];
                        if (!message) throw new Error("現在メッセージがありません");
                        const id = message.message_id != null ? message.message_id : message.id;
                        if (!Number.isInteger(Number(id))) throw new Error("現在のフロア番号が無効です");
                        const raw = mvu.getMvuData({type:'message',message_id:Number(id)});
                        if (!raw || !raw.stat_data || !raw.stat_data.世界) throw new Error("現在のフロアはまだ MVUが初期化されていません");
                        const context = engine.host.SillyTavern && engine.host.SillyTavern.getContext ? engine.host.SillyTavern.getContext() : {};
                        const chatFn = engine.fn('getCurrentChatId');
                        const chat = chatFn ? chatFn() : context.chatId;
                        if (chat == null) throw new Error("現在のチャット識別子を確認できません");
                        const text = String(message.message != null ? message.message : message.mes || '');
                        const fingerprint = JSON.stringify([String(chat),Number(id),message.swipe_id || 0,digest(text)]);
                        return {mvu,raw:copy(raw),stat:copy(raw.stat_data),id:Number(id),text,fingerprint,message};
        }
        blocked(snapshot){
                        const s = snapshot.stat;
                        if ((s.システム状態 || {}).主神空間滞在中 || s.世界.名称 === "主神空間") return "現在は主神空間にいるため、インスタンス進行は停止中";
                        if (!s.世界.名称 || s.世界.名称 === "初期化待ち") return "インスタンスの初期化を待機中";
                        if (/(?:轮回清算协议|輪廻清算プロトコル)/.test(snapshot.text)) return "決算フロアは決算美化プログラムが処理します";
                        if (snapshot.message.is_user || snapshot.message.role === 'user') return "本文の完成を待機中";
                        return '';
        }
        backendState(){
            return copy(Object.assign(emptyState(),this.snapshot().stat.世界[PATH]||{}));
        }
    }
    class WorldKnowledgeService {
        constructor(engine,selection=DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY){this.engine=engine;this.selection=selection||DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY;}
        applyBuiltinDefaultWorldbookExclusions(catalogue) {
            const engine=this.engine;
            if(engine.config.activePromptDocumentId!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.id||!Array.isArray(catalogue)||!catalogue.length)return false;
            const applied=new Set(Array.isArray(engine.config.builtinDefaultWorldbookExclusionsApplied)?engine.config.builtinDefaultWorldbookExclusionsApplied:[]);
            let selected=Array.isArray(engine.config.selectedEntries)?copy(engine.config.selectedEntries):[];
            let progressed=false,changed=false;
            for(const title of BUILTIN_DEFAULT_WORLD_BOOK_EXCLUSIONS){
                if(applied.has(title))continue;
                const matches=catalogue.filter(entry=>this.selection.normalizeTitle(entry.title)===title);
                if(!matches.length)continue;
                const before=selected.length;
                selected=selected.filter(raw=>!matches.some(entry=>this.selection.matches(entry,[raw])));
                applied.add(title);progressed=true;
                if(selected.length!==before)changed=true;
            }
            if(!progressed)return false;
            engine.config.selectedEntries=selected;
            engine.config.builtinDefaultWorldbookExclusionsApplied=Array.from(applied);
            const builtin=engine.getPromptDocuments().find(doc=>doc.id===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id);
            if(builtin?.settings)builtin.settings.selectedEntries=copy(selected);
            engine.saveConfig();
            return changed;
        }
        activation(entry,scan,force){
            if(!String(entry.content||'').trim())return {read:false,reason:"内容が空"};
            if(force)return {read:true,reason:"強制読み込み"};
            if(!entry.enabled)return {read:false,reason:"エントリ無効"};
            if(entry.mode==='constant')return {read:true,reason:"青ランプ常駐"};
            if(entry.mode!=='selective')return {read:false,reason:"未対応のアクティブ化方式です。明示的な強制読み込みが必要です"};
            const list=v=>Array.isArray(v)?v:typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[];
            const match=k=>{
                if(k instanceof RegExp){k.lastIndex=0;return k.test(scan);}
                if(plain(k)){try{return new RegExp(k.pattern||k.source||k.regex,k.flags||'').test(scan);}catch(_){return false;}}
                return !!String(k||'')&&scan.includes(String(k));
            };
            if(!list(entry.keys).some(match))return {read:false,reason:"緑ランプ：キーワード不一致"};
            const second=entry.secondary||{},keys=list(second.keys||second),hits=keys.map(match);
            const ok=!keys.length||(second.logic==='and_all'?hits.every(Boolean):second.logic==='not_all'?!hits.every(Boolean):second.logic==='not_any'?!hits.some(Boolean):hits.some(Boolean));
            return {read:ok,reason:ok?"緑ランプ：一致":"緑ランプ：副次条件が未達"};
        }
        async catalogue(){
            const engine=this.engine,get=engine.fn('getWorldbook');
            if(!get)return [];
            const sources=new Map(),addSource=(book,label)=>{
                const name=String(book||'').trim();if(!name)return;
                if(!sources.has(name))sources.set(name,new Set());
                sources.get(name).add(label);
            };
            const namesFn=engine.fn('getCharWorldbookNames');
            if(namesFn){
                const names=await namesFn('current')||{};
                addSource(names.primary,"キャラ主要ブック");
                for(const book of names.additional||[])addSource(book,"キャラ追加ブック");
            }
            const chatFn=engine.fn('getChatWorldbookName');
            if(chatFn){
                try{addSource(await chatFn('current'),"チャット連携");}catch(_){}
            }
            const globalFn=engine.fn('getGlobalWorldbookNames');
            if(globalFn){
                try{for(const book of await globalFn()||[])addSource(book,"グローバル有効");}catch(_){}
            }
            const result=[];
            for(const [book,labels] of sources){
                const entries=await get(book)||[];
                entries.forEach((e,i)=>{
                    const title=e.name||e.comment||"名称未設定";
                    result.push({
                        book,id:String(e.uid??e.id??i),title,sources:Array.from(labels),
                        technical:this.selection.isTechnical(title),enabled:e.enabled!==false&&!e.disable&&!e.disabled,
                        mode:e.strategy?.type||e.type||(e.constant===false?'selective':'constant'),
                        keys:e.strategy?.keys||e.keys||e.key||[],
                        secondary:e.strategy?.keys_secondary||e.keys_secondary||e.secondary_keys||{},
                        content:e.content||''
                    });
                });
            }
            this.applyBuiltinDefaultWorldbookExclusions(result);
            return result;
        }
        async worldbook(scan='',options={}){
            const engine=this.engine,catalogue=await engine.catalogue(),output=[];
            engine.bookCatalogue=catalogue;
            const report=[];engine.readReport=report;
            for(const e of catalogue){
                const selected=!e.technical&&this.selection.matches(e,engine.config.selectedEntries);
                const timelineBackbone=!!options.timelineBackbone&&selected&&e.enabled&&this.selection.isTimelineBackbone(e.title);
                const decision=e.technical?{read:false,reason:"世界エンジン技術項目は隔離済み"}:timelineBackbone?{read:true,reason:"マクロ資料の補完"}:selected?this.activation(e,scan,engine.config.activationMode==='force_selected'):{read:false,reason:"未選択"};
                report.push({世界书:e.book,条目ID:e.id,名称:e.title,灯:e.mode==='constant'?"青ランプ":e.mode==='selective'?"緑ランプ":"その他",读取:decision.read,原因:decision.reason});
                if(!decision.read)continue;
                let entryContent=e.content;
                if(entryContent.includes('<%')){
                    const ejs=engine.host.EjsTemplate;
                    if(!ejs?.evalTemplate||!ejs?.prepareContext)throw new Error("選択した世界ブックに動的テンプレートが含まれています。 EJS 拡張が必要です："+e.title);
                    entryContent=await ejs.evalTemplate(entryContent,await ejs.prepareContext({}));
                }
                output.push({世界书:e.book,条目ID:e.id,名称:e.title,内容:entryContent});
            }
            Object.defineProperty(output,'report',{value:report});
            return output;
        }
    }
    class WorldRequestBuilder {
        constructor(engine,proseExtractor=DEFAULT_WORLD_PROSE_EXTRACTOR,telemetry=DEFAULT_WORLD_TOKEN_TELEMETRY){this.engine=engine;this.proseExtractor=proseExtractor||DEFAULT_WORLD_PROSE_EXTRACTOR;this.telemetry=telemetry||DEFAULT_WORLD_TOKEN_TELEMETRY;}
        async build(base){
            const engine=this.engine,proseExtractor=this.proseExtractor,telemetry=this.telemetry;
            return await (async function(base){
                            const state=copy(base.stat);
                            state.世界[PATH]=Object.assign(emptyState(),state.世界[PATH]||{});
                            normalizeBackendState(state);
                            const structuralFixes=normalizeEventLayers(state);
                            const lifecycle=compactWorldLifecycle(state);
                            const alienActivity=activeAlienActivityRequirements(state);
                            const seedPatches=importStory(state);
                            // 缺少后台人物的活跃异端只在本次请求副本中放一个空壳，帮助模型明确这是待补活动；
                            // 不把空壳作为正式 seed patch，避免与本轮模型真正创建的人物记录发生 add/add 冲突。
                            seedMissingAlienPeople(state,alienActivity);
                            for(const patch of seedPatches){const parts=tokens(patch.path);if(parts[2]==='事件')state.世界[PATH].事件[parts.at(-1)]=patch.value;}
                            structuralFixes.push(...normalizeEventLayers(state));
                            structuralFixes.push(...repairCausalProjection(state));
                            structuralFixes.push(...repairMacroPredecessors(state));
                            structuralFixes.push(...repairExplicitEventLinks(state));
                            if(state.設定)delete state.設定.API;
                            if(state.設定?.世界超安定===true)state.世界.安定=100;
                            delete state.商城;
                            const count=Math.max(1,Math.min(100,Number(this.config.contextTurns)||6));
                            const id=Number(base.message.message_id??base.message.id);
                            // 先清洗所有历史候选，再取最近 N 条非空正文；技术楼层再多也不会挤掉正文名额。
                            const messages=await this.fn('getChatMessages')('0-'+id);
                            const isAssistant=m=>{
                                const role=String(m?.role||'').toLowerCase();
                                if(!m||m.is_hidden||m.is_user===true||role==='user'||role==='system')return false;
                                return role==='assistant'||!role;
                            };
                            const floors=messages.filter(m=>Number(m.message_id??m.id)<=id&&isAssistant(m))
                                .sort((a,b)=>Number(a.message_id??a.id)-Number(b.message_id??b.id))
                                .map(m=>({楼层:m.message_id??m.id,キャラ:'assistant',正文:proseExtractor.extract(m.message??m.mes??'')}))
                                .filter(f=>f.正文).slice(-count);
                            if(!floors.length)throw new Error("使用可能なAI本文を読み取れませんでした：階層が空か、思考・変数更新・パネルのみです。チャット内容を確認してください");
                            const timeline=timelineState(state);
                            const needBackbone=timeline.需要初始化||timeline.需要补充远期;
                            const openMacro=Object.entries(state.世界[PATH].事件).filter(([,event])=>event.分类==="大局的な節目"&&["進行中","発生待ち"].includes(event.状態));
                            const activeMacroCount=openMacro.filter(([,event])=>event.状態==="進行中").length;
                            const macroRequirement=this.config.requireMacroBackbone!==false&&timeline.需要补充远期?{
                                已有可推进宏观节点:openMacro.map(([名称,event])=>({名称,状態:event.状態})),
                                至少补充节点数:Math.max(0,3-openMacro.length),
                                交付要求:macroBackbonePlan(openMacro.length,activeMacroCount,openMacro.length-activeMacroCount),
                                规划与发生:"今回は必ず骨格を補完すること。時間が進んでいない、本文にマクロな変化がない、業務上の変化がない、といった理由で省略してはならない。待発生ノードの確立は将来の計画であり、次のマクロ境界の後に置いてよく、イベントが今発生することを意味しない。直近の細部と既に発生した事実は、依然として今回の時間容量と次のマクロ境界に制約される。数を埋めるために原作の日付を前倒ししたり、未来イベントの結果を先に決算してはならない。更新時間には現在の世界時間を用いる。",
                                验收:"既存の状態と今回の結果を統合したうえで数える。今回のラウンドで既存のマクロノードを終了または取消した場合、ウィンドウから外れた分を補足しなければならない。リトライ時は受理済みの業務結果と最新の補完リストに従い、受理済みノードを重複作成しない。"
                            }:undefined;
                            const proseScan=floors.map(f=>f.正文).join('\n');
                            const chronologyScan=needBackbone?[state.世界.名称,"原作","タイムライン","時間軸",'年表',"主要な出来事","重大事件","物語のあらすじ","物語の章","章",'未来',"今後"].filter(Boolean).join(' '):'';
                            const books=await this.worldbook([proseScan,chronologyScan].filter(Boolean).join('\n'),{timelineBackbone:needBackbone});
                            const now=worldDateKey(state.世界.時間);
                            const due=Object.entries(state.世界[PATH].事件).filter(([,e])=>e.状態==="発生待ち"&&now!==null&&worldDateKey(e.時間||e.开始时间)!==null&&worldDateKey(e.時間||e.开始时间)<=now).map(([名称,e])=>({名称,時間:e.時間||e.开始时间,条件:e.条件,前因:e.前因,説明:"時間が到来した。条件と前因を項目ごとに検証し、適合すれば進行中へ移行する。適合しなければ次回チェックを更新し、妨げを説明しなければならない。無言でスキップしてはならない。"}));
                            const unscheduled=unscheduledEvents(state);
                            const staleActive=staleActiveEvents(state);
                            const timeAnomalies=temporalAnomalies(state);
                            const capacity=worldTimeCapacity(state.世界[PATH].処理済み時刻,state.世界.時間);
                            const npcAudit=npcBuildAudit(state);
                            const input=JSON.stringify({
                                输入语义:{
                                    世界书:"任意の設定/原作との差異/時間資料。既に発生した事実ではなく、世界ブックがなくても正常に推演しなければならない。",
                                    当前变量:"世界進行専用のホットデータ投影。世界、人物能力、完全な資産台帳、アクティブな伝播、直近の因果偏移、および「直近の原始アンカー + より古いルート要約」から成る階層的な長期歴史記憶を含む。原始履歴は永久にMVUに残り、上位の要約に取り込まれた旧ノードは再びホットコンテキストへ入らない。資産はWorldResult.资产と同一のトップレベル台帳で双方向に同期する。提供されていない任務/ショップ/純決算データはこのエンジンの責務ではない。",
                                    正文楼层:"すでに演出されたストーリー。現在の事実と時間スパンを確認するために用い、舞台裏の日常として語り直さない。",
                                    程序结构修复:"エンジンがすでに行った確定的な訂正。出力でプログラムが降格/修正した旧エラーを復元してはならない。",
                                    时间线调度:"プログラムが算出したマクロ境界と期限付き再検証要求。意味的な推演はモデルが担い、スケジュールプロトコルを再定義しない。",
                                    WorldResult:"唯一の業務成果物。 JSON Pointer、add/replace パス、プログラムログを含まない。",
                                    角色管理:"NPC構築監査が提供された場合、列挙された既存NPCのギャップのみを扱う。完全な構築資料は監査対象の中でのみ提供し、全NPCが重複してコンテキストを占有するのを避ける。"
                                },
                                本轮必须完成的宏观骨架:macroRequirement,
                                世界书:books.map(b=>String(b.内容||'')).filter(Boolean),
                                当前变量:(this.services?.stateProjector?.world(state)??projectWorldContext(state)),
                                角色管理:npcAudit.length?{NPC构筑审计:npcAudit}:undefined,
                                正文楼层:floors,
                                程序结构修复:structuralFixes,
                                本轮时间容量:capacity,
                                时间线调度:timeline,
                                推演阶段:{宏观优先:true,宏观骨架状态:needBackbone?"確立または補足が必要":"利用可能なマクロ骨格あり",近期细节边界:timeline.下一宏观节点?.名称||"まず次のマクロノードを確立",知识来源:"現在確認済みの事実 > 明示された世界ブック設定（あれば） > モデルが持つ原作/世界知識 > 慎重な推論"},
                                正文可见投影规则:{
                                    当前时间:state.世界.時間,
                                    当前地点:state.世界.地点,
                                    要求:"非戦闘の本文は完全な因果軌道を読み取る。現在段階は現在の情勢に、ストーリーライン/次ノードは長期的な語りの方向に、偏移記録は章をまたぐ因果記憶に用いる。これらは計画の根拠であり、キャラクターの予知や背後情報の自動把握を意味しない。本文はさらに、進行中の現在イベントの公開フィールドと、プログラムが選別した場外シーンを読み取る。各ホット地区には共有環境/現場集団が一度だけ現れ、人物リストは各自の行動事実のみを運び、関連イベントは索引としてのみ扱う。アクティブな異端は常にその所在ホットシーンに保持される。以上はいずれも語りの連続性のために用いられ、キャラクターが既知であることを意味しない。現在のシーンに影響しうる現在イベントは、公開の兆候と可視の影響を維持すべきである。隠された条件、既定の展開、未来のマクロイベントの詳細を公開フィールドに詰め込んではならない。"
                                },
                                可选宏观资料补充:needBackbone,
                                本轮必须复核的到期事件:due,
                                本轮必须补全的事件时间锚点:unscheduled,
                                本轮必须复核的超期活动事件:staleActive,
                                本轮必须修复的时间越界记录:timeAnomalies,
                                本轮必须维持的异端活动:alienActivity,
                                生命周期整理:lifecycle,
                                説明:"現在変数は確認済みのホット事実であり、重複決算しない。アーカイブ済みの旧イベントと回収済みの伝播を再作成しない。世界ブックが空でも阻害要因にならない。業務上の事実のみを提出し、保存パスはプログラムがコンパイルする。"
                            },null,2);
                            const stabilityPrompt=worldStabilityPrompt(state,this.config.stabilityPromptTemplate??DEFAULT_STABILITY_PROMPT_TEMPLATE);
                            const macroPrompt=macroRequirement?(this.config.macroPrompt??DEFAULT_MACRO_PROMPT):'';
                            const corePrompt=this.config.corePrompt??CORE_WORLD_RULES;
                            const system=this.config.preset+(corePrompt?'\n\n'+corePrompt:'')+(macroPrompt?'\n\n'+macroPrompt:'')+(stabilityPrompt?'\n\n'+stabilityPrompt:'')+(npcAudit.length?'\n\n'+(this.config.npcAuditPrompt??NPC_BUILD_AUDIT_RULES):'')+"\n\n【WorldResult 出力プロトコル】\n"+((this.config.structurePrompt??protocol().split('【Canonical WorldResult JSON Schema】')[0].trim())+"\n\n【Canonical WorldResult JSON Schema】\nプログラムが実際に使用するフィールド定義（文章による説明では変更できません）：\n"+JSON.stringify(WORLD_RESULT_SCHEMA,null,2));
                            return {system,input,schema:copy(WORLD_RESULT_SCHEMA),seedPatches,due,unscheduled,staleActive,timeAnomalies,alienActivity,npcAudit:copy(npcAudit),timeline:copy(timeline),manifest:{输出协议:'WorldResult v1',结构化输出:'auto',接口来源:this.apiSourceLabel(),读取判定:copy(books.report||[]),世界书读取:{实际读取:books.length,检查条目:(books.report||[]).length,跳过:Math.max(0,(books.report||[]).length-books.length)},世界书条目:books.map(b=>({世界书:b.世界书,条目ID:b.条目ID,名称:b.名称,估算Tokens:telemetry.estimate(b.内容)})),正文楼层:floors.map(f=>({楼层:f.楼层,キャラ:f.キャラ,估算Tokens:telemetry.estimate(f.正文)})),导入节点:seedPatches.map(p=>tokens(p.path).at(-1)),到期节点:due.map(e=>e.名称),待补时间锚点:unscheduled.map(e=>e.名称),超期活动事件:staleActive.map(e=>e.名称),时间越界记录:timeAnomalies.map(e=>e.タイプ+'/'+e.名称),程序结构修复:copy(structuralFixes),生命周期整理:copy(lifecycle),NPC构筑审计:npcAudit.map(x=>({名称:x.名称,監査級:x.監査級,缺口:copy(x.缺口)})),本轮时间容量:copy(capacity),可选宏观资料补充:needBackbone,观测:telemetry.request(system,input,WORLD_RESULT_SCHEMA)}};
            }).call(engine,base);
        }
    }
    // 世界长期历史记忆：每次推进写 L0 叶子，旧叶子逐层压缩；正文读取由独立设置控制。
    const HISTORY_MEMORY_L0_BATCH=12;
    const HISTORY_MEMORY_L0_KEEP=6;
    const HISTORY_MEMORY_L1_BATCH=6;
    const HISTORY_MEMORY_HIGHER_BATCH=3;
    const HISTORY_MEMORY_LEGACY_RAW_CONTEXT=24;
    const HISTORY_MEMORY_LEAF_PREFIX="進行・";
    const HISTORY_MEMORY_SCHEMA={
        type:'object',additionalProperties:false,required:["要約"],
        properties:{要約:{type:'string',minLength:1}}
    };
    const HISTORY_MEMORY_SYSTEM=`【世界の長期履歴の要約】
確定済みの歴史的事実のみを要約すること。受け取るのは実際の時系列順に並んだ既存の歴史ノードであり、任務はそれらをより高次の世界史記憶へ融合することであって、物語の続きを書くことではない。
必ず保持すること：時間順序、主要な参与者、原因、重要な転換点、最終結果、および今後の情勢に影響し続ける長期的帰結と重要な因果偏移。
削除してよいもの：重複した記述、以後の意味を失った過程の細部、UI/デバッグ情報。
禁止：未発生の筋書きの補記、隠された真相の推測、既存の結末の改変、入力中に存在しない日付/人物/関係の捏造、歴史的事実を未来の計画として書くこと。
入力の時間粒度が不完全な場合は、元の粒度を維持し、勝手に補完しないこと。
JSONのみを出力：{"要約":"..."}`;

    class WorldHistoryMemoryPolicy {
        leafKey(messageId) {
            return HISTORY_MEMORY_LEAF_PREFIX+String(messageId);
        }
        leafEntries(backend) {
            return Object.entries(backend?.历史||{}).filter(([name,item])=>
                String(name||'').startsWith(HISTORY_MEMORY_LEAF_PREFIX)&&plain(item)&&String(item.事实||'').trim()
            );
        }
        leafOrder(name,fallback=0) {
            const raw=String(name||'').slice(HISTORY_MEMORY_LEAF_PREFIX.length),n=Number(raw);
            return Number.isFinite(n)&&n>=0?n:fallback;
        }
        collectedIds(backend) {
            const collected=new Set();
            for(const item of Object.values(backend?.历史总结||{})){
                if(!plain(item)||!Array.isArray(item.子项))continue;
                for(const id of item.子项){const key=String(id||'').trim();if(key)collected.add(key);}
            }
            return collected;
        }
        invalidateAncestors(backend,childId) {
            if(!plain(backend?.历史总结))return [];
            const affected=new Set([String(childId||'')]),removed=[];
            let changed=true;
            while(changed){
                changed=false;
                for(const [name,item] of Object.entries(backend.历史总结||{})){
                    if(!plain(item)||!Array.isArray(item.子项))continue;
                    if(!item.子项.some(id=>affected.has(String(id||''))))continue;
                    delete backend.历史总结[name];
                    affected.add("要約:"+name);
                    removed.push(name);
                    changed=true;
                }
            }
            return removed;
        }
        summaryOrder(item,fallback=0) {
            const n=Number(item?.起始序位);
            return Number.isFinite(n)&&n>0?n:fallback;
        }
        rootsAtLevel(backend,level) {
            const source=plain(backend)?backend:{},collected=this.collectedIds(source);
            if(level===0){
                return this.leafEntries(source).map(([name,item],index)=>({
                    id:"履歴:"+name,name,level:0,text:String(item?.事实||'').trim(),
                    timeStart:String(item?.時間||'').trim(),timeEnd:String(item?.時間||'').trim(),
                    lo:this.leafOrder(name,index+1),hi:this.leafOrder(name,index+1)
                })).filter(node=>node.text&&!collected.has(node.id))
                    .sort((a,b)=>a.lo-b.lo||a.name.localeCompare(b.name,'zh-CN'));
            }
            return Object.entries(source.历史总结||{}).filter(([,item])=>plain(item)&&Number(item.階層)===level)
                .map(([name,item],index)=>({
                    id:"要約:"+name,name,level,text:String(item.要約||'').trim(),
                    timeStart:String(item.起始时间||'').trim(),timeEnd:String(item.结束时间||'').trim(),
                    lo:this.summaryOrder(item,index+1),
                    hi:Number.isFinite(Number(item.结束序位))?Number(item.结束序位):this.summaryOrder(item,index+1)
                })).filter(node=>node.text&&!collected.has(node.id))
                .sort((a,b)=>a.lo-b.lo||a.hi-b.hi||a.name.localeCompare(b.name,'zh-CN'));
        }
        batchForLevel(backend,level) {
            const roots=this.rootsAtLevel(backend,level);
            if(level===0){
                if(roots.length<HISTORY_MEMORY_L0_BATCH+HISTORY_MEMORY_L0_KEEP)return [];
                return roots.slice(0,HISTORY_MEMORY_L0_BATCH);
            }
            const threshold=level===1?HISTORY_MEMORY_L1_BATCH:HISTORY_MEMORY_HIGHER_BATCH;
            if(roots.length<threshold)return [];
            return roots.slice(0,threshold);
        }
        nextKey(backend,level) {
            const prefix='H'+level+'-',used=new Set(Object.keys(backend?.历史总结||{}));
            let max=0;
            for(const name of used){
                if(!String(name).startsWith(prefix))continue;
                const n=Number(String(name).slice(prefix.length));if(Number.isFinite(n))max=Math.max(max,n);
            }
            let seq=max+1,key='';
            do{key=prefix+String(seq++).padStart(6,'0');}while(used.has(key));
            return key;
        }
        parseReply(raw) {
            let source=String(raw||'').trim();
            const fenced=source.match(/^\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`$/i);if(fenced)source=fenced[1].trim();
            let value=null;
            try{value=JSON.parse(source);}catch(_){
                const start=source.indexOf('{'),end=source.lastIndexOf('}');
                if(start>=0&&end>start){try{value=JSON.parse(source.slice(start,end+1));}catch(__){}}
            }
            const summary=String(value?.要約||value?.summary||'').trim();
            if(!summary)throw new Error(source?"歴史要約に失敗：返答に要約 JSON":"歴史要約に失敗：モデルの空応答");
            return summary;
        }
        prompt(world,batch,outputLevel) {
            const nodes=batch.map((node,index)=>({
                序号:index+1,
                時間:node.timeStart&&node.timeEnd&&node.timeStart!==node.timeEnd?node.timeStart+' → '+node.timeEnd:(node.timeStart||node.timeEnd||''),
                事实:node.text
            }));
            return JSON.stringify({
                世界:String(world?.名称||''),
                输出层级:'L'+outputLevel,
                説明:"指定された順序で圧縮すること；時間フィールドは権威あるアンカーであり、書き換えたり捏造してはならない。",
                历史节点:nodes
            },null,2);
        }
        project(backend) {
            const state=plain(backend)?backend:{},raw=state.历史||{},summaries=state.历史总结||{};
            const collected=this.collectedIds(state);
            const allLeaves=this.leafEntries(state);
            const rawRoots=this.rootsAtLevel(state,0);
            const recent=rawRoots.slice(-HISTORY_MEMORY_LEGACY_RAW_CONTEXT);
            const recentMap=Object.fromEntries(recent.map(node=>{
                const key=node.id.slice(3),record=raw[key]||{};
                return [key,{時間:String(record.時間||''),事实:String(record.事实||''),关联事件:Array.isArray(record.关联事件)?copy(record.关联事件):[]}];
            }));
            const rootSummaries=Object.entries(summaries).filter(([name,item])=>plain(item)&&!collected.has("要約:"+name))
                .map(([name,item],index)=>({
                    名称:name,階層:Math.max(1,Number(item.階層)||1),
                    起始时间:String(item.起始时间||''),结束时间:String(item.结束时间||''),要約:String(item.要約||''),
                    __order:this.summaryOrder(item,index+1)
                })).filter(item=>item.要約)
                .sort((a,b)=>a.__order-b.__order||a.階層-b.階層||a.名称.localeCompare(b.名称,'zh-CN'))
                .map(item=>{const out={...item};delete out.__order;return out;});
            return {
                説明:"世界の長期的な叙事と因果の記憶；章をまたぐ連続性を保つためのものであり、自動的にいずれかのキャラクターが既に知得した情報を意味するものではない。",
                近期锚点:recentMap,
                长期总结:rootSummaries,
                统计:{
                    原始锚点总数:allLeaves.length,
                    总结节点总数:Object.keys(summaries).length,
                    未收纳锚点数:rawRoots.length,
                    隐藏未压缩锚点数:Math.max(0,rawRoots.length-recent.length),
                    冷归档事实数:Math.max(0,Object.keys(raw).length-allLeaves.length)
                }
            };
        }
        digest(backend) {
            try{return JSON.stringify([backend?.历史||{},backend?.历史总结||{}]);}catch(_){return '';}
        }
    }

    const DEFAULT_WORLD_HISTORY_MEMORY_POLICY=new WorldHistoryMemoryPolicy();
    let ACTIVE_WORLD_HISTORY_MEMORY_POLICY=DEFAULT_WORLD_HISTORY_MEMORY_POLICY;
    function historyMemoryLeafKey(messageId){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.leafKey(messageId);}
    function historyMemoryLeafEntries(backend){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.leafEntries(backend);}
    function historyMemoryLeafOrder(name,fallback=0){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.leafOrder(name,fallback);}
    function historyMemoryCollectedIds(backend){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.collectedIds(backend);}
    function historyMemoryInvalidateAncestors(backend,childId){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.invalidateAncestors(backend,childId);}
    function historyMemorySummaryOrder(item,fallback=0){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.summaryOrder(item,fallback);}
    function historyMemoryRootsAtLevel(backend,level){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.rootsAtLevel(backend,level);}
    function historyMemoryBatchForLevel(backend,level){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.batchForLevel(backend,level);}
    function historyMemoryNextKey(backend,level){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.nextKey(backend,level);}
    function historyMemoryParseReply(raw){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.parseReply(raw);}
    function historyMemoryPrompt(world,batch,outputLevel){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.prompt(world,batch,outputLevel);}
    function projectWorldHistoryMemory(backend){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.project(backend);}
    function historyMemoryDigest(backend){return ACTIVE_WORLD_HISTORY_MEMORY_POLICY.digest(backend);}
    class WorldHistoryService {
        constructor(engine,policy=DEFAULT_WORLD_HISTORY_MEMORY_POLICY){this.engine=engine;this.policy=policy||DEFAULT_WORLD_HISTORY_MEMORY_POLICY;}
        project(stat){
            const backend=stat?.世界?.[PATH]||stat||{};
            return this.policy.project(backend);
        }
        setSendToProse(value){
            if(typeof this.engine.setSendHistoryToProse==='function')return this.engine.setSendHistoryToProse(value);
            this.engine.config.sendHistoryToProse=value===true;this.engine.saveConfig?.();return this.engine.config.sendHistoryToProse;
        }
        async summarize(world,batch,level){
            if(typeof this.engine.requestHistoryMemorySummary!=='function')throw new Error("履歴記憶サービスが初期化されていません");
            return this.engine.requestHistoryMemorySummary(world,batch,level);
        }
        backend(){return this.engine.snapshot().stat?.世界?.[PATH]||{};}
        related(value) {
            const source=Array.isArray(value)?value.join('\n'):String(value||'');
            return [...new Set(source.split(/[\n,，、;；]+/).map(item=>item.trim()).filter(Boolean))];
        }
        replaySamePath(left,right) {
            return Array.isArray(left)&&Array.isArray(right)&&left.length===right.length&&left.every((item,index)=>String(item)===String(right[index]));
        }
        syncReplay(raw,fingerprint,path,value) {
            const replay=raw?.__samsaraWorldReplay;
            if(!plain(replay)||String(replay.fingerprint||'')!==String(fingerprint||'')||!Array.isArray(replay.operations))return;
            replay.operations=replay.operations.filter(operation=>!this.replaySamePath(operation?.path,path));
            replay.operations.push({op:'set',path:copy(path),value:copy(value)});
        }
        async commitEdit(kind,name,build,status){
            name=String(name||'').trim();
            if(!name)throw new Error("歴史記録の名称は空にできません");
            const engine=this.engine,snapshot=engine.snapshot(),next=copy(snapshot.raw),stat=next.stat_data,backend=stat?.世界?.[PATH];
            if(!plain(backend))throw new Error("世界バックエンドが存在しません");
            const bucketName=kind==='summary'?'历史总结':'历史',bucket=backend[bucketName];
            if(!plain(bucket)||!plain(bucket[name]))throw new Error((kind==='summary'?"長期歴史総括":"近期歴史アンカー")+"が存在しません："+name);
            const updated=build(copy(bucket[name]));
            if(!plain(updated))throw new Error("歴史編集の結果が無効です");
            bucket[name]=updated;
            this.syncReplay(next,snapshot.fingerprint,['世界',PATH,bucketName,name],updated);
            const target=engine.host,had=!!target&&Object.prototype.hasOwnProperty.call(target,'__samsaraUIMutation'),previous=target?.__samsaraUIMutation;
            if(target)target.__samsaraUIMutation=true;
            try{
                await snapshot.mvu.replaceMvuData(next,{type:'message',message_id:snapshot.id});
            }finally{
                if(target){
                    if(had)target.__samsaraUIMutation=previous;
                    else delete target.__samsaraUIMutation;
                }
            }
            engine.lastHistoryMaintenance=status||"歴史記憶を手動修正しました";
            engine.status=status||"歴史記憶を手動修正しました";
            engine.render(true);
            return true;
        }
        async saveAnchor(name,record){
            const time=String(record?.時間||'').trim(),fact=String(record?.事实||'').trim();
            if(!fact)throw new Error("歴史的事実は空にできません");
            const related=this.related(record?.关联事件);
            return this.commitEdit('anchor',name,current=>({...current,時間:time,事实:fact,关联事件:related}),"近期歴史アンカーを修正しました");
        }
        async saveSummary(name,record){
            const summary=String(record?.要約||'').trim();
            if(!summary)throw new Error("長期歴史要約は空にできません");
            const start=String(record?.起始时间||'').trim(),end=String(record?.结束时间||'').trim();
            return this.commitEdit('summary',name,current=>({...current,要約:summary,起始时间:start,结束时间:end}),"長期歴史総括を修正しました");
        }
    }
    class WorldStateProjector {
        constructor(engine=null,taskLedger=DEFAULT_WORLD_TASK_AWARENESS_SERVICE,history=null){this.engine=engine;this.taskLedger=taskLedger||DEFAULT_WORLD_TASK_AWARENESS_SERVICE;this.history=history||null;}
        omitKeys(value,keys=[]){
            if(!plain(value))return copy(value);
            const out=copy(value);
            for(const key of keys)delete out[key];
            return out;
        }
        abilityMap(value){
            if(!plain(value))return {};
            const out={};
            for(const [name,item] of Object.entries(value)){
                if(!plain(item))continue;
                out[name]=this.omitKeys(item,['原始属性',"最終属性","強化",'真属性']);
            }
            return out;
        }
        equipped(value){
            if(!plain(value))return {};
            const out={};
            for(const [name,item] of Object.entries(value)){
                if(!plain(item)||Number(item.状態)!==1)continue;
                out[name]=this.omitKeys(item,['原始属性',"最終属性","強化",'真属性']);
            }
            return out;
        }
        carriedItems(value){
            if(!plain(value))return {};
            const out={};
            for(const [name,item] of Object.entries(value)){
                if(!plain(item)||Number(item.状態)===2)continue;
                out[name]=this.omitKeys(item,['原始属性',"最終属性","強化",'真属性']);
            }
            return out;
        }
        forms(value){
            if(!plain(value))return {};
            const out={};
            for(const [name,item] of Object.entries(value)){
                if(!plain(item))continue;
                out[name]=this.omitKeys(item,['原始属性',"最終属性","強化",'真属性']);
            }
            return out;
        }
        character(value){
            const source=plain(value)?value:{},out={};
            for(const key of ["登場","種族","身分","職業","階層",'HP_MAX','HP','THP','EP_MAX','EP','性格',"好み","外見","服装","仲間",'好感度',"態度","背景",'数量']){
                if(Object.hasOwn(source,key))out[key]=copy(source[key]);
            }
            const 状態=this.abilityMap(source.状態),血統=this.abilityMap(source.血統),技能=this.abilityMap(source.技能);
            const 装備=this.equipped(source.装備),道具=this.carriedItems(source.道具),形態庫=this.forms(source.形態庫);
            if(Object.keys(状態).length)out.状態=状態;
            if(Object.keys(血統).length)out.血統=血統;
            if(Object.keys(技能).length)out.技能=技能;
            if(Object.keys(装備).length)out.装備=装備;
            if(Object.keys(道具).length)out.道具=道具;
            if(Object.keys(形態庫).length)out.形態庫=形態庫;
            if(plain(source.現在形態))out.現在形態=copy(source.現在形態);
            return out;
        }
        assets(value){
            if(!plain(value))return {};
            const out={};
            for(const [name,asset] of Object.entries(value)){
                if(!plain(asset))continue;
                const item=copy(asset);
                if(plain(item.建設シーケンス)){
                    for(const seq of Object.values(item.建設シーケンス||{})){
                        if(!plain(seq))continue;
                        delete seq.次回産出日;
                        delete seq.次回産出游日;
                    }
                }
                out[name]=item;
            }
            return out;
        }
        tailRecord(value,limit){
            if(!plain(value))return {};
            return Object.fromEntries(Object.entries(value).slice(-Math.max(0,Number(limit)||0)).map(([key,item])=>[key,copy(item)]));
        }
        causalOrbit(value,currentStability){
            const orbit=plain(value)?value:{},entries=Object.entries(orbit.偏移記録||{});
            const recent=entries.slice(-HOT_OFFSET_TARGET);
            const total=entries.reduce((sum,[,item])=>sum+(Number(item?.影響度)||0),0);
            return {
                現在段階:orbit.現在段階,
                ストーリーライン:orbit.ストーリーライン,
                次ノード:orbit.次ノード,
                偏移記録:Object.fromEntries(recent.map(([name,item])=>[name,copy(item)])),
                偏移摘要:{
                    记录总数:entries.length,
                    隐藏旧记录数:Math.max(0,entries.length-recent.length),
                    累计影响:total,
                    当前稳定:currentStability
                }
            };
        }
        baseWorld(stat){
            const src=plain(stat)?stat:{},world=plain(src.世界)?src.世界:{},backend=plain(world[PATH])?world[PATH]:{};
            const projectedBackend={
                版本:backend.版本,
                処理済み時刻:backend.処理済み時刻,
                事件:copy(backend.事件||{}),
                人物:projectHotWorldPeople(src),
                势力地区:copy(backend.势力地区||{}),
                传播:this.tailRecord(backend.传播,HOT_PROPAGATION_TARGET)
            };
            projectedBackend.历史记忆=this.history?.project?this.history.project(backend):DEFAULT_WORLD_HISTORY_MEMORY_POLICY.project(backend);
            for(const area of Object.values(projectedBackend.势力地区||{}))if(plain(area))delete area.资源点;
            const out={
                世界:{
                    時間:world.時間,
                    地点:world.地点,
                    名称:world.名称,
                    位格:world.位格,
                    難易度:world.難易度,
                    安定:world.安定,
                    法則:copy(world.法則||[]),
                    通貨:copy(world.通貨||{}),
                    暦法:copy(world.暦法||{}),
                    探索:copy(world.探索||{}),
                    勢力:copy(world.勢力||{}),
                    因果軌道:this.causalOrbit(world.因果軌道,world.安定),
                    異端レーダー:copy(world.異端レーダー||{}),
                    [PATH]:projectedBackend
                },
                キャラ:this.character(src.キャラ),
                関係リスト:{},
                资产:this.assets(src.资产),
                资产删除保护:Object.keys(backend.资产墓碑||{}).filter(name=>!stableNameIn(src.资产||{},name)).slice(-50),
                噂:copy(src.噂||{}),
                システム状態:{
                    戦闘中:!!src.システム状態?.戦闘中,
                    主神空間滞在中:!!src.システム状態?.主神空間滞在中
                }
            };
            for(const [name,person] of Object.entries(src.関係リスト||{}))out.関係リスト[name]=this.character(person);
            if(!Object.keys(out.キャラ||{}).length)delete out.キャラ;
            if(!Object.keys(out.関係リスト).length)delete out.関係リスト;
            if(!Object.keys(out.资产).length)delete out.资产;
            if(!out.资产删除保护.length)delete out.资产删除保护;
            if(!Object.keys(out.噂).length)delete out.噂;
            const tasks=this.taskLedger.projectList(src?.任務?.リスト);
            if(Object.keys(tasks).length)out.任務={リスト:tasks};
            return out;
        }
        world(stat){return this.baseWorld(stat);}
    }

    const DEFAULT_WORLD_STATE_PROJECTOR=new WorldStateProjector();
    let ACTIVE_WORLD_STATE_PROJECTOR=DEFAULT_WORLD_STATE_PROJECTOR;
    function requireWorldStateProjector(){
        if(!ACTIVE_WORLD_STATE_PROJECTOR)throw new Error("WorldStateProjector が初期化されていません");
        return ACTIVE_WORLD_STATE_PROJECTOR;
    }
    function omitKeys(value,keys=[]){return requireWorldStateProjector().omitKeys(value,keys);}
    function projectAbilityMap(value){return requireWorldStateProjector().abilityMap(value);}
    function projectEquipped(value){return requireWorldStateProjector().equipped(value);}
    function projectCarriedItems(value){return requireWorldStateProjector().carriedItems(value);}
    function projectForms(value){return requireWorldStateProjector().forms(value);}
    function projectCharacterForWorld(value){return requireWorldStateProjector().character(value);}
    function projectAssetsForWorld(value){return requireWorldStateProjector().assets(value);}
    function projectCausalOrbitForWorld(value,currentStability){return requireWorldStateProjector().causalOrbit(value,currentStability);}
    function projectWorldContext(stat){return requireWorldStateProjector().baseWorld(stat);}

    class WorldResultCompiler {
        constructor(engine,normalizer,materializer,staging,patchPolicy){
            this.engine=engine;
            this.normalizer=normalizer||new WorldResultNormalizer();
            this.patchPolicy=patchPolicy||DEFAULT_WORLD_PATCH_POLICY;
            this.materializer=materializer||new WorldResultMaterializer(this.normalizer,undefined,undefined,undefined,this.patchPolicy);
            this.staging=staging||new WorldResultStagingService(this.normalizer,this.materializer);
        }
        normalize(value){return this.normalizer.normalizeWorldResult(value);}
        stage(stat,accepted,incoming,validate){return this.staging.stage(stat,accepted,incoming,validate);}
        // All compile preprocessing is now canonical; the global compileWorldResult name is compatibility-only.
        compile(stat,value){return this.materializer.compileWorldResult(stat,value);}
        materialize(stat,seedPatches,modelPatches){return this.materializer.materializeWorldUpdate(stat,seedPatches,modelPatches);}
        sanitizeLegacy(patches){return this.patchPolicy.sanitizeModelPatches(this.patchPolicy.normalizeModelPatches(patches));}
    }
    class WorldValidationService {
        constructor(engine,policy,npcAudit){this.engine=engine;this.policy=policy||new WorldValidationPolicy();this.npcAudit=npcAudit||DEFAULT_WORLD_NPC_AUDIT_SERVICE;}
        validate(next,request,acceptedWorldResult,baseStat,options={}){
            const base=baseStat||{};
            // Transitional compatibility: legacy runtime features still decorate these global seams.
            // Their base implementations are owned by WorldValidationPolicy through ACTIVE_WORLD_VALIDATION_POLICY.
            ensureDueHandled(next,request?.due||[],base?.世界?.時間);
            ensureEventTimeAnchors(next,request?.unscheduled||[]);
            ensureStaleActiveHandled(next,request?.staleActive||[],base?.世界?.時間);
            ensureTemporalAnomaliesResolved(next,request?.timeAnomalies||[]);
            ensureActiveAlienActivity(next,request?.alienActivity||[],acceptedWorldResult,base?.世界?.時間);
            if(options.includeNpcAudit!==false&&Array.isArray(request?.npcAudit))this.npcAudit.ensureProgress(next,request.npcAudit,acceptedWorldResult);
            ensureMacroBackbone(next,request?.timeline||{},this.engine.config.requireMacroBackbone!==false);
            return true;
        }
        progressionAnchorChanged(before,current){
            return this.policy.progressionAnchorChanged(before,current);
        }
    }
    class WorldCommitService {
        constructor(engine){this.engine=engine;}
        recentChanges(patches,worldTime){
            return (patches||[]).map(patch=>{
                const parts=tokens(patch.path),back=parts[1]===PATH,asset=parts[0]==='资产';
                return {
                    時間:worldTime,
                    类别:asset?'资产':back?parts[2]:parts[1],
                    名称:asset?parts[1]:back?parts[3]:parts[2],
                    字段:asset?'资产':parts.at(-1),
                    操作:patch.op==='add'?"追加":patch.op==='remove'?"削除":'更新',
                    内容:typeof patch.value==='string'?patch.value:plain(patch.value)
                        ?(patch.value.説明||patch.value.行动||patch.value.事实||patch.value.目標||patch.value.状態||patch.value.内容||"記録を更新しました")
                        :''
                };
            });
        }
        prepare({next,committedPatches=[],base,acceptedWorldResult=null,reply,validate}){
            const engine=this.engine;
            if(!plain(next)||!base?.stat)throw new Error("世界の確定処理に書き込み対象の状態がありません");
            if(!(next.設定||{}).世界超安定){
                const offsets=(next.世界?.因果軌道||{}).偏移記録||{};
                const total=Object.values(offsets).reduce((sum,record)=>sum+(Number(record?.影響度)||0),0);
                next.世界.安定=Math.max(0,Math.min(120,100+total));
            }
            if(!plain(next.世界?.[PATH]))next.世界[PATH]=emptyState();
            next.世界[PATH].処理済みフロア=base.fingerprint;
            next.世界[PATH].処理済み時刻=base.stat.世界?.時間;
            next.世界[PATH].最近变化=this.recentChanges(committedPatches,base.stat.世界?.時間).slice(-100);

            if(typeof engine.beforeWorldCommit==='function')engine.beforeWorldCommit(next,{
                messageId:base.id,
                fingerprint:base.fingerprint,
                worldResult:acceptedWorldResult,
                reply:copy(reply),
                baseStat:base.stat
            });

            if(typeof validate==='function'){
                const checked=validate(next);
                for(const patch of committedPatches){
                    if(patch.op==='remove')continue;
                    if(!same(get(checked,tokens(patch.path)),get(next,tokens(patch.path))))throw schemaMismatchError(next,checked,patch.path);
                }
            }
            const nextReply=copy(reply||{});
            nextReply.patches=copy(committedPatches);
            return {next,reply:nextReply};
        }
        async persist(prepared,base){
            if(!prepared?.current?.raw||!prepared?.current?.mvu||!prepared?.next)throw new Error("世界の確定処理のコンテキストが不完全です");
            const result=prepared.current.raw;
            result.stat_data=prepared.next;
            const replay=typeof this.engine.buildWorldReplayPackage==='function'
                ?this.engine.buildWorldReplayPackage(base.stat,prepared.next,base.fingerprint)
                :null;
            if(replay)result.__samsaraWorldReplay=replay;
            await prepared.current.mvu.replaceMvuData(result,{type:'message',message_id:base.id});
            return result;
        }
    }
    class WorldMutationService {
        constructor(engine){this.engine=engine;}
        snapshot(){return this.engine.snapshot();}
        backend(stat){
            const backend=stat?.世界?.[PATH];
            if(!plain(backend))throw new Error("世界バックエンドが存在しません");
            return backend;
        }
        textList(value){
            if(Array.isArray(value))return [...new Set(value.map(item=>String(item||'').trim()).filter(Boolean))];
            return [...new Set(String(value||'').split(/[\n,，、;；]+/).map(item=>item.trim()).filter(Boolean))];
        }
        jsonList(value,label="リスト"){
            if(Array.isArray(value))return copy(value);
            const raw=String(value||'').trim();
            if(!raw)return [];
            let parsed;
            try{parsed=JSON.parse(raw);}catch(_){throw new Error(label+"有効な JSON 配列が必要です");}
            if(!Array.isArray(parsed))throw new Error(label+"JSON 配列が必要です");
            return parsed;
        }
        pathConflict(left,right){
            if(!Array.isArray(left)||!Array.isArray(right))return false;
            const limit=Math.min(left.length,right.length);
            for(let index=0;index<limit;index++)if(String(left[index])!==String(right[index]))return false;
            return true;
        }
        mergeReplay(raw,fingerprint,beforeStat,afterStat){
            const replay=raw?.__samsaraWorldReplay;
            if(!plain(replay)||String(replay.fingerprint||'')!==String(fingerprint||'')||!Array.isArray(replay.operations))return false;
            const engine=this.engine;
            if(!engine||typeof engine.buildWorldReplayPackage!=='function')return false;
            const delta=engine.buildWorldReplayPackage(beforeStat,afterStat,fingerprint);
            if(!plain(delta)||!Array.isArray(delta.operations)||!delta.operations.length)return false;
            for(const incoming of delta.operations){
                replay.operations=replay.operations.filter(existing=>!this.pathConflict(existing?.path,incoming?.path));
                replay.operations.push(copy(incoming));
            }
            return true;
        }
        async commit(mutator,status){
            if(typeof mutator!=='function')return false;
            const engine=this.engine,snapshot=engine.snapshot(),next=copy(snapshot.raw),stat=next.stat_data;
            this.backend(stat);
            const outcome=mutator(stat);
            if(!outcome)return false;
            this.mergeReplay(next,snapshot.fingerprint,snapshot.stat,stat);
            const target=engine.host,had=!!target&&Object.prototype.hasOwnProperty.call(target,'__samsaraUIMutation'),previous=target?.__samsaraUIMutation;
            if(target)target.__samsaraUIMutation=true;
            try{
                await snapshot.mvu.replaceMvuData(next,{type:'message',message_id:snapshot.id});
            }finally{
                if(target){
                    if(had)target.__samsaraUIMutation=previous;
                    else delete target.__samsaraUIMutation;
                }
            }
            engine.status=status||"世界進行の記録を手動で修正しました";
            engine.render(true);
            return true;
        }
    }
    const WORLD_SNAPSHOT_STORAGE='samsara_world_engine_snapshots_v1';
    const WORLD_SNAPSHOT_PER_CHAT=12;
    const WORLD_SNAPSHOT_STORAGE_LIMIT=36;

    class WorldSnapshotService {
        constructor(engine,mutations=null){this.engine=engine;this.mutations=mutations;}
        storage(){return this.engine?.host?.localStorage||null;}
        chatId(snapshot){
            try{return String(JSON.parse(String(snapshot?.fingerprint||''))?.[0]??'');}catch(_){return '';}
        }
        readAll(){
            let raw=[];
            try{raw=JSON.parse(this.storage()?.getItem?.(WORLD_SNAPSHOT_STORAGE)||'[]');}catch(_){raw=[];}
            return (Array.isArray(raw)?raw:[]).filter(item=>plain(item)&&item.id&&plain(item.data)).slice(0,WORLD_SNAPSHOT_STORAGE_LIMIT);
        }
        writeAll(items){
            const clean=(Array.isArray(items)?items:[]).slice(0,WORLD_SNAPSHOT_STORAGE_LIMIT);
            try{this.storage()?.setItem?.(WORLD_SNAPSHOT_STORAGE,JSON.stringify(clean));}catch(error){throw new Error("世界スナップショットの保存に失敗："+String(error?.message||error));}
            return clean;
        }
        list(){
            const snapshot=this.engine.snapshot(),chat=this.chatId(snapshot);
            return this.readAll().filter(item=>!chat||String(item.chatId||'')===chat);
        }
        create(name=''){
            const snapshot=this.engine.snapshot(),stat=snapshot.stat||{},world=stat.世界||{},chat=this.chatId(snapshot);
            const cleanName=String(name||'').trim().slice(0,80)||String(world.時間||"世界スナップショット");
            const item={
                id:'ws-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
                name:cleanName,
                createdAt:new Date().toISOString(),
                chatId:chat,
                worldName:String(world.名称||''),
                worldTime:String(world.時間||''),
                data:{
                    世界:copy(stat.世界||{}),
                    资产:copy(stat.资产||{}),
                    関係リスト:copy(stat.関係リスト||{}),
                    噂:copy(stat.噂||{})
                }
            };
            const rest=this.readAll().filter(old=>String(old.id)!==item.id);
            const sameChat=rest.filter(old=>String(old.chatId||'')===chat).slice(0,WORLD_SNAPSHOT_PER_CHAT-1);
            const otherChats=rest.filter(old=>String(old.chatId||'')!==chat);
            this.writeAll([item,...sameChat,...otherChats]);
            return copy(item);
        }
        remove(id){
            const before=this.readAll(),after=before.filter(item=>String(item.id)!==String(id||''));
            if(after.length===before.length)return false;
            this.writeAll(after);return true;
        }
        async restore(id){
            const snapshot=this.engine.snapshot(),chat=this.chatId(snapshot),item=this.readAll().find(entry=>String(entry.id)===String(id||''));
            if(!item)throw new Error("世界スナップショットが存在しません");
            if(item.chatId&&chat&&String(item.chatId)!==chat)throw new Error("別チャットのスナップショットは復元できません");
            if(item.worldName&&snapshot.stat?.世界?.名称&&String(item.worldName)!==String(snapshot.stat.世界.名称))throw new Error("別世界のスナップショットでは直接上書きできません");
            const commit=this.mutations?.commit?.bind(this.mutations);
            if(!commit)throw new Error("世界スナップショット復元サービスが初期化されていません");
            return commit(stat=>{
                stat.世界=copy(item.data.世界||stat.世界||{});
                stat.资产=copy(item.data.资产||{});
                stat.関係リスト=copy(item.data.関係リスト||{});
                stat.噂=copy(item.data.噂||{});
                if(!plain(stat.世界?.[PATH]))stat.世界[PATH]=emptyState();
                stat.世界[PATH].処理済みフロア='';
                stat.世界[PATH].処理済み時刻='';
                return true;
            },"世界スナップショットを復元しました："+item.name);
        }
    }
    class WorldEventService {
        constructor(engine){this.engine=engine;}
        retargetReferences(stat,oldName,newName,deleted=false){
            const backend=this.engine.services.mutations.backend(stat);
            const retarget=list=>{
                if(!Array.isArray(list))return [];
                const out=[];
                for(const item of list){
                    const value=String(item||'');
                    if(value!==oldName){if(value&&!out.includes(value))out.push(value);continue;}
                    if(!deleted&&newName&&!out.includes(newName))out.push(newName);
                }
                return out;
            };
            for(const [name,event] of Object.entries(backend.事件||{})){
                if(name===newName&&!deleted)continue;
                if(Array.isArray(event?.前因))event.前因=retarget(event.前因);
            }
            for(const category of ['人物','势力地区','传播','历史']){
                for(const record of Object.values(backend[category]||{})){
                    if(Array.isArray(record?.关联事件))record.关联事件=retarget(record.关联事件);
                }
            }
            const orbit=stat?.世界?.因果軌道;
            if(plain(orbit)&&String(orbit.次ノード||'')===oldName)orbit.次ノード=deleted?'':newName;
        }
        validateGraph(stat){
            const backend=this.engine.services.mutations.backend(stat),events=backend.事件||{};
            for(const [name,event] of Object.entries(events)){
                if(!plain(event))throw new Error("無効な事件記録："+name);
                if(!["発生待ち","進行中","完了","取消済み"].includes(String(event.状態||'')))throw new Error("事件の状態は発生待ち・進行中・完了・取消済みのみです");
                if(!EVENT_CATEGORIES.has(String(event.分类||'')))throw new Error("事件の分類は現在事件・直近の節目・大局的な節目のみです");
                if(!Array.isArray(event.前因))throw new Error("事件の前因は配列で指定してください");
                if(event.前因.includes(name))throw new Error("事件は自身を前因にできません："+name);
                for(const cause of event.前因)if(!Object.hasOwn(events,cause))throw new Error("事件の前因が存在しません："+cause);
            }
            const visiting=new Set(),visited=new Set();
            const visit=name=>{
                if(visiting.has(name))throw new Error("イベントの前因が循環しています");
                if(visited.has(name))return;
                visiting.add(name);
                for(const cause of events[name]?.前因||[])visit(cause);
                visiting.delete(name);visited.add(name);
            };
            Object.keys(events).forEach(visit);
            for(const category of ['人物','势力地区','传播','历史']){
                for(const record of Object.values(backend[category]||{})){
                    if(!Array.isArray(record?.关联事件))continue;
                    for(const eventName of record.关联事件)if(!Object.hasOwn(events,eventName))throw new Error(category+"存在しない事件が関連付けられています："+eventName);
                }
            }
        }
        get(name){
            const events=this.engine.snapshot().stat?.世界?.[PATH]?.事件||{};
            return plain(events?.[name])?events[name]:null;
        }
        async save(oldName,newName,record){
            oldName=String(oldName||'').trim();newName=String(newName||'').trim();
            if(!oldName||!newName)throw new Error("事件名は空にできません");
            if(forbidden.has(newName))throw new Error("事件名に不正なキーが含まれています");
            return this.engine.services.mutations.commit(stat=>{
                const mutations=this.engine.services.mutations,backend=mutations.backend(stat),events=backend.事件||{};
                const current=events[oldName];
                if(!plain(current))throw new Error("事件が存在しません："+oldName);
                if(newName!==oldName&&Object.hasOwn(events,newName))throw new Error("同じ事件名がすでに存在します："+newName);
                const next=normalizeBackendRecord('事件',record,current);
                next.前因=mutations.textList(next.前因);
                next.参与者=mutations.textList(next.参与者);
                next.关联任务=mutations.textList(next.关联任务);
                next.可见影响=mutations.jsonList(next.可见影响,'可见影响');
                if(next.前因.includes(oldName)||next.前因.includes(newName))throw new Error("事件は自身を前因にできません");
                if(newName!==oldName)delete events[oldName];
                events[newName]=next;
                if(newName!==oldName)this.retargetReferences(stat,oldName,newName,false);
                this.validateGraph(stat);
                return {oldName,newName};
            },newName===oldName?"世界事件を修正しました："+newName:"世界事件の名前と内容を修正しました："+oldName+' → '+newName);
        }
        async remove(name){
            name=String(name||'').trim();if(!name)return false;
            return this.engine.services.mutations.commit(stat=>{
                const backend=this.engine.services.mutations.backend(stat),events=backend.事件||{};
                if(!plain(events[name]))return null;
                delete events[name];
                this.retargetReferences(stat,name,'',true);
                this.validateGraph(stat);
                return {deleted:name};
            },"誤った世界事件を削除しました："+name);
        }
    }
    class WorldRequestService {
        constructor(engine=null){this.engine=engine;}
        build(base){return this.engine.buildRequest(base||this.engine.snapshot());}
        preview(){return this.engine.preview?.();}
        request(system,input,options){return this.engine.requestAI(system,input,options);}
        retryableModelFailure(error){
            const message=String(error?.message||error||'');
            if(!message)return false;
            if(/^(?:请求已取消|上下文已经切换|推演期间世界时间或副本锚点发生变化|请在主神终端设置|请加载更新后的|禁止写入：|リクエストを取り消しました|コンテキストが切り替わった|シミュレーション中に世界時刻|主神端末の設定で|更新済みの.*読み込|書き込み禁止：)/.test(message))return false;
            if(error?.name==='AbortError')return false;
            return true;
        }
        retryRequirement(acceptedResult,retryPlan=[]){
            const prompts=this.engine?.services?.prompts;
            if(prompts?.retryRequirement)return prompts.retryRequirement(acceptedResult,retryPlan);
            if(acceptedResult)return Array.isArray(retryPlan)&&retryPlan.length?WORLD_PROMPT_RETRY_ACCEPTED_PLAN:WORLD_PROMPT_RETRY_ACCEPTED;
            return WORLD_PROMPT_RETRY_FRESH;
        }
        retryInput(baseInput,error,lastReply,attempt,maxAttempts,acceptedResult,retryPlan=[]){
            let payload;try{payload=JSON.parse(baseInput);}catch(_){payload={原始请求:baseInput};}
            const feedback=retryFeedback(error,error?.rejectedSlices,Array.isArray(retryPlan)?retryPlan:[]);
            const plan=feedback.actions;
            payload.纠错重试={
                当前尝试:attempt+1,
                最大尝试次数:maxAttempts,
                上次拒绝原因:feedback.summary,
                具体问题:feedback.issues.length?feedback.issues:undefined,
                上次模型回复:String(lastReply||'').slice(-12000),
                已接受业务结果:acceptedResult?copy(acceptedResult):undefined,
                补充清单:plan.length?copy(plan):undefined,
                要求:this.retryRequirement(acceptedResult,this.engine?retryPlan:plan)
            };
            if(payload.纠错重试.已接受业务结果===undefined)delete payload.纠错重试.已接受业务结果;
            if(payload.纠错重试.补充清单===undefined)delete payload.纠错重试.补充清单;
            return JSON.stringify(payload,null,2);
        }
    }

    const DEFAULT_WORLD_REQUEST_SERVICE=new WorldRequestService();
    let ACTIVE_WORLD_REQUEST_SERVICE=DEFAULT_WORLD_REQUEST_SERVICE;
    function retryableModelFailure(error){return ACTIVE_WORLD_REQUEST_SERVICE.retryableModelFailure(error);}
    function retryInput(baseInput,error,lastReply,attempt,maxAttempts,acceptedResult,retryPlan=[]){
        return ACTIVE_WORLD_REQUEST_SERVICE.retryInput(baseInput,error,lastReply,attempt,maxAttempts,acceptedResult,retryPlan);
    }

    class WorldApiTransportService {
        constructor(engine,telemetry=DEFAULT_WORLD_TOKEN_TELEMETRY){this.engine=engine;this.telemetry=telemetry||DEFAULT_WORLD_TOKEN_TELEMETRY;this.modeCache=engine.apiModeCache||{};}
        normalize(value){
            const api=plain(value)?value:{};
            return {
                enabled:api.enabled===true,
                apiUrl:String(api.apiUrl||'').trim(),
                apiKey:String(api.apiKey||''),
                model:String(api.model||'').trim(),
                apiPresets:Array.isArray(api.apiPresets)?api.apiPresets.filter(plain).map(p=>({
                    name:String(p.name||'').trim().slice(0,80),
                    apiUrl:String(p.apiUrl||'').trim(),
                    apiKey:String(p.apiKey||''),
                    model:String(p.model||'').trim()
                })).filter(p=>p.name).slice(0,30):[],
                fetchedModels:Array.isArray(api.fetchedModels)?api.fetchedModels.map(String).filter(Boolean).slice(0,500):[]
            };
        }
        usesDedicated(){return this.engine.config?.dedicatedApi?.enabled===true;}
        ready(){
            const api=this.engine.config?.dedicatedApi||{};
            return api.enabled===true&&!!String(api.apiUrl||'').trim()&&!!String(api.model||'').trim();
        }
        sourceLabel(){return this.usesDedicated()?"世界進行システム専用 API":"主神端末の追加モデル";}
        set(patch){
            const engine=this.engine,current=this.normalize(engine.config.dedicatedApi);
            const next=this.normalize(Object.assign({},current,plain(patch)?patch:{}));
            if(patch&&Object.hasOwn(patch,'apiUrl')&&String(patch.apiUrl||'').trim()!==current.apiUrl)next.fetchedModels=[];
            engine.config.dedicatedApi=next;engine.saveConfig();return next;
        }
        savePreset(name){
            const engine=this.engine,clean=String(name||'').trim().slice(0,80);
            if(!clean)throw new Error("まず API プリセット名を入力してください");
            const api=this.normalize(engine.config.dedicatedApi),entry={name:clean,apiUrl:api.apiUrl,apiKey:api.apiKey,model:api.model};
            const idx=api.apiPresets.findIndex(p=>p.name===clean);
            if(idx>=0)api.apiPresets[idx]=entry;else api.apiPresets.unshift(entry);
            api.apiPresets=api.apiPresets.slice(0,30);engine.config.dedicatedApi=api;engine.saveConfig();return entry;
        }
        deletePreset(name){
            const engine=this.engine,clean=String(name||'').trim(),api=this.normalize(engine.config.dedicatedApi);
            const before=api.apiPresets.length;api.apiPresets=api.apiPresets.filter(p=>p.name!==clean);
            engine.config.dedicatedApi=api;engine.saveConfig();return before!==api.apiPresets.length;
        }
        applyPreset(name){
            const engine=this.engine,api=this.normalize(engine.config.dedicatedApi),preset=api.apiPresets.find(p=>p.name===String(name||''));
            if(!preset)throw new Error("API プリセットが存在しません");
            api.apiUrl=preset.apiUrl;api.apiKey=preset.apiKey;api.model=preset.model;api.fetchedModels=[];
            engine.config.dedicatedApi=api;engine.saveConfig();return api;
        }
        endpoint(kind='chat'){
            const api=this.normalize(this.engine.config.dedicatedApi);
            let endpoint=String(api.apiUrl||'').trim().replace(/\/+$/,'');
            if(!endpoint)throw new Error("先に専用 API のアドレスを入力してください");
            if(kind==='models'){
                if(/\/chat\/completions$/i.test(endpoint))endpoint=endpoint.replace(/\/chat\/completions$/i,'/models');
                else if(/\/v1$/i.test(endpoint))endpoint+='/models';
                else if(/\/v1\//i.test(endpoint))endpoint=endpoint.replace(/\/v1\/.*$/i,'/v1/models');
                else endpoint+=/\/v\d+$/i.test(endpoint)?'/models':'/v1/models';
                return endpoint;
            }
            if(/\/chat\/completions$/i.test(endpoint))return endpoint;
            if(/\/v1$/i.test(endpoint))return endpoint+'/chat/completions';
            if(/\/v1\//i.test(endpoint))return endpoint.replace(/\/v1\/.*$/i,'/v1/chat/completions');
            return endpoint+(/\/v\d+$/i.test(endpoint)?'/chat/completions':'/v1/chat/completions');
        }
        async fetchModels(){
            const engine=this.engine,api=this.normalize(engine.config.dedicatedApi),fetcher=engine.host.fetch||(typeof fetch!=='undefined'?fetch:null);
            if(!fetcher)throw new Error("現在の環境に fetchがありません");
            const headers={};if(api.apiKey.trim())headers.Authorization='Bearer '+api.apiKey.trim();
            const response=await fetcher(this.endpoint('models'),{headers});
            if(!response.ok){
                let body='';try{body=await response.text();}catch(_){}
                throw new Error("モデルの読み込みに失敗：HTTP "+response.status+(body?' / '+body.slice(0,240):''));
            }
            const body=await response.json(),raw=Array.isArray(body?.data)?body.data:Array.isArray(body?.models)?body.models:[];
            const models=raw.map(item=>typeof item==='string'?item:item?.id||item?.name).filter(Boolean).map(String);
            if(!models.length)throw new Error("API が返したモデル一覧は空です");
            api.fetchedModels=Array.from(new Set(models)).sort().slice(0,500);
            if(api.model&&!api.fetchedModels.includes(api.model))api.fetchedModels.unshift(api.model);
            engine.config.dedicatedApi=api;engine.saveConfig();return api.fetchedModels;
        }
        structuredUnsupported(status,body){
            const code=Number(status),text=String(body||'');
            return [400,404,415,422].includes(code)&&/response[_ -]?format|json[_ -]?schema|json[_ -]?object|unknown (?:field|parameter)|unrecognized|unsupported|not supported|invalid.*schema|INVALID_ARGUMENT|invalid[_ -]?argument/i.test(text);
        }
        async requestDedicated(system,input,options={}){
            const engine=this.engine,api=this.normalize(engine.config.dedicatedApi),fetcher=engine.host.fetch||(typeof fetch!=='undefined'?fetch:null);
            if(!this.ready())throw new Error("世界進行システム専用 API は有効ですが、アドレスまたはモデルが未設定です");
            if(!fetcher)throw new Error("現在の環境に fetchがありません");
            const endpoint=this.endpoint('chat'),headers={'Content-Type':'application/json'};
            if(api.apiKey.trim())headers.Authorization='Bearer '+api.apiKey.trim();
            const model=String(options.model||api.model||'').trim();
            if(!model)throw new Error("世界進行専用 API に利用可能なモデルがありません");
            const cacheKey=endpoint+'|'+model,wants=options.structured==='auto'&&plain(options.schema);
            const cached=wants?this.modeCache[cacheKey]:'';
            const modes=!wants?['plain']:cached==='json_schema'?['json_schema','json_object','plain']:cached==='json_object'?['json_object','plain']:cached==='plain'?['plain']:['json_schema','json_object','plain'];
            let lastError='';const modeAttempts=[];
            for(const mode of modes){
                modeAttempts.push(mode);
                const body={model,messages:[{role:'system',content:String(system||'')},{role:'user',content:String(input||'')}],stream:false,temperature:Number.isFinite(Number(options.temperature))?Number(options.temperature):0.3};
                if(mode==='json_schema')body.response_format={type:'json_schema',json_schema:{name:String(options.schemaName||'samsara_world_result').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64),strict:false,schema:options.schema}};
                else if(mode==='json_object')body.response_format={type:'json_object'};
                const response=await fetcher(endpoint,{method:'POST',headers,body:JSON.stringify(body),signal:options.signal});
                if(!response.ok){
                    let err='';try{err=await response.text();}catch(_){}
                    lastError='HTTP '+response.status+': '+response.statusText+(err?' / '+err.slice(0,300):'');
                    if(mode!=='plain'&&this.structuredUnsupported(response.status,err)){delete this.modeCache[cacheKey];continue;}
                    engine.lastTransportInfo={接口:"世界進行システム専用 API",模型:model,结构化模式:mode,尝试模式:copy(modeAttempts),usage:null};
                    throw new Error(lastError);
                }
                const data=await response.json(),message=data?.choices?.[0]?.message,raw=message?.content;
                const content=typeof raw==='string'?raw:(plain(raw)?JSON.stringify(raw):message?.parsed?JSON.stringify(message.parsed):'');
                if(!content)throw new Error("専用 API の返却内容が空です");
                if(wants)this.modeCache[cacheKey]=mode;
                engine.apiModeCache=this.modeCache;
                engine.lastTransportInfo={接口:"世界進行システム専用 API",模型:model,结构化模式:mode,尝试模式:copy(modeAttempts),usage:this.telemetry.normalizeUsage(data?.usage)};
                return content;
            }
            throw new Error(lastError||"専用 API は現在の構造化出力モードに対応していません");
        }
        async request(system,input,options={}){
            const engine=this.engine;
            if(this.usesDedicated()){
                const api=this.normalize(engine.config.dedicatedApi);
                engine.lastTransportInfo={接口:"世界進行システム専用 API",模型:String(options.model||api.model||''),结构化模式:"請求中",尝试模式:[],usage:null};
                return this.requestDedicated(system,input,options);
            }
            const terminal=engine.host.Samsara&&engine.host.Samsara.terminal;
            if(!terminal||typeof terminal.request!=='function'||!terminal.apiReady?.())throw new Error("主神端末の設定で追加モデルを有効にして、モデルを選んでください");
            engine.lastTransportInfo={接口:"主神端末の追加モデル",模型:String(options.model||terminal.currentModel?.()||''),结构化模式:options.structured==='auto'?"auto（主神端末がネゴシエート）":'plain',尝试模式:[],usage:null};
            return terminal.request(system,input,options);
        }
    }
    class WorldPromptDocumentService {
        constructor(engine){this.engine=engine;}
        setPreset(text){
            const engine=this.engine;
            if(typeof text!=='string'||text.length>30000)throw new Error("プリセットは30000文字までです");
            engine.config.preset=normalizeEditablePreset(text);
            engine.config.presetEditorVersion=2;
            engine.saveConfig();
            return engine.config.preset;
        }
        currentSettings(){
            const engine=this.engine,config=engine.config||{};
            return {
                preset:config.preset,
                corePrompt:config.corePrompt??CORE_WORLD_RULES,
                macroPrompt:config.macroPrompt??DEFAULT_MACRO_PROMPT,
                stabilityPromptTemplate:config.stabilityPromptTemplate??DEFAULT_STABILITY_PROMPT_TEMPLATE,
                npcAuditPrompt:config.npcAuditPrompt,
                structurePrompt:config.structurePrompt??WORLD_RESULT_CONTRACT.instruction(),
                contextTurns:Math.max(1,Math.min(100,Number(config.contextTurns)||6)),
                activationMode:config.activationMode||'respect_activation',
                selectedEntries:Array.isArray(config.selectedEntries)?copy(config.selectedEntries):null
            };
        }
        applySettings(settings){
            const engine=this.engine;
            if(!plain(settings)||typeof settings.preset!=='string'||settings.preset.length>30000)throw new Error("プリセットドキュメントの内容が無効か、30000文字を超えています");
            for(const [name,value] of [["核心制約",settings.corePrompt],["マクロ骨格プロンプト",settings.macroPrompt],["世界自救プロンプト",settings.stabilityPromptTemplate]]){
                if(value!==undefined&&(typeof value!=='string'||value.length>30000))throw new Error(name+"は30000文字以内にしてください");
            }
            if(settings.npcAuditPrompt!==undefined&&(typeof settings.npcAuditPrompt!=='string'||settings.npcAuditPrompt.length>30000))throw new Error("NPC監査プロンプトは30000文字以内です");
            if(settings.structurePrompt!==undefined&&(typeof settings.structurePrompt!=='string'||settings.structurePrompt.length>30000))throw new Error("構造プロンプトは30000文字以内です");
            engine.config.corePrompt=settings.corePrompt===undefined?CORE_WORLD_RULES:settings.corePrompt;
            engine.config.macroPrompt=settings.macroPrompt===undefined?DEFAULT_MACRO_PROMPT:settings.macroPrompt;
            engine.config.stabilityPromptTemplate=settings.stabilityPromptTemplate===undefined?DEFAULT_STABILITY_PROMPT_TEMPLATE:settings.stabilityPromptTemplate;
            engine.config.npcAuditPrompt=settings.npcAuditPrompt===undefined?NPC_BUILD_AUDIT_RULES:settings.npcAuditPrompt;
            engine.config.structurePrompt=settings.structurePrompt===undefined?WORLD_RESULT_CONTRACT.instruction():settings.structurePrompt;
            engine.config.preset=normalizeEditablePreset(settings.preset);
            engine.config.presetEditorVersion=2;
            engine.config.contextTurns=Math.max(1,Math.min(100,Number(settings.contextTurns)||6));
            engine.config.activationMode=settings.activationMode==='force_selected'?'force_selected':'respect_activation';
            if(Array.isArray(settings.selectedEntries))engine.config.selectedEntries=settings.selectedEntries.filter(x=>typeof x==='string');
            else delete engine.config.selectedEntries;
            engine.saveConfig();
            return engine.config;
        }
        list(){
            const config=this.engine.config;
            if(!Array.isArray(config.promptDocuments))config.promptDocuments=[];
            return config.promptDocuments;
        }
        save(name,settings,activate=true){
            const engine=this.engine,clean=String(name||'').trim().slice(0,80);
            if(!clean)throw new Error("先にプリセットドキュメント名を入力してください");
            if(clean===BUILTIN_DEFAULT_PROMPT_DOCUMENT.name)throw new Error("「默认设置」は組み込みドキュメントです。別の名前で保存してください");
            const docs=this.list(),now=new Date().toISOString();
            let doc=docs.find(item=>!item.builtin&&item.id===engine.config.activePromptDocumentId&&item.name===clean)||docs.find(item=>!item.builtin&&item.name===clean);
            if(doc){doc.name=clean;doc.updatedAt=now;doc.settings=copy(settings);}
            else{
                doc={id:'prompt-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name:clean,createdAt:now,updatedAt:now,settings:copy(settings)};
                docs.unshift(doc);
            }
            engine.config.promptDocuments=docs.slice(0,60);
            if(activate)engine.config.activePromptDocumentId=doc.id;
            engine.saveConfig();
            return doc;
        }
        remove(id){
            const engine=this.engine;
            if(id===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id)return false;
            const before=this.list().length;
            engine.config.promptDocuments=this.list().filter(doc=>doc.id!==id);
            if(engine.config.activePromptDocumentId===id)delete engine.config.activePromptDocumentId;
            engine.saveConfig();
            return before!==engine.config.promptDocuments.length;
        }
        import(raw){
            const engine=this.engine;
            let parsed;try{parsed=JSON.parse(String(raw||''));}catch(_){throw new Error("インポートしたファイルは有効な JSONではありません");}
            const settings=plain(parsed.settings)?parsed.settings:parsed;
            if(typeof settings.preset!=='string')throw new Error("インポートしたファイルに presetがありません");
            if(settings.preset.length>30000)throw new Error("インポートしたプリセットが30000文字を超えています");
            const name=String(parsed.name||settings.name||"インポートプリセット").trim().slice(0,80)||"インポートプリセット";
            const normalized={
                corePrompt:typeof settings.corePrompt==='string'?settings.corePrompt:CORE_WORLD_RULES,
                macroPrompt:typeof settings.macroPrompt==='string'?settings.macroPrompt:DEFAULT_MACRO_PROMPT,
                stabilityPromptTemplate:typeof settings.stabilityPromptTemplate==='string'?settings.stabilityPromptTemplate:DEFAULT_STABILITY_PROMPT_TEMPLATE,
                npcAuditPrompt:typeof settings.npcAuditPrompt==='string'?settings.npcAuditPrompt:undefined,
                structurePrompt:typeof settings.structurePrompt==='string'?settings.structurePrompt:undefined,
                preset:normalizeEditablePreset(settings.preset),
                contextTurns:Math.max(1,Math.min(100,Number(settings.contextTurns)||6)),
                activationMode:settings.activationMode==='force_selected'?'force_selected':'respect_activation',
                selectedEntries:Array.isArray(settings.selectedEntries)?settings.selectedEntries.filter(x=>typeof x==='string'):null
            };
            if(plain(settings.promptRegistry))normalized.promptRegistry=copy(settings.promptRegistry);
            if(plain(settings.modulePrompts))normalized.modulePrompts=copy(settings.modulePrompts);
            const prepared=engine.services?.prompts?.prepareSettings?.(normalized)||normalized;
            return this.save(name,prepared,false);
        }
        export(id){
            const engine=this.engine,doc=this.list().find(item=>item.id===id);
            if(!doc)throw new Error("プリセット文書が存在しません");
            const BlobCtor=engine.host.Blob||(typeof Blob!=='undefined'?Blob:null);
            const URLApi=engine.host.URL||(typeof URL!=='undefined'?URL:null);
            if(!BlobCtor||!URLApi?.createObjectURL)throw new Error("現在の環境はファイル出力に対応していません");
            const defaults={corePrompt:CORE_WORLD_RULES,macroPrompt:DEFAULT_MACRO_PROMPT,stabilityPromptTemplate:DEFAULT_STABILITY_PROMPT_TEMPLATE,npcAuditPrompt:NPC_BUILD_AUDIT_RULES,structurePrompt:WORLD_RESULT_CONTRACT.instruction()};
            const exportedSettings=Object.assign(defaults,copy(doc.settings));
            if(engine.services?.prompts)exportedSettings.promptRegistry=engine.services.prompts.normalize(exportedSettings.promptRegistry||engine.services.prompts.values());
            const payload={type:'samsara-world-prompt-document',version:3,name:doc.name,exportedAt:new Date().toISOString(),settings:exportedSettings};
            const blob=new BlobCtor([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
            const href=URLApi.createObjectURL(blob),a=engine.host.document.createElement('a');
            a.href=href;a.download=doc.name.replace(/[\\/:*?"<>|]+/g,'_')+'.world-prompt.json';a.style.display='none';
            engine.host.document.body.appendChild(a);a.click();a.remove();
            setTimeout(()=>URLApi.revokeObjectURL(href),1000);
            return payload;
        }
    }
    class WorldRunOrchestrator {
        constructor(engine){this.engine=engine;}
        resetInspection(){
            const e=this.engine;
            e.lastRequest=null;e.previewRequest=null;e.lastReply='';e.lastFailure='';
            e.lastRetryLog=[];e.lastAttemptCount=0;e.lastAttemptTelemetry=[];e.lastTransportInfo=null;e.lastWorldResult=null;e.lastCompiledPatches=[];e.lastCompileWarnings=[];
        }
        notifyFailure(message){
            const e=this.engine,raw=String(message||"世界進行失敗").trim();
            if(!raw||/^(?:请求已取消|上下文已经切换|已切换上下文|リクエストを取り消しました|コンテキストが切り替わった|コンテキストを切り替え)/.test(raw))return false;
            const shown=raw.length>900?raw.slice(0,897)+'…':raw;
            const toast=(e.host&&e.host.toastr)||(e.env&&e.env.toastr)||(e.host&&e.host.parent&&e.host.parent.toastr);
            if(toast&&typeof toast.error==='function'){
                try{toast.error(shown,"世界進行失敗");return true;}catch(_){}
            }
            try{console.error("[世界進行] "+shown);}catch(_){}
            return false;
        }
        async execute(options={}) {
            const engine=this.engine;
            return await (async function() {
            if (this.disposed || this.busy) return false;
            if (!this.isConfigured()) { this.status="世界進行を無効にしました"; this.render(); return false; }
            const terminal = this.host.Samsara && this.host.Samsara.terminal;
            this.busy = true; const token = this.generation; let timeout, timedOut=false;
            try {
                const base = this.snapshot(), reason = this.blocked(base);
                if (reason) { this.status = reason; return false; }
                const old = Object.assign(emptyState(),base.stat.世界[PATH] || {});
                if (old.処理済みフロア === base.fingerprint) {
                    const recoveryStat=copy(base.stat);
                    recoveryStat.世界[PATH]=Object.assign(emptyState(),recoveryStat.世界[PATH]||{});
                    normalizeBackendState(recoveryStat);
                    const recoveryTimeline=this.services.timelinePolicy.timelineState(recoveryStat);
                    const needsMacroRepair=this.config.requireMacroBackbone!==false&&(recoveryTimeline.需要补充远期||recoveryTimeline.因果轨道需重建);
                    const needsScheduleRepair=unscheduledEvents(recoveryStat).length>0;
                    const needsLifecycleRepair=staleActiveEvents(recoveryStat).length>0||temporalAnomalies(recoveryStat).length>0;
                    const needsAlienRepair=activeAlienActivityRequirements(recoveryStat).some(item=>{
                        const personName=stableNameIn(recoveryStat.世界?.[PATH]?.人物||{},item.名称),person=personName?recoveryStat.世界[PATH].人物[personName]:null;
                        return !person||!String(person.地点||'').trim()||!String(person.目標||'').trim()||!String(person.行动||'').trim()||String(person.更新时间||'').trim()!==String(recoveryStat.世界?.時間||'').trim();
                    });
                    const needsRumorRepair=this.services.rumor.maintenanceNeeded(recoveryStat);
                    const needsWorldActivityRepair=typeof worldActivityRepairRequired==='function'&&worldActivityRepairRequired(recoveryStat);
                    if(!needsMacroRepair&&!needsScheduleRepair&&!needsLifecycleRepair&&!needsAlienRepair&&!needsWorldActivityRepair&&!needsRumorRepair){this.status="この階層は処理済みのため、重複決算しません";return false;}
                    this.status=needsWorldActivityRepair?"世界活動の基本構成が不足 · このメッセージを修復":needsMacroRepair?"マクロ骨格の不完全を検出 · この階層を修復":needsScheduleRepair?"イベント時間アンカーの欠落を検出 · この階層を修復":needsAlienRepair?"異端活動の欠落を検出 · この階層を修復":needsRumorRepair?"噂または伝播の管理が必要 · このメッセージを修復":"ライフサイクルまたは時間異常を検出 · この階層を修復";
                }
                if (!this.isAvailable()) throw new Error(this.usesDedicatedApi()?"世界進行の「設定」で専用 API のアドレスとモデルを設定してください":"主神端末の設定で追加モデルを有効にして、モデルを選んでください");
                const validate = this.host.Samsara && this.host.Samsara.validateWorldState;
                if (!validate) throw new Error("更新済みの ZOD スクリプトを読み込んでください");

                this.resetInspection();
                this.status = "世界資料を読み込み中"; this.render();
                const request=await this.buildRequest(base);
                if(token!==this.generation)throw new Error("リクエストを取り消しました");

                const configuredAttempts=Number(this.config.retryAttempts),perModelAttempts=Math.max(1,Math.min(5,Number.isFinite(configuredAttempts)?configuredAttempts:5));
                const configuredFallback=String(this.config.fallbackModel||'').trim();
                const primaryModel=this.usesDedicatedApi()
                    ?String(this.normalizeDedicatedApi(this.config.dedicatedApi)?.model||'').trim()
                    :String(this.host.Samsara?.terminal?.currentModel?.()||'').trim();
                const fallbackModel=configuredFallback&&configuredFallback!==primaryModel?configuredFallback:'';
                const maxAttempts=perModelAttempts*(fallbackModel?2:1);
                const temperature=Math.max(0,Math.min(2,Number.isFinite(Number(this.config.temperature))?Number(this.config.temperature):0.3));
                let attempt=0,lastError=null,lastRejectedReply='',prepared=null,acceptedWorldResult=null,lastRetryPlan=[];

                while(attempt<maxAttempts){
                    if(token!==this.generation)throw new Error("リクエストを取り消しました");
                    this.controller=new AbortController();
                    timedOut=false;
                    clearTimeout(timeout);timeout=setTimeout(()=>{timedOut=true;this.controller.abort();},300000);
                    const usingFallback=!!fallbackModel&&attempt>=perModelAttempts;
                    const phaseAttempt=usingFallback?attempt-perModelAttempts:attempt;
                    const attemptInput=attempt===0?request.input:(this.services?.requests?.retryInput?this.services.requests.retryInput(request.input,lastError,lastRejectedReply,attempt,maxAttempts,acceptedWorldResult,lastRetryPlan):retryInput(request.input,lastError,lastRejectedReply,attempt,maxAttempts,acceptedWorldResult,lastRetryPlan));
                    const actualRequest=copy(request);
                    actualRequest.input=attemptInput;
                    actualRequest.manifest=Object.assign({},copy(request.manifest),{
                        观测:requestTokenTelemetry(request.system,attemptInput,request.schema),
                        尝试序号:attempt+1,
                        最大尝试次数:maxAttempts,
                        每模型最大尝试次数:perModelAttempts,
                        模型阶段:usingFallback?"予備モデル":"主モデル",
                        失败记录:copy(this.lastRetryLog)
                    });
                    actualRequest.manifest.观测.请求类型=attempt===0?"初回リクエスト":usingFallback?"予備モデルによる訂正":'纠错重试';
                    this.lastAttemptCount=attempt+1;
                    this.lastRequest=actualRequest;
                    this.status=attempt===0?"六モジュール共同推演中":usingFallback?"予備モデルの再試行 "+(phaseAttempt+1)+'/'+perModelAttempts:"訂正リトライ "+(phaseAttempt+1)+'/'+perModelAttempts;
                    this.render();

                    let received='',attemptTelemetry=null;
                    const attemptStarted=Date.now();this.lastTransportInfo=null;
                    try{
                        received=String(await this.requestAI(request.system,attemptInput,{signal:this.controller.signal,schema:request.schema,schemaName:'samsara_world_result_v1',structured:'auto',temperature,model:usingFallback?fallbackModel:undefined}));
                        clearTimeout(timeout);
                        if(token!==this.generation||this.controller.signal.aborted)throw new Error("リクエストを取り消しました");
                        this.lastReply=received;this.lastFailure='';
                        const elapsed=Math.max(0,Date.now()-attemptStarted),transport=this.lastTransportInfo||{},usage=transport.usage||null,observation=actualRequest.manifest.观测;
                        Object.assign(observation,{接口来源:transport.接口||this.apiSourceLabel(),模型:transport.模型||'',结构化实际模式:transport.结构化模式||"不明",模式尝试:copy(transport.尝试模式||[]),耗时毫秒:elapsed,输出估算Tokens:estimateTokens(received)});
                        if(usage){observation.实际输入Tokens=usage.inputTokens;observation.实际输出Tokens=usage.outputTokens;observation.实际总Tokens=usage.totalTokens;}
                        attemptTelemetry={尝试:attempt+1,结果:"検収待ち",输入估算Tokens:observation.请求估算Tokens,输出估算Tokens:observation.输出估算Tokens,API输入Tokens:usage?.inputTokens??null,API输出Tokens:usage?.outputTokens??null,API总Tokens:usage?.totalTokens??null,接口:observation.接口来源,模型:observation.模型,结构化模式:observation.结构化实际模式,模式尝试:copy(observation.模式尝试||[]),耗时毫秒:elapsed};
                        this.lastAttemptTelemetry.push(attemptTelemetry);

                        let reply=this.services?.resultParser?.parse(received)??parseReply(received);
                        let legacyPatches=[],rejectedSlices=[];
                        if(reply.kind==='world_result'){
                            const staged=this.services?.compiler?.stage(base.stat,acceptedWorldResult,reply.worldResult,validate)??stageWorldResult(base.stat,acceptedWorldResult,reply.worldResult,validate);
                            acceptedWorldResult=staged.accepted;
                            rejectedSlices=staged.rejected;
                            if(staged.softRejected?.length)actualRequest.manifest.软失败片段=copy(staged.softRejected);
                            reply.summary=acceptedWorldResult.要約||reply.summary;
                        } else {
                            legacyPatches=this.services?.compiler?.sanitizeLegacy(reply.patches)??sanitizeModelPatches(normalizeModelPatches(reply.patches));
                        }
                        const compileFor=sourceStat=>{
                            const patches=[],warnings=[];
                            if(acceptedWorldResult){
                                const compiled=this.services?.compiler?.compile(sourceStat,acceptedWorldResult)??compileWorldResult(sourceStat,acceptedWorldResult);
                                patches.push(...compiled.patches);warnings.push(...compiled.warnings);
                            }
                            if(legacyPatches.length)patches.push(...legacyPatches);
                            return {patches,warnings};
                        };
                        let sourceStat=base.stat,compiled=compileFor(sourceStat),modelPatches=compiled.patches;
                        this.lastWorldResult=acceptedWorldResult?copy(acceptedWorldResult):null;
                        this.lastCompiledPatches=copy(modelPatches);
                        this.lastCompileWarnings=copy(compiled.warnings);
                        let built=this.services?.compiler?.materialize(sourceStat,request.seedPatches,modelPatches)??materializeWorldUpdate(sourceStat,request.seedPatches,modelPatches);
                        let next=built.next;
                        let globalError=null;
                        try{
                            if(this.services?.validation)this.services.validation.validate(next,request,acceptedWorldResult,base.stat);
                            else{
                                ensureDueHandled(next,request.due,base.stat.世界.時間);
                                ensureEventTimeAnchors(next,request.unscheduled);
                                ensureStaleActiveHandled(next,request.staleActive,base.stat.世界.時間);
                                ensureTemporalAnomaliesResolved(next,request.timeAnomalies);
                                ensureActiveAlienActivity(next,request.alienActivity,acceptedWorldResult,base.stat.世界.時間);
                                ensureNpcBuildAuditProgress(next,request.npcAudit,acceptedWorldResult);
                                ensureMacroBackbone(next,request.timeline,this.config.requireMacroBackbone!==false);
                            }
                        }catch(error){globalError=error;}
                        if(globalError||(rejectedSlices.length&&attempt+1<maxAttempts))throw makeRetryFailure(rejectedSlices,globalError);
                        if(rejectedSlices.length){
                            const partialFailure=makeRetryFailure(rejectedSlices,null);
                            const partialPlan=Array.isArray(partialFailure.retryPlan)?copy(partialFailure.retryPlan):[];
                            this.lastRetryLog.push({尝试:attempt+1,タイプ:"局所的な結果を破棄しました",错误:String(partialFailure.message||partialFailure),片段:copy(rejectedSlices),补充清单:partialPlan});
                            actualRequest.manifest.最终丢弃片段=copy(rejectedSlices);
                            this.lastCompileWarnings.push("再試行の上限到達後、未合格の結果 "+rejectedSlices.length+" 件を破棄。合格済みの結果は確定を続行");
                        }

                        const current=this.snapshot();
                        if(token!==this.generation||this.controller.signal.aborted||current.fingerprint!==base.fingerprint||this.blocked(current))throw new Error("コンテキストが切り替わったため今回の結果を破棄しました");
                        if(this.services?.validation?.progressionAnchorChanged(base.stat,current.stat)??progressionAnchorChanged(base.stat,current.stat))throw new Error("シミュレーション中に世界時刻またはシナリオの基準が変わりました。再実行してください");

                        if(!same(current.stat,base.stat)){
                            sourceStat=current.stat;
                            compiled=compileFor(sourceStat);modelPatches=compiled.patches;
                            this.lastCompiledPatches=copy(modelPatches);
                            this.lastCompileWarnings=copy(compiled.warnings);
                            built=this.services?.compiler?.materialize(sourceStat,request.seedPatches,modelPatches)??materializeWorldUpdate(sourceStat,request.seedPatches,modelPatches);
                            next=built.next;
                            let currentGlobalError=null;
                            try{
                                if(this.services?.validation)this.services.validation.validate(next,request,acceptedWorldResult,base.stat,{includeNpcAudit:false});
                                else{
                                    ensureDueHandled(next,request.due,base.stat.世界.時間);
                                    ensureEventTimeAnchors(next,request.unscheduled);
                                    ensureStaleActiveHandled(next,request.staleActive,base.stat.世界.時間);
                                    ensureTemporalAnomaliesResolved(next,request.timeAnomalies);
                                    ensureActiveAlienActivity(next,request.alienActivity,acceptedWorldResult,base.stat.世界.時間);
                                    ensureMacroBackbone(next,request.timeline,this.config.requireMacroBackbone!==false);
                                }
                            }catch(error){currentGlobalError=error;}
                            if(currentGlobalError)throw makeRetryFailure([],currentGlobalError);
                        }
                        const committedPatches=built.appliedSeeds.concat(modelPatches,built.repairPatches);
                        if(this.services?.commit){
                            const finalized=this.services.commit.prepare({
                                next,committedPatches,base,acceptedWorldResult,reply,validate
                            });
                            next=finalized.next;reply=finalized.reply;
                        }else{
                            if (!(next.設定 || {}).世界超安定) {
                                const offsets=(next.世界.因果軌道||{}).偏移記録||{};
                                const total=Object.values(offsets).reduce((n,r)=>n+(Number(r.影響度)||0),0);
                                next.世界.安定=Math.max(0,Math.min(120,100+total));
                            }
                            next.世界[PATH].処理済みフロア=base.fingerprint;
                            next.世界[PATH].処理済み時刻=base.stat.世界.時間;
                            const changes=committedPatches.map(p=>{
                                const parts=tokens(p.path),back=parts[1]===PATH,asset=parts[0]==='资产';
                                return {時間:base.stat.世界.時間,类别:asset?'资产':back?parts[2]:parts[1],名称:asset?parts[1]:back?parts[3]:parts[2],字段:asset?'资产':parts.at(-1),操作:p.op==='add'?"追加":p.op==='remove'?"削除":'更新',内容:typeof p.value==='string'?p.value:plain(p.value)?(p.value.説明||p.value.行动||p.value.事实||p.value.目標||p.value.状態||p.value.内容||"記録を更新しました"):''};
                            });
                            next.世界[PATH].最近变化=changes.slice(-100);
                            if(typeof this.beforeWorldCommit==='function')this.beforeWorldCommit(next,{
                                messageId:base.id,fingerprint:base.fingerprint,worldResult:acceptedWorldResult,reply:copy(reply),baseStat:base.stat
                            });
                            const checked=validate(next);
                            for(const patch of committedPatches){
                                if(patch.op!=='remove'&&!same(get(checked,tokens(patch.path)),get(next,tokens(patch.path))))throw schemaMismatchError(next,checked,patch.path);
                            }
                            reply.patches=committedPatches;
                        }
                        prepared={reply,next,current};
                        if(attemptTelemetry)attemptTelemetry.结果="受理";
                        break;
                    }catch(error){
                        clearTimeout(timeout);
                        if(attemptTelemetry){attemptTelemetry.结果="拒否";attemptTelemetry.原因=String(error.message||error);}
                        else{
                            const elapsed=Math.max(0,Date.now()-attemptStarted),transport=this.lastTransportInfo||{},observation=actualRequest.manifest.观测;
                            Object.assign(observation,{接口来源:transport.接口||this.apiSourceLabel(),模型:transport.模型||'',结构化实际模式:transport.结构化模式||"未返却",模式尝试:copy(transport.尝试模式||[]),耗时毫秒:elapsed});
                            this.lastAttemptTelemetry.push({尝试:attempt+1,结果:"リクエスト失敗",输入估算Tokens:observation.请求估算Tokens,输出估算Tokens:0,API输入Tokens:null,API输出Tokens:null,API总Tokens:null,接口:observation.接口来源,模型:observation.模型,结构化模式:observation.结构化实际模式,模式尝试:copy(observation.模式尝试||[]),耗时毫秒:elapsed,原因:String(error.message||error)});
                        }
                        lastError=error;
                        lastRejectedReply=received||'';
                        lastRetryPlan=Array.isArray(error?.retryPlan)?copy(error.retryPlan):retryPlanForFailure(error,[]);
                        const retryableFailure=timedOut===true?true:(this.services?.requests?.retryableModelFailure?this.services.requests.retryableModelFailure(error):retryableModelFailure(error));
                        if(retryableFailure)this.lastRetryLog.push({尝试:attempt+1,タイプ:received?"モデルの応答が拒否されました":"リクエスト失敗",错误:String(error.message||error),片段:Array.isArray(error?.rejectedSlices)?copy(error.rejectedSlices):[],补充清单:copy(lastRetryPlan)});
                        const canRetry=retryableFailure&&attempt+1<maxAttempts;
                        if(!canRetry)throw error;
                        attempt++;
                        const nextUsesFallback=!!fallbackModel&&attempt>=perModelAttempts;
                        const nextPhaseAttempt=nextUsesFallback?attempt-perModelAttempts:attempt;
                        this.status=nextUsesFallback?"主モデルが連続失敗 · 予備モデルへ切り替え "+(nextPhaseAttempt+1)+'/'+perModelAttempts:"応答が不合格 · 自動訂正 "+(nextPhaseAttempt+1)+'/'+perModelAttempts;
                        this.render();
                    }
                }

                if(!prepared)throw lastError||new Error("世界推演が書き込み可能な結果を生成しませんでした");
                this.committing=true;
                if(this.services?.commit)await this.services.commit.persist(prepared,base);
                else{
                    const result=prepared.current.raw;
                    result.stat_data=prepared.next;
                    const replay=typeof this.buildWorldReplayPackage==='function'
                        ?this.buildWorldReplayPackage(base.stat,prepared.next,base.fingerprint):null;
                    if(replay)result.__samsaraWorldReplay=replay;
                    await prepared.current.mvu.replaceMvuData(result,{type:'message',message_id:base.id});
                }
                this.status="更新済み · "+prepared.reply.summary+(this.lastRetryLog.length?" · 先行失敗"+this.lastRetryLog.length+"回":'');
                return true;
            } catch (error) {
                const failureMessage=error.name==='AbortError'?(timedOut?"リクエストタイムアウト（300秒）":"リクエストを取り消しました"):String(error.message||error);
                this.lastFailure=failureMessage;
                const retryNote=this.lastRetryLog?.length?" · 失敗記録"+this.lastRetryLog.length+"回":'';
                this.status=(this.committing?"書き込み未確認 · ":"未書き込み · ")+failureMessage+retryNote;
                if(!(error.name==='AbortError'&&!timedOut))this.notifyFailure(this.status);
                throw error;
            } finally {
                clearTimeout(timeout); if(this.controller)this.controller=null; this.committing=false; this.busy=false; this.render();
                if (this.pending) { this.pending = false; this.schedule(); }
            }
        
            }).call(engine);
        }
    }
    class WorldRequestFeature {
        constructor(engine){this.engine=engine;}
        async afterBuildRequest(request,_base){return request;}
    }
    class WorldAutoProgressController {
        constructor(engine){this.engine=engine;}
        initialize(){
            const e=this.engine;let dirty=false;
            if(!Object.hasOwn(e.config,'autoProgress')){e.config.autoProgress=true;dirty=true;}
            else e.config.autoProgress=e.config.autoProgress!==false;
            const hadInterval=Object.hasOwn(e.config,'autoProgressInterval'),value=Number(e.config.autoProgressInterval);
            e.config.autoProgressInterval=Math.max(1,Math.min(20,Number.isFinite(value)?Math.round(value):2));
            if(!hadInterval)dirty=true;
            this.resetCycle();
            if(dirty)e.saveConfig();
        }
        interval(){
            const value=Number(this.engine.config.autoProgressInterval);
            return Math.max(1,Math.min(20,Number.isFinite(value)?Math.round(value):2));
        }
        contextKey(snapshot){
            let chat='';try{chat=String(JSON.parse(String(snapshot?.fingerprint||''))?.[0]??'');}catch(_){}
            return chat+'\u0000'+String(snapshot?.stat?.世界?.名称||'');
        }
        fingerprintChat(fingerprint){
            try{return String(JSON.parse(String(fingerprint||''))?.[0]??'');}catch(_){return '';}
        }
        backendHasContent(snapshot){
            const backend=snapshot?.stat?.世界?.[PATH];if(!plain(backend))return false;
            const maps=['事件','人物','势力地区','历史','历史总结','传播'];
            if(maps.some(key=>plain(backend[key])&&Object.keys(backend[key]).length>0))return true;
            return Array.isArray(backend.最近变化)&&backend.最近变化.length>0;
        }
        initializeCycle(snapshot){
            const e=this.engine,key=this.contextKey(snapshot);
            if(e.autoProgressCycleKey===key)return;
            e.autoProgressCycleKey=key;e.autoProgressRoundsSinceRun=0;
            const handled=String(snapshot?.stat?.世界?.[PATH]?.処理済みフロア||'');
            const currentChat=this.fingerprintChat(snapshot?.fingerprint),handledChat=this.fingerprintChat(handled);
            const sameContext=!!handled&&(!currentChat||!handledChat||currentChat===handledChat);
            const restoredRun=sameContext&&this.backendHasContent(snapshot);
            e.autoProgressHasRun=restoredRun;e.autoProgressLastSeenFingerprint=restoredRun?handled:'';e.autoProgressDueFingerprint=restoredRun?handled:'';
        }
        fingerprintParts(fingerprint){
            try{const parsed=JSON.parse(String(fingerprint||''));return {chat:String(parsed?.[0]??''),id:Number(parsed?.[1]),swipe:Number(parsed?.[2]||0),digest:String(parsed?.[3]??'')};}
            catch(_){return {chat:'',id:NaN,swipe:0,digest:''};}
        }
        sameFloor(left,right){
            const a=this.fingerprintParts(left),b=this.fingerprintParts(right);
            return !!a.chat&&a.chat===b.chat&&Number.isFinite(a.id)&&a.id===b.id;
        }
        duringExtraAnalysis(){
            const e=this.engine,mvu=e.env.Mvu||e.host.Mvu;
            try{return mvu?.isDuringExtraAnalysis?.()===true;}catch(_){return false;}
        }
        shouldSchedule(snapshot){
            const e=this.engine;this.initializeCycle(snapshot);
            const fingerprint=String(snapshot?.fingerprint||'');if(!fingerprint)return false;
            const handled=String(snapshot?.stat?.世界?.[PATH]?.処理済みフロア||'');
            if(e.autoProgressLastSeenFingerprint===fingerprint)return e.autoProgressDueFingerprint===fingerprint&&handled!==fingerprint;
            const previous=e.autoProgressLastSeenFingerprint;
            if(previous&&this.sameFloor(previous,fingerprint)){
                const wasDue=e.autoProgressDueFingerprint===previous;
                e.autoProgressLastSeenFingerprint=fingerprint;
                if(wasDue)e.autoProgressDueFingerprint=fingerprint;
                return wasDue;
            }
            e.autoProgressLastSeenFingerprint=fingerprint;
            if(e.autoProgressHasRun)e.autoProgressRoundsSinceRun++;
            const due=!e.autoProgressHasRun||e.autoProgressRoundsSinceRun>=this.interval();
            if(due)e.autoProgressDueFingerprint=fingerprint;
            return due;
        }
        markRun(snapshot){
            const e=this.engine;if(snapshot)this.initializeCycle(snapshot);
            e.autoProgressHasRun=true;e.autoProgressRoundsSinceRun=0;
            if(snapshot?.fingerprint){e.autoProgressLastSeenFingerprint=String(snapshot.fingerprint);e.autoProgressDueFingerprint=String(snapshot.fingerprint);}
        }
        resetCycle(){
            const e=this.engine;
            e.autoProgressCycleKey='';e.autoProgressLastSeenFingerprint='';e.autoProgressDueFingerprint='';e.autoProgressRoundsSinceRun=0;e.autoProgressHasRun=false;e.autoProgressWaitingForVariable=false;
        }
        blocked(snapshot,baseReason=''){
            if(snapshot?.stat?.システム状態?.戦闘中===true)return "戦闘中のため、世界進行を一時停止します";
            return baseReason;
        }
        schedule(source='variable-update',attempt=0){
            const e=this.engine;
            if(e.config.autoProgress!==true){if(e.timer){clearTimeout(e.timer);e.timer=null;}return;}
            if(e.disposed||e.committing||!e.isEnabled())return;
            if(e.busy){e.pending=true;return;}
            const trigger=String(source||'variable-update'),proseTrigger=trigger==='generation-ended'||trigger==='message-received';
            const tries=Math.max(0,Number(attempt)||0);
            if(proseTrigger&&this.duringExtraAnalysis()){
                e.autoProgressWaitingForVariable=true;clearTimeout(e.timer);
                if(tries<120)e.timer=setTimeout(()=>{e.timer=null;this.schedule(trigger,tries+1);},1000);
                return;
            }
            e.autoProgressWaitingForVariable=false;clearTimeout(e.timer);
            const delay=proseTrigger?(tries>0?250:800):900;
            e.timer=setTimeout(()=>{
                e.timer=null;
                if(e.config.autoProgress!==true||e.disposed||e.committing||!e.isEnabled())return;
                if(e.busy){e.pending=true;return;}
                if(proseTrigger&&this.duringExtraAnalysis()){
                    e.autoProgressWaitingForVariable=true;
                    if(tries<120)e.timer=setTimeout(()=>{e.timer=null;this.schedule(trigger,tries+1);},1000);
                    return;
                }
                let snapshot;
                try{snapshot=e.snapshot();}
                catch(_){
                    if(proseTrigger&&tries<4)e.timer=setTimeout(()=>{e.timer=null;this.schedule(trigger,tries+1);},250);
                    return;
                }
                e.autoProgressWaitingForVariable=false;
                const reason=e.blocked(snapshot);
                if(reason){e.status=reason;e.render();return;}
                if(!this.shouldSchedule(snapshot))return;
                e.run({automatic:true}).catch(()=>{});
            },delay);
        }
        async aroundRun(next,_options={}){
            let snapshot=null;try{snapshot=this.engine.snapshot();}catch(_){}
            const result=await next();
            if(result===true)this.markRun(snapshot);
            return result;
        }
        toggle(){
            const e=this.engine;e.config.autoProgress=!e.config.autoProgress;
            if(!e.config.autoProgress){
                if(e.timer){clearTimeout(e.timer);e.timer=null;}e.pending=false;e.status="自動進行はオフ · 手動で進行できます";
            }else{this.resetCycle();e.status="自動進行はオン";}
            e.saveConfig();e.render(true);return e.config.autoProgress;
        }
        mountTopControl(){
            const e=this.engine;if(!e.panel)return;
            const header=e.panel.querySelector('header'),run=header?.querySelector('[data-action="run"]');if(!header||!run)return;
            let button=header.querySelector('[data-auto-progress-toggle-top]');
            if(!button){
                button=e.host.document.createElement('button');button.type='button';button.className='we-btn we-switch';button.dataset.autoProgressToggleTop='';
                run.insertAdjacentElement('beforebegin',button);
                button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();this.toggle();});
            }
            button.classList.toggle('on',e.config.autoProgress===true);button.setAttribute('aria-pressed',String(e.config.autoProgress===true));
            button.title=e.config.autoProgress?"自動進行はオン":"自動進行はオフ";
            button.innerHTML="<span>自動進行</span><span class=\"we-switch-track\"><i></i></span>";
        }
        mountIntervalSetting(){
            const e=this.engine;if(e.tab!=="リクエスト検査"||!e.panel)return;
            const main=e.panel.querySelector('main');if(!main)return;
            let section=main.querySelector('[data-auto-progress-interval-setting]');
            if(!section){
                section=e.host.document.createElement('section');section.className='we-section';section.dataset.autoProgressIntervalSetting='';
                const retry=[...main.querySelectorAll('.we-section')].find(item=>item.querySelector('.we-section-head h2')?.textContent?.trim()==="失敗時の自動再試行");
                if(retry)main.insertBefore(section,retry);else main.prepend(section);
            }
            const enabled=e.config.autoProgress===true,interval=this.interval();
            section.innerHTML="<div class=\"we-section-head\"><h2>自動進行の頻度</h2><small>本文ラウンド</small></div>"
                +"<div class=\"we-config-row\"><label>進行間隔 <input data-auto-progress-interval type=\"number\" min=\"1\" max=\"20\" value=\""+interval+'" '+(enabled?'':'disabled')+"> ラウンド</label><span class=\"we-muted\">"
                +(enabled?"初回に条件が成立した時、または世界のバックグラウンドが未構築と検出された時は直ちに進行；以降は本文応答のラウンドで発火します。2 = 本文1・3・5…回目の後に進行；1 = 毎ラウンド進行。戦闘中はラウンドを数えません。":"自動進行はオフのため、この設定はスケジューリングに参加しません。")+'</span></div>';
            const input=section.querySelector('[data-auto-progress-interval]');
            input?.addEventListener('change',()=>{
                const value=Math.max(1,Math.min(20,Number(input.value)||2));
                e.config.autoProgressInterval=Math.round(value);input.value=String(e.config.autoProgressInterval);
                this.resetCycle();e.saveConfig();e.status="自動進行の間隔を "+e.config.autoProgressInterval+" ラウンドに設定しました";e.render(true);
            });
        }
        afterRender(){
            this.engine.panel?.querySelector('[data-auto-progress-setting]')?.remove();
            this.mountTopControl();this.mountIntervalSetting();
        }
    }
    const WORLD_REPLAY_VERSION=1;
    const WORLD_REPLAY_SCOPES=[
        ['世界',"時間"],['世界',"通貨"],['世界',"暦法"],['世界',PATH],['世界',"因果軌道"],['世界',"勢力"],['世界','探索'],
        ['世界',"異端レーダー","名簿"],['世界',"安定"],["噂"],['资产'],["関係リスト"]
    ];

    class WorldReplayService {
        constructor(engine){this.engine=engine;}
        initialize(){
            const e=this.engine;
            e.autoProgressTriggerEventsBound=false;e.autoProgressWaitingForVariable=false;e.worldReplayEventBound=false;
            e.worldReplayPendingFingerprint='';e.worldReplayManualForce=false;e.worldReplayImmediateRetrying=false;e.worldReplayIdleWaiters=[];
        }
        fingerprintParts(fingerprint){
            try{const parsed=JSON.parse(String(fingerprint||''));return {chat:String(parsed?.[0]??''),id:Number(parsed?.[1]),swipe:Number(parsed?.[2]||0),digest:String(parsed?.[3]??'')};}
            catch(_){return {chat:'',id:NaN,swipe:0,digest:''};}
        }
        sameFloor(left,right){
            const a=this.fingerprintParts(left),b=this.fingerprintParts(right);
            return !!a.chat&&a.chat===b.chat&&Number.isFinite(a.id)&&a.id===b.id;
        }
        currentMessage(){
            const e=this.engine,getMessages=e.fn('getChatMessages');if(!getMessages)return null;
            let message;try{message=getMessages(-1)?.[0];}catch(_){return null;}
            if(!message)return null;
            const id=Number(message.message_id!=null?message.message_id:message.id);
            if(!Number.isInteger(id)||id<0)return null;
            const role=String(message.role||'').toLowerCase();if(role==='user'||message.is_user===true)return null;
            const text=String(message.message!=null?message.message:message.mes||'');if(!text.trim())return null;
            const chatFn=e.fn('getCurrentChatId');let chat='';
            try{chat=String(chatFn?chatFn():(e.host.SillyTavern?.getContext?.()?.chatId??''));}catch(_){}
            if(!chat)return null;
            return {id,message,text,fingerprint:JSON.stringify([chat,id,message.swipe_id||0,digest(text)])};
        }
        pathAllowed(path){
            if(!Array.isArray(path)||!path.length||path.some(key=>forbidden.has(String(key))))return false;
            return WORLD_REPLAY_SCOPES.some(scope=>scope.every((key,index)=>path[index]===key));
        }
        atomicPath(path){
            if(path[0]==='世界'&&path[1]===PATH&&path.length>=4)return true;
            if(path[0]==='世界'&&["勢力",'探索'].includes(path[1])&&path.length>=3)return true;
            if(path[0]==='世界'&&path[1]==="因果軌道"&&path[2]==="偏移記録"&&path.length>=4)return true;
            if(path[0]==="噂"&&path.length>=3)return true;
            if(path[0]==='资产'&&path.length>=2)return true;
            if(path[0]==="関係リスト"&&path.length>=3)return true;
            return false;
        }
        collect(before,after,path,operations){
            if(same(before,after))return;
            if(after===undefined){operations.push({op:'remove',path:copy(path)});return;}
            if(before===undefined||this.atomicPath(path)||!plain(before)||!plain(after)){operations.push({op:'set',path:copy(path),value:copy(after)});return;}
            const keys=new Set([...Object.keys(before),...Object.keys(after)]);
            for(const key of keys){if(!forbidden.has(key))this.collect(before[key],after[key],path.concat(key),operations);}
        }
        buildPackage(beforeStat,afterStat,fingerprint){
            if(!plain(beforeStat)||!plain(afterStat)||!fingerprint)return null;
            const operations=[];for(const scope of WORLD_REPLAY_SCOPES)this.collect(get(beforeStat,scope),get(afterStat,scope),scope,operations);
            return operations.length?{version:WORLD_REPLAY_VERSION,fingerprint:String(fingerprint),operations}:null;
        }
        applyPackage(stat,packageValue){
            if(!plain(stat)||!plain(packageValue)||packageValue.version!==WORLD_REPLAY_VERSION||!Array.isArray(packageValue.operations))return false;
            for(const operation of packageValue.operations){
                const path=Array.isArray(operation?.path)?operation.path.map(String):[];
                if(!this.pathAllowed(path)||!['set','remove'].includes(operation?.op))return false;
            }
            for(const operation of packageValue.operations){
                const path=operation.path.map(String);let parent=stat;
                for(const key of path.slice(0,-1)){if(!plain(parent[key]))parent[key]={};parent=parent[key];}
                const key=path.at(-1);if(operation.op==='remove')delete parent[key];else parent[key]=copy(operation.value);
            }
            return true;
        }
        markEventInternal(){
            const target=this.engine.host;if(!target)return;
            const had=Object.prototype.hasOwnProperty.call(target,'__samsaraUIMutation'),previous=target.__samsaraUIMutation;
            target.__samsaraUIMutation=true;
            setTimeout(()=>{try{if(had)target.__samsaraUIMutation=previous;else delete target.__samsaraUIMutation;}catch(_){}},0);
        }
        reprocessContext(variables,before){
            const e=this.engine;if(!plain(variables?.stat_data))return null;
            const current=this.currentMessage();if(!current)return null;
            const mvu=e.env.Mvu||e.host.Mvu;let raw;
            try{raw=mvu?.getMvuData?.({type:'message',message_id:current.id});}catch(_){return null;}
            if(!plain(raw)||plain(raw.stat_data))return null;
            const beforeStat=plain(before?.stat_data)?before.stat_data:null,replay=raw.__samsaraWorldReplay;
            const replayMatches=plain(replay)&&String(replay.fingerprint||'')===current.fingerprint;
            const beforeHandled=String(beforeStat?.世界?.[PATH]?.処理済みフロア||'');
            if(!replayMatches&&beforeHandled!==current.fingerprint)return null;
            return {current,raw,mvu,beforeStat};
        }
        setCycleRecovered(fingerprint,stat){
            const e=this.engine,auto=e.services?.autoProgress;
            e.autoProgressCycleKey=auto?.contextKey({fingerprint,stat})||'';
            e.autoProgressHasRun=true;e.autoProgressRoundsSinceRun=0;e.autoProgressLastSeenFingerprint=fingerprint;e.autoProgressDueFingerprint=fingerprint;
        }
        clearHandledForRetry(stat,fingerprint){
            const state=stat?.世界?.[PATH];if(!plain(state))return;
            if(!fingerprint||String(state.処理済みフロア||'')===String(fingerprint)){state.処理済みフロア='';state.処理済み時刻='';}
        }
        legacyPackage(context,variables){
            const beforeStat=context?.beforeStat;
            if(!plain(beforeStat)||!plain(variables?.stat_data))return null;
            if(String(beforeStat?.世界?.[PATH]?.処理済みフロア||'')!==context.current.fingerprint)return null;
            return this.buildPackage(variables.stat_data,beforeStat,context.current.fingerprint);
        }
        waitForIdle(){
            const e=this.engine;if(!e.busy)return Promise.resolve();
            if(!Array.isArray(e.worldReplayIdleWaiters))e.worldReplayIdleWaiters=[];
            return new Promise(resolve=>e.worldReplayIdleWaiters.push(resolve));
        }
        resolveIdleWaiters(){
            const e=this.engine,waiters=Array.isArray(e.worldReplayIdleWaiters)?e.worldReplayIdleWaiters.splice(0):[];
            for(const resolve of waiters){try{resolve();}catch(_){}}
        }
        async immediateRetry(context,variables){
            const e=this.engine;
            if(!context?.mvu?.replaceMvuData||!plain(variables?.stat_data))return false;
            if(e.busy){e.cancel();await this.waitForIdle();}
            if(e.disposed||e.config.autoProgress!==true||!e.isEnabled())return false;
            const seed=Object.assign({},copy(context.raw),copy(variables));
            this.clearHandledForRetry(seed.stat_data,context.current.fingerprint);delete seed.__samsaraWorldReplay;this.markEventInternal();
            const previous=e.worldReplayImmediateRetrying===true;e.worldReplayImmediateRetrying=true;
            try{await context.mvu.replaceMvuData(seed,{type:'message',message_id:context.current.id});}
            finally{e.worldReplayImmediateRetrying=previous;}
            const result=await e.run({automatic:true});if(result!==true)return false;
            let finalRaw;try{finalRaw=context.mvu.getMvuData({type:'message',message_id:context.current.id});}catch(_){finalRaw=null;}
            if(plain(finalRaw?.stat_data))variables.stat_data=copy(finalRaw.stat_data);
            if(finalRaw&&Object.prototype.hasOwnProperty.call(finalRaw,'__samsaraWorldReplay'))variables.__samsaraWorldReplay=copy(finalRaw.__samsaraWorldReplay);
            return true;
        }
        async handleVariableEvent(variables,before){
            const e=this.engine;
            if(e.worldReplayImmediateRetrying===true)return false;
            const context=this.reprocessContext(variables,before);
            if(context){
                const stored=context.raw.__samsaraWorldReplay,valid=plain(stored)&&String(stored.fingerprint||'')===context.current.fingerprint;
                const legacy=!valid?this.legacyPackage(context,variables):null,replay=valid?stored:legacy;
                if(replay&&this.applyPackage(variables.stat_data,replay)){
                    this.markEventInternal();variables.__samsaraWorldReplay=copy(replay);this.setCycleRecovered(context.current.fingerprint,variables.stat_data);
                    e.status=legacy?"旧メッセージの状態から再構築し、世界進行結果を復元しました · AI再呼び出しなし":"このメッセージの世界進行結果を復元しました · AI の再呼び出しなし";e.render();return true;
                }
                this.clearHandledForRetry(variables.stat_data,context.current.fingerprint);delete variables.__samsaraWorldReplay;this.setCycleRecovered(context.current.fingerprint,variables.stat_data);
                if(e.config.autoProgress===true&&e.isEnabled()){
                    e.status="変数の再処理済み · 本メッセージを再進行中";e.render();
                    return await this.immediateRetry(context,variables);
                }
                e.status=e.config.autoProgress!==true?"変数の再処理済み · 旧メッセージに復元スナップショットがありません；自動進行はオフです。手動で進行してください":"変数の再処理済み · 世界進行がオフのため自動再構築しませんでした";
                e.render();return false;
            }
            if(!plain(variables))return false;
            const pending=String(e.worldReplayPendingFingerprint||''),handled=String(variables?.stat_data?.世界?.[PATH]?.処理済みフロア||'');
            if(pending&&handled===pending&&plain(before?.stat_data)&&plain(variables.stat_data)){
                const replay=this.buildPackage(before.stat_data,variables.stat_data,pending);
                if(replay)variables.__samsaraWorldReplay=replay;
                if(e.worldReplayManualForce)this.markEventInternal();
                return !!replay;
            }
            const timeHandled=await e.services?.timeOwnership?.afterReplayVariableEvent?.(variables,before,false);
            return timeHandled===true;
        }
        adjustSnapshot(snapshot){
            const e=this.engine;
            if(e.worldReplayManualForce&&snapshot?.fingerprint&&snapshot?.stat?.世界?.[PATH]?.処理済みフロア===snapshot.fingerprint){
                snapshot.stat.世界[PATH].処理済みフロア='';snapshot.stat.世界[PATH].処理済み時刻='';
            }
            return snapshot;
        }
        async aroundRun(next,options={}){
            const e=this.engine;let current=null;
            try{current=e.snapshot();}catch(_){}
            const fingerprint=String(current?.fingerprint||''),automatic=plain(options)&&options.automatic===true;
            const previousPending=e.worldReplayPendingFingerprint,previousManual=e.worldReplayManualForce;
            e.worldReplayPendingFingerprint=fingerprint;e.worldReplayManualForce=!automatic;
            try{return await next();}
            finally{e.worldReplayPendingFingerprint=previousPending;e.worldReplayManualForce=previousManual;this.resolveIdleWaiters();}
        }
        afterInit(){this.bindEvents();}
        bindEvents(){
            const e=this.engine,on=e.fn('eventOn'),events=e.env.tavern_events||e.host.tavern_events||{};
            if(!e.autoProgressTriggerEventsBound&&on&&events){
                const bindAuto=(event,source)=>{
                    if(!event)return false;
                    const off=on(event,()=>e.schedule(source));
                    if(typeof off==='function')e.unsub.push(off);else if(off&&off.stop)e.unsub.push(()=>off.stop());
                    return true;
                };
                let bound=false;bound=bindAuto(events.GENERATION_ENDED,'generation-ended')||bound;bound=bindAuto(events.MESSAGE_RECEIVED,'message-received')||bound;
                if(bound)e.autoProgressTriggerEventsBound=true;
            }
            if(!e.worldReplayEventBound){
                const mvu=e.env.Mvu||e.host.Mvu,first=e.fn('eventMakeFirst')||on,event=mvu?.events?.VARIABLE_UPDATE_ENDED;
                if(first&&event){
                    const off=first(event,(variables,before)=>Promise.resolve(this.handleVariableEvent(variables,before)).catch(error=>{try{console.error("[世界進行 replay]",error);}catch(_){}throw error;}));
                    if(typeof off==='function')e.unsub.push(off);else if(off&&off.stop)e.unsub.push(()=>off.stop());
                    e.worldReplayEventBound=true;
                }
            }
        }
    }
    class WorldTimeOwnershipFeature extends WorldRequestFeature {
        constructor(engine,policy=DEFAULT_WORLD_TIME_POLICY){super(engine);this.policy=policy||DEFAULT_WORLD_TIME_POLICY;}
        async afterBuildRequest(request,base){
            try{
                const payload=JSON.parse(request.input),needsInitialization=this.policy.unset(base?.stat?.世界?.時間);
                payload.世界时间维护={
                    当前时间:String(base?.stat?.世界?.時間||''),
                    是否需要初始化:needsInitialization,
                    所有权:"世界進行が排他的に書き込み、変数 AI は読み取り専用",
                    初始化锚定:needsInitialization?{
                        任务世界:String(base?.stat?.世界?.名称||''),
                        現在段階:String(base?.stat?.世界?.因果軌道?.現在段階||''),
                        当前地点:String(base?.stat?.世界?.地点||''),
                        依据顺序:["最新の確定本文","現在の段階と現在地","読み込み済みのタイムライン・年表・章の資料","モデルが持つ原作知識","慎重な推論"],
                        禁止:"次の大局的な節目、任務の期限、未来事件の日付をそのまま現在の世界時刻にしてはいけません。一意に特定できない場合は粗い時間精度を維持してください。"
                    }:undefined,
                    正文时间职责:"最新本文で一夜経過、数時間後、翌日、日をまたぐ移動、新しい日付・時間帯が明示された場合は、最上位の「時刻」を出力して世界時計を同期してください。古い時計を維持したまま、新しい時点ですでに発生した事実を提出してはいけません。",
                    精确日期格式:"最上位の時刻、および事件・履歴・伝播などの日付が月日まで特定できる場合は {yyy}年-{mm}月-{dd}日-{時間帯} を使います。月は数字とし、独自の月名で置き換えないでください。",
                    时间段候选:['凌晨','黎明','清晨','早晨','上午','中午','午后','下午','傍晚','入夜','晚上','深夜'],
                    推进原则:"時間帯は大まかな基準であり、毎回進むカウンターではありません。次の時間帯に達するほど時間が経過していなければ元の値を維持し、本文または明確な時間資料で妥当な時間経過が確認できる場合だけ進めてください。"
                };
                request.input=JSON.stringify(payload,null,2);
            }catch(_){}
            request.schema=copy(WORLD_RESULT_SCHEMA);
            if(request.manifest)request.manifest.观测=requestTokenTelemetry(request.system,request.input,request.schema);
            return request;
        }
        afterReplayVariableEvent(variables,before,handled){
            const e=this.engine;
            if(handled||e.committing||!e.isEnabled()||!plain(variables?.stat_data)||!plain(before?.stat_data))return handled;
            const previous=String(before?.stat_data?.世界?.時間??''),incoming=String(variables?.stat_data?.世界?.時間??'');
            if(previous===incoming)return handled;
            const wasSpace=before?.stat_data?.システム状態?.主神空間滞在中===true,isSpace=variables?.stat_data?.システム状態?.主神空間滞在中===true;
            if(wasSpace!==isSpace){
                const enteringWorld=wasSpace&&!isSpace,returningToSpace=!wasSpace&&isSpace;
                const mainSpaceTime=/^(?:轮回历|輪廻暦)\d+年-\d{2}月-\d{2}日-(?:(?:凌晨|未明)|黎明|(?:清晨|早朝)|(?:早晨|朝)|(?:上午|午前)|(?:中午|正午)|(?:午后|昼過ぎ)|(?:下午|午後)|(?:傍晚|夕方)|(?:入夜|夜の始まり)|(?:晚上|夜)|深夜)$/.test(incoming);
                if((enteringWorld&&this.policy.unset(incoming))||(returningToSpace&&mainSpaceTime))return handled;
            }
            if(!plain(variables.stat_data.世界))variables.stat_data.世界={};
            variables.stat_data.世界.時間=previous;
            return true;
        }
    }
    class WorldNpcAuditPolicy {
        constructor(engine,selection=DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY){this.engine=engine;this.selection=selection||DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY;this.boundPanel=null;}
        initialize(){
            const e=this.engine,had=Object.hasOwn(e.config,'npcBuildAuditEnabled');
            e.config.npcBuildAuditEnabled=e.config.npcBuildAuditEnabled===true;
            this.sync();if(!had)e.saveConfig();
        }
        sync(){
            const e=this.engine;
            NPC_BUILD_AUDIT_FEATURE_ENABLED=e.config.npcBuildAuditEnabled===true;
            this.syncWorldbookSelection();
            return NPC_BUILD_AUDIT_FEATURE_ENABLED;
        }
        enabled(){return this.engine.config.npcBuildAuditEnabled===true;}
        isWorldbook(entry){return ["NPC生成规则","状態プロトコル","状態プロトコル"].includes(this.selection.normalizeTitle(entry.title));}
        syncWorldbookSelection(catalogue=this.engine.bookCatalogue||[]){
            const e=this.engine,matches=catalogue.filter(entry=>this.isWorldbook(entry));if(!matches.length)return;
            const sync=settings=>{
                if(!settings)return;
                const previous=settings.selectedEntries;
                let selected=Array.isArray(previous)?copy(previous):catalogue.filter(entry=>!entry.technical&&this.selection.matches(entry,previous)).map(entry=>JSON.stringify([entry.book,entry.id]));
                selected=selected.filter(raw=>!matches.some(entry=>this.selection.matches(entry,[raw])));
                if(this.enabled())for(const entry of matches)if(!entry.technical)selected.push(JSON.stringify([entry.book,entry.id]));
                if(JSON.stringify(previous)!==JSON.stringify(selected))settings.selectedEntries=selected;
            };
            sync(e.config);sync(e.promptDraft);sync(e.getPromptDocuments().find(doc=>doc.id===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id)?.settings);
        }
        async afterCatalogue(result){
            const e=this.engine;e.bookCatalogue=result;this.syncWorldbookSelection(result);e.saveConfig();return result;
        }
        afterPromptSettings(){this.syncWorldbookSelection();this.engine.saveConfig();}
        setEnabled(value){
            const e=this.engine,wasBusy=!!e.busy;if(wasBusy)e.cancel();
            e.config.npcBuildAuditEnabled=value===true;this.sync();e.saveConfig();
            e.status=(e.config.npcBuildAuditEnabled?"NPC構築監査を有効化":"NPC構築監査を無効化")+(wasBusy?" · 現在の推演を停止しました":'');
            e.render(true);return e.config.npcBuildAuditEnabled;
        }
        async afterBuildRequest(request){this.sync();return request;}
        syncDerivedSchemaFields(target,checked) {
            const derived=new Set(['真属性',"最終属性","強化"]);
            if(Array.isArray(target)&&Array.isArray(checked)){
                const count=Math.min(target.length,checked.length);
                for(let i=0;i<count;i++)this.syncDerivedSchemaFields(target[i],checked[i]);
                return;
            }
            if(!plain(target)||!plain(checked))return;
            for(const key of derived){
                if(Object.hasOwn(checked,key))target[key]=checked[key]===undefined?undefined:copy(checked[key]);
                else if(Object.hasOwn(target,key))delete target[key];
            }
            for(const key of Object.keys(checked)){
                if(derived.has(key)||!Object.hasOwn(target,key))continue;
                this.syncDerivedSchemaFields(target[key],checked[key]);
            }
        }
        alignSchemaOrder(checked,target) {
            if(Array.isArray(checked))return checked.map((value,index)=>this.alignSchemaOrder(value,Array.isArray(target)?target[index]:undefined));
            if(plain(checked)&&plain(target)){
                const out={};
                for(const key of Object.keys(target))if(Object.hasOwn(checked,key))out[key]=this.alignSchemaOrder(checked[key],target[key]);
                for(const key of Object.keys(checked))if(!Object.hasOwn(out,key))out[key]=this.alignSchemaOrder(checked[key],target[key]);
                return out;
            }
            return checked;
        }
        async aroundRun(next){
            const e=this.engine;this.sync();
            const samsara=e.host&&e.host.Samsara,validate=samsara&&samsara.validateWorldState;
            if(typeof validate!=='function')return next();
            const policy=this;
            const wrapped=function(stat){
                const checked=validate.call(samsara,stat);
                policy.syncDerivedSchemaFields(stat,checked);
                return policy.alignSchemaOrder(checked,stat);
            };
            samsara.validateWorldState=wrapped;
            try{return await next();}
            finally{if(samsara.validateWorldState===wrapped)samsara.validateWorldState=validate;}
        }
        compactFooter(){
            const e=this.engine;if(!e.panel)return;
            const footer=e.panel.querySelector('footer');if(!footer)return;
            if(e.style&&!e.style.textContent.includes('.we-footer-status{')){
                e.style.textContent+='\n#sam-world-engine footer{align-items:center;min-width:0;overflow:hidden}\n'
                    +'#sam-world-engine footer .we-footer-status{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n'
                    +'#sam-world-engine footer .we-footer-meta{flex:0 0 auto;max-width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}\n'
                    +'@media(max-width:760px){#sam-world-engine footer .we-footer-meta{max-width:42%}}\n';
            }
            let status=footer.querySelector('.we-footer-status'),meta=footer.querySelector('.we-footer-meta');
            if(!status){
                const legacyStatus=footer.querySelector('span'),legacyMeta=footer.querySelector('small');
                const rawStatus=String(legacyStatus?.textContent||e.status||'').trim(),rawMeta=String(legacyMeta?.textContent||'').trim();
                status=e.host.document.createElement('span');status.className='we-footer-status';status.textContent=rawStatus;status.title=rawStatus;
                meta=e.host.document.createElement('span');meta.className='we-footer-meta';
                const version=rawMeta.match(/build\s*v?[\d.]+/i)||rawMeta.match(/\bv?\d+(?:\.\d+){1,3}\b/i);
                meta.textContent=version?version[0]:"世界進行";meta.title=rawMeta;footer.replaceChildren(status,meta);
            }else{
                status.title=String(status.textContent||e.status||'').trim();
                if(meta&&!meta.title)meta.title=String(meta.textContent||'').trim();
            }
        }
        renderSetting(){
            const e=this.engine;if(!e.panel)return;
            const enabled=this.enabled(),main=e.panel.querySelector('main');if(!main)return;
            main.querySelector('[data-npc-audit-setting]')?.remove();
            if(e.tab==="設定"){
                const block=e.host.document.createElement('section');block.className='we-section';block.setAttribute('data-npc-audit-setting','');
                block.innerHTML="<div class=\"we-section-head\"><h2>NPC構築監査 <span class=\"we-pill future\">実験的機能</span></h2><small>オプション機能 · 既定はオフ</small></div>"
                    +"<div class=\"we-setting-row\"><div class=\"we-setting-copy\"><b>ホット NPC の構築を自動補完</b><small>オフのときは職業・血統・装備・スキル・形態を走査・補写しません；関係は実際のシナリオに従って通常どおり疎に同期されます。オンにした場合のみ、ホット NPC に対して構築ギャップ監査を実行します。実体生成規則・NPC生成規則・状態プロトコルの資料チェックはこのスイッチに同期します。</small></div>"
                    +'<div class="we-setting-actions"><button class="we-setting-btn we-switch '+(enabled?'on':'')+'" data-action="npc-audit-toggle" aria-pressed="'+enabled+'"><span>'+(enabled?"有効":"無効")+'</span><span class="we-switch-track"><i></i></span></button></div></div>';
                const sections=Array.from(main.children),modelSection=sections.find(section=>section.querySelector?.('h2')?.textContent?.trim()==="モデル接続");
                main.insertBefore(block,modelSection||null);
            }else if(e.tab==='角色管理'&&!enabled){
                for(const note of main.querySelectorAll('.we-muted'))if(note.textContent.includes("世界進行のリクエストに含まれる注目人物は、バックグラウンドで不足項目を優先補充します"))note.textContent="自動構築監査は現在オフです；ここでは診断のみを表示します。設定タブで一時的に自動補完を有効にできます。";
            }
        }
        bindPanel(){
            const e=this.engine,panel=e.panel;if(!panel||this.boundPanel===panel)return;
            this.boundPanel=panel;this.compactFooter();
            panel.addEventListener('click',event=>{
                const button=event.target?.closest?.('[data-action="npc-audit-toggle"]');
                if(!button||!panel.contains(button))return;
                this.setEnabled(!this.enabled());
            });
        }
        afterRender(){this.renderSetting();this.compactFooter();}
        dispose(){this.boundPanel=null;}
    }
    class WorldHistoryLifecycle {
        constructor(engine,policy=DEFAULT_WORLD_HISTORY_MEMORY_POLICY){this.engine=engine;this.policy=policy||DEFAULT_WORLD_HISTORY_MEMORY_POLICY;this.boundPanel=null;}
        initialize(){
            const e=this.engine;let dirty=false;
            if(!Object.hasOwn(e.config,'sendHistoryToProse')){e.config.sendHistoryToProse=false;dirty=true;}
            else e.config.sendHistoryToProse=e.config.sendHistoryToProse===true;
            e.historyMaintenanceBusy=false;e.lastHistoryMaintenance='';
            if(dirty)e.saveConfig();
        }
        setSendToProse(value){
            const e=this.engine;e.config.sendHistoryToProse=value===true;e.saveConfig();e.render();return e.config.sendHistoryToProse;
        }
        proseMemory(stat){return this.policy.project(stat?.世界?.[PATH]||{});}
        async requestSummary(world,batch,outputLevel){
            const e=this.engine,saved=e.lastTransportInfo;
            try{
                const system=e.promptRegistry?.historySystem?.()||HISTORY_MEMORY_SYSTEM;
                const prompt=this.policy.prompt(world,batch,outputLevel);
                const input=e.promptRegistry?.historyInput?.(prompt)||prompt;
                const raw=await e.requestAI(system,input,{schema:HISTORY_MEMORY_SCHEMA,schemaName:'samsara_world_history_summary_v1',structured:'auto',temperature:0.2});
                return this.policy.parseReply(raw);
            }finally{e.lastTransportInfo=saved;}
        }
        beforeWorldCommit(next,context={}){
            const e=this.engine,summary=String(context.worldResult?.要約||context.reply?.summary||e.lastWorldResult?.要約||'').trim();
            const messageId=Number(context.messageId),backend=next?.世界?.[PATH];
            if(!summary||!Number.isInteger(messageId)||!plain(backend))return false;
            if(!plain(backend.历史))backend.历史={};if(!plain(backend.历史总结))backend.历史总结={};
            const key=this.policy.leafKey(messageId),record={時間:String(next.世界?.時間||backend.処理済み時刻||context.baseStat?.世界?.時間||''),事实:summary,关联事件:[]};
            const previous=backend.历史[key];
            if(plain(previous)&&String(previous.時間||'')===record.時間&&String(previous.事实||'')===record.事实)return false;
            backend.历史[key]=record;
            const invalidated=this.policy.invalidateAncestors(backend,"履歴:"+key);
            e.lastHistoryMaintenance="直近の歴史を更新"+(invalidated.length?" · 旧要約が "+invalidated.length+" 件無効":'');
            return true;
        }
        async maintain(){
            const e=this.engine;if(e.historyMaintenanceBusy)return 0;
            e.historyMaintenanceBusy=true;
            const previousStatus=e.status;let made=0,failed='';
            try{
                const snapshot=e.snapshot(),stat=copy(snapshot.stat),backend=stat?.世界?.[PATH];
                if(!plain(backend))return 0;
                if(!plain(backend.历史总结))backend.历史总结={};
                const startDigest=this.policy.digest(backend);
                for(let level=0;level<32;level++){
                    const batch=this.policy.batchForLevel(backend,level);if(!batch.length)continue;
                    const outputLevel=level+1;e.status="長期歴史記憶を整理中 · L"+outputLevel;e.render();
                    let summary='';
                    try{summary=await this.requestSummary(stat.世界,batch,outputLevel);}
                    catch(error){failed=String(error?.message||error);break;}
                    const key=this.policy.nextKey(backend,outputLevel);
                    backend.历史总结[key]={
                        階層:outputLevel,要約:summary,子项:batch.map(node=>node.id),
                        起始时间:String(batch.find(node=>node.timeStart)?.timeStart||''),
                        结束时间:String([...batch].reverse().find(node=>node.timeEnd)?.timeEnd||''),
                        起始序位:Math.min(...batch.map(node=>Number(node.lo)||0).filter(n=>n>0)),
                        结束序位:Math.max(...batch.map(node=>Number(node.hi)||0).filter(n=>n>0)),
                        创建时间:String(stat.世界?.時間||'')
                    };made++;
                }
                if(!made)return 0;
                const current=e.snapshot(),currentBackend=current.stat?.世界?.[PATH];
                if(this.policy.digest(currentBackend)!==startDigest){e.lastHistoryMaintenance="要約中に歴史が変化したため、今回の要約結果は破棄し、次回に再試行";return 0;}
                const validate=e.host.Samsara&&e.host.Samsara.validateWorldState,next=validate?validate(stat):stat,result=current.raw;
                result.stat_data=next;e.committing=true;
                await current.mvu.replaceMvuData(result,{type:'message',message_id:current.id});
                e.lastHistoryMaintenance="歴史要約ノードを "+made+" 件追加";return made;
            }finally{
                e.committing=false;if(failed)e.lastHistoryMaintenance="歴史要約は後で再試行："+failed;
                e.status=previousStatus+(made?" · 歴史要約+"+made:(failed?" · 歴史要約は再試行待ち":''));
                e.render();e.historyMaintenanceBusy=false;
            }
        }
        async aroundRun(next){
            const e=this.engine,result=await next();
            if(result===true){
                try{await this.maintain();}
                catch(error){e.lastHistoryMaintenance="歴史要約は後で再試行："+String(error?.message||error);try{console.warn("[世界進行] "+e.lastHistoryMaintenance);}catch(_){}}
            }
            return result;
        }
        bindPanel(){
            const e=this.engine,panel=e.panel;if(!panel||this.boundPanel===panel)return;
            this.boundPanel=panel;
            panel.addEventListener('click',event=>{
                const button=event.target?.closest?.('[data-action="history-prose-toggle"]');
                if(!button||!panel.contains(button))return;
                event.preventDefault();this.setSendToProse(e.config.sendHistoryToProse!==true);
            });
        }
        dispose(){this.boundPanel=null;}
    }
    class WorldSoftMaintenanceFeature extends WorldRequestFeature {
        async afterBuildRequest(request,_base){
            let payload;
            try{payload=JSON.parse(request.input);}catch(_){return request;}
            if(plain(payload?.传闻维护?.公开传闻)){
                for(const category of RUMOR_PUBLIC_CATEGORIES){
                    const item=payload.传闻维护.公开传闻[category];
                    if(item&&Number(item.当前数量)===0)item.为空补足=1;
                }
            }
            payload.验收策略={
                模式:"段階別検証",
                硬错误:"Schema・不正な状態・因果参照の破損・明確な時間軸の衝突",
                软维护:"イベント日程の補完、噂の補充、伝播の再確認；ターンをまたいで段階的に完了でき、ターン全体を止めてはならない"
            };
            request.input=JSON.stringify(payload,null,2);
            request.manifest=Object.assign({},request.manifest,{
                验收策略:{模式:"段階別検証",事件因果锚点可接受:true,传闻补齐:'软维护'}
            });
            return request;
        }
    }
    class WorldIntegrityRequestFeature extends WorldRequestFeature {
        async afterBuildRequest(request,_base){
            request.manifest=request.manifest||{};
            request.manifest.因果与时间约束={
                启用:true,
                因果偏移处理:"重大な世界級の変化がある時のみ維持；変化がなければ省略",
                单条建议范围:'-12~-1 / +1~+15',
                宏观事实时间:"同一自然日は許可；日をまたぐ未来は拒否",
                人物精确时间:"双方が HH:mm の場合のみ精密比較"
            };
            return request;
        }
    }
    class WorldActivityRequestFeature extends WorldRequestFeature {
        constructor(engine,policy=DEFAULT_WORLD_ACTIVITY_POLICY){super(engine);this.policy=policy||DEFAULT_WORLD_ACTIVITY_POLICY;}
        async afterBuildRequest(request,base){
            let payload;
            try{payload=JSON.parse(request.input);}catch(_){return request;}
            const requirement=this.policy.requirement(base?.stat||{});
            payload.本轮世界活动交付={
                当前数量:copy(requirement.当前数量),
                初始化缺口:copy(requirement.初始化缺口),
                硬要求:[
                    "異端を今回唯一の変化にしてはいけません。事件、勢力地区、通常人物のいずれかで、異端以外の実質的な変化を最低 1 件進めてください。",
                    "地区が空なら、現在地・段階に関係する地区を最低 1 件作成してください。",
                    "進行中で大局以外の事件がなければ、実際に発生中の現在事件・直近の節目を最低 1 件作成してください。",
                    "更新時刻・次回確認だけの変更、元の値の反復、発生待ちの大局的な節目の追加だけでは実質的な変化になりません。"
                ],
                软目标:['__PROMPT_REGISTRY_WORLD_ACTIVITY_SOFT__']
            };
            request.input=JSON.stringify(payload,null,2);
            request.timeline=Object.assign({},request.timeline,{世界活动要求:requirement});
            request.manifest=Object.assign({},request.manifest,{
                世界活动交付:{当前数量:copy(requirement.当前数量),初始化缺口:copy(requirement.初始化缺口)}
            });
            return request;
        }
    }
    class WorldDueEventFeature extends WorldRequestFeature {
        constructor(engine,policy=DEFAULT_WORLD_DUE_EVENT_POLICY){super(engine);this.policy=policy||DEFAULT_WORLD_DUE_EVENT_POLICY;}
        async afterBuildRequest(request,base){
            const due=this.policy.review(base?.stat||{});
            request.due=due;
            try{
                const payload=JSON.parse(request.input);
                payload.本轮必须复核的到期事件=due;
                request.input=JSON.stringify(payload,null,2);
            }catch(_){}
            return request;
        }
    }
    class WorldTaskAwarenessFeature extends WorldRequestFeature {
        constructor(engine,taskLedger=DEFAULT_WORLD_TASK_AWARENESS_SERVICE,selection=DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY){super(engine);this.taskLedger=taskLedger||DEFAULT_WORLD_TASK_AWARENESS_SERVICE;this.selection=selection||DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY;}
        restoreWorldbookSelection(catalogue){
            const engine=this.engine;
            if(engine.config.activePromptDocumentId!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.id||!Array.isArray(catalogue))return false;
            const matches=catalogue.filter(entry=>this.selection.normalizeTitle(entry.title)===TASK_WORLD_BOOK_TITLE&&!entry.technical);
            let changed=false;
            if(matches.length){
                const selected=Array.isArray(engine.config.selectedEntries)?copy(engine.config.selectedEntries):[];
                for(const entry of matches){
                    const raw=JSON.stringify([entry.book,entry.id]);
                    if(!selected.includes(raw)){selected.push(raw);changed=true;}
                }
                engine.config.selectedEntries=selected;
            }
            const applied=Array.isArray(engine.config.builtinDefaultWorldbookExclusionsApplied)?engine.config.builtinDefaultWorldbookExclusionsApplied:[];
            const cleaned=applied.filter(title=>title!==TASK_WORLD_BOOK_TITLE);
            if(cleaned.length!==applied.length){engine.config.builtinDefaultWorldbookExclusionsApplied=cleaned;changed=true;}
            if(changed){
                const builtin=engine.getPromptDocuments().find(doc=>doc.id===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id);
                if(builtin?.settings)builtin.settings.selectedEntries=copy(engine.config.selectedEntries||[]);
                engine.saveConfig();
            }
            return changed;
        }
        async afterCatalogue(catalogue){
            this.restoreWorldbookSelection(catalogue);
            return catalogue;
        }
        async afterBuildRequest(request,_base){
            let payload;
            try{payload=JSON.parse(request.input);}catch(_){return request;}
            request.manifest=Object.assign({},request.manifest,{
                任务感知:{任务数量:Object.keys(payload?.当前变量?.任務?.リスト||{}).length,只读:true,インスタンス実績:false}
            });
            return request;
        }
    }
    class WorldChronologyFeature extends WorldRequestFeature {
        constructor(engine,policy=DEFAULT_WORLD_CHRONOLOGY_POLICY,selection=DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY){super(engine);this.policy=policy||DEFAULT_WORLD_CHRONOLOGY_POLICY;this.selection=selection||DEFAULT_WORLD_KNOWLEDGE_SELECTION_POLICY;}
        initialize(){
            const engine=this.engine;
            if(!engine.config.activePromptDocumentId||engine.config.activePromptDocumentId===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id){
                const upgraded=upgradeChronologyPreset(engine.config.preset);
                if(upgraded!==engine.config.preset){engine.config.preset=upgraded;engine.saveConfig();}
            }
        }
        async afterBuildRequest(request,base){
            let payload;
            try{payload=JSON.parse(request.input);}catch(_){return request;}
            const state=base?.stat||{};
            const chronologyScan=[state?.世界?.名称,"原作","タイムライン","時間軸",'年表',"暦の検証","主要な出来事","重大事件","物語のあらすじ","物語の章","章",'未来',"今後"].filter(Boolean).join(' ');
            const chronologyBooks=await this.engine.worldbook(chronologyScan,{timelineBackbone:true});
            const chronologyOnly=(chronologyBooks||[]).filter(book=>this.selection.isTimelineBackbone(book?.名称));
            const existing=Array.isArray(payload.世界书)?payload.世界书.map(String):[],merged=existing.slice(),seen=new Set(existing);
            for(const book of chronologyOnly){
                const content=String(book?.内容||'');
                if(content&&!seen.has(content)){seen.add(content);merged.push(content);}
            }
            payload.世界书=merged;
            this.policy.setGuard(state?.世界?.時間,merged);
            const next=payload?.时间线调度?.下一宏观节点||null;
            payload.时间线基准={
                当前世界时间:String(state?.世界?.時間||''),
                下一宏观节点:next?{名称:String(next.名称||''),当前排期:String(next.時間||'')}:null,
                原著时间资料:chronologyOnly.length?"資料から "+chronologyOnly.length+" 件の明確なタイムライン/年表を読み込みました":'__PROMPT_REGISTRY_NO_EVIDENCE__',
                规划原则:{},
                要求:''
            };
            request.input=JSON.stringify(payload,null,2);
            const manifest=request.manifest||(request.manifest={});
            const rows=Array.isArray(manifest.世界书条目)?manifest.世界书条目:[];
            const rowKeys=new Set(rows.map(row=>String(row?.世界书||'')+'\u0000'+String(row?.条目ID||'')));
            for(const book of chronologyOnly){
                const key=String(book?.世界书||'')+'\u0000'+String(book?.条目ID||'');
                if(rowKeys.has(key))continue;
                rowKeys.add(key);
                rows.push({世界书:book?.世界书,条目ID:book?.条目ID,名称:book?.名称,估算Tokens:estimateTokens(book?.内容)});
            }
            manifest.世界书条目=rows;
            if(plain(manifest.世界书读取))manifest.世界书读取.实际读取=merged.length;
            manifest.原著时间轴={
                强制校准:true,
                校验模式:"発生済みの事実を固定。日単位で明確な資料は厳密に検証。月・時間帯・順序・条件・傾向は柔軟に参照。確認済みの変動は影響する節目だけを再構成",
                剧情原则:"原作は介入がない場合の既定の未来であり、運命の強制修正は行いません",
                当前世界时间:String(state?.世界?.時間||''),
                时间线资料:chronologyOnly.map(book=>String(book?.名称||'')).filter(Boolean),
                下一宏观节点:next?String(next.名称||''):''
            };
            return request;
        }
    }
    class WorldRumorRequestFeature extends WorldRequestFeature {
        constructor(engine,rumor){super(engine);this.rumor=rumor||DEFAULT_WORLD_RUMOR_SERVICE;}
        initialize(){
            const engine=this.engine;
            if(engine.config.activePromptDocumentId!==BUILTIN_DEFAULT_PROMPT_DOCUMENT.id)return;
            const upgraded=this.rumor.upgradePreset(engine.config.preset);
            if(upgraded!==engine.config.preset){engine.config.preset=upgraded;engine.saveConfig();}
        }
        async afterBuildRequest(request,base){
            const maintenance=this.rumor.requirements(base?.stat||{});
            let payload;
            try{payload=JSON.parse(request.input);}catch(_){return request;}
            if(Array.isArray(request.timeAnomalies))request.timeAnomalies=request.timeAnomalies.filter(item=>item?.タイプ!=='传闻维护');
            if(Array.isArray(payload.本轮必须修复的时间越界记录))payload.本轮必须修复的时间越界记录=payload.本轮必须修复的时间越界记录.filter(item=>item?.タイプ!=='传闻维护');
            payload.传闻维护={
                话题:copy(maintenance.话题||[]),
                公开传闻:copy(maintenance.公开传闻||{}),
                本轮必须复核的传播链:copy(maintenance.本轮必须复核的传播链||[]),
                取材边界:'__PROMPT_REGISTRY_RUMOR_SOURCE__',
                本轮公开传闻动作:maintenance.本轮公开传闻动作,
                刷新原因:copy(maintenance.刷新原因||[]),
                世界侧可传播事实:copy(maintenance.世界侧可传播事实||[]),
                本轮新公开事实:copy(maintenance.本轮新公开事实||[])
            };
            request.input=JSON.stringify(payload,null,2);
            request.rumorMaintenance=copy(maintenance);
            request.manifest=Object.assign({},request.manifest,{
                传闻维护:{
                    空分类:RUMOR_PUBLIC_CATEGORIES.filter(category=>maintenance.公开传闻?.[category]?.当前数量===0),
                    待复核传播:(maintenance.本轮必须复核的传播链||[]).map(item=>item.名称),
                    可传播候选:(maintenance.本轮新公开事实||[]).map(item=>item.名称)
                },
                传闻节流:{
                    模式:"世界側の事実駆動",
                    本轮动作:maintenance.本轮公开传闻动作,
                    刷新原因:copy(maintenance.刷新原因||[]),
                    正文直接取材:false,
                    软失败不重试:true
                }
            });
            return request;
        }
        hideHostOnlyDetails(root) {
            const sections=Array.from(root?.querySelectorAll?.('.we-section')||[]);
            const trade=sections.find(section=>section.querySelector('.we-section-head h2')?.textContent?.trim()==="情報取引");
            if(!trade)return 0;
            let removed=0;
            for(const detail of trade.querySelectorAll('details')){
                const summary=detail.querySelector('summary')?.textContent?.trim();
                if(summary==="進行役の記録"){
                    detail.remove();
                    removed++;
                }
            }
            return removed;
        }

        afterRender(){
            if(this.engine.tab==="噂")this.hideHostOnlyDetails(this.engine.panel?.querySelector?.('main'));
        }
    }
    class WorldNpcAuditPromptFeature {
        constructor(engine){this.engine=engine;}
        initialize(){
            const engine=this.engine,current=String(engine.config.npcAuditPrompt||'');
            const previousNarrativeDefault=current.includes("【キャラクター管理 · NPC 構成監査】")
                &&current.includes("最低構成：雑兵=血統 1／装備 2／技能 1")
                &&(current.includes("監査段階は既存の身分・職業・背景・態度が示す物語上の重要度だけから判断します")
                    ||current.includes("監査で追加する装備は状態を一律 1 にします"));
            if(!current.trim()||current===NPC_BUILD_AUDIT_RULES||previousNarrativeDefault){
                engine.config.npcAuditPrompt=NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT;
                if(plain(engine.config.promptRegistry))engine.config.promptRegistry.npcAudit=NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT;
            }
        }
    }
    const WORLD_PROMPT_RETRY_ACCEPTED_PLAN="「補充一覧」に厳密に従い、検証に合格しなかった結果だけを補充・修正してください。承認済みの結果はローカル検証を通過しているため原則すべて保持し、全体を書き直さないでください。同名の対象は上書きが必要なフィールドだけを提出します。今回の提案を撤回する場合は操作=今回の提案を撤回を使います。出力は引き続き WorldResult JSON 1 個だけです。";
    const WORLD_PROMPT_RETRY_ACCEPTED="拒否の原因になった結果だけを補充・修正してください。承認済みの結果は原則保持し、全体を書き直さないでください。同名の対象は上書きが必要なフィールドだけを提出します。今回の提案を撤回する場合は操作=今回の提案を撤回を使います。出力は引き続き WorldResult JSON 1 個だけです。";
    const WORLD_PROMPT_RETRY_FRESH="形式または処理内容の誤りを修正し、WorldResult JSON を 1 個だけ再出力してください。誤りの説明や保存パスは出力しないでください。";
    const WORLD_PROMPT_PROJECTION_GUIDANCE="非戦闘の本文は完全な因果軌道を読み取る。現在段階は現在の情勢に、ストーリーライン/次ノードは長期的な語りの方向に、偏移記録は章をまたぐ因果記憶に用いる。これらは計画の根拠であり、キャラクターの予知や背後情報の自動把握を意味しない。本文はさらに、進行中の現在イベントの公開フィールドと、プログラムが選別した場外シーンを読み取る。各ホット地区には共有環境/現場集団が一度だけ現れ、人物リストは各自の行動事実のみを運び、関連イベントは索引としてのみ扱う。アクティブな異端は常にその所在ホットシーンに保持される。以上はいずれも語りの連続性のために用いられ、キャラクターが既知であることを意味しない。現在のシーンに影響しうる現在イベントは、公開の兆候と可視の影響を維持すべきである。隠された条件、既定の展開、未来のマクロイベントの詳細を公開フィールドに詰め込んではならない。";
    const WORLD_PROMPT_REQUEST_SUMMARY="現在変数は確認済みのホット事実であり、重複決算しない。アーカイブ済みの旧イベントと回収済みの伝播を再作成しない。世界ブックが空でも阻害要因にならない。業務上の事実のみを提出し、保存パスはプログラムがコンパイルする。";
    const WORLD_PROMPT_MACRO_PLANNING="今回は必ず骨格を補完すること。時間が進んでいない、本文にマクロな変化がない、業務上の変化がない、といった理由で省略してはならない。待発生ノードの確立は将来の計画であり、次のマクロ境界の後に置いてよく、イベントが今発生することを意味しない。直近の細部と既に発生した事実は、依然として今回の時間容量と次のマクロ境界に制約される。数を埋めるために原作の日付を前倒ししたり、未来イベントの結果を先に決算してはならない。更新時間には現在の世界時間を用いる。";
    const WORLD_PROMPT_MACRO_ACCEPTANCE="既存の状態と今回の結果を統合したうえで数える。今回のラウンドで既存のマクロノードを終了または取消した場合、ウィンドウから外れた分を補足しなければならない。リトライ時は受理済みの業務結果と最新の補完リストに従い、受理済みノードを重複作成しない。";
    const WORLD_PROMPT_DUE_REVIEW="ソフト警告：このイベントは計画/再確認時刻に到達した。条件と前因が満たされれば進行中へ移行する；まだ発生しない場合は発生待ちのまま維持し、新しい「下次检查」を優先的に記入してよい。「条件」はイベントのトリガー条件のみを表し、延期や阻害として書き換えてはならない。未処理でも今回の世界進行が却下されることはない。";
    const WORLD_PROMPT_CHRONOLOGY_INPUT="まず介入がない場合の原作・公式の既定の展開を判断し、その後で大局的な節目の日付・粒度・期間を決めます。発生済みの事実は上書きできず、日単位で明確な日付は厳密に検証します。月・時間帯・順序・条件・傾向は柔軟な制約として慎重に計画します。確認済みの因果変動が節目を変えるに十分なら影響する部分だけを再構成し、原作に戻すための強制修正はしません。";
    const WORLD_PROMPT_CHRONOLOGY_NO_EVIDENCE="明確な時間資料が見つかりません。モデルが持つ原作・作品の知識を優先して本筋の流れを維持し、不明な部分は慎重に未確定のままにします。独自の危機で作品の物語を置き換えたり、進行のために期間を圧縮したりしないでください";
    const WORLD_PROMPT_RUMOR_SOURCE_BOUNDARY="世界側の可伝播事実、既存の伝播チェーン、既存の公開噂のみを使用する；本文は直接の伝播源ではない";
    const WORLD_PROMPT_CHRONOLOGY_PRINCIPLES=JSON.stringify({
        剧情主轴:"原作・公式設定は介入がない場合の既定の未来です。十分な確認済みの因果変化がない場合、作品内ですでに進行する物語を優先して進め、その後で新しい世界事件を広げます。",
        证据分级:"発生済みの事実は固定します。日単位で明確な資料は厳密に検証し、月・時間帯・順序・条件付きの展開・傾向・大まかな間隔は元の精度を保つ柔軟な制約とします。",
        偏移处理:"確認済みの変動は実際に影響を受ける節目だけを再構成し、影響のない原作の節目は存続します。「原作への回帰」を理由に同等の死、代替事故、根拠のない復活、その他の運命修正を強制してはいけません。",
        滚动窗口:"3~5個のマクロノードは現在の計画視野にすぎず、全篇章を覆う必要はありません；近めに計画する方が、遠い大事件をまとめて詰め込むより望ましい。",
        节点粒度:"マクロノード一つは一つの段階転換のみを表します；遠征、集結、連続戦役、複数の独立した劇情段階は分割するかスパンを広げてください。",
        间隔自检:"スケジューリング前に、前ノードから本ノードまで現実に何を経る必要があるかを判断し、移動・準備・組織動員・因果の発展に十分な時間を残してください。",
        时间精度:"資料が月/時段/順序までしかない場合は同じ精度を保ち慎重に余白を残し、並べ替えの便宜のために日単位の日付を無理に作らないこと。"
    },null,2);
    const WORLD_PROMPT_ALIEN_REVIEW="今回再確認の条件を満たした活動中の異端だけ、WorldResult.人物 に新しい活動を提出してください。地点・目標・行動は空にしないでください。人物の更新時刻は記入不要で、プログラムが今回の最終世界時刻を記録します。新情報がない場合は既存の目標・行動を維持してください。モデルが <user> の行動を知っただけで追跡や方針変更をしてはいけません。<user> の行動を理由に変更する場合は、既存の認識、または今回記録する追跡可能な認識・認識の出典が必要です。今回死亡が確定した場合は異端の状態を死亡に変更するだけにしてください。";
    const WORLD_PROMPT_WORLD_ACTIVITY_INPUT=[
        "異端を今回唯一の変化にしてはいけません。事件、勢力地区、通常人物のいずれかで、異端以外の実質的な変化を最低 1 件進めてください。",
        "地区が空なら、現在地・段階に関係する地区を最低 1 件作成してください。",
        "進行中で大局以外の事件がなければ、実際に発生中の現在事件・直近の節目を最低 1 件作成してください。",
        "更新時刻・次回確認だけの変更、元の値の反復、発生待ちの大局的な節目の追加だけでは実質的な変化になりません。"
    ].join('\n');
    const WORLD_PROMPT_WORLD_ACTIVITY_SOFT_INPUT="勢力が空なら、現在の情勢に実際に関わる実在の勢力・組織を優先して 1 件補い、WorldResult.勢力 と WorldResult.勢力地区（種別=勢力）を同名で提出します。信頼できる資料がない場合や、名声・Schema などの規則で検証に失敗した場合、記録を埋めるための創作・反復提出は避け、他の合格済み結果を妨げないでください。";
    const WORLD_PROMPT_HISTORY_INPUT="指定された順序で圧縮すること；時間フィールドは権威あるアンカーであり、書き換えたり捏造してはならない。";
    const WORLD_PROMPT_WORLD_TIME_INPUT=JSON.stringify({
        所有权:"世界進行が排他的に書き込み、変数 AI は読み取り専用",
        初始化锚定:{
            依据顺序:["最新の確定本文","現在の段階と現在地","読み込み済みのタイムライン・年表・章の資料","モデルが持つ原作知識","慎重な推論"],
            禁止:"次の大局的な節目、任務の期限、未来事件の日付をそのまま現在の世界時刻にしてはいけません。一意に特定できない場合は粗い時間精度を維持してください。"
        },
        正文时间职责:"最新本文で一夜経過、数時間後、翌日、日をまたぐ移動、新しい日付・時間帯が明示された場合は、最上位の「時刻」を出力して世界時計を同期してください。古い時計を維持したまま、新しい時点ですでに発生した事実を提出してはいけません。",
        精确日期格式:"最上位の時刻、および事件・履歴・伝播などの日付が月日まで特定できる場合は {yyy}年-{mm}月-{dd}日-{時間帯} を使います。月は数字とし、独自の月名で置き換えないでください。",
        时间段候选:['凌晨','黎明','清晨','早晨','上午','中午','午后','下午','傍晚','入夜','晚上','深夜'],
        推进原则:"時間帯は大まかな基準であり、毎回進むカウンターではありません。次の時間帯に達するほど時間が経過していなければ元の値を維持し、本文または明確な時間資料で妥当な時間経過が確認できる場合だけ進めてください。"
    },null,2);
    const WORLD_PROMPT_INPUT_SEMANTICS=JSON.stringify({
        世界书:"任意の設定/原作との差異/時間資料。既に発生した事実ではなく、世界ブックがなくても正常に推演しなければならない。",
        当前变量:"世界進行専用のホットデータ投影。世界、人物能力、完全な資産台帳、アクティブな伝播、直近の因果偏移、および「直近の原始アンカー + より古いルート要約」から成る階層的な長期歴史記憶を含む。原始履歴は永久にMVUに残り、上位の要約に取り込まれた旧ノードは再びホットコンテキストへ入らない。資産はWorldResult.资产と同一のトップレベル台帳で双方向に同期する。提供されていない任務/ショップ/純決算データはこのエンジンの責務ではない。",
        正文楼层:"すでに演出されたストーリー。現在の事実と時間スパンを確認するために用い、舞台裏の日常として語り直さない。",
        程序结构修复:"エンジンがすでに行った確定的な訂正。出力でプログラムが降格/修正した旧エラーを復元してはならない。",
        时间线调度:"プログラムが算出したマクロ境界と期限付き再検証要求。意味的な推演はモデルが担い、スケジュールプロトコルを再定義しない。",
        WorldResult:"唯一の業務成果物。 JSON Pointer、add/replace パス、プログラムログを含まない。",
        角色管理:"NPC構築監査が提供された場合、列挙された既存NPCのギャップのみを扱う。完全な構築資料は監査対象の中でのみ提供し、全NPCが重複してコンテキストを占有するのを避ける。",
        任务列表:"読み取り専用の因果台帳。イベントは关联任务で既存の任務を参照できます；任務の作成・削除・状態変更・提出・決算は禁止です。"
    },null,2);

    function worldPromptModuleDefault(key,fallback=''){
        try{
            const item=Array.isArray(WORLD_PROMPT_MODULE_DEFS)?WORLD_PROMPT_MODULE_DEFS.find(row=>row?.key===key):null;
            if(item&&typeof item.fallback==='string')return item.fallback;
        }catch(_){}
        return String(fallback||'');
    }

    class WorldPromptRegistry {
        constructor(engine){
            this.engine=engine;
            const def=(value)=>Object.freeze(value);
            this._definitions=Object.freeze([
                def({key:'preset',title:"実行手順 / メインプリセット",group:"主な手順",source:'COMPACT_DEFAULT_PRESET / config.preset',scope:'system',condition:"世界進行の主リクエストごと",native:true,defaultValue:()=>typeof COMPACT_DEFAULT_PRESET==='string'?COMPACT_DEFAULT_PRESET:DEFAULT_PRESET}),
                def({key:'core',title:"世界エンジンの基本制約",group:"主な手順",source:'CORE_WORLD_RULES',scope:'system',condition:"世界進行の主リクエストごと",native:true,defaultValue:()=>typeof COMPACT_CORE_WORLD_RULES==='string'?COMPACT_CORE_WORLD_RULES:CORE_WORLD_RULES}),
                def({key:'macro',title:"大局構成",group:"主な手順",source:'DEFAULT_MACRO_PROMPT',scope:'system',condition:"今回、大局構成の作成・補充が必要な場合",native:true,defaultValue:()=>typeof COMPACT_MACRO_PROMPT==='string'?COMPACT_MACRO_PROMPT:DEFAULT_MACRO_PROMPT}),
                def({key:'stability',title:"世界の自己修復",group:"主な手順",source:'DEFAULT_STABILITY_PROMPT_TEMPLATE',scope:'system',condition:"安定値が 100 未満で、世界超安定が無効の場合",native:true,defaultValue:()=>typeof COMPACT_STABILITY_PROMPT_TEMPLATE==='string'?COMPACT_STABILITY_PROMPT_TEMPLATE:DEFAULT_STABILITY_PROMPT_TEMPLATE}),
                def({key:'npcAudit',title:'NPC构筑审计',group:"主な手順",source:'NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT',scope:'system',condition:"NPC 構成監査が有効で、今回監査対象がある場合",native:true,defaultValue:()=>typeof NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT==='string'?NPC_BUILD_AUDIT_RULES_NARRATIVE_WEIGHT:NPC_BUILD_AUDIT_RULES}),
                def({key:'outputProtocol',title:"WorldResult 出力プロトコルの説明",group:"主な手順",source:'WorldResultContract.instruction()',scope:'system',condition:"世界進行の主リクエストごと。プログラムの JSON Schema は固定の読み取り専用",native:true,defaultValue:()=>WORLD_RESULT_CONTRACT.instruction()}),
                def({key:'task',title:"任務読み取り専用",group:"実行モジュール",source:'TASK_AWARENESS_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('task',typeof TASK_AWARENESS_RULES==='string'?TASK_AWARENESS_RULES:'')}),
                def({key:'chronology',title:"原作 / データベース年表",group:"実行モジュール",source:'CHRONOLOGY_GUARD_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('chronology',typeof CHRONOLOGY_GUARD_RULES==='string'?CHRONOLOGY_GUARD_RULES:'')}),
                def({key:'maintenance',title:"段階的メンテナンス",group:"実行モジュール",source:'SOFT_MAINTENANCE_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('maintenance',typeof SOFT_MAINTENANCE_RULES==='string'?SOFT_MAINTENANCE_RULES:'')}),
                def({key:'exploration',title:"探索台帳",group:"実行モジュール",source:'EXPLORATION_PROJECTION_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('exploration',typeof EXPLORATION_PROJECTION_RULES==='string'?EXPLORATION_PROJECTION_RULES:'')}),
                def({key:'integrity',title:"因果と事実時間",group:"実行モジュール",source:'WORLD_INTEGRITY_GUARD_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('integrity',typeof WORLD_INTEGRITY_GUARD_RULES==='string'?WORLD_INTEGRITY_GUARD_RULES:'')}),
                def({key:'worldTime',title:"世界時刻の管理権限",group:"実行モジュール",source:'WORLD_TIME_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>worldPromptModuleDefault('worldTime',typeof WORLD_TIME_RULES==='string'?WORLD_TIME_RULES:'')}),
                def({key:'rumor',title:"噂と伝播",group:"実行モジュール",source:'RUMOR_WORLD_SOURCE_RULES',scope:'system',condition:"世界進行の主リクエストごと。条件未成立なら既存の伝播を維持",defaultValue:()=>worldPromptModuleDefault('rumor',typeof RUMOR_WORLD_SOURCE_RULES==='string'?RUMOR_WORLD_SOURCE_RULES:(typeof RUMOR_THROTTLE_RULES==='string'?RUMOR_THROTTLE_RULES:''))}),
                def({key:'worldActivity',title:'世界活动交付',group:"実行モジュール",source:'WorldActivityPolicy / WORLD_ACTIVITY_DELIVERY_RULES',scope:'system',condition:"世界進行の主リクエストごと",defaultValue:()=>typeof WORLD_ACTIVITY_DELIVERY_RULES==='string'?WORLD_ACTIVITY_DELIVERY_RULES:''}),
                def({key:'historyMemory',title:"世界の長期履歴の圧縮",group:"補助モデル",source:'HISTORY_MEMORY_SYSTEM',scope:'system',condition:"履歴記憶が自動圧縮の閾値に達した場合、個別にモデルを呼び出す",defaultValue:()=>typeof HISTORY_MEMORY_SYSTEM==='string'?HISTORY_MEMORY_SYSTEM:''}),
                def({key:'inputSemantics',title:"入力の意味の説明",group:"リクエスト内の指示",source:"40-engine-runtime.part.js / 入力の意味",scope:'user payload',condition:"世界進行の主リクエストごと",defaultValue:()=>WORLD_PROMPT_INPUT_SEMANTICS}),
                def({key:'macroPlanningGuidance',title:"大局構成 · 計画と発生",group:"リクエスト内の指示",source:"40-engine-runtime.part.js / 今回完成すべき大局構成",scope:'user payload',condition:"今回、大局構成の補充を求める場合",defaultValue:()=>WORLD_PROMPT_MACRO_PLANNING}),
                def({key:'macroAcceptanceGuidance',title:"大局構成 · 検証",group:"リクエスト内の指示",source:"40-engine-runtime.part.js / 今回完成すべき大局構成",scope:'user payload',condition:"今回、大局構成の補充を求める場合",defaultValue:()=>WORLD_PROMPT_MACRO_ACCEPTANCE}),
                def({key:'projectionGuidance',title:'正文可见投影规则',group:"リクエスト内の指示",source:"40-engine-runtime.part.js / 本文に提示する情報の規則",scope:'user payload',condition:"世界進行の主リクエストごと",defaultValue:()=>WORLD_PROMPT_PROJECTION_GUIDANCE}),
                def({key:'requestSummaryGuidance',title:"今回の入力の総合説明",group:"リクエスト内の指示",source:"40-engine-runtime.part.js / 説明",scope:'user payload',condition:"世界進行の主リクエストごと",defaultValue:()=>WORLD_PROMPT_REQUEST_SUMMARY}),
                def({key:'dueReviewGuidance',title:"期限到来事件の再確認指示",group:"リクエスト内の指示",source:'59-due-event-relaxation.part.js',scope:'user payload',condition:"今回、期限到来事件がある場合",defaultValue:()=>WORLD_PROMPT_DUE_REVIEW}),
                def({key:'chronologyInputGuidance',title:"時間資料の基準 · 要件",group:"リクエスト内の指示",source:"58-chronology-guard.part.js / 時間資料の基準",scope:'user payload',condition:"時間軸保護の実行時",defaultValue:()=>WORLD_PROMPT_CHRONOLOGY_INPUT}),
                def({key:'chronologyPrinciples',title:"時間資料の基準 · 計画原則",group:"リクエスト内の指示",source:"58-chronology-guard.part.js / 計画原則",scope:'user payload JSON',condition:"時間軸保護の実行時",defaultValue:()=>WORLD_PROMPT_CHRONOLOGY_PRINCIPLES}),
                def({key:'chronologyNoEvidenceGuidance',title:"時間資料の基準 · 資料未検出時の説明",group:"リクエスト内の指示",source:"58-chronology-guard.part.js / 原作の時間資料",scope:'user payload',condition:"明確なタイムライン・年表を読み込めなかった場合",defaultValue:()=>WORLD_PROMPT_CHRONOLOGY_NO_EVIDENCE}),
                def({key:'rumorSourceBoundary',title:"噂の取材範囲",group:"リクエスト内の指示",source:"59-rumor-world-request.part.js / 取材範囲",scope:'user payload',condition:"噂の管理リクエストごと",defaultValue:()=>WORLD_PROMPT_RUMOR_SOURCE_BOUNDARY}),
                def({key:'alienReviewGuidance',title:"活動中の異端の再確認要件",group:"リクエスト内の指示",source:'59-alien-activity-normalization.part.js',scope:'user payload',condition:"活動中の異端が再確認の条件を満たした場合",defaultValue:()=>WORLD_PROMPT_ALIEN_REVIEW}),
                def({key:'worldActivityInputGuidance',title:"世界活動の提出 · 必須要件",group:"リクエスト内の指示",source:"WorldActivityRequestFeature / 必須要件",scope:'user payload lines',condition:"世界進行の主リクエストごと",defaultValue:()=>WORLD_PROMPT_WORLD_ACTIVITY_INPUT}),
                def({key:'worldActivitySoftGuidance',title:"世界活動の提出 · 勢力の任意目標",group:"リクエスト内の指示",source:"WorldActivityRequestFeature / 任意目標",scope:'user payload lines',condition:"勢力の記録が空の場合に出す任意の提案",defaultValue:()=>WORLD_PROMPT_WORLD_ACTIVITY_SOFT_INPUT}),
                def({key:'worldTimeInputGuidance',title:"世界時刻の管理 · リクエスト内の指示",group:"リクエスト内の指示",source:"WorldTimeOwnershipFeature / 世界時刻の管理",scope:'user payload JSON',condition:"世界進行の主リクエストごと",defaultValue:()=>WORLD_PROMPT_WORLD_TIME_INPUT}),
                def({key:'historyInputGuidance',title:"履歴圧縮の入力説明",group:"補助モデル",source:'historyMemoryPrompt()',scope:'user payload',condition:"履歴記憶が自動圧縮の閾値に達した場合",defaultValue:()=>WORLD_PROMPT_HISTORY_INPUT}),
                def({key:'retryGuideMacroBackbone',title:"訂正処理 · 大局構成の件数",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"大局事件が不足する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideMacroBackbone}),
                def({key:'retryGuideEventDelivery',title:"訂正処理 · 大局事件の提出",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"大局事件が不足する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideEventDelivery}),
                def({key:'retryGuideMacroSchedule',title:"訂正処理 · 大局の日程",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"大局事件が不足する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideMacroSchedule}),
                def({key:'retryGuideCausalProjection',title:"訂正処理 · 大局構成の因果情報",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"大局事件が不足する場合、構成の補充一覧とともに送信",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideCausalProjection}),
                def({key:'retryGuideCausalProjectionRepair',title:"訂正処理 · 因果軌道の表示情報の修復",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"因果軌道の大局情報が無効な場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideCausalProjectionRepair}),
                def({key:'retryGuideDueEvent',title:"訂正処理 · 期限到来事件",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"期限到来事件が未処理の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideDueEvent}),
                def({key:'retryGuideEventTime',title:"訂正処理 · 事件の時刻",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"事件の時刻基準がない場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideEventTime}),
                def({key:'retryGuideStaleEvent',title:"訂正処理 · 長期継続中の活動事件",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"活動事件が長期間未確認の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideStaleEvent}),
                def({key:'retryGuideTemporalRepair',title:"訂正処理 · 未来時刻の修復",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"未来時刻の記録が未修正の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideTemporalRepair}),
                def({key:'retryGuideAlienActivity',title:"訂正処理 · 異端の活動",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"異端の活動が未確認の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideAlienActivity}),
                def({key:'retryGuideNpcAudit',title:"訂正処理 · NPC 構成監査",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"NPC 構成の補充が進まない場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideNpcAudit}),
                def({key:'retryGuideChronology',title:"訂正処理 · 原作の時間軸",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"明確な日付が原作・データベースと矛盾する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideChronology}),
                def({key:'retryGuidePredecessor',title:"訂正処理 · 事件の前因",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"事件の前因がないか、自身を参照する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuidePredecessor}),
                def({key:'retryGuideSchemaMismatch',title:"訂正処理 · Schema の差分",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"完全な Schema 検証に失敗した場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideSchemaMismatch}),
                def({key:'retryGuideRumorEmpty',title:"訂正処理 · 噂の補充",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"噂の分類が空の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideRumorEmpty}),
                def({key:'retryGuidePropagationReview',title:"訂正処理 · 伝播の再確認",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"伝播経路が未確認の場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuidePropagationReview}),
                def({key:'retryGuideTemporalIntegrity',title:"訂正処理 · 時間整合性",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"記録時刻が現在時刻を超える場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideTemporalIntegrity}),
                def({key:'retryGuideWorldActivity',title:"訂正処理 · 世界活動",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"世界活動が不足する場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideWorldActivity}),
                def({key:'retryGuideWorldScene',title:"訂正処理 · 世界の現場",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"世界活動が不足し、現場の情報もない場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideWorldScene}),
                def({key:'retryGuideCurrentReality',title:"訂正処理 · 現在の現実",group:'纠错重试',source:'WorldRetryGuidanceService',scope:"user payload / 補充一覧",condition:"世界活動が不足し、進行中の現実の情勢もない場合",defaultValue:()=>WORLD_RETRY_GUIDANCE_DEFAULTS.retryGuideCurrentReality}),
                def({key:'retryAcceptedWithPlan',title:"訂正再試行 · 承認済み結果 + 補充一覧",group:'纠错重试',source:'retryInput()',scope:'user payload',condition:"一部の結果が承認済みで、補充一覧がある再試行時",defaultValue:()=>WORLD_PROMPT_RETRY_ACCEPTED_PLAN}),
                def({key:'retryAccepted',title:"訂正再試行 · 承認済み結果",group:'纠错重试',source:'retryInput()',scope:'user payload',condition:"一部の結果が承認済みで、補充一覧がない再試行時",defaultValue:()=>WORLD_PROMPT_RETRY_ACCEPTED}),
                def({key:'retryFresh',title:"訂正再試行 · 初回の全体訂正",group:'纠错重试',source:'retryInput()',scope:'user payload',condition:"承認済み結果がない再試行時",defaultValue:()=>WORLD_PROMPT_RETRY_FRESH})
            ]);
        }
        definitions(){return this._definitions.slice();}
        defaults(){return Object.fromEntries(this._definitions.map(item=>[item.key,String(item.defaultValue?.()??'')]));}
        legacyValues(){
            const config=this.engine.config||{},modules=plain(config.modulePrompts)?config.modulePrompts:{},fallback=this.defaults(),registry=plain(config.promptRegistry)?config.promptRegistry:{};
            return {
                ...fallback,
                ...registry,
                preset:String(config.preset??registry.preset??fallback.preset),
                core:String(config.corePrompt??registry.core??fallback.core),
                macro:String(config.macroPrompt??registry.macro??fallback.macro),
                stability:String(config.stabilityPromptTemplate??registry.stability??fallback.stability),
                npcAudit:String(config.npcAuditPrompt??registry.npcAudit??fallback.npcAudit),
                outputProtocol:String(config.structurePrompt??registry.outputProtocol??fallback.outputProtocol),
                task:String(modules.task??registry.task??fallback.task),
                chronology:String(modules.chronology??registry.chronology??fallback.chronology),
                maintenance:String(modules.maintenance??registry.maintenance??fallback.maintenance),
                exploration:String(modules.exploration??registry.exploration??fallback.exploration),
                integrity:String(modules.integrity??registry.integrity??fallback.integrity),
                worldTime:String(modules.worldTime??registry.worldTime??fallback.worldTime),
                rumor:String(modules.rumor??registry.rumor??fallback.rumor)
            };
        }
        normalize(value){
            const fallback=this.legacyValues(),source=plain(value)?value:{},out={};
            for(const item of this._definitions){
                const raw=Object.hasOwn(source,item.key)?source[item.key]:fallback[item.key];
                out[item.key]=typeof raw==='string'?raw:String(raw??'');
            }
            return out;
        }
        initialize(){
            const config=this.engine.config||(this.engine.config={}),previousVersion=Number(config.worldModulePromptVersion||0);
            if(typeof WORLD_MODULE_PROMPT_VERSION==='number'&&previousVersion<WORLD_MODULE_PROMPT_VERSION&&(!config.activePromptDocumentId||config.activePromptDocumentId===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id)){
                const defaults=this.defaults(),registry=plain(config.promptRegistry)?{...config.promptRegistry}:{};
                for(const key of ['chronology','chronologyInputGuidance','chronologyNoEvidenceGuidance','chronologyPrinciples','worldActivity','worldActivityInputGuidance','worldActivitySoftGuidance','retryGuideWorldScene'])registry[key]=defaults[key];
                config.promptRegistry=registry;
                config.modulePrompts=Object.assign({},plain(config.modulePrompts)?config.modulePrompts:{},{chronology:defaults.chronology});
            }
            const normalized=this.normalize(config.promptRegistry);
            config.promptRegistry=normalized;
            this.syncLegacy(normalized);
            if(typeof WORLD_MODULE_PROMPT_VERSION==='number')config.worldModulePromptVersion=WORLD_MODULE_PROMPT_VERSION;
            return normalized;
        }
        syncLegacy(values){
            const config=this.engine.config||(this.engine.config={}),source=values===undefined?this.absorbLegacyOverrides():values,v=this.normalize(source);
            config.preset=normalizeEditablePreset(v.preset);
            config.corePrompt=v.core;config.macroPrompt=v.macro;config.stabilityPromptTemplate=v.stability;config.npcAuditPrompt=v.npcAudit;config.structurePrompt=v.outputProtocol;
            config.modulePrompts=Object.assign({},plain(config.modulePrompts)?config.modulePrompts:{},{
                task:v.task,chronology:v.chronology,maintenance:v.maintenance,exploration:v.exploration,integrity:v.integrity,worldTime:v.worldTime,rumor:v.rumor
            });
            config.promptRegistry=v;return v;
        }
        values(){return this.normalize(this.engine.config?.promptRegistry);}
        absorbLegacyOverrides(){
            const config=this.engine.config||{},current=this.values(),next={...current};
            for(const [key,legacyKey] of [['preset','preset'],['core','corePrompt'],['macro','macroPrompt'],['stability','stabilityPromptTemplate'],['npcAudit','npcAuditPrompt'],['outputProtocol','structurePrompt']]){
                if(typeof config[legacyKey]==='string'&&config[legacyKey]!==current[key])next[key]=config[legacyKey];
            }
            const modules=plain(config.modulePrompts)?config.modulePrompts:{};
            for(const key of ['task','chronology','maintenance','exploration','integrity','worldTime','rumor']){
                if(typeof modules[key]==='string'&&modules[key]!==current[key])next[key]=modules[key];
            }
            config.promptRegistry=this.normalize(next);return config.promptRegistry;
        }
        value(key){return this.values()[key]??'';}
        list(){const values=this.values();return this._definitions.map(item=>({...item,value:values[item.key]??''}));}
        apply(value,{save=true}={}){
            const normalized=this.normalize(value);
            for(const item of this._definitions)if(normalized[item.key].length>30000)throw new Error(item.title+"は30000文字以内にしてください");
            for(const key of ['inputSemantics','chronologyPrinciples','worldTimeInputGuidance']){
                let parsed=null;try{parsed=JSON.parse(normalized[key]);}catch(_){throw new Error(this._definitions.find(x=>x.key===key)?.title+"有効な JSON オブジェクトが必要です");}
                if(!plain(parsed))throw new Error(this._definitions.find(x=>x.key===key)?.title+"JSON オブジェクトが必要です");
            }
            this.syncLegacy(normalized);
            if(save)this.engine.saveConfig?.();
            return normalized;
        }
        prepareSettings(settings){
            const input=plain(settings)?copy(settings):{},registry=this.normalize(input.promptRegistry??this.engine.config?.promptRegistry);
            if(typeof input.preset==='string')registry.preset=input.preset;
            if(typeof input.corePrompt==='string')registry.core=input.corePrompt;
            if(typeof input.macroPrompt==='string')registry.macro=input.macroPrompt;
            if(typeof input.stabilityPromptTemplate==='string')registry.stability=input.stabilityPromptTemplate;
            if(typeof input.npcAuditPrompt==='string')registry.npcAudit=input.npcAuditPrompt;
            if(typeof input.structurePrompt==='string')registry.outputProtocol=input.structurePrompt;
            if(plain(input.modulePrompts))for(const key of ['task','chronology','maintenance','exploration','integrity','worldTime','rumor'])if(typeof input.modulePrompts[key]==='string')registry[key]=input.modulePrompts[key];
            input.promptRegistry=registry;
            input.preset=registry.preset;input.corePrompt=registry.core;input.macroPrompt=registry.macro;input.stabilityPromptTemplate=registry.stability;input.npcAuditPrompt=registry.npcAudit;input.structurePrompt=registry.outputProtocol;
            input.modulePrompts=Object.assign({},plain(input.modulePrompts)?input.modulePrompts:{},{
                task:registry.task,chronology:registry.chronology,maintenance:registry.maintenance,exploration:registry.exploration,integrity:registry.integrity,worldTime:registry.worldTime,rumor:registry.rumor
            });
            return input;
        }
        rewriteSystem(system){
            let output=String(system||'');
            const mounted=new Set();
            const rewriteOne=(legacy,key)=>{
                const configured=String(this.value(key)||'').trim();
                const block=typeof legacy==='string'?legacy:'';
                if(block&&output.includes(block)){
                    output=output.split(block).join(configured);
                    if(configured)mounted.add(key);
                }
            };

            rewriteOne(typeof TASK_AWARENESS_RULES==='string'?TASK_AWARENESS_RULES:'','task');
            rewriteOne(typeof CHRONOLOGY_GUARD_RULES==='string'?CHRONOLOGY_GUARD_RULES:'','chronology');
            rewriteOne(typeof SOFT_MAINTENANCE_RULES==='string'?SOFT_MAINTENANCE_RULES:'','maintenance');
            rewriteOne(typeof EXPLORATION_PROJECTION_RULES==='string'?EXPLORATION_PROJECTION_RULES:'','exploration');
            rewriteOne(typeof WORLD_INTEGRITY_GUARD_RULES==='string'?WORLD_INTEGRITY_GUARD_RULES:'','integrity');
            rewriteOne(typeof WORLD_TIME_RULES==='string'?WORLD_TIME_RULES:'','worldTime');
            rewriteOne(typeof WORLD_ACTIVITY_DELIVERY_RULES==='string'?WORLD_ACTIVITY_DELIVERY_RULES:'','worldActivity');

            // 历史传闻管线可能同时注入三段旧文本。最终只允许 registry.rumor 出现一次。
            const rumorConfigured=String(this.value('rumor')||'').trim();
            const rumorBlocks=[
                typeof RUMOR_LIVELINESS_RULES==='string'?RUMOR_LIVELINESS_RULES:'',
                typeof RUMOR_THROTTLE_RULES==='string'?RUMOR_THROTTLE_RULES:'',
                typeof RUMOR_WORLD_SOURCE_RULES==='string'?RUMOR_WORLD_SOURCE_RULES:''
            ].filter(Boolean);
            let rumorReplaced=false;
            for(const block of rumorBlocks){
                if(!output.includes(block))continue;
                output=output.split(block).join(!rumorReplaced?rumorConfigured:'');
                rumorReplaced=true;
            }
            if(rumorReplaced&&rumorConfigured)mounted.add('rumor');

            // Registry 是最终 system 装配器：前序 feature 即使没有再注入旧常量，
            // 当前非空配置也必须在真实请求中恰好出现一次。
            for(const key of ['task','chronology','maintenance','exploration','integrity','worldTime','rumor','worldActivity']){
                const configured=String(this.value(key)||'').trim();
                if(!configured||mounted.has(key))continue;
                // 用户可能把配置改成与其它块相同；按完整块文本去重，避免重复 system。
                if(output.includes(configured)){mounted.add(key);continue;}
                output+=(output?'\n\n':'')+configured;
                mounted.add(key);
            }
            return output.replace(/\n{3,}/g,'\n\n').trim();
        }
        rewriteInput(input){
            let payload;try{payload=JSON.parse(String(input||''));}catch(_){return input;}
            try{payload.输入语义=JSON.parse(this.value('inputSemantics'));}catch(_){}
            if(plain(payload.本轮必须完成的宏观骨架)){
                payload.本轮必须完成的宏观骨架.规划与发生=this.value('macroPlanningGuidance');
                payload.本轮必须完成的宏观骨架.验收=this.value('macroAcceptanceGuidance');
            }
            if(plain(payload.正文可见投影规则))payload.正文可见投影规则.要求=this.value('projectionGuidance');
            if(Object.hasOwn(payload,"説明"))payload.説明=this.value('requestSummaryGuidance');
            if(Array.isArray(payload.本轮必须复核的到期事件))for(const item of payload.本轮必须复核的到期事件)if(plain(item))item.説明=this.value('dueReviewGuidance');
            if(plain(payload.时间线基准)){
                payload.时间线基准.要求=this.value('chronologyInputGuidance');
                try{payload.时间线基准.规划原则=JSON.parse(this.value('chronologyPrinciples'));}catch(_){}
                if(payload.时间线基准.原著时间资料==='__PROMPT_REGISTRY_NO_EVIDENCE__')payload.时间线基准.原著时间资料=this.value('chronologyNoEvidenceGuidance');
            }
            if(plain(payload.传闻维护)&&Object.hasOwn(payload.传闻维护,'取材边界'))payload.传闻维护.取材边界=this.value('rumorSourceBoundary');
            if(Array.isArray(payload.本轮必须维持的异端活动))for(const item of payload.本轮必须维持的异端活动)if(plain(item))item.要求=this.value('alienReviewGuidance');
            if(plain(payload.本轮世界活动交付)){
                payload.本轮世界活动交付.硬要求=this.value('worldActivityInputGuidance').split(/\n+/).map(x=>x.trim()).filter(Boolean);
                payload.本轮世界活动交付.软目标=this.value('worldActivitySoftGuidance').split(/\n+/).map(x=>x.trim()).filter(Boolean);
            }
            if(plain(payload.世界时间维护)){
                try{
                    const configured=JSON.parse(this.value('worldTimeInputGuidance'));
                    if(plain(configured)){
                        if(Object.hasOwn(configured,'所有权'))payload.世界时间维护.所有权=configured.所有权;
                        if(plain(configured.初始化锚定)&&plain(payload.世界时间维护.初始化锚定)){
                            if(Array.isArray(configured.初始化锚定.依据顺序))payload.世界时间维护.初始化锚定.依据顺序=configured.初始化锚定.依据顺序;
                            if(Object.hasOwn(configured.初始化锚定,'禁止'))payload.世界时间维护.初始化锚定.禁止=configured.初始化锚定.禁止;
                        }
                        for(const key of ['正文时间职责','精确日期格式','时间段候选','推进原则'])if(Object.hasOwn(configured,key))payload.世界时间维护[key]=copy(configured[key]);
                    }
                }catch(_){}
            }
            return JSON.stringify(payload,null,2);
        }
        historySystem(){return this.value('historyMemory');}
        historyInput(input){
            let payload;try{payload=JSON.parse(String(input||''));}catch(_){return input;}
            if(plain(payload))payload.説明=this.value('historyInputGuidance');
            return JSON.stringify(payload,null,2);
        }
        retryRequirement(acceptedResult,retryPlan=[]){
            if(acceptedResult)return Array.isArray(retryPlan)&&retryPlan.length?this.value('retryAcceptedWithPlan'):this.value('retryAccepted');
            return this.value('retryFresh');
        }
    }
    class WorldPromptIntegrationService {
        constructor(engine,registry,telemetry){
            this.engine=engine;
            this.registry=registry;
            this.telemetry=telemetry||DEFAULT_WORLD_TOKEN_TELEMETRY;
            this.workspace=null;
        }
        attachWorkspace(workspace){this.workspace=workspace||null;return this.workspace;}
        initializeDefaults(){
            if(plain(BUILTIN_DEFAULT_PROMPT_DOCUMENT?.settings)&&this.registry){
                BUILTIN_DEFAULT_PROMPT_DOCUMENT.settings.promptRegistry=this.registry.defaults();
            }
            this.engine.saveConfig();
        }
        readEditor(settings){
            if(!this.registry)return settings;
            let values=this.registry.values();
            values.preset=String(settings.preset??values.preset);
            values.core=String(settings.corePrompt??values.core);
            values.macro=String(settings.macroPrompt??values.macro);
            values.stability=String(settings.stabilityPromptTemplate??values.stability);
            values.npcAudit=String(settings.npcAuditPrompt??values.npcAudit);
            values.outputProtocol=String(settings.structurePrompt??values.outputProtocol);
            if(plain(settings.modulePrompts)){
                for(const key of ['task','chronology','maintenance','exploration','integrity','worldTime','rumor']){
                    if(typeof settings.modulePrompts[key]==='string')values[key]=settings.modulePrompts[key];
                }
            }
            values=this.workspace?.read(values)||values;
            settings.promptRegistry=values;
            settings.modulePrompts=Object.assign({},plain(settings.modulePrompts)?settings.modulePrompts:{},{
                task:values.task,chronology:values.chronology,maintenance:values.maintenance,
                exploration:values.exploration,integrity:values.integrity,worldTime:values.worldTime,rumor:values.rumor
            });
            return settings;
        }
        prepareApply(settings){return this.registry?this.registry.prepareSettings(settings):settings;}
        afterApply(prepared,result){
            if(!this.registry)return result;
            this.registry.apply(prepared.promptRegistry,{save:false});
            this.engine.services?.npcAuditPolicy?.afterPromptSettings?.();
            this.engine.saveConfig();
            return result;
        }
        prepareDocument(settings){
            if(!this.registry)return settings;
            const prepared=this.registry.prepareSettings(settings);
            prepared.promptRegistry=this.registry.normalize(prepared.promptRegistry);
            return prepared;
        }
        importDocument(doc,raw){
            if(!doc?.settings||!this.registry)return doc;
            let parsed=null;try{parsed=JSON.parse(String(raw||''));}catch(_){}
            const source=plain(parsed?.settings)?parsed.settings:parsed;
            doc.settings=this.registry.prepareSettings(Object.assign({},doc.settings,plain(source)?source:{}));
            this.engine.saveConfig();
            return doc;
        }
        beforeBuildRequest(){this.registry?.syncLegacy();}
        decorateRequest(request){
            if(!this.registry)return request;
            request.system=this.registry.rewriteSystem(request.system);
            request.input=this.registry.rewriteInput(request.input);
            request.manifest=request.manifest||{};
            request.manifest.提示词注册表=this.registry.list().map(item=>({
                key:item.key,标题:item.title,分组:item.group,出典:item.source,作用范围:item.scope,发送条件:item.condition,
                估算Tokens:this.telemetry.estimate(item.value),启用:String(item.value||'').trim()!==''
            }));
            request.manifest.提示词模块=this.registry.list()
                .filter(item=>item.group==="実行モジュール"&&item.scope==='system'&&String(item.value||'').trim())
                .map(item=>({key:item.key,title:item.title,source:item.source,估算Tokens:this.telemetry.estimate(item.value)}));
            request.manifest.观测=this.telemetry.request(request.system,request.input,request.schema||WORLD_RESULT_SCHEMA);
            return request;
        }
        bindPanel(panel){
            if(!panel||panel.__classPromptRegistryBound)return;
            Object.defineProperty(panel,'__classPromptRegistryBound',{value:true,configurable:true});
            panel.addEventListener('click',event=>{
                const button=event.target?.closest?.('[data-action="prompt-edit"]');
                if(!button||!panel.contains(button))return;
                queueMicrotask(()=>this.workspace?.syncEditableState());
            });
        }
        afterRender(){
            this.workspace?.mount();
            this.workspace?.syncEditableState();
        }
    }
    class WorldOverviewView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {
                        engine,s,w,orbit,events,active,future,people,calendarCandidates,snapshot,
                        entries,text,empty,section,stabilityDescription,parseDate,calendar,tools,
                        timelineCards,exists,fields,prose,compactPerson
                    }=ctx;
                    let html='';
                    const offsets=entries(orbit.偏移記録);
                    const stable=w.安定!==null&&w.安定!==''&&Number.isFinite(Number(w.安定))?Number(w.安定):null;
                    const signed=n=>(n>0?'+':'')+n;
                    const offsetCard=([name,r])=>{
                        const impact=r?.影響度!==null&&r?.影響度!==''&&Number.isFinite(Number(r?.影響度))?Number(r.影響度):null;
                        return '<article class="we-offset"><div class="we-offset-head"><b>'+text(name)+'</b><span>'+text(impact===null?"影響未記録":signed(impact))+'</span></div><p>'+text(r?.説明||"変動の説明なし")+"</p><small>原因となった人物 · "+text(r?.誘発者||"未記録")+' · '+(impact===null?"未確認":impact<0?"因果の破壊":impact>0?"因果の修復 / 強化":"数値変化なし")+'</small></article>';
                    };
                    const causalHtml="<div class=\"we-causal\"><div class=\"we-stability\"><div><small>世界安定値</small><strong data-world-stability>"+text(stable===null?"未記録":stable)+'</strong></div><span>'+((s.設定||{}).世界超安定?"世界超安定 · 新規偏移を禁止":"基準 100 · 不安定化は世界の拒絶反応を強化")+'</span></div>'
                        +(stable===null?'':'<meter min="0" max="120" value="'+Math.max(0,Math.min(120,stable))+"\" aria-label=\"世界安定値\">"+stable+'</meter>')
                        +stabilityDescription(stable)
                        +"<div class=\"we-offset-heading\">偏移記録 <span>"+offsets.length+" 件</span></div>"
                        +(offsets.length?offsets.slice(0,3).map(offsetCard).join('')+(offsets.length>3?"<details class=\"we-offset-more\"><summary>残り "+(offsets.length-3)+" 件の変動</summary>"+offsets.slice(3).map(offsetCard).join('')+'</details>':''):empty("因果偏移なし","重要人物の命運・重大イベント・勢力構図が実質的に変化した後に記録されます。"))+'</div>';
                    const shown=calendarCandidates.filter(([,e])=>engine.calendarMode==='undated'?!parseDate(e.時間||e.开始时间):!engine.selectedDate||parseDate(e.時間||e.开始时间)?.key===engine.selectedDate);
                    const macroCount=events.filter(([,e])=>e.分类==="大局的な節目").length;
                    const timelineView=snapshot?timelineState(s):null;
                    const nextMacroName=timelineView?.下一宏观节点?.名称||'';
                    const nextPair=nextMacroName?events.find(([n,e])=>n===nextMacroName&&e.分类==="大局的な節目")||null:null;
                    const nextNode=nextPair?.[0]||"マクロノードを待機中";
                    const nextEvent=nextPair?.[1]||null;
                    const compactPeople=Array.from(people).filter(([,p])=>p.行动||p.公开动态||p.地点).slice(0,4);
                    html+='<div class="we-world-focus">'
                        +'<div class="we-world-focus-main">'+section("世界の動向",orbit.現在段階&&orbit.現在段階!=="初期化待ち"?'<div class="we-pulse"><span class="we-pulse-mark">LIVE</span><p>'+text(orbit.現在段階)+'</p></div>':empty("段階は未確認","世界進行は現在の世界情勢をそのまま因果軌道.現在段階へ書き込みます。"),"因果軌道 · 現在の段階")+'</div>'
                        +'<div class="we-world-focus-next">'+section('下一宏观节点',(nextEvent?'<button class="we-next-node" data-jump-event="'+text(nextNode)+"\" title=\"タイムライン内の対応するマクロイベントへ移動\">":'<div class="we-next-node">')+'<span>→</span><div><h3>'+text(nextNode)+'</h3><p>'+text(nextEvent?.公开征兆||nextEvent?.説明||"今回はまず実在するマクロノードの確立が必要です")+'</p><small>'+text(nextEvent?.時間||nextEvent?.开始时间||"時間未確認")+(nextEvent?" · クリックで移動 →":'')+'</small></div>'+(nextEvent?'</button>':'</div>'),"因果の境界")+'</div>'
                        +'</div>';
                    html+='<div class="we-kpi-grid we-kpi-compact">'
                        +"<div class=\"we-kpi\"><small>発生中</small><strong>"+active.length+"</strong><span>現在の活動イベント</span></div>"
                        +"<div class=\"we-kpi\"><small>直近の橋渡し</small><strong>"+events.filter(([,e])=>e.分类==="直近の節目"&&e.状態==="発生待ち").length+"</strong><span>次のマクロ境界まで</span></div>"
                        +"<div class=\"we-kpi\"><small>マクロアンカー</small><strong>"+macroCount+'</strong><span>'+text(orbit.現在段階||"段階は未確認")+'</span></div>'
                        +"<div class=\"we-kpi\"><small>場外の人物</small><strong>"+people.size+'</strong><span>'+future.length+" 件の将来イベント</span></div>"
                        +'</div>';
                    html+='<div class="we-dashboard"><div class="we-command-main">'
                        +"<section class=\"we-section we-timeline-board\" data-detail=\"world-calendar\"><div class=\"we-section-head\"><h2>イベントタイムライン</h2><small>"+events.length+" イベント · "+future.length+" 将来 · "+macroCount+" マクロ</small></div><div class=\"we-calendar-layout\"><div class=\"we-calendar-slot\">"+calendar()+'</div><div class="we-timeline-slot">'+tools(["すべて","進行中","発生待ち","完了","取消済み"])+'<div class="we-tools"><span>'+text(engine.calendarMode==='undated'?"日付未定 / 作品内時間":engine.selectedDate||"全期間")+"</span><button data-action=\"today\">今日へ戻る</button><button data-action=\"clear-date\">全期間</button><button data-action=\"undated\">日付未定のイベント</button></div>"+'<div class="we-timeline">'+(timelineCards(shown.slice(0,engine.eventLimit||12))||empty("条件に一致するイベントはありません"))+'</div>'+(shown.length>(engine.eventLimit||12)?"<button class=\"we-btn\" data-action=\"more-events\">さらに表示（全 "+shown.length+" 件）</button>":'')+'</div></div></section>'
                        +'</div><aside class="we-command-side">'
                        +section("因果状態",causalHtml,"安定と軌道偏移")
                        +section("通貨と経済",exists(w.通貨)?fields({货币体系:w.通貨?.体系,購買力基準:w.通貨?.購買力基準,経済変動:w.通貨?.経済変動}):empty("通貨資料なし","世界進行は設定や経済情勢が明確になった時点で保守します。"),"世界進行が保守")
                        +(exists(w.法則)?section("世界法則",prose(w.法則),"現在有効なルール · "+(Array.isArray(w.法則)?w.法則.length:1)+" 件"):'')
                        +section("人物の動向",(compactPeople.length?'<div class="we-people-strip">'+compactPeople.map(([n,p])=>compactPerson(n,p)).join('')+"</div><button class=\"we-link-btn\" data-tab=\"角色管理\">人物名簿を表示 →</button>":empty("人物の動向なし")),"主要 NPC")
                        +'</aside></div>';
                    return html;
                
        }
    }
    class WorldPeopleView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {
                        engine,s,radar,showRadar,alienAlive,entries,formalPeople,backstagePeople,
                        relationRoster,matched,userName,section,text,pill,fields,contextRows,
                        sceneContextBody,empty,tools,person,exists,value
                    }=ctx;
                    let html='';
                    if(showRadar&&alienAlive>0)html+="<div class=\"we-meta we-alien-count\">異端の生存数 <b>"+alienAlive+'</b></div>';
            
                    const alienByKey=new Map(entries(radar.名簿).map(([name,record])=>[nameKey(name),{名称:name,记录:record}]));
                    const rolePeople=[
                        ...Array.from(formalPeople).map(([n,p])=>[n,p,{正式:true,异端:alienByKey.has(nameKey(n))}]),
                        ...backstagePeople.map(([n,p])=>[n,p,{正式:false,异端:alienByKey.has(nameKey(n))}])
                    ];
                    const list=rolePeople.filter(([n,p,meta])=>{
                        const searchable=meta.正式?Object.assign({},p,relationRoster[n]||{}):p;
                        if(!matched(n,searchable))return false;
                        if((engine.filter||"すべて")==="すべて")return true;
                        const present=meta.正式&&!!relationRoster[n]?.登場;
                        return engine.filter==="登場"?present:!present;
                    });
                    const chosen=list.find(([n])=>n===engine.selectedPerson)||list[0];
                    const chosenMeta=chosen?.[2]||{};
                    const chosenContext=chosen?derivePersonWorldContext(s,chosen[0],userName):null;
                    const chosenRelation=chosenMeta.正式&&plain(relationRoster[chosen?.[0]])?relationRoster[chosen[0]]:null;
                    const chosenAudit=engine.isNpcBuildAuditEnabled()&&chosenRelation?npcBuildAssessment(s,chosen[0],chosenRelation):null;
                    const chosenAlien=chosen?alienByKey.get(nameKey(chosen[0]))?.记录:null;
                    const auditPanel=chosenAudit?section('NPC构筑审计',
                        '<div class="we-card"><div class="we-card-top"><h3>'+text(chosenAudit.監査級)+'</h3>'+pill(chosenAudit.缺口.length?"待補強":"構築完了",chosenAudit.缺口.length?'future':'dim')+'</div>'
                        +fields({階層:chosenAudit.階層,当前组件:chosenAudit.当前组件})
                        +(chosenAudit.缺口.length?'<div class="we-chips">'+chosenAudit.缺口.map(x=>pill(x,'future')).join('')+"</div><p class=\"we-muted\">世界進行リクエストのホット人物はバックグラウンドで缺口を優先補完します；難易度スクリプトは既存コンポーネントの品質調整のみを担当します。</p>":"<p class=\"we-muted\">現在の構築はこの階層の監査最低要件を満たしています。</p>")+'</div>',
                        "正式な関係人物のみ · NPC生成ルールを再利用"
                    ):'';
                    const backgroundPanel=chosen?section('背景关联',contextRows(chosenContext),(chosenContext?.背景关联?.length||0)+" 関係 · "+(chosenContext?.关联事件?.length||0)+" イベント"):'';
                    const surroundingsPanel=chosen?section("周辺の展開",sceneContextBody(chosenContext),"シナリオ推演の現場タグ · 読み取り専用の派生"):'';
                    const alienPanel=chosenAlien?section("異端記録",fields({出典:chosenAlien.出典,経歴:chosenAlien.経歴,陣営:chosenAlien.陣営,職業:chosenAlien.職業,階層:chosenAlien.階層,状態:chosenAlien.状態}),"異端レーダー · 読み取り専用"):'';
                    const formalCount=rolePeople.filter(([, ,meta])=>meta.正式).length;
                    const worldCount=rolePeople.length-formalCount;
                    const roster=list.length?'<div class="we-roster-list">'+list.map(([n,p,meta])=>{
                        const rel=meta.正式?relationRoster[n]||{}:{};
                        const present=meta.正式&&!!rel.登場;
                        const status=present?"登場":p.状態||"場外";
                        const source=meta.正式?"正式記録":meta.异端?"異端 · 世界の人物":"世界の人物";
                        const summary=p.行动||p.公开动态||rel.態度||"次の世界推演を待機中";
                        return '<button class="we-roster-person '+(chosen?.[0]===n?'active':'')+'" data-person="'+text(n)+'"><span class="we-roster-copy"><b>'+text(n)+'</b><small>⌖ '+text(p.地点||"地点不明")+' · '+text(status)+'</small><em>'+text(summary)+'</em></span>'+pill(source,meta.异端?'future':'dim')+'</button>';
                    }).join('')+'</div>':empty("条件に一致する人物がいません","フィルターを調整するか、世界の人物が活動範囲に入るのを待ってください。");
                    html+=tools(["すべて","登場","場外"])+'<div class="we-columns"><div>'
                        +section("人物名簿",roster,'正式 '+formalCount+" · 世界の人物 "+worldCount)
                        +(chosen?section("身分と現在の行動",person(chosen[0],chosen[1],true),chosenMeta.正式?"正式な関係人物":"世界のバックステージ人物")+surroundingsPanel+section("日程と行動",fields({行程:chosen[1].行程,开始时间:chosen[1].开始时间,预计结束:chosen[1].预计结束,下次检查:chosen[1].下次检查}))+auditPanel:empty("人物が選択されていません"))
                        +'</div><aside>'+backgroundPanel+alienPanel+(chosen?[["情報",chosen[1].认知来源||chosen[1].认知],["直近の動向",chosen[1].公开动态]].filter(([,v])=>exists(v)).map(([label,v])=>section(label,value(v))).join(''):'')+'</aside></div>';
                    return html;
                
        }
    }
    class WorldExplorationView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {
                        engine,state,w,events,entries,text,fields,areaSceneBody,exists,details,
                        empty,section,eventCard
                    }=ctx;
                    let html='';
                    const regionRecords=state.势力地区||{};
                    const exploration=entries(w.探索).map(([name,ledger])=>[name,{...(regionRecords[name]||{}),...ledger,タイプ:'探索'}]);
                    const factionList=entries(w.勢力).map(([name,ledger])=>[name,{...(regionRecords[name]||{}),...ledger,タイプ:"勢力"}]);
                    const projectedNames=new Set([...exploration.map(([n])=>n),...factionList.map(([n])=>n)]);
                    const backstageAreas=entries(regionRecords).filter(([name,r])=>r.タイプ!=="勢力"&&!projectedNames.has(name));
                    const dir=engine.directoryTab||'探索';
                    const progressStage=value=>{
                        const n=Math.max(0,Math.min(100,Number(value)||0));
                        if(n>=100)return "中核";
                        if(n>=90)return "掌握";
                        if(n>=60)return "深部";
                        if(n>=30)return "熟知";
                        if(n>=10)return "初歩";
                        return "未踏";
                    };
                    const repStage=value=>{
                        const n=Number(value)||0;
                        if(n<=-5000)return "敵対";
                        if(n<=-1000)return "憎悪";
                        if(n<500)return '冷淡';
                        if(n<2000)return '中立';
                        if(n<5000)return '友好';
                        if(n<10000)return '崇敬';
                        return "崇拝";
                    };
                    const chosenArea=exploration.find(([n])=>n===engine.selectedArea)||exploration[0];
                    const chosenFaction=factionList.find(([n])=>n===engine.selectedFaction)||factionList[0];
            
                    html+="<div class=\"we-notice\">ここに表示されるのは決算台帳であり、地図データベースではありません： <b>世界.探索</b> 内の全体的なランドマークだけが探索報酬の対象です；バックステージにまだ投影されていない地区は探索名簿に現れません。勢力の声望も、勢力からプレイヤーへの実際の関係決算のみを記録します。</div>";
                    html+='<div class="we-tools">'+['探索',"注目","勢力"].map(t=>'<button data-directory="'+t+'" class="'+(dir===t?'active':'')+'">'+t+'</button>').join('')+'</div>';
            
                    if(dir==='探索'){
                        const cards=exploration.map(([n,r])=>{
                            const progress=Math.max(0,Math.min(100,Number(r.探索度)||0));
                            const control=r.控制方||"支配権不明";
                            const environment=Array.isArray(r.环境状态)?(r.环境状态.length?r.环境状态.length+"項":"未記録"):r.环境状态||"未記録";
                            return '<button class="we-explore-card '+(chosenArea?.[0]===n?'active':'')+'" data-area="'+text(n)+'">'
                                +"<div class=\"we-explore-head\"><div><small>探索ランドマーク</small><h3>"+text(n)+"</h3></div><span class=\"we-risk-badge\">リスク "+text(r.リスク||'F')+'</span></div>'
                                +'<div class="we-explore-score"><strong>'+progress+'<small>%</small></strong><span>'+text(progressStage(progress))+'</span></div>'
                                +'<div class="we-explore-bar"><i style="width:'+progress+'%"></i></div>'
                                +"<div class=\"we-explore-meta\"><span>制圧 · "+text(control)+"</span><span>環境 · "+text(environment)+'</span></div>'
                                +'<p>'+text(r.説明||r.公开动态||"区域の説明なし")+'</p>'
                                +'</button>';
                        }).join('');
                        const areaDetail=chosenArea?(()=>{
                            const [n,r]=chosenArea;
                            const backstage=regionRecords[n]||{};
                            return '<div class="we-area-detail"><div class="we-area-facts">'+fields({リスク:r.リスク,控制方:r.控制方||"不明",争夺方:r.争夺方,环境状态:r.环境状态})+'<div class="we-area-note">'+text(r.説明||"確定済みのプレイヤー探索の説明はありません。")+'</div></div>'
                                +areaSceneBody(backstage)
                                +'<div class="we-area-archive">'+(exists(backstage.进展)||exists(backstage.公开动态)||exists(backstage.资源)||exists(backstage.近期变化)?details('area-world-'+n,{世界进展:backstage.进展,公开动态:backstage.公开动态,资源:backstage.资源,近期变化:backstage.近期变化},"世界地区記録"):'')
                                +(exists(r.隠された真実)?details('area-truth-'+n,{隠された真実:r.隠された真実},"進行役の記録"):'')+'</div></div>';
                        })():empty("探索ランドマークなし","世界.探索にすでに投影された全体区域のみがここに表示されます。");
                        html+=section("探索決算名簿",'<div class="we-explore-grid we-explore-index">'+(cards||empty("探索ランドマークなし","プレイヤーが実際に全体区域を発見するのを待機します。"))+'</div>');
                        html+=section("区域記録",areaDetail,"地区の現場とバックステージ記録 · 上のランドマークをクリックして切り替え");
                        if(backstageAreas.length){
                            html+=section("バックステージ未投影地区",'<details><summary>'+backstageAreas.length+" 件の世界地区がまだプレイヤーの探索報酬に算入されていません</summary>"+backstageAreas.map(([n,r])=>'<div class="we-brief-row"><b>'+text(n)+'</b><span>'+text(r.进展||r.公开动态||r.説明||"バックステージ稼働中")+'</span></div>').join('')+'</details>',"ゲームマスター参考のみ · 探索報酬には不算入");
                        }
                    }else if(dir==="注目"){
                        const hotspots=events.filter(([,e])=>e.状態==="進行中");
                        html+=section("現在のホットスポット",hotspots.map(([n,e])=>eventCard(n,e)).join('')||empty("進行中のホットスポットなし","世界に現在進行中のイベントはありません。"));
                    }else{
                        const factionCards=factionList.map(([n,r])=>{
                            const rep=Number(r.声望)||0,stage=repStage(rep),width=Math.min(100,Math.max(0,rep)/100);
                            return '<button class="we-faction-card '+(chosenFaction?.[0]===n?'active':'')+'" data-faction="'+text(n)+'"><div class="we-card-top"><h3>'+text(n)+"</h3><span class=\"we-risk-badge\">実力 "+text(r.実力||'F')+'</span></div>'
                                +"<div class=\"we-rep\"><span>名声 "+rep+'</span><b>'+text(stage)+'</b></div><div class="we-explore-bar"><i style="width:'+width+'%"></i></div>'
                                +'<p>'+text(r.説明||r.目標||"勢力の説明なし")+'</p><small>'+text(r.領地||"領地未記録")+'</small></button>';
                        }).join('');
                        const factionDetail=chosenFaction?'<h3>'+text(chosenFaction[0])+'</h3>'+fields({実力:chosenFaction[1].実力,声望:chosenFaction[1].声望,关系阶段:repStage(chosenFaction[1].声望),領地:chosenFaction[1].領地,目標:chosenFaction[1].目標,説明:chosenFaction[1].説明,当前进展:chosenFaction[1].进展}):empty("勢力記録なし");
                        html+=section("勢力決算名簿",'<div class="we-explore-layout"><div class="we-faction-grid">'+(factionCards||empty("既知の勢力なし"))+'</div><aside class="we-area-side">'+section("勢力記録",factionDetail,"左の勢力をクリックして切り替え")+'</aside></div>',"声望は勢力からプレイヤーへの実際の関係のみを反映");
                    }
                    return html;
                
        }
    }
    class WorldAssetView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const {s,w,people,userName,relationNamesByKey,entries,matched,tools,section,text,pill,fields,details,empty}=context;
            const ownersOf=asset=>Array.from(new Set((Object.hasOwn(asset,"所属対象")?(Array.isArray(asset.所属対象)?asset.所属対象:[asset.所属対象]):['<user>']).map(x=>String(x??'').trim()).filter(x=>x&&x!=="所有者なし")));
            const assets=entries(s.资产).filter(([,asset])=>plain(asset));
            const list=assets.filter(([name,asset])=>{
                const owners=ownersOf(asset),category=this.engine.filter||"すべて";
                return (category==="すべて"||category==="プレイヤー関連"&&owners.includes('<user>')||category==="共同所有"&&owners.length>1||category==="所有者なし"&&!owners.length)&&matched(name,{...asset,归属:owners.join(' ')});
            });
            let html=tools(["すべて","プレイヤー関連","共同所有","所有者なし"]);
            html+=section("資産と帰属",list.map(([name,asset])=>{
                const owners=ownersOf(asset);
                const ownerLinks=owners.length?owners.map(owner=>{
                    const label=owner==='<user>'?(userName||"プレイヤー"):owner;
                    if(owner!=='<user>'&&(relationNamesByKey.has(nameKey(owner))||people.has(owner)))return '<button data-jump-person="'+text(relationNamesByKey.get(nameKey(owner))||owner)+'">'+text(label)+' ↗</button>';
                    if(Object.hasOwn(w.勢力||{},owner))return '<button data-faction="'+text(owner)+'" data-asset-owner>'+text(label)+' ↗</button>';
                    return pill(label,'dim');
                }).join(''):pill("所有者なし",'dim');
                return '<article class="we-card" data-asset-card="'+text(name)+'"><div class="we-card-top"><h3>'+text(name)+'</h3>'+pill(asset.タイプ||"タイプ未記録",'dim')+"</div><div class=\"we-tools\"><b>所属対象</b>"+ownerLinks+(owners.length>1?pill("共同所有",'future'):'')+'</div><p>'+text(asset.状態||"状態未記録")+'</p>'+fields({主体規模:asset.主体規模,完全度:asset.完全度==null?undefined:asset.完全度+'%'})+details('asset-'+name,{エネルギー:asset.エネルギー,建設シーケンス:asset.建設シーケンス,駐留人員:asset.駐留人員,待機イベント:asset.待機イベント},"運転詳細 · 建設 / 駐留 / 対応待ち")+'</article>';
            }).join('')||empty("条件に一致する資産なし"),"全 "+assets.length+" 件 · 名称・所属対象・状態で検索できます");
            return html;
        }
    }
    class WorldEventArchiveView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {engine,events,matched,tools,section,timelineCards,empty}=ctx;
                    const list=events.filter(([n,e])=>matched(n,e)&&((engine.filter||"すべて")==="すべて"||e.状態===engine.filter));
                    return tools(["すべて","進行中","発生待ち","完了","取消済み"])
                        +section('世界事件','<div class="we-timeline">'+(timelineCards(list)||empty("条件に一致する世界イベントはありません","現在のイベント・直近ノード・マクロノードごとに整理されます。"))+'</div>',"状態階層と因果順に並びます");
                
        }
    }
    class WorldRumorView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const {s,state,tools,section,entries,matched,text,fields,details,empty,pill}=context;
            let html=tools();
            for(const category of ["街頭の噂","情報取引","布告と檄文"]){
                html+=section(category,entries((s.噂||{})[category]).filter(([n,r])=>matched(n,r)).map(([n,r])=>'<article class="we-card"><h3>'+text(n)+'</h3><p>'+text(r.内容||r.要約)+'</p>'+fields({出典:r.出典||r.売り手||r.発布者,信頼度:r.信頼度,要求価格:r.要求価格,位置:r.掲示位置})+details('rumor-'+n,{真の内幕:r.真の内幕},"進行役の記録")+'</article>').join('')||empty("なし"+category,"噂はすでに発生したイベントと伝播経路から生まれます。"));
            }
            html+=section('传播链',entries(state.传播).map(([n,r])=>'<article class="we-card"><div class="we-card-top"><h3>'+text(n)+'</h3>'+pill(r.状態,'dim')+'</div><p>'+text(r.内容)+'</p>'+fields({時間:r.時間,出典:r.出典,范围:r.范围,受众:r.受众,到期时间:r.到期时间})+details('spread-'+n,{关联事件:r.关联事件,引发行动:r.引发行动,真相:r.真相},"因果と伝播の詳細")+'</article>').join('')||empty("伝播チェーンなし"));
            return html;
        }
    }
    class WorldHistoryView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {state,radar,showRadar,exists,section,text,entries,fields,empty,pill}=ctx;
                    let html='';
                    if(showRadar&&exists(radar.現在モード))html+=section("干渉モード",'<article class="we-card"><p>'+text(radar.現在モード)+'</p></article>');
                    const historyMemory=projectWorldHistoryMemory(state);
                    html+=section("近期歴史アンカー",entries(historyMemory.近期锚点).reverse().map(([n,r])=>'<article class="we-card"><div class="we-meta">'+text(r.時間)+'</div><p>'+text(r.事实)+'</p>'+fields({关联事件:r.关联事件})+'</article>').join('')||empty("未収納の直近アンカーはありません"),(historyMemory.统计?.原始锚点总数||0)+" 件の原始履歴 · 現在のホットルートノードのみ表示");
                    html+=section("長期歴史総括",(historyMemory.长期总结||[]).slice().reverse().map(r=>'<article class="we-card"><div class="we-card-top"><h3>'+text(r.名称)+'</h3>'+pill('L'+text(r.階層),'dim')+'</div><div class="we-meta">'+text([r.起始时间,r.结束时间].filter(Boolean).join(' → '))+'</div><p>'+text(r.要約)+'</p></article>').join('')||empty("長期の履歴要約はまだありません","履歴アンカーが蓄積されると自動で階層圧縮されます；下層の事実はMVUに保持されたままです。"),(historyMemory.统计?.总结节点总数||0)+" 件の要約ノード · 原始履歴は削除されません");
                    return html;
                
        }
    }
    class WorldSettingsView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {engine,section,text}=ctx;
                    let html='';
                    const api=engine.normalizeDedicatedApi(engine.config.dedicatedApi);
                    const fontButtons=Object.entries(WORLD_FONT_SCALES).map(([key,item])=>'<button class="we-setting-btn '+(engine.config.fontScale===key?'active':'')+'" data-font-option="'+key+'">'+text(item.name)+' · '+text(item.size)+'</button>').join('');
                    const presets=api.apiPresets.map(p=>'<option value="'+text(p.name)+'">'+text(p.name)+'</option>').join('');
                    const terminalModels=Array.isArray(engine.host.Samsara?.terminal?.models?.())?engine.host.Samsara.terminal.models():[];
                    const terminalModel=String(engine.host.Samsara?.terminal?.currentModel?.()||'');
                    const modelOptions=Array.from(new Set([api.model,...api.fetchedModels,terminalModel,...terminalModels].filter(Boolean))).map(model=>'<option value="'+text(model)+'"></option>').join('');
                    const temperature=Math.max(0,Math.min(2,Number.isFinite(Number(engine.config.temperature))?Number(engine.config.temperature):0.3));
                    const fallbackModel=String(engine.config.fallbackModel||'');
                    const terminalReady=!!(engine.host.Samsara?.terminal?.apiReady?.());
                    const sourceState=engine.usesDedicatedApi()
                        ?(engine.dedicatedApiReady()?"専用 API は準備完了":"専用 API は引き継いだが、設定がまだ不完全です")
                        :(terminalReady?"主神端末の追加モデルを使用":"主神端末の追加モデルはまだ準備できていません");
                    html+=section("画面文字サイズ","<div class=\"we-setting-row\"><div class=\"we-setting-copy\"><b>画面文字サイズ</b><small>色調は主神端末に追従；ここでは世界進行自身の文字サイズのみを調整します。</small></div><div class=\"we-setting-actions\">"+fontButtons+'</div></div>',"色調は主神端末に追従 · 既定は標準 16px");
                    const historyToProse=engine.config.sendHistoryToProse===true;
                    html+=section('历史记忆',"<div class=\"we-setting-row\"><div class=\"we-setting-copy\"><b>本文へ履歴記憶を提供</b><small>有効にすると、本文AIが“直近の原始アンカー + より古い長期要約”を追加で読み取ります；無効でも影響するのは本文のみで、世界進行自身は常に完全な階層履歴を使用します。</small></div><div class=\"we-setting-actions\"><button class=\"we-setting-btn we-switch "+(historyToProse?'on':'')+'" data-action="history-prose-toggle"><span>'+text(historyToProse?"有効":"無効")+'</span><span class="we-switch-track"><i></i></span></button></div></div>',"既定はオフ · 原始履歴の事実はオフにしても削除されません");
                    html+=section("モデル接続",
                        "<div class=\"we-setting-row\"><div class=\"we-setting-copy\"><b>現在の呼び出し元</b><small>"+text(sourceState)+'</small></div><div class="we-setting-actions"><span class="we-source-badge">'+text(engine.apiSourceLabel())+'</span></div></div>'
                        +"<div class=\"we-api-grid\"><label>シミュレーションの温度<input class=\"we-setting-input\" data-world-temperature type=\"number\" min=\"0\" max=\"2\" step=\"0.05\" value=\""+text(temperature)+"\"></label><label>予備モデル（任意）<input class=\"we-setting-input\" data-fallback-model list=\"we-world-fallback-models\" value=\""+text(fallbackModel)+"\" placeholder=\"主モデルが連続失敗した際に切り替え\"><datalist id=\"we-world-fallback-models\">"+modelOptions+"</datalist></label></div><p class=\"we-muted\">温度の初期値は 0.3 です。予備モデルは空欄なら無効です。指定した場合、主モデルが「モデルごとの最大試行回数」に達しても失敗した時に予備モデルへ切り替えます。専用 API と新版の主神端末追加モデルの両方で、モデルの指定を変更できます。</p>"
                        +"<div class=\"we-setting-row\"><div class=\"we-setting-copy\"><b>世界進行システム専用 API</b><small>有効にすると世界進行はここだけを使用し、ステータスバー / 主神端末の APIを呼び出しません；設定が不完全でも黙ってフォールバックすることはありません。</small></div><div class=\"we-setting-actions\"><button class=\"we-setting-btn we-switch "+(api.enabled?'on':'')+'" data-action="dedicated-toggle"><span>'+text(api.enabled?"有効":"無効")+'</span><span class="we-switch-track"><i></i></span></button></div></div>'
                        +(api.enabled
                            ?"<div class=\"we-api-toolbar\"><select class=\"we-setting-input\" data-dedicated-preset><option value=\"\">— 保存済み API プリセットを選択 —</option>"+presets+"</select><input class=\"we-setting-input\" data-dedicated-preset-name maxlength=\"80\" placeholder=\"プリセット名\"><button class=\"we-setting-btn\" data-action=\"dedicated-preset-save\">プリセットを保存</button><button class=\"we-setting-btn\" data-action=\"dedicated-preset-delete\">プリセットを削除</button></div>"
                             +"<div class=\"we-api-grid\"><label class=\"wide\">API アドレス<input class=\"we-setting-input\" data-dedicated-field=\"apiUrl\" value=\""+text(api.apiUrl)+'" placeholder="https://example.com/v1"></label><label class="wide">API Key<input class="we-setting-input" data-dedicated-field="apiKey" type="password" value="'+text(api.apiKey)+"\" autocomplete=\"off\" placeholder=\"sk-...\"></label><label>モデル<input class=\"we-setting-input\" data-dedicated-field=\"model\" list=\"we-dedicated-models\" value=\""+text(api.model)+"\" placeholder=\"モデル名を入力または読み込み\"><datalist id=\"we-dedicated-models\">"+modelOptions+"</datalist></label><label>モデルカタログ<span class=\"we-setting-actions\"><button class=\"we-setting-btn\" data-action=\"dedicated-models\">モデルを読み込み / 接続テスト</button></span></label></div>"
                             +"<p class=\"we-muted\">インターフェースは OpenAI-compatible /v1/chat/completions と /v1/models 方式で接続し、JSON Schema → JSON Object → プレーンテキストへの構造化互換フォールバックを保持します。</p>"
                            :"<div class=\"we-notice\">現在は専用 API がオフです。世界進行は引き続き主神端末の「追加モデル設定」を使用します；ここでステータスバーの API Keyを複製・読み取りすることはありません。</div>")
                        ,"インターフェース設定はローカルの localStorage にのみ保存され、MVUには書き込まれません");
                    const snapshots=engine.services?.snapshots?.list?.()||[];
                    html+=section("世界スナップショット",
                        "<div class=\"we-doc-create\"><input class=\"we-setting-input\" data-world-snapshot-name maxlength=\"80\" placeholder=\"名前の例：司法の島の決戦前\"><button class=\"we-btn we-primary\" data-action=\"world-snapshot-save\">世界スナップショットを保存</button></div>"
                        +(snapshots.length?'<div class="we-doc-list">'+snapshots.map(item=>'<div class="we-doc-row"><div><b>'+text(item.name)+'</b><small>'+text(item.worldTime||"時刻未記録")+' · '+text(item.createdAt?new Date(item.createdAt).toLocaleString():"日時未記録")+'</small></div><span class="we-doc-actions"><button data-action="world-snapshot-restore" data-snapshot-id="'+text(item.id)+"\">復元</button><button data-action=\"world-snapshot-delete\" data-snapshot-id=\""+text(item.id)+"\">削除</button></span></div>").join('')+'</div>':"<div class=\"we-empty\"><b>世界スナップショットはありません</b><small>世界進行が管理するデータだけを保存し、プレイヤーの能力値や任務の状態は巻き戻しません。</small></div>")
                        +"<p class=\"we-muted\">スナップショットは世界・資産・関係リスト・噂を保存します。復元しても能力値・持ち物・任務・実績は巻き戻しません。復元後は現在のメッセージの世界進行処理済みマーカーを解除し、その後の世界状態を再構築できるようにします。</p>",
                        "現在のチャットの直近 12 件を保存 · ローカルのみ");
                    return html;
                
        }
    }
    class WorldPromptView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {engine,text,section,empty}=ctx;
                    let html='';
                    const promptView=engine.promptDraft||{
                        preset:engine.config.preset,
                        corePrompt:engine.config.corePrompt??CORE_WORLD_RULES,
                        macroPrompt:engine.config.macroPrompt??DEFAULT_MACRO_PROMPT,
                        stabilityPromptTemplate:engine.config.stabilityPromptTemplate??DEFAULT_STABILITY_PROMPT_TEMPLATE,
                        structurePrompt:engine.config.structurePrompt,
                        npcAuditPrompt:engine.config.npcAuditPrompt,
                        contextTurns:engine.config.contextTurns||6,
                        activationMode:engine.config.activationMode||'respect_activation',
                        selectedEntries:Array.isArray(engine.config.selectedEntries)?copy(engine.config.selectedEntries):null
                    };
                    const docs=engine.getPromptDocuments(),activeDoc=docs.find(doc=>doc.id===engine.config.activePromptDocumentId);
                    html+="<div class=\"we-preset-toolbar\"><div><b>プロンプトワークベンチ</b><small>主要な操作は上部に固定されているため、保存のためにページ最下部までスクロールする必要はありません。</small></div><div><button class=\"we-btn we-primary\" data-action=\"save\">現在の設定を保存</button><button class=\"we-btn\" data-action=\"save-default\">個人用デフォルトとして保存</button><button class=\"we-btn\" data-action=\"preview\">次のリクエストをプレビュー</button></div></div>";
                    html+=section("プリセット文書","<div class=\"we-doc-create\"><input data-doc-name maxlength=\"80\" placeholder=\"文書名（例：原作進行・標準）\" value=\""+text(activeDoc?.builtin?'':activeDoc?.name||'')+"\"><button class=\"we-btn we-primary\" data-action=\"doc-save\">文書として保存</button><button class=\"we-btn\" data-action=\"doc-import\">文書をインポート</button><input data-doc-import type=\"file\" accept=\".json,application/json\" hidden></div>"+
                        (docs.length?'<div class="we-doc-list">'+docs.map(doc=>'<div class="we-doc-row"><div><b>'+text(doc.name)+(doc.builtin?" <span class=\"we-doc-badge\">組み込みデフォルト</span>":'')+'</b><small>'+text(doc.updatedAt?new Date(doc.updatedAt).toLocaleString():"日時未記録")+(doc.id===engine.config.activePromptDocumentId?" · 現在適用中":'')+'</small></div><span class="we-doc-actions"><button data-action="doc-apply" data-doc-id="'+text(doc.id)+"\">適用</button><button data-action=\"doc-export\" data-doc-id=\""+text(doc.id)+"\">エクスポート</button>"+(doc.builtin?'':'<button data-action="doc-delete" data-doc-id="'+text(doc.id)+"\">削除</button>")+'</span></div>').join('')+'</div>':empty("プリセット文書はまだありません","現在の設定を保存すると、ここで適用・エクスポート・削除ができます。")),"組み込みの“デフォルト設定”は常にコード版に追従します；“個人用デフォルトとして保存”は編集可能なすべてのプロンプト・本文ウィンドウ・資料範囲を別名で保存し、組み込みテンプレートを上書きしません");
                    html+="<div class=\"we-notice\">世界書カタログはキャラクター本体のブック、キャラクター追加ブック、現在のチャットに紐づくブック、酒場でグローバル有効なブックを読み取ります。青ランプと緑ランプはエントリの発動方式を示します；“実際の読み取り”はリクエスト検査の今回の一覧が基準です。</div>";
                    const groups=new Map();
                    for(const e of engine.bookCatalogue||[]){if(!groups.has(e.book))groups.set(e.book,[]);groups.get(e.book).push(e);}
                    const selectedEntries=Array.isArray(promptView.selectedEntries)?promptView.selectedEntries:null;
                    const selected=e=>!e.technical&&(engine.isNpcAuditWorldbook(e)?engine.isNpcBuildAuditEnabled():selectedEntryMatches(e,selectedEntries));
                    html+=section("資料読み取り範囲","<div class=\"we-config-row\"><label>本文ウィンドウ <input data-floors type=\"number\" min=\"1\" max=\"100\" value=\""+text(promptView.contextTurns||6)+"\"> 層</label><label>読み取り方式 <select data-activation><option value=\"respect_activation\" "+(promptView.activationMode!=='force_selected'?'selected':'')+">青ランプ・緑ランプに従う</option><option value=\"force_selected\" "+(promptView.activationMode==='force_selected'?'selected':'')+">チェック項目を強制読み取り</option></select></label></div><p class=\"we-muted\">青ランプ・緑ランプに従う：青ランプは常駐、緑ランプは上記の本文ウィンドウのキーワードを走査；無効な項目は読みません。強制モードでは通常の無効項目も含められますが [variables]、[mvu_update]、本文の追加思考、および任務/出力の技術エントリは常に隔離されます。未紐づけでグローバル有効でもない世界書は自動的に読み取られません。</p><div class=\"we-tools\"><button data-action=\"books\">カタログを読み込み / 更新</button><button data-action=\"book-all\">すべて選択</button><button data-action=\"book-none\">すべて解除</button></div>"+
                        (groups.size?Array.from(groups).map(([book,list])=>'<details class="we-book" open><summary>'+text(book)+' <small>'+text((list[0]?.sources||[]).join(' · ')||"紐づけ済み")+' · '+list.filter(selected).length+' / '+list.length+" 件選択済み</small></summary><div class=\"we-book-list\">"+list.map(e=>{
                            const report=(engine.readReport||[]).find(r=>r.世界书===e.book&&r.条目ID===e.id);
                            return '<label class="we-book-row"><input type="checkbox" data-book value="'+text(JSON.stringify([e.book,e.id]))+'" '+(selected(e)?'checked':'')+' '+(e.technical?'disabled':'')+'><span class="we-lamp '+(e.technical?'gray':e.mode==='constant'?'blue':e.mode==='selective'?'green':'gray')+'" title="'+text(e.technical?"技術エントリ · 隔離済み":e.mode==='constant'?"青ランプ · 常駐":e.mode==='selective'?"緑ランプ · キーワード発動":"その他の発動方式")+'"></span><span class="we-book-title"><b>'+text(e.title)+'</b><small>'+text(e.technical?"技術エントリ · 世界エンジンは読み取りません":(e.mode==='constant'?"常駐":e.mode==='selective'?"キーワード："+(Array.isArray(e.keys)?e.keys.map(k=>typeof k==='string'?k:"正規表現条件").join('、'):e.keys):e.mode)+(e.enabled?'':" · 無効"))+'</small></span><small class="we-read-state">'+text(report?"前回の検査："+report.原因:e.technical?"固定隔離":"未検査")+'</small></label>';
                        }).join('')+'</div></details>').join(''):empty("カタログ未読み込み","“カタログを読み込み / 更新”をクリックして、現在紐づいている世界書とグローバル有効な世界書を読み取ります。")));
                    const segments=splitPresetSegments(promptView.preset);
                    html+=section("セグメントプロンプト","<div class=\"we-segment-toolbar\"><span>既定は読み取り専用、展開して閲覧；編集を開始すると変更できます。</span><button class=\"we-btn\" data-action=\"prompt-edit\" aria-pressed=\""+!!engine.promptEditing+'">'+(engine.promptEditing?"編集をロック":"編集を開始")+'</button><button class="we-btn" data-action="segment-add" '+(engine.promptEditing?'':'disabled')+">＋ セグメント追加</button></div><div class=\"we-segment-list\" data-segment-list>"+segments.map((part,i)=>'<details class="we-segment" data-segment-row><summary>'+text(part.title||"名称未設定のセグメント")+' <small>'+formatTokenCount(estimateTokens(part.body),true)+'</small></summary><div class="we-segment-head"><input '+(engine.promptEditing?'':'readonly')+" data-segment-title aria-label=\"セグメントタイトル "+i+"\" placeholder=\"セグメントタイトル（空欄可）\" value=\""+text(part.title)+'"><small>'+formatTokenCount(estimateTokens(part.body),true)+'</small><span class="we-segment-actions"><button type="button" '+(engine.promptEditing?'':'disabled')+" data-action=\"segment-up\" title=\"上へ移動\">↑</button><button type=\"button\" "+(engine.promptEditing?'':'disabled')+" data-action=\"segment-down\" title=\"下へ移動\">↓</button><button type=\"button\" "+(engine.promptEditing?'':'disabled')+" data-action=\"segment-delete\" title=\"削除\">削除</button></span></div><textarea "+(engine.promptEditing?'':'readonly')+' data-segment="'+i+'" data-title="'+text(part.title)+"\" aria-label=\"プリセットセグメント "+i+'">'+text(part.body)+'</textarea></details>').join('')+"</div><p class=\"we-muted\">これらのセグメントは主要な作業レイヤーで、追加・削除・順序変更が可能です。コア制約と条件付きプロンプトは下で個別に編集し、同じプリセット文書と一緒に保存されます。</p>");
                    html+=section("システムプロンプト","<div class=\"we-notice\">ここに表示されるテキストはすべて実際の system リクエストに直接含まれ、プリセット文書とともに保存・適用・インポート・エクスポートされます。条件付きプロンプトは対応する条件が成立した時だけ送信されます；固定なのはプログラムフィールドの Schema のみです。</div>"
                        +"<details class=\"we-segment\"><summary>世界エンジンの基本制約 · "+(engine.promptEditing?"編集中":"クリックで展開")+'</summary><textarea data-core-prompt '+(engine.promptEditing?'':'readonly')+'>'+text(promptView.corePrompt??CORE_WORLD_RULES)+"</textarea><p class=\"we-muted\">常に送信されます。変更または空欄可；空欄にするとコア制約は追加注入されません。</p></details>"
                        +"<details class=\"we-segment\"><summary>マクロ骨格の受渡し · 条件付きプロンプト</summary><textarea data-macro-prompt "+(engine.promptEditing?'':'readonly')+'>'+text(promptView.macroPrompt??DEFAULT_MACRO_PROMPT)+"</textarea><p class=\"we-muted\">今回、マクロ骨格の確立/補完が必要な時のみ送信されます。</p></details>"
                        +"<details class=\"we-segment\"><summary>世界の自己修復 · 条件付きプロンプトテンプレート</summary><textarea data-stability-prompt "+(engine.promptEditing?'':'readonly')+'>'+text(promptView.stabilityPromptTemplate??DEFAULT_STABILITY_PROMPT_TEMPLATE)+"</textarea><p class=\"we-muted\">世界安定値が100未満かつ世界超稳が有効でない時に送信されます。 {{段階}}、{{稳定值}}、{{规则}} プレースホルダーを使用できます。</p></details>"
                        +"<details class=\"we-segment\"><summary>角色管理 · NPC構築監査 · "+(engine.isNpcBuildAuditEnabled()?"現在有効":"現在オフ")+'</summary><textarea data-npc-audit-prompt '+(engine.promptEditing?'':'readonly')+'>'+text(promptView.npcAuditPrompt??NPC_BUILD_AUDIT_RULES)+"</textarea><p class=\"we-muted\">スイッチの状態にかかわらず編集・保存できます；監査が有効で、かつ今回監査対象が存在する時のみ送信されます。</p></details>","コアと条件付きプロンプトはどちらも編集可能");
                    html+=section("WorldResult 出力プロトコル","<details class=\"we-segment\"><summary>WorldResult プロトコル説明 · クリックで展開</summary><textarea data-structure-prompt "+(engine.promptEditing?'':'readonly')+'>'+text(promptView.structurePrompt??protocol().split('【Canonical WorldResult JSON Schema】')[0].trim())+"</textarea></details><details class=\"we-segment\"><summary>プログラムフィールド Schema · 読み取り専用</summary><textarea readonly>"+text(JSON.stringify(WORLD_RESULT_SCHEMA,null,2))+"</textarea></details><p class=\"we-muted\">プロトコル説明は上部の編集スイッチを使用します。保存後は実際の system リクエストに使われます；Schema は固定で読み取り専用、テキストプロンプトを変更してもプログラム変数の構造は変わりません。</p>");
                    return html;
                
        }
    }
    class WorldRequestInspectorView {
        constructor(engine){this.engine=engine;}
        render(context={}){
            const ctx={...context,engine:this.engine};
            
                    const {engine,text,section,empty,fields,pill}=ctx;
                    let html='';
                    const fold=(title,body)=>'<details class="we-inspect"><summary>'+text(title)+'</summary><div class="we-inspect-body">'+body+'</div></details>';
                    const raw=(label,v)=>fold(label,'<textarea class="we-raw" readonly>'+text(v)+'</textarea>');
                    const readable=(name,v)=>Array.isArray(v)?v.map((item,i)=>fold((item.名称||item.楼层!==undefined&&(item.キャラ+' · 第 '+item.楼层+" 層")||name+' '+(i+1)),fields(item))).join(''):fields(plain(v)?v:{内容:v});
                    const retryLog=(engine.lastRetryLog||[]).map(item=>{
                        const feedback=retryFeedback(item.错误,Array.isArray(item.片段)?item.片段:[],Array.isArray(item.补充清单)?item.补充清单:[]);
                        const details=feedback.issues.length?"<p><b>具体的な問題</b><br>"+feedback.issues.map(text).join('<br>')+'</p>':'';
                        const guidance=feedback.actions.length?"<p><b>修正要件</b><br>"+feedback.actions.map(text).join('<br>')+'</p>':'';
                        return '<div class="we-change"><time>#'+text(item.尝试)+'</time><div><b>'+text(item.タイプ||"モデルの応答が拒否されました")+'</b><p>'+text(feedback.summary)+'</p>'+details+guidance+'</div></div>';
                    }).join('');
                    const tokenLabel=(value,estimated=true)=>Number.isFinite(Number(value))?formatTokenCount(Number(value),estimated):'—';
                    html+=section("失敗時の自動再試行","<div class=\"we-config-row\"><label>モデルごとの最大試行回数 <input data-retries type=\"number\" min=\"1\" max=\"5\" value=\""+text(engine.config.retryAttempts??5)+"\"> 回</label><span class=\"we-muted\">初回リクエストを含みます。1 は 1 回だけ、5 はモデルごとに最大 5 回です。HTTP・ネットワーク障害、空の応答、解析失敗、内容の検証失敗は再試行します。危険な権限逸脱、コンテキストの変更、書き込み未確認の場合は直ちに終了します。予備モデルがある場合、主モデルが上限に達してから切り替え、同じ試行回数を適用します。</span></div>"+(engine.lastAttemptCount?"<p class=\"we-muted\">直近は合計 "+text(engine.lastAttemptCount)+" 回。リクエスト失敗とモデルの結果の拒否は下に記録されます。部分検証では合格済みの結果を保持し、訂正は失敗部分の補充だけを求めます。</p>":'')+(retryLog||''));
                    html+="<div class=\"we-tools\"><button data-action=\"preview\">次のリクエストプレビューを生成（実際の APIは呼び出しません）</button></div>";
                    for(const [label,r] of [["最近の実際の送信",engine.lastRequest],["次のリクエストプレビュー",engine.previewRequest]]){
                        if(!r){html+=section(label,empty("なし"+label));continue;}
                        const m=r.manifest||{},books=m.世界书条目||[],floors=m.正文楼层||[],obs=m.观测||requestTokenTelemetry(r.system,r.input,r.schema||WORLD_RESULT_SCHEMA);
                        const readChecks=(m.读取判定||[]).filter(item=>item.读取===true);
                        const exactInput=obs.实际输入Tokens!=null,exactOutput=obs.实际输出Tokens!=null;
                        let body='<div class="we-request-summary">'+pill(m.输出协议||'WorldResult v1','dim')+pill("構造化 "+(obs.结构化实际模式||m.结构化输出||'auto'),'dim')+pill(obs.接口来源||m.接口来源||engine.apiSourceLabel(),'dim')+pill(books.length+" 件の世界書",'dim')+pill(floors.length+" 層の本文",'dim')+pill((exactInput?tokenLabel(obs.实际输入Tokens,false):tokenLabel(obs.请求估算Tokens,true))+" 入力",'dim')+(obs.输出估算Tokens!=null?pill((exactOutput?tokenLabel(obs.实际输出Tokens,false):tokenLabel(obs.输出估算Tokens,true))+" 出力",'dim'):'')+(m.尝试序号?pill("試行 "+m.尝试序号,'dim'):'')+(m.最大尝试次数!==undefined?pill("最大試行 "+m.最大尝试次数,'dim'):'')+'</div>';
                        const userTokenFields=Object.fromEntries((obs.User分段||[]).map(item=>[item.名称,tokenLabel(item.估算Tokens,true)]));
                        body+="<p class=\"we-muted\">“≈”付きの tk はローカル容量の概算にすぎず、プロバイダの実際の token とは異なります；主神端末の経路で usage が取得できない場合は正確な総量を確認できません。総入力 = System + 以下の User 内訳；ここでは User の総計や Schema の子項目は重複表示しません。専用 API が usage を返す場合、総入力/出力のみサーバー側の実際の tokenに切り替わります。</p>";
                        body+=fold("Token 構成（クリックで展開）",fields(Object.assign({总输入:exactInput?tokenLabel(obs.实际输入Tokens,false):tokenLabel(obs.请求估算Tokens,true),System:tokenLabel(obs.System估算Tokens,true)},userTokenFields,{接口:obs.接口来源||m.接口来源||'',模型:obs.模型||'',模式尝试:Array.isArray(obs.模式尝试)&&obs.模式尝试.length?obs.模式尝试.join(' → '):'',耗时:Number.isFinite(Number(obs.耗时毫秒))?(Number(obs.耗时毫秒)/1000).toFixed(2).replace(/\.00$/,'')+' s':''}))+fold("system セグメント",fields({分段:(obs.System分段||[]).map(item=>item.名称+' · '+tokenLabel(item.估算Tokens,true))})));
                        body+=fold("今回実際に読み取った資料（クリックで展開）",(readChecks.length?readable('条目',readChecks):empty("今回世界書を読み取りませんでした","チェックに一致した、または強制読み取りの世界書エントリがありません。"))+fold("実際に読み取った世界書",fields({条目:books.map(item=>item.名称+' · '+tokenLabel(item.估算Tokens,true))}))+fold("実際の本文階層",fields({楼层:floors.map(f=>'第 '+f.楼层+" 層 · "+f.キャラ+' · '+tokenLabel(f.估算Tokens,true))}))+fold("時間容量",fields(m.本轮时间容量||{})));
                        body+=fold("出力契約 · JSON Schema",raw('samsara_world_result_v1',JSON.stringify(r.schema||WORLD_RESULT_SCHEMA,null,2)));
                        body+=fold("system · セグメント閲覧",r.system.split(/\n(?=【)/).map((part,i)=>fold((part.match(/^【([^】]+)】/)||[])[1]||"アイデンティティ / プロトコル "+(i+1),'<div class="we-prose">'+text(part)+'</div>')).join(''))+raw("system · 実際の送信原文",r.system);
                        let payload;try{payload=JSON.parse(r.input);}catch(_){payload={正文:r.input};}
                        body+=fold("user · セグメント閲覧",Object.entries(payload).map(([name,v])=>fold(name,readable(name,v))).join(''))+raw("user · 実際の送信原文",r.input);
                        html+=section(label,body);
                    }
                    if(engine.lastWorldResult)html+=section("最近の WorldResult · 業務層",raw("モデルが受理し累積した業務結果",JSON.stringify(engine.lastWorldResult,null,2)));
                    if((engine.lastCompiledPatches||[]).length)html+=section("プログラムコンパイルパッチ · ストレージ層",raw(" WorldResult Compiler が生成；モデルはこれらのパスを直接制御しません",JSON.stringify(engine.lastCompiledPatches,null,2)));
                    if((engine.lastCompileWarnings||[]).length)html+=section("コンパイル警告",(engine.lastCompileWarnings||[]).map(w=>'<div class="we-notice">'+text(w)+'</div>').join(''));
                    if(engine.lastFailure)html+='<div class="we-notice">'+text(engine.lastFailure)+'</div>';
                    if(engine.lastReply){
                        const lastAttempt=(engine.lastAttemptTelemetry||[]).at(-1),replyTk=lastAttempt?.API输出Tokens!=null?formatTokenCount(lastAttempt.API输出Tokens,false):formatTokenCount(estimateTokens(engine.lastReply),true);
                        html+=section("副 API の生の応答 · "+replyTk,raw("モデルの返答原文を表示（フォーマット問題の特定用）",engine.lastReply));
                    }
                    return html;
                
        }
    }
    class WorldEngineViewRegistry {
        constructor(engine){
            this.engine=engine;
            this.views=new Map([
                ['world',new WorldOverviewView(engine)],
                ['people',new WorldPeopleView(engine)],
                ['exploration',new WorldExplorationView(engine)],
                ['assets',new WorldAssetView(engine)],
                ['events',new WorldEventArchiveView(engine)],
                ['rumors',new WorldRumorView(engine)],
                ['history',new WorldHistoryView(engine)],
                ['settings',new WorldSettingsView(engine)],
                ['prompts',new WorldPromptView(engine)],
                ['requestInspector',new WorldRequestInspectorView(engine)]
            ]);
        }
        get(key){return this.views.get(key)||null;}
        register(key,view){
            if(!key||!view||typeof view.render!=='function')throw new Error("世界進行の View 登録が無効です");
            this.views.set(String(key),view);return view;
        }
        render(key,context){
            const view=this.get(key);if(!view)throw new Error("世界進行の View が存在しません："+key);
            return view.render(context);
        }
        keys(){return Array.from(this.views.keys());}
        describe(){return this.keys().map(key=>({key,className:this.get(key)?.constructor?.name||''}));}
    }
    class WorldPanelController {
        constructor(engine){this.engine=engine;}
        createPanel() {
            const engine=this.engine;

            if (engine.panel && engine.panel.isConnected) return;
            const doc=engine.host.document;
            engine.style=doc.createElement('style');
            engine.style.textContent = worldEngineBaseStyleText();
            engine.mount=doc.createElement('div');
            engine.mount.id='sam-world-engine-host';
            engine.mount.style.setProperty('all','initial','important');
            const isolated=engine.mount.attachShadow({mode:'open'});
            isolated.appendChild(engine.style);
            engine.panel=doc.createElement('section');engine.panel.id='sam-world-engine';engine.panel.hidden=true;
            engine.panel.dataset.tone=engine.statusTone();engine.panel.dataset.fontScale=engine.config.fontScale||'standard';
            engine.panel.setAttribute('role','dialog');engine.panel.setAttribute('aria-label',"世界エンジン");
            engine.panel.innerHTML="<header><div class=\"we-brand\"><i>◈</i>世界エンジン<small>WORLD CHRONICLE</small></div><button class=\"we-btn we-primary\" data-action=\"run\">世界を進行</button><button class=\"we-btn\" data-action=\"close\" aria-label=\"主神端末に戻る\">戻る ↗</button></header><div class=\"we-layout\"><nav></nav><main></main></div><footer><span></span><small>物語時間ドリブン · 主神端末の「世界進行」マスタースイッチで制御</small></footer>";
            engine.panel.addEventListener('click',event=>{
                const button=event.target.closest('button');if(!button)return;
                const a=button.dataset.action;
                if(button.dataset.directory){engine.directoryTab=button.dataset.directory;engine.render();return;}
                if(button.dataset.area){engine.selectedArea=button.dataset.area;engine.directoryTab='探索';engine.render();return;}
                if(button.dataset.faction){if(button.hasAttribute('data-asset-owner'))engine.tab="探索と勢力";engine.selectedFaction=button.dataset.faction;engine.directoryTab="勢力";engine.render();return;}
                if(button.dataset.jumpPerson){engine.selectedPerson=button.dataset.jumpPerson;engine.tab='角色管理';engine.filter="すべて";engine.query='';engine.selectedDate='';engine.render(true);return;}
                if(button.dataset.jumpEvent){
                    engine.jumpEvent=button.dataset.jumpEvent;engine.tab="世界進行";engine.filter="すべて";engine.query='';
                    const world=engine.snapshot().stat.世界,event=world[PATH]?.事件?.[engine.jumpEvent],calendar=world.暦法;
                    const date=calendarDate(event?.時間||event?.开始时间,calendar),today=calendarDate(world.時間,calendar);
                    const monthsPerYear=Array.isArray(calendar?.月日数)&&calendar.月日数.length?calendar.月日数.length:12;
                    engine.selectedDate=date?.key||'';engine.calendarMode=date?'date':'undated';
                    engine.monthOffset=date&&today?(date.y-today.y)*monthsPerYear+date.m-today.m:0;
                    engine.eventLimit=Number.MAX_SAFE_INTEGER;engine.render(true);return;
                }
                if(button.dataset.person){engine.selectedPerson=button.dataset.person;engine.render();return;}
                if(a==='close')engine.close();
                else if(a==='run'){
                    if(engine.busy){if(!engine.committing){engine.cancel();engine.status="停止を要求しました";engine.render();}}
                    else engine.run().catch(()=>{});
                }
                else if(a==='cancel'){engine.cancel();engine.status="停止を要求しました";engine.render();}
                else if(a==='save'){
                    const settings=engine.readPromptEditor();
                    engine.applyPromptSettings(settings);
                    engine.promptDraft=null;
                    engine.status="プロンプトと資料範囲を保存しました";
                    engine.panel.querySelector('footer span').textContent=engine.status;
                }
                else if(a==='prompt-edit'){
                    engine.promptEditing=!engine.promptEditing;
                    button.textContent=engine.promptEditing?"編集をロック":"編集を開始";button.setAttribute('aria-pressed',String(engine.promptEditing));
                    engine.panel.querySelectorAll('[data-segment-title],[data-segment],[data-structure-prompt],[data-npc-audit-prompt]').forEach(el=>el.readOnly=!engine.promptEditing);
                    engine.panel.querySelectorAll('[data-action^="segment-"]').forEach(el=>el.disabled=!engine.promptEditing);
                }
                else if(a==='save-default'){
                    const settings=engine.readPromptEditor();engine.applyPromptSettings(settings);
                    engine.config.userDefaultPromptSettings=copy(settings);
                    const docs=engine.getPromptDocuments();
                    let doc=docs.find(d=>d.id===USER_DEFAULT_PROMPT_DOCUMENT_ID);
                    const now=new Date().toISOString();
                    if(doc){doc.settings=copy(settings);doc.updatedAt=now;}
                    else docs.push({id:USER_DEFAULT_PROMPT_DOCUMENT_ID,type:'samsara-world-prompt-document',version:1,builtin:false,name:"個人用デフォルト設定",createdAt:now,updatedAt:now,settings:copy(settings)});
                    engine.config.activePromptDocumentId=USER_DEFAULT_PROMPT_DOCUMENT_ID;
                    engine.saveConfig();engine.status="個人用デフォルト設定として保存しました";engine.panel.querySelector('footer span').textContent=engine.status;
                }
                else if(a==='segment-add'){
                    if(!engine.promptEditing)return;
                    const list=engine.panel.querySelector('[data-segment-list]');if(!list)return;
                    const row=engine.host.document.createElement('details');row.open=true;row.className='we-segment';row.setAttribute('data-segment-row','');
                    row.innerHTML="<summary>新規セグメント</summary><div class=\"we-segment-head\"><input data-segment-title aria-label=\"セグメントタイトル\" placeholder=\"セグメントタイトル（空欄可）\"><small>新規セグメント</small><span class=\"we-segment-actions\"><button type=\"button\" data-action=\"segment-up\" title=\"上へ移動\">↑</button><button type=\"button\" data-action=\"segment-down\" title=\"下へ移動\">↓</button><button type=\"button\" data-action=\"segment-delete\" title=\"削除\">削除</button></span></div><textarea data-segment data-title=\"\" aria-label=\"新規セグメント本文\" placeholder=\"このセグメントのプロンプト本文を入力…\"></textarea>";
                    list.appendChild(row);row.querySelector('[data-segment-title]').focus();
                }
                else if(a==='segment-up'||a==='segment-down'){
                    if(!engine.promptEditing)return;
                    const row=button.closest('[data-segment-row]'),parent=row?.parentElement;if(!row||!parent)return;
                    if(a==='segment-up'&&row.previousElementSibling)parent.insertBefore(row,row.previousElementSibling);
                    if(a==='segment-down'&&row.nextElementSibling)parent.insertBefore(row.nextElementSibling,row);
                }
                else if(a==='segment-delete'){if(!engine.promptEditing)return;button.closest('[data-segment-row]')?.remove();}
                else if(a==='doc-save'){
                    try{
                        const settings=engine.readPromptEditor(),name=engine.panel.querySelector('[data-doc-name]')?.value||'';
                        engine.applyPromptSettings(settings);
                        const doc=engine.savePromptDocument(name,settings);engine.promptDraft=null;
                        engine.status="プリセット文書を保存しました："+doc.name;engine.render(true);
                    }catch(e){engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}
                }
                else if(a==='doc-apply'){
                    const doc=engine.getPromptDocuments().find(item=>item.id===button.dataset.docId);if(!doc)return;
                    engine.applyPromptSettings(doc.settings);engine.config.activePromptDocumentId=doc.id;
                    if(doc.id===BUILTIN_DEFAULT_PROMPT_DOCUMENT.id){
                        engine.config.builtinDefaultWorldbookExclusionsApplied=[];
                        engine.applyBuiltinDefaultWorldbookExclusions(engine.bookCatalogue||[]);
                    }
                    engine.saveConfig();engine.promptDraft=null;
                    engine.status="プリセット文書を適用しました："+doc.name+(Array.isArray(doc.settings?.selectedEntries)&&!(engine.bookCatalogue||[]).length?" · 世界書の選択はカタログ読み込み後に表示されます":'');
                    engine.render(true);
                }
                else if(a==='doc-export'){
                    try{engine.exportPromptDocument(button.dataset.docId);engine.status="プリセット文書をエクスポートしました";engine.panel.querySelector('footer span').textContent=engine.status;}
                    catch(e){engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}
                }
                else if(a==='doc-delete'){
                    engine.promptDraft=engine.readPromptEditor();
                    const doc=engine.getPromptDocuments().find(item=>item.id===button.dataset.docId);
                    if(engine.deletePromptDocument(button.dataset.docId)){engine.status="プリセット文書を削除しました"+(doc?'：'+doc.name:'');engine.render(true);}
                }
                else if(a==='doc-import'){
                    engine.promptDraft=engine.readPromptEditor();
                    const input=engine.panel.querySelector('[data-doc-import]');if(input){input.value='';input.click();}
                }
                else if(a==='books'){
                    engine.promptDraft=engine.readPromptEditor();
                    engine.catalogue().then(list=>{engine.bookCatalogue=list;engine.render(true);}).catch(e=>{engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;});
                }
                else if(a==='book-all'||a==='book-none'){engine.panel.querySelectorAll('[data-book]').forEach(e=>{e.checked=a==='book-all'&&!e.disabled;});}
                else if(a==='preview'){
                    const settings=engine.tab==="プロンプトプリセット"?engine.readPromptEditor():null;
                    if(settings)engine.applyPromptSettings(settings);
                    engine.promptDraft=null;
                    engine.buildRequest(engine.snapshot()).then(r=>{engine.previewRequest=r;engine.tab="リクエスト検査";engine.render(true);}).catch(e=>{engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;});
                }
                else if(button.dataset.fontOption){
                    const scale=button.dataset.fontOption;
                    if(WORLD_FONT_SCALES[scale]){engine.config.fontScale=scale;engine.panel.dataset.fontScale=scale;engine.saveConfig();engine.status="画面文字サイズ： "+WORLD_FONT_SCALES[scale].name;engine.render(true);}
                }
                else if(a==='world-snapshot-save'){
                    try{
                        const name=engine.panel.querySelector('[data-world-snapshot-name]')?.value||'';
                        const item=engine.services?.snapshots?.create?.(name);
                        if(!item)throw new Error("世界スナップショットサービスが初期化されていません");
                        engine.status="世界スナップショットを保存しました："+item.name;engine.render(true);
                    }catch(e){engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}
                }
                else if(a==='world-snapshot-restore'){
                    const id=button.dataset.snapshotId||'';
                    engine.cancel();
                    Promise.resolve(engine.services?.snapshots?.restore?.(id)).then(ok=>{
                        if(ok){engine.status="世界スナップショットを復元しました";engine.render(true);}
                    }).catch(e=>{engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;});
                }
                else if(a==='world-snapshot-delete'){
                    const id=button.dataset.snapshotId||'';
                    if(engine.services?.snapshots?.remove?.(id)){engine.status="世界スナップショットを削除しました";engine.render(true);}
                }
                else if(a==='dedicated-toggle'){
                    engine.cancel();
                    const api=engine.normalizeDedicatedApi(engine.config.dedicatedApi);
                    api.enabled=!api.enabled;engine.config.dedicatedApi=api;
                    if(!api.enabled&&engine.isConfigured()){
                        const terminal=engine.host.Samsara&&engine.host.Samsara.terminal;
                        if(terminal&&typeof terminal.enableApi==='function')terminal.enableApi();
                    }
                    engine.saveConfig();
                    engine.status=api.enabled?"世界進行システム専用 API を有効化 · 主神端末 APIは使用しません":"専用 API を無効化 · 主神端末 APIへフォールバック";
                    engine.render(true);
                }
                else if(a==='dedicated-models'){
                    engine.status="専用 API のモデル一覧を読み込み中";engine.panel.querySelector('footer span').textContent=engine.status;
                    engine.fetchDedicatedModels().then(list=>{engine.status="読み込み済み："+list.length+" 件読み込みました";engine.render(true);}).catch(e=>{engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;});
                }
                else if(a==='dedicated-preset-save'){
                    try{
                        const name=engine.panel.querySelector('[data-dedicated-preset-name]')?.value||'';
                        const entry=engine.saveDedicatedApiPreset(name);
                        engine.status=" API プリセットを保存しました："+entry.name;engine.render(true);
                    }catch(e){engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}
                }
                else if(a==='dedicated-preset-delete'){
                    const name=engine.panel.querySelector('[data-dedicated-preset]')?.value||'';
                    if(!name){engine.status="削除する API プリセットを選択してください";engine.panel.querySelector('footer span').textContent=engine.status;}
                    else if(engine.deleteDedicatedApiPreset(name)){engine.status=" API プリセットを削除しました："+name;engine.render(true);}
                }
                else if(a==='month'){
                    engine.monthOffset=(engine.monthOffset||0)+Number(button.dataset.step);
                    const world=engine.snapshot().stat.世界,calendar=world.暦法,today=calendarDate(world.時間,calendar);
                    if(today){
                        const custom=Array.isArray(calendar?.月日数)?calendar.月日数.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=99).slice(0,24):[];
                        if(custom.length){
                            let y=today.y,m=today.m+engine.monthOffset;
                            while(m<1){m+=custom.length;y--;}
                            while(m>custom.length){m-=custom.length;y++;}
                            engine.selectedDate=y+'-'+m+'-1';
                        }else{
                            const date=new Date(0);date.setFullYear(today.y,today.m-1+engine.monthOffset,1);
                            engine.selectedDate=date.getFullYear()+'-'+(date.getMonth()+1)+'-1';
                        }
                    }
                    engine.calendarMode='date';engine.eventLimit=12;engine.render();
                }
                else if(a==='date'){engine.selectedDate=button.dataset.date;engine.calendarMode='date';engine.eventLimit=12;engine.render();}
                else if(a==='clear-date'){engine.selectedDate='';engine.calendarMode='all';engine.eventLimit=12;engine.render();}
                else if(a==='today'){engine.selectedDate=undefined;engine.calendarMode='today';engine.monthOffset=0;engine.eventLimit=12;engine.render();}
                else if(a==='undated'){engine.selectedDate='';engine.calendarMode='undated';engine.eventLimit=12;engine.render();}
                else if(a==='more-events'){engine.eventLimit=(engine.eventLimit||12)+12;engine.render();}
                else if(button.dataset.filter){engine.filter=button.dataset.filter;engine.render();}
                else if(button.dataset.tab){engine.tab=button.dataset.tab;engine.filter="すべて";engine.query='';engine.selectedDate=undefined;engine.calendarMode='today';engine.monthOffset=0;engine.eventLimit=12;engine.render(true);}
            });
            engine.panel.addEventListener('input',event=>{
                if(event.target.matches('[data-search]')){
                    const caret=event.target.selectionStart;engine.query=event.target.value;engine.render();
                    const input=engine.panel.querySelector('[data-search]');input.focus();input.setSelectionRange(caret,caret);
                }else if(event.target.matches('[data-segment-title]')){
                    const row=event.target.closest('[data-segment-row]'),body=row?.querySelector('[data-segment]');
                    if(body)body.dataset.title=cleanSegmentTitle(event.target.value);
                }
            });
            engine.panel.addEventListener('change',event=>{
                if(event.target.matches('[data-retries]')){
                    const value=Math.max(1,Math.min(5,Number(event.target.value)||1));
                    engine.config.retryAttempts=value;event.target.value=value;engine.saveConfig();
                    engine.status="モデルごとの最大試行回数を設定："+value+" 回に設定しました";
                    engine.panel.querySelector('footer span').textContent=engine.status;
                }else if(event.target.matches('[data-world-temperature]')){
                    const value=Math.max(0,Math.min(2,Number(event.target.value)||0));
                    engine.config.temperature=value;event.target.value=String(value);engine.saveConfig();
                    engine.status="世界シミュレーションの温度を設定："+value;engine.panel.querySelector('footer span').textContent=engine.status;
                }else if(event.target.matches('[data-fallback-model]')){
                    engine.config.fallbackModel=String(event.target.value||'').trim().slice(0,160);engine.saveConfig();
                    engine.status=engine.config.fallbackModel?"予備モデルを保存しました："+engine.config.fallbackModel:"予備モデルを無効にしました";
                    engine.panel.querySelector('footer span').textContent=engine.status;
                }else if(event.target.matches('[data-doc-import]')){
                    const input=event.target,file=input.files&&input.files[0];if(!file)return;
                    Promise.resolve(file.text()).then(raw=>{
                        const doc=engine.importPromptDocument(raw);
                        engine.status="プリセット文書をインポートしました："+doc.name;engine.render(true);
                    }).catch(e=>{engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}).finally(()=>{input.value='';});
                }
                else if(event.target.matches('[data-dedicated-field]')){
                    const field=event.target.dataset.dedicatedField,value=event.target.value||'';
                    if(['apiUrl','apiKey','model'].includes(field)){
                        engine.setDedicatedApi({[field]:value});
                        engine.status="専用 API 設定を保存しました";engine.panel.querySelector('footer span').textContent=engine.status;
                    }
                }
                else if(event.target.matches('[data-dedicated-preset]')){
                    const name=event.target.value||'';
                    if(name){
                        try{engine.applyDedicatedApiPreset(name);engine.status=" API プリセットを適用しました："+name;engine.render(true);}
                        catch(e){engine.status=e.message;engine.panel.querySelector('footer span').textContent=engine.status;}
                    }
                }
            });
            isolated.appendChild(engine.panel);
            doc.body.appendChild(engine.mount);
                }
    }
    class WorldPanelRenderer {
        constructor(engine){this.engine=engine;}
        statusTone(){
            const engine=this.engine;
            try{
                const tone=engine.host.localStorage.getItem(STATUS_THEME_CONFIG);
                if(WORLD_TONE_KEYS.has(tone))return tone;
            }catch(_){}
            return 'night';
        }
        syncStatusTone(){
            const tone=this.statusTone(),engine=this.engine;
            if(engine.panel)engine.panel.dataset.tone=tone;
            return tone;
        }
        render(force=false) {
            const engine=this.engine;

            if(!engine.isOpen())return;
            let snapshot,state=emptyState(),reason='';
            try{
                snapshot=engine.snapshot();
                snapshot.stat.世界[PATH]=Object.assign(emptyState(),snapshot.stat.世界[PATH]||{});
                normalizeBackendState(snapshot.stat);normalizeEventLayers(snapshot.stat);repairCausalProjection(snapshot.stat);
                state=Object.assign(state,snapshot.stat.世界[PATH]||{});
                reason=engine.blocked(snapshot);
            }catch(e){reason=e.message;}
            const s=snapshot?snapshot.stat:{},w=s.世界||{},orbit=w.因果軌道||{};
            this.syncStatusTone();
            engine.panel.dataset.fontScale=engine.config.fontScale||'standard';
            if(engine.tab==="概要")engine.tab="世界進行";
            const main=engine.panel.querySelector('main'),scroll=main.scrollTop;
            const opened=new Set(Array.from(main.querySelectorAll('details[open]')).map(d=>d.dataset.detail));
            engine.panel.querySelector('footer span').textContent=engine.status;
            const availabilityReason=engine.isConfigured()&&!engine.isAvailable()
                ?(engine.usesDedicatedApi()?"専用 API が未準備です：設定タブで API アドレスを入力し、モデルを選択してください":"主神端末の追加モデルが未準備です：主神端末の設定で API アドレスを設定し、モデルを選択してください")
                :'';
            const runButton=engine.panel.querySelector('[data-action=run]');
            const stopping=engine.busy&&!!engine.controller?.signal.aborted;
            runButton.disabled=engine.busy?(engine.committing||stopping):!!reason||!!availabilityReason;
            runButton.textContent=engine.busy?(engine.committing?'保存中…':stopping?'停止中…':"進行を停止"):"世界を進行";
            runButton.setAttribute('aria-label',runButton.textContent);

            const tabs=[["世界進行",'◈'],['角色管理','♙'],["探索と勢力",'⌖'],['世界事件','▤'],['资产','▣'],["噂",'◎'],["プロンプトプリセット",'✎'],["リクエスト検査",'⌕'],['运行记录','≋','历史记忆'],["設定",'⚙']];
            engine.panel.querySelector('nav').innerHTML='<div class="we-navtitle">世界の記録</div>'+tabs.map(([t,i,label])=>'<button data-tab="'+t+'" aria-selected="'+(engine.tab===t)+'"><span class="we-tab-icon" aria-hidden="true">'+i+'</span>'+escape(uiLabel(label||t))+'</button>').join('');
            if(engine.tab==="プロンプトプリセット"&&main.querySelector('textarea')&&!force)return;
            const text=v=>escape(v==null?'':v);
            const exists=v=>v!==''&&v!=null&&(!Array.isArray(v)||v.length)&&(!plain(v)||Object.keys(v).length);
            const pill=(v,kind='')=>'<span class="we-pill '+kind+'">'+text(uiLabel(v))+'</span>';
            const empty=(title,desc="初回の推演後、根拠のある世界記録がここに表示されます。")=>'<div class="we-empty"><b>'+text(title)+'</b>'+text(desc)+'</div>';
            const value=v=>Array.isArray(v)?(v.every(x=>!plain(x))?'<div class="we-chips">'+v.map(x=>pill(x,'dim')).join('')+'</div>':v.map(x=>'<div class="we-card">'+fields(x)+'</div>').join('')):plain(v)?fields(v):text(v);
            const fields=obj=>'<dl>'+Object.entries(obj||{}).filter(([,v])=>exists(v)).map(([k,v])=>'<dt>'+text(uiLabel(k))+'</dt><dd>'+value(v)+'</dd>').join('')+'</dl>';
            const details=(id,obj,title="完全な記録を表示")=>Object.values(obj).some(exists)?'<details data-detail="'+text(id)+'"'+(opened.has(id)?' open':'')+'><summary>'+text(title)+'</summary>'+fields(obj)+'</details>':'';
            const section=(title,body,hint='')=>'<section class="we-section"><div class="we-section-head"><h2>'+text(uiLabel(title))+'</h2><small>'+text(hint)+'</small></div>'+body+'</section>';
            const entries=obj=>Object.entries(obj||{});
            const parseDate=value=>calendarDate(value,w.暦法);
            const contextKey=JSON.stringify([snapshot?.fingerprint?JSON.parse(snapshot.fingerprint)[0]:null,w.名称]);
            if(engine.calendarContext!==contextKey){engine.calendarContext=contextKey;engine.selectedDate=undefined;engine.calendarMode="today";engine.monthOffset=0;}
            if(engine.selectedDate===undefined||engine.calendarMode==="today")engine.selectedDate=parseDate(w.時間)?.key||"";
            if(engine.calendarMode==='date'){
                const anchor=parseDate(w.時間),selected=parseDate(engine.selectedDate);
                const monthsPerYear=Array.isArray(w.暦法?.月日数)&&w.暦法.月日数.length?w.暦法.月日数.length:12;
                if(anchor&&selected)engine.monthOffset=(selected.y-anchor.y)*monthsPerYear+selected.m-anchor.m;
            }
            const dateLabel=str=>{const d=parseDate(str);return d?d.m+'月'+d.d+'日':str||"時刻の補記待ち";};
            // 稳定阶段与防御强度取自 ⚙️世界因果与法则协议；这里只展示当前阶段。
            const stabilityStages=[
                {min:111,max:120,title:"黄金の祝福 | 安定強化",effects:["世界は外来干渉をほぼ消化し、原生の因果は高強度で収束している","輪廻者への能動的な掃討圧力はないが、外来の力は完全な原生法則に拘束される"]},
                {min:101,max:110,title:"世界の加護 | 安定強化",effects:["因果構造は原初の基準を上回り、秩序と資源の循環は健全化しつつある","世界による輪廻者への能動的な拒絶反応は非常に低い"]},
                {min:100,max:100,title:"原作タイムライン | 安定",effects:["世界は既定の軌跡どおりに運行し、輪廻者を能動的に狙わず、追加の庇護も与えない"]},
                {min:90,max:99,title:"因果の警戒 | 安定",effects:["世界が異常の源を識別し始める","目撃・調査・誤解・敵意が合理的な因果の連鎖に沿って輪廻者へ収束する"]},
                {min:80,max:89,title:"指向性拒絶 | 安定",effects:["隠れ家・計画・連絡相手・資源の連鎖が継続的に圧迫される","圧力は輪廻者本人とその直接の関係網へ優先的に集中する"]},
                {min:70,max:79,title:"因果の追跡 | 弛緩",effects:["原生の強者・組織・主線の衝突が因果の収束によって徐々に輪廻者へ向けられる","拠点・盟友・補給・撤退経路が組織的に破壊され始める"]},
                {min:60,max:69,title:"全面掃討 | 弛緩",effects:["複数の原生勢力がそれぞれの合理的な動機から同時に輪廻者を追跡・封鎖・攻撃しうる","通常の安全な生活はほぼ終わり、一箇所から逃れても追跡から逃れたことにはならない"]},
                {min:50,max:59,title:"世界の兵器化 | 弛緩",effects:["戦争・災害・怪物の奔流・原生の最高位の強者が因果の連鎖によって輪廻者の活動域へ誘導されうる","世界は排除の代償として区域の壊滅と大規模な誤傷を受け入れ始める"]},
                {min:40,max:49,title:"現実の狩猟 | 崩壊",effects:["環境・空間・時間・残存する原生規則のすべてが輪廻者を狩る媒体となりうる","世界は侵入源ごと葬り去るためだけに、永久的な区域壊滅を受け入れる"]},
                {min:30,max:39,title:"生贄の排除 | 崩壊",effects:["世界は免疫の嵐へ入り、掃討はもはや自らの秩序の保護を優先しない","輪廻者の排除と引き換えに、主線の人物・都市・国家ひいては文明構造まで犠牲にしうる"]},
                {min:10,max:29,title:"終焉の狩り | 混乱",effects:["破滅的な事象が輪廻者とその滞在区域へ向けて収束し続ける","長く留まれば災厄を現在地へ招くため、因果を修復するか撤退を続ける必要がある"]},
                {min:1,max:9,title:"共倒れ | 混乱",effects:["世界は自衛を放棄し、法則・タイムライン・現実構造を自ら犠牲にして輪廻者を排除する","残された道は異常の根源を修復するか、世界の死ぬ前に撤退するかのみ"]},
                {min:0,max:0,title:"世界消滅",effects:["因果の連鎖・世界法則・タイムライン・現実構造がすべて停止する","未撤退のすべての実体の生命・意識・魂がまとめて完全に消去される"]}
            ];
            const stabilityDescription=stable=>{
                if(s.設定?.世界超安定===true)return "<p class=\"we-muted\">世界超安定 · 安定値は100に固定<br>新規の因果偏移と能動的な拒絶反応の昇格を禁止</p>";
                if(stable===null)return "<p class=\"we-muted\">世界安定値は未記録</p>";
                const normalized=Math.max(0,Math.min(120,Number(stable)));
                const stage=stabilityStages.find(item=>normalized>=item.min&&normalized<=item.max);
                return stage?'<div class="we-stability-description"><p><b>'+text(stage.title)+'</b></p><ul>'+stage.effects.map(effect=>'<li>'+text(effect)+'</li>').join('')+'</ul></div>':"<p class=\"we-muted\">安定値がプロトコル範囲外</p>";
            };
            const events=sortWorldEvents(state.事件,orbit);
            const active=events.filter(([,e])=>e.状態==="進行中"),future=events.filter(([,e])=>e.状態==="発生待ち");
            const relationRoster=s.関係リスト||{};
            const relationNamesByKey=new Map(entries(relationRoster).map(([name])=>[nameKey(name),name]));
            const peopleAll=new Map(entries(state.人物));entries(relationRoster).forEach(([n,p])=>{if(!peopleAll.has(n))peopleAll.set(n,{状態:p.登場?"登場":"場外",公开动态:p.態度||'',地点:'',目標:'',行动:''});});
            const userName=String(engine.host.SillyTavern?.name1||engine.env.SillyTavern?.name1||engine.host.SillyTavern?.getContext?.()?.name1||engine.host.name1||'').trim();
            const playerAliases=new Set([userName,'{{user}}','<user>',"プレイヤー"].filter(Boolean).map(nameKey));
            const deadAlienAliases=new Set(entries(w.異端レーダー?.名簿).filter(([,alien])=>alien?.状態==='死亡').map(([name])=>nameKey(name)));
            const people=new Map(Array.from(peopleAll).filter(([name])=>!playerAliases.has(nameKey(name))&&!deadAlienAliases.has(nameKey(name))));
            const formalPeople=new Map(entries(relationRoster)
                .filter(([name])=>!playerAliases.has(nameKey(name))&&!deadAlienAliases.has(nameKey(name)))
                .map(([name,rel])=>{
                    const backend=Array.from(people).find(([otherName])=>nameKey(otherName)===nameKey(name))?.[1];
                    return [name,backend||{状態:rel.登場?"登場":"場外",公开动态:rel.態度||'',地点:'',目標:'',行动:''}];
                }));
            const backstagePeople=Array.from(people).filter(([name])=>!relationNamesByKey.has(nameKey(name)));
            const person=(name,p,full=false)=>{
                const profileName=relationNamesByKey.get(nameKey(name))||'';
                const rel=profileName?relationRoster[profileName]||{}:{};
                return '<article class="'+(full?'we-card':'we-person')+'">'+(!full?'<div class="we-avatar">'+text(name.slice(0,1))+'</div>':'')+'<div><div class="we-card-top"><h3>'+text(name)+'</h3>'+pill(p.状態||(rel.登場?"登場":"場外"),'dim')+'</div><p>'+text(p.行动||p.公开动态||rel.態度||"行動記録なし")+'</p><div class="we-meta"><span>⌖ '+text(p.地点||"地点不明")+'</span>'+(p.预计结束?"<span>〜 "+text(dateLabel(p.预计结束))+'</span>':'')+'</div>'+(full?fields({档案类型:profileName?"正式な関係人物":"世界の活動人物",目標:p.目標,当前时间段:[p.开始时间,p.预计结束].filter(Boolean).join(' → '),下次检查:p.下次检查,所属世界:p.所属世界,好感度:rel.好感度})+details('person-'+name,{行程:p.行程,认知:p.认知,认知来源:p.认知来源,登场条件:p.登场条件,关联事件:p.关联事件,更新时间:p.更新时间,人物背景:rel.背景},"行程 · 認知 · 関連イベント"):'')+'</div></article>';
            };
            const compactPerson=(name,p)=>{
                const profileName=relationNamesByKey.get(nameKey(name))||'';
                const rel=profileName?relationRoster[profileName]||{}:{};
                const targetName=profileName||name;
                const inner='<span class="we-avatar">'+text(name.slice(0,1))+'</span><span class="we-person-copy"><strong>'+text(name)+'</strong><small>'+text(p.地点||"地点不明")+'</small><em>'+text(p.行动||p.公开动态||rel.態度||"新しい動向なし")+'</em></span>';
                return '<button class="we-person-compact" data-jump-person="'+text(targetName)+'" title="'+text(profileName?"正式人物の記録を表示":"世界人物の動向を表示；関係リストの記録は作成されません")+'">'+inner+'</button>';
            };
            const contextRows=context=>{
                const rows=[];
                for(const link of context?.背景关联||[])rows.push('<div class="we-context-row"><span class="we-context-kind">'+text(link.タイプ||"関連")+'</span><span class="we-context-copy"><b>'+text(link.名称||"名称未設定の関連")+'</b><small>'+text(link.关系||"継続的な関連")+'</small></span></div>');
                for(const eventName of context?.关联事件||[])rows.push('<button class="we-context-row" data-jump-event="'+text(eventName)+'"><span class="we-context-kind">事件</span><span class="we-context-copy"><b>'+text(eventName)+"</b><small>関連する世界イベントを表示 →</small></span></button>");
                return rows.length?'<div class="we-context-list">'+rows.join('')+'</div>':empty("背景関連なし","世界エンジンは継続的な組織/社交関係とイベント関連のみを記録し、人物の背景設定は重複して扱いません。");
            };
            const sceneLane=(title,items,kind)=>{
                const list=Array.isArray(items)?items:[];
                const body=list.map(item=>{
                    if(kind==='person'){
                        const meta=[item.关系,item.身分,item.档案类型||"世界の人物"].filter(Boolean).join(' · ');
                        const inner='<b>'+text(item.名称)+'</b><small>'+text(meta||"現場タグ")+'</small>'+(item.行动?'<p>'+text(item.行动)+'</p>':'');
                        return item.可查看档案&&item.档案名称
                            ?'<button class="we-scene-item" data-jump-person="'+text(item.档案名称)+'">'+inner+'</button>'
                            :'<article class="we-scene-item we-scene-label">'+inner+'</article>';
                    }
                    if(kind==='group')return '<article class="we-scene-item"><b>'+text(item.名称||"名称未設定の集団")+'</b><small>'+text([item.规模,item.身分].filter(Boolean).join(' · ')||'现场群体')+'</small>'+(item.动态?'<p>'+text(item.动态)+'</p>':'')+'</article>';
                    return '';
                }).join('');
                return '<div class="we-scene-lane"><div class="we-scene-lane-head"><b>'+text(title)+'</b><span>'+list.length+'</span></div>'+(body||"<div class=\"we-muted\">記録なし</div>")+'</div>';
            };
            const sceneContextBody=context=>{
                const hasScene=!!(context&&(context.地区||context.身边人物?.length||context.现场群体?.length));
                if(!hasScene)return empty("周辺の展開なし","人物はまだ利用可能な地区の現場に一致していません；パネルを埋めるために周辺情報を捏造することはありません。");
                const control=[context.控制方?"制圧 · "+context.控制方:'',context.争夺方?.length?"争奪 · "+context.争夺方.join('、'):''].filter(Boolean).join(' · ');
                return "<div class=\"we-scene-hero\"><div class=\"we-scene-head\"><div><small>現在の世界現場</small><h3>"+text(context.地区||"名称未設定の地区")+'</h3></div><small>'+text(control||"制圧関係は未記録")+'</small></div>'+(context.地区动态?'<p>'+text(context.地区动态)+'</p>':'')+(context.环境状态?.length?'<div class="we-chips">'+context.环境状态.map(x=>pill(x,'dim')).join('')+'</div>':'')+'</div><div class="we-scene-grid">'+sceneLane('身边人物',context.身边人物,'person')+sceneLane('现场群体',context.现场群体,'group')+'</div>';
            };
            const areaSceneBody=record=>{
                const groups=Array.isArray(record?.现场群体)?record.现场群体:[];
                if(!groups.length)return '';
                return sceneLane('现场群体',groups,'group');
            };
            const eventTasks=(eventName,event)=>{
                const names=Array.from(new Set((Array.isArray(event.关联任务)?event.关联任务:[]).filter(name=>typeof name==='string'&&name.trim())));
                if(!names.length)return '';
                const roster=s.任務?.リスト||{};
                return "<div class=\"we-event-tasks\"><div class=\"we-meta\"><b>関連任務</b><span>"+names.length+" 件</span></div>"+names.map(name=>{
                    const task=Object.hasOwn(roster,name)&&plain(roster[name])?roster[name]:null;
                    const id='event-task-'+JSON.stringify([eventName,name]);
                    return '<details class="we-event-task" data-detail="'+text(id)+'"'+(opened.has(id)?' open':'')+'><summary><span class="we-task-name">'+text(name)+'</span>'+pill(task?.状態|| (task?"状態未記録":"任務記録なし"),'dim')+'</summary>'
                        +(task?'<p>'+text(task.目標||"目標は未記録")+'</p>'+fields({依頼元:task.依頼元,難易度:task.難易度,納品:task.納品}):"<p class=\"we-muted\">現在の任務リストに該当する任務が見つからないため、イベント内の関連名称を保持します。</p>")+'</details>';
                }).join('')+'</div>';
            };
            const eventCard=(name,e)=>'<article class="we-card" data-event-card="'+text(name)+'"><div class="we-card-top"><h3>'+text(name)+'</h3><div class="we-card-tags">'+pill(e.分类||"直近の節目",e.分类==="大局的な節目"?'future':'dim')+pill(e.状態,e.状態==="発生待ち"?'future':e.状態==="進行中"?'':'dim')+'</div></div><div class="we-meta"><span>◷ '+text(eventScheduleLabel(e))+'</span><span>⌖ '+text(e.地点||"地点不明")+'</span></div><p>'+text(e.公开征兆||e.説明||"明確なイベント内容を待機中")+'</p>'+eventTasks(name,e)+details('event-'+name,{事件描述:e.説明,分类:e.分类,前因:e.前因,触发条件:e.条件,参与者:e.参与者,预计结束:e.预计结束,下次检查:e.下次检查,可见影响:e.可见影响,默认走向:e.默认走向,已确认结果:e.结果,更新时间:e.更新时间},"因果関連とイベント詳細")+'</article>';
            const timelineCards=list=>{
                const groups=[
                    ["現在進行中",list.filter(([,e])=>e.状態==="進行中"||(e.状態==="発生待ち"&&e.分类==='当前事件'))],
                    ["直近の橋渡し",list.filter(([,e])=>e.状態!=="進行中"&&e.状態==="発生待ち"&&e.分类==="直近の節目")],
                    ["マクロアンカー",list.filter(([,e])=>e.状態!=="進行中"&&e.状態==="発生待ち"&&e.分类==="大局的な節目")],
                    ["終了済み",list.filter(([,e])=>["完了","取消済み"].includes(e.状態))]
                ];
                const assigned=new Set(groups.flatMap(([,items])=>items.map(([name])=>name)));
                groups.push(["未分類の記録",list.filter(([name])=>!assigned.has(name))]);
                return groups.filter(([,items])=>items.length).map(([title,items])=>'<div class="we-timeline-group"><div class="we-timeline-group-title">'+text(title)+'<small>'+items.length+'</small></div>'+items.map(([n,e])=>eventCard(n,e)).join('')+'</div>').join('');
            };
            const matched=(name,obj)=>!engine.query||(name+' '+Object.values(obj).filter(v=>typeof v==='string').join(' ')).toLowerCase().includes(engine.query.toLowerCase());
            const calendarCandidates=events.filter(([n,e])=>matched(n,e)&&((engine.filter||"すべて")==="すべて"||e.状態===engine.filter));
            const tools=(filters=[])=>"<div class=\"we-tools\"><input data-search aria-label=\"記録を検索\" placeholder=\"名称・地点・内容を検索…\" value=\""+text(engine.query||'')+'">'+filters.map(f=>'<button data-filter="'+f+'" class="'+((engine.filter||"すべて")===f?'active':'')+'">'+f+'</button>').join('')+'</div>';
            const calendar=()=>{
                const today=parseDate(w.時間);
                if(!today){const semantic=events.filter(([,e])=>!parseDate(e.時間||e.开始时间)&&String(e.時間||e.开始时间||'').trim()).slice(0,12);return "<div class=\"we-calendar\"><h3>作品内タイムライン</h3><p class=\"we-muted\">現在のアンカー · "+text(w.時間||"インスタンス時間なし")+'</p>'+(semantic.length?'<div class="we-timeline">'+semantic.map(([n,e])=>'<p><b>'+text(e.時間||e.开始时间)+'</b><br>'+text(n)+'</p>').join('')+'</div>':"<p class=\"we-muted\">作品内の時間表記を持つイベントはありません</p>")+'</div>';}
                const customMonths=Array.isArray(w.暦法?.月日数)?w.暦法.月日数.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=99).slice(0,24):[];
                let y=today.y,m=today.m+(engine.monthOffset||0),first=0,count=0;
                if(customMonths.length){
                    while(m<1){m+=customMonths.length;y--;}
                    while(m>customMonths.length){m-=customMonths.length;y++;}
                    count=customMonths[m-1];
                }else{
                    const month=new Date(0);month.setFullYear(today.y,today.m-1+(engine.monthOffset||0),1);month.setHours(0,0,0,0);
                    y=month.getFullYear();m=month.getMonth()+1;first=(month.getDay()+6)%7;
                    const last=new Date(month);last.setMonth(last.getMonth()+1,0);count=last.getDate();
                }
                const marked=new Map();
                calendarCandidates.forEach(([,e])=>{const key=parseDate(e.時間||e.开始时间)?.key;if(key)marked.set(key,(marked.get(key)||0)+1);});
                let cells=['一','二','三','四',"金","土",'日'].map(x=>'<span>'+x+'</span>').join('')+'<span></span>'.repeat(first);
                for(let d=1;d<=count;d++){const key=y+'-'+m+'-'+d;cells+='<button data-action="date" data-date="'+key+'" aria-label="'+key+'" aria-pressed="'+(engine.selectedDate===key)+'" title="'+key+' · '+(marked.get(key)||0)+" 件の一致イベント\" class=\""+(today.key===key?'today ':'')+(marked.has(key)?'has-event ':'')+(engine.selectedDate===key?'selected':'')+'">'+d+'</button>';}
                return "<div class=\"we-calendar\"><div class=\"we-calhead\"><button class=\"we-btn\" data-action=\"month\" data-step=\"-1\" aria-label=\"前月\">‹</button><strong>"+y+' 年 '+m+" 月</strong><button class=\"we-btn\" data-action=\"month\" data-step=\"1\" aria-label=\"翌月\">›</button></div><div class=\"we-days\">"+cells+'</div><div class="we-meta"><span>'+text(customMonths.length?(w.暦法?.名称||"作品暦")+" · 今月 "+count+" 日":"グレゴリオ暦表示 · 今月 "+count+" 日")+"</span><span>金枠 · 現在の日付</span><span>緑の点 · 予定済みイベント</span></div></div>";
            };
            const radar=w.異端レーダー||{};
            const alienAlive=entries(radar.名簿).filter(([,a])=>a&&a.状態!=='死亡').length;
            const showRadar=!(s.設定||{}).単一世界&&!(s.システム状態||{}).主神空間滞在中;
            const prose=v=>'<div class="we-reading we-world-laws">'+(Array.isArray(v)?v:[v]).map(paragraph=>'<article><p>'+text(paragraph)+'</p></article>').join('')+'</div>';
            const hero='<div class="we-hero"><div><div class="we-eyebrow">SAMSARA / WORLD ARCHIVE</div><h1>'+text(w.名称&&w.名称!=="初期化待ち"?w.名称:"世界は未構築")+'</h1><div class="we-world-ranks"><span>位格 <b>'+text(w.位格||"未記録")+"</b></span><span>難易度 <b>"+text(w.難易度||"未記録")+'</b></span></div><div class="we-muted">'+text(w.地点||"地点未確認")+' · '+text(orbit.現在段階&&orbit.現在段階!=="初期化待ち"?orbit.現在段階:"章の開始を待機中")+'</div></div><div class="we-date">'+text(w.時間||"インスタンス日付は未確認")+"<small>累計プレイ "+text((s.システム状態||{}).プレイ日数||0)+" 日 · "+(reason?"進行停止中":"インスタンス進行中")+'</small></div></div>';
            let html=hero+(reason?'<div class="we-notice">'+text(reason)+'</div>':'')+(availabilityReason?'<div class="we-notice">'+text(availabilityReason)+'</div>':'');
            if(engine.tab==="世界進行"){
                html+=engine.services.views.render('world',{
                    s,w,orbit,events,active,future,people,calendarCandidates,snapshot,
                    entries,text,empty,section,stabilityDescription,parseDate,calendar,tools,
                    timelineCards,exists,fields,prose,compactPerson
                });
            }else if(engine.tab==='角色管理'){
                html+=engine.services.views.render('people',{
                    s,radar,showRadar,alienAlive,entries,formalPeople,backstagePeople,
                    relationRoster,matched,userName,section,text,pill,fields,contextRows,
                    sceneContextBody,empty,tools,person,exists,value
                });
            }else if(engine.tab==="探索と勢力"){
                html+=engine.services.views.render('exploration',{
                    state,w,events,entries,text,fields,areaSceneBody,exists,details,
                    empty,section,eventCard
                });
            }else if(engine.tab==='资产'){
                html+=engine.services.views.render('assets',{
                    s,w,people,userName,relationNamesByKey,entries,matched,tools,section,text,pill,fields,details,empty
                });
            }else if(engine.tab==='世界事件'){
                html+=engine.services.views.render('events',{
                    events,matched,tools,section,timelineCards,empty
                });
            }else if(engine.tab==="噂"){
                html+=engine.services.views.render('rumors',{
                    s,state,tools,section,entries,matched,text,fields,details,empty,pill
                });
            }else if(engine.tab==='运行记录'){
                html+=engine.services.views.render('history',{
                    state,radar,showRadar,exists,section,text,entries,fields,empty,pill
                });
            }else if(engine.tab==="設定"){
                html+=engine.services.views.render('settings',{section,text});
            }else if(engine.tab==="プロンプトプリセット"){
                html+=engine.services.views.render('prompts',{text,section,empty});
            }else if(engine.tab==="リクエスト検査"){
                html+=engine.services.views.render('requestInspector',{text,section,empty,fields,pill});
            }
            main.innerHTML=html;main.scrollTop=force?0:scroll;
            if(engine.jumpEvent){
                const jumpName=engine.jumpEvent;
                const target=Array.from(main.querySelectorAll('[data-event-card]')).find(el=>el.dataset.eventCard===jumpName);
                if(target){
                    target.classList.add('is-jump');
                    target.scrollIntoView({behavior:'smooth',block:'center'});
                    setTimeout(()=>target.classList.remove('is-jump'),1200);
                }
                engine.jumpEvent='';
            }
                }
    }
    class WorldEditorController {
        constructor(engine){
            this.engine=engine;
            this.editMode=false;
            this.boundPanel=null;
        }
        modeEnabled(){return this.editMode===true;}
        setMode(value){this.editMode=value===true;this.engine.render(true);return this.editMode;}
        toggleMode(){return this.setMode(!this.modeEnabled());}
        section(title){
            const panel=this.engine.panel;if(!panel)return null;
            return Array.from(panel.querySelectorAll('.we-section')).find(section=>String(section.querySelector('.we-section-head h2')?.textContent||'').trim()===String(title||''))||null;
        }
        reportError(error,title="世界進行の編集"){
            const message=String(error?.message||error||"世界進行の記録を編集できませんでした");
            const toast=this.engine.host?.toastr||this.engine.env?.toastr;
            if(toast?.error)toast.error(message,title);else try{console.error('['+title+']',error);}catch(_){}
        }
        escape(value){
            return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }
        textList(value){
            if(Array.isArray(value))return [...new Set(value.map(item=>String(item||'').trim()).filter(Boolean))];
            return [...new Set(String(value||'').split(/[\n,，、;；]+/).map(item=>item.trim()).filter(Boolean))];
        }
        jsonList(value,label="リスト"){
            if(Array.isArray(value))return copy(value);
            const raw=String(value||'').trim();
            if(!raw)return [];
            let parsed;
            try{parsed=JSON.parse(raw);}catch(_){throw new Error(label+"有効な JSON 配列が必要です");}
            if(!Array.isArray(parsed))throw new Error(label+"JSON 配列が必要です");
            return parsed;
        }
        eventSelect(value,options,field){
            return '<select data-world-event-field="'+field+'">'+options.map(option=>'<option value="'+this.escape(option)+'"'+(String(value)===option?' selected':'')+'>'+this.escape(uiLabel(option))+'</option>').join('')+'</select>';
        }

        // ---- 共用编辑模式 ----
        mountModeToggle(){
            const engine=this.engine;
            if(!engine.panel||!["世界進行",'角色管理'].includes(engine.tab))return;
            const title=engine.tab==="世界進行"?"事件のタイムライン":"人物名簿",section=this.section(title),head=section?.querySelector('.we-section-head');
            if(!head||head.querySelector('[data-action="world-edit-mode"]'))return;
            const button=engine.host.document.createElement('button');
            button.type='button';button.className='we-btn we-world-edit-toggle';button.dataset.action='world-edit-mode';
            button.textContent=this.modeEnabled()?"編集を終了":"編集モード";
            button.setAttribute('aria-pressed',String(this.modeEnabled()));
            head.appendChild(button);
        }

        // ---- 事件 ----
        eventInlineHtml(name,record){
            const esc=value=>this.escape(value),list=value=>Array.isArray(value)?value.join('\n'):'',json=value=>JSON.stringify(Array.isArray(value)?value:[],null,2);
            return '<div class="we-world-editor" data-world-event-edit data-world-event-name="'+esc(name)+'"><div class="we-world-editor-grid">'
                +"<label><span>事件名</span><input data-world-event-field=\"name\" value=\""+esc(name)+'"></label>'
                +"<label><span>分類</span>"+this.eventSelect(record?.分类||"直近の節目",['当前事件',"直近の節目","大局的な節目"],'category')+'</label>'
                +"<label><span>状態</span>"+this.eventSelect(record?.状態||"発生待ち",["発生待ち","進行中","完了","取消済み"],'status')+'</label>'
                +'<label><span>地点</span><input data-world-event-field="location" value="'+esc(record?.地点||'')+'"></label>'
                +"<label><span>時刻</span><input data-world-event-field=\"time\" value=\""+esc(record?.時間||'')+'"></label>'
                +"<label><span>開始時刻</span><input data-world-event-field=\"start\" value=\""+esc(record?.开始时间||'')+'"></label>'
                +"<label><span>終了予定</span><input data-world-event-field=\"end\" value=\""+esc(record?.预计结束||'')+'"></label>'
                +"<label><span>次回確認</span><input data-world-event-field=\"nextCheck\" value=\""+esc(record?.下次检查||'')+'"></label>'
                +"<label><span>更新時刻</span><input data-world-event-field=\"updated\" value=\""+esc(record?.更新时间||'')+'"></label>'
                +"<label class=\"we-world-editor-wide\"><span>事件の説明</span><textarea data-world-event-field=\"description\">"+esc(record?.説明||'')+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>公に見える兆候</span><textarea data-world-event-field=\"sign\">"+esc(record?.公开征兆||'')+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>発生条件</span><textarea data-world-event-field=\"condition\">"+esc(record?.条件||'')+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>既定の展開</span><textarea data-world-event-field=\"default\">"+esc(record?.默认走向||'')+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>確定した結果</span><textarea data-world-event-field=\"result\">"+esc(record?.结果||'')+'</textarea></label>'
                +"<label><span>前因（1 行に 1 件）</span><textarea data-world-event-field=\"causes\">"+esc(list(record?.前因))+'</textarea></label>'
                +"<label><span>参加者（1 行に 1 名）</span><textarea data-world-event-field=\"participants\">"+esc(list(record?.参与者))+'</textarea></label>'
                +"<label><span>関連任務（1 行に 1 件）</span><textarea data-world-event-field=\"tasks\">"+esc(list(record?.关联任务))+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>可視的影響（JSON 配列）</span><textarea data-world-event-field=\"impacts\">"+esc(json(record?.可见影响))+'</textarea></label>'
                +'</div><div class="we-world-editor-actions"><button type="button" class="we-world-editor-save" data-action="world-event-save" data-event-name="'+esc(name)+"\">修正を保存</button><button type=\"button\" data-action=\"world-event-cancel\">キャンセル</button></div></div>";
        }
        beginEvent(name,card){
            const record=this.engine.services.events.get(name);if(!record||!card)return false;
            card.innerHTML=this.eventInlineHtml(name,record);card.classList.add('we-world-editing');
            try{card.querySelector('[data-world-event-field="name"]')?.focus?.();}catch(_){}
            return true;
        }
        saveEvent(card,oldName){
            if(!card)return false;
            const value=key=>card.querySelector('[data-world-event-field="'+key+'"]')?.value,current=this.engine.services.events.get(oldName)||{};
            return this.engine.services.events.save(oldName,String(value('name')||'').trim(),{
                ...copy(current),分类:String(value('category')||'').trim(),状態:String(value('status')||'').trim(),
                地点:String(value('location')||'').trim(),時間:String(value('time')||'').trim(),开始时间:String(value('start')||'').trim(),
                预计结束:String(value('end')||'').trim(),下次检查:String(value('nextCheck')||'').trim(),更新时间:String(value('updated')||'').trim(),
                説明:String(value('description')||'').trim(),公开征兆:String(value('sign')||'').trim(),条件:String(value('condition')||'').trim(),
                默认走向:String(value('default')||'').trim(),结果:String(value('result')||'').trim(),
                前因:this.textList(value('causes')),参与者:this.textList(value('participants')),
                关联任务:this.textList(value('tasks')),可见影响:this.jsonList(value('impacts'),'可见影响')
            });
        }
        mountEventControls(){
            const engine=this.engine;
            if(!engine.panel||engine.tab!=="世界進行"||!this.modeEnabled())return;
            for(const card of engine.panel.querySelectorAll('[data-event-card]')){
                if(card.querySelector('.we-world-event-actions')||card.matches('.we-world-editing'))continue;
                const name=String(card.dataset.eventCard||'');if(!name)continue;
                const actions=engine.host.document.createElement('div');actions.className='we-world-event-actions';
                actions.innerHTML='<button type="button" data-action="world-event-edit" data-event-name="'+this.escape(name)+"\">編集</button><button type=\"button\" data-action=\"world-event-delete\" data-event-name=\""+this.escape(name)+"\">削除</button>";
                card.appendChild(actions);
            }
        }
        armEventDelete(button,name){
            const actions=button?.closest?.('.we-world-event-actions');if(!actions)return false;
            button.dataset.action='world-event-delete-confirm';button.textContent="削除の確認";button.classList.add('we-world-editor-danger');
            if(!actions.querySelector('[data-action="world-event-delete-cancel"]')){
                const cancel=this.engine.host.document.createElement('button');cancel.type='button';cancel.dataset.action='world-event-delete-cancel';cancel.dataset.eventName=name;cancel.textContent="キャンセル";actions.appendChild(cancel);
            }
            return true;
        }
        cancelEventDelete(button){
            const actions=button?.closest?.('.we-world-event-actions');if(!actions)return false;
            const confirm=actions.querySelector('[data-action="world-event-delete-confirm"]');
            if(confirm){confirm.dataset.action='world-event-delete';confirm.textContent="削除";confirm.classList.remove('we-world-editor-danger');}
            actions.querySelector('[data-action="world-event-delete-cancel"]')?.remove();return true;
        }

        // ---- 世界人物活动 ----
        personInlineHtml(name,record){
            const esc=value=>this.escape(value),list=value=>Array.isArray(value)?value.join('\n'):'',json=value=>JSON.stringify(Array.isArray(value)?value:[],null,2);
            return '<div class="we-world-editor we-world-person-editor" data-world-person-edit data-world-person-name="'+esc(name)+'">'
                +'<div class="we-world-editor-note"><b>'+esc(name)+"</b><span>世界活動の記録だけを編集します。人物の正式プロフィールはステータス画面で管理します。</span></div><div class=\"we-world-editor-grid\">"
                +'<label><span>所属世界</span><input data-world-person-field="world" value="'+esc(record?.所属世界||'')+'"></label>'
                +"<label><span>状態</span><input data-world-person-field=\"status\" value=\""+esc(record?.状態||'')+'"></label>'
                +'<label><span>地点</span><input data-world-person-field="location" value="'+esc(record?.地点||'')+'"></label>'
                +"<label><span>目標</span><input data-world-person-field=\"goal\" value=\""+esc(record?.目標||'')+'"></label>'
                +"<label class=\"we-world-editor-wide\"><span>現在の行動</span><textarea data-world-person-field=\"action\">"+esc(record?.行动||'')+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>公開動向</span><textarea data-world-person-field=\"public\">"+esc(record?.公开动态||'')+'</textarea></label>'
                +"<label><span>開始時刻</span><input data-world-person-field=\"start\" value=\""+esc(record?.开始时间||'')+'"></label>'
                +"<label><span>終了予定</span><input data-world-person-field=\"end\" value=\""+esc(record?.预计结束||'')+'"></label>'
                +"<label><span>次回確認</span><input data-world-person-field=\"nextCheck\" value=\""+esc(record?.下次检查||'')+'"></label>'
                +"<label><span>更新時刻</span><input data-world-person-field=\"updated\" value=\""+esc(record?.更新时间||'')+'"></label>'
                +"<label class=\"we-world-editor-wide\"><span>登場条件</span><textarea data-world-person-field=\"appearance\">"+esc(record?.登场条件||'')+'</textarea></label>'
                +"<label><span>認識（1 行に 1 件）</span><textarea data-world-person-field=\"knowledge\">"+esc(list(record?.认知))+'</textarea></label>'
                +"<label><span>関連事件（1 行に 1 件）</span><textarea data-world-person-field=\"events\">"+esc(list(record?.关联事件))+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>行程（JSON 配列）</span><textarea data-world-person-field=\"schedule\">"+esc(json(record?.行程))+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>認識の出典（JSON 配列）</span><textarea data-world-person-field=\"knowledgeSources\">"+esc(json(record?.认知来源))+'</textarea></label>'
                +"<label class=\"we-world-editor-wide\"><span>背景の関連情報（JSON 配列）</span><textarea data-world-person-field=\"links\">"+esc(json(record?.背景关联))+'</textarea></label>'
                +'</div><div class="we-world-editor-actions"><button type="button" class="we-world-editor-save" data-action="world-person-save" data-person-name="'+esc(name)+"\">修正を保存</button><button type=\"button\" data-action=\"world-person-cancel\">キャンセル</button></div></div>";
        }
        selectedPersonName(){
            const engine=this.engine;if(!engine.panel||engine.tab!=='角色管理')return '';
            return String(engine.panel.querySelector('.we-roster-person.active')?.dataset?.person||engine.selectedPerson||'').trim();
        }
        beginPerson(name,section){
            const found=this.engine.services.people.get(name);if(!found||!section)return false;
            const head=section.querySelector('.we-section-head');
            Array.from(section.children).forEach(child=>{if(child!==head)child.hidden=true;});
            const holder=this.engine.host.document.createElement('div');holder.innerHTML=this.personInlineHtml(found.name,found.record);
            const node=holder.firstElementChild;section.appendChild(node);
            try{node?.querySelector('[data-world-person-field="location"]')?.focus?.();}catch(_){}
            return true;
        }
        savePerson(section,name){
            const editor=section?.querySelector('[data-world-person-edit]');if(!editor)return false;
            const value=key=>editor.querySelector('[data-world-person-field="'+key+'"]')?.value,found=this.engine.services.people.get(name);if(!found)return false;
            return this.engine.services.people.save(found.name,{
                ...copy(found.record),所属世界:String(value('world')||'').trim(),状態:String(value('status')||'').trim(),
                地点:String(value('location')||'').trim(),目標:String(value('goal')||'').trim(),行动:String(value('action')||'').trim(),
                公开动态:String(value('public')||'').trim(),开始时间:String(value('start')||'').trim(),预计结束:String(value('end')||'').trim(),
                下次检查:String(value('nextCheck')||'').trim(),更新时间:String(value('updated')||'').trim(),登场条件:String(value('appearance')||'').trim(),
                认知:this.textList(value('knowledge')),关联事件:this.textList(value('events')),行程:this.jsonList(value('schedule'),'行程'),
                认知来源:this.jsonList(value('knowledgeSources'),'认知来源'),背景关联:this.jsonList(value('links'),'背景关联')
            });
        }
        mountPersonControls(){
            const engine=this.engine;if(!engine.panel||engine.tab!=='角色管理'||!this.modeEnabled())return;
            const found=this.engine.services.people.get(this.selectedPersonName());if(!found)return;
            const section=this.section("身分と現在の行動"),head=section?.querySelector('.we-section-head');
            if(!section||!head||head.querySelector('.we-world-person-actions'))return;
            const actions=engine.host.document.createElement('span');actions.className='we-world-person-actions';
            actions.innerHTML='<button type="button" data-action="world-person-edit" data-person-name="'+this.escape(found.name)+"\">世界活動を編集</button><button type=\"button\" data-action=\"world-person-delete\" data-person-name=\""+this.escape(found.name)+"\">世界活動の記録を削除</button>";
            head.appendChild(actions);
        }
        armPersonDelete(button,name){
            const actions=button?.closest?.('.we-world-person-actions');if(!actions)return false;
            button.dataset.action='world-person-delete-confirm';button.textContent="世界活動だけを削除する確認";button.classList.add('we-world-editor-danger');
            if(!actions.querySelector('[data-action="world-person-delete-cancel"]')){
                const cancel=this.engine.host.document.createElement('button');cancel.type='button';cancel.dataset.action='world-person-delete-cancel';cancel.dataset.personName=name;cancel.textContent="キャンセル";actions.appendChild(cancel);
            }
            return true;
        }
        cancelPersonDelete(button){
            const actions=button?.closest?.('.we-world-person-actions');if(!actions)return false;
            const confirm=actions.querySelector('[data-action="world-person-delete-confirm"]');
            if(confirm){confirm.dataset.action='world-person-delete';confirm.textContent="世界活動の記録を削除";confirm.classList.remove('we-world-editor-danger');}
            actions.querySelector('[data-action="world-person-delete-cancel"]')?.remove();return true;
        }

        // ---- 因果偏移 ----
        causalInlineHtml(name,record){
            const impact=Number(record?.影響度),esc=value=>this.escape(value);
            return '<div class="we-offset-inline-editor" data-offset-editor data-offset-original-name="'+esc(name)+'"><div class="we-offset-edit-grid">'
                +"<label class=\"we-offset-edit-field\"><span>偏移名</span><input type=\"text\" data-offset-field=\"name\" value=\""+esc(name)+'"></label>'
                +"<label class=\"we-offset-edit-field\"><span>影響度</span><input type=\"number\" min=\"-12\" max=\"15\" step=\"1\" data-offset-field=\"impact\" value=\""+esc(Number.isFinite(impact)?impact:'')+"\"><small>-12~-1 または +1~+15</small></label>"
                +"<label class=\"we-offset-edit-field we-offset-edit-wide\"><span>偏移説明</span><textarea rows=\"4\" data-offset-field=\"description\" placeholder=\"すでに実現した世界規模の長期的変化のみを書く\">"+esc(record?.説明||'')+'</textarea></label>'
                +"<label class=\"we-offset-edit-field we-offset-edit-wide\"><span>引發者</span><input type=\"text\" data-offset-field=\"actor\" value=\""+esc(record?.誘発者||'')+'"></label>'
                +'</div><div class="we-offset-actions we-offset-edit-actions"><button type="button" class="we-offset-save" data-action="causal-offset-save" data-offset-name="'+esc(name)+"\">保存</button><button type=\"button\" data-action=\"causal-offset-cancel\">キャンセル</button></div></div>";
        }
        beginCausal(name,card){
            const record=this.engine.services.causal.get(name);if(!plain(record)||!card)return false;
            card.innerHTML=this.causalInlineHtml(name,record);card.classList.add('we-offset-editing');
            try{const first=card.querySelector('[data-offset-field="name"]');first?.focus?.();first?.select?.();}catch(_){}
            return true;
        }
        saveCausal(card,oldName){
            const value=key=>card?.querySelector('[data-offset-field="'+key+'"]')?.value;
            return this.engine.services.causal.save(oldName,String(value('name')||'').trim(),{
                説明:String(value('description')||'').trim(),誘発者:String(value('actor')||'').trim(),影響度:Number(value('impact'))
            });
        }
        mountCausalControls(){
            const engine=this.engine;if(engine.tab!=="因果記録"||!engine.panel)return;
            const entries=engine.services.causalOverview.offsetEntries(engine.snapshot().stat);
            Array.from(engine.panel.querySelectorAll('.we-offset')).forEach((card,index)=>{
                const name=entries[index]?.[0];if(!name||card.querySelector('.we-offset-actions'))return;
                card.dataset.offsetName=name;
                const actions=engine.host.document.createElement('div');actions.className='we-offset-actions';
                actions.innerHTML='<button type="button" data-action="causal-offset-edit" data-offset-name="'+this.escape(name)+"\">編集</button><button type=\"button\" data-action=\"causal-offset-delete\" data-offset-name=\""+this.escape(name)+"\">削除</button>";
                card.appendChild(actions);
            });
        }
        armCausalDelete(button,name){
            const actions=button?.closest?.('.we-offset-actions');if(!actions)return false;
            button.dataset.action='causal-offset-delete-confirm';button.textContent="削除の確認";button.classList.add('we-offset-delete-confirm');
            if(!actions.querySelector('[data-action="causal-offset-delete-cancel"]')){
                const cancel=this.engine.host.document.createElement('button');cancel.type='button';cancel.dataset.action='causal-offset-delete-cancel';cancel.dataset.offsetName=name;cancel.textContent="キャンセル";actions.appendChild(cancel);
            }
            return true;
        }
        cancelCausalDelete(button){
            const actions=button?.closest?.('.we-offset-actions');if(!actions)return false;
            const confirm=actions.querySelector('[data-action="causal-offset-delete-confirm"]');
            if(confirm){confirm.dataset.action='causal-offset-delete';confirm.textContent="削除";confirm.classList.remove('we-offset-delete-confirm');}
            actions.querySelector('[data-action="causal-offset-delete-cancel"]')?.remove();return true;
        }

        // ---- 历史记忆 ----
        historyInlineHtml(kind,name,record){
            const esc=value=>this.escape(value);
            if(kind==='summary')return '<div class="we-history-inline-editor" data-history-editor="summary" data-history-name="'+esc(name)+'">'
                +'<div class="we-history-edit-title"><b>'+esc(name)+'</b><span>L'+esc(Number(record?.階層)||1)+" · ツリー構造は固定</span></div><div class=\"we-history-edit-grid\">"
                +"<label class=\"we-history-edit-field\"><span>開始時間</span><input type=\"text\" data-history-field=\"start\" value=\""+esc(record?.起始时间||'')+'"></label>'
                +"<label class=\"we-history-edit-field\"><span>終了時間</span><input type=\"text\" data-history-field=\"end\" value=\""+esc(record?.结束时间||'')+'"></label>'
                +"<label class=\"we-history-edit-field we-history-edit-wide\"><span>長期履歴の要約</span><textarea rows=\"5\" data-history-field=\"summary\">"+esc(record?.要約||'')+'</textarea></label>'
                +'</div><div class="we-history-actions"><button type="button" class="we-history-save" data-action="history-summary-save" data-history-name="'+esc(name)+"\">保存</button><button type=\"button\" data-action=\"history-summary-cancel\">キャンセル</button></div></div>";
            return '<div class="we-history-inline-editor" data-history-editor="anchor" data-history-name="'+esc(name)+'">'
                +'<div class="we-history-edit-title"><b>'+esc(name)+"</b><span>最近の履歴の基準点</span></div><div class=\"we-history-edit-grid\">"
                +"<label class=\"we-history-edit-field\"><span>時間</span><input type=\"text\" data-history-field=\"time\" value=\""+esc(record?.時間||'')+'"></label>'
                +"<label class=\"we-history-edit-field we-history-edit-wide\"><span>確定した事実</span><textarea rows=\"4\" data-history-field=\"fact\">"+esc(record?.事实||'')+'</textarea></label>'
                +"<label class=\"we-history-edit-field we-history-edit-wide\"><span>関連イベント</span><input type=\"text\" data-history-field=\"related\" value=\""+esc((Array.isArray(record?.关联事件)?record.关联事件:[]).join('、'))+"\"><small>複数のイベントは 、 またはカンマで区切れます</small></label>"
                +'</div><div class="we-history-actions"><button type="button" class="we-history-save" data-action="history-anchor-save" data-history-name="'+esc(name)+"\">保存</button><button type=\"button\" data-action=\"history-anchor-cancel\">キャンセル</button></div></div>";
        }
        beginHistory(kind,name,card){
            const backend=this.engine.services.history.backend(),record=kind==='summary'?backend?.历史总结?.[name]:backend?.历史?.[name];
            if(!plain(record)||!card)return false;
            card.innerHTML=this.historyInlineHtml(kind,name,record);card.classList.add('we-history-editing');
            try{card.querySelector('textarea,input')?.focus?.();}catch(_){}
            return true;
        }
        saveHistory(kind,card,name){
            const value=key=>card?.querySelector('[data-history-field="'+key+'"]')?.value;
            if(kind==='summary')return this.engine.services.history.saveSummary(name,{起始时间:String(value('start')||'').trim(),结束时间:String(value('end')||'').trim(),要約:String(value('summary')||'').trim()});
            return this.engine.services.history.saveAnchor(name,{時間:String(value('time')||'').trim(),事实:String(value('fact')||'').trim(),关联事件:value('related')});
        }
        mountHistoryControls(){
            const engine=this.engine;if(engine.tab!=='运行记录'||!engine.panel)return;
            const backend=engine.services.history.backend(),memory=projectWorldHistoryMemory(backend);
            const recentNames=Object.entries(memory.近期锚点||{}).reverse().map(([name])=>name),recentSection=this.section("近期歴史アンカー");
            Array.from(recentSection?.querySelectorAll('.we-card')||[]).forEach((card,index)=>{
                const name=recentNames[index];if(!name||card.querySelector('.we-history-actions'))return;
                card.dataset.historyName=name;card.dataset.historyKind='anchor';
                const actions=engine.host.document.createElement('div');actions.className='we-history-actions';
                actions.innerHTML='<button type="button" data-action="history-anchor-edit" data-history-name="'+this.escape(name)+"\">編集</button>";card.appendChild(actions);
            });
            const summaryNames=(memory.长期总结||[]).slice().reverse().map(item=>item.名称),summarySection=this.section("長期歴史総括");
            Array.from(summarySection?.querySelectorAll('.we-card')||[]).forEach((card,index)=>{
                const name=summaryNames[index];if(!name||card.querySelector('.we-history-actions'))return;
                card.dataset.historyName=name;card.dataset.historyKind='summary';
                const actions=engine.host.document.createElement('div');actions.className='we-history-actions';
                actions.innerHTML='<button type="button" data-action="history-summary-edit" data-history-name="'+this.escape(name)+"\">編集</button>";card.appendChild(actions);
            });
        }

        ensureStyles(){
            const engine=this.engine;if(!engine.style||engine.style.textContent.includes('.we-world-editor-actions{'))return;
            engine.style.textContent+='\n'
                +'#sam-world-engine .we-world-edit-toggle{margin-left:auto}'
                +'#sam-world-engine .we-world-event-actions,#sam-world-engine .we-world-editor-actions,#sam-world-engine .we-history-actions,#sam-world-engine .we-offset-actions{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap;margin-top:9px}'
                +'#sam-world-engine .we-world-event-actions button,#sam-world-engine .we-world-editor-actions button,#sam-world-engine .we-history-actions button,#sam-world-engine .we-offset-actions button,#sam-world-engine .we-world-person-actions button{border:1px solid var(--we-line,var(--line));border-radius:7px;background:transparent;color:var(--we-sub,var(--sub));padding:5px 10px;cursor:pointer}'
                +'#sam-world-engine .we-world-editor-danger,#sam-world-engine .we-offset-delete-confirm{color:#ff8c8c!important;border-color:#b85c5c!important}'
                +'#sam-world-engine .we-world-editor-save,#sam-world-engine .we-history-save,#sam-world-engine .we-offset-save{color:var(--we-accent,var(--gold))!important}'
                +'#sam-world-engine .we-world-editor,#sam-world-engine .we-history-inline-editor,#sam-world-engine .we-offset-inline-editor{display:grid;gap:9px}'
                +'#sam-world-engine .we-world-editor-grid,#sam-world-engine .we-history-edit-grid,#sam-world-engine .we-offset-edit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}'
                +'#sam-world-engine .we-world-editor-grid label,#sam-world-engine .we-history-edit-field,#sam-world-engine .we-offset-edit-field{display:grid;gap:4px;min-width:0}'
                +'#sam-world-engine .we-world-editor-grid input,#sam-world-engine .we-world-editor-grid select,#sam-world-engine .we-world-editor-grid textarea,#sam-world-engine .we-history-edit-field input,#sam-world-engine .we-history-edit-field textarea,#sam-world-engine .we-offset-edit-field input,#sam-world-engine .we-offset-edit-field textarea{width:100%;border:1px solid var(--we-line,var(--line));border-radius:7px;background:var(--we-surface,#111923);color:var(--we-ink,var(--ink));padding:7px 9px}'
                +'#sam-world-engine .we-offset-edit-field textarea{height:92px!important;min-height:80px!important;max-height:180px!important;resize:vertical;line-height:1.55}'
                +'#sam-world-engine .we-history-edit-field textarea,#sam-world-engine .we-world-editor-grid textarea{min-height:78px!important;max-height:240px!important;resize:vertical;line-height:1.5}'
                +'#sam-world-engine .we-world-editor-wide,#sam-world-engine .we-history-edit-wide,#sam-world-engine .we-offset-edit-wide{grid-column:1/-1}'
                +'#sam-world-engine .we-world-person-actions{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}'
                +'#sam-world-engine .we-world-editor-note,#sam-world-engine .we-history-edit-title{display:flex;justify-content:space-between;gap:10px;align-items:center}'
                +'@media(max-width:680px){#sam-world-engine .we-world-editor-grid,#sam-world-engine .we-history-edit-grid,#sam-world-engine .we-offset-edit-grid{grid-template-columns:1fr}#sam-world-engine .we-world-editor-wide,#sam-world-engine .we-history-edit-wide,#sam-world-engine .we-offset-edit-wide{grid-column:auto}}';
        }

        bindPanel(){
            const panel=this.engine.panel;if(!panel||this.boundPanel===panel)return;
            this.boundPanel=panel;
            panel.addEventListener('click',event=>{
                const button=event.target?.closest?.('[data-action="world-edit-mode"],[data-action^="world-event-"],[data-action^="world-person-"],[data-action^="causal-offset-"],[data-action^="history-anchor-"],[data-action^="history-summary-"]');
                if(!button||!panel.contains(button))return;
                const action=String(button.dataset.action||'');
                if(action==='world-edit-mode'){event.preventDefault();event.stopPropagation();this.toggleMode();return;}
                let task=null;
                if(action.startsWith('world-event-')){
                    event.preventDefault();event.stopPropagation();
                    const card=button.closest('[data-event-card]'),name=String(button.dataset.eventName||card?.dataset?.eventCard||card?.querySelector?.('[data-world-event-edit]')?.dataset?.worldEventName||'');
                    if(action==='world-event-edit')this.beginEvent(name,card);
                    else if(action==='world-event-save')task=this.saveEvent(card,name);
                    else if(action==='world-event-cancel')this.engine.render(true);
                    else if(action==='world-event-delete')this.armEventDelete(button,name);
                    else if(action==='world-event-delete-confirm')task=this.engine.services.events.remove(name);
                    else if(action==='world-event-delete-cancel')this.cancelEventDelete(button);
                }else if(action.startsWith('world-person-')){
                    event.preventDefault();event.stopPropagation();
                    const section=this.section("身分と現在の行動"),name=String(button.dataset.personName||section?.querySelector?.('[data-world-person-edit]')?.dataset?.worldPersonName||'');
                    if(action==='world-person-edit')this.beginPerson(name,section);
                    else if(action==='world-person-save')task=this.savePerson(section,name);
                    else if(action==='world-person-cancel')this.engine.render(true);
                    else if(action==='world-person-delete')this.armPersonDelete(button,name);
                    else if(action==='world-person-delete-confirm')task=this.engine.services.people.remove(name);
                    else if(action==='world-person-delete-cancel')this.cancelPersonDelete(button);
                }else if(action.startsWith('causal-offset-')){
                    event.preventDefault();event.stopPropagation();
                    const card=button.closest('.we-offset'),name=String(button.dataset.offsetName||card?.dataset?.offsetName||card?.querySelector?.('[data-offset-editor]')?.dataset?.offsetOriginalName||'');
                    if(action==='causal-offset-edit')this.beginCausal(name,card);
                    else if(action==='causal-offset-save')task=this.saveCausal(card,name);
                    else if(action==='causal-offset-cancel')this.engine.render(true);
                    else if(action==='causal-offset-delete')this.armCausalDelete(button,name);
                    else if(action==='causal-offset-delete-confirm')task=this.engine.services.causal.remove(name);
                    else if(action==='causal-offset-delete-cancel')this.cancelCausalDelete(button);
                }else if(action.startsWith('history-anchor-')||action.startsWith('history-summary-')){
                    event.preventDefault();event.stopPropagation();
                    const card=button.closest('.we-card'),name=String(button.dataset.historyName||card?.dataset?.historyName||card?.querySelector?.('[data-history-editor]')?.dataset?.historyName||'');
                    if(action==='history-anchor-edit')this.beginHistory('anchor',name,card);
                    else if(action==='history-summary-edit')this.beginHistory('summary',name,card);
                    else if(action==='history-anchor-save')task=this.saveHistory('anchor',card,name);
                    else if(action==='history-summary-save')task=this.saveHistory('summary',card,name);
                    else if(action.endsWith('-cancel'))this.engine.render(true);
                }
                if(task)Promise.resolve(task).catch(error=>this.reportError(error,action.startsWith('history-')?'历史记忆':action.startsWith('causal-')?"因果変動":action.startsWith('world-person-')?"世界の人物":'世界事件'));
            });
        }
        afterRender(){
            this.ensureStyles();this.mountModeToggle();this.mountEventControls();this.mountPersonControls();this.mountCausalControls();this.mountHistoryControls();
        }
        dispose(){this.boundPanel=null;}
    }
    class WorldApiPresetController {
        constructor(engine){
            this.engine=engine;
            this.selection='';
            this.boundPanel=null;
        }
        afterApply(name,result){
            this.selection=String(name||'').trim();
            return result;
        }
        afterSave(entry){
            this.selection=String(entry?.name||'');
            return entry;
        }
        afterDelete(name,deleted){
            const selected=String(name||'').trim();
            if(deleted&&this.selection===selected)this.selection='';
            return deleted;
        }
        bindPanel(){
            const panel=this.engine.panel;
            if(!panel||this.boundPanel===panel)return;
            this.boundPanel=panel;
            panel.addEventListener('change',event=>{
                const select=event.target?.closest?.('[data-dedicated-preset]');
                if(!select||!panel.contains(select))return;
                this.selection=String(select.value||'');
                const remove=panel.querySelector?.('[data-action="dedicated-preset-delete"]');
                if(remove)remove.disabled=!this.selection;
            },true);
        }
        sync(){
            const engine=this.engine;
            if(engine.tab!=="設定"||!engine.panel)return;
            const select=engine.panel.querySelector?.('[data-dedicated-preset]');
            const remove=engine.panel.querySelector?.('[data-action="dedicated-preset-delete"]');
            if(!select)return;
            const wanted=String(this.selection||''),options=Array.from(select.options||[]);
            if(wanted&&options.some(option=>String(option.value)===wanted))select.value=wanted;
            else{
                select.value='';
                if(wanted)this.selection='';
            }
            if(remove)remove.disabled=!String(select.value||'');
        }
        afterRender(){this.sync();}
        dispose(){this.boundPanel=null;}
    }
    const CAUSAL_OVERVIEW_LIMIT=3;
    const WORLD_ENGINE_HIDDEN_PLAYER_TABS=new Set(['资产',"噂"]);

    class WorldCausalOverviewController {
        constructor(engine){this.engine=engine;}
        static isPlayerTabHidden(tab){return WORLD_ENGINE_HIDDEN_PLAYER_TABS.has(String(tab||''));}
        static offsetEntries(stat){
            const bucket=stat?.世界?.因果軌道?.偏移記録;
            return Object.entries(plain(bucket)?bucket:{}).slice().reverse();
        }
        static latestOffsets(stat,limit=CAUSAL_OVERVIEW_LIMIT){
            return this.offsetEntries(stat).slice(0,Math.max(0,Number(limit)||0));
        }
        static impactLabel(value){
            const n=Number(value);
            return Number.isFinite(n)?(n>0?'+':'')+n:"影響未記録";
        }
        static escape(value){
            return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }
        static interferenceMode(stat){return String(stat?.世界?.異端レーダー?.現在モード||'').trim();}
        static compactHtml(stat){
            const world=stat?.世界||{},offsets=this.offsetEntries(stat),latest=offsets.slice(0,CAUSAL_OVERVIEW_LIMIT);
            const stable=world.安定!==null&&world.安定!==''&&Number.isFinite(Number(world.安定))?Number(world.安定):null;
            const rows=latest.map(([name,record])=>"<button class=\"we-causal-jump\" data-tab=\"因果記録\"><span><b>"+this.escape(name)+'</b><small>'+this.escape(record?.誘発者||"引發者未記録")+'</small></span><strong>'+this.escape(this.impactLabel(record?.影響度))+'</strong><p>'+this.escape(record?.説明||"変動の説明なし")+'</p></button>').join('');
            return "<div class=\"we-causal-summary\"><button class=\"we-stability-compact\" data-tab=\"因果档案\"><span><small>世界安定値</small><strong>"+this.escape(stable===null?"未記録":stable)+"</strong></span><em>因果記録を開く →</em></button>"
                +(rows?'<div class="we-causal-latest">'+rows+'</div>':"<div class=\"we-empty\"><b>因果偏移はまだありません</b><small>重大かつ確認済みの因果変化がここに記録されます。</small></div>")
                +"<button class=\"we-link-btn\" data-tab=\"因果档案\">全 "+offsets.length+" 件の偏移・ストーリーラインと世界法則を見る →</button></div>";
        }
        static archiveHtml(stat){
            const world=stat?.世界||{},orbit=world.因果軌道||{},offsets=this.offsetEntries(stat),stable=world.安定!==null&&world.安定!==''&&Number.isFinite(Number(world.安定))?Number(world.安定):null;
            const offsetCard=([name,record])=>'<article class="we-offset"><div class="we-offset-head"><b>'+this.escape(name)+'</b><span>'+this.escape(this.impactLabel(record?.影響度))+'</span></div><p>'+this.escape(record?.説明||"変動の説明なし")+"</p><small>原因となった人物 · "+this.escape(record?.誘発者||"未記録")+'</small></article>';
            const recent=offsets.slice(0,12),older=offsets.slice(12);
            const laws=Array.isArray(world.法則)?world.法則:(world.法則?[world.法則]:[]);
            const money=world.通貨||{},interference=this.interferenceMode(stat);
            const story="<article class=\"we-card we-causal-track\"><dl><dt>現在の段階</dt><dd>"+this.escape(orbit.現在段階||"初期化待ち")+"</dd><dt>ストーリーライン</dt><dd>"+this.escape(orbit.ストーリーライン||"未記録")+"</dd><dt>次のノード</dt><dd>"+this.escape(orbit.次ノード||"未記録")+'</dd></dl></article>';
            const stability="<div class=\"we-causal\"><div class=\"we-stability\"><div><small>世界安定値</small><strong data-world-stability>"+this.escape(stable===null?"未記録":stable)+"</strong></div><span>完全な偏移は因果記憶として保持され、メインパネルには最新 "+CAUSAL_OVERVIEW_LIMIT+" 件</span></div>"
                +(stable===null?'':'<meter min="0" max="120" value="'+Math.max(0,Math.min(120,stable))+"\" aria-label=\"世界安定値\">"+stable+'</meter>')
                +'</div>';
            const offsetList=recent.length?recent.map(offsetCard).join(''):"<div class=\"we-empty\"><b>因果偏移はまだありません</b><small>記録が作られるのは、発生済みの重大かつ不可逆な結果のみです。</small></div>";
            const olderHtml=older.length?"<details class=\"we-offset-more\"><summary>さらに古い "+older.length+" 件の変動</summary>"+older.map(offsetCard).join('')+'</details>':'';
            const interferenceHtml=interference?"<section class=\"we-section we-causal-interference\"><div class=\"we-section-head\"><h2>干渉モード</h2><small>インスタンス干渉状況</small></div><article class=\"we-card\"><p>"+this.escape(interference)+'</p></article></section>':'';
            const moneyHtml="<article class=\"we-card\"><dl><dt>通貨体系</dt><dd>"+this.escape(money.体系||"未記録")+"</dd><dt>購買力基準</dt><dd>"+this.escape(money.購買力基準||"未記録")+"</dd><dt>経済変動</dt><dd>"+this.escape(money.経済変動||"未記録")+'</dd></dl></article>';
            const lawHtml=laws.length?'<div class="we-reading we-world-laws">'+laws.map(item=>'<article><p>'+this.escape(item)+'</p></article>').join('')+'</div>':"<div class=\"we-empty\"><b>世界法則はまだありません</b><small>明確に有効な法則がここで保守されます。</small></div>";
            return "<div class=\"we-causal-archive-grid\"><div><section class=\"we-section\"><div class=\"we-section-head\"><h2>因果偏移アーカイブ</h2><small>"+offsets.length+" 件 · 新しい順</small></div>"+stability+offsetList+olderHtml+"</section></div><aside><section class=\"we-section\"><div class=\"we-section-head\"><h2>因果軌道</h2><small>長期的な方向</small></div>"+story+'</section>'+interferenceHtml+"<section class=\"we-section\"><div class=\"we-section-head\"><h2>通貨と経済</h2><small>世界進行が保守</small></div>"+moneyHtml+"</section><section class=\"we-section\"><div class=\"we-section-head\"><h2>世界法則</h2><small>"+laws.length+" 件</small></div>"+lawHtml+'</section></aside></div>';
        }
        static sectionByTitle(root,title){
            return Array.from(root?.querySelectorAll?.('.we-section')||[]).find(section=>section.querySelector('.we-section-head h2')?.textContent?.trim()===title)||null;
        }
        isPlayerTabHidden(tab){return this.constructor.isPlayerTabHidden(tab);}
        offsetEntries(stat){return this.constructor.offsetEntries(stat);}
        latestOffsets(stat,limit=CAUSAL_OVERVIEW_LIMIT){return this.constructor.latestOffsets(stat,limit);}
        interferenceMode(stat){return this.constructor.interferenceMode(stat);}
        compactHtml(stat){return this.constructor.compactHtml(stat);}
        archiveHtml(stat){return this.constructor.archiveHtml(stat);}
        sectionByTitle(root,title){return this.constructor.sectionByTitle(root,title);}
        beforeRender(){
            if(this.isPlayerTabHidden(this.engine.tab))this.engine.tab="世界進行";
        }
        ensureStyles(){
            const engine=this.engine;
            if(!engine.style||engine.style.textContent.includes('.we-causal-summary{'))return;
            engine.style.textContent+='\n#sam-world-engine .we-causal-summary{display:grid;gap:9px}#sam-world-engine .we-stability-compact,#sam-world-engine .we-causal-jump{width:100%;border:1px solid var(--we-line,var(--line));border-radius:10px;background:var(--we-card,#18222f);color:var(--we-ink,var(--ink));text-align:left}#sam-world-engine .we-stability-compact{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px}#sam-world-engine .we-stability-compact span{display:flex;align-items:baseline;gap:9px}#sam-world-engine .we-stability-compact small{color:var(--we-sub,var(--sub));font-size:var(--we-fs-tiny,11px)}#sam-world-engine .we-stability-compact strong{font-size:22px}#sam-world-engine .we-stability-compact em{font-style:normal;color:var(--we-gold,var(--gold));font-size:var(--we-fs-tiny,11px)}#sam-world-engine .we-causal-latest{display:grid;gap:6px}#sam-world-engine .we-causal-jump{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 9px;padding:9px 10px}#sam-world-engine .we-causal-jump:hover,#sam-world-engine .we-stability-compact:hover{background:var(--we-card-hover,#1d2a39)}#sam-world-engine .we-causal-jump span{min-width:0}#sam-world-engine .we-causal-jump b,#sam-world-engine .we-causal-jump small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#sam-world-engine .we-causal-jump small{margin-top:1px;color:var(--we-sub,var(--sub));font-size:var(--we-fs-tiny,11px)}#sam-world-engine .we-causal-jump strong{color:var(--we-gold,var(--gold));font-size:12px}#sam-world-engine .we-causal-jump p{grid-column:1/-1;margin:2px 0 0!important;color:var(--we-sub,var(--sub))!important;font-size:var(--we-fs-small,12px)!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#sam-world-engine .we-causal-archive-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,1fr);gap:23px;align-items:start;margin-top:22px}#sam-world-engine .we-causal-track dl{grid-template-columns:76px minmax(0,1fr)}@media(max-width:900px){#sam-world-engine .we-causal-archive-grid{grid-template-columns:1fr}}';
        }
        ensureArchiveTab(){
            const engine=this.engine,nav=engine.panel?.querySelector?.('nav');if(!nav)return;
            let button=nav.querySelector("[data-tab=\"因果記録\"]");
            if(!button){
                button=engine.host.document.createElement('button');button.dataset.tab="因果記録";button.innerHTML="<span class=\"we-tab-icon\" aria-hidden=\"true\">◇</span>因果記録";
                const worldButton=nav.querySelector("[data-tab=\"世界進行\"]");
                if(worldButton)worldButton.insertAdjacentElement('afterend',button);else nav.appendChild(button);
            }
            for(const item of nav.querySelectorAll('[data-tab]'))item.setAttribute('aria-selected',String(item.dataset.tab===engine.tab));
        }
        hideRedundantPlayerModules(){
            const nav=this.engine.panel?.querySelector?.('nav');if(!nav)return;
            for(const tab of WORLD_ENGINE_HIDDEN_PLAYER_TABS)nav.querySelector('[data-tab="'+tab+'"]')?.remove();
        }
        compactWorldOverview(){
            const engine=this.engine,main=engine.panel?.querySelector?.('main');if(!main)return;
            const stat=engine.snapshot().stat,causal=this.sectionByTitle(main,"因果状態");
            main.querySelector('.we-kpi-grid.we-kpi-compact')?.remove();
            if(causal){
                const head=causal.querySelector('.we-section-head');
                if(head){
                    const h=head.querySelector('h2'),small=head.querySelector('small');
                    if(h)h.textContent="因果サマリー";
                    if(small)small.textContent='最新 '+Math.min(CAUSAL_OVERVIEW_LIMIT,this.offsetEntries(stat).length)+" 件 · クリックでアーカイブへ";
                }
                Array.from(causal.children).filter(child=>child!==head).forEach(child=>child.remove());
                causal.insertAdjacentHTML('beforeend',this.compactHtml(stat));
            }
            for(const title of ["通貨と経済","世界法則"])this.sectionByTitle(main,title)?.remove();
        }
        removeRunRecordInterference(){
            const main=this.engine.panel?.querySelector?.('main');if(!main)return;
            this.sectionByTitle(main,"干渉モード")?.remove();
        }
        renderArchive(){
            const engine=this.engine,main=engine.panel?.querySelector?.('main');if(!main)return;
            main.insertAdjacentHTML('beforeend',this.archiveHtml(engine.snapshot().stat));
        }
        afterRender(){
            const engine=this.engine;
            if(!engine.panel)return;
            this.ensureStyles();
            this.ensureArchiveTab();
            this.hideRedundantPlayerModules();
            if(engine.tab==="世界進行")this.compactWorldOverview();
            else if(engine.tab==="因果記録")this.renderArchive();
            else if(engine.tab==='运行记录')this.removeRunRecordInterference();
        }
    }


    function isWorldEnginePlayerTabHidden(tab){return WorldCausalOverviewController.isPlayerTabHidden(tab);}
    function causalOffsetEntries(stat){return WorldCausalOverviewController.offsetEntries(stat);}
    function latestCausalOffsets(stat,limit=CAUSAL_OVERVIEW_LIMIT){return WorldCausalOverviewController.latestOffsets(stat,limit);}
    function causalImpactLabel(value){return WorldCausalOverviewController.impactLabel(value);}
    function causalOverviewEscape(value){return WorldCausalOverviewController.escape(value);}
    function causalInterferenceMode(stat){return WorldCausalOverviewController.interferenceMode(stat);}
    function causalCompactHtml(stat){return WorldCausalOverviewController.compactHtml(stat);}
    function causalArchiveHtml(stat){return WorldCausalOverviewController.archiveHtml(stat);}
    function causalSectionByTitle(root,title){return WorldCausalOverviewController.sectionByTitle(root,title);}
    class WorldEngineFeatureRegistry {
        constructor(engine){
            this.engine=engine;
            this.items=new Map();
        }
        register(key,feature){
            if(!key||!feature)throw new Error("世界進行の Feature 登録が無効です");
            this.items.set(String(key),feature);
            return feature;
        }
        get(key){return this.items.get(String(key))||null;}
        initialize(){
            for(const feature of this.items.values())feature.initialize?.();
            return this;
        }
        afterInit(result){
            for(const feature of this.items.values())feature.afterInit?.(result);
            return result;
        }
        bindPanel(){
            for(const feature of this.items.values())feature.bindPanel?.();
        }
        beforeRender(force){
            for(const feature of this.items.values())feature.beforeRender?.(force);
        }
        afterRender(force,result){
            for(const feature of this.items.values())feature.afterRender?.(force,result);
        }
        async afterBuildRequest(request,base){
            let current=request;
            for(const feature of this.items.values()){
                if(typeof feature.afterBuildRequest!=='function')continue;
                current=await feature.afterBuildRequest(current,base)||current;
            }
            return current;
        }
        async afterCatalogue(catalogue){
            let current=catalogue;
            for(const feature of this.items.values()){
                if(typeof feature.afterCatalogue!=='function')continue;
                current=await feature.afterCatalogue(current)||current;
            }
            return current;
        }
        async run(next,options={}){
            let runner=next;
            for(const feature of Array.from(this.items.values()).reverse()){
                if(typeof feature.aroundRun!=='function')continue;
                const downstream=runner;
                runner=()=>feature.aroundRun(downstream,options);
            }
            return runner();
        }
        dispose(){
            for(const feature of this.items.values())feature.dispose?.();
            this.items.clear();
        }
        describe(){
            return Array.from(this.items,([key,feature])=>({key,className:feature.constructor?.name||'UnknownFeature'}));
        }
    }
    class WorldEngineServiceContainer {
        constructor(engine){
            this.engine=engine;
            this.hostAdapter=engine.hostAdapter;
            this.configuration=engine.configService;
            this.runScheduler=engine._runScheduler||new WorldRunScheduler(engine);
            engine._runScheduler=this.runScheduler;
            this.applicationLifecycle=new WorldEngineLifecycleController(engine);
            this.context=new WorldRuntimeContextService(engine);
            this.knowledgeSelection=new WorldKnowledgeSelectionPolicy();
            ACTIVE_WORLD_KNOWLEDGE_SELECTION_POLICY=this.knowledgeSelection;
            this.knowledge=new WorldKnowledgeService(engine,this.knowledgeSelection);
            this.tokenTelemetry=new WorldTokenTelemetry();
            ACTIVE_WORLD_TOKEN_TELEMETRY=this.tokenTelemetry;
            this.proseExtractor=new WorldProseExtractor();
            ACTIVE_WORLD_PROSE_EXTRACTOR=this.proseExtractor;
            this.requestBuilder=new WorldRequestBuilder(engine,this.proseExtractor,this.tokenTelemetry);
            this.stateFactory=new WorldStateFactory();
            this.taskLedger=new WorldTaskAwarenessService();
            this.historyMemory=new WorldHistoryMemoryPolicy();
            ACTIVE_WORLD_HISTORY_MEMORY_POLICY=this.historyMemory;
            this.history=new WorldHistoryService(engine,this.historyMemory);
            this.stateProjector=new WorldStateProjector(engine,this.taskLedger,this.history);
            ACTIVE_WORLD_STATE_PROJECTOR=this.stateProjector;
            this.patchPolicy=new WorldPatchPolicy();
            ACTIVE_WORLD_PATCH_POLICY=this.patchPolicy;
            this.timePolicy=new WorldTimePolicy();
            ACTIVE_WORLD_TIME_POLICY=this.timePolicy;
            this.dueEventPolicy=new WorldDueEventPolicy(this.timePolicy);
            this.activityPolicy=new WorldActivityPolicy();
            this.timelinePolicy=new WorldTimelinePolicy(this.timePolicy);
            ACTIVE_WORLD_TIMELINE_POLICY=this.timelinePolicy;
            this.softMaintenancePolicy=new WorldSoftMaintenancePolicy(this.timelinePolicy);
            ACTIVE_WORLD_SOFT_MAINTENANCE_POLICY=this.softMaintenancePolicy;
            this.chronologyPolicy=new WorldChronologyPolicy();
            this.lifecycle=new WorldLifecycleService();
            ACTIVE_WORLD_LIFECYCLE_SERVICE=this.lifecycle;
            this.people=new WorldPersonActivityService(engine,this.timePolicy);
            ACTIVE_WORLD_PERSON_ACTIVITY_SERVICE=this.people;
            this.npcAudit=new WorldNpcAuditService();
            ACTIVE_WORLD_NPC_AUDIT_SERVICE=this.npcAudit;
            this.stateNormalizer=new WorldStateNormalizer();
            ACTIVE_WORLD_STATE_NORMALIZER=this.stateNormalizer;
            this.causal=new WorldCausalService(engine,this.patchPolicy);
            ACTIVE_WORLD_CAUSAL_SERVICE=this.causal;
            this.resultContract=WORLD_RESULT_CONTRACT;
            this.resultNormalizer=new WorldResultNormalizer();
            this.relationSync=new WorldRelationSyncPolicy();
            this.assetMaterialization=new WorldAssetMaterializationPolicy();
            this.exploration=new WorldExplorationService(engine);
            ACTIVE_WORLD_EXPLORATION_SERVICE=this.exploration;
            this.rumor=new WorldRumorService(engine);
            this.resultPatchCompilation=new WorldResultPatchCompilationService(
                this.resultNormalizer,
                this.exploration,
                this.causal,
                this.patchPolicy,
                this.npcAudit,
                this.people,
                this.taskLedger,
                this.chronologyPolicy,
                this.timePolicy,
                this.relationSync,
                this.assetMaterialization
            );
            this.stateIntegrity=new WorldStateIntegrityPolicy(this.patchPolicy,this.timePolicy,this.rumor);
            this.patchApplication=new WorldPatchApplicationService(this.patchPolicy,this.stateNormalizer,this.timelinePolicy,this.stateIntegrity,this.relationSync,this.rumor);
            this.stateMaterialization=new WorldStateMaterializationService(
                this.stateFactory,
                this.stateNormalizer,
                this.lifecycle,
                this.patchPolicy,
                this.patchApplication,
                this.exploration,
                this.causal,
                this.stateIntegrity
            );
            this.resultMaterializer=new WorldResultMaterializer(this.resultPatchCompilation,this.stateMaterialization);
            ACTIVE_WORLD_RESULT_MATERIALIZER=this.resultMaterializer;
            this.retryGuidance=new WorldRetryGuidanceService(engine);
            this.resultStaging=new WorldResultStagingService(this.resultNormalizer,this.resultMaterializer,this.chronologyPolicy,this.retryGuidance,this.rumor);
            ACTIVE_WORLD_RESULT_STAGING=this.resultStaging;
            this.resultParser=new WorldResultReplyParser();
            ACTIVE_WORLD_RESULT_REPLY_PARSER=this.resultParser;
            this.compiler=new WorldResultCompiler(engine,this.resultNormalizer,this.resultMaterializer,this.resultStaging,this.patchPolicy);
            this.validationPolicy=new WorldValidationPolicy(this.timelinePolicy,this.dueEventPolicy,this.activityPolicy,this.softMaintenancePolicy);
            ACTIVE_WORLD_VALIDATION_POLICY=this.validationPolicy;
            this.validation=new WorldValidationService(engine,this.validationPolicy,this.npcAudit);
            this.commit=new WorldCommitService(engine);
            this.mutations=new WorldMutationService(engine);
            this.snapshots=new WorldSnapshotService(engine,this.mutations);
            this.events=new WorldEventService(engine);
            this.requests=new WorldRequestService(engine);
            ACTIVE_WORLD_REQUEST_SERVICE=this.requests;
            this.transport=engine._apiTransport||new WorldApiTransportService(engine,this.tokenTelemetry);
            this.transport.telemetry=this.tokenTelemetry;
            engine._apiTransport=this.transport;
            this.promptDocuments=engine._promptDocuments||new WorldPromptDocumentService(engine);
            engine._promptDocuments=this.promptDocuments;
            this.run=engine._runOrchestrator||new WorldRunOrchestrator(engine);
            engine._runOrchestrator=this.run;
            this.autoProgress=new WorldAutoProgressController(engine);
            this.replay=new WorldReplayService(engine);
            this.timeOwnership=new WorldTimeOwnershipFeature(engine,this.timePolicy);
            this.npcAuditPolicy=new WorldNpcAuditPolicy(engine,this.knowledgeSelection);
            this.historyLifecycle=new WorldHistoryLifecycle(engine,this.historyMemory);
            this.views=new WorldEngineViewRegistry(engine);
            this.prompts=new WorldPromptRegistry(engine);
            this.promptIntegration=new WorldPromptIntegrationService(engine,this.prompts,this.tokenTelemetry);
            this.panelController=new WorldPanelController(engine);
            this.panelRenderer=new WorldPanelRenderer(engine);
            this.editorController=new WorldEditorController(engine);
            this.features=new WorldEngineFeatureRegistry(engine);
            this.apiPreset=new WorldApiPresetController(engine);
            this.causalOverview=new WorldCausalOverviewController(engine);
            this.npcAuditPrompt=new WorldNpcAuditPromptFeature(engine);
            this.softMaintenance=new WorldSoftMaintenanceFeature(engine);
            this.integrityRequest=new WorldIntegrityRequestFeature(engine);
            this.worldActivityRequest=new WorldActivityRequestFeature(engine,this.activityPolicy);
            this.dueEvent=new WorldDueEventFeature(engine,this.dueEventPolicy);
            this.taskAwareness=new WorldTaskAwarenessFeature(engine,this.taskLedger,this.knowledgeSelection);
            this.chronology=new WorldChronologyFeature(engine,this.chronologyPolicy,this.knowledgeSelection);
            this.rumorRequest=new WorldRumorRequestFeature(engine,this.rumor);
            // Stateful wrappers are registered first so run composition preserves the former
            // history > replay > auto-progress > policy nesting without inheritance.
            this.features.register('historyLifecycle',this.historyLifecycle);
            this.features.register('replay',this.replay);
            this.features.register('autoProgress',this.autoProgress);
            this.features.register('npcAuditPolicy',this.npcAuditPolicy);
            this.features.register('timeOwnership',this.timeOwnership);
            this.features.register('npcAuditPrompt',this.npcAuditPrompt);
            this.features.register('apiPreset',this.apiPreset);
            this.features.register('causalOverview',this.causalOverview);
            this.features.register('softMaintenance',this.softMaintenance);
            this.features.register('integrityRequest',this.integrityRequest);
            this.features.register('worldActivityRequest',this.worldActivityRequest);
            this.features.register('dueEvent',this.dueEvent);
            this.features.register('taskAwareness',this.taskAwareness);
            this.features.register('chronology',this.chronology);
            this.features.register('rumorRequest',this.rumorRequest);
        }
        initialize(){
            this.prompts.initialize();
            this.features.initialize();
            return this;
        }
    }
    class WorldPromptWorkspaceController {
        constructor(engine,registry){this.engine=engine;this.registry=registry;}
        escape(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
        editable(){return this.engine.promptEditing===true;}
        readSettings(){
            const engine=this.engine,panel=engine.panel;
            const list=panel&&panel.querySelector('[data-segment-list]');
            const rows=list?Array.from(list.querySelectorAll('[data-segment-row]')):[];
            const preset=list?rows.map(row=>segmentText({
                title:row.querySelector('[data-segment-title]')?.value||'',
                body:row.querySelector('[data-segment]')?.value||''
            })).filter(Boolean).join('\n'):engine.config.preset;
            const floors=panel&&panel.querySelector('[data-floors]');
            const activation=panel&&panel.querySelector('[data-activation]');
            const books=panel?Array.from(panel.querySelectorAll('[data-book]')):[];
            return {
                preset,
                corePrompt:panel?.querySelector('[data-core-prompt]')?.value??engine.config.corePrompt??CORE_WORLD_RULES,
                macroPrompt:panel?.querySelector('[data-macro-prompt]')?.value??engine.config.macroPrompt??DEFAULT_MACRO_PROMPT,
                stabilityPromptTemplate:panel?.querySelector('[data-stability-prompt]')?.value??engine.config.stabilityPromptTemplate??DEFAULT_STABILITY_PROMPT_TEMPLATE,
                npcAuditPrompt:panel?.querySelector('[data-npc-audit-prompt]')?.value??engine.config.npcAuditPrompt,
                structurePrompt:panel?.querySelector('[data-structure-prompt]')?.value??engine.config.structurePrompt??WORLD_RESULT_CONTRACT.instruction(),
                contextTurns:Math.max(1,Math.min(100,Number(floors?.value??engine.config.contextTurns)||6)),
                activationMode:activation?.value||engine.config.activationMode||'respect_activation',
                selectedEntries:books.length
                    ?books.filter(item=>item.checked&&!item.disabled).map(item=>item.value)
                    :(Array.isArray(engine.config.selectedEntries)?copy(engine.config.selectedEntries):null)
            };
        }
        read(values){
            const next=this.registry.normalize(values),panel=this.engine.panel;
            if(!panel)return next;
            for(const field of panel.querySelectorAll('[data-prompt-registry]')){
                const key=String(field.dataset.promptRegistry||'');
                if(key&&Object.hasOwn(next,key))next[key]=String(field.value??'');
            }
            return next;
        }
        mount(){
            if(this.engine.tab!=="プロンプトプリセット"||!this.engine.panel)return;
            const main=this.engine.panel.querySelector('main');if(!main)return;
            main.querySelector('[data-world-module-prompts]')?.remove();
            let section=main.querySelector('[data-prompt-registry-section]');
            if(!section){
                section=this.engine.host.document.createElement('section');
                section.className='we-section';section.dataset.promptRegistrySection='';
                const output=[...main.querySelectorAll('.we-section')].find(item=>item.querySelector('.we-section-head h2')?.textContent?.trim()==="WorldResult 出力プロトコル");
                if(output)output.insertAdjacentElement('beforebegin',section);else main.appendChild(section);
            }
            const groups=new Map();
            for(const item of this.registry.list()){
                if(!groups.has(item.group))groups.set(item.group,[]);
                groups.get(item.group).push(item);
            }
            const editable=this.editable();
            const rows=[];
            for(const [group,items] of groups){
                rows.push('<div class="we-prompt-registry-group"><h3>'+this.escape(group)+'</h3>');
                for(const item of items){
                    const tokens=formatTokenCount(estimateTokens(item.value),true);
                    const meta="<div class=\"we-prompt-registry-meta\"><small><b>適用範囲</b> · "+this.escape(item.scope||'system')+"</small><small><b>送信条件</b> · "+this.escape(item.condition||"実行時の条件に従う")+'</small></div>';
                    const editor='<textarea data-prompt-registry="'+this.escape(item.key)+'" '+(editable?'':'readonly')+'>'+this.escape(item.value)+'</textarea>';
                    const nativeNote=item.native?"<div class=\"we-notice\">この項目は上の専用エディターとも同期して保存します。両方を編集した場合は「実際のプロンプト一覧」の値を優先します。</div>":'';
                    rows.push('<details class="we-segment we-prompt-registry-item"><summary>'+this.escape(item.title)+' <small>'+this.escape(item.source)+' · '+tokens+'</small></summary>'+meta+nativeNote+editor+'</details>');
                }
                rows.push('</div>');
            }
            section.innerHTML="<div class=\"we-section-head\"><h2>実際のプロンプト一覧</h2><small>"+this.registry.list().length+" 件 · 単一の Prompt Registry</small></div>"
                +"<div class=\"we-notice\">世界進行が実際に AI へ送信する静的な指示をすべて表示します。system、user payload、履歴圧縮、訂正再試行が対象です。編集を有効にすると各項目を直接修正できます。プログラムの JSON Schema、フィールドの許可一覧、動的な検証エラー、実行時の事実はプロンプトではないため編集対象外です。</div>"
                +rows.join('');
        }
        syncEditableState(){
            if(!this.engine.panel)return;
            for(const field of this.engine.panel.querySelectorAll('[data-prompt-registry]'))field.readOnly=!this.editable();
        }
    }
    SamsaraWorldEngine=class SamsaraWorldEngineWithServices extends SamsaraWorldEngine {
        constructor(host,env){
            super(host,env);
            this.services=new WorldEngineServiceContainer(this).initialize();
            this.promptRegistry=this.services.prompts;
            this.promptWorkspace=new WorldPromptWorkspaceController(this,this.promptRegistry);
            this.services.promptIntegration.attachWorkspace(this.promptWorkspace);
            this.services.promptIntegration.initializeDefaults();
        }
        readPromptEditor(){
            const settings=super.readPromptEditor();
            return this.services?.promptIntegration?.readEditor(settings)||settings;
        }
        applyPromptSettings(settings){
            const integration=this.services?.promptIntegration;
            if(!integration)return super.applyPromptSettings(settings);
            const prepared=integration.prepareApply(settings);
            return integration.afterApply(prepared,super.applyPromptSettings(prepared));
        }
        savePromptDocument(name,settings,activate=true){
            const integration=this.services?.promptIntegration;
            return super.savePromptDocument(name,integration?integration.prepareDocument(settings):settings,activate);
        }
        importPromptDocument(raw){
            const doc=super.importPromptDocument(raw);
            return this.services?.promptIntegration?.importDocument(doc,raw)||doc;
        }
        init(){
            const result=super.init();
            this.services?.features?.afterInit?.(result);
            return result;
        }
        snapshot(){
            const snapshot=super.snapshot();
            return this.services?.replay?.adjustSnapshot?.(snapshot)||snapshot;
        }
        blocked(snapshot){
            const base=super.blocked(snapshot);
            return this.services?.autoProgress?.blocked?.(snapshot,base)??base;
        }
        schedule(source='variable-update',attempt=0){
            if(this.services?.autoProgress)return this.services.autoProgress.schedule(source,attempt);
            return super.schedule();
        }
        toggleAutoProgress(){return this.services?.autoProgress?.toggle?.();}
        autoProgressIntervalValue(){return this.services?.autoProgress?.interval?.()??2;}
        autoProgressContextKey(snapshot){return this.services?.autoProgress?.contextKey?.(snapshot)||'';}
        autoProgressShouldSchedule(snapshot){return this.services?.autoProgress?.shouldSchedule?.(snapshot)===true;}
        initializeAutoProgressCycle(snapshot){return this.services?.autoProgress?.initializeCycle?.(snapshot);}
        markAutoProgressRun(snapshot){return this.services?.autoProgress?.markRun?.(snapshot);}
        resetAutoProgressCycle(){return this.services?.autoProgress?.resetCycle?.();}
        autoProgressDuringExtraAnalysis(){return this.services?.autoProgress?.duringExtraAnalysis?.()===true;}
        autoProgressSameFloor(left,right){return this.services?.autoProgress?.sameFloor?.(left,right)===true;}
        worldReplayCurrentMessage(){return this.services?.replay?.currentMessage?.()||null;}
        worldReplayPathAllowed(path){return this.services?.replay?.pathAllowed?.(path)===true;}
        worldReplayAtomicPath(path){return this.services?.replay?.atomicPath?.(path)===true;}
        worldReplayCollect(before,after,path,operations){return this.services?.replay?.collect?.(before,after,path,operations);}
        buildWorldReplayPackage(before,after,fingerprint){return this.services?.replay?.buildPackage?.(before,after,fingerprint)||null;}
        applyWorldReplayPackage(stat,packageValue){return this.services?.replay?.applyPackage?.(stat,packageValue)===true;}
        worldReplayMarkEventInternal(){return this.services?.replay?.markEventInternal?.();}
        worldReplayReprocessContext(variables,before){return this.services?.replay?.reprocessContext?.(variables,before)||null;}
        worldReplaySetCycleRecovered(fingerprint,stat){return this.services?.replay?.setCycleRecovered?.(fingerprint,stat);}
        worldReplayClearHandledForRetry(stat,fingerprint){return this.services?.replay?.clearHandledForRetry?.(stat,fingerprint);}
        worldReplayLegacyPackage(context,variables){return this.services?.replay?.legacyPackage?.(context,variables)||null;}
        worldReplayWaitForIdle(){return this.services?.replay?.waitForIdle?.()||Promise.resolve();}
        worldReplayResolveIdleWaiters(){return this.services?.replay?.resolveIdleWaiters?.();}
        worldReplayImmediateRetry(context,variables){return this.services?.replay?.immediateRetry?.(context,variables)||Promise.resolve(false);}
        handleWorldReplayVariableEvent(variables,before){return this.services?.replay?.handleVariableEvent?.(variables,before)||false;}
        syncNpcBuildAuditFeature(){return this.services?.npcAuditPolicy?.sync?.()===true;}
        isNpcBuildAuditEnabled(){return this.services?.npcAuditPolicy?.enabled?.()===true;}
        isNpcAuditWorldbook(entry){return this.services?.npcAuditPolicy?.isWorldbook?.(entry)===true;}
        syncNpcAuditWorldbookSelection(catalogue){return this.services?.npcAuditPolicy?.syncWorldbookSelection?.(catalogue);}
        setNpcBuildAuditEnabled(value){return this.services?.npcAuditPolicy?.setEnabled?.(value);}
        setSendHistoryToProse(value){return this.services?.historyLifecycle?.setSendToProse?.(value);}
        proseHistoryMemory(stat){return this.services?.historyLifecycle?.proseMemory?.(stat)||{};}
        beforeWorldCommit(next,context={}){return this.services?.historyLifecycle?.beforeWorldCommit?.(next,context)===true;}
        maintainHistoryMemory(){return this.services?.historyLifecycle?.maintain?.()||Promise.resolve(0);}
        async catalogue(){
            const result=await super.catalogue();
            return this.services?.features?.afterCatalogue?.(result)||result;
        }
        async run(options={}){
            if(!this.services?.features)return super.run(options);
            return this.services.features.run(()=>super.run(options),options);
        }
        async buildRequest(base){
            this.services?.promptIntegration?.beforeBuildRequest();
            let request=await super.buildRequest(base);
            request=await this.services?.features?.afterBuildRequest?.(request,base)||request;
            return this.services?.promptIntegration?.decorateRequest(request)||request;
        }
        async requestHistoryMemorySummary(world,batch,outputLevel){
            if(this.services?.historyLifecycle)return this.services.historyLifecycle.requestSummary(world,batch,outputLevel);
            throw new Error("履歴記憶サービスが初期化されていません");
        }
        get dedicatedApiPresetSelection(){return this.services?.apiPreset?.selection||'';}
        set dedicatedApiPresetSelection(value){if(this.services?.apiPreset)this.services.apiPreset.selection=String(value||'');}
        syncDedicatedApiPresetSelection(){return this.services?.apiPreset?.sync();}
        applyDedicatedApiPreset(name){
            const selected=String(name||'').trim(),result=super.applyDedicatedApiPreset(selected);
            return this.services?.apiPreset?.afterApply(selected,result)??result;
        }
        saveDedicatedApiPreset(name){
            const entry=super.saveDedicatedApiPreset(name);
            this.services?.apiPreset?.afterSave(entry);
            return entry;
        }
        deleteDedicatedApiPreset(name){
            const selected=String(name||'').trim(),deleted=super.deleteDedicatedApiPreset(selected);
            return this.services?.apiPreset?.afterDelete(selected,deleted)??deleted;
        }
        persistWorldEditorMutation(mutator,status){return this.services.mutations.commit(mutator,status);}
        worldEditorModeEnabled(){return this.services.editorController.modeEnabled();}
        setWorldEditorMode(value){return this.services.editorController.setMode(value);}
        toggleWorldEditorMode(){return this.services.editorController.toggleMode();}
        worldEditorSection(title){return this.services.editorController.section(title);}
        worldEditorReportError(error,title){return this.services.editorController.reportError(error,title);}
        worldEventRecord(name){return this.services.events.get(name);}
        setWorldEventRecord(oldName,newName,record){return this.services.events.save(oldName,newName,record);}
        removeWorldEventRecord(name){return this.services.events.remove(name);}
        worldPersonRecord(name){return this.services.people.get(name);}
        setWorldPersonRecord(name,record){return this.services.people.save(name,record);}
        removeWorldPersonRecord(name){return this.services.people.remove(name);}
        persistCausalOffsetMutation(mutator,status){return this.services.causal.commit(mutator,status);}
        causalOffsetRecord(name){return this.services.causal.get(name);}
        setCausalOffsetRecord(oldName,newName,record){return this.services.causal.save(oldName,newName,record);}
        removeCausalOffsetRecord(name){return this.services.causal.remove(name);}
        persistHistoryMemoryEdit(kind,name,build,status){return this.services.history.commitEdit(kind,name,build,status);}
        setHistoryAnchorRecord(name,record){return this.services.history.saveAnchor(name,record);}
        setHistorySummaryRecord(name,record){return this.services.history.saveSummary(name,record);}
        createPanel(){
            super.createPanel();
            this.services?.editorController?.bindPanel();
            this.services?.features?.bindPanel();
            this.services?.promptIntegration?.bindPanel(this.panel);
        }
        render(force=false){
            this.services?.features?.beforeRender(force);
            const result=super.render(force);
            this.services?.promptIntegration?.afterRender();
            this.services?.editorController?.afterRender();
            this.services?.features?.afterRender(force,result);
            return result;
        }
        dispose(){
            this.services?.features?.dispose?.();
            return super.dispose();
        }
    };
    // CommonJS 入口仅供离线测试，浏览器脚本不依赖打包器。
    if (typeof module !== 'undefined' && module.exports) { module.exports = {WORLD_ENGINE_VERSION,SamsaraWorldEngine,applyPatches,parseReply,emptyState,RECORDS,compileWorldResult,normalizeWorldResult,mergeWorldResults,WORLD_RESULT_SCHEMA,projectWorldContext,compactWorldLifecycle,calendarDate,repairExplorationGranularity,sortWorldEvents,eventScheduleLabel,staleActiveEvents,temporalAnomalies,activeAlienActivityRequirements,pruneDeadAlienPeople,extractWorldProse,derivePersonWorldContext,projectHotWorldPeople,WORLD_UI_THEMES,WORLD_FONT_SCALES,estimateTokens,formatTokenCount,normalizeTokenUsage,requestTokenTelemetry}; return; }
    const host = root.parent && root.parent !== root ? root.parent : root;
    // 酒馆脚本沙箱中的助手接口可能是词法全局，不一定挂在 iframe.window 上。
    const runtime = {
        get Mvu() { return typeof Mvu !== 'undefined' ? Mvu : root.Mvu || host.Mvu; },
        get tavern_events() { return typeof tavern_events !== 'undefined' ? tavern_events : root.tavern_events || host.tavern_events; }
    };
    if (typeof eventOn === 'function') runtime.eventOn = (...args) => eventOn(...args);
    if (typeof eventMakeFirst === 'function') runtime.eventMakeFirst = (...args) => eventMakeFirst(...args);
    if (typeof getChatMessages === 'function') runtime.getChatMessages = (...args) => getChatMessages(...args);
    if (typeof getCurrentChatId === 'function') runtime.getCurrentChatId = (...args) => getCurrentChatId(...args);
    if (typeof getCharWorldbookNames === 'function') runtime.getCharWorldbookNames = (...args) => getCharWorldbookNames(...args);
    if (typeof getChatWorldbookName === 'function') runtime.getChatWorldbookName = (...args) => getChatWorldbookName(...args);
    if (typeof getGlobalWorldbookNames === 'function') runtime.getGlobalWorldbookNames = (...args) => getGlobalWorldbookNames(...args);
    if (typeof getWorldbook === 'function') runtime.getWorldbook = (...args) => getWorldbook(...args);
    host.Samsara = host.Samsara || {};
    const loaderInfo=plain(host.SamsaraWorldEngineLoader)?host.SamsaraWorldEngineLoader:{};
    host.Samsara.WorldEngineInfo={version:WORLD_ENGINE_VERSION,sha:String(loaderInfo.sha||''),repository:String(loaderInfo.repository||'eumenes12ds/rinne-battlefield-jp'),entryPath:'/世界推进系统.js'};
    if (host.Samsara.worldEngine) host.Samsara.worldEngine.dispose();
    const engine = new SamsaraWorldEngine(host,runtime);
    host.Samsara.WorldEngine = SamsaraWorldEngine;
    host.Samsara.worldEngine = engine; engine.init();
    root.addEventListener('unload', () => engine.dispose(), {once:true});
})(typeof window !== 'undefined' ? window : globalThis);