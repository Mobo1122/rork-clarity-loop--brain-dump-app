import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Leaf, Archive, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import { LoopCategory, Loop } from '@/types';
import GradientBackground from '@/components/GradientBackground';
import StreakBadge from '@/components/StreakBadge';
import LoopCard from '@/components/LoopCard';
import CollapsibleSection from '@/components/CollapsibleSection';
import CategoryFilter from '@/components/CategoryFilter';
import EnsoIcon from '@/components/EnsoIcon';
import { getClarityMessage } from '@/utils/helpers';
import { actionQuotes, clarityQuotes, getRotatingQuote, Quote } from '@/mocks/quotes';
import { useTheme } from '@/context/ThemeContext';

/**
 * Dashboard - The Zen Mind Garden
 *
 * A contemplative space to observe and tend to your mental loops.
 * Designed with ma (negative space), kanso (simplicity),
 * and shizen (naturalness) principles.
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    openLoops,
    closedLoops,
    archivedLoops,
    quickWins,
    pinnedLoops,
    streak,
    completeLoop,
    isLoading,
  } = useLoops();

  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<LoopCategory>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [expandedSections, setExpandedSections] = useState({
    pinned: true,
    quickWins: true,
    active: true,
    closed: false,
    archived: false,
  });

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const clarityQuoteAnim = useRef(new Animated.Value(0)).current;
  const [actionQuote, setActionQuote] = useState<Quote>(actionQuotes[0]);
  const [clarityQuote, setClarityQuote] = useState<Quote>(clarityQuotes[0]);
  const hasRotatedQuotes = useRef(false);

  useEffect(() => {
    const rotateQuotes = async () => {
      if (hasRotatedQuotes.current) return;
      hasRotatedQuotes.current = true;

      try {
        const actionIndexStr = await AsyncStorage.getItem('actionQuoteIndex');
        const clarityIndexStr = await AsyncStorage.getItem('clarityQuoteIndex');

        const actionIndex = actionIndexStr ? parseInt(actionIndexStr, 10) : 0;
        const clarityIndex = clarityIndexStr ? parseInt(clarityIndexStr, 10) : 0;

        const { quote: newActionQuote, nextIndex: nextActionIndex } = getRotatingQuote(actionQuotes, actionIndex);
        const { quote: newClarityQuote, nextIndex: nextClarityIndex } = getRotatingQuote(clarityQuotes, clarityIndex);

        setActionQuote(newActionQuote);
        setClarityQuote(newClarityQuote);

        await AsyncStorage.setItem('actionQuoteIndex', nextActionIndex.toString());
        await AsyncStorage.setItem('clarityQuoteIndex', nextClarityIndex.toString());
      } catch (error) {
        console.error('[Dashboard] Error rotating quotes:', error);
      }
    };

    rotateQuotes();
  }, []);

  useEffect(() => {
    if (openLoops.length === 0 && !isLoading) {
      clarityQuoteAnim.setValue(0);
      Animated.timing(clarityQuoteAnim, {
        toValue: 1,
        duration: 2000,
        delay: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [openLoops.length, isLoading, clarityQuoteAnim]);

  const handleComplete = useCallback((loopId: string) => {
    completeLoop(loopId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  }, [completeLoop, celebrationAnim]);

  const handleLoopPress = useCallback((loop: Loop) => {
    router.push(`/loop-detail?id=${loop.id}`);
  }, [router]);

  const handleTagPress = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const toggleCategory = useCallback((category: LoopCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const clearTag = useCallback(() => {
    setSelectedTag(undefined);
  }, []);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const filterLoops = useCallback((loops: Loop[]) => {
    return loops.filter((loop) => {
      const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(loop.category);
      const tagMatch = !selectedTag || (loop.tags && loop.tags.includes(selectedTag));
      return categoryMatch && tagMatch;
    });
  }, [selectedCategories, selectedTag]);

  const filteredOpenLoops = useMemo(() => filterLoops(openLoops), [filterLoops, openLoops]);
  const filteredQuickWins = useMemo(() => filterLoops(quickWins), [filterLoops, quickWins]);
  const filteredPinnedLoops = useMemo(() => filterLoops(pinnedLoops), [filterLoops, pinnedLoops]);
  const filteredClosedLoops = useMemo(() => filterLoops(closedLoops.slice(0, 10)), [filterLoops, closedLoops]);
  const filteredArchivedLoops = useMemo(() => filterLoops(archivedLoops.slice(0, 10)), [filterLoops, archivedLoops]);

  const regularLoops = useMemo(
    () => filteredOpenLoops.filter((l) => !l.isQuickWin && !l.isPinned),
    [filteredOpenLoops]
  );

  const hasActiveFilters = selectedCategories.size > 0 || selectedTag;

  return (
    <GradientBackground loopCount={openLoops.length}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header - Contemplative greeting */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                {openLoops.length === 0 ? 'Stillness' : 'Your Mind'}
              </Text>
              <Text style={[styles.clarityMessage, { color: colors.textSecondary }]}>
                {getClarityMessage(openLoops.length)}
              </Text>
            </View>
            <StreakBadge count={streak.currentCount} size="small" />
          </View>

          {/* Stats - Understated, informative */}
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <EnsoIcon size={18} color={colors.primary} variant="open" />
                <Text style={[styles.statNumber, { color: colors.text }]}>{openLoops.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>open</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Leaf size={16} color={colors.warning} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{quickWins.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>quick wins</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{streak.totalLoopsClosed}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>closed</Text>
            </View>
          </View>
        </View>

        <CategoryFilter
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onClearAll={clearFilters}
          selectedTag={selectedTag}
          onClearTag={clearTag}
          openLoops={openLoops}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Pinned loops */}
          {filteredPinnedLoops.length > 0 && (
            <CollapsibleSection
              title="pinned"
              count={filteredPinnedLoops.length}
              isExpanded={expandedSections.pinned}
              onToggle={() => toggleSection('pinned')}
            >
              {filteredPinnedLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onComplete={handleComplete}
                  onPress={handleLoopPress}
                  onTagPress={handleTagPress}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Quick wins */}
          {filteredQuickWins.length > 0 && (
            <CollapsibleSection
              title="quick wins"
              count={filteredQuickWins.length}
              isExpanded={expandedSections.quickWins}
              onToggle={() => toggleSection('quickWins')}
              icon={<Leaf size={14} color={colors.warning} />}
            >
              {filteredQuickWins.slice(0, 5).map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onComplete={handleComplete}
                  onPress={handleLoopPress}
                  onTagPress={handleTagPress}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Active loops */}
          {regularLoops.length > 0 && (
            <CollapsibleSection
              title="active"
              count={regularLoops.length}
              isExpanded={expandedSections.active}
              onToggle={() => toggleSection('active')}
              icon={<EnsoIcon size={14} color={colors.textSecondary} variant="open" />}
            >
              {regularLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onComplete={handleComplete}
                  onPress={handleLoopPress}
                  onTagPress={handleTagPress}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Closed loops */}
          {filteredClosedLoops.length > 0 && (
            <CollapsibleSection
              title="closed"
              count={closedLoops.length}
              isExpanded={expandedSections.closed}
              onToggle={() => toggleSection('closed')}
              icon={<Check size={14} color={colors.success} />}
            >
              {filteredClosedLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onComplete={handleComplete}
                  onPress={handleLoopPress}
                  onTagPress={handleTagPress}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Archived loops */}
          {filteredArchivedLoops.length > 0 && (
            <CollapsibleSection
              title="archived"
              count={archivedLoops.length}
              isExpanded={expandedSections.archived}
              onToggle={() => toggleSection('archived')}
              icon={<Archive size={14} color={colors.textTertiary} />}
            >
              {filteredArchivedLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onComplete={handleComplete}
                  onPress={handleLoopPress}
                  onTagPress={handleTagPress}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Empty state - Clarity achieved */}
          {openLoops.length === 0 && !isLoading && !hasActiveFilters && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primaryDim }]}>
                <EnsoIcon size={64} color={colors.primary} variant="closed" strokeWidth={4} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Stillness</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No open loops. Your mind is clear.{'\n'}
                When thoughts arise, capture them.
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { borderColor: colors.primary }]}
                onPress={() => router.push('/dump')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyButtonText, { color: colors.primary }]}>Begin</Text>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.clarityQuoteContainer,
                  { opacity: clarityQuoteAnim },
                ]}
              >
                <Text style={[styles.clarityQuoteText, { color: colors.textSecondary }]}>
                  {`"${clarityQuote.text}"`}
                </Text>
                <Text style={[styles.clarityQuoteAuthor, { color: colors.textTertiary }]}>
                  — {clarityQuote.author}
                </Text>
              </Animated.View>
            </View>
          )}

          {/* No results for filter */}
          {hasActiveFilters && filteredOpenLoops.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                No loops match your filters
              </Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  clearFilters();
                  clearTag();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Daily thought - subtle wisdom */}
          {openLoops.length > 0 && (
            <View style={[styles.actionQuoteContainer, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.actionQuoteText, { color: colors.textSecondary }]}>
                {`"${actionQuote.text}"`}
              </Text>
              <Text style={[styles.actionQuoteAuthor, { color: colors.textTertiary }]}>
                — {actionQuote.author}
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Celebration overlay - Subtle acknowledgment */}
        {showCelebration && (
          <Animated.View
            style={[
              styles.celebration,
              {
                backgroundColor: colors.success,
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <EnsoIcon size={24} color="#fff" variant="closed" strokeWidth={2.5} />
            <Text style={styles.celebrationText}>Closed</Text>
          </Animated.View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  clarityMessage: {
    fontSize: 15,
    marginTop: 6,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'lowercase',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  celebration: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  clarityQuoteContainer: {
    marginTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  clarityQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  clarityQuoteAuthor: {
    fontSize: 12,
    marginTop: 12,
  },
  actionQuoteContainer: {
    marginTop: 32,
    marginHorizontal: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  actionQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  actionQuoteAuthor: {
    fontSize: 12,
    marginTop: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noResultsText: {
    fontSize: 15,
    marginBottom: 12,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
