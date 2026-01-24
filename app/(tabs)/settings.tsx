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
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import { usePro } from '@/context/ProContext';
import { useTheme } from '@/context/ThemeContext';
import GradientBackground from '@/components/GradientBackground';
import Paywall from '@/components/Paywall';
import EnsoIcon from '@/components/EnsoIcon';
import { UserPreferences } from '@/types';

/**
 * Settings Screen - Preferences
 *
 * A calm space for adjusting one's practice.
 * Minimal visual noise, clear options,
 * respectful of the user's attention.
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, updatePreferences, openLoops, streak, loops } = useLoops();
  const {
    isPro,
    proStatus,
    showPaywall,
    triggerPaywall,
    closePaywall,
    paywallTrigger,
    signOut,
    isAuthenticated,
    authUser,
  } = usePro();

  const handleToggle = useCallback(
    (key: 'notificationsEnabled' | 'soundEffects' | 'confettiEnabled') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updatePreferences({ [key]: !preferences[key] });
    },
    [preferences, updatePreferences]
  );

  const handleThemeChange = useCallback(
    (theme: UserPreferences['theme']) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updatePreferences({ theme });
    },
    [updatePreferences]
  );

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }, [signOut]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your loops, streaks, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Subscription */}
        {!isPro ? (
          <TouchableOpacity
            style={[styles.upgradeCard, { borderColor: colors.warning }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              triggerPaywall('feature');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.upgradeContent}>
              <Sparkles size={20} color={colors.warning} />
              <View style={styles.upgradeText}>
                <Text style={[styles.upgradeTitle, { color: colors.text }]}>Unlock Pro</Text>
                <Text style={[styles.upgradeSubtitle, { color: colors.textSecondary }]}>
                  Unlimited releases, smart scheduling
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.proCard, { borderColor: colors.success }]}>
            <View style={styles.proHeader}>
              <EnsoIcon size={20} color={colors.success} variant="closed" />
              <Text style={[styles.proLabel, { color: colors.success }]}>Pro Active</Text>
            </View>
            {proStatus.expiresAt && (
              <Text style={[styles.proExpiry, { color: colors.textTertiary }]}>
                Renews {new Date(proStatus.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>{loops.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>created</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.totalLoopsClosed}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>closed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak.longestCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>best streak</Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>preferences</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Bell size={18} color={colors.textSecondary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Reminders</Text>
              </View>
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={() => handleToggle('notificationsEnabled')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Volume2 size={18} color={colors.textSecondary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Sounds</Text>
              </View>
              <Switch
                value={preferences.soundEffects}
                onValueChange={() => handleToggle('soundEffects')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>appearance</Text>

          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.cardBorder },
                preferences.theme === 'system' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryDim,
                },
              ]}
              onPress={() => handleThemeChange('system')}
              activeOpacity={0.7}
            >
              <Smartphone
                size={18}
                color={preferences.theme === 'system' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: preferences.theme === 'system' ? colors.primary : colors.textSecondary },
                ]}
              >
                Auto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.cardBorder },
                preferences.theme === 'light' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryDim,
                },
              ]}
              onPress={() => handleThemeChange('light')}
              activeOpacity={0.7}
            >
              <Sun
                size={18}
                color={preferences.theme === 'light' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: preferences.theme === 'light' ? colors.primary : colors.textSecondary },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.cardBorder },
                preferences.theme === 'dark' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryDim,
                },
              ]}
              onPress={() => handleThemeChange('dark')}
              activeOpacity={0.7}
            >
              <Moon
                size={18}
                color={preferences.theme === 'dark' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: preferences.theme === 'dark' ? colors.primary : colors.textSecondary },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>account</Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <EnsoIcon size={18} color={colors.primary} variant="closed" />
                  <View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Signed in</Text>
                    <Text style={[styles.rowSublabel, { color: colors.textTertiary }]}>
                      {authUser?.email || 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />

              <TouchableOpacity style={styles.row} onPress={handleSignOut} activeOpacity={0.7}>
                <View style={styles.rowContent}>
                  <LogOut size={18} color={colors.error} />
                  <Text style={[styles.rowLabel, { color: colors.error }]}>Sign out</Text>
                </View>
                <ChevronRight size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>data</Text>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Trash2 size={18} color={colors.error} />
                <Text style={[styles.rowLabel, { color: colors.error }]}>Clear all data</Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <EnsoIcon size={24} color={colors.textTertiary} variant="closed" opacity={0.5} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Loops · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <Paywall visible={showPaywall} onClose={closePaywall} trigger={paywallTrigger} />
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
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeText: {
    gap: 2,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  upgradeSubtitle: {
    fontSize: 13,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  proExpiry: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    marginLeft: 44,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
