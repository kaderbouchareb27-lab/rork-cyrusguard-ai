import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Lock, UserPlus, Fingerprint } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
if (Platform.OS === 'ios') {
  try {
    AppleAuthentication = require('expo-apple-authentication');
  } catch {
    console.log('[Auth] expo-apple-authentication not available');
  }
}

export default function AuthScreen() {
  const router = useRouter();
  const { t, loginUser, language } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

      console.log('[Auth] Apple Sign In success, user:', credential.user);

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
        console.log('[Auth] Apple Sign In cancelled');
      } else {
        console.log('[Auth] Apple Sign In error:', error);
        Alert.alert(
          language === 'fr' ? 'Erreur de connexion' : 'Sign In Error',
          language === 'fr'
            ? 'Impossible de se connecter avec Apple. Veuillez réessayer.'
            : 'Unable to sign in with Apple. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, loginUser, router]);

  const handleGuestContinue = useCallback(async () => {
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
      console.log('[Auth] Guest continue error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language, loginUser, router]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#06110D', '#0D291C', '#06110D']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="auth-back-btn">
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.backBtn} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconSection}>
            <View style={styles.shieldOuter}>
              <LinearGradient
                colors={['rgba(73,209,125,0.24)', 'rgba(73,209,125,0.05)']}
                style={styles.shieldGradient}
              >
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.shieldLogo}
                  resizeMode="cover"
                />
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.title}>{t('authTitle')}</Text>
          <Text style={styles.subtitle}>{t('authSubtitle')}</Text>

          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.accentMuted }]}>
                <Lock size={16} color={Colors.accent} />
              </View>
              <Text style={styles.benefitText}>{t('authBenefit1')}</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.infoMuted }]}>
                <Fingerprint size={16} color={Colors.info} />
              </View>
              <Text style={styles.benefitText}>{t('authBenefit2')}</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.warningMuted }]}>
                <UserPlus size={16} color={Colors.warning} />
              </View>
              <Text style={styles.benefitText}>{t('authBenefit3')}</Text>
            </View>
          </View>

          <View style={styles.buttonsSection}>
            {Platform.OS === 'ios' && AppleAuthentication ? (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
                disabled={isLoading}
                testID="apple-signin-btn"
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <>
                    <Text style={styles.appleLogo}></Text>
                    <Text style={styles.appleBtnText}>{t('signInWithApple')}</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuestContinue}
              activeOpacity={0.8}
              disabled={isLoading}
              testID="guest-continue-btn"
            >
              {isLoading && Platform.OS !== 'ios' ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <Text style={styles.guestBtnText}>{t('continueWithAccount')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>{t('authDisclaimer')}</Text>
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
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 16,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  shieldOuter: {
    borderRadius: 32,
    overflow: 'hidden' as const,
  },
  shieldGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentGlow,
  },
  shieldLogo: {
    width: 92,
    height: 92,
    borderRadius: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 8,
  },
  benefitsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
    lineHeight: 20,
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
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 8,
  },
});
