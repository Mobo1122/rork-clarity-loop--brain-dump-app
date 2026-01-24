import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { LoopCategory, CATEGORY_LABELS, Loop } from '@/types';
import { getCategoryColor } from '@/utils/helpers';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  selectedCategories: Set<LoopCategory>;
  onToggleCategory: (category: LoopCategory) => void;
  onClearAll: () => void;
  selectedTag?: string;
  onClearTag?: () => void;
  openLoops?: Loop[];
}

/**
 * CategoryFilter - Understated filter chips
 *
 * Zen aesthetic: filters appear only when relevant,
 * with subtle color coding that doesn't demand attention.
 */
export default function CategoryFilter({
  selectedCategories,
  onToggleCategory,
  onClearAll,
  selectedTag,
  onClearTag,
  openLoops = [],
}: Props) {
  const { colors } = useTheme();
  const hasActiveFilters = selectedCategories.size > 0 || selectedTag;

  const availableCategories = useMemo(() => {
    const categoriesWithLoops = new Set<LoopCategory>();
    openLoops.forEach((loop) => {
      categoriesWithLoops.add(loop.category);
    });
    return Array.from(categoriesWithLoops).sort((a, b) => {
      const order: LoopCategory[] = ['work', 'personal', 'health', 'finance', 'learning', 'creative', 'other'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [openLoops]);

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableCategories.map((category) => {
          const isSelected = selectedCategories.has(category);
          const categoryColor = getCategoryColor(category);

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? `${categoryColor}15` : 'transparent',
                  borderColor: isSelected ? `${categoryColor}40` : colors.cardBorder,
                },
              ]}
              onPress={() => onToggleCategory(category)}
              activeOpacity={0.7}
              testID={`filter-${category}`}
            >
              <View style={[styles.dot, { backgroundColor: categoryColor }]} />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? categoryColor : colors.textSecondary },
                ]}
              >
                {CATEGORY_LABELS[category].toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onClearAll();
              onClearTag?.();
            }}
            activeOpacity={0.7}
          >
            <X size={12} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {selectedTag && (
        <View style={styles.tagFilterContainer}>
          <Text style={[styles.tagFilterLabel, { color: colors.textTertiary }]}>tag:</Text>
          <TouchableOpacity
            style={[styles.activeTagChip, { backgroundColor: colors.primaryDim }]}
            onPress={onClearTag}
            activeOpacity={0.7}
          >
            <Text style={[styles.activeTagText, { color: colors.primary }]}>#{selectedTag}</Text>
            <X size={10} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '400',
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 8,
  },
  tagFilterLabel: {
    fontSize: 12,
  },
  activeTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
