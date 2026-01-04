import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Props {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  suggestedTags?: string[];
  maxTags?: number;
}

export default function TagsSection({
  tags,
  onAddTag,
  onRemoveTag,
  suggestedTags = [],
  maxTags = 10,
}: Props) {
  const [inputValue, setInputValue] = useState('');

  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase().trim();
    return suggestedTags
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !tags.includes(tag.toLowerCase())
      )
      .slice(0, 5);
  }, [inputValue, suggestedTags, tags]);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = (tag || inputValue).toLowerCase().trim();
    if (tagToAdd && !tags.includes(tagToAdd) && tags.length < maxTags) {
      onAddTag(tagToAdd);
      setInputValue('');
    }
  };

  const handleSubmit = () => {
    handleAddTag();
  };

  const canAddMore = tags.length < maxTags;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tags</Text>
        <Text style={styles.counter}>{tags.length}/{maxTags}</Text>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => onRemoveTag(tag)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {canAddMore && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a tag..."
            placeholderTextColor={Colors.textTertiary}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.addButton, !inputValue.trim() && styles.addButtonDisabled]}
            onPress={() => handleAddTag()}
            disabled={!inputValue.trim()}
            activeOpacity={0.7}
          >
            <Plus size={18} color={inputValue.trim() ? Colors.primary : Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {filteredSuggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {filteredSuggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => handleAddTag(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>#{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  counter: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primaryDim,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    color: Colors.text,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    marginTop: 4,
  },
  suggestionsContent: {
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
