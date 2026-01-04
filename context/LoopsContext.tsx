import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loop, Streak, BrainDump, UserPreferences } from '@/types';
import { generateId, extractLoopsFromText } from '@/utils/helpers';

const LOOPS_KEY = 'loops_data';
const STREAK_KEY = 'streak_data';
const DUMPS_KEY = 'dumps_data';
const PREFS_KEY = 'user_prefs';

const defaultStreak: Streak = {
  currentCount: 0,
  longestCount: 0,
  totalLoopsClosed: 0,
};

const defaultPrefs: UserPreferences = {
  notificationsEnabled: true,
  notificationTime: '09:00',
  soundEffects: true,
  confettiEnabled: true,
  theme: 'system',
};

export const [LoopsProvider, useLoops] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [streak, setStreak] = useState<Streak>(defaultStreak);
  const [brainDumps, setBrainDumps] = useState<BrainDump[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPrefs);
  const [isInitialized, setIsInitialized] = useState(false);

  const loopsQuery = useQuery({
    queryKey: ['loops'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(LOOPS_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as Loop[];
      } catch (error) {
        console.error('[LoopsContext] Error parsing loops:', error);
        await AsyncStorage.removeItem(LOOPS_KEY);
        return [];
      }
    },
  });

  const streakQuery = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STREAK_KEY);
        if (!stored) return defaultStreak;
        return JSON.parse(stored) as Streak;
      } catch (error) {
        console.error('[LoopsContext] Error parsing streak:', error);
        await AsyncStorage.removeItem(STREAK_KEY);
        return defaultStreak;
      }
    },
  });

  const dumpsQuery = useQuery({
    queryKey: ['dumps'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(DUMPS_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as BrainDump[];
      } catch (error) {
        console.error('[LoopsContext] Error parsing dumps:', error);
        await AsyncStorage.removeItem(DUMPS_KEY);
        return [];
      }
    },
  });

  const prefsQuery = useQuery({
    queryKey: ['prefs'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        if (!stored) return defaultPrefs;
        return JSON.parse(stored) as UserPreferences;
      } catch (error) {
        console.error('[LoopsContext] Error parsing preferences:', error);
        await AsyncStorage.removeItem(PREFS_KEY);
        return defaultPrefs;
      }
    },
  });

  useEffect(() => {
    if (loopsQuery.data) setLoops(loopsQuery.data);
  }, [loopsQuery.data]);

  useEffect(() => {
    if (streakQuery.data) setStreak(streakQuery.data);
  }, [streakQuery.data]);

  useEffect(() => {
    if (dumpsQuery.data) setBrainDumps(dumpsQuery.data);
  }, [dumpsQuery.data]);

  useEffect(() => {
    if (prefsQuery.data) setPreferences(prefsQuery.data);
  }, [prefsQuery.data]);

  useEffect(() => {
    if (!loopsQuery.isLoading && !streakQuery.isLoading) {
      setIsInitialized(true);
    }
  }, [loopsQuery.isLoading, streakQuery.isLoading]);

  const { mutate: saveLoops } = useMutation({
    mutationFn: async (newLoops: Loop[]) => {
      await AsyncStorage.setItem(LOOPS_KEY, JSON.stringify(newLoops));
      return newLoops;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
    },
  });

  const { mutate: saveStreak } = useMutation({
    mutationFn: async (newStreak: Streak) => {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
      return newStreak;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });

  const { mutate: saveDumps } = useMutation({
    mutationFn: async (newDumps: BrainDump[]) => {
      await AsyncStorage.setItem(DUMPS_KEY, JSON.stringify(newDumps));
      return newDumps;
    },
  });

  const { mutate: savePrefs } = useMutation({
    mutationFn: async (newPrefs: UserPreferences) => {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    },
  });

  const addLoop = useCallback((loopData: Partial<Loop>) => {
    const newLoop: Loop = {
      id: generateId(),
      title: loopData.title || 'Untitled loop',
      description: loopData.description,
      notes: loopData.notes,
      firstStep: loopData.firstStep,
      difficulty: loopData.difficulty || 'medium',
      category: loopData.category || 'other',
      loopType: loopData.loopType || 'general',
      priority: loopData.priority || 'medium',
      isQuickWin: loopData.isQuickWin || false,
      estimatedMinutes: loopData.estimatedMinutes,
      status: 'open',
      tags: loopData.tags || [],
      isPinned: loopData.isPinned || false,
      windowStartDate: loopData.windowStartDate,
      windowEndDate: loopData.windowEndDate,
      createdAt: new Date().toISOString(),
    };
    const updated = [newLoop, ...loops];
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Added loop:', newLoop.title);
    return newLoop;
  }, [loops, saveLoops]);

  const completeLoop = useCallback((loopId: string, rating?: number) => {
    const now = new Date();
    const updated = loops.map(l => 
      l.id === loopId 
        ? { ...l, status: 'closed' as const, closedAt: now.toISOString(), completionRating: rating }
        : l
    );
    setLoops(updated);
    saveLoops(updated);

    const today = now.toDateString();
    const lastClosed = streak.lastClosedAt ? new Date(streak.lastClosedAt).toDateString() : null;
    
    let newStreak = { ...streak };
    newStreak.totalLoopsClosed += 1;
    newStreak.lastClosedAt = now.toISOString();
    
    if (lastClosed !== today) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClosed === yesterday.toDateString() || newStreak.currentCount === 0) {
        newStreak.currentCount += 1;
      } else if (lastClosed !== yesterday.toDateString() && lastClosed !== null) {
        newStreak.currentCount = 1;
        newStreak.startedAt = now.toISOString();
      }
      
      if (newStreak.currentCount > newStreak.longestCount) {
        newStreak.longestCount = newStreak.currentCount;
      }
    }
    
    setStreak(newStreak);
    saveStreak(newStreak);
    console.log('[LoopsContext] Completed loop, streak:', newStreak.currentCount);
  }, [loops, streak, saveLoops, saveStreak]);

  const deleteLoop = useCallback((loopId: string) => {
    const updated = loops.filter(l => l.id !== loopId);
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Deleted loop:', loopId);
  }, [loops, saveLoops]);

  const processBrainDump = useCallback((rawContent: string) => {
    const extracted = extractLoopsFromText(rawContent);
    const newLoops: Loop[] = extracted.map(partial => ({
      id: generateId(),
      title: partial.title || 'Untitled',
      description: partial.description,
      notes: partial.notes,
      firstStep: partial.firstStep,
      difficulty: partial.difficulty || 'medium',
      category: partial.category || 'other',
      loopType: partial.loopType || 'general',
      priority: partial.priority || 'medium',
      isQuickWin: partial.isQuickWin || false,
      estimatedMinutes: partial.estimatedMinutes,
      status: 'open',
      tags: partial.tags || [],
      isPinned: partial.isPinned || false,
      createdAt: new Date().toISOString(),
    }));
    
    const dump: BrainDump = {
      id: generateId(),
      rawContent,
      createdAt: new Date().toISOString(),
      loopsExtracted: newLoops.length,
    };
    
    const updatedLoops = [...newLoops, ...loops];
    const updatedDumps = [dump, ...brainDumps];
    
    setLoops(updatedLoops);
    setBrainDumps(updatedDumps);
    saveLoops(updatedLoops);
    saveDumps(updatedDumps);
    
    console.log('[LoopsContext] Processed dump, extracted:', newLoops.length, 'loops');
    return newLoops;
  }, [loops, brainDumps, saveLoops, saveDumps]);

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    savePrefs(updated);
  }, [preferences, savePrefs]);

  const updateLoop = useCallback((loopId: string, updates: Partial<Loop>) => {
    const updated = loops.map(l => 
      l.id === loopId ? { ...l, ...updates } : l
    );
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Updated loop:', loopId);
  }, [loops, saveLoops]);

  const archiveLoop = useCallback((loopId: string) => {
    const now = new Date().toISOString();
    const updated = loops.map(l => 
      l.id === loopId ? { ...l, status: 'archived' as const, archivedAt: now } : l
    );
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Archived loop:', loopId);
  }, [loops, saveLoops]);

  const snoozeLoop = useCallback((loopId: string, snoozedUntil: string) => {
    const updated = loops.map(l => 
      l.id === loopId ? { ...l, status: 'snoozed' as const, snoozedUntil } : l
    );
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Snoozed loop until:', snoozedUntil);
  }, [loops, saveLoops]);

  const reopenLoop = useCallback((loopId: string) => {
    const updated = loops.map(l => 
      l.id === loopId ? { ...l, status: 'open' as const, snoozedUntil: undefined, archivedAt: undefined } : l
    );
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Reopened loop:', loopId);
  }, [loops, saveLoops]);

  const togglePin = useCallback((loopId: string) => {
    const updated = loops.map(l => 
      l.id === loopId ? { ...l, isPinned: !l.isPinned } : l
    );
    setLoops(updated);
    saveLoops(updated);
    console.log('[LoopsContext] Toggled pin for loop:', loopId);
  }, [loops, saveLoops]);

  const addTagToLoop = useCallback((loopId: string, tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    const updated = loops.map(l => {
      if (l.id === loopId && !l.tags.includes(normalizedTag) && l.tags.length < 10) {
        return { ...l, tags: [...l.tags, normalizedTag] };
      }
      return l;
    });
    setLoops(updated);
    saveLoops(updated);
  }, [loops, saveLoops]);

  const removeTagFromLoop = useCallback((loopId: string, tag: string) => {
    const updated = loops.map(l => {
      if (l.id === loopId) {
        return { ...l, tags: l.tags.filter(t => t !== tag) };
      }
      return l;
    });
    setLoops(updated);
    saveLoops(updated);
  }, [loops, saveLoops]);

  const getAllTags = useMemo(() => {
    const tagSet = new Set<string>();
    loops.forEach(l => l.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [loops]);

  const openLoops = useMemo(() => loops.filter(l => l.status === 'open'), [loops]);
  const closedLoops = useMemo(() => loops.filter(l => l.status === 'closed'), [loops]);
  const archivedLoops = useMemo(() => loops.filter(l => l.status === 'archived'), [loops]);
  const snoozedLoops = useMemo(() => loops.filter(l => l.status === 'snoozed'), [loops]);
  const quickWins = useMemo(() => openLoops.filter(l => l.isQuickWin), [openLoops]);
  const pinnedLoops = useMemo(() => openLoops.filter(l => l.isPinned), [openLoops]);

  return {
    loops,
    openLoops,
    closedLoops,
    archivedLoops,
    snoozedLoops,
    quickWins,
    pinnedLoops,
    getAllTags,
    streak,
    brainDumps,
    preferences,
    isInitialized,
    isLoading: loopsQuery.isLoading || streakQuery.isLoading,
    addLoop,
    updateLoop,
    completeLoop,
    deleteLoop,
    archiveLoop,
    snoozeLoop,
    reopenLoop,
    togglePin,
    addTagToLoop,
    removeTagFromLoop,
    processBrainDump,
    updatePreferences,
  };
});
