import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Crown, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import GuardianHero from '@/components/GuardianHero';

interface PaywallGateProps {
  type: 'scan' | 'url';
}

export default function PaywallGate({ type: _type }: PaywallGateProps) {
  const router = useRouter();
  const { t } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  const features = [
    t('premiumFeature1'),
    t('premiumFeature2'),
    t('premiumFeature4'),
    t('premiumFeature5'),
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.brandIconFrame}>
        <GuardianHero size={180} markSize={124} />
      </View>

      <Text style={styles.title}>{t('paywallTitle')}</Text>
      <Text style={styles.description}>{t('paywallDesc')}</Text>

      <View style={styles.featuresCard}>
        <View style={styles.featuresHeader}>
          <Crown size={16} color={Colors.gold} />
          <Text style={styles.featuresTitle}>Premium</Text>
        </View>
        {features.map((feat, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => router.push('/(tabs)/premium' as any)}
          activeOpacity={0.8}
          testID="paywall-upgrade-btn"
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeBtnGradient}
          >
            <Shield size={20} color={Colors.background} />
            <Text style={styles.upgradeBtnText}>{t('upgradeToPremium')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  brandIconFrame: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: -4 },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 4,
  },
  featuresCard: {
    width: '100%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
    marginBottom: 4,
  },
  featuresHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  upgradeBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden' as const,
  },
  upgradeBtnGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    minHeight: 56,
  },
  upgradeBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.background,
  },
});
