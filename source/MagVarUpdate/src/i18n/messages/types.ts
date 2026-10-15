export const APP_LOCALES = ["ja-JP", 'en', 'ja'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export type MessageTranslations = Record<Exclude<AppLocale, 'ja'>, string>;

export type MessageModule = Record<string, MessageTranslations>;

export function defineMessages<const T extends MessageModule>(messages: T): T {
    return messages;
}
