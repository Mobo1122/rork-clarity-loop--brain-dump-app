import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Bell, 
  Volume2, 
  PartyPopper,
  Trash2,
  Info,
  ChevronRight,
  Moon,
  Crown,
  Sparkles,
  Check,
  Sun,
  Smartphone,
  LogOut,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import { usePro } from '@/context/ProContext';
import { useTheme } from '@/context/ThemeContext';
import GradientBackground from '@/components/GradientBackground';
import Paywall from '@/components/Paywall';
import { UserPreferences } from '@/types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, updatePreferences, openLoops, streak, loops } = useLoops();
  const { isPro, proStatus, showPaywall, triggerPaywall, closePaywall, paywallTrigger, signOut, isAuthenticated, authUser } = usePro();

  const handleToggle = useCallback((key: 'notificationsEnabled' | 'soundEffects' | 'confettiEnabled') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreferences({ [key]: !preferences[key] });
  }, [preferences, updatePreferences]);

  const handleThemeChange = useCallback((theme: UserPreferences['theme']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreferences({ theme });
  }, [updatePreferences]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [signOut]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your loops, streaks, and brain dumps. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      ]
    );
  }, []);

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
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          {isPro ? (
            <View style={styles.proCard}>
              <View style={styles.proHeader}>
                <View style={styles.proIconContainer}>
                  <Crown size={24} color="#FFD700" />
                </View>
                <View style={styles.proInfo}>
                  <Text style={styles.proTitle}>LOOPS Pro</Text>
                  <Text style={styles.proPlan}>
                    {proStatus.plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                  </Text>
                </View>
                <View style={styles.proBadge}>
                  <Check size={14} color={colors.success} />
                  <Text style={[styles.proBadgeText, { color: colors.success }]}>Active</Text>
                </View>
              </View>
              
              <View style={styles.proFeatures}>
                <View style={styles.proFeatureItem}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.proFeatureText, { color: colors.textSecondary }]}>Unlimited AI extractions</Text>
                </View>
                <View style={styles.proFeatureItem}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.proFeatureText, { color: colors.textSecondary }]}>Window of Opportunity tracking</Text>
                </View>
                <View style={styles.proFeatureItem}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.proFeatureText, { color: colors.textSecondary }]}>Advanced analytics</Text>
                </View>
              </View>
              
              {proStatus.expiresAt && (
                <Text style={[styles.proExpiry, { color: colors.textTertiary }]}>
                  Renews on {new Date(proStatus.expiresAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                triggerPaywall('feature');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.upgradeContent}>
                <View style={styles.upgradeIconContainer}>
                  <Crown size={28} color="#FFD700" />
                </View>
                <View style={styles.upgradeInfo}>
                  <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                  <Text style={styles.upgradeSubtitle}>
                    Unlock unlimited extractions, smart scheduling & more
                  </Text>
                </View>
              </View>
              <View style={styles.upgradeButton}>
                <Text style={[styles.upgradeButtonText, { color: colors.background }]}>See Plans</Text>
                <ChevronRight size={18} color={colors.background} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Loops Created</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{loops.length}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Loops Closed</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.totalLoopsClosed}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Longest Streak</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.longestCount} days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Preferences</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryDim }]}>
                  <Bell size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Daily reminders</Text>
                </View>
              </View>
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={() => handleToggle('notificationsEnabled')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            <View style={[styles.settingDivider, { backgroundColor: colors.cardBorder }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Volume2 size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Sound Effects</Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Completion sounds</Text>
                </View>
              </View>
              <Switch
                value={preferences.soundEffects}
                onValueChange={() => handleToggle('soundEffects')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            <View style={[styles.settingDivider, { backgroundColor: colors.cardBorder }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <PartyPopper size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Confetti</Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Celebration effects</Text>
                </View>
              </View>
              <Switch
                value={preferences.confettiEnabled}
                onValueChange={() => handleToggle('confettiEnabled')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Appearance</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.themeSection}>
              <View style={styles.themeSectionHeader}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Moon size={20} color="#6366F1" />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Choose your preferred appearance</Text>
                </View>
              </View>
              
              <View style={styles.themeOptions}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    preferences.theme === 'system' && { backgroundColor: colors.primaryDim, borderColor: colors.primary },
                  ]}
                  onPress={() => handleThemeChange('system')}
                  activeOpacity={0.7}
                >
                  <Smartphone size={18} color={preferences.theme === 'system' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.themeOptionText,
                    { color: colors.textSecondary },
                    preferences.theme === 'system' && { color: colors.primary },
                  ]}>System</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    preferences.theme === 'light' && { backgroundColor: colors.primaryDim, borderColor: colors.primary },
                  ]}
                  onPress={() => handleThemeChange('light')}
                  activeOpacity={0.7}
                >
                  <Sun size={18} color={preferences.theme === 'light' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.themeOptionText,
                    { color: colors.textSecondary },
                    preferences.theme === 'light' && { color: colors.primary },
                  ]}>Light</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    preferences.theme === 'dark' && { backgroundColor: colors.primaryDim, borderColor: colors.primary },
                  ]}
                  onPress={() => handleThemeChange('dark')}
                  activeOpacity={0.7}
                >
                  <Moon size={18} color={preferences.theme === 'dark' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.themeOptionText,
                    { color: colors.textSecondary },
                    preferences.theme === 'dark' && { color: colors.primary },
                  ]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Data</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity 
              style={styles.settingRow} 
              activeOpacity={0.7}
              onPress={handleClearData}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Trash2 size={20} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.error }]}>
                    Clear All Data
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Delete all loops and history</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Account</Text>
            
            <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primaryDim }]}>
                    <Check size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Signed In</Text>
                    <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>{authUser?.email || 'Unknown'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.settingDivider, { backgroundColor: colors.cardBorder }]} />
              
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <LogOut size={20} color={colors.error} />
                  </View>
                  <View>
                    <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
                    <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Log out of your account</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>About</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Info size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>LOOPS</Text>
                  <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>Version 1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          Built for clarity of mind.{'\n'}
          Close loops, clear your head.
        </Text>
      </ScrollView>

      <Paywall
        visible={showPaywall}
        onClose={closePaywall}
        trigger={paywallTrigger}
      />
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
  statsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 15,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statDivider: {
    height: 1,
    marginVertical: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    marginLeft: 70,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 40,
  },
  proCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  proIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    flex: 1,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  proPlan: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  proFeatures: {
    gap: 10,
    marginBottom: 12,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureText: {
    fontSize: 14,
  },
  proExpiry: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
  },
  upgradeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 16,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  upgradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  themeSection: {
    padding: 16,
  },
  themeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});
