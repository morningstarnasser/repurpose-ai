export const LANGUAGES = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "de", label: "German", nativeName: "Deutsch" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "it", label: "Italian", nativeName: "Italiano" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe" },
  { code: "ar", label: "Arabic", nativeName: "العربية" },
  { code: "ku", label: "Kurdish", nativeName: "Kurdî" },
  { code: "fa", label: "Persian", nativeName: "فارسی" },
  { code: "pt", label: "Portuguese", nativeName: "Português" },
  { code: "nl", label: "Dutch", nativeName: "Nederlands" },
  { code: "pl", label: "Polish", nativeName: "Polski" },
  { code: "ru", label: "Russian", nativeName: "Русский" },
  { code: "ja", label: "Japanese", nativeName: "日本語" },
  { code: "zh", label: "Chinese", nativeName: "中文" },
  { code: "ko", label: "Korean", nativeName: "한국어" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label || "English";
}
