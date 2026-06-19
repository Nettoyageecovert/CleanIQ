export type Language = 'en' | 'fr';

export interface UserPrefs {
  darkMode: boolean;
  emailNotifications: boolean;
  language: Language;
}

export const DEFAULT_PREFS: UserPrefs = {
  darkMode: false,
  emailNotifications: true,
  language: 'en',
};

export function prefsStorageKey(userId: string) {
  return `cleaniq_prefs_${userId}`;
}

function normalizeLanguage(raw: unknown): Language {
  if (raw === 'fr' || raw === 'es') return 'fr';
  return 'en';
}

export function loadUserPrefs(userId: string | undefined): UserPrefs {
  if (!userId) return { ...DEFAULT_PREFS };
  try {
    const saved = localStorage.getItem(prefsStorageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<UserPrefs>;
      return {
        darkMode: Boolean(parsed.darkMode),
        emailNotifications: parsed.emailNotifications !== false,
        language: normalizeLanguage(parsed.language),
      };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_PREFS };
}

export function saveUserPrefs(userId: string, prefs: UserPrefs) {
  localStorage.setItem(prefsStorageKey(userId), JSON.stringify(prefs));
}

export function applyTheme(darkMode: boolean) {
  const theme = darkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
}

export function applyLanguage(language: Language) {
  document.documentElement.lang = language;
}

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English (Default)' },
  { value: 'fr', label: 'Français' },
];
