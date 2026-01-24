import { Loop, LoopCategory, DifficultyLevel } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getClarityLevel(openLoopCount: number): 'pristine' | 'clear' | 'mild' | 'moderate' | 'cluttered' {
  if (openLoopCount === 0) return 'pristine';
  if (openLoopCount <= 2) return 'clear';
  if (openLoopCount <= 5) return 'mild';
  if (openLoopCount <= 8) return 'moderate';
  return 'cluttered';
}

export function getClarityMessage(openLoopCount: number): string {
  if (openLoopCount === 0) return 'Still water reflects the sky';
  if (openLoopCount <= 2) return 'Nearly still. A few ripples remain';
  if (openLoopCount <= 5) return 'Gentle waves. One stone at a time';
  if (openLoopCount <= 8) return 'The waters stir. Seek the small victories';
  return 'Many stones in the pond. Begin with one';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFriendlyDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 0 && diffDays <= 6) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (diffDays < 0 && diffDays >= -6) {
    return `${Math.abs(diffDays)} days ago`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysRemaining(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

export function getQuickDateOptions(): { label: string; startDate: string; endDate: string }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);
  
  return [
    { label: 'Today', startDate: today.toISOString(), endDate: today.toISOString() },
    { label: 'This Week', startDate: today.toISOString(), endDate: endOfWeek.toISOString() },
    { label: 'This Month', startDate: today.toISOString(), endDate: endOfMonth.toISOString() },
    { label: 'Later', startDate: nextWeek.toISOString(), endDate: nextMonth.toISOString() },
  ];
}

export function getCategoryIcon(category: LoopCategory): string {
  const icons: Record<LoopCategory, string> = {
    work: 'Briefcase',
    personal: 'User',
    health: 'Heart',
    finance: 'DollarSign',
    learning: 'BookOpen',
    creative: 'Palette',
    other: 'Circle',
  };
  return icons[category];
}

export function getCategoryColor(category: LoopCategory): string {
  // Muted, zen-inspired category colors
  const colors: Record<LoopCategory, string> = {
    work: '#7A8B8C',     // Stone blue-gray
    personal: '#B08B7A', // Warm clay
    health: '#6B8E73',   // Sage green
    finance: '#A69575',  // Warm bronze
    learning: '#8B7A8C', // Muted plum
    creative: '#C4A070', // Terracotta
    other: '#9C978D',    // Warm gray
  };
  return colors[category];
}

export function extractLoopsFromText(text: string): Partial<Loop>[] {
  const lines = text.split(/[.\n,;]+/).filter(line => line.trim().length > 3);
  
  const loops: Partial<Loop>[] = lines.slice(0, 8).map(line => {
    const trimmed = line.trim();
    
    let difficulty: DifficultyLevel = 'medium';
    let isQuickWin = false;
    let estimatedMinutes = 30;
    
    const easyKeywords = ['call', 'email', 'text', 'check', 'quick', 'simple', 'cancel', 'reply'];
    const hardKeywords = ['project', 'plan', 'research', 'build', 'create', 'design', 'write'];
    
    const lowerText = trimmed.toLowerCase();
    
    if (easyKeywords.some(k => lowerText.includes(k))) {
      difficulty = 'easy';
      isQuickWin = true;
      estimatedMinutes = 10;
    } else if (hardKeywords.some(k => lowerText.includes(k))) {
      difficulty = 'hard';
      estimatedMinutes = 60;
    }
    
    let category: LoopCategory = 'other';
    if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('boss')) {
      category = 'work';
    } else if (lowerText.includes('gym') || lowerText.includes('doctor') || lowerText.includes('health')) {
      category = 'health';
    } else if (lowerText.includes('bill') || lowerText.includes('pay') || lowerText.includes('money')) {
      category = 'finance';
    } else if (lowerText.includes('learn') || lowerText.includes('read') || lowerText.includes('course')) {
      category = 'learning';
    } else if (lowerText.includes('mom') || lowerText.includes('dad') || lowerText.includes('friend') || lowerText.includes('family')) {
      category = 'personal';
    }
    
    const title = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    return {
      title: title.length > 60 ? title.slice(0, 57) + '...' : title,
      difficulty,
      category,
      isQuickWin,
      estimatedMinutes,
      firstStep: `Start by ${lowerText.split(' ').slice(0, 3).join(' ')}...`,
    };
  });
  
  return loops.filter(l => l.title && l.title.length > 0);
}
