import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  Check,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { usePro, PaywallTrigger } from '@/context/ProContext';

const { height } = Dimensions.get('window');

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  trigger?: PaywallTrigger;
}

const PAYWALL_CONTENT: Record<PaywallTrigger, { title: string; subtitle: string }> = {
  limit: {
    title: "You're on a roll! 🔥",
    subtitle: "Don't lose momentum. Get unlimited extractions.",
  },
  momentum: {
    title: "Keep the momentum!",
    subtitle: "Unlock unlimited brain dumps to stay in flow.",
  },
  habit: {
    title: "Building great habits!",
    subtitle: "Take your productivity to the next level.",
  },
  feature: {
    title: "Unlock Pro Intelligence",
    subtitle: "AI planning and smart deadlines are Pro features.",
  },
};

const PRO_FEATURES = [
  'Unlimited brain dumps',
  'Unlimited AI extractions',
  'Window of Opportunity tracking',
  'Advanced analytics & insights',
  'Priority support',
  'Early access to new features',
];

export default function Paywall({ visible, onClose, trigger = 'limit' }: PaywallProps) {
  const { upgradeToPro } = usePro();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handlePurchase = (plan: 'monthly' | 'yearly') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    upgradeToPro(plan);
  };

  const content = PAYWALL_CONTENT[trigger];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.handle} />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconRow}>
              <View style={styles.proIconContainer}>
                <Crown size={32} color="#FFD700" />
              </View>
            </View>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.subtitle}>{content.subtitle}</Text>
          </View>

          <View style={styles.featuresContainer}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={18} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plansContainer}>
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handlePurchase('monthly')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Zap size={20} color={Colors.primary} />
                <Text style={styles.planName}>Monthly</Text>
              </View>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planPeriod}>per month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, styles.planCardBest]}
              onPress={() => handlePurchase('yearly')}
              activeOpacity={0.8}
            >
              <View style={styles.bestBadge}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.bestBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <Sparkles size={20} color="#FFD700" />
                <Text style={styles.planName}>Yearly</Text>
              </View>
              <Text style={styles.planPrice}>$79.99</Text>
              <Text style={styles.planPeriod}>per year</Text>
              <Text style={styles.planSavings}>Save 33%</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            Cancel anytime • Restore purchases
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconRow: {
    marginBottom: 16,
  },
  proIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  planCardBest: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  planPeriod: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planSavings: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.success,
    marginTop: 4,
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
