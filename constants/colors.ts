/**
 * Zen Stone & Ink Color Palette
 *
 * Inspired by Japanese wabi-sabi aesthetics:
 * - Warm, organic tones from nature
 * - Ink blacks with warmth
 * - Washi paper creams
 * - Muted sage and terracotta accents
 * - Contemplative, serene atmosphere
 */

export const LightTheme = {
  // Washi paper backgrounds - warm, natural cream
  background: '#F7F5F0',
  backgroundSecondary: '#EFECE5',
  card: 'rgba(0, 0, 0, 0.03)',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  inputBackground: 'rgba(0, 0, 0, 0.02)',

  // Sage green primary - represents growth, clarity, completion
  primary: '#6B8E73',
  primaryDim: 'rgba(107, 142, 115, 0.12)',
  primaryMuted: '#8BA892',

  // Ink-inspired text - warm, not pure black
  text: '#2C2A26',
  textSecondary: '#6B665C',
  textTertiary: '#9C978D',

  // Status colors - muted, zen-like
  success: '#5A7360',
  warning: '#B8956B',
  error: '#A65D52',

  // Accent colors
  actionAccent: '#8B7355',
  clarityAccent: 'rgba(44, 42, 38, 0.5)',

  // Terracotta/clay secondary accent
  terracotta: '#C4A070',
  stone: '#A8A29E',

  // Difficulty indicators - subtle, not alarming
  difficultyEasy: '#6B8E73',
  difficultyMedium: '#B8956B',
  difficultyHard: '#A65D52',

  // Clarity states - gentle transitions, not jarring
  clarity: {
    pristine: '#D4E4D7',  // Soft sage
    clear: '#D8DDD9',     // Stone gray-green
    mild: '#E8E0D4',      // Warm sand
    moderate: '#E4D4C4',  // Soft clay
    cluttered: '#E0CCC4', // Muted rust
  },

  // Subtle gradients - minimal, contemplative
  gradient: {
    pristine: ['#EEF4EF', '#F7F5F0'] as [string, string],
    clear: ['#E8EDEA', '#F7F5F0'] as [string, string],
    mild: ['#F2EDE5', '#F7F5F0'] as [string, string],
    moderate: ['#EDE5DC', '#F7F5F0'] as [string, string],
    cluttered: ['#EAE0DA', '#F7F5F0'] as [string, string],
  },
};

export const DarkTheme = {
  // Ink stone backgrounds - deep, warm charcoal
  background: '#1A1917',
  backgroundSecondary: '#222120',
  card: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  inputBackground: 'rgba(255, 255, 255, 0.03)',

  // Sage green primary - adjusted for dark
  primary: '#8BA892',
  primaryDim: 'rgba(139, 168, 146, 0.15)',
  primaryMuted: '#6B8E73',

  // Warm cream text - like aged paper
  text: '#F0EDE6',
  textSecondary: '#A8A29C',
  textTertiary: '#7A756D',

  // Status colors - muted but visible
  success: '#8BA892',
  warning: '#C9A876',
  error: '#C47A6E',

  // Accent colors
  actionAccent: '#C9A876',
  clarityAccent: 'rgba(240, 237, 230, 0.4)',

  // Terracotta/clay secondary accent
  terracotta: '#C9A876',
  stone: '#6B665C',

  // Difficulty indicators
  difficultyEasy: '#8BA892',
  difficultyMedium: '#C9A876',
  difficultyHard: '#C47A6E',

  // Clarity states - subtle dark variations
  clarity: {
    pristine: '#2A332C',  // Dark sage
    clear: '#2C302D',     // Stone gray
    mild: '#302C28',      // Warm umber
    moderate: '#352C26',  // Clay shadow
    cluttered: '#382A28', // Rust shadow
  },

  // Subtle gradients for dark mode
  gradient: {
    pristine: ['#1E241F', '#1A1917'] as [string, string],
    clear: ['#1E2220', '#1A1917'] as [string, string],
    mild: ['#221F1C', '#1A1917'] as [string, string],
    moderate: ['#241F1C', '#1A1917'] as [string, string],
    cluttered: ['#261F1D', '#1A1917'] as [string, string],
  },
};

export type Theme = typeof LightTheme;

// Export light as default since user chose washi paper (light)
export default LightTheme;
