import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock, Crown, Zap, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface PaywallGateProps {
  type: 'scan' | 'chat' | 'url' | 'scan-chat';
}

export default function PaywallGate({ type: _type }: PaywallGateProps) {
  const router = useRouter();
  const { t, needsAuth } = useApp();
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

  if (needsAuth) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.lockCircleOuter}>
          <LinearGradient
            colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.05)']}
            style={styles.lockCircle}
          >
            <UserPlus size={40} color={Colors.info} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>{t('authRequiredTitle')}</Text>
        <Text style={styles.description}>{t('authRequiredDesc')}</Text>

        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Lock size={16} color={Colors.info} />
            <Text style={[styles.featuresTitle, { color: Colors.info }]}>{t('authRequiredWhy')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.featureText}>{t('authBenefit1')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.featureText}>{t('authBenefit2')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.featureText}>{t('authBenefit3')}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => router.push('/auth' as any)}
            activeOpacity={0.8}
            testID="paywall-auth-btn"
          >
            <LinearGradient
              colors={[Colors.info, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBtnGradient}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.authBtnText}>{t('createAccountCTA')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  const features = [
    t('premiumFeature1'),
    t('premiumFeature2'),
    t('premiumFeature4'),
    t('premiumFeature5'),
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.lockCircleOuter}>
        <LinearGradient
          colors={['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.05)']}
          style={styles.lockCircle}
        >
          <Lock size={40} color={Colors.danger} />
        </LinearGradient>
      </View>

      <Text style={styles.title}>{t('paywallTitle')}</Text>
      <Text style={styles.description}>{t('paywallDesc')}</Text>

      <View style={styles.featuresCard}>
        <View style={styles.featuresHeader}>
          <Crown size={16} color="#FFD700" />
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
  lockCircleOuter: {
    marginBottom: 8,
  },
  lockCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
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
    color: '#FFD700',
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
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  authBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  upgradeBtnGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  upgradeBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  authBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
});
