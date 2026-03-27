import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Clock, Leaf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Loop } from '@/types';
import { getCategoryColor, formatFriendlyDate } from '@/utils/helpers';
import { useTheme } from '@/context/ThemeContext';
import EnsoIcon from './EnsoIcon';

interface Props {
  loop: Loop;
  onComplete: (id: string) => void;
  onPress?: (loop: Loop) => void;
  onTagPress?: (tag: string) => void;
}

/**
 * LoopCard - A contemplative task card
 *
 * Designed with wabi-sabi principles:
 * - Generous breathing room (ma)
 * - Understated visual hierarchy
 * - Soft, organic completion gesture
 * - Minimal visual noise
 */
export default function LoopCard({ loop, onComplete, onPress, onTagPress }: Props) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const completeAnim = useRef(new Animated.Value(0)).current;

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Gentle, breathing completion animation
    Animated.parallel([
      // Subtle pulse
      Animated.sequence([
        Animated.spring(completeAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Graceful fade out
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Gentle shrink
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete(loop.id);
    });
  }, [loop.id, onComplete, completeAnim, opacityAnim, scaleAnim]);

  const categoryColor = getCategoryColor(loop.category);

  const isClosingSoon = loop.windowEndDate && (() => {
    const endDate = new Date(loop.windowEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining >= 0 && daysRemaining <= 2;
  })();

  const tags = loop.tags || [];
  const displayTags = tags.slice(0, 2);
  const remainingTags = tags.length - 2;

  // Subtle priority indicator through border
  const hasPriority = loop.priority === 'urgent' || loop.priority === 'high';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: hasPriority ? colors.warning : colors.cardBorder,
            borderWidth: hasPriority ? 1.5 : 1,
          },
        ]}
        onPress={() => onPress?.(loop)}
        activeOpacity={0.8}
        testID={`loop-card-${loop.id}`}
      >
        {/* Left: Enso completion button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          testID={`complete-${loop.id}`}
        >
          <Animated.View
            style={[
              styles.ensoContainer,
              {
                transform: [
                  {
                    scale: completeAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.15, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <EnsoIcon
              size={26}
              color={colors.primary}
              variant="open"
              strokeWidth={2.5}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Title row with optional indicators */}
          <View style={styles.titleRow}>
            {loop.isPinned && (
              <View style={[styles.indicator, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.indicatorText, { color: colors.primary }]}>Pinned</Text>
              </View>
            )}
            {loop.isQuickWin && (
              <View style={[styles.indicator, { backgroundColor: `${colors.warning}15` }]}>
                <Leaf size={10} color={colors.warning} />
              </View>
            )}
          </View>

          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {loop.title}
          </Text>

          {/* Closing soon notice */}
          {isClosingSoon && (
            <Text style={[styles.closingSoon, { color: colors.warning }]}>
              Closes {formatFriendlyDate(loop.windowEndDate!)}
            </Text>
          )}

          {/* Meta row - minimal, understated */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {loop.category}
            </Text>

            {loop.estimatedMinutes && (
              <>
                <Text style={[styles.metaDivider, { color: colors.textTertiary }]}>·</Text>
                <Clock size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  {loop.estimatedMinutes}m
                </Text>
              </>
            )}

            <Text style={[styles.metaDivider, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {loop.difficulty}
            </Text>
          </View>

          {/* Tags - subtle, clickable */}
          {displayTags.length > 0 && (
            <View style={styles.tagsRow}>
              {displayTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => onTagPress?.(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tag, { color: colors.textSecondary }]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
              {remainingTags > 0 && (
                <Text style={[styles.moreTag, { color: colors.textTertiary }]}>
                  +{remainingTags}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 14,
    gap: 14,
  },
  completeButton: {
    paddingTop: 2,
  },
  ensoContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  closingSoon: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  metaText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  metaDivider: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tag: {
    fontSize: 12,
  },
  moreTag: {
    fontSize: 11,
  },
});
