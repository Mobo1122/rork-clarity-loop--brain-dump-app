export const DarkTheme = {
  background: '#0A0A0F',
  backgroundSecondary: '#12121A',
  card: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  
  primary: '#00D9FF',
  primaryDim: 'rgba(0, 217, 255, 0.15)',
  
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  actionAccent: '#FF8C42',
  clarityAccent: 'rgba(255, 255, 255, 0.4)',
  
  difficultyEasy: '#10B981',
  difficultyMedium: '#F59E0B',
  difficultyHard: '#EF4444',
  
  clarity: {
    pristine: '#E8F5E9',
    clear: '#00D9FF',
    mild: '#F5E6D3',
    moderate: '#FF9F43',
    cluttered: '#FF6B6B',
  },
  
  gradient: {
    pristine: ['#1A2F1A', '#0A0A0F'] as [string, string],
    clear: ['#0A2A35', '#0A0A0F'] as [string, string],
    mild: ['#2A2015', '#0A0A0F'] as [string, string],
    moderate: ['#3A2010', '#0A0A0F'] as [string, string],
    cluttered: ['#3A1515', '#0A0A0F'] as [string, string],
  },
};

export const LightTheme = {
  background: '#FFFFFF',
  backgroundSecondary: '#F5F7FA',
  card: 'rgba(0, 0, 0, 0.04)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
  inputBackground: 'rgba(0, 0, 0, 0.02)',
  
  primary: '#0099CC',
  primaryDim: 'rgba(0, 153, 204, 0.12)',
  
  text: '#0F1419',
  textSecondary: 'rgba(15, 20, 25, 0.7)',
  textTertiary: 'rgba(15, 20, 25, 0.5)',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  actionAccent: '#E07020',
  clarityAccent: 'rgba(15, 20, 25, 0.6)',
  
  difficultyEasy: '#059669',
  difficultyMedium: '#D97706',
  difficultyHard: '#DC2626',
  
  clarity: {
    pristine: '#D1FAE5',
    clear: '#0099CC',
    mild: '#FEF3C7',
    moderate: '#FDBA74',
    cluttered: '#FCA5A5',
  },
  
  gradient: {
    pristine: ['#ECFDF5', '#F8F9FA'] as [string, string],
    clear: ['#E0F7FA', '#F8F9FA'] as [string, string],
    mild: ['#FEF3C7', '#F8F9FA'] as [string, string],
    moderate: ['#FFEDD5', '#F8F9FA'] as [string, string],
    cluttered: ['#FEE2E2', '#F8F9FA'] as [string, string],
  },
};

export type Theme = typeof DarkTheme;

export default DarkTheme;
