import { Tabs } from "expo-router";
import { Home, PenSquare, BarChart3, Settings } from "lucide-react-native";
import React, { useMemo } from "react";
import { useColorScheme } from "react-native";
import { DarkTheme, LightTheme } from "@/constants/colors";
import { useLoops } from "@/context/LoopsContext";

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
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dump"
        options={{
          title: "Dump",
          tabBarIcon: ({ color, size }) => <PenSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
