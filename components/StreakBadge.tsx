import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Flame } from 'lucide-react-native';

interface Props {
  count: number;
  size?: 'small' | 'large';
}

export default function StreakBadge({ count, size = 'large' }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [count, glowAnim]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();
  }, [count, scaleAnim]);

  const isLarge = size === 'large';

  return (
    <Animated.View 
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerSmall,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Animated.View style={{ opacity: glowAnim }}>
        <Flame 
          size={isLarge ? 28 : 18} 
          color="#FF6B35" 
          fill="#FF6B35"
        />
      </Animated.View>
      <Text style={[styles.count, isLarge ? styles.countLarge : styles.countSmall]}>
        {count}
      </Text>
      {isLarge && (
        <Text style={styles.label}>day streak</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  containerSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  count: {
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  countLarge: {
    fontSize: 24,
  },
  countSmall: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 107, 53, 0.8)',
    fontWeight: '500' as const,
  },
});
