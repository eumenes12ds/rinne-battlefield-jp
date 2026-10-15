import { handleVariablesInMessage } from '@/function/update_variables';
import { useDataStore } from '@/store';
// This card processes the main reply only. No extra-model dispatch exists here.
export async function onMessageReceived(message_id: number, { signal }: { force?: boolean; signal?: AbortSignal } = {}) {
    if (signal?.aborted) return;
    const message = getChatMessages(message_id).at(-1);
    if (!message || message.message.length < 5) return;
    if (useDataStore().effective_settings.互換性.sendasをuserメッセージとみなさない === false && message.name !== SillyTavern.name2) return;
    await handleVariablesInMessage(message_id);
}
