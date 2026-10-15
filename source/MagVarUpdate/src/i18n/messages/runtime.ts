import { defineMessages } from '@/i18n/messages/types';

export const runtimeMessages = defineMessages({
    'runtime.common.mvuTitle': {
        "ja-JP": '[MVU]',
        en: '[MVU]',
    },
    'runtime.common.errorCause': {
        "ja-JP": '错误详情：{cause}',
        en: 'Error details: {cause}',
    },
    'runtime.common.unknown': {
        "ja-JP": "不明",
        en: 'Unknown',
    },

    'runtime.main.chatReinitializeFailedLog': {
        "ja-JP": '[MVU]切换聊天后重新初始化失败',
        en: '[MVU] Failed to reinitialize after switching chats',
    },
    'runtime.main.reinitializeFailedTitle': {
        "ja-JP": '[MVU]重新初始化失败',
        en: '[MVU] Reinitialization failed',
    },
    'runtime.main.minimumVersionRequired': {
        "ja-JP": 'MVU 变量框架需要酒馆助手版本不低于 {version}',
        en: 'MVU Variable Framework requires Tavern Helper {version} or later',
    },
    'runtime.main.versionIncompatibleTitle': {
        "ja-JP": '版本不兼容',
        en: 'Incompatible version',
    },

    'runtime.parseString.invalidFormat': {
        "ja-JP": '要解析的字符串不是有效的 YAML/JSON/JSON5 格式',
        en: 'The input is not valid YAML, JSON, or JSON5',
    },
    'runtime.parseString.content': {
        "ja-JP": '字符串内容',
        en: 'Input',
    },
    'runtime.parseString.yamlError': {
        "ja-JP": 'YAML 错误信息',
        en: 'YAML error',
    },
    'runtime.parseString.json5Error': {
        "ja-JP": 'JSON5 错误信息',
        en: 'JSON5 error',
    },
    'runtime.parseString.jsonError': {
        "ja-JP": 'JSON 错误信息',
        en: 'JSON error',
    },

    'runtime.button.initVarDataNotFound': {
        "ja-JP": '没有找到 InitVar 数据',
        en: 'No InitVar data was found',
    },
    'runtime.button.initVarDataLoadFailed': {
        "ja-JP": '加载 InitVar 数据失败:',
        en: 'Failed to load InitVar data',
    },
    'runtime.button.messageNotFound': {
        "ja-JP": '没有找到消息',
        en: 'No message was found',
    },
    'runtime.button.initVarDescriptionsUpdated': {
        "ja-JP": 'InitVar描述已更新',
        en: 'InitVar descriptions updated',
    },
    'runtime.button.snapshotPrompt': {
        "ja-JP":
            '<h4>设置快照楼层可以避免指定的楼层在清理操作中被移除变量信息</h4>请填写要保留变量信息的楼层（如 10 为第 10 层）<br><strong>后续楼层的重演将可以从这一层开始</strong>',
        en: '<h4>Marking a floor as a snapshot prevents its variable data from being removed during cleanup.</h4>Enter the floor whose variable data should be retained (for example, 10 for floor 10).<br><strong>Later floors can then be replayed starting from this floor.</strong>',
    },
    'runtime.button.invalidFloorInput': {
        "ja-JP": '请输入有效的楼层数，你输入的是“{value}”',
        en: 'Enter a valid floor number. You entered “{value}”.',
    },
    'runtime.button.invalidFloor': {
        "ja-JP": '无效的楼层“{value}”',
        en: 'Invalid floor “{value}”.',
    },
    'runtime.button.snapshotConfigureFailedTitle': {
        "ja-JP": '[MVU]配置楼层快照失败',
        en: '[MVU] Failed to configure floor snapshot',
    },
    'runtime.button.snapshotConfigureTitle': {
        "ja-JP": '[MVU]配置楼层快照',
        en: '[MVU] Configure floor snapshot',
    },
    'runtime.button.snapshotConfigured': {
        "ja-JP": '已将 {floor} 层配置为快照楼层',
        en: 'Floor {floor} is now a snapshot floor',
    },
    'runtime.button.replayPrompt': {
        "ja-JP":
            '<h4>当变量更新出现 required/extensible 相关问题时，可以尝试从过去的楼层重演</h4>请填写要进行重演的楼层（如 10 为第 10 层，-1 为最新楼层）<br><strong>也就是出现问题的楼层</strong>',
        en: '<h4>If variable updates have required/extensible issues, replaying from an earlier floor may help.</h4>Enter the floor to replay (for example, 10 for floor 10, or -1 for the latest floor).<br><strong>This should be the floor where the problem occurred.</strong>',
    },
    'runtime.button.replayFailedTitle': {
        "ja-JP": '[MVU]楼层重演失败',
        en: '[MVU] Floor replay failed',
    },
    'runtime.button.replayNoAvailableFloor': {
        "ja-JP": '无法找到可以进行重演的楼层',
        en: 'No floor with replayable variable data was found',
    },
    'runtime.button.replayStartPrompt': {
        "ja-JP": '请填写从哪个楼层开始重演，找到最近的支持重演楼层为 [{floor}]',
        en: 'Enter the floor from which to start replaying. The nearest replayable floor is [{floor}].',
    },
    'runtime.button.replayNeedsVariables': {
        "ja-JP": '请输入含变量信息的楼层，你输入的是“{value}”',
        en: 'Enter a floor that contains variable data. You entered “{value}”.',
    },
    'runtime.button.replayProgress': {
        "ja-JP": '处理变量中（{processed} / {total}）',
        en: 'Processing variables ({processed} / {total})',
    },
    'runtime.button.replayingFloorLog': {
        "ja-JP": '正在重演 {index}，内容：{content}',
        en: 'Replaying {index}. Content: {content}',
    },
    'runtime.button.replayTitle': {
        "ja-JP": '[MVU]楼层重演',
        en: '[MVU] Floor replay',
    },
    'runtime.button.replayCompleted': {
        "ja-JP": '已将 {floor} 层变量状态重演完毕，共重演 {count} 楼',
        en: 'Variable state replay for floor {floor} is complete ({count} floors replayed)',
    },
    'runtime.button.extraModelNotEnabled': {
        "ja-JP": '当前配置没有启用额外模型解析，不需要进行此操作',
        en: 'Extra-model parsing is not enabled by the current configuration',
    },
    'runtime.button.extraModelToolCallingUnsupported': {
        "ja-JP": "現在 TavernHelper 版本或配置指定的 LLM 不支持工具调用，请调整额外模型解析设置",
        en: 'The current TavernHelper version or configured LLM does not support tool calling. Adjust the extra-model parsing settings.',
    },
    'runtime.button.extraModelUnsupportedByCard': {
        "ja-JP": '当前角色卡不支持额外模型解析，无法进行此操作',
        en: 'The current character card does not support extra-model parsing',
    },
    'runtime.button.extraModelRetryTitle': {
        "ja-JP": "[MVU]追加モデル解析を再試行",
        en: '[MVU] Retry extra-model parsing',
    },
    'runtime.button.extraModelParsingCompleted': {
        "ja-JP": '解析完成',
        en: 'Parsing completed',
    },
    'runtime.button.cleanupPrompt': {
        "ja-JP":
            '<h4>清除旧楼层变量信息以减小聊天文件大小，避免手机崩溃</h4>请填写要保留变量信息的楼层数（如 10 为保留最后 10 层，每 [{interval}] 层保留一层作为快照）<br><strong>注意：你需要通过重演才能回退游玩到未保留变量信息的楼层</strong>',
        en: '<h4>Remove variable data from old floors to reduce chat file size and help prevent mobile crashes.</h4>Enter how many recent floors to retain (for example, 10 retains the latest 10 floors, with one snapshot every [{interval}] floors).<br><strong>Note: you must replay variables before returning to floors whose variable data was removed.</strong>',
    },
    'runtime.button.cleanupFailedTitle': {
        "ja-JP": '[MVU]清理旧楼层变量失败',
        en: '[MVU] Failed to clean old floor variables',
    },
    'runtime.button.cleanupSucceededTitle': {
        "ja-JP": '[MVU]清理旧楼层变量成功',
        en: '[MVU] Old floor variables cleaned',
    },
    'runtime.button.cleanupCompleted': {
        "ja-JP": '已清理旧变量，保留了最后 {depth} 层的变量',
        en: 'Old variables were cleaned; variables for the latest {depth} floors were retained',
    },
    'runtime.button.snapshotMarkedLog': {
        "ja-JP": '将 [{floor}] 层作为快照楼层',
        en: 'Marked floor [{floor}] as a snapshot floor',
    },

    'runtime.characterOverride.worldbookReadFailed': {
        "ja-JP": '无法读取角色世界书“{worldbook}”',
        en: 'Unable to read character lorebook “{worldbook}”',
    },
    'runtime.characterOverride.contentMustBeObject': {
        "ja-JP": "配置正文必须是 JSON 対象",
        en: 'The settings content must be a JSON object',
    },
    'runtime.characterOverride.conflictPrompt': {
        "ja-JP":
            '角色世界书“{worldbook}”中的 {entry} 已被其他来源修改。是否使用待保存的角色卡配置覆盖它？',
        en: '{entry} in character lorebook “{worldbook}” was modified by another source. Overwrite it with the pending character-card configuration?',
    },
    'runtime.characterOverride.overwriteButton': {
        "ja-JP": '覆盖',
        en: 'Overwrite',
    },
    'runtime.characterOverride.loadLatestButton': {
        "ja-JP": '加载最新配置',
        en: 'Load latest configuration',
    },
    'runtime.characterOverride.bindingReadFailedLog': {
        "ja-JP": '[MVU]读取角色世界书绑定失败',
        en: '[MVU] Failed to read the character lorebook binding',
    },
    'runtime.characterOverride.readFailedLog': {
        "ja-JP": '[MVU]读取角色卡配置失败',
        en: '[MVU] Failed to read the character-card configuration',
    },
    'runtime.characterOverride.readFailedTitle': {
        "ja-JP": '[MVU]读取角色卡配置失败',
        en: '[MVU] Failed to read character-card configuration',
    },
    'runtime.characterOverride.stopWithUnsavedChangesLog': {
        "ja-JP": '[MVU]停止角色卡配置控制器时仍未能保存“{worldbook}”中的修改',
        en: '[MVU] Changes in “{worldbook}” were still unsaved when the character-card configuration controller stopped',
    },
    'runtime.characterOverride.reloadFailedLog': {
        "ja-JP": '[MVU]重新读取角色卡配置失败',
        en: '[MVU] Failed to reload the character-card configuration',
    },
    'runtime.characterOverride.reloadFailedTitle': {
        "ja-JP": '[MVU]重新读取角色卡配置失败',
        en: '[MVU] Failed to reload character-card configuration',
    },
    'runtime.characterOverride.duplicateEntries': {
        "ja-JP":
            "角色世界书“{worldbook}”中存在 {count} 个关闭的 {entry} エントリ，仅使用扫描到的第一个。",
        en: 'Character lorebook “{worldbook}” contains {count} disabled {entry} entries. Only the first scanned entry will be used.',
    },
    'runtime.characterOverride.duplicateEntriesTitle': {
        "ja-JP": '[MVU]角色卡配置重复',
        en: '[MVU] Duplicate character-card configuration',
    },
    'runtime.characterOverride.invalidWorldbookData': {
        "ja-JP": '角色世界书“{worldbook}”的数据格式无效',
        en: 'Character lorebook “{worldbook}” has an invalid data format',
    },
    'runtime.characterOverride.invalidConfigurationLog': {
        "ja-JP": '[MVU]角色世界书“{worldbook}”的 {entry} 配置无效',
        en: '[MVU] The {entry} configuration in character lorebook “{worldbook}” is invalid',
    },
    'runtime.characterOverride.invalidConfiguration': {
        "ja-JP": '角色世界书“{worldbook}”中的配置无效，已按不存在处理：{cause}',
        en: 'The configuration in character lorebook “{worldbook}” is invalid and will be treated as absent: {cause}',
    },
    'runtime.characterOverride.invalidConfigurationTitle': {
        "ja-JP": '[MVU]角色卡配置无效',
        en: '[MVU] Invalid character-card configuration',
    },
    'runtime.characterOverride.saveFailedLog': {
        "ja-JP": '[MVU]保存角色卡配置失败',
        en: '[MVU] Failed to save the character-card configuration',
    },
    'runtime.characterOverride.saveFailedTitle': {
        "ja-JP": '[MVU]保存角色卡配置失败',
        en: '[MVU] Failed to save character-card configuration',
    },

    'runtime.cleanup.title': {
        "ja-JP": '[MVU]自动清理',
        en: '[MVU] Automatic cleanup',
    },
    'runtime.cleanup.legacyPrompt': {
        "ja-JP":
            '检测到可以清理本聊天文件中的旧变量以减小文件体积，是否清理？（备份会消耗较多内存，手机上建议关闭其他后台应用后进行，或在计算机上备份）',
        en: 'Old variables can be removed from this chat to reduce its file size. Clean them now? (Creating a backup uses considerable memory; on mobile, close other background apps first or create the backup on a computer.)',
    },
    'runtime.cleanup.cleanOnlyButton': {
        "ja-JP": '仅清理',
        en: 'Clean only',
    },
    'runtime.cleanup.doNotRemindButton': {
        "ja-JP": '不再提醒',
        en: 'Do not remind me again',
    },
    'runtime.cleanup.backupAndCleanButton': {
        "ja-JP": '备份并清理',
        en: 'Back up and clean',
    },
    'runtime.cleanup.starting': {
        "ja-JP": '即将开始清理旧聊天记录中的变量…',
        en: 'Cleaning variables from old chat messages…',
    },
    'runtime.cleanup.startingWithBackup': {
        "ja-JP": '即将开始清理旧聊天记录中的变量，并自动生成备份…',
        en: 'Creating a backup, then cleaning variables from old chat messages…',
    },
    'runtime.cleanup.exportFailed': {
        "ja-JP": '聊天记录导出失败，放弃清理：{cause}',
        en: 'Chat export failed; cleanup was cancelled: {cause}',
    },
    'runtime.cleanup.exportSucceeded': {
        "ja-JP": '聊天记录导出成功：{message}',
        en: 'Chat exported successfully: {message}',
    },
    'runtime.cleanup.cleanedMessages': {
        "ja-JP": '已清理旧聊天记录中的 {count} 条消息',
        en: 'Cleaned {count} messages from the old chat history',
    },
    'runtime.cleanup.cleanedFloorsLog': {
        "ja-JP": '[MVU]已清理 {count} 层的消息',
        en: '[MVU] Cleaned messages on {count} floors',
    },
    'runtime.cleanup.restoreNotNeededLog': {
        "ja-JP": '最近 {count} 层都包含变量数据，不需要进行恢复。',
        en: 'All of the latest {count} floors contain variable data; restoration is not needed.',
    },
    'runtime.cleanup.restoreUnavailable': {
        "ja-JP": '在 0～{floor} 层找不到有效的变量信息，无法进行楼层变量恢复',
        en: 'No valid variable data was found between floors 0 and {floor}; floor variables cannot be restored',
    },
    'runtime.cleanup.restoreTitle': {
        "ja-JP": '[MVU]恢复旧楼层变量',
        en: '[MVU] Restore old floor variables',
    },

    'runtime.initvar.noMessagesLog': {
        "ja-JP": '不存在任何一条消息，退出',
        en: 'No messages exist; initialization stopped',
    },
    'runtime.initvar.greetingRequired': {
        "ja-JP": '需要有开场白才能初始化变量',
        en: 'A greeting message is required to initialize variables',
    },
    'runtime.initvar.initializationFailedTitle': {
        "ja-JP": '[MVU]变量初始化失败',
        en: '[MVU] Variable initialization failed',
    },
    'runtime.initvar.oldLorebookFormatLog': {
        "ja-JP": '检测到旧的 initialized_lorebooks 数组格式，正在迁移到新的对象格式。',
        en: 'Old initialized_lorebooks array format detected. Migrating to the new object format.',
    },
    'runtime.initvar.chatVariablesInitializedLog': {
        "ja-JP": '聊天变量已初始化。',
        en: 'Chat variables initialized.',
    },
    'runtime.initvar.blockParseFailedLog': {
        "ja-JP": '解析 initvar 块失败：{cause}',
        en: 'Failed to parse initvar block: {cause}',
    },
    'runtime.initvar.initializationCompletedLog': {
        "ja-JP": '变量初始化完成',
        en: 'Variable initialization completed',
    },
    'runtime.initvar.initializationSucceeded': {
        "ja-JP": '已加载新的世界书初始化变量，当前使用世界书：<br>{books}',
        en: 'New lorebook initialization variables were loaded. Active lorebooks:<br>{books}',
    },
    'runtime.initvar.initializationSucceededTitle': {
        "ja-JP": "[MVU]変数初期化成功",
        en: '[MVU] Variable initialization succeeded',
    },
    'runtime.initvar.primaryLorebookReadFailedLog': {
        "ja-JP": "获取角色主 lorebook 失敗，已忽略",
        en: 'Failed to obtain the primary character lorebook; ignoring it',
    },
    'runtime.initvar.entryParseFailedLog': {
        "ja-JP": "解析世界书条目“{comment}”失敗：{cause}",
        en: 'Failed to parse lorebook entry “{comment}”: {cause}',
    },
    'runtime.initvar.entryParseFailedTitle': {
        "ja-JP": "[MVU]解析世界书条目“{comment}”失敗",
        en: '[MVU] Failed to parse lorebook entry “{comment}”',
    },
    'runtime.initvar.noMessages': {
        "ja-JP": '不存在任何一条消息',
        en: 'No messages exist',
    },

    'runtime.notification.settingsUiUpdatedTitle': {
        "ja-JP": '[MVU]已更新独立配置界面',
        en: '[MVU] Dedicated settings panel updated',
    },
    'runtime.notification.settingsUiUpdatedBody': {
        "ja-JP": '配置界面位于酒馆扩展界面中的“正则”下方，请点开了解新功能或自定义配置',
        en: 'The settings panel is located below “Regex” in SillyTavern Extensions. Open it to review new features or customize MVU.',
    },
    'runtime.notification.autoCleanupFeatureTitle': {
        "ja-JP": '[MVU]已更新自动清理旧变量功能',
        en: '[MVU] Automatic cleanup updated',
    },
    'runtime.notification.autoCleanupFeatureBody': {
        "ja-JP":
            'MVU 现在可以自动清理旧变量来减少聊天文件大小；这不会影响你回退游玩以前的楼层。可在设置中开启“变量自动清理”。',
        en: 'MVU can now automatically remove old variable data to reduce chat file size without preventing you from returning to earlier floors. Enable Automatic Variable Cleanup in settings.',
    },
    'runtime.notification.customApiOptionsTitle': {
        "ja-JP": '[MVU]已更新更多自定义 API 配置',
        en: '[MVU] More custom API options added',
    },
    'runtime.notification.customApiOptionsBody': {
        "ja-JP":
            "MVU 现在可以自定义 API 的温度、頻度ペナルティ、存在惩罚和最大回复 token 数；需要酒馆助手版本 >= 4.0.14。",
        en: 'MVU now supports custom API temperature, frequency penalty, presence penalty, and maximum response tokens. TavernHelper >= 4.0.14 is required.',
    },
    'runtime.notification.cleanupDefaultTitle': {
        "ja-JP": '[MVU]已更新自动清理配置',
        en: '[MVU] Automatic cleanup settings updated',
    },
    'runtime.notification.cleanupDefaultBody': {
        "ja-JP": 'MVU 现在会自动清理较老楼层上的变量信息，以降低聊天文件大小。',
        en: 'MVU now automatically removes variable data from older floors to reduce chat file size.',
    },
    'runtime.notification.builtinJailbreakTitle': {
        "ja-JP": '[MVU]已内置破限',
        en: '[MVU] Built-in jailbreak prompt added',
    },
    'runtime.notification.builtinJailbreakBody': {
        "ja-JP":
            "现在，额外模型解析如果取消“プリセット送信”，则会使用内置的破限提示词——既避免写作任务又避免道歉。",
        en: 'When Send Preset is disabled, extra-model parsing now uses a built-in jailbreak prompt designed to avoid both writing tasks and refusals.',
    },
    'runtime.notification.concurrentRequestsTitle': {
        "ja-JP": '[MVU]已支持同时多次请求变量更新',
        en: '[MVU] Concurrent variable-update requests added',
    },
    'runtime.notification.concurrentRequestsBody': {
        "ja-JP":
            "现在，你可以在“变量更新方式 → 请求策略 → リクエスト方式”中选择并发请求，提高额外模型解析成功率并节省时间。",
        en: 'You can now choose concurrent requests under Variable Update Method → Request Strategy → Request Method to improve extra-model parsing success rates and save time.',
    },
    'runtime.notification.buildInfo': {
        "ja-JP": '构建信息：{date}（{commit}）',
        en: 'Build: {date} ({commit})',
    },
    'runtime.notification.scriptLoadedTitle': {
        "ja-JP": '[MVU]脚本加载成功',
        en: '[MVU] Script loaded',
    },

    'runtime.filter.toolCallingUnsupported': {
        "ja-JP": "現在 TavernHelper 版本或预设/API 不支持工具调用，已退化回 `主AI追従出力`",
        en: 'The current TavernHelper version or preset/API does not support tool calling. Falling back to Follow AI Output.',
    },
    'runtime.filter.toolCallingUnsupportedTitle': {
        "ja-JP": '[MVU]无法使用工具调用',
        en: '[MVU] Tool calling unavailable',
    },
    'runtime.filter.globalSettingsSource': {
        "ja-JP": "ユーザー共通設定",
        en: 'global user settings',
    },
    'runtime.filter.characterSettingsSource': {
        "ja-JP": "キャラクターカード設定",
        en: 'character-card settings',
    },
    'runtime.filter.whitelistRegexLabel': {
        "ja-JP": '白名单正则',
        en: 'whitelist regex',
    },
    'runtime.filter.blacklistRegexLabel': {
        "ja-JP": '黑名单正则',
        en: 'blacklist regex',
    },
    'runtime.filter.invalidRegex': {
        "ja-JP": '{source}的{label}无效，已在本轮世界书条目过滤中忽略：{cause}',
        en: 'The {label} from {source} is invalid and was ignored for this lorebook filtering pass: {cause}',
    },
    'runtime.filter.invalidRegexTitle': {
        "ja-JP": '[MVU]世界书条目过滤正则无效',
        en: '[MVU] Invalid lorebook entry filter regex',
    },
    'runtime.filter.logTitle': {
        "ja-JP": '[MVU]世界书条目黑/白名单筛选结果',
        en: '[MVU] Lorebook entry allowlist/blocklist filtering results',
    },
    'runtime.regex.jsStyleSyntax': {
        "ja-JP": 'JS 风格正则需要以 /pattern/flags 形式书写',
        en: 'JavaScript-style regular expressions must use the /pattern/flags form',
    },

    'runtime.functionCalling.versionUnsupported': {
        "ja-JP": '当前酒馆助手版本为 {current}，工具调用需要酒馆助手 {required} 或更高版本',
        en: 'The current TavernHelper version is {current}. Tool calling requires TavernHelper {required} or later.',
    },
    'runtime.extraModel.characterLorebookUnavailableLog': {
        "ja-JP": '无法找到角色世界书，在多人聊天下不支持额外模型解析。',
        en: 'The character lorebook could not be found. Extra-model parsing is unavailable in group chats.',
    },
    'runtime.extraModel.v4RequiresCustomSource': {
        "ja-JP": "[MVU额外模型解析]フォーマット出力(v4兼容)需要额外模型来源为自定义，不能与插头相同。",
        en: '[MVU extra-model parsing] Formatted Output (v4 Compatible) requires a Custom model source and cannot use Same as Primary Connection.',
    },
    'runtime.extraModel.customIncludeBodyInvalid': {
        "ja-JP": '[MVU额外模型解析]custom_include_body 不是 YAML object，无法合并配置。',
        en: '[MVU extra-model parsing] custom_include_body is not a YAML object, so the configuration cannot be merged.',
    },
    'runtime.extraModel.saveSettingsUnavailable': {
        "ja-JP": '[MVU额外模型解析]无法获取 SillyTavern saveSettings，不能临时更新配置。',
        en: '[MVU extra-model parsing] SillyTavern saveSettings is unavailable; settings cannot be updated temporarily.',
    },
    'runtime.extraModel.openAiSettingsUnavailable': {
        "ja-JP": "[MVU额外模型解析]无法获取 SillyTavern OpenAI 設定。",
        en: '[MVU extra-model parsing] SillyTavern OpenAI settings are unavailable.',
    },
    'runtime.extraModel.openAiSettingsRestoreUnavailable': {
        "ja-JP": "[MVU额外模型解析]无法获取 SillyTavern OpenAI 設定，不能恢复配置。",
        en: '[MVU extra-model parsing] SillyTavern OpenAI settings are unavailable; the configuration cannot be restored.',
    },
    'runtime.extraModel.requesting': {
        "ja-JP": '正在请求 AI 回复…',
        en: 'Requesting an AI response…',
    },
    'runtime.extraModel.retrying': {
        "ja-JP": '正在重试（{attempt} / {total}）…',
        en: 'Retrying ({attempt} / {total})…',
    },
    'runtime.extraModel.updateInProgressTitle': {
        "ja-JP": '[MVU额外模型解析]变量更新中',
        en: '[MVU extra-model parsing] Updating variables',
    },
    'runtime.extraModel.concurrentRequests': {
        "ja-JP": '将同时请求 {count} 次 AI 回复以提高成功率…',
        en: 'Requesting {count} AI responses concurrently to improve the success rate…',
    },
    'runtime.extraModel.firstRequest': {
        "ja-JP": '将先请求一次，尝试是否能成功…',
        en: 'Trying one request first…',
    },
    'runtime.extraModel.firstRequestFailed': {
        "ja-JP": '首次请求失败，将同时请求 {count} 次 AI 回复以提高成功率…',
        en: 'The first request failed. Requesting {count} AI responses concurrently to improve the success rate…',
    },
    'runtime.extraModel.updateTagMissing': {
        "ja-JP": "[MVU额外模型解析]没有能从回复中找到<UpdateVariable>タグ",
        en: '[MVU extra-model parsing] No <UpdateVariable> tag was found in the response',
    },
    'runtime.extraModel.updateCommandsInvalid': {
        "ja-JP": "[MVU额外模型解析]从回复找到了<UpdateVariable>タグ，但其内的更新命令无效",
        en: '[MVU extra-model parsing] An <UpdateVariable> tag was found, but its update commands are invalid',
    },
    'runtime.extraModel.firstFloorSkippedLog': {
        "ja-JP": '[MVU]对第一层永不进行额外模型解析',
        en: '[MVU] Extra-model parsing is never performed on the first floor',
    },
    'runtime.extraModel.autoRequestDisabledLog': {
        "ja-JP": '[MVU]不自动触发额外模型解析',
        en: '[MVU] Automatic extra-model parsing is disabled',
    },
    'runtime.extraModel.updateFailed': {
        "ja-JP": '建议调整变量更新方式；可在“输入框左下角魔棒 → 日志查看器”查看具体情况',
        en: 'Try adjusting the variable update method. Open Magic Wand → Log Viewer at the lower-left of the input box for details.',
    },
    'runtime.extraModel.updateFailedTitle': {
        "ja-JP": '[MVU额外模型解析]变量更新失败',
        en: '[MVU extra-model parsing] Variable update failed',
    },

    // Pi 运行时统一错误文案：只插入经过分类的参数，不拼接服务商原始响应或认证信息。
    'runtime.pi.invalidConfig': {
        "ja-JP": "“その他”配置无效，请检查其中的来源、API 和认证设置。",
        en: 'The More-source configuration is invalid. Check its provider, API, and authentication settings.',
    },
    'runtime.pi.unknownProvider': {
        "ja-JP": "“その他”中所选来源不可用，请重新选择来源。",
        en: 'The selected provider under More is unavailable. Select a provider again.',
    },
    'runtime.pi.unsupportedApi': {
        "ja-JP": "“その他”中所选来源不支持当前 API，请改用该来源支持的 API。",
        en: 'The selected provider under More does not support the current API. Choose an API supported by this provider.',
    },
    'runtime.pi.unsupportedAuth': {
        "ja-JP": "“その他”中所选来源不支持当前认证方式，请改用该来源支持的认证方式。",
        en: 'The selected provider under More does not support the current authentication method. Choose a supported method.',
    },
    'runtime.pi.missingApiKey': {
        "ja-JP": "请输入“その他”中所选来源的 API Key。",
        en: 'Enter an API key for the selected provider under More.',
    },
    'runtime.pi.missingOAuthCredential': {
        "ja-JP": "“その他”中所选来源尚未完成 OAuth 登录，请先登录。",
        en: 'The selected provider under More is not signed in with OAuth. Sign in before retrying.',
    },
    'runtime.pi.oauthCredentialExpired': {
        "ja-JP": "“その他”的 OAuth 凭据已过期且无法刷新，请登出后再登录。",
        en: 'The OAuth credential for More has expired and could not be refreshed. Sign out, then sign in again.',
    },
    'runtime.pi.invalidEndpoint': {
        "ja-JP":
            "カスタム endpoint 必须使用 HTTPS；HTTP 仅允许 localhost、127.0.0.1 或 [::1]，且不能包含凭据、查询参数或片段。",
        en: 'The custom endpoint must use HTTPS. HTTP is limited to localhost, 127.0.0.1, or [::1]. Credentials, query parameters, and fragments are not allowed.',
    },
    'runtime.pi.customEndpointNotAllowed': {
        "ja-JP": "“その他”中所选来源使用固定 endpoint，不允许自定义。",
        en: 'The selected provider under More uses a fixed endpoint and does not allow a custom one.',
    },
    'runtime.pi.oauthEndpointNotAllowed': {
        "ja-JP": 'OAuth 来源必须使用注册的固定 endpoint，请清除自定义 endpoint。',
        en: 'OAuth providers must use their registered fixed endpoint. Clear the custom endpoint.',
    },
    'runtime.pi.oauthApiMismatch': {
        "ja-JP": "現在 OAuth 来源只能使用其锁定的兼容 API，请重新选择来源或认证方式。",
        en: 'This OAuth provider can only use its locked compatible API. Reselect the provider or authentication method.',
    },
    'runtime.pi.missingModel': {
        "ja-JP": "请填写“その他”来源的模型名称。",
        en: 'Enter a model name for the More source.',
    },
    'runtime.pi.invalidContextWindow': {
        "ja-JP": 'contextWindow 必须是正整数。',
        en: 'contextWindow must be a positive integer.',
    },
    'runtime.pi.missingContextWindow': {
        "ja-JP": "当前模型不在“その他”的内置目录中，请手动填写有效的 contextWindow。",
        en: 'The current model is not in the built-in catalog under More. Enter a valid contextWindow manually.',
    },
    'runtime.pi.invalidMaxTokens': {
        "ja-JP": '“最大回复 token 数”必须是正整数。',
        en: 'Maximum response tokens must be a positive integer.',
    },
    'runtime.pi.maxTokensExceedContext': {
        "ja-JP": '“最大回复 token 数”不能大于 contextWindow。',
        en: 'Maximum response tokens must not exceed contextWindow.',
    },
    'runtime.pi.anthropicSamplingConflict': {
        "ja-JP": 'Anthropic 的温度和 top_p 只能调整其中一个，请将另一个恢复为默认值 1。',
        en: 'Adjust either temperature or top_p for Anthropic. Reset the other to its default value of 1.',
    },
    'runtime.pi.customHeadersInvalid': {
        "ja-JP": "“その他”的自定义请求头必须是 YAML/JSON 対象，且值只能是字符串或 null。",
        en: 'Custom headers under More must be a YAML/JSON object whose values are strings or null.',
    },
    'runtime.pi.customConfigParseFailed': {
        "ja-JP": "“その他”的自定义请求配置不是有效的 YAML 或 JSON，请检查格式。",
        en: 'The custom request settings under More are not valid YAML or JSON. Check their formatting.',
    },
    'runtime.pi.customIncludeBodyInvalid': {
        "ja-JP": "“その他”的自定义请求体必须是 YAML/JSON 対象。",
        en: 'The custom request body under More must be a YAML/JSON object.',
    },
    'runtime.pi.customExcludeBodyInvalid': {
        "ja-JP": "“その他”的排除请求字段必须是 YAML/JSON 字段名数组。",
        en: 'Excluded request fields under More must be a YAML/JSON array of field names.',
    },
    'runtime.pi.customPayloadProtectedField': {
        "ja-JP": "“その他”的自定义请求配置不能覆盖、排除或设置认证及关键协议字段。",
        en: 'Custom request settings under More cannot override, exclude, or set authentication or other protected protocol fields.',
    },
    'runtime.pi.payloadInvalid': {
        "ja-JP": "“その他”来源的请求体必须是对象，请检查 API 配置。",
        en: 'The provider payload under More must be an object. Check the API configuration.',
    },
    'runtime.pi.structuredOutputSchemaMissing': {
        "ja-JP": "“その他”的格式化输出需要有效的 JSON Schema。",
        en: 'Formatted output under More requires a valid JSON Schema.',
    },
    'runtime.pi.structuredOutputUnsupported': {
        "ja-JP": "“その他”中当前来源、API 或模型不支持原生格式化输出，请更换配置后重试。",
        en: 'The current provider, API, or model under More does not support native formatted output. Change the configuration and retry.',
    },
    'runtime.pi.toolCallingUnsupported': {
        "ja-JP": "“その他”中当前来源、API 或模型不支持所需的工具调用模式，请更换配置后重试。",
        en: 'The current provider, API, or model under More does not support the required tool-calling mode. Change the configuration and retry.',
    },
    'runtime.pi.toolRequestRejected': {
        "ja-JP":
            "目标端点未接受“ツール呼び出し”请求。请确认该端点和模型支持工具调用，并检查 API タイプ、地址和模型名。",
        en: 'The target endpoint did not accept the tool-calling request. Confirm that the endpoint and model support tool calling, and check the API type, URL, and model name.',
    },
    'runtime.pi.structuredOutputRequestRejected': {
        "ja-JP":
            "目标端点未接受“フォーマット出力”请求。请确认该端点和模型支持 JSON Schema フォーマット出力，并检查 API タイプ、地址和模型名。",
        en: 'The target endpoint did not accept the formatted-output request. Confirm that the endpoint and model support JSON Schema formatted output, and check the API type, URL, and model name.',
    },
    'runtime.pi.jsonObjectRequestRejected': {
        "ja-JP":
            "目标端点未接受“フォーマット出力(v4兼容)”请求。请确认该端点和模型支持 JSON Object 输出，并检查 API タイプ、地址和模型名。",
        en: 'The target endpoint did not accept the v4-compatible formatted-output request. Confirm that the endpoint and model support JSON Object output, and check the API type, URL, and model name.',
    },
    'runtime.pi.namedToolChoiceUnsupported': {
        "ja-JP": "“その他”中的当前 API 不支持指定工具调用，请更换 API 或调整工具选择方式。",
        en: 'The current API under More does not support named tool choice. Choose another API or adjust the tool-choice mode.',
    },
    'runtime.pi.invalidToolDefinition': {
        "ja-JP":
            "“その他”来源的工具定义无效：function name 不能为空，且 parameters 根节点必须是 object。",
        en: 'The tool definition under More is invalid: function name cannot be empty, and the parameters root must be an object.',
    },
    'runtime.pi.invalidToolCall': {
        "ja-JP": "“その他”来源返回了无效的工具调用，请重试或更换模型。",
        en: 'The More source returned an invalid tool call. Retry or choose another model.',
    },
    'runtime.pi.toolUseMissingCall': {
        "ja-JP": "“その他”来源以工具调用结束，但没有返回工具调用内容，请重试或更换模型。",
        en: 'The More source stopped for tool use without returning a tool call. Retry or choose another model.',
    },
    'runtime.pi.imageInputUnsupported': {
        "ja-JP": "“その他”中的当前模型不支持图片输入，请移除图片或更换模型。",
        en: 'The current model under More does not support image input. Remove the image or choose another model.',
    },
    'runtime.pi.contextInvalidImage': {
        "ja-JP": "“その他”的图片输入必须是可解码的 image/* base64 data URL。",
        en: 'Image input under More must be a decodable image/* base64 data URL.',
    },
    'runtime.pi.remoteImageUnsupported': {
        "ja-JP": "“その他”当前不支持远程图片 URL，请改用 base64 data URL。",
        en: 'The More source does not currently support remote image URLs. Use a base64 data URL instead.',
    },
    'runtime.pi.videoUnsupported': {
        "ja-JP": "“その他”链路当前不支持视频内容，请移除视频后重试。",
        en: 'The More path does not currently support video content. Remove the video and retry.',
    },
    'runtime.pi.contextSystemPayloadMismatch': {
        "ja-JP": '无法在服务商请求中完整恢复 system 消息，已停止发送。请更新脚本或更换协议后重试。',
        en: 'Could not restore all system messages in the provider payload. Sending was stopped. Update the script or select another API and try again.',
    },
    'runtime.pi.contextMissingToolCall': {
        "ja-JP": '第 {index} 条历史工具结果无法找到对应的工具调用，请检查聊天历史。',
        en: 'Historical tool result {index} has no matching tool call. Check the chat history.',
    },
    'runtime.pi.contextUnsupportedContent': {
        "ja-JP": "第 {index} 条消息包含“その他”当前不支持的内容，请移除该内容后重试。",
        en: 'Message {index} contains content that More does not currently support. Remove it and retry.',
    },
    'runtime.pi.promptCaptureFailed': {
        "ja-JP": '未能捕获 SillyTavern 构建后的最终提示词，请重试并查看日志。',
        en: 'Could not capture the final prompt built by SillyTavern. Retry and check the logs.',
    },
    'runtime.pi.requestAlreadyActive': {
        "ja-JP": "同一“その他”请求已在运行，请等待它结束或先停止该请求。",
        en: 'The same More-source request is already running. Wait for it to finish or stop it first.',
    },
    'runtime.pi.tokenBudgetExceeded': {
        "ja-JP":
            '请求预计占用 {estimatedInput} 个输入 token；加上 {maxTokens} 个回复 token 和 {reserve} 个预留 token 后，超过 {contextWindow} 的上下文窗口。请缩短聊天历史、降低最大回复 token 数，或修正 contextWindow。',
        en: 'The request is estimated to use {estimatedInput} input tokens. Together with {maxTokens} response tokens and {reserve} reserved tokens, it exceeds the {contextWindow}-token context window. Shorten chat history, reduce maximum response tokens, or correct contextWindow.',
    },
    'runtime.pi.requestAborted': {
        "ja-JP": "“その他”请求已取消。",
        en: 'The More-source request was cancelled.',
    },
    'runtime.pi.browserNetworkError': {
        "ja-JP":
            "浏览器无法连接“その他”中所选来源。请检查网络、地址配置，并确认来源允许浏览器 CORS 请求。",
        en: 'The browser could not reach the selected provider under More. Check the network and address settings, and confirm that the provider allows browser CORS requests.',
    },
    'runtime.pi.proxyUnavailable': {
        "ja-JP":
            '没有开启Proxy。请在 SillyTavern 的 config.yaml 中开启 enableCorsProxy，或使用 --corsProxy 启动参数，然后重启 SillyTavern。',
        en: 'Proxy is not enabled. Enable enableCorsProxy in SillyTavern config.yaml, or start SillyTavern with --corsProxy, then restart SillyTavern.',
    },
    'runtime.pi.requestFailed': {
        "ja-JP": "“その他”来源请求失败。请检查来源配置、凭据和网络后重试。",
        en: 'The provider request under More failed. Check the provider settings, credentials, and network, then retry.',
    },
    'runtime.pi.featureDisabled': {
        "ja-JP": "此构建已关闭“その他”モデル出典；请选择“プラグと同じ”或“カスタム”。",
        en: 'The More model source is disabled in this build. Select Same as current connection or Custom.',
    },
    'runtime.pi.protocolError': {
        "ja-JP": "“その他”来源返回了无效的协议数据，请重试或更换来源/API。",
        en: 'The provider under More returned invalid protocol data. Retry or choose another provider/API.',
    },
    'runtime.pi.lengthTruncated': {
        "ja-JP": "“その他”回复因达到长度上限而被截断，请增加最大回复 token 数或缩短请求内容。",
        en: 'The response from More was truncated at the length limit. Increase maximum response tokens or shorten the request content.',
    },
    'runtime.pi.emptyResponse': {
        "ja-JP": "“その他”来源返回了空回复，请重试或更换模型。",
        en: 'The More source returned an empty response. Retry or choose another model.',
    },
    'runtime.pi.thinkingOnlyResponse': {
        "ja-JP": "“その他”回复仅包含 thinking，没有可用的业务内容，请重试或更换模型。",
        en: 'The response from More contained only thinking and no usable content. Retry or choose another model.',
    },
    'runtime.pi.deferredResponse': {
        "ja-JP": "“その他”回复尚未完成，当前不支持 deferred 結果。",
        en: 'The response from More is not complete; deferred results are not currently supported.',
    },
    'runtime.pi.oauth.cancelled': {
        "ja-JP": "“その他”的 OAuth 操作已取消，原凭据未更改。",
        en: 'The OAuth operation under More was cancelled. The existing credential was not changed.',
    },
    'runtime.pi.oauth.browserUnavailable': {
        "ja-JP":
            '当前页面缺少 OAuth 所需的 Fetch 或 Web Crypto 能力，请在支持的安全浏览器环境中重试。',
        en: 'Fetch or Web Crypto required for OAuth is unavailable. Retry in a supported secure browser context.',
    },
    'runtime.pi.oauth.unsupportedProvider': {
        "ja-JP": "“その他”中所选来源不支持浏览器 OAuth 登录，请改用 API Key 或其他来源。",
        en: 'The selected provider under More does not support browser OAuth sign-in. Use an API key or another provider.',
    },
    'runtime.pi.oauth.invalidCallback': {
        "ja-JP":
            'OAuth callback URL 无效。请从浏览器地址栏复制完整的 loopback callback URL 后重试。',
        en: 'The OAuth callback URL is invalid. Copy the complete loopback callback URL from the browser address bar and retry.',
    },
    'runtime.pi.oauth.stateMismatch': {
        "ja-JP": 'OAuth callback 与当前登录尝试不匹配。请取消当前尝试并重新登录。',
        en: 'The OAuth callback does not match the current sign-in attempt. Cancel it and start a new sign-in.',
    },
    'runtime.pi.oauth.authorizationFailed': {
        "ja-JP": 'OAuth 授权未完成或被来源拒绝，请重新发起登录。',
        en: 'OAuth authorization was not completed or was rejected by the provider. Start a new sign-in.',
    },
    'runtime.pi.oauth.browserNetwork': {
        "ja-JP":
            '浏览器无法连接 OAuth token 服务。请检查网络，并确认来源允许浏览器 CORS 请求；MVU 不会自动改用代理。',
        en: 'The browser could not reach the OAuth token service. Check the network and confirm that the provider allows browser CORS requests; MVU will not silently use a proxy.',
    },
    'runtime.pi.oauth.tokenHttp': {
        "ja-JP": 'OAuth token 交换被来源拒绝。请重新发起登录，不要重用之前的 callback URL。',
        en: 'The provider rejected the OAuth token exchange. Start a new sign-in and do not reuse the previous callback URL.',
    },
    'runtime.pi.oauth.tokenResponse': {
        "ja-JP": 'OAuth token 服务返回了无效响应，请稍后重新登录。',
        en: 'The OAuth token service returned an invalid response. Sign in again later.',
    },
    'runtime.pi.oauth.accountId': {
        "ja-JP": '无法从 OAuth 凭据中确认账户，请重新登录或选择其他账户。',
        en: 'The account could not be identified from the OAuth credential. Sign in again or choose another account.',
    },
    'runtime.pi.oauth.attemptExpired': {
        "ja-JP": 'OAuth 登录尝试已过期，请重新点击登录并使用新的授权链接。',
        en: 'The OAuth sign-in attempt has expired. Start a new sign-in and use the new authorization link.',
    },
    'runtime.pi.oauth.attemptUsed': {
        "ja-JP": 'OAuth 登录尝试已结束或 callback URL 已使用，请重新发起登录。',
        en: 'The OAuth sign-in attempt has ended or its callback URL was already used. Start a new sign-in.',
    },
    'runtime.pi.oauth.credentialStore': {
        "ja-JP": "无法读取或保存“その他”的 OAuth 凭据，请检查浏览器存储后重试。",
        en: 'The OAuth credential for More could not be read or saved. Check browser storage and retry.',
    },

    'runtime.variableUpdate.unknownCommand': {
        "ja-JP": '未知命令',
        en: 'unknown command',
    },
    'runtime.variableUpdate.errorTitle': {
        "ja-JP": '[MVU]发生变量更新错误，可能需要重 Roll：{command}',
        en: '[MVU] Variable update error; rerolling may help: {command}',
    },
    'runtime.variableUpdate.errorDetail': {
        "ja-JP": '错误详情：{detail}',
        en: 'Error details: {detail}',
    },
    'runtime.variableUpdate.messageOverwrittenTitle': {
        "ja-JP": '[MVU]消息内容被覆盖',
        en: '[MVU] Message content overwritten',
    },
    'runtime.variableUpdate.messageOverwritten': {
        "ja-JP":
            '第 {messageId} 层消息中其他插件的修改被覆盖，可尝试重新运行相关插件对此楼层的解析。',
        en: "Changes another plugin made to message #{messageId} were overwritten. Try rerunning that plugin's analysis for this message.",
    },
    'runtime.variableUpdate.setPathMissing': {
        "ja-JP": 'stat_data 中不存在路径“{path}”，已跳过 set 命令。{reason}',
        en: "Path '{path}' does not exist in stat_data; the set command was skipped. {reason}",
    },
    'runtime.variableUpdate.assignPrimitive': {
        "ja-JP": '路径“{path}”保存的是原始值（{type}），无法向其中 assign；已跳过操作。{reason}',
        en: "Cannot assign into path '{path}' because it holds a primitive value ({type}). The operation was skipped. {reason}",
    },
    'runtime.variableUpdate.mergeNonExtensibleObject': {
        "ja-JP": 'SCHEMA 违规：无法向路径“{path}”处不可扩展的对象合并数据。{reason}',
        en: "SCHEMA VIOLATION: Cannot merge data into the non-extensible object at path '{path}'. {reason}",
    },
    'runtime.variableUpdate.assignUnknownKey': {
        "ja-JP": 'SCHEMA 违规：无法向路径“{path}”处不可扩展的对象写入新键“{key}”。{reason}',
        en: "SCHEMA VIOLATION: Cannot assign the new key '{key}' into the non-extensible object at path '{path}'. {reason}",
    },
    'runtime.variableUpdate.assignNonExtensibleArray': {
        "ja-JP": 'SCHEMA 违规：无法向路径“{path}”处不可扩展的数组写入元素。{reason}',
        en: "SCHEMA VIOLATION: Cannot assign elements into the non-extensible array at path '{path}'. {reason}",
    },
    'runtime.variableUpdate.assignMissingParent': {
        "ja-JP": '路径“{path}”不存在，且其父级不可扩展，无法向其中 assign。{reason}',
        en: "Cannot assign into the non-existent path '{path}' without an extensible parent. {reason}",
    },
    'runtime.variableUpdate.mergeArrayIntoObject': {
        "ja-JP": '无法将数组合并到路径“{path}”处的对象中。',
        en: "Cannot merge an array into the object at '{path}'.",
    },
    'runtime.variableUpdate.mergeNonObjectIntoObject': {
        "ja-JP": '无法将非对象值合并到路径“{path}”处的对象中。',
        en: "Cannot merge a non-object value into the object at '{path}'.",
    },
    'runtime.variableUpdate.templateResolutionFailed': {
        "ja-JP": '解析路径“{path}”处的模板元数据失败：{cause}',
        en: "Failed to resolve template metadata at '{path}': {cause}",
    },
    'runtime.variableUpdate.assignInvalidArguments': {
        "ja-JP": '路径“{path}”上的 _.assign 参数无效。',
        en: "Invalid arguments for _.assign at path '{path}'.",
    },
    'runtime.variableUpdate.removePathUndefined': {
        "ja-JP": '_.remove 命令中的路径“{path}”未定义。',
        en: "Path '{path}' is undefined in the _.remove command.",
    },
    'runtime.variableUpdate.deleteTargetUndetermined': {
        "ja-JP": '无法确定路径“{path}”上的命令要删除的目标。{reason}',
        en: "Could not determine the deletion target for the command at path '{path}'. {reason}",
    },
    'runtime.variableUpdate.removePathMissing': {
        "ja-JP": '无法从不存在的路径“{path}”中删除内容。{reason}',
        en: "Cannot remove from the non-existent path '{path}'. {reason}",
    },
    'runtime.variableUpdate.removeNonExtensibleArray': {
        "ja-JP": 'SCHEMA 违规：无法从路径“{path}”处不可扩展的数组中删除元素。{reason}',
        en: "SCHEMA VIOLATION: Cannot remove an element from the non-extensible array at path '{path}'. {reason}",
    },
    'runtime.variableUpdate.removeRequiredKey': {
        "ja-JP": 'SCHEMA 违规：无法从路径“{path}”中删除必需键“{key}”。{reason}',
        en: "SCHEMA VIOLATION: Cannot remove the required key '{key}' from path '{path}'. {reason}",
    },
    'runtime.variableUpdate.removeNonCollection': {
        "ja-JP": '路径“{path}”处的值不是数组或对象，无法从中删除内容；已跳过命令。{reason}',
        en: "Cannot remove from path '{path}' because it is not an array or object. The command was skipped. {reason}",
    },
    'runtime.variableUpdate.removeExecutionFailed': {
        "ja-JP": '无法在路径“{path}”上执行 remove。',
        en: "Failed to execute remove at path '{path}'.",
    },
    'runtime.variableUpdate.addPathMissing': {
        "ja-JP": 'stat_data 中不存在路径“{path}”，已跳过 add 命令。{reason}',
        en: "Path '{path}' does not exist in stat_data; the add command was skipped. {reason}",
    },
    'runtime.variableUpdate.dateDeltaNotNumber': {
        "ja-JP": '日期操作的增量“{delta}”不是数字，已跳过 add 命令。{reason}',
        en: "Delta '{delta}' for the date operation is not a number; the add command was skipped. {reason}",
    },
    'runtime.variableUpdate.deltaNotNumber': {
        "ja-JP": '增量“{delta}”不是数字，已跳过 add 命令。{reason}',
        en: "Delta '{delta}' is not a number; the add command was skipped. {reason}",
    },
    'runtime.variableUpdate.addUnsupportedValue': {
        "ja-JP": '路径“{path}”处的值不是日期或数字，已跳过 add 命令。{reason}',
        en: "The value at path '{path}' is not a date or number; the add command was skipped. {reason}",
    },
    'runtime.variableUpdate.addInvalidArguments': {
        "ja-JP": '路径“{path}”上的 _.add 参数数量无效。{reason}',
        en: "Invalid number of arguments for _.add at path '{path}'. {reason}",
    },

    'runtime.apiProfile.nameRequired': {
        "ja-JP": 'API 方案名称不能为空',
        en: 'API profile name cannot be empty',
    },
    'runtime.apiProfile.notFound': {
        "ja-JP": '未找到 API 方案：{name}',
        en: 'API profile not found: {name}',
    },
    'runtime.apiProfile.selectOrEnterName': {
        "ja-JP": '请先输入或选择一个 API 方案名称',
        en: 'Enter or select an API profile name first',
    },
    'runtime.apiProfile.alreadyExists': {
        "ja-JP": 'API 方案「{name}」已存在',
        en: 'API profile “{name}” already exists',
    },
    'runtime.apiProfile.piConfigRequired': {
        "ja-JP": "“その他”API 方案缺少完整的连接配置，无法保存。",
        en: 'A More-source API profile requires a complete connection snapshot before it can be saved.',
    },
    'runtime.apiProfile.enterNewName': {
        "ja-JP": '请先输入新方案名称',
        en: 'Enter a name for the new API profile first',
    },
    'runtime.preset.notSelected': {
        "ja-JP": '未选择额外模型预设',
        en: 'No extra-model preset was selected',
    },
    'runtime.preset.apiUnavailable': {
        "ja-JP": "当前环境未提供 getPreset 接続",
        en: 'The getPreset API is unavailable in the current environment',
    },
    'runtime.preset.readFailed': {
        "ja-JP": '无法读取预设“{name}”',
        en: 'Unable to read preset “{name}”',
    },

    'runtime.functionCall.invalidJsonPatch': {
        "ja-JP": '不是有效的 json patch',
        en: 'Invalid JSON Patch',
    },
    'runtime.functionCall.updateBlockParseFailedLog': {
        "ja-JP": "[MVU额外模型解析]无法解析变量更新块。内容：{content}；エラー：{cause}",
        en: '[MVU extra-model parsing] Failed to parse the variable update block. Content: {content}; error: {cause}',
    },
    'runtime.functionCall.resultParseFailedLog': {
        "ja-JP": '[MVU额外模型解析]函数调用结果解析失败：{cause}',
        en: '[MVU extra-model parsing] Failed to parse the function-call result: {cause}',
    },
    'runtime.functionCall.formattedOutputParseFailedLog': {
        "ja-JP": "[MVU额外模型解析]格式化输出解析失败。内容：{content}；エラー：{cause}",
        en: '[MVU extra-model parsing] Failed to parse formatted output. Content: {content}; error: {cause}',
    },
});
