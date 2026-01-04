import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
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
  const finalAccentColor = accentColor || colors.primary;
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onToggle();
  }, [isExpanded, onToggle, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
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
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <ChevronRight size={18} color={colors.textSecondary} />
          </Animated.View>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: `${finalAccentColor}20` }]}>
            <Text style={[styles.countText, { color: finalAccentColor }]}>{count}</Text>
          </View>
        </View>
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
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    marginLeft: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  content: {
    marginTop: 4,
  },
});
