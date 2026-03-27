import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  Trash2,
  Archive,
  Pin,
  MoreVertical,
  Clock,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useLoops } from '@/context/LoopsContext';
import {
  LoopCategory,
  DifficultyLevel,
  Priority,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  PRIORITY_LABELS,
  TIME_ESTIMATES,
} from '@/types';
import { getCategoryColor } from '@/utils/helpers';
import WindowOfOpportunity from '@/components/WindowOfOpportunity';
import TagsSection from '@/components/TagsSection';
import { usePro } from '@/context/ProContext';

type StatusBadgeType = 'open' | 'closed' | 'archived' | 'snoozed';

const STATUS_COLORS: Record<StatusBadgeType, string> = {
  open: Colors.primary,
  closed: Colors.success,
  archived: Colors.textTertiary,
  snoozed: Colors.warning,
};

export default function LoopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    loops,
    updateLoop,
    completeLoop,
    deleteLoop,
    archiveLoop,
    togglePin,
    getAllTags,
  } = useLoops();
  const { isPro, triggerPaywall } = usePro();

  const loop = loops.find(l => l.id === id);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<LoopCategory>('other');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [windowStartDate, setWindowStartDate] = useState<string | undefined>();
  const [windowEndDate, setWindowEndDate] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [isQuickWin, setIsQuickWin] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (loop) {
      setTitle(loop.title);
      setNotes(loop.notes || '');
      setCategory(loop.category);
      setDifficulty(loop.difficulty);
      setPriority(loop.priority || 'medium');
      setEstimatedMinutes(loop.estimatedMinutes);
      setWindowStartDate(loop.windowStartDate);
      setWindowEndDate(loop.windowEndDate);
      setTags(loop.tags || []);
      setIsQuickWin(loop.isQuickWin || false);
    }
  }, [loop]);

  const handleSave = useCallback(() => {
    if (!loop || !title.trim()) return;

    updateLoop(loop.id, {
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      difficulty,
      priority,
      estimatedMinutes,
      windowStartDate,
      windowEndDate,
      tags,
      isQuickWin,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [
    loop,
    title,
    notes,
    category,
    difficulty,
    priority,
    estimatedMinutes,
    windowStartDate,
    windowEndDate,
    tags,
    isQuickWin,
    updateLoop,
    router,
  ]);

  const handleComplete = useCallback(() => {
    if (!loop) return;
    completeLoop(loop.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [loop, completeLoop, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Loop',
      'Are you sure you want to delete this loop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (loop) {
              deleteLoop(loop.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.back();
            }
          },
        },
      ]
    );
  }, [loop, deleteLoop, router]);

  const handleArchive = useCallback(() => {
    if (!loop) return;
    archiveLoop(loop.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, [loop, archiveLoop, router]);

  const handleTogglePin = useCallback(() => {
    if (!loop) return;
    togglePin(loop.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [loop, togglePin]);

  const handleAddTag = useCallback((tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
  }, [tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);

  if (!loop) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Loop not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleTogglePin}
              activeOpacity={0.7}
            >
              <Pin
                size={20}
                color={loop.isPinned ? Colors.primary : Colors.textSecondary}
                fill={loop.isPinned ? Colors.primary : 'transparent'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowMoreMenu(!showMoreMenu)}
              activeOpacity={0.7}
            >
              <MoreVertical size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {showMoreMenu && (
          <View style={styles.moreMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleArchive}
              activeOpacity={0.7}
            >
              <Archive size={18} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[loop.status]}20` }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[loop.status] }]}>
                {loop.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Loop title"
            placeholderTextColor={Colors.textTertiary}
            multiline
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                {(Object.keys(CATEGORY_LABELS) as LoopCategory[]).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.optionChip,
                      category === cat && {
                        backgroundColor: `${getCategoryColor(cat)}30`,
                        borderColor: getCategoryColor(cat),
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(cat) }]} />
                    <Text
                      style={[
                        styles.optionText,
                        category === cat && { color: getCategoryColor(cat) },
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Win</Text>
            <TouchableOpacity
              style={[
                styles.quickWinToggle,
                isQuickWin && styles.quickWinToggleActive,
              ]}
              onPress={() => {
                setIsQuickWin(!isQuickWin);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickWinIcon,
                isQuickWin && styles.quickWinIconActive,
              ]}>
                <Zap size={18} color={isQuickWin ? Colors.warning : Colors.textSecondary} fill={isQuickWin ? Colors.warning : 'transparent'} />
              </View>
              <View style={styles.quickWinContent}>
                <Text style={[
                  styles.quickWinLabel,
                  isQuickWin && styles.quickWinLabelActive,
                ]}>
                  {isQuickWin ? 'Marked as Quick Win' : 'Mark as Quick Win'}
                </Text>
                <Text style={styles.quickWinDescription}>
                  Quick wins appear in their own section for fast completion
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.optionsRow}>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => {
                const priorityColors: Record<Priority, string> = {
                  low: Colors.textTertiary,
                  medium: Colors.primary,
                  high: Colors.warning,
                  urgent: Colors.error,
                };
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.optionChip,
                      priority === p && {
                        backgroundColor: `${priorityColors[p]}20`,
                        borderColor: priorityColors[p],
                      },
                    ]}
                    onPress={() => setPriority(p)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        priority === p && { color: priorityColors[p] },
                      ]}
                    >
                      {PRIORITY_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <View style={styles.optionsRow}>
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map(d => {
                const diffColors: Record<DifficultyLevel, string> = {
                  easy: Colors.difficultyEasy,
                  medium: Colors.difficultyMedium,
                  hard: Colors.difficultyHard,
                };
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.optionChip,
                      difficulty === d && {
                        backgroundColor: `${diffColors[d]}20`,
                        borderColor: diffColors[d],
                      },
                    ]}
                    onPress={() => setDifficulty(d)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        difficulty === d && { color: diffColors[d] },
                      ]}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Estimate</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                {TIME_ESTIMATES.map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.optionChip,
                      estimatedMinutes === minutes && styles.optionChipSelected,
                    ]}
                    onPress={() => setEstimatedMinutes(minutes)}
                    activeOpacity={0.7}
                  >
                    <Clock size={14} color={estimatedMinutes === minutes ? Colors.primary : Colors.textSecondary} />
                    <Text
                      style={[
                        styles.optionText,
                        estimatedMinutes === minutes && styles.optionTextSelected,
                      ]}
                    >
                      {minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <WindowOfOpportunity
              windowStartDate={windowStartDate}
              windowEndDate={windowEndDate}
              onStartDateChange={setWindowStartDate}
              onEndDateChange={setWindowEndDate}
              isPro={isPro}
              onUpgrade={() => triggerPaywall('feature')}
            />
          </View>

          <View style={styles.section}>
            <TagsSection
              tags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              suggestedTags={getAllTags}
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {loop.status === 'open' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <Check size={20} color={Colors.background} strokeWidth={3} />
              <Text style={styles.completeButtonText}>Complete Loop</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 24,
    padding: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  notesInput: {
    minHeight: 100,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionChipSelected: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  optionTextSelected: {
    color: Colors.primary,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 14,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.background,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 16,
    color: Colors.primary,
  },
  quickWinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickWinToggleActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  quickWinIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickWinIconActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  quickWinContent: {
    flex: 1,
  },
  quickWinLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  quickWinLabelActive: {
    color: Colors.warning,
    fontWeight: '600' as const,
  },
  quickWinDescription: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
