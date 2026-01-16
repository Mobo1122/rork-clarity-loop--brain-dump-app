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
import { Circle, Sparkles, Archive, CheckCircle, Pin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import { LoopCategory, Loop } from '@/types';
import GradientBackground from '@/components/GradientBackground';
import StreakBadge from '@/components/StreakBadge';
import LoopCard from '@/components/LoopCard';
import CollapsibleSection from '@/components/CollapsibleSection';
import CategoryFilter from '@/components/CategoryFilter';
import { getClarityMessage } from '@/utils/helpers';
import { actionQuotes, clarityQuotes, getRotatingQuote, Quote } from '@/mocks/quotes';
import { useTheme } from '@/context/ThemeContext';

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
    isLoading 
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
        
        console.log('[Dashboard] Rotated quotes - action:', nextActionIndex, 'clarity:', nextClarityIndex);
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
        duration: 1500,
        delay: 800,
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
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
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
    setSelectedCategories(prev => {
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
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const filterLoops = useCallback((loops: Loop[]) => {
    return loops.filter(loop => {
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

  const regularLoops = useMemo(() => 
    filteredOpenLoops.filter(l => !l.isQuickWin && !l.isPinned),
    [filteredOpenLoops]
  );

  const hasActiveFilters = selectedCategories.size > 0 || selectedTag;

  return (
    <GradientBackground loopCount={openLoops.length}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>Your Mind</Text>
              <Text style={[styles.clarityMessage, { color: colors.textSecondary }]}>
                {getClarityMessage(openLoops.length)}
              </Text>
            </View>
            <StreakBadge count={streak.currentCount} size="small" />
          </View>
          
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.statItem}>
              <View style={styles.statCircle}>
                <Circle size={20} color={colors.primary} fill={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{openLoops.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Open Loops</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <View style={styles.statCircle}>
                <Sparkles size={20} color={colors.warning} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{quickWins.length}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Quick Wins</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.totalClosed, { color: colors.success }]}>{streak.totalLoopsClosed}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total Closed</Text>
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
          {filteredPinnedLoops.length > 0 && (
            <CollapsibleSection
              title="Pinned"
              count={filteredPinnedLoops.length}
              isExpanded={expandedSections.pinned}
              onToggle={() => toggleSection('pinned')}
              accentColor={colors.primary}
              icon={<Pin size={14} color={colors.primary} fill={colors.primary} />}
            >
              {filteredPinnedLoops.map(loop => (
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

          {filteredQuickWins.length > 0 && (
            <CollapsibleSection
              title="Quick Wins"
              count={filteredQuickWins.length}
              isExpanded={expandedSections.quickWins}
              onToggle={() => toggleSection('quickWins')}
              accentColor={colors.warning}
              icon={<Sparkles size={14} color={colors.warning} />}
            >
              {filteredQuickWins.slice(0, 5).map(loop => (
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

          {regularLoops.length > 0 && (
            <CollapsibleSection
              title="Active Loops"
              count={regularLoops.length}
              isExpanded={expandedSections.active}
              onToggle={() => toggleSection('active')}
              accentColor={colors.primary}
              icon={<Circle size={14} color={colors.primary} />}
            >
              {regularLoops.map(loop => (
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

          {filteredClosedLoops.length > 0 && (
            <CollapsibleSection
              title="Closed"
              count={closedLoops.length}
              isExpanded={expandedSections.closed}
              onToggle={() => toggleSection('closed')}
              accentColor={colors.success}
              icon={<CheckCircle size={14} color={colors.success} />}
            >
              {filteredClosedLoops.map(loop => (
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

          {filteredArchivedLoops.length > 0 && (
            <CollapsibleSection
              title="Archived"
              count={archivedLoops.length}
              isExpanded={expandedSections.archived}
              onToggle={() => toggleSection('archived')}
              accentColor={colors.textTertiary}
              icon={<Archive size={14} color={colors.textTertiary} />}
            >
              {filteredArchivedLoops.map(loop => (
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

          {openLoops.length === 0 && !isLoading && !hasActiveFilters && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primaryDim }]}>
                <Sparkles size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Mind Clear</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No open loops. Your mind is at peace.{'\n'}
                Dump your thoughts to capture new loops.
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/dump')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyButtonText, { color: colors.background }]}>Start Brain Dump</Text>
              </TouchableOpacity>
              
              <Animated.View 
                style={[
                  styles.clarityQuoteContainer,
                  { opacity: clarityQuoteAnim }
                ]}
              >
                <Text style={[styles.clarityQuoteText, { color: colors.clarityAccent }]}>
                  {`"${clarityQuote.text}"`}
                </Text>
                <Text style={[styles.clarityQuoteAuthor, { color: colors.textTertiary }]}>
                  — {clarityQuote.author}
                </Text>
              </Animated.View>
            </View>
          )}

          {hasActiveFilters && filteredOpenLoops.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>No loops match your filters</Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  clearFilters();
                  clearTag();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {openLoops.length > 0 && (
            <View style={[styles.actionQuoteContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.actionQuoteLabel, { color: colors.actionAccent }]}>Daily Thought</Text>
              <Text style={[styles.actionQuoteText, { color: colors.textSecondary }]}>
                {`"${actionQuote.text}"`}
              </Text>
              <Text style={[styles.actionQuoteAuthor, { color: colors.actionAccent }]}>
                — {actionQuote.author}
              </Text>
            </View>
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>

        {showCelebration && (
          <Animated.View 
            style={[
              styles.celebration,
              {
                backgroundColor: colors.success,
                opacity: celebrationAnim,
                transform: [{
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <Text style={[styles.celebrationText, { color: colors.text }]}>✨ Loop Closed!</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  clarityMessage: {
    fontSize: 15,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  totalClosed: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  celebration: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  clarityQuoteContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  clarityQuoteText: {
    fontSize: 14,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    lineHeight: 22,
  },
  clarityQuoteAuthor: {
    fontSize: 12,
    marginTop: 8,
  },
  actionQuoteContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionQuoteLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  actionQuoteText: {
    fontSize: 14,
    fontStyle: 'italic' as const,
    lineHeight: 22,
  },
  actionQuoteAuthor: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500' as const,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    marginBottom: 12,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
