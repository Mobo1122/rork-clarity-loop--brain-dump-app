import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Zap,
  Award,
} from 'lucide-react-native';
import { useLoops } from '@/context/LoopsContext';
import { useTheme } from '@/context/ThemeContext';
import GradientBackground from '@/components/GradientBackground';
import StreakBadge from '@/components/StreakBadge';
import { LoopCategory } from '@/types';
import { getCategoryColor } from '@/utils/helpers';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { loops, openLoops, closedLoops, streak } = useLoops();
  const { colors } = useTheme();

  const analytics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekClosed = closedLoops.filter(l => 
      l.closedAt && new Date(l.closedAt) >= weekAgo
    );
    const thisMonthClosed = closedLoops.filter(l => 
      l.closedAt && new Date(l.closedAt) >= monthAgo
    );

    const quickWinsClosed = closedLoops.filter(l => l.isQuickWin).length;

    const categoryBreakdown: Record<LoopCategory, number> = {
      work: 0, personal: 0, health: 0, finance: 0, 
      learning: 0, creative: 0, other: 0
    };
    closedLoops.forEach(l => {
      categoryBreakdown[l.category]++;
    });

    const totalEstimated = closedLoops.reduce((sum, l) => 
      sum + (l.estimatedMinutes || 30), 0
    );
    const avgTime = closedLoops.length > 0 
      ? Math.round(totalEstimated / closedLoops.length) 
      : 0;

    const dayCompletions: Record<string, number> = {};
    closedLoops.forEach(l => {
      if (l.closedAt) {
        const day = new Date(l.closedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });
    const bestDay = Object.entries(dayCompletions)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      thisWeek: thisWeekClosed.length,
      thisMonth: thisMonthClosed.length,
      quickWinsClosed,
      avgTime,
      categoryBreakdown,
      bestDay,
      completionRate: loops.length > 0 
        ? Math.round((closedLoops.length / loops.length) * 100) 
        : 0,
    };
  }, [loops, closedLoops]);

  const sortedCategories = useMemo(() => {
    return Object.entries(analytics.categoryBreakdown)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
  }, [analytics.categoryBreakdown]);

  return (
    <GradientBackground loopCount={openLoops.length}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your productivity at a glance</Text>
        </View>

        <View style={styles.streakSection}>
          <StreakBadge count={streak.currentCount} size="large" />
          {streak.longestCount > streak.currentCount && (
            <Text style={[styles.longestStreak, { color: colors.textTertiary }]}>
              Longest: {streak.longestCount} days
            </Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryDim }]}>
              <TrendingUp size={22} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.thisWeek}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Target size={22} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.thisMonth}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Zap size={22} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.quickWinsClosed}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Quick Wins</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Clock size={22} color="#8B5CF6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.avgTime}m</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Time</Text>
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.insightHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.insightTitle, { color: colors.text }]}>Best Day</Text>
          </View>
          <Text style={[styles.insightValue, { color: colors.primary }]}>{analytics.bestDay}</Text>
          <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
            You complete the most loops on {analytics.bestDay}s
          </Text>
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.insightHeader}>
            <Award size={20} color={colors.success} />
            <Text style={[styles.insightTitle, { color: colors.text }]}>Completion Rate</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.cardBorder }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(analytics.completionRate, 100)}%`, backgroundColor: colors.success }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.success }]}>{analytics.completionRate}%</Text>
          </View>
        </View>

        {sortedCategories.length > 0 && (
          <View style={[styles.categorySection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
            {sortedCategories.map(([category, count]) => (
              <View key={category} style={[styles.categoryRow, { borderBottomColor: colors.cardBorder }]}>
                <View style={styles.categoryInfo}>
                  <View 
                    style={[
                      styles.categoryDot, 
                      { backgroundColor: getCategoryColor(category as LoopCategory) }
                    ]} 
                  />
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
                </View>
                <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{count} loops</Text>
              </View>
            ))}
          </View>
        )}

        {closedLoops.length === 0 && (
          <View style={styles.emptyState}>
            <TrendingUp size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No data yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Complete some loops to see your insights
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
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  streakSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  longestStreak: {
    fontSize: 14,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  insightCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700' as const,
    minWidth: 50,
    textAlign: 'right',
  },
  categorySection: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 15,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
