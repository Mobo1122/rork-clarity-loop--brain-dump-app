import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  Check,
  Star,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import Colors from '@/constants/colors';
import { usePro, PaywallTrigger } from '@/context/ProContext';
import { useTheme } from '@/context/ThemeContext';

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
  const { purchasePackage, restorePurchases } = usePro();
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchOfferings();
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

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const availableOfferings = await Purchases.getOfferings();
      if (availableOfferings.current?.availablePackages) {
        setOfferings(availableOfferings.current.availablePackages);
        console.log('[Paywall] Loaded offerings:', availableOfferings.current.availablePackages.length);
      }
    } catch (error) {
      console.error('[Paywall] Error fetching offerings:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setIsPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await purchasePackage(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully!');
      onClose();
    } catch {
      Alert.alert('Restore Failed', 'No purchases found to restore.');
    } finally {
      setIsRestoring(false);
    }
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

          <View style={[styles.featuresContainer, { backgroundColor: colors.card }]}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={18} color={Colors.success} />
                <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {offerings.map((pkg, index) => {
                const isYearly = pkg.identifier.includes('annual') || pkg.identifier.includes('yearly');
                const product = pkg.product;
                
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.planCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isYearly && styles.planCardBest,
                    ]}
                    onPress={() => handlePurchase(pkg)}
                    activeOpacity={0.8}
                    disabled={isPurchasing}
                  >
                    {isYearly && (
                      <View style={styles.bestBadge}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.bestBadgeText}>BEST VALUE</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      {isYearly ? (
                        <Sparkles size={20} color="#FFD700" />
                      ) : (
                        <Zap size={20} color={colors.primary} />
                      )}
                      <Text style={[styles.planName, { color: colors.text }]}>
                        {pkg.product.title}
                      </Text>
                    </View>
                    <Text style={[styles.planPrice, { color: colors.text }]}>
                      {product.priceString}
                    </Text>
                    <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                      {product.subscriptionPeriod}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleRestore}
              disabled={isRestoring}
              style={styles.restoreButton}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <RefreshCw size={14} color={colors.primary} />
                  <Text style={[styles.restoreText, { color: colors.primary }]}>
                    Restore Purchases
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={[styles.terms, { color: colors.textTertiary }]}>
              Cancel anytime
            </Text>
          </View>
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
    maxHeight: height * 0.9,
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
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
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
  footer: {
    gap: 12,
    alignItems: 'center',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
