export const TRAINING_CATEGORIES = [
  'Safety Module',
  'Technical Skillset',
  'Internal Certification',
  'Annual Compliance',
  'Leadership Series',
] as const;

export const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  'Safety Module': { icon: 'health_and_safety', color: '#d2e8d6' },
  'Technical Skillset': { icon: 'science', color: '#dae8be' },
  'Internal Certification': { icon: 'eco', color: '#b6ccba' },
  'Annual Compliance': { icon: 'home_health', color: '#f8dac5' },
  'Leadership Series': { icon: 'workspace_premium', color: '#efeeea' },
};

export const getCategoryIcon = (category: string) =>
  CATEGORY_ICONS[category] ?? { icon: 'school', color: '#dae8be' };
