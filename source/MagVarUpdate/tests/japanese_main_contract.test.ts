import { decodeMvuSettings, encodeMvuSettings } from '../src/settings_compat';
import { canonicalParts, migrateStatData } from '../src/card_protocol';
import { extractCommands } from '../src/function/update_variables';

test('legacy settings import is private, preserves false/zero and locks main output', () => {
    const prior = { 更新方式: '额外模型解析', 额外模型解析配置: { 启用自动请求: true, 最大回复token数: 0 }, 自动清理变量: { 启用: false }, unknown: { keep: false } };
    const before = JSON.stringify(prior);
    const next = decodeMvuSettings(prior);
    expect(next.更新方式).toBe('主AI追従出力');
    expect(next.追加モデル解析設定.自動リクエスト有効).toBe(false);
    expect(next.追加モデル解析設定.最大応答トークン数).toBe(0);
    expect(next.自動クリーンアップ変数.有効).toBe(false);
    expect(next.unknown.keep).toBe(false);
    expect(encodeMvuSettings({ ...next, 更新方式: '追加モデル解析' }).更新方式).toBe('主AI追従出力');
    expect(JSON.stringify(prior)).toBe(before);
});

test('historical JSON Pointer inserts use canonical containers without splitting entity names', () => {
    const commands = extractCommands('<UpdateVariable><JSONPatch>[{"op":"insert","path":"/キャラ/道具/名前.状態","value":{"品質":"F","数量":1}}]</JSONPatch></UpdateVariable>');
    expect(commands).toHaveLength(1);
    expect(commands[0].args[0]).toBe('["キャラ"]["アイテム"]');
    expect(JSON.parse(commands[0].args[1])).toBe('名前.状態');
});

test('open attribute maps migrate protocol attributes while preserving unknown values', () => {
    const next = migrateStatData({ キャラ: { 状態: { 祝福: { 原始属性: { 力量: 2, 魔法独自値: 9 } } } } });
    expect(next.キャラ.状態.祝福.原始属性).toEqual({ 筋力: 2, 魔法独自値: 9 });
});

test('schema migration preserves entity identities and prose, and is idempotent', () => {
    const prior = { 世界: { 后台: { 事件: { 状态: { 状态: '进行中', 描述: '状态 中文正文' } } } }, 角色: { 空间币: 0 }, キャラ: { スペースコイン: 7 } };
    const before = JSON.stringify(prior);
    const next = migrateStatData(prior);
    expect(next.世界.バックステージ.事件.状态).toEqual({ 状態: '進行中', 説明: '状态 中文正文' });
    expect(next.キャラ.スペースコイン).toBe(7);
    expect(migrateStatData(next)).toEqual(next);
    expect(JSON.stringify(prior)).toBe(before);
    expect(canonicalParts(['世界', '后台', '事件', '状态', '状态'])).toEqual(['世界', 'バックステージ', '事件', '状态', '状態']);
});
