import { filterPrompts } from '@/function/request/filter_prompts';
import { onWorldinfoEntriesLoaded, onWorldinfoScanDone } from '@/function/request/worldinfo_scan';
import { controlledStoppableEventOn } from '@/util';
export function initWorldinfoFilter() {
    const loaded = controlledStoppableEventOn('worldinfo_entries_loaded', onWorldinfoEntriesLoaded);
    const scanned = controlledStoppableEventOn('worldinfo_scan_done', onWorldinfoScanDone);
    return () => { loaded(); scanned(); };
}
export function initRequest() { return controlledStoppableEventOn(tavern_events.CHAT_COMPLETION_SETTINGS_READY, filterPrompts); }
