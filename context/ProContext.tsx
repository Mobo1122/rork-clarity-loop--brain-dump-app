import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import Purchases, { CustomerInfo } from 'react-native-purchases';

const EXTRACTIONS_KEY = 'daily_extractions';
const ONBOARDING_KEY = 'onboarding_completed';
const PRO_ENTITLEMENT_ID = 'Loops Pro';

export type PaywallTrigger = 'limit' | 'feature' | 'habit' | 'momentum';

export interface ProStatus {
  isPro: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  expiresAt?: string | null;
  purchasedAt?: string | null;
  willRenew?: boolean;
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

type SupabaseAuthUser = User | null;

const defaultProStatus: ProStatus = {
  isPro: false,
  plan: 'free',
};

const FREE_EXTRACTION_LIMIT = 2;

export const [ProProvider, usePro] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [dailyExtractions, setDailyExtractions] = useState<DailyExtractions>({ count: 0, date: '' });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [, setSupabaseUser] = useState<SupabaseAuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('limit');
  const [authLoading, setAuthLoading] = useState(true);

  const customerInfoQuery = useQuery({
    queryKey: ['customer_info'],
    queryFn: async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        console.log('[ProContext] Customer info fetched:', {
          isPro: typeof info.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined',
          activeEntitlements: Object.keys(info.entitlements.active),
        });
        return info;
      } catch (error) {
        console.error('[ProContext] Error fetching customer info:', error);
        return null;
      }
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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[ProContext] Error fetching auth session:', error);
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            console.log('[ProContext] Invalid refresh token detected, clearing session');
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('loops-auth-token');
          }
          return null;
        }
        
        if (session?.user) {
          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            createdAt: session.user.created_at,
          };
          return user;
        }
        return null;
      } catch (error) {
        console.error('[ProContext] Error fetching auth session:', error);
        if (error instanceof Error) {
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            console.log('[ProContext] Invalid refresh token detected, clearing session');
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('loops-auth-token');
          }
        }
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('[ProContext] Error loading initial session:', error);
        if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
          console.log('[ProContext] Invalid refresh token on init, clearing session');
          await supabase.auth.signOut();
          await AsyncStorage.removeItem('loops-auth-token');
        }
        setSession(null);
        setSupabaseUser(null);
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }
      
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name,
          createdAt: session.user.created_at,
        });
      }
      setAuthLoading(false);
      console.log('[ProContext] Initial session loaded:', !!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[ProContext] Auth state changed:', _event);
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name,
          createdAt: session.user.created_at,
        });
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (customerInfoQuery.data) {
      setCustomerInfo(customerInfoQuery.data);
    }
  }, [customerInfoQuery.data]);

  useEffect(() => {
    if (extractionsQuery.data) setDailyExtractions(extractionsQuery.data);
  }, [extractionsQuery.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) setOnboardingCompleted(onboardingQuery.data);
  }, [onboardingQuery.data]);

  useEffect(() => {
    if (authQuery.data !== undefined) setAuthUser(authQuery.data);
  }, [authQuery.data]);

  const refreshCustomerInfo = useMutation({
    mutationFn: async () => {
      const info = await Purchases.getCustomerInfo();
      console.log('[ProContext] Customer info refreshed');
      return info;
    },
    onSuccess: (data) => {
      setCustomerInfo(data);
      queryClient.invalidateQueries({ queryKey: ['customer_info'] });
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



  const proStatus = useMemo((): ProStatus => {
    if (!customerInfo) return defaultProStatus;
    
    const proEntitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
    if (!proEntitlement) return defaultProStatus;

    const productId = proEntitlement.productIdentifier;
    let plan: 'free' | 'monthly' | 'yearly' = 'free';
    
    if (productId?.includes('yearly') || productId?.includes('annual')) {
      plan = 'yearly';
    } else if (productId?.includes('monthly')) {
      plan = 'monthly';
    }

    return {
      isPro: true,
      plan,
      expiresAt: proEntitlement.expirationDate,
      purchasedAt: proEntitlement.originalPurchaseDate,
      willRenew: proEntitlement.willRenew,
    };
  }, [customerInfo]);

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

  const purchasePackage = useCallback(async (packageToPurchase: any) => {
    try {
      console.log('[ProContext] Purchasing package:', packageToPurchase.identifier);
      const { customerInfo: info } = await Purchases.purchasePackage(packageToPurchase);
      console.log('[ProContext] Purchase successful');
      setCustomerInfo(info);
      queryClient.invalidateQueries({ queryKey: ['customer_info'] });
      setShowPaywall(false);
      return info;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('[ProContext] Purchase cancelled by user');
      } else {
        console.error('[ProContext] Purchase error:', error);
      }
      throw error;
    }
  }, [queryClient]);

  const restorePurchases = useCallback(async () => {
    try {
      console.log('[ProContext] Restoring purchases');
      const info = await Purchases.restorePurchases();
      console.log('[ProContext] Purchases restored');
      setCustomerInfo(info);
      queryClient.invalidateQueries({ queryKey: ['customer_info'] });
      return info;
    } catch (error) {
      console.error('[ProContext] Restore error:', error);
      throw error;
    }
  }, [queryClient]);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    saveOnboarding(true);
    console.log('[ProContext] Onboarding completed');
  }, [saveOnboarding]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    console.log('[ProContext] Signing up:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        console.error('[ProContext] Sign up error:', error.message);
        throw error;
      }
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          fullName,
          createdAt: data.user.created_at,
        };
        setAuthUser(user);
        console.log('[ProContext] User signed up:', email);
        return user;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.error('[ProContext] Network error during sign up');
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      throw error;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[ProContext] Signing in:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('[ProContext] Sign in error:', error.message);
        throw error;
      }
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name,
          createdAt: data.user.created_at,
        };
        setAuthUser(user);
        console.log('[ProContext] User signed in:', email);
        return user;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.error('[ProContext] Network error during sign in');
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[ProContext] Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[ProContext] Sign out error:', error.message);
        throw error;
      }
      setAuthUser(null);
      setSession(null);
      setSupabaseUser(null);
      console.log('[ProContext] User signed out');
    } catch (error) {
      console.error('[ProContext] Sign out failed, clearing local state anyway');
      setAuthUser(null);
      setSession(null);
      setSupabaseUser(null);
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.log('[ProContext] Network error during sign out, but local state cleared');
          return;
        }
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const listener = (info: CustomerInfo) => {
      console.log('[ProContext] Customer info updated via listener');
      setCustomerInfo(info);
      queryClient.invalidateQueries({ queryKey: ['customer_info'] });
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [queryClient]);

  const isLoading = customerInfoQuery.isLoading || extractionsQuery.isLoading || onboardingQuery.isLoading || authLoading;

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
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo: refreshCustomerInfo.mutate,
    customerInfo,
    onboardingCompleted,
    completeOnboarding,
    authUser,
    session,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    isLoading,
  };
});
