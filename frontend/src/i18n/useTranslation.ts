import { usePreferences } from '../context/PreferencesContext';
import { translate, type TranslationKey } from './translations';

export function useTranslation() {
  const { prefs } = usePreferences();

  const t = (key: TranslationKey) => translate(prefs.language, key);

  return { t, language: prefs.language };
}
