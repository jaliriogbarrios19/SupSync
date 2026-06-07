import { getLanguage } from "obsidian";
import en from "./en.json";
import es from "./es.json";

type LocaleMap = Record<string, string>;

const locales: Record<string, LocaleMap> = { en, es };
const fallback: LocaleMap = en;

let currentLocale: LocaleMap = en;

export function initLocale(): void {
    const lang = getLanguage();
    currentLocale = locales[lang] || fallback;
}

export function t(key: string, params?: Record<string, string | number>): string {
    let text = currentLocale[key] || fallback[key] || key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, String(v));
        }
    }
    return text;
}
