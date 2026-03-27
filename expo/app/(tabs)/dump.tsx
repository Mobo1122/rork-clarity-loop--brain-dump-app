import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import { usePro } from '@/context/ProContext';
import { useTheme } from '@/context/ThemeContext';
import EnsoIcon from '@/components/EnsoIcon';

const MAX_CHARS = 5000;
const PLACEHOLDER = `What weighs on your mind?

Let it flow freely...
- Tasks waiting for attention
- Ideas circling your thoughts
- Concerns seeking resolution
- Projects yet to begin

Don't organize. Simply release.`;

/**
 * Brain Dump Screen - The Release
 *
 * A meditative space for releasing mental clutter.
 * Like water flowing, thoughts should move freely
 * from mind to page without judgment or structure.
 */
export default function BrainDumpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { processBrainDump } = useLoops();
  const { canExtract, extractionsRemaining, recordExtraction, triggerPaywall, isPro } = usePro();
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);

  const breatheAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleExtract = useCallback(async () => {
    if (content.trim().length < 10) return;

    if (!canExtract) {
      triggerPaywall('limit');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsProcessing(true);

    // Gentle breathing animation while processing
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const loops = processBrainDump(content);
    recordExtraction();
    setExtractedCount(loops.length);
    setIsProcessing(false);
    breatheAnim.stopAnimation();
    breatheAnim.setValue(1);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.timing(successAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setContent('');
      setExtractedCount(null);
      successAnim.setValue(0);
      router.push('/');
    }, 2000);
  }, [content, processBrainDump, breatheAnim, successAnim, router, canExtract, triggerPaywall, recordExtraction]);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContent('');
  }, []);

  const charCount = content.length;
  const canSubmit = content.trim().length >= 10 && !isProcessing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Contemplative invitation */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryDim }]}>
              <EnsoIcon size={36} color={colors.primary} variant="open" strokeWidth={3} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Release</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Let your thoughts flow freely
            </Text>
            {!isPro && (
              <Text style={[styles.limitText, { color: colors.textTertiary }]}>
                {extractionsRemaining} {extractionsRemaining === 1 ? 'release' : 'releases'} remaining today
              </Text>
            )}
          </View>

          {/* Input area - Clean, spacious */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={PLACEHOLDER}
              placeholderTextColor={colors.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={MAX_CHARS}
              textAlignVertical="top"
              autoFocus={false}
            />

            {/* Footer - Minimal, functional */}
            <View style={[styles.inputFooter, { borderTopColor: colors.cardBorder }]}>
              <Text
                style={[
                  styles.charCount,
                  { color: colors.textTertiary },
                  charCount > MAX_CHARS * 0.9 && { color: colors.warning },
                ]}
              >
                {charCount.toLocaleString()}
              </Text>

              {content.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Extract button - Understated elegance */}
          <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
            <TouchableOpacity
              style={[
                styles.extractButton,
                { borderColor: colors.primary },
                canSubmit && { backgroundColor: colors.primary },
                !canSubmit && { opacity: 0.4 },
              ]}
              onPress={handleExtract}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <View style={styles.buttonContent}>
                  <EnsoIcon size={20} color={canSubmit ? colors.background : colors.primary} variant="incomplete" />
                  <Text
                    style={[
                      styles.extractButtonText,
                      { color: canSubmit ? colors.background : colors.primary },
                    ]}
                  >
                    Releasing...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Feather size={18} color={canSubmit ? colors.background : colors.primary} />
                  <Text
                    style={[
                      styles.extractButtonText,
                      { color: canSubmit ? colors.background : colors.primary },
                    ]}
                  >
                    Release
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Guidance - Subtle, helpful */}
          <View style={styles.guidance}>
            <Text style={[styles.guidanceText, { color: colors.textTertiary }]}>
              Write freely. Separate thoughts with periods or new lines.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success overlay - Contemplative acknowledgment */}
      {extractedCount !== null && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View style={styles.successContent}>
            <EnsoIcon size={72} color={colors.primary} variant="closed" strokeWidth={4} />
            <Text style={[styles.successNumber, { color: colors.text }]}>{extractedCount}</Text>
            <Text style={[styles.successLabel, { color: colors.textSecondary }]}>
              {extractedCount === 1 ? 'loop released' : 'loops released'}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  limitText: {
    fontSize: 13,
    marginTop: 16,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 280,
    maxHeight: 380,
    padding: 20,
    fontSize: 16,
    lineHeight: 26,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  charCount: {
    fontSize: 12,
  },
  clearButton: {
    padding: 6,
  },
  extractButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  extractButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  guidance: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guidanceText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successNumber: {
    fontSize: 48,
    fontWeight: '300',
    marginTop: 24,
    letterSpacing: -1,
  },
  successLabel: {
    fontSize: 16,
    marginTop: 8,
  },
});
