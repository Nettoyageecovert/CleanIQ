import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  applyLanguage,
  applyTheme,
  DEFAULT_PREFS,
  loadUserPrefs,
  saveUserPrefs,
  type Language,
  type UserPrefs,
} from '../utils/userPrefs';

interface PreferencesContextType {
  prefs: UserPrefs;
  setDarkMode: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setLanguage: (value: Language) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    if (!user?.id) {
      setPrefs(DEFAULT_PREFS);
      applyTheme(false);
      applyLanguage('en');
      return;
    }

    const loaded = loadUserPrefs(user.id);
    setPrefs(loaded);
    applyTheme(loaded.darkMode);
    applyLanguage(loaded.language);
  }, [user?.id]);

  const persistPrefs = (updater: (prev: UserPrefs) => UserPrefs) => {
    setPrefs(prev => {
      const next = updater(prev);
      applyTheme(next.darkMode);
      applyLanguage(next.language);
      if (user?.id) saveUserPrefs(user.id, next);
      return next;
    });
  };

  const setDarkMode = (darkMode: boolean) => persistPrefs(prev => ({ ...prev, darkMode }));
  const setEmailNotifications = (emailNotifications: boolean) =>
    persistPrefs(prev => ({ ...prev, emailNotifications }));
  const setLanguage = (language: Language) => persistPrefs(prev => ({ ...prev, language }));

  return (
    <PreferencesContext.Provider value={{ prefs, setDarkMode, setEmailNotifications, setLanguage }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
};
