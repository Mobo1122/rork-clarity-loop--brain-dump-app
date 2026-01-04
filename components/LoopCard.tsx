import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, Clock, Zap, Pin, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Loop } from '@/types';
import { getCategoryColor, formatFriendlyDate } from '@/utils/helpers';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  loop: Loop;
  onComplete: (id: string) => void;
  onPress?: (loop: Loop) => void;
  onTagPress?: (tag: string) => void;
}

export default function LoopCard({ loop, onComplete, onPress, onTagPress }: Props) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const checkScaleAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.timing(checkScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete(loop.id);
    });
  }, [loop.id, onComplete, checkScaleAnim, scaleAnim, opacityAnim]);

  const categoryColor = getCategoryColor(loop.category);
  const difficultyColor = loop.difficulty === 'easy' 
    ? colors.difficultyEasy 
    : loop.difficulty === 'hard' 
      ? colors.difficultyHard 
      : colors.difficultyMedium;

  const priorityColor = loop.priority === 'urgent' 
    ? colors.error 
    : loop.priority === 'high' 
      ? colors.warning 
      : undefined;

  const isClosingSoon = loop.windowEndDate && (() => {
    const endDate = new Date(loop.windowEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining >= 0 && daysRemaining <= 2;
  })();

  const tags = loop.tags || [];
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - 3;

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
          styles.content,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          priorityColor && { borderLeftWidth: 3, borderLeftColor: priorityColor },
        ]}
        onPress={() => onPress?.(loop)}
        activeOpacity={0.7}
        testID={`loop-card-${loop.id}`}
      >
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleComplete}
            activeOpacity={0.7}
            testID={`complete-${loop.id}`}
          >
            <Animated.View 
              style={[
                styles.checkCircle,
                { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: checkScaleAnim }] 
                }
              ]}
            >
              <Check size={16} color={colors.background} strokeWidth={3} />
            </Animated.View>
          </TouchableOpacity>
          
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              {loop.isPinned && (
                <Pin size={12} color={colors.primary} fill={colors.primary} style={styles.pinIcon} />
              )}
              {loop.isQuickWin && (
                <View style={styles.quickWinBadge}>
                  <Zap size={10} color={colors.warning} fill={colors.warning} />
                </View>
              )}
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {loop.title}
              </Text>
            </View>
            
            {isClosingSoon && (
              <View style={styles.closingSoonBadge}>
                <AlertCircle size={12} color={colors.warning} />
                <Text style={[styles.closingSoonText, { color: colors.warning }]}>
                  Closes {formatFriendlyDate(loop.windowEndDate!)}
                </Text>
              </View>
            )}
            
            <View style={styles.metaRow}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
              <Text style={[styles.category, { color: colors.textTertiary }]}>{loop.category}</Text>
              
              <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {loop.difficulty}
                </Text>
              </View>
              
              {loop.estimatedMinutes && (
                <View style={styles.timeEstimate}>
                  <Clock size={12} color={colors.textTertiary} />
                  <Text style={[styles.timeText, { color: colors.textTertiary }]}>{loop.estimatedMinutes}m</Text>
                </View>
              )}
            </View>
            
            {displayTags.length > 0 && (
              <View style={styles.tagsRow}>
                {displayTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagChip}
                    onPress={() => onTagPress?.(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
                {remainingTags > 0 && (
                  <Text style={[styles.moreTagsText, { color: colors.textTertiary }]}>+{remainingTags} more</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  checkButton: {
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinIcon: {
    marginRight: 2,
  },
  quickWinBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  closingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  closingSoonText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  category: {
    fontSize: 12,
    textTransform: 'capitalize' as const,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  moreTagsText: {
    fontSize: 11,
  },
});
