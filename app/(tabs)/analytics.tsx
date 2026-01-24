import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Leaf, Calendar } from 'lucide-react-native';
import { useLoops } from '@/context/LoopsContext';
import { useTheme } from '@/context/ThemeContext';
import GradientBackground from '@/components/GradientBackground';
import StreakBadge from '@/components/StreakBadge';
import EnsoIcon from '@/components/EnsoIcon';
import { LoopCategory } from '@/types';
import { getCategoryColor } from '@/utils/helpers';

/**
 * Insights Screen - Reflection
 *
 * A contemplative view of one's practice.
 * Numbers serve as gentle reminders of progress,
 * not metrics to be optimized.
 */
export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { loops, openLoops, closedLoops, streak } = useLoops();
  const { colors } = useTheme();

  const analytics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekClosed = closedLoops.filter(
      (l) => l.closedAt && new Date(l.closedAt) >= weekAgo
    );
    const thisMonthClosed = closedLoops.filter(
      (l) => l.closedAt && new Date(l.closedAt) >= monthAgo
    );

    const quickWinsClosed = closedLoops.filter((l) => l.isQuickWin).length;

    const categoryBreakdown: Record<LoopCategory, number> = {
      work: 0,
      personal: 0,
      health: 0,
      finance: 0,
      learning: 0,
      creative: 0,
      other: 0,
    };
    closedLoops.forEach((l) => {
      categoryBreakdown[l.category]++;
    });

    const totalEstimated = closedLoops.reduce(
      (sum, l) => sum + (l.estimatedMinutes || 30),
      0
    );
    const avgTime = closedLoops.length > 0 ? Math.round(totalEstimated / closedLoops.length) : 0;

    const dayCompletions: Record<string, number> = {};
    closedLoops.forEach((l) => {
      if (l.closedAt) {
        const day = new Date(l.closedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });
    const bestDay = Object.entries(dayCompletions).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
      thisWeek: thisWeekClosed.length,
      thisMonth: thisMonthClosed.length,
      quickWinsClosed,
      avgTime,
      categoryBreakdown,
      bestDay,
      completionRate: loops.length > 0 ? Math.round((closedLoops.length / loops.length) * 100) : 0,
    };
  }, [loops, closedLoops]);

  const sortedCategories = useMemo(() => {
    return Object.entries(analytics.categoryBreakdown)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
  }, [analytics.categoryBreakdown]);

  const maxCategoryCount = useMemo(() => {
    return Math.max(...Object.values(analytics.categoryBreakdown), 1);
  }, [analytics.categoryBreakdown]);

  return (
    <GradientBackground loopCount={openLoops.length}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reflection</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            A quiet look at your practice
          </Text>
        </View>

        {/* Streak - Central focus */}
        <View style={styles.streakSection}>
          <StreakBadge count={streak.currentCount} size="large" />
          {streak.longestCount > streak.currentCount && (
            <Text style={[styles.longestStreak, { color: colors.textTertiary }]}>
              longest: {streak.longestCount}
            </Text>
          )}
        </View>

        {/* Primary metrics - Clean, minimal */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: colors.text }]}>{analytics.thisWeek}</Text>
            <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>this week</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: colors.text }]}>{analytics.thisMonth}</Text>
            <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>this month</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: colors.text }]}>{closedLoops.length}</Text>
            <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>total</Text>
          </View>
        </View>

        {/* Quick wins and average time */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Leaf size={16} color={colors.warning} />
              <Text style={[styles.infoValue, { color: colors.text }]}>{analytics.quickWinsClosed}</Text>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>quick wins closed</Text>
            </View>
            <View style={[styles.infoItemDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.infoItem}>
              <EnsoIcon size={16} color={colors.primary} variant="closed" />
              <Text style={[styles.infoValue, { color: colors.text }]}>{analytics.avgTime}m</Text>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>average time</Text>
            </View>
          </View>
        </View>

        {/* Best day */}
        {analytics.bestDay && (
          <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.insightRow}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                Most productive on <Text style={{ color: colors.text }}>{analytics.bestDay}s</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Completion rate - Understated progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>completion rate</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>{analytics.completionRate}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.cardBorder }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(analytics.completionRate, 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Category breakdown - Visual bars */}
        {sortedCategories.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>by category</Text>
            {sortedCategories.map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryName}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: getCategoryColor(category as LoopCategory) },
                      ]}
                    />
                    <Text style={[styles.categoryLabel, { color: colors.text }]}>{category}</Text>
                  </View>
                  <Text style={[styles.categoryCount, { color: colors.textTertiary }]}>{count}</Text>
                </View>
                <View style={[styles.categoryBar, { backgroundColor: colors.cardBorder }]}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${(count / maxCategoryCount) * 100}%`,
                        backgroundColor: getCategoryColor(category as LoopCategory),
                        opacity: 0.6,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {closedLoops.length === 0 && (
          <View style={styles.emptyState}>
            <EnsoIcon size={56} color={colors.textTertiary} variant="open" strokeWidth={3} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Begin your practice</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Close loops to see your progress reflected here
            </Text>
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    fontStyle: 'italic',
  },
  streakSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  longestStreak: {
    fontSize: 13,
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 32,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItemDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoLabel: {
    fontSize: 12,
  },
  insightCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightText: {
    fontSize: 14,
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 16,
    textTransform: 'lowercase',
  },
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryLabel: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 13,
  },
  categoryBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '400',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
