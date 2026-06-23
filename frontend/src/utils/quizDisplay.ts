const CATEGORY_STYLES: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  'Safety Module': { icon: 'inventory_2', iconBg: '#f8dac5', iconColor: '#574333' },
  'Technical Skillset': { icon: 'science', iconBg: '#e3e2df', iconColor: '#434843' },
  'Internal Certification': { icon: 'eco', iconBg: '#dae8be', iconColor: '#3f4b2c' },
  'Annual Compliance': { icon: 'home_health', iconBg: '#fbddc7', iconColor: '#574333' },
  'Leadership Series': { icon: 'workspace_premium', iconBg: '#d2e8d6', iconColor: '#384b3e' },
};

const DEFAULT_STYLE = { icon: 'quiz', iconBg: '#dae8be', iconColor: '#3f4b2c' };

export const getCategoryStyle = (category: string) =>
  CATEGORY_STYLES[category] ?? DEFAULT_STYLE;

export const formatQuizDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
