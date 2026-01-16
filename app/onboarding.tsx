import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Target,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { usePro } from '@/context/ProContext';

// Screen dimensions available if needed
const _screenDimensions = Dimensions.get('window');
void _screenDimensions;

const SCREENS = [
  { id: 'splash', type: 'splash' },
  { id: 'value', type: 'value' },
  { id: 'problem', type: 'problem' },
  { id: 'solution', type: 'solution' },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { completeOnboarding } = usePro();
  const [currentScreen, setCurrentScreen] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const problemItemsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const solutionItemsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
      router.replace('/auth');
    }
  }, [currentScreen, completeOnboarding, router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
    router.replace('/auth');
  }, [completeOnboarding, router]);

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentScreen === 2) {
      problemItemsAnim.forEach((anim, index) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 200,
          useNativeDriver: true,
        }).start();
      });
    }

    if (currentScreen === 3) {
      solutionItemsAnim.forEach((anim, index) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 150,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentScreen, fadeAnim, scaleAnim, slideAnim, problemItemsAnim, solutionItemsAnim]);

  useEffect(() => {
    if (currentScreen === 0) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, handleNext]);

  const renderSplash = () => (
    <LinearGradient
      colors={['#0A1628', '#0A0A0F']}
      style={styles.splashContainer}
    >
      <Animated.View
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Sparkles size={56} color={colors.primary} />
        </View>
        <Text style={[styles.splashTitle, { color: colors.text }]}>LOOPS</Text>
        <Animated.Text
          style={[
            styles.splashTagline,
            {
              color: colors.textSecondary,
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          Close Your Open Loops
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );

  const renderValueProp = () => (
    <LinearGradient
      colors={['#0A2035', '#0A0A0F']}
      style={styles.screenContainer}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Brain size={64} color={colors.primary} />
        </Animated.View>

        <Animated.Text
          style={[
            styles.headline,
            {
              color: colors.text,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          Your mind keeps track{'\n'}of everything.
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subheadline,
            {
              color: colors.primary,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          We help you organize it.
        </Animated.Text>

        <Animated.View
          style={[
            styles.particlesContainer,
            { opacity: fadeAnim },
          ]}
        >
          {[...Array(12)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: colors.primary,
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 30}%`,
                  opacity: 0.3 + (i % 3) * 0.2,
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={[styles.nextText, { color: colors.background }]}>Continue</Text>
          <ArrowRight size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderProblem = () => {
    const narrativeCopy = [
      "Your mind is juggling work, life, and everything in between.",
      "Tasks pop up at random, then disappear when you need them.",
      "You feel busy all day, but important things still slip through.",
    ];

    return (
      <LinearGradient
        colors={['#2A1515', '#1A0A0A', '#0A0A0F']}
        style={styles.screenContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.problemHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.problemPreTitle, { color: colors.error }]}>The Hidden Cost</Text>
            <Text style={[styles.problemTitle, { color: colors.text }]}>Mental Clutter{'\n'}Is Expensive</Text>
          </Animated.View>

          <View style={styles.problemsContainer}>
            {narrativeCopy.map((line, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.narrativeLine,
                  {
                    opacity: problemItemsAnim[index],
                    transform: [{
                      translateY: problemItemsAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={[styles.narrativeText, { color: colors.text }]}>{line}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.Text
            style={[
              styles.problemCta,
              { color: colors.warning, opacity: problemItemsAnim[2] },
            ]}
          >
            Sound familiar?
          </Animated.Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
            <Text style={[styles.nextText, { color: colors.background }]}>Show Me The Solution</Text>
            <ArrowRight size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderSolution = () => {
    const steps = [
      { icon: Brain, label: 'Dump', desc: 'Brain dump everything' },
      { icon: Zap, label: 'Extract', desc: 'AI organizes loops' },
      { icon: Check, label: 'Close', desc: 'Complete with ease' },
      { icon: Target, label: 'Clarity', desc: 'Peace of mind' },
    ];

    const benefitsCopy = [
      "Loops gives all your unfinished tasks a home outside your head.",
      "Capture everything in seconds, then come back to clear, organised loops.",
      "Less noise, more follow-through, and a brain that finally feels lighter.",
    ];

    return (
      <LinearGradient
        colors={['#0A2A35', '#0A1A25', '#0A0A0F']}
        style={styles.screenContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.solutionHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.solutionPreTitle, { color: colors.primary }]}>Introducing Loops</Text>
            <Text style={[styles.solutionTitle, { color: colors.text }]}>From Chaos{'\n'}To Crystal Clear</Text>
          </Animated.View>

          <View style={styles.flowContainer}>
            {steps.map((step, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.flowStep,
                  {
                    opacity: solutionItemsAnim[index],
                    transform: [{
                      scale: solutionItemsAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.flowIconContainer}>
                  <step.icon size={24} color={colors.primary} />
                </View>
                <Text style={[styles.flowLabel, { color: colors.text }]}>{step.label}</Text>
                <Text style={[styles.flowDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
                {index < steps.length - 1 && (
                  <View style={styles.flowConnector} />
                )}
              </Animated.View>
            ))}
          </View>

          <Animated.View
            style={[
              styles.benefitsContainer,
              { opacity: solutionItemsAnim[3] },
            ]}
          >
            {benefitsCopy.map((line, index) => (
              <Text key={index} style={[styles.benefitNarrativeText, { color: colors.text }]}>{line}</Text>
            ))}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.getStartedText, { color: colors.background }]}>Get Started</Text>
            <Sparkles size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return renderSplash();
      case 1:
        return renderValueProp();
      case 2:
        return renderProblem();
      case 3:
        return renderSolution();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      
      {currentScreen > 0 && currentScreen < SCREENS.length && (
        <View style={[styles.pagination, { bottom: insets.bottom + 90 }]}>
          {SCREENS.slice(1).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentScreen === index + 1 && [styles.dotActive, { backgroundColor: colors.primary }],
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '800' as const,

    letterSpacing: 8,
    marginBottom: 12,
  },
  splashTagline: {
    fontSize: 16,

    letterSpacing: 2,
  },
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 180,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700' as const,

    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 20,

    textAlign: 'center',
    fontWeight: '500' as const,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    top: '45%',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,

  },
  problemHeader: {
    marginBottom: 32,
  },
  problemPreTitle: {
    fontSize: 14,

    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  problemTitle: {
    fontSize: 34,
    fontWeight: '800' as const,

    lineHeight: 42,
  },
  problemsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  narrativeLine: {
    marginBottom: 8,
  },
  narrativeText: {
    fontSize: 18,

    lineHeight: 28,
    textAlign: 'center',
  },
  problemCta: {
    fontSize: 24,
    fontWeight: '600' as const,

    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
  solutionHeader: {
    marginBottom: 32,
  },
  solutionPreTitle: {
    fontSize: 14,

    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 34,
    fontWeight: '800' as const,

    lineHeight: 42,
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  flowStep: {
    flex: 1,
    alignItems: 'center',
  },
  flowIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  flowLabel: {
    fontSize: 14,
    fontWeight: '700' as const,

    marginBottom: 4,
  },
  flowDesc: {
    fontSize: 11,

    textAlign: 'center',
  },
  flowConnector: {
    position: 'absolute',
    top: 28,
    right: -15,
    width: 30,
    height: 2,
    backgroundColor: 'rgba(0, 217, 255, 0.3)',
  },
  benefitsContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  benefitNarrativeText: {
    fontSize: 16,

    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,

  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600' as const,

  },
  getStartedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,

    paddingVertical: 18,
    borderRadius: 16,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700' as const,

  },
  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 24,

  },
});
