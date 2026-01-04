import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getClarityLevel } from '@/utils/helpers';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  loopCount: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ loopCount, children, style }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();
  
  const clarityLevel = getClarityLevel(loopCount);
  const gradientColors = colors.gradient[clarityLevel] as [string, string];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [clarityLevel, fadeAnim]);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
