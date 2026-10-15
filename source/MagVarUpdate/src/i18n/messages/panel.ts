import { defineMessages } from '@/i18n/messages/types';

export const panelMessages = defineMessages({
    'panel.title': {
        "ja-JP": 'MVU 变量框架',
        en: 'MVU Variable Framework',
    },
    'panel.version.section': {
        "ja-JP": '当前版本',
        en: 'Current version',
    },
    'panel.version.unknown': {
        "ja-JP": "不明",
        en: 'Unknown',
    },
    'panel.notification.section': {
        "ja-JP": '通知设置',
        en: 'Notifications',
    },
    'panel.notification.frameworkLoaded': {
        "ja-JP": 'MVU 框架加载成功时通知',
        en: 'Notify when the MVU framework loads successfully',
    },
    'panel.notification.variablesInitialized': {
        "ja-JP": '变量初始化成功时通知',
        en: 'Notify when variables are initialized successfully',
    },
    'panel.notification.variableError': {
        "ja-JP": '变量初始化/更新出错时通知',
        en: 'Notify when variable initialization or updates fail',
    },
    'panel.notification.extraModelParsing': {
        "ja-JP": '额外模型解析中通知',
        en: 'Notify while extra-model parsing is running',
    },
    'panel.cleanup.section': {
        "ja-JP": "自動クリーンアップ変数",
        en: 'Automatic variable cleanup',
    },
    'panel.cleanup.enable': {
        "ja-JP": '启用自动清理变量',
        en: 'Enable automatic variable cleanup',
    },
    'panel.cleanup.strategy': {
        "ja-JP": '清理策略',
        en: 'Cleanup strategy',
    },
    'panel.cleanup.snapshotInterval': {
        "ja-JP": "スナップショット保持間隔",
        en: 'Snapshot retention interval',
    },
    'panel.cleanup.recentFloors': {
        "ja-JP": "保持する変数の最近階層スタック数",
        en: 'Recent floors whose variables are retained',
    },
    'panel.cleanup.restoreFloors': {
        "ja-JP": "復元をトリガーする変数の最近階層スタック数",
        en: 'Recent floors that trigger variable restoration',
    },
    'panel.compatibility.section': {
        "ja-JP": "互換性",
        en: 'Compatibility',
    },
    'panel.compatibility.updateChatVariables': {
        "ja-JP": '变量更新到聊天变量',
        en: 'Write variable updates to chat variables',
    },
    'panel.compatibility.updateChatVariablesHelp': {
        "ja-JP":
            '启用后，所有变量更新结果也会输出到聊天变量中。如果部分老角色卡无法正常游玩，可以开启这个开关。',
        en: 'When enabled, every variable update is also written to chat variables. Enable this if some older character cards do not work correctly.',
    },
    'panel.compatibility.showLegacy': {
        "ja-JP": "旧機能を表示",
        en: 'Show legacy features',
    },
    'panel.compatibility.sendasNotUser': {
        "ja-JP": 'sendas 不视为 user 消息',
        en: 'Do not treat sendas as a user message',
    },
    'panel.compatibility.nonblockingExtraAnalysis': {
        "ja-JP": '额外模型解析不阻塞正文显示（实验性）',
        en: 'Show replies without waiting for extra model analysis (experimental)',
    },
    'panel.compatibility.nonblockingExtraAnalysisHelp': {
        "ja-JP":
            '默认关闭。开启后，角色卡的部分默认前端页面会立即显示，其他插件的额外分析流程也可同时执行，无需等待变量解析完成。仅对非工具调用的自动解析生效。',
        en: "Off by default. When enabled, some of a character card's default frontend pages appear immediately, and other plugins can run their additional analysis at the same time, without waiting for variable analysis to finish. Applies only to automatic analysis without tool calling.",
    },
    'panel.compatibility.license': {
        "ja-JP": 'LICENSE',
        en: 'LICENSE',
    },
    'panel.compatibility.licenseIntro': {
        "ja-JP": 'MVU 采用 MIT 许可证。以下是运行时使用或随扩展打包的第三方开源组件：',
        en: 'MVU is licensed under MIT. The following third-party components are used at runtime or bundled with the extension:',
    },
    'panel.compatibility.licenseComponent': {
        "ja-JP": '组件',
        en: 'Component',
    },
    'panel.compatibility.licenseIdentifier': {
        "ja-JP": '许可证',
        en: 'License',
    },
    'panel.compatibility.licenseDetails': {
        "ja-JP":
            '许可证标识来自当前依赖元数据；点击组件名称可查看项目，完整条款以各项目 LICENSE 为准。',
        en: 'License identifiers come from current dependency metadata. Select a component name to view its project; the project LICENSE contains the complete terms.',
    },
    'panel.button.section': {
        "ja-JP": '修复按钮',
        en: 'Repair actions',
    },
    'panel.button.reprocessVariables': {
        "ja-JP": '重新处理变量',
        en: 'Reprocess variables',
    },
    'panel.button.reloadInitialVariables': {
        "ja-JP": '重新读取初始变量',
        en: 'Reload initial variables',
    },
    'panel.button.snapshotFloor': {
        "ja-JP": '快照楼层',
        en: 'Snapshot floor',
    },
    'panel.button.replayFloor': {
        "ja-JP": '重演楼层',
        en: 'Replay floor',
    },
    'panel.button.retryExtraModelParsing': {
        "ja-JP": '重试额外模型解析',
        en: 'Retry extra-model parsing',
    },
    'panel.button.clearOldFloorVariables': {
        "ja-JP": '清除旧楼层变量',
        en: 'Clear variables from old floors',
    },
    'panel.help.ariaLabel': {
        "ja-JP": '帮助',
        en: 'Help',
    },
    'panel.badge.override': {
        "ja-JP": '角色卡覆盖',
        en: 'Character-card override',
    },
    'panel.badge.overrideWithValue': {
        "ja-JP": '角色卡覆盖：{value}',
        en: 'Character-card override: {value}',
    },
    'panel.badge.additive': {
        "ja-JP": '角色卡规则叠加',
        en: 'Character-card rule added',
    },
    'panel.update.section': {
        "ja-JP": '变量更新方式',
        en: 'Variable update method',
    },
    'panel.update.method.aiOutput': {
        "ja-JP": '随 AI 输出',
        en: 'Alongside AI output',
    },
    'panel.update.method.extraModel': {
        "ja-JP": "追加モデル解析",
        en: 'Extra-model parsing',
    },
    'panel.update.method.unsupportedWarning': {
        "ja-JP":
            "世界書 [{worldbooks}] 未适配额外模型解析，视为 [mvu_plot] エントリ（只会发给剧情 AI、不会发给变量更新 AI）。",
        en: 'World book [{worldbooks}] is not adapted for extra-model parsing and will be treated as an [mvu_plot] entry (sent only to the story AI, not the variable-update AI).',
    },
    'panel.modelSelect.ariaLabel': {
        "ja-JP": '模型列表',
        en: 'Model list',
    },
    'panel.modelSelect.chooseFromList': {
        "ja-JP": '（从列表选择）',
        en: '(Choose from list)',
    },
    'panel.modelSelect.loading': {
        "ja-JP": '获取中…',
        en: 'Fetching…',
    },
    'panel.modelSelect.fetch': {
        "ja-JP": '获取模型列表',
        en: 'Fetch model list',
    },
    'panel.modelSelect.empty': {
        "ja-JP": '模型列表为空或获取失败',
        en: 'The model list is empty or could not be fetched',
    },
    'panel.modelSelect.fetchTitle': {
        "ja-JP": '[MVU]获取模型列表',
        en: '[MVU] Fetch model list',
    },
    'panel.modelSelect.fetchFailureTitle': {
        "ja-JP": '[MVU]获取模型列表失败',
        en: '[MVU] Failed to fetch model list',
    },
    'panel.prompt.apiOptionsMigrated': {
        "ja-JP": '破限/应答格式等配置 已迁移到 API 方案，与方案配置绑定',
        en: 'Jailbreak, response format, and related settings have moved to API profiles and are saved with each profile.',
    },
    'panel.source.pi.auth.accountLogin': {
        "ja-JP": '账号登录',
        en: 'Account sign-in',
    },
    'panel.source.pi.contextWindowHelp': {
        "ja-JP":
            '模型一次能读取和生成的总长度，单位为 token。请按服务商说明填写；数值过小会使较长的请求无法发送。',
        en: 'The total length the model can read and generate, in tokens. Enter the limit given by your provider; setting it too low prevents longer requests from being sent.',
    },
    'panel.prompt.section': {
        "ja-JP": '请求内容',
        en: 'Request content',
    },
    'panel.prompt.jailbreakStrategy': {
        "ja-JP": "脱獄方案",
        en: 'Jailbreak strategy',
    },
    'panel.prompt.jailbreak.builtin': {
        "ja-JP": "内蔵脱獄を使用",
        en: 'Use built-in jailbreak',
    },
    'panel.prompt.jailbreak.currentPreset': {
        "ja-JP": "現在のプリセットを使用",
        en: 'Use current preset',
    },
    'panel.prompt.jailbreak.otherPreset': {
        "ja-JP": "その他のプリセットを使用",
        en: 'Use another preset',
    },
    'panel.prompt.targetPreset': {
        "ja-JP": '目标预设',
        en: 'Target preset',
    },
    'panel.prompt.noSavedPreset': {
        "ja-JP": '未检测到可用的已保存预设',
        en: 'No available saved presets detected',
    },
    'panel.prompt.randomHeader': {
        "ja-JP": "ランダムヘッダー",
        en: 'Randomized header',
    },
    'panel.prompt.randomHeaderHelp': {
        "ja-JP":
            'Gemini 系模型会记录破限头部，因此需要在头部增加随机数。如果你使用的不是 Gemini 系模型，请关闭这个功能，以免缓存失效。',
        en: 'Gemini-family models may record the jailbreak header, so a random number is added to it. Disable this for non-Gemini models to avoid invalidating the prompt cache.',
    },
    'panel.prompt.responseFormat': {
        "ja-JP": "応答フォーマット",
        en: 'Response format',
    },
    'panel.prompt.response.chatMessage': {
        "ja-JP": "チャットメッセージ",
        en: 'Chat message',
    },
    'panel.prompt.response.toolCall': {
        "ja-JP": "ツール呼び出し",
        en: 'Tool call',
    },
    'panel.prompt.response.structured': {
        "ja-JP": "フォーマット出力",
        en: 'Structured output',
    },
    'panel.prompt.response.structuredV4': {
        "ja-JP": "フォーマット出力（v4 兼容）",
        en: 'Structured output (v4 compatible)',
    },
    'panel.prompt.disableThinking': {
        "ja-JP": '关闭 thinking',
        en: 'Disable thinking',
    },
    'panel.prompt.disableThinkingHelp': {
        "ja-JP": '关闭后可避免部分空回复问题。',
        en: 'Disabling thinking can prevent some empty responses.',
    },
    'panel.prompt.disable': {
        "ja-JP": '关闭',
        en: 'Disable',
    },
    'panel.prompt.fakeStreaming': {
        "ja-JP": "疑似ストリーミング互換",
        en: 'Pseudo-streaming compatibility',
    },
    'panel.prompt.fakeStreamingHelp': {
        "ja-JP":
            '默认关闭，等待模型一次返回完整结果。若渠道要求流式请求，或等待时经常超时，可尝试勾选。开启后仍会等回复完整后再更新变量。OpenAI Codex 只支持流式传输，会始终使用流式。',
        en: 'Disabled by default: wait for the complete response. Enable this if your provider requires streaming or requests often time out while waiting. Variables are still updated after the full response arrives. OpenAI Codex requires streaming and always uses it.',
    },
    'panel.prompt.whitelist': {
        "ja-JP": "ワールドブックエントリホワイトリスト正規表現",
        en: 'World-book entry whitelist regex',
    },
    'panel.prompt.whitelistHelp': {
        "ja-JP":
            '留空则关闭；非空时，额外模型解析阶段只保留 comment 匹配该正则的世界书条目。支持 {example}。',
        en: 'Leave blank to disable. When set, extra-model parsing retains only world-book entries whose comment matches this regex. Supports {example}.',
    },
    'panel.prompt.whitelistPlaceholder': {
        "ja-JP": "キャラ{or}地点 或 /キャラ{or}地点/i",
        en: 'character{or}location or /character{or}location/i',
    },
    'panel.prompt.blacklist': {
        "ja-JP": "ワールドブックエントリブラックリスト正規表現",
        en: 'World-book entry blacklist regex',
    },
    'panel.prompt.blacklistHelp': {
        "ja-JP":
            '留空则关闭；非空时，额外模型解析阶段会排除 comment 匹配该正则的世界书条目。支持 {example}。',
        en: 'Leave blank to disable. When set, extra-model parsing excludes world-book entries whose comment matches this regex. Supports {example}.',
    },
    'panel.prompt.blacklistPlaceholder': {
        "ja-JP": "一時{or}禁用 或 /一時{or}禁用/i",
        en: 'temporary{or}disabled or /temporary{or}disabled/i',
    },
    'panel.prompt.regexInvalid': {
        "ja-JP": '正则无效：{error}',
        en: 'Invalid regex: {error}',
    },
    'panel.prompt.filtered.title': {
        "ja-JP": '上次分析被筛选的条目',
        en: 'Entries filtered from the last analysis',
    },
    'panel.prompt.filtered.empty': {
        "ja-JP": '上次分析没有被黑/白名单筛选掉的条目。',
        en: 'No entries were filtered by the whitelist or blacklist in the last analysis.',
    },
    'panel.prompt.filtered.entrySource': {
        "ja-JP": '条目来源',
        en: 'Entry source',
    },
    'panel.prompt.filtered.worldBook': {
        "ja-JP": "世界書",
        en: 'World book',
    },
    'panel.prompt.filtered.reason': {
        "ja-JP": '原因',
        en: 'Reason',
    },
    'panel.prompt.filtered.configSource': {
        "ja-JP": '配置来源',
        en: 'Configuration source',
    },
    'panel.prompt.filtered.comment': {
        "ja-JP": '条目备注',
        en: 'Comment',
    },
    'panel.prompt.filtered.globalLore': {
        "ja-JP": '全局世界书',
        en: 'Global world book',
    },
    'panel.prompt.filtered.characterLore': {
        "ja-JP": '角色世界书',
        en: 'Character world book',
    },
    'panel.prompt.filtered.chatLore': {
        "ja-JP": '聊天世界书',
        en: 'Chat world book',
    },
    'panel.prompt.filtered.personaLore': {
        "ja-JP": '用户世界书',
        en: 'Persona world book',
    },
    'panel.prompt.filtered.whitelistReason': {
        "ja-JP": "許可リスト",
        en: 'Whitelist',
    },
    'panel.prompt.filtered.blacklistReason': {
        "ja-JP": "拒否リスト",
        en: 'Blacklist',
    },
    'panel.prompt.filtered.globalConfig': {
        "ja-JP": "ユーザー共通設定",
        en: 'User global settings',
    },
    'panel.prompt.filtered.characterConfig': {
        "ja-JP": "キャラクターカード設定",
        en: 'Character-card settings',
    },
    'panel.prompt.toolCallUnavailableTitle': {
        "ja-JP": "[MVU]无法使用'ツール呼び出し'",
        en: "[MVU] Cannot use 'Tool call'",
    },
    'panel.prompt.toolCallUnsupported': {
        "ja-JP": "現在 API 源不支持工具调用，请换用支持 tools 的渠道模型或改用其他应答格式",
        en: 'The current API source does not support tool calls. Choose a provider/model that supports tools, or use another response format.',
    },
    'panel.prompt.structuredV4UnavailableTitle': {
        "ja-JP": "[MVU]无法使用'フォーマット出力(v4兼容)'",
        en: "[MVU] Cannot use 'Structured output (v4 compatible)'",
    },
    'panel.prompt.structuredV4RequiresCustom': {
        "ja-JP": "フォーマット出力(v4兼容)需要额外模型来源为自定义，不能与插头相同",
        en: 'Structured output (v4 compatible) requires a custom extra-model source and cannot use the current connection.',
    },
    'panel.request.section': {
        "ja-JP": '请求策略',
        en: 'Request strategy',
    },
    'panel.request.method': {
        "ja-JP": "リクエスト方式",
        en: 'Request method',
    },
    'panel.request.sequential': {
        "ja-JP": "順番にリクエストし、失敗したら再試行",
        en: 'Request sequentially and retry on failure',
    },
    'panel.request.parallel': {
        "ja-JP": "同時に複数回リクエスト",
        en: 'Send multiple requests in parallel',
    },
    'panel.request.onceThenParallel': {
        "ja-JP": '先请求一次，失败后再同时请求多次',
        en: 'Request once, then retry in parallel on failure',
    },
    'panel.request.count': {
        "ja-JP": "リクエスト回数",
        en: 'Number of requests',
    },
    'panel.request.auto': {
        "ja-JP": '自动请求',
        en: 'Automatic requests',
    },
    'panel.request.autoHelp': {
        "ja-JP":
            '关闭后，AI 回复完成时不会自动触发额外模型解析；你需要主动点击“重试额外模型解析”按钮，才会执行解析并添加状态栏占位符 &lt;StatusPlaceHolderImpl/&gt;。',
        en: 'When disabled, extra-model parsing is not triggered automatically after the AI finishes replying. Click “Retry extra-model parsing” to run it and add the status-bar placeholder &lt;StatusPlaceHolderImpl/&gt;.',
    },
    'panel.request.batchWarning': {
        "ja-JP":
            '请升级酒馆助手到 4.4.3 或更高版本，否则批量请求功能可能让预设的“流式传输”设置失效',
        en: "Upgrade Tavern Helper to version 4.4.3 or later. Otherwise, batch requests may override the preset's streaming setting.",
    },
    'panel.request.batchWarningTitle': {
        "ja-JP": '[MVU]批量请求可能有问题',
        en: '[MVU] Batch requests may not work correctly',
    },
    'panel.source.section': {
        "ja-JP": "モデル出典",
        en: 'Model source',
    },
    'panel.source.sameAsConnection': {
        "ja-JP": "プラグと同じ",
        en: 'Same as current connection',
    },
    'panel.source.custom': {
        "ja-JP": "カスタム",
        en: 'Custom',
    },
    'panel.source.more': {
        "ja-JP": "その他",
        en: 'More',
    },
    'panel.source.profile.section': {
        "ja-JP": 'API 方案',
        en: 'API profiles',
    },
    'panel.source.profile.current': {
        "ja-JP": '当前方案',
        en: 'Current profile',
    },
    'panel.source.profile.ariaLabel': {
        "ja-JP": 'API 方案',
        en: 'API profile',
    },
    'panel.source.profile.manual': {
        "ja-JP": '（手动编辑，未绑定方案）',
        en: '(Manual settings, not bound to a profile)',
    },
    'panel.source.profile.newName': {
        "ja-JP": '新方案名称',
        en: 'New profile name',
    },
    'panel.source.profile.save': {
        "ja-JP": '保存当前方案',
        en: 'Save current profile',
    },
    'panel.source.profile.saveAs': {
        "ja-JP": '另存为新方案',
        en: 'Save as new profile',
    },
    'panel.source.profile.delete': {
        "ja-JP": '删除当前方案',
        en: 'Delete current profile',
    },
    'panel.source.profile.backendCustom': {
        "ja-JP": "カスタム API",
        en: 'Custom API',
    },
    'panel.source.profile.backendPi': {
        "ja-JP": "その他",
        en: 'More',
    },
    'panel.source.apiAddress': {
        "ja-JP": 'API 地址',
        en: 'API address',
    },
    'panel.source.apiKey': {
        "ja-JP": "API APIキー",
        en: 'API key',
    },
    'panel.source.apiKeyPlaceholder': {
        "ja-JP": '留空表示无需密钥',
        en: 'Leave blank when no key is required',
    },
    'panel.source.modelName': {
        "ja-JP": "モデル名",
        en: 'Model name',
    },
    // “更多”来源的连接、协议能力和认证界面文案；底层 Pi 标识不作为产品名称展示。
    'panel.source.pi.provider': {
        "ja-JP": "出典",
        en: 'Provider',
    },
    'panel.source.pi.endpoint': {
        "ja-JP": 'API 基础地址',
        en: 'API base URL',
    },
    'panel.source.pi.endpointDefault': {
        "ja-JP": '留空使用默认地址：{endpoint}',
        en: 'Leave blank to use the default: {endpoint}',
    },
    'panel.source.pi.endpointPlaceholder': {
        "ja-JP": '请输入 API 基础地址',
        en: 'Enter an API base URL',
    },
    'panel.source.pi.endpointHelp': {
        "ja-JP":
            '填写服务商提供的 API 地址，留空使用默认地址。也可以直接粘贴完整的聊天或 Responses 接口地址，MVU 会自动处理末尾路径。',
        en: 'Enter the API URL supplied by your provider, or leave it blank to use the default. You can also paste a full chat or Responses URL; MVU adjusts its ending automatically.',
    },
    'panel.source.pi.proxy.use': {
        "ja-JP": '使用 Proxy',
        en: 'Use Proxy',
    },
    'panel.source.pi.proxy.help': {
        "ja-JP":
            "如果获取模型列表或生成请求因 CORS（浏览器跨域限制）失敗，可以尝试勾选，通过 SillyTavern 转发请求。需要先在 SillyTavern 中开启 Proxy。开启这个功能后，任意前端脚本都可以无障碍地访问任意站点，请在了解相关的风险后决定是否打开这个功能。",
        en: 'If fetching models or generating a response fails because of CORS (browser cross-origin restrictions), try enabling this to forward requests through SillyTavern. Proxy must also be enabled in SillyTavern. Once enabled, any frontend script can freely access any website. Decide whether to enable this feature only after understanding the risks.',
    },
    'panel.source.pi.proxy.notEnabled': {
        "ja-JP": '当前来源需要 Proxy，但 SillyTavern 的 Proxy 未开启或无法连接。',
        en: 'This provider needs Proxy, but SillyTavern Proxy is disabled or unavailable.',
    },
    'panel.source.pi.proxy.notEnabledHelp': {
        "ja-JP":
            '打开 SillyTavern 的 config.yaml，将 enableCorsProxy 设为 true，保存后重启 SillyTavern。如果酒馆由他人托管，请联系管理员开启。开启这个功能后，任意前端脚本都可以无障碍地访问任意站点，请在了解相关的风险后决定是否打开这个功能。',
        en: 'Open SillyTavern config.yaml, set enableCorsProxy to true, save, and restart SillyTavern. If someone else hosts your server, ask its administrator to enable it. Once enabled, any frontend script can freely access any website. Decide whether to enable this feature only after understanding the risks.',
    },
    'panel.source.pi.model': {
        "ja-JP": "モデル",
        en: 'Model',
    },
    'panel.source.pi.catalogModel': {
        "ja-JP": '模型目录',
        en: 'Model catalog',
    },
    'panel.source.pi.customModel': {
        "ja-JP": '（手动填写模型）',
        en: '(Enter a model manually)',
    },
    'panel.source.pi.api.openaiResponses': {
        "ja-JP": 'OpenAI Responses',
        en: 'OpenAI Responses',
    },
    'panel.source.pi.api.openaiCompletions': {
        "ja-JP": 'OpenAI Chat Completions',
        en: 'OpenAI Chat Completions',
    },
    'panel.source.pi.api.openaiCodexResponses': {
        "ja-JP": 'OpenAI Codex Responses',
        en: 'OpenAI Codex Responses',
    },
    'panel.source.pi.api.anthropicMessages': {
        "ja-JP": 'Anthropic Messages',
        en: 'Anthropic Messages',
    },
    'panel.source.pi.api.googleGenerativeAi': {
        "ja-JP": 'Google Generative AI',
        en: 'Google Generative AI',
    },
    'panel.source.pi.api.mistralConversations': {
        "ja-JP": 'Mistral Conversations',
        en: 'Mistral Conversations',
    },
    'panel.source.pi.auth.apiKey': {
        "ja-JP": 'API Key',
        en: 'API key',
    },
    'panel.source.pi.capabilities': {
        "ja-JP": '可尝试的功能：{capabilities}。具体是否可用，以你使用的模型和服务商为准。',
        en: 'Features you can try: {capabilities}. Availability depends on your model and provider.',
    },
    'panel.source.pi.capability.tools': {
        "ja-JP": "ツール呼び出し",
        en: 'tools',
    },
    'panel.source.pi.capability.images': {
        "ja-JP": '读取图片',
        en: 'Read images',
    },
    'panel.source.pi.capability.structured': {
        "ja-JP": "フォーマット出力",
        en: 'Structured output',
    },
    'panel.source.pi.contextWindow': {
        "ja-JP": '上下文窗口',
        en: 'Context window',
    },
    'panel.source.pi.contextWindowCatalog': {
        "ja-JP":
            '模型一次能读取和生成的总长度，单位为 token。已自动填入 {value}；如果服务商给出的限制不同，可手动修改，清空后恢复自动值。',
        en: 'The total length the model can read and generate, in tokens. Automatically set to {value}. Edit it if your provider gives a different limit; clear it to restore the automatic value.',
    },
    'panel.source.pi.contextWindowOverride': {
        "ja-JP":
            '模型一次能读取和生成的总长度，单位为 token。当前使用你填写的值；清空后会尝试自动填写已知模型的限制。',
        en: 'The total length the model can read and generate, in tokens. Using your entered value; clear it to try the known model limit.',
    },
    'panel.source.pi.contextWindowRequired': {
        "ja-JP": '请输入正整数上下文窗口；模型目录未提供该值时必须手动填写。',
        en: 'Enter a positive integer context window. It is required when the model catalog has no value.',
    },
    'panel.source.pi.error.unknownProvider': {
        "ja-JP": "“その他”中的未知来源“{provider}”；请重新选择来源。",
        en: 'Unknown provider "{provider}" under More. Select a provider again.',
    },
    'panel.source.pi.error.unsupportedApi': {
        "ja-JP": '已保存的来源“{provider}”不支持接口“{api}”，请重新选择来源。',
        en: 'The saved provider "{provider}" does not support API "{api}". Select a provider again.',
    },
    'panel.source.pi.error.unsupportedAuth': {
        "ja-JP": '已保存的来源“{provider}”不支持认证方式“{auth}”，请重新选择来源。',
        en: 'The saved provider "{provider}" does not support authentication type "{auth}". Select a provider again.',
    },
    'panel.source.pi.error.unsupportedEndpoint': {
        "ja-JP": '当前来源不支持自定义 API 地址，请重新选择来源或切换 API 方案。',
        en: 'This provider does not support a custom API URL. Select a provider again or switch API profiles.',
    },
    'panel.source.pi.featureDisabled': {
        "ja-JP":
            "此构建已关闭“その他”モデル出典。已保存的“その他”配置仍会保留；请选择“プラグと同じ”或“カスタム”。",
        en: 'The More model source is disabled in this build. Saved More-source settings are preserved; select Same as current connection or Custom.',
    },
    'panel.source.pi.maxTokensPositive': {
        "ja-JP": '最大回复 token 必须是正整数。',
        en: 'Maximum response tokens must be a positive integer.',
    },
    'panel.source.pi.maxTokensExceedContext': {
        "ja-JP": '最大回复 token 不能大于上下文窗口。',
        en: 'Maximum response tokens cannot exceed the context window.',
    },
    'panel.source.pi.customHeaders': {
        "ja-JP": '自定义请求头',
        en: 'Custom request headers',
    },
    'panel.source.pi.customHeadersHelp': {
        "ja-JP":
            '仅在服务商要求额外请求头时填写，格式为 YAML 或 JSON，例如 X-App: MVU。留空即可；API 密钥请填在上方的密钥栏。',
        en: 'Fill this in only if your provider requires extra headers. Use YAML or JSON, for example X-App: MVU. Otherwise leave it blank. Enter your API key in the key field above.',
    },
    'panel.source.pi.customOverridesSwitchHelp': {
        "ja-JP":
            '下方的自定义请求头、附加字段和排除字段会随 API 方案保存。手动切换来源或 API 地址时会清空这三项；切换方案会恢复该方案保存的内容。',
        en: 'Custom headers, additional fields, and excluded fields below are saved with the API profile. Manually changing the provider or API URL clears these three fields; switching profiles restores their saved values.',
    },
    'panel.source.pi.customIncludeBody': {
        "ja-JP": '请求体附加字段',
        en: 'Additional request body fields',
    },
    'panel.source.pi.customIncludeBodyHelp': {
        "ja-JP":
            "服务商要求额外参数时在这里填写，使用 YAML 或 JSON，例如 seed: 123。同名参数会采用这里的值。Google 参数请放在 config 下。不需要时留空；APIキー、模型和流式开关请使用对应选项。",
        en: 'Add parameters required by your provider as YAML or JSON, for example seed: 123. These values replace matching parameters. Put Google parameters under config. Leave blank when unnecessary; use the dedicated controls for keys, models, and streaming.',
    },
    'panel.source.pi.customExcludeBody': {
        "ja-JP": '请求体排除字段',
        en: 'Excluded request body fields',
    },
    'panel.source.pi.customExcludeBodyHelp': {
        "ja-JP":
            "如果服务商提示某个参数不被支持，可在这里填写参数名，使请求不再携带它。多个名称用换行或逗号分隔，也支持 YAML リスト。Google 参数写为 config.&lt;参数名&gt;。不需要时留空。",
        en: 'If your provider rejects a parameter, enter its name here to leave it out of requests. Separate names with newlines or commas, or use a YAML list. For Google, use config.&lt;parameter&gt;. Otherwise leave blank.',
    },
    'panel.source.pi.clearCustomField': {
        "ja-JP": '清空',
        en: 'Clear',
    },
    'panel.source.pi.oauth.section': {
        "ja-JP": 'OAuth 登录',
        en: 'OAuth login',
    },
    'panel.source.pi.oauth.status': {
        "ja-JP": "状態",
        en: 'Status',
    },
    'panel.source.pi.oauth.checking': {
        "ja-JP": '检查中…',
        en: 'Checking…',
    },
    'panel.source.pi.oauth.loggedIn': {
        "ja-JP": '已登录',
        en: 'Signed in',
    },
    'panel.source.pi.oauth.loggedOut': {
        "ja-JP": '未登录',
        en: 'Not signed in',
    },
    'panel.source.pi.oauth.expiresAt': {
        "ja-JP": '凭据有效期：{time}',
        en: 'Credential expiry: {time}',
    },
    'panel.source.pi.oauth.login': {
        "ja-JP": '登录',
        en: 'Sign in',
    },
    'panel.source.pi.oauth.refresh': {
        "ja-JP": '刷新凭证',
        en: 'Refresh credentials',
    },
    'panel.source.pi.oauth.refreshing': {
        "ja-JP": '正在刷新凭证…',
        en: 'Refreshing credentials…',
    },
    'panel.source.pi.oauth.refreshSucceeded': {
        "ja-JP": '凭证已刷新。',
        en: 'Credentials refreshed.',
    },
    'panel.source.pi.oauth.cancel': {
        "ja-JP": '取消登录',
        en: 'Cancel sign-in',
    },
    'panel.source.pi.oauth.logout': {
        "ja-JP": '登出',
        en: 'Sign out',
    },
    'panel.source.pi.oauth.authorizationUrl': {
        "ja-JP": '授权链接',
        en: 'Authorization URL',
    },
    'panel.source.pi.oauth.openAuthorization': {
        "ja-JP": '打开授权页',
        en: 'Open authorization page',
    },
    'panel.source.pi.oauth.copyAuthorization': {
        "ja-JP": '复制授权链接',
        en: 'Copy authorization URL',
    },
    'panel.source.pi.oauth.copySucceeded': {
        "ja-JP": '已复制授权链接',
        en: 'Authorization URL copied',
    },
    'panel.source.pi.oauth.copyFailed': {
        "ja-JP": '无法复制授权链接，请手动选择并复制。',
        en: 'Could not copy the authorization URL. Select and copy it manually.',
    },
    'panel.source.pi.oauth.callbackUrl': {
        "ja-JP": '回调链接',
        en: 'Callback URL',
    },
    'panel.source.pi.oauth.callbackHelp': {
        "ja-JP":
            '完成授权后，如果跳转到的页面打不开，不影响登录。请复制浏览器地址栏中以 127.0.0.1 或 localhost 开头的完整链接，粘贴到这里，再点击“完成登录”。',
        en: 'After authorization, the redirected page may fail to open; you can still finish signing in. Copy the full URL starting with 127.0.0.1 or localhost from the address bar, paste it here, and click Complete sign-in.',
    },
    'panel.source.pi.oauth.complete': {
        "ja-JP": '完成登录',
        en: 'Complete sign-in',
    },
    'panel.source.pi.oauth.preparing': {
        "ja-JP": '正在准备安全授权链接…',
        en: 'Preparing a secure authorization URL…',
    },
    'panel.source.pi.oauth.waitingCallback': {
        "ja-JP": '请在授权页完成登录，然后粘贴完整回调链接。',
        en: 'Finish signing in on the authorization page, then paste the complete callback URL.',
    },
    'panel.source.pi.oauth.exchanging': {
        "ja-JP": '正在验证回调并交换凭据…',
        en: 'Validating the callback and exchanging credentials…',
    },
    'panel.source.pi.oauth.loginSucceeded': {
        "ja-JP": 'OAuth 登录成功。',
        en: 'OAuth sign-in succeeded.',
    },
    'panel.source.pi.oauth.logoutSucceeded': {
        "ja-JP": '已登出。',
        en: 'Signed out.',
    },
    'panel.source.pi.oauth.logoutConfirm': {
        "ja-JP": '确定在当前配置中登出 {provider} 吗？之后可以登录其他账号。',
        en: 'Sign out of {provider} for the current configuration? You can then sign in with another account.',
    },
    'panel.source.pi.oauth.failureTitle': {
        "ja-JP": '[MVU]OAuth 操作失败',
        en: '[MVU] OAuth operation failed',
    },
    'panel.source.advanced': {
        "ja-JP": '高级参数',
        en: 'Advanced parameters',
    },
    'panel.source.unsupportedAdvanced': {
        "ja-JP": '⚠️酒馆助手版本过低，不支持以下配置',
        en: '⚠️ Your Tavern Helper version is too old to support the settings below',
    },
    'panel.source.maxTokens': {
        "ja-JP": '最大回复 token',
        en: 'Maximum response tokens',
    },
    'panel.source.chatHistory': {
        "ja-JP": '聊天历史条数',
        en: 'Chat history entries',
    },
    'panel.source.temperature': {
        "ja-JP": '温度',
        en: 'Temperature',
    },
    'panel.source.frequencyPenalty': {
        "ja-JP": "頻度ペナルティ",
        en: 'Frequency penalty',
    },
    'panel.source.presencePenalty': {
        "ja-JP": "存在ペナルティ",
        en: 'Presence penalty',
    },
    'panel.source.topP': {
        "ja-JP": 'Top P',
        en: 'Top P',
    },
    'panel.source.topK': {
        "ja-JP": 'Top K',
        en: 'Top K',
    },
    'panel.source.switchDirty': {
        "ja-JP": '当前方案有未保存的修改，切换将丢弃这些修改。是否继续？',
        en: 'The current profile has unsaved changes. Switching will discard them. Continue?',
    },
    'panel.source.continue': {
        "ja-JP": '继续',
        en: 'Continue',
    },
    'panel.source.discardChanges': {
        "ja-JP": '丢弃修改',
        en: 'Discard changes',
    },
    'panel.source.delete': {
        "ja-JP": "削除",
        en: 'Delete',
    },
    'panel.source.deleteDirty': {
        "ja-JP": '当前方案“{name}”有未保存的修改，删除将丢弃这些修改。是否继续？',
        en: 'Profile “{name}” has unsaved changes. Deleting it will discard them. Continue?',
    },
    'panel.source.deleteConfirm': {
        "ja-JP": "以下の API 方案“{name}”吗？此操作不可撤销。",
        en: 'Delete API profile “{name}”? This action cannot be undone.',
    },
    'panel.source.profileSaved': {
        "ja-JP": '已保存 API 方案“{name}”',
        en: 'Saved API profile “{name}”',
    },
    'panel.source.profileSavedAs': {
        "ja-JP": '已另存为 API 方案“{name}”',
        en: 'Saved as API profile “{name}”',
    },
    'panel.source.profileDeleted': {
        "ja-JP": "削除済み API 方案“{name}”",
        en: 'Deleted API profile “{name}”',
    },
    'panel.source.enterProfileName': {
        "ja-JP": '请先输入新方案名称',
        en: 'Enter a new profile name first',
    },
    'panel.source.keepTwoProfiles': {
        "ja-JP": '至少保留两个 API 方案时才可删除',
        en: 'At least two API profiles are required before one can be deleted',
    },
    'panel.source.switchFailureTitle': {
        "ja-JP": '[MVU]切换 API 方案失败',
        en: '[MVU] Failed to switch API profile',
    },
    'panel.source.saveFailureTitle': {
        "ja-JP": '[MVU]保存 API 方案失败',
        en: '[MVU] Failed to save API profile',
    },
    'panel.source.deleteFailureTitle': {
        "ja-JP": "[MVU]削除 API 方案失败",
        en: '[MVU] Failed to delete API profile',
    },
    'panel.character.titleActive': {
        "ja-JP": '当前角色卡配置（覆盖中）',
        en: 'Current character-card settings (overriding)',
    },
    'panel.character.titleInactive': {
        "ja-JP": "当前角色卡配置（無効）",
        en: 'Current character-card settings (not enabled)',
    },
    'panel.character.worldBook': {
        "ja-JP": '角色世界书',
        en: 'Character world book',
    },
    'panel.character.reading': {
        "ja-JP": '正在读取…',
        en: 'Reading…',
    },
    'panel.character.unbound': {
        "ja-JP": '未绑定',
        en: 'Not bound',
    },
    'panel.character.inherit': {
        "ja-JP": '跟随用户配置',
        en: 'Inherit user settings',
    },
    'panel.character.extraModelGroup': {
        "ja-JP": "追加モデル解析",
        en: 'Extra-model parsing',
    },
    'panel.character.autoRequest': {
        "ja-JP": '自动请求',
        en: 'Automatic requests',
    },
    'panel.character.whitelist': {
        "ja-JP": '角色卡世界书条目白名单正则',
        en: 'Character-card world-book entry whitelist regex',
    },
    'panel.character.blacklist': {
        "ja-JP": '角色卡世界书条目黑名单正则',
        en: 'Character-card world-book entry blacklist regex',
    },
    'panel.character.regexInvalid': {
        "ja-JP": '角色卡配置正则无效：{error}',
        en: 'Invalid character-card regex: {error}',
    },
});
