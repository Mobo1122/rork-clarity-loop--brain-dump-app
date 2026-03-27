import { Tabs } from 'expo-router';
import { Feather, BarChart2, Settings } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { DarkTheme, LightTheme } from '@/constants/colors';
import { useLoops } from '@/context/LoopsContext';
import EnsoIcon from '@/components/EnsoIcon';

/**
 * Tab Navigation - Zen-styled navigation bar
 *
 * Minimal, understated icons with subtle active states.
 * The Enso circle serves as the home icon, representing
 * the continuous journey toward mental clarity.
 */
export default function TabLayout() {
  const { preferences } = useLoops();
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (preferences.theme === 'light') return false;
    if (preferences.theme === 'dark') return true;
    return systemColorScheme === 'dark';
  }, [preferences.theme, systemColorScheme]);

  const colors = isDark ? DarkTheme : LightTheme;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'mind',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <EnsoIcon
                size={22}
                color={color}
                variant={focused ? 'closed' : 'open'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dump"
        options={{
          title: 'release',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Feather size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'reflect',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <BarChart2 size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'settings',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Settings size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
});
