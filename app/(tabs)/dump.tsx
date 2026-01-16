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
import { Send, Brain, Trash2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLoops } from '@/context/LoopsContext';
import { usePro } from '@/context/ProContext';
import { useTheme } from '@/context/ThemeContext';

const MAX_CHARS = 5000;
const PLACEHOLDER = `What's on your mind?

Write freely - no structure needed...

• Tasks you keep forgetting
• Ideas floating around
• Things you need to do
• Random thoughts
• Future plans

Just let it flow.`;

export default function BrainDumpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { processBrainDump } = useLoops();
  const { canExtract, extractionsRemaining, recordExtraction, triggerPaywall, isPro } = usePro();
  const { colors, isDark } = useTheme();
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleExtract = useCallback(async () => {
    if (content.trim().length < 10) return;
    
    if (!canExtract) {
      triggerPaywall('limit');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const loops = processBrainDump(content);
    recordExtraction();
    setExtractedCount(loops.length);
    setIsProcessing(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setContent('');
      setExtractedCount(null);
      successAnim.setValue(0);
      router.push('/');
    }, 1500);
  }, [content, processBrainDump, pulseAnim, successAnim, router, canExtract, triggerPaywall, recordExtraction]);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContent('');
  }, []);

  const charCount = content.length;
  const canSubmit = content.trim().length >= 10 && !isProcessing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#0A0A0F'] : ['#F0F4FF', '#F8F9FA']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryDim }]}>
              <Brain size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Brain Dump</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Write freely. We&apos;ll extract actionable loops from your thoughts.
            </Text>
            {!isPro && (
              <View style={[styles.limitBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)' }]}>
                <Sparkles size={14} color={colors.warning} />
                <Text style={[styles.limitText, { color: colors.warning }]}>
                  {extractionsRemaining} free extraction{extractionsRemaining !== 1 ? 's' : ''} left today
                </Text>
              </View>
            )}
          </View>

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
            
            <View style={[styles.inputFooter, { borderTopColor: colors.cardBorder }]}>
              <Text style={[
                styles.charCount,
                { color: colors.textTertiary },
                charCount > MAX_CHARS * 0.9 && { color: colors.warning }
              ]}>
                {charCount} / {MAX_CHARS}
              </Text>
              
              {content.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <Trash2 size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.extractButton,
                { backgroundColor: colors.primary },
                !canSubmit && styles.extractButtonDisabled
              ]}
              onPress={handleExtract}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <>
                  <Sparkles size={22} color={isDark ? '#0A0A0F' : '#FFFFFF'} />
                  <Text style={[styles.extractButtonText, { color: isDark ? '#0A0A0F' : '#FFFFFF' }]}>Extracting loops...</Text>
                </>
              ) : (
                <>
                  <Send size={22} color={isDark ? '#0A0A0F' : '#FFFFFF'} />
                  <Text style={[styles.extractButtonText, { color: isDark ? '#0A0A0F' : '#FFFFFF' }]}>Extract Loops</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={[styles.tips, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Tips</Text>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>Stream of consciousness works best</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>New lines help separate thoughts</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>Use action words: call, email, buy, check</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {extractedCount !== null && (
        <Animated.View 
          style={[
            styles.successOverlay,
            { opacity: successAnim, backgroundColor: isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
          ]}
        >
          <View style={styles.successContent}>
            <Sparkles size={48} color={colors.success} />
            <Text style={[styles.successTitle, { color: colors.success }]}>
              {extractedCount} Loops Extracted!
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
              Redirecting to dashboard...
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  inputContainer: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 250,
    maxHeight: 350,
    padding: 20,
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 13,
  },
  clearButton: {
    padding: 8,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  extractButtonDisabled: {
    opacity: 0.5,
  },
  extractButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  tips: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  limitText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});
