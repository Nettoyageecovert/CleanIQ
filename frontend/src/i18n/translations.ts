import type { Language } from '../utils/userPrefs';

type TranslationKey =
  | 'settings.title'
  | 'settings.profile'
  | 'settings.security'
  | 'settings.preferences'
  | 'settings.language'
  | 'settings.languageHint'
  | 'settings.selectLanguage'
  | 'settings.darkMode'
  | 'settings.emailNotifications'
  | 'settings.saveChanges'
  | 'settings.languageUpdated'
  | 'language.en'
  | 'language.fr'
  | 'dashboard.resumeLearning'
  | 'dashboard.joinLiveQuiz'
  | 'dashboard.viewAll'
  | 'dashboard.noHistory'
  | 'dashboard.noLeaderboard'
  | 'courses.resumeLearning'
  | 'courses.joinLiveQuiz'
  | 'courses.noCourses';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'settings.title': 'Account Settings',
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.languageHint': 'Choose your display language',
    'settings.selectLanguage': 'Select Language',
    'settings.darkMode': 'Dark Mode',
    'settings.emailNotifications': 'Email Notifications',
    'settings.saveChanges': 'Save Changes',
    'settings.languageUpdated': 'Language set to',
    'language.en': 'English (Default)',
    'language.fr': 'Français',
    'dashboard.resumeLearning': 'Resume Learning',
    'dashboard.joinLiveQuiz': 'Take a Quiz',
    'dashboard.viewAll': 'View All',
    'dashboard.noHistory': 'No quiz attempts yet. Start training in Quiz Center.',
    'dashboard.noLeaderboard': 'Complete a quiz to appear on the leaderboard.',
    'courses.resumeLearning': 'Resume Learning',
    'courses.joinLiveQuiz': 'Take a Quiz',
    'courses.noCourses': 'No published courses yet. Check back soon.',
  },
  fr: {
    'settings.title': 'Paramètres du compte',
    'settings.profile': 'Profil',
    'settings.security': 'Sécurité',
    'settings.preferences': 'Préférences',
    'settings.language': 'Langue',
    'settings.languageHint': 'Choisissez votre langue d\'affichage',
    'settings.selectLanguage': 'Choisir la langue',
    'settings.darkMode': 'Mode sombre',
    'settings.emailNotifications': 'Notifications par e-mail',
    'settings.saveChanges': 'Enregistrer',
    'settings.languageUpdated': 'Langue définie sur',
    'language.en': 'Anglais (par défaut)',
    'language.fr': 'Français',
    'dashboard.resumeLearning': 'Reprendre la formation',
    'dashboard.joinLiveQuiz': 'Passer un quiz',
    'dashboard.viewAll': 'Tout voir',
    'dashboard.noHistory': 'Aucun quiz terminé. Commencez dans le Centre de quiz.',
    'dashboard.noLeaderboard': 'Terminez un quiz pour apparaître au classement.',
    'courses.resumeLearning': 'Reprendre la formation',
    'courses.joinLiveQuiz': 'Passer un quiz',
    'courses.noCourses': 'Aucun cours publié pour le moment.',
  },
};

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key] ?? translations.en[key] ?? key;
}

export type { TranslationKey };
