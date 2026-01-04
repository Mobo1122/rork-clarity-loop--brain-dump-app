import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoopsProvider } from "@/context/LoopsContext";
import { ProProvider, usePro } from "@/context/ProContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Paywall from "@/components/Paywall";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function PaywallWrapper() {
  const { showPaywall, closePaywall, paywallTrigger } = usePro();
  return (
    <Paywall 
      visible={showPaywall} 
      onClose={closePaywall} 
      trigger={paywallTrigger}
    />
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, onboardingCompleted, isLoading } = usePro();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    console.log('[AuthGate] State:', { isAuthenticated, onboardingCompleted, segments: segments[0] });

    if (!onboardingCompleted && !inOnboarding) {
      console.log('[AuthGate] Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (onboardingCompleted && !isAuthenticated && !inAuthGroup && !inOnboarding) {
      console.log('[AuthGate] Redirecting to auth');
      router.replace('/auth');
    } else if (isAuthenticated && onboardingCompleted && (inAuthGroup || inOnboarding)) {
      console.log('[AuthGate] Redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, onboardingCompleted, segments, isLoading, router]);

  return null;
}

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="loop-detail" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
      </Stack>
      <PaywallWrapper />
    </View>
  );
}

function StatusBarWrapper() {
  const { isDark } = useTheme();
  
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ProProvider>
            <LoopsProvider>
              <ThemeProvider>
                <StatusBarWrapper />
                <RootLayoutNav />
              </ThemeProvider>
            </LoopsProvider>
          </ProProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
