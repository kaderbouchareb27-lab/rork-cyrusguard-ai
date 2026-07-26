import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator, Alert, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Shield, Crown, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
if (Platform.OS === 'ios') {
  try {
    AppleAuthentication = require('expo-apple-authentication');
  } catch {
    console.log('[CreateAccount] expo-apple-authentication not available');
  }
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const { loginUser, language, auth } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, checkScale]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log('[CreateAccount] User already authenticated, going back');
      router.back();
    }
  }, [auth.isAuthenticated, router]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    if (!AppleAuthentication) {
      Alert.alert(
        language === 'fr' ? 'Non disponible' : 'Not available',
        language === 'fr'
          ? 'Sign in with Apple n\'est disponible que sur iOS.'
          : 'Sign in with Apple is only available on iOS.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('[CreateAccount] Apple Sign In success');

      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
        : null;

      await loginUser({
        uid: credential.user,
        email: credential.email ?? null,
        fullName: fullName || null,
        provider: 'apple',
      });

      router.back();
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        console.log('[CreateAccount] Apple Sign In cancelled');
      } else {
        console.log('[CreateAccount] Apple Sign In error:', error);
        Alert.alert(
          language === 'fr' ? 'Erreur' : 'Error',
          language === 'fr'
            ? 'Impossible de se connecter. Veuillez réessayer.'
            : 'Unable to sign in. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, loginUser, router]);

  const handleGuestAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await loginUser({
        uid: guestId,
        email: null,
        fullName: language === 'fr' ? 'Utilisateur' : 'User',
        provider: 'guest',
      });
      router.back();
    } catch (error) {
      console.log('[CreateAccount] Guest error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language, loginUser, router]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <LinearGradient
        colors={['#06110D', '#0B2117', '#06110D']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: checkScale }] }]}>
            <LinearGradient
              colors={['rgba(73,209,125,0.28)', 'rgba(73,209,125,0.08)']}
              style={styles.successGradient}
            >
              <Check size={48} color={Colors.accent} />
            </LinearGradient>
          </Animated.View>

          <View style={styles.premiumActiveBadge}>
            <Crown size={14} color={Colors.gold} />
            <Text style={styles.premiumActiveText}>
              {language === 'fr' ? 'Premium activé' : 'Premium activated'}
            </Text>
          </View>

          <Text style={styles.title}>
            {language === 'fr'
              ? 'Votre abonnement est actif !'
              : 'Your subscription is active!'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'fr'
              ? 'Créez votre compte pour synchroniser votre abonnement et accéder à toutes les fonctionnalités.'
              : 'Create your account to sync your subscription and access all features.'}
          </Text>

          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.benefitText}>
                {language === 'fr' ? 'Synchroniser votre abonnement' : 'Sync your subscription'}
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.benefitText}>
                {language === 'fr' ? 'Sauvegarder votre historique' : 'Save your scan history'}
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.benefitText}>
                {language === 'fr' ? 'Accéder à Cyrus IA' : 'Access Cyrus AI'}
              </Text>
            </View>
          </View>

          <View style={styles.buttonsSection}>
            {Platform.OS === 'ios' && AppleAuthentication ? (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
                disabled={isLoading}
                testID="create-account-apple-btn"
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <>
                    <Text style={styles.appleLogo}></Text>
                    <Text style={styles.appleBtnText}>
                      {language === 'fr' ? 'Continuer avec Apple' : 'Continue with Apple'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuestAccount}
              activeOpacity={0.8}
              disabled={isLoading}
              testID="create-account-guest-btn"
            >
              {isLoading && Platform.OS !== 'ios' ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <Text style={styles.guestBtnText}>
                  {language === 'fr' ? 'Continuer sans Apple' : 'Continue without Apple'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.requiredNote}>
            <Shield size={14} color={Colors.textMuted} />
            <Text style={styles.requiredNoteText}>
              {language === 'fr'
                ? 'Un compte est requis pour utiliser votre abonnement Premium.'
                : 'An account is required to use your Premium subscription.'}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 16,
  },
  successCircle: {
    alignSelf: 'center' as const,
    marginBottom: 8,
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accentGlow,
  },
  premiumActiveBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  premiumActiveText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 4,
  },
  benefitsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  buttonsSection: {
    gap: 12,
    marginTop: 8,
  },
  appleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleLogo: {
    fontSize: 20,
    color: '#000000',
  },
  appleBtnText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#000000',
  },
  guestBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  requiredNote: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  requiredNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 16,
    flex: 1,
  },
});
