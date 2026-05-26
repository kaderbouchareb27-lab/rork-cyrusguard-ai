import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { translations, type Language } from '@/constants/translations';
import { type ScanResult } from '@/mocks/scans';
import { countryConfigs, type Currency } from '@/constants/countries';
import {
  configureRevenueCat,
  getOfferings,
  getCustomerInfo,
  hasPremiumEntitlement,
  pickPackage,
  purchasePackage,
  restorePurchases as rcRestorePurchases,
  setRCUserId,
  isRCAvailable,
} from '@/services/revenueCat';
import type { PurchasesOffering } from 'react-native-purchases';

export type Country = 'CA' | 'US' | 'FR';

interface UserProfile {
  email: string;
  name: string;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'annual';
}

interface AuthState {
  isAuthenticated: boolean;
  uid: string | null;
  email: string | null;
  fullName: string | null;
  provider: 'apple' | 'guest' | null;
}

const FREE_CREDITS = 2;

const STORAGE_KEYS = {
  language: 'cyrusguard_language',
  country: 'cyrusguard_country',
  scans: 'cyrusguard_scans',
  user: 'cyrusguard_user',
  creditsUsed: 'cyrusguard_credits_used',
  aiDisclosure: 'cyrusguard_ai_disclosure',
  auth: 'cyrusguard_auth',
};



export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('fr');
  const [country, setCountryState] = useState<Country>('CA');
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [user, setUser] = useState<UserProfile>({
    email: '',
    name: '',
    isPremium: false,
    plan: 'free',
  });
  const [showPaymentSuccess, setShowPaymentSuccess] = useState<boolean>(false);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [hasAcceptedAIDisclosure, setHasAcceptedAIDisclosureState] = useState<boolean>(false);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    uid: null,
    email: null,
    fullName: null,
    provider: null,
  });

  const settingsQuery = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      try {
        const [langStr, countryStr, userStr, creditsStr, disclosureStr, authStr, scansStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.country),
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.creditsUsed),
          AsyncStorage.getItem(STORAGE_KEYS.aiDisclosure),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.scans),
        ]);
        let parsedUser = null;
        if (userStr) {
          try {
            parsedUser = JSON.parse(userStr);
          } catch (e) {
            console.log('[AppContext] Failed to parse user data:', e);
          }
        }
        let parsedAuth: AuthState | null = null;
        if (authStr) {
          try {
            parsedAuth = JSON.parse(authStr);
          } catch (e) {
            console.log('[AppContext] Failed to parse auth data:', e);
          }
        }
        let parsedScans: ScanResult[] = [];
        if (scansStr) {
          try { parsedScans = JSON.parse(scansStr); } catch (e) { console.log('[AppContext] Failed to parse scans:', e); }
        }
        return {
          language: (langStr as Language) || 'fr',
          country: (countryStr as Country) || 'CA',
          user: parsedUser,
          creditsUsed: creditsStr ? parseInt(creditsStr, 10) : 0,
          hasAcceptedAIDisclosure: disclosureStr === 'true',
          auth: parsedAuth,
          scans: parsedScans,
        };
      } catch (e) {
        console.log('[AppContext] Error loading settings:', e);
        return {
          language: 'fr' as Language,
          country: 'CA' as Country,
          user: null,
          creditsUsed: 0,
          hasAcceptedAIDisclosure: false,
          auth: null,
          scans: [] as ScanResult[],
        };
      }
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      if (settingsQuery.data.language) setLanguageState(settingsQuery.data.language);
      if (settingsQuery.data.country) setCountryState(settingsQuery.data.country);
      if (settingsQuery.data.user) setUser(settingsQuery.data.user);
      setCreditsUsed(settingsQuery.data.creditsUsed ?? 0);
      setHasAcceptedAIDisclosureState(settingsQuery.data.hasAcceptedAIDisclosure ?? false);
      if (settingsQuery.data.auth) {
        setAuth(settingsQuery.data.auth);
      }
      if (settingsQuery.data.scans && settingsQuery.data.scans.length > 0) {
        setScans(settingsQuery.data.scans);
      }
    }
  }, [settingsQuery.data]);



  const currency = useMemo<Currency>(() => countryConfigs[country].currency, [country]);
  const currencySymbol = useMemo(() => countryConfigs[country].currencySymbol, [country]);
  const availableLanguages = useMemo(() => countryConfigs[country].availableLanguages, [country]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] ?? key;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
  }, []);

  const setCountry = useCallback(async (c: Country) => {
    setCountryState(c);
    const config = countryConfigs[c];
    const defaultLang = config.defaultLanguage;
    setLanguageState(defaultLang);
    await AsyncStorage.setItem(STORAGE_KEYS.country, c);
    await AsyncStorage.setItem(STORAGE_KEYS.language, defaultLang);
  }, []);

  const setLanguageSafe = useCallback(async (lang: Language) => {
    const config = countryConfigs[country];
    if (config.availableLanguages.includes(lang)) {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
    }
  }, [country]);

  const addScan = useCallback((scan: ScanResult) => {
    setScans(prev => {
      const updated = [scan, ...prev];
      void AsyncStorage.setItem(STORAGE_KEYS.scans, JSON.stringify(updated.slice(0, 50)));
      return updated;
    });
  }, []);

  const remainingCredits = useMemo(() => {
    if (user.isPremium) return Infinity;
    return Math.max(0, FREE_CREDITS - creditsUsed);
  }, [user.isPremium, creditsUsed]);

  const canUseFeature = useMemo(() => {
    return user.isPremium || creditsUsed < FREE_CREDITS;
  }, [user.isPremium, creditsUsed]);

  const needsPaywall = useMemo(() => {
    return !canUseFeature;
  }, [canUseFeature]);

  const needsAccountCreation = useMemo(() => {
    return user.isPremium && !auth.isAuthenticated;
  }, [user.isPremium, auth.isAuthenticated]);

  const canScan = canUseFeature;

  const acceptAIDisclosure = useCallback(async () => {
    setHasAcceptedAIDisclosureState(true);
    await AsyncStorage.setItem(STORAGE_KEYS.aiDisclosure, 'true');
    console.log('[AppContext] AI disclosure accepted');
  }, []);

  const revokeAIDisclosure = useCallback(async () => {
    setHasAcceptedAIDisclosureState(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.aiDisclosure);
    console.log('[AppContext] AI disclosure revoked');
  }, []);

  const consumeCredit = useCallback(() => {
    if (user.isPremium) return;
    setCreditsUsed(prev => {
      const next = prev + 1;
      void AsyncStorage.setItem(STORAGE_KEYS.creditsUsed, String(next));
      return next;
    });
  }, [user.isPremium]);

  const loginUser = useCallback(async (params: {
    uid: string;
    email: string | null;
    fullName: string | null;
    provider: 'apple' | 'guest';
  }) => {
    console.log('[Auth] Logging in user:', params.provider);
    const newAuth: AuthState = {
      isAuthenticated: true,
      uid: params.uid,
      email: params.email,
      fullName: params.fullName,
      provider: params.provider,
    };
    setAuth(newAuth);
    await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(newAuth));

    let updatedUser: UserProfile | null = null;
    setUser(prev => {
      updatedUser = {
        ...prev,
        email: params.email ?? prev.email,
        name: params.fullName ?? prev.name,
      };
      return updatedUser;
    });

    if (updatedUser) {
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    }

    // Identify the user in RevenueCat so purchases follow the account.
    void setRCUserId(params.uid);
  }, []);

  const logoutUser = useCallback(async () => {
    console.log('[Auth] Logging out user');
    setAuth({
      isAuthenticated: false,
      uid: null,
      email: null,
      fullName: null,
      provider: null,
    });
    await AsyncStorage.removeItem(STORAGE_KEYS.auth);

    setUser({ email: '', name: '', isPremium: false, plan: 'free' });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ email: '', name: '', isPremium: false, plan: 'free' }));

    // Reset RevenueCat user — back to anonymous.
    void setRCUserId(null);
  }, []);

  // ---- RevenueCat integration ----
  const queryClient = useQueryClient();

  // Ensure RC is configured (no-op if already done at module load).
  useEffect(() => {
    configureRevenueCat();
  }, []);

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async (): Promise<PurchasesOffering | null> => {
      return await getOfferings();
    },
    enabled: Platform.OS !== 'web',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const customerInfoQuery = useQuery({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      const info = await getCustomerInfo();
      return info;
    },
    enabled: Platform.OS !== 'web',
    retry: 1,
    refetchOnWindowFocus: true,
  });

  // Sync premium status from RevenueCat customer info into local user state.
  useEffect(() => {
    const info = customerInfoQuery.data;
    if (!info) return;
    const isPremium = hasPremiumEntitlement(info);
    const activeEntitlement = info.entitlements.active['premium'];
    let plan: 'free' | 'monthly' | 'annual' = 'free';
    if (isPremium && activeEntitlement?.productIdentifier) {
      const pid = activeEntitlement.productIdentifier.toLowerCase();
      if (pid.includes('annual') || pid.includes('year') || pid.includes('yearly')) plan = 'annual';
      else if (pid.includes('month')) plan = 'monthly';
    }
    setUser(prev => {
      if (prev.isPremium === isPremium && prev.plan === plan) return prev;
      const next = { ...prev, isPremium, plan };
      void AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      return next;
    });
  }, [customerInfoQuery.data]);

  const purchaseMutation = useMutation({
    mutationFn: async (cycle: 'monthly' | 'annual') => {
      const offering = offeringsQuery.data ?? (await getOfferings());
      if (!offering) {
        throw new Error('NO_OFFERINGS');
      }
      const pkg = pickPackage(offering, cycle);
      if (!pkg) {
        throw new Error('NO_PACKAGE');
      }
      const outcome = await purchasePackage(pkg);
      return outcome;
    },
    onSuccess: (outcome) => {
      if (outcome.status === 'success') {
        void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return await rcRestorePurchases();
    },
    onSuccess: (outcome) => {
      if (outcome.status === 'success') {
        void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      }
    },
  });

  const upgradeToPremium = useCallback(async (plan: 'monthly' | 'annual') => {
    console.log('[IAP] upgradeToPremium called with plan:', plan);
    if (Platform.OS === 'web') {
      Alert.alert(
        language === 'fr' ? 'Info' : 'Info',
        language === 'fr'
          ? 'Les achats intégrés ne sont pas disponibles sur le web. Téléchargez l\'app sur iOS.'
          : 'In-app purchases are not available on web. Download the app on iOS.'
      );
      return;
    }
    if (!isRCAvailable()) {
      configureRevenueCat();
    }
    try {
      const outcome = await purchaseMutation.mutateAsync(plan);
      if (outcome.status === 'cancelled') {
        return;
      }
      if (outcome.status === 'pending') {
        Alert.alert(
          language === 'fr' ? 'Paiement en attente' : 'Payment pending',
          language === 'fr'
            ? 'Votre achat est en attente d\'approbation. Vous recevrez Premium dès qu\'il sera approuvé.'
            : 'Your purchase is pending approval. You will get Premium as soon as it is approved.'
        );
        return;
      }
      if (outcome.status === 'error') {
        Alert.alert(
          language === 'fr' ? 'Erreur d\'achat' : 'Purchase error',
          outcome.message
        );
        return;
      }
      // success
      Alert.alert(
        language === 'fr' ? 'Bienvenue dans Premium !' : 'Welcome to Premium!',
        language === 'fr'
          ? 'Votre abonnement est actif. Profitez de toutes les fonctionnalités.'
          : 'Your subscription is active. Enjoy all the features.'
      );
    } catch (e: unknown) {
      const err = e as { message?: string };
      const msg = err?.message ?? 'Unknown error';
      if (msg === 'NO_OFFERINGS' || msg === 'NO_PACKAGE') {
        Alert.alert(
          language === 'fr' ? 'Indisponible' : 'Unavailable',
          language === 'fr'
            ? 'Les offres ne sont pas disponibles pour le moment. Réessayez plus tard.'
            : 'Offers are not available right now. Please try again later.'
        );
      } else {
        Alert.alert(
          language === 'fr' ? 'Erreur d\'achat' : 'Purchase error',
          msg
        );
      }
    }
  }, [language, purchaseMutation]);

  const restorePurchases = useCallback(async () => {
    console.log('[IAP] restorePurchases called');
    if (Platform.OS === 'web') {
      Alert.alert(
        language === 'fr' ? 'Info' : 'Info',
        language === 'fr'
          ? 'La restauration n\'est pas disponible sur le web.'
          : 'Restore is not available on web.'
      );
      return;
    }
    if (!isRCAvailable()) {
      configureRevenueCat();
    }
    try {
      const outcome = await restoreMutation.mutateAsync();
      if (outcome.status === 'error') {
        Alert.alert(
          language === 'fr' ? 'Erreur' : 'Error',
          outcome.message
        );
        return;
      }
      if (outcome.hasPremium) {
        Alert.alert(
          language === 'fr' ? 'Achats restaurés' : 'Purchases restored',
          language === 'fr'
            ? 'Votre abonnement Premium est de nouveau actif.'
            : 'Your Premium subscription is active again.'
        );
      } else {
        Alert.alert(
          language === 'fr' ? 'Aucun achat trouvé' : 'No purchases found',
          language === 'fr'
            ? 'Aucun abonnement actif n\'a été trouvé pour ce compte Apple.'
            : 'No active subscription was found for this Apple account.'
        );
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(
        language === 'fr' ? 'Erreur' : 'Error',
        err?.message ?? 'Unknown error'
      );
    }
  }, [language, restoreMutation]);

  const deleteAllData = useCallback(async () => {
    setScans([]);
    setCreditsUsed(0);
    setHasAcceptedAIDisclosureState(false);
    setAuth({ isAuthenticated: false, uid: null, email: null, fullName: null, provider: null });
    setUser({ email: '', name: '', isPremium: false, plan: 'free' });
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }, []);

  return useMemo(() => ({
    language,
    country,
    currency,
    currencySymbol,
    availableLanguages,
    user,
    scans,
    canScan,
    remainingCredits,
    creditsUsed,
    consumeCredit,
    canUseFeature,
    needsPaywall,
    needsAccountCreation,
    showPaymentSuccess,
    hasAcceptedAIDisclosure,
    acceptAIDisclosure,
    revokeAIDisclosure,
    auth,
    loginUser,
    logoutUser,
    t,
    setLanguage,
    setLanguageSafe,
    setCountry,
    addScan,
    upgradeToPremium,
    restorePurchases,
    deleteAllData,
    setShowPaymentSuccess,
    isLoading: settingsQuery.isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    currentOffering: offeringsQuery.data ?? null,
    isOfferingsLoading: offeringsQuery.isLoading,
  }), [
    language, country, currency, currencySymbol, availableLanguages,
    user, scans, canScan,
    remainingCredits, creditsUsed, consumeCredit,
    canUseFeature, needsPaywall, needsAccountCreation, showPaymentSuccess,
    hasAcceptedAIDisclosure, acceptAIDisclosure, revokeAIDisclosure,
    auth, loginUser, logoutUser,
    t, setLanguage, setLanguageSafe,
    setCountry, addScan, upgradeToPremium, restorePurchases,
    deleteAllData, setShowPaymentSuccess, settingsQuery.isLoading,
    purchaseMutation.isPending, restoreMutation.isPending,
    offeringsQuery.data, offeringsQuery.isLoading,
  ]);
});

export function useLocalizedScan(scan: ScanResult) {
  const { language } = useApp();
  return useMemo(() => ({
    ...scan,
    localSummary: language === 'en' ? scan.summaryEn : scan.summary,
    localExplanation: language === 'en' ? scan.explanationEn : scan.explanation,
    localSuspicious: language === 'en' ? scan.suspiciousElementsEn : scan.suspiciousElements,
    localReassuring: language === 'en' ? scan.reassuringElementsEn : scan.reassuringElements,
    localAdvice: language === 'en' ? scan.adviceEn : scan.advice,
  }), [scan, language]);
}
