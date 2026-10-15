import { normalizeMvuSettings } from './settings_contract';
export function decodeMvuSettings(value: unknown): any {
    const result=normalizeMvuSettings(value);
    if (result && typeof result === 'object') { result.更新方式='主AI追従出力'; if(result.追加モデル解析設定) result.追加モデル解析設定.自動リクエスト有効=false; }
    return result;
}
export const encodeMvuSettings = (value: unknown, _previous?: unknown): any => decodeMvuSettings(value);
export function readMvuSettings(): unknown {
    const settings=SillyTavern.extensionSettings;
    return _.get(settings,'rinne_jp_mvu_settings',_.get(settings,'mvu_jp_settings',_.get(settings,'mvu_settings',{})));
}
