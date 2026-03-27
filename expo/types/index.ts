export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type LoopCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning' | 'creative' | 'other';
export type LoopStatus = 'open' | 'closed' | 'archived' | 'snoozed';
export type LoopType = 'general' | 'task' | 'habit' | 'goal' | 'project' | 'idea' | 'delegation';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Loop {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  firstStep?: string;
  difficulty: DifficultyLevel;
  category: LoopCategory;
  loopType: LoopType;
  priority: Priority;
  isQuickWin: boolean;
  estimatedMinutes?: number;
  status: LoopStatus;
  dueDate?: string;
  windowStartDate?: string;
  windowEndDate?: string;
  tags: string[];
  isPinned: boolean;
  snoozedUntil?: string;
  createdAt: string;
  closedAt?: string;
  archivedAt?: string;
  completionRating?: number;
}

export interface BrainDump {
  id: string;
  rawContent: string;
  createdAt: string;
  loopsExtracted: number;
}

export interface Streak {
  currentCount: number;
  longestCount: number;
  startedAt?: string;
  lastClosedAt?: string;
  totalLoopsClosed: number;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  notificationTime: string;
  soundEffects: boolean;
  confettiEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface AnalyticsData {
  loopsCompletedThisWeek: number;
  loopsCompletedThisMonth: number;
  quickWinsCompleted: number;
  avgCompletionTimeMinutes: number;
  bestDay: string;
  bestHour: number;
  categoryBreakdown: Record<LoopCategory, number>;
  weeklyData: { day: string; count: number }[];
}

export interface Quote {
  text: string;
  author: string;
}

export interface LoopSection {
  id: string;
  title: string;
  status: LoopStatus | 'quickWins';
  loops: Loop[];
  isExpanded: boolean;
}

export const LOOP_TYPE_LABELS: Record<LoopType, string> = {
  general: 'General',
  task: 'Task',
  habit: 'Habit',
  goal: 'Goal',
  project: 'Project',
  idea: 'Idea',
  delegation: 'Delegation',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<LoopCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  finance: 'Finance',
  learning: 'Learning',
  creative: 'Creative',
  other: 'Other',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const TIME_ESTIMATES = [5, 15, 30, 60, 120, 240];
