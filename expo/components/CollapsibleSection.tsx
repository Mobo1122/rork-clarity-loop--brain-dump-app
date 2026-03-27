import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor?: string;
  icon?: React.ReactNode;
}

/**
 * CollapsibleSection - Zen-styled expandable section
 *
 * Minimal visual hierarchy, generous spacing,
 * understated animations that feel natural.
 */
export default function CollapsibleSection({
  title,
  count,
  isExpanded,
  onToggle,
  children,
  accentColor,
  icon,
}: Props) {
  const { colors } = useTheme();
  const finalAccentColor = accentColor || colors.textSecondary;
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: 'easeInEaseOut' },
    });
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    onToggle();
  }, [isExpanded, onToggle, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
        testID={`collapsible-${title}`}
      >
        <View style={styles.headerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.count, { color: colors.textTertiary }]}>{count}</Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={16} color={colors.textTertiary} />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    opacity: 0.8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  count: {
    fontSize: 13,
    fontWeight: '400',
  },
  content: {
    marginTop: 4,
  },
});
