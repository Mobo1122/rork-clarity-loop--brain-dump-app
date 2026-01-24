import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import EnsoIcon from './EnsoIcon';

interface Props {
  count: number;
  size?: 'small' | 'large';
}

/**
 * StreakBadge - Contemplative practice counter
 *
 * Inspired by the zen practice of stacking stones,
 * each day of practice adds to your tower.
 * The design is understated - the practice itself
 * is the reward, not the number.
 */
export default function StreakBadge({ count, size = 'large' }: Props) {
  const { colors } = useTheme();
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Gentle breathing animation - like meditation
  useEffect(() => {
    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.02,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [count, breatheAnim]);

  // Subtle celebration when count changes
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
    ]).start();
  }, [count, scaleAnim]);

  const isLarge = size === 'large';

  return (
    <Animated.View
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerSmall,
        {
          backgroundColor: `${colors.primary}10`,
          borderColor: `${colors.primary}25`,
          transform: [{ scale: Animated.multiply(scaleAnim, breatheAnim) }],
        },
      ]}
    >
      {/* Enso as the practice symbol */}
      <View style={styles.iconContainer}>
        <EnsoIcon
          size={isLarge ? 24 : 16}
          color={colors.primary}
          variant={count > 0 ? 'closed' : 'open'}
          strokeWidth={isLarge ? 2.5 : 2}
        />
      </View>

      {/* Count display */}
      <Text
        style={[
          styles.count,
          isLarge ? styles.countLarge : styles.countSmall,
          { color: colors.primary },
        ]}
      >
        {count}
      </Text>

      {/* Label for large variant */}
      {isLarge && (
        <Text style={[styles.label, { color: colors.primaryMuted }]}>
          {count === 1 ? 'day' : 'days'}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  containerLarge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  containerSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  countLarge: {
    fontSize: 22,
  },
  countSmall: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
  },
});
