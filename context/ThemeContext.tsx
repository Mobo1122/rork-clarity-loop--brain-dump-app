import createContextHook from '@nkzw/create-context-hook';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { DarkTheme, LightTheme, Theme } from '@/constants/colors';
import { useLoops } from '@/context/LoopsContext';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const { preferences } = useLoops();
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (preferences.theme === 'light') return false;
    if (preferences.theme === 'dark') return true;
    return systemColorScheme === 'dark';
  }, [preferences.theme, systemColorScheme]);

  const colors: Theme = useMemo(() => {
    return isDark ? DarkTheme : LightTheme;
  }, [isDark]);

  return {
    colors,
    isDark,
    theme: preferences.theme,
  };
});
