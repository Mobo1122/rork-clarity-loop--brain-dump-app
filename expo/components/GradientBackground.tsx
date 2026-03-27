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

/**
 * ZenGradientBackground
 *
 * A contemplative background that subtly shifts based on mental clarity.
 * Inspired by the gradual transitions of ink wash paintings,
 * the changes are gentle and meditative, never jarring.
 *
 * The gradient flows diagonally from top-left to bottom-right,
 * mimicking the natural direction of light in a zen garden.
 */
export default function GradientBackground({ loopCount, children, style }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  const clarityLevel = getClarityLevel(loopCount);
  const gradientColors = colors.gradient[clarityLevel] as [string, string];

  useEffect(() => {
    // Slow, breathing transition when clarity changes
    // Like ripples settling in still water
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.92,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [clarityLevel, fadeAnim]);

  return (
    <View style={[styles.container, style]}>
      {/* Base layer - solid background for performance */}
      <View style={[styles.baseLayer, { backgroundColor: colors.background }]} />

      {/* Gradient layer - subtle clarity-based tint */}
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientLayer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Content layer with fade animation */}
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
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
});
