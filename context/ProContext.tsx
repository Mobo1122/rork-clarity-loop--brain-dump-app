import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

const PRO_KEY = 'pro_status';
const EXTRACTIONS_KEY = 'daily_extractions';
const ONBOARDING_KEY = 'onboarding_completed';
const AUTH_KEY = 'auth_user';

export type PaywallTrigger = 'limit' | 'feature' | 'habit' | 'momentum';

export interface ProStatus {
  isPro: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  expiresAt?: string;
  purchasedAt?: string;
}

export interface DailyExtractions {
  count: number;
  date: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
}

const defaultProStatus: ProStatus = {
  isPro: false,
  plan: 'free',
};

const FREE_EXTRACTION_LIMIT = 2;

export const [ProProvider, usePro] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [proStatus, setProStatus] = useState<ProStatus>(defaultProStatus);
  const [dailyExtractions, setDailyExtractions] = useState<DailyExtractions>({ count: 0, date: '' });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('limit');

  const proQuery = useQuery({
    queryKey: ['pro_status'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PRO_KEY);
      return stored ? JSON.parse(stored) as ProStatus : defaultProStatus;
    },
  });

  const extractionsQuery = useQuery({
    queryKey: ['daily_extractions'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(EXTRACTIONS_KEY);
      const today = new Date().toDateString();
      if (stored) {
        const data = JSON.parse(stored) as DailyExtractions;
        if (data.date === today) {
          return data;
        }
      }
      return { count: 0, date: today };
    },
  });

  const onboardingQuery = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      return stored === 'true';
    },
  });

  const authQuery = useQuery({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) as AuthUser : null;
    },
  });

  useEffect(() => {
    if (proQuery.data) setProStatus(proQuery.data);
  }, [proQuery.data]);

  useEffect(() => {
    if (extractionsQuery.data) setDailyExtractions(extractionsQuery.data);
  }, [extractionsQuery.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) setOnboardingCompleted(onboardingQuery.data);
  }, [onboardingQuery.data]);

  useEffect(() => {
    if (authQuery.data !== undefined) setAuthUser(authQuery.data);
  }, [authQuery.data]);

  const { mutate: saveProStatus } = useMutation({
    mutationFn: async (status: ProStatus) => {
      await AsyncStorage.setItem(PRO_KEY, JSON.stringify(status));
      return status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro_status'] });
    },
  });

  const { mutate: saveExtractions } = useMutation({
    mutationFn: async (extractions: DailyExtractions) => {
      await AsyncStorage.setItem(EXTRACTIONS_KEY, JSON.stringify(extractions));
      return extractions;
    },
  });

  const { mutate: saveOnboarding } = useMutation({
    mutationFn: async (completed: boolean) => {
      await AsyncStorage.setItem(ONBOARDING_KEY, completed.toString());
      return completed;
    },
  });

  const { mutate: saveAuthUser } = useMutation({
    mutationFn: async (user: AuthUser | null) => {
      if (user) {
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_KEY);
      }
      return user;
    },
  });

  const canExtract = useMemo(() => {
    if (proStatus.isPro) return true;
    const today = new Date().toDateString();
    if (dailyExtractions.date !== today) return true;
    return dailyExtractions.count < FREE_EXTRACTION_LIMIT;
  }, [proStatus.isPro, dailyExtractions]);

  const extractionsRemaining = useMemo(() => {
    if (proStatus.isPro) return Infinity;
    const today = new Date().toDateString();
    if (dailyExtractions.date !== today) return FREE_EXTRACTION_LIMIT;
    return Math.max(0, FREE_EXTRACTION_LIMIT - dailyExtractions.count);
  }, [proStatus.isPro, dailyExtractions]);

  const recordExtraction = useCallback(() => {
    const today = new Date().toDateString();
    const newExtractions: DailyExtractions = {
      count: dailyExtractions.date === today ? dailyExtractions.count + 1 : 1,
      date: today,
    };
    setDailyExtractions(newExtractions);
    saveExtractions(newExtractions);
    console.log('[ProContext] Recorded extraction, count:', newExtractions.count);
  }, [dailyExtractions, saveExtractions]);

  const triggerPaywall = useCallback((trigger: PaywallTrigger) => {
    setPaywallTrigger(trigger);
    setShowPaywall(true);
    console.log('[ProContext] Paywall triggered:', trigger);
  }, []);

  const closePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  const upgradeToPro = useCallback((plan: 'monthly' | 'yearly') => {
    const newStatus: ProStatus = {
      isPro: true,
      plan,
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    };
    setProStatus(newStatus);
    saveProStatus(newStatus);
    setShowPaywall(false);
    console.log('[ProContext] Upgraded to Pro:', plan);
  }, [saveProStatus]);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    saveOnboarding(true);
    console.log('[ProContext] Onboarding completed');
  }, [saveOnboarding]);

  const signUp = useCallback((email: string, fullName?: string) => {
    const user: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      fullName,
      createdAt: new Date().toISOString(),
    };
    setAuthUser(user);
    saveAuthUser(user);
    console.log('[ProContext] User signed up:', email);
    return user;
  }, [saveAuthUser]);

  const signIn = useCallback((email: string) => {
    const user: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      createdAt: new Date().toISOString(),
    };
    setAuthUser(user);
    saveAuthUser(user);
    console.log('[ProContext] User signed in:', email);
    return user;
  }, [saveAuthUser]);

  const signOut = useCallback(() => {
    setAuthUser(null);
    saveAuthUser(null);
    console.log('[ProContext] User signed out');
  }, [saveAuthUser]);

  const isLoading = proQuery.isLoading || extractionsQuery.isLoading || onboardingQuery.isLoading || authQuery.isLoading;

  return {
    proStatus,
    isPro: proStatus.isPro,
    canExtract,
    extractionsRemaining,
    recordExtraction,
    showPaywall,
    paywallTrigger,
    triggerPaywall,
    closePaywall,
    upgradeToPro,
    onboardingCompleted,
    completeOnboarding,
    authUser,
    isAuthenticated: !!authUser,
    signUp,
    signIn,
    signOut,
    isLoading,
  };
});
