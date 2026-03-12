import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { translations, type Language } from '@/constants/translations';
import { type ScanResult, type ChatMessage } from '@/mocks/scans';
import { countryConfigs, type Currency } from '@/constants/countries';

export type Country = 'CA' | 'US' | 'FR';

interface UserProfile {
  email: string;
  name: string;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'annual';
}

const FREE_CREDITS = 3;
const ENTITLEMENT_ID = 'CyrusGuard AI Pro';

const STORAGE_KEYS = {
  language: 'cyrusguard_language',
  country: 'cyrusguard_country',
  scans: 'cyrusguard_scans',
  user: 'cyrusguard_user',
  chatMessages: 'cyrusguard_chat',
  dailyMessages: 'cyrusguard_daily_msgs',
  creditsUsed: 'cyrusguard_credits_used',
  aiDisclosure: 'cyrusguard_ai_disclosure',
};

function getRCApiKey(): string {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  }) ?? '';
}

let rcConfigured = false;
function configureRC() {
  if (rcConfigured) return;
  const apiKey = getRCApiKey();
  if (!apiKey) {
    console.log('[RC] No RevenueCat API key found, skipping configuration');
    return;
  }
  try {
    void Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    rcConfigured = true;
    console.log('[RC] RevenueCat configured successfully');
  } catch (e) {
    console.log('[RC] Error configuring RevenueCat:', e);
  }
}

configureRC();

function checkPremiumFromCustomerInfo(info: CustomerInfo): boolean {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  return !!entitlement;
}

function getPlanFromCustomerInfo(info: CustomerInfo): 'free' | 'monthly' | 'annual' {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return 'free';
  const productId = entitlement.productIdentifier ?? '';
  if (productId.includes('yearly') || productId.includes('annual')) return 'annual';
  if (productId.includes('monthly')) return 'monthly';
  if (productId.includes('lifetime')) return 'annual';
  return 'monthly';
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState<Language>('fr');
  const [country, setCountryState] = useState<Country>('CA');
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dailyMessageCount, setDailyMessageCount] = useState<number>(0);
  const [user, setUser] = useState<UserProfile>({
    email: 'demo@cyrusguard.ai',
    name: 'Utilisateur Demo',
    isPremium: false,
    plan: 'free',
  });
  const [showPaymentSuccess, setShowPaymentSuccess] = useState<boolean>(false);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [hasAcceptedAIDisclosure, setHasAcceptedAIDisclosureState] = useState<boolean>(false);

  const settingsQuery = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      try {
        const [langStr, countryStr, userStr, creditsStr, disclosureStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.country),
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.creditsUsed),
          AsyncStorage.getItem(STORAGE_KEYS.aiDisclosure),
        ]);
        let parsedUser = null;
        if (userStr) {
          try {
            parsedUser = JSON.parse(userStr);
          } catch (e) {
            console.log('[AppContext] Failed to parse user data:', e);
          }
        }
        return {
          language: (langStr as Language) || 'fr',
          country: (countryStr as Country) || 'CA',
          user: parsedUser,
          creditsUsed: creditsStr ? parseInt(creditsStr, 10) : 0,
          hasAcceptedAIDisclosure: disclosureStr === 'true',
        };
      } catch (e) {
        console.log('[AppContext] Error loading settings:', e);
        return {
          language: 'fr' as Language,
          country: 'CA' as Country,
          user: null,
          creditsUsed: 0,
          hasAcceptedAIDisclosure: false,
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
    }
  }, [settingsQuery.data]);

  const customerInfoQuery = useQuery({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      if (!rcConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log('[RC] Customer info fetched:', JSON.stringify(info.entitlements.active));
        return info;
      } catch (e) {
        console.log('[RC] Error fetching customer info:', e);
        return null;
      }
    },
    refetchInterval: 60000,
  });

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      if (!rcConfigured) return null;
      try {
        const offerings = await Purchases.getOfferings();
        console.log('[RC] Offerings fetched:', offerings.current?.identifier);
        return offerings;
      } catch (e) {
        console.log('[RC] Error fetching offerings:', e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const info = customerInfoQuery.data;
    if (!info) return;
    const isPremium = checkPremiumFromCustomerInfo(info);
    const plan = getPlanFromCustomerInfo(info);
    console.log('[RC] Syncing premium status: isPremium=', isPremium, 'plan=', plan);
    setUser(prev => {
      if (prev.isPremium === isPremium && prev.plan === plan) return prev;
      const updated = { ...prev, isPremium, plan };
      void AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  }, [customerInfoQuery.data]);

  useEffect(() => {
    if (!rcConfigured) return;
    const listener = (info: CustomerInfo) => {
      console.log('[RC] CustomerInfo listener triggered');
      queryClient.setQueryData(['rc-customer-info'], info);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [queryClient]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('[RC] Purchasing package:', pkg.identifier);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: (info) => {
      console.log('[RC] Purchase successful');
      queryClient.setQueryData(['rc-customer-info'], info);
      const isPremium = checkPremiumFromCustomerInfo(info);
      if (isPremium) {
        setShowPaymentSuccess(true);
        setTimeout(() => setShowPaymentSuccess(false), 5000);
      }
    },
    onError: (error: any) => {
      if (error?.userCancelled) {
        console.log('[RC] Purchase cancelled by user');
        return;
      }
      console.log('[RC] Purchase error:', error);
      Alert.alert('Error', error?.message ?? 'Purchase failed. Please try again.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('[RC] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: (info) => {
      queryClient.setQueryData(['rc-customer-info'], info);
      const isPremium = checkPremiumFromCustomerInfo(info);
      if (isPremium) {
        Alert.alert('✅', 'Your premium subscription has been restored!');
      } else {
        Alert.alert('ℹ️', 'No active subscription found.');
      }
    },
    onError: (error: any) => {
      console.log('[RC] Restore error:', error);
      Alert.alert('Error', error?.message ?? 'Failed to restore purchases.');
    },
  });

  const currentOffering = useMemo<PurchasesOffering | null>(() => {
    return offeringsQuery.data?.current ?? null;
  }, [offeringsQuery.data]);

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
    setScans(prev => [scan, ...prev]);
    if (!user.isPremium) {
      setCreditsUsed(prev => {
        const next = prev + 1;
        void AsyncStorage.setItem(STORAGE_KEYS.creditsUsed, String(next));
        return next;
      });
    }
  }, [user.isPremium]);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
    if (msg.role === 'user') {
      setDailyMessageCount(prev => prev + 1);
    }
  }, []);

  const remainingCredits = useMemo(() => {
    if (user.isPremium) return Infinity;
    return Math.max(0, FREE_CREDITS - creditsUsed);
  }, [user.isPremium, creditsUsed]);

  const canUseFeature = useMemo(() => {
    return user.isPremium || creditsUsed < FREE_CREDITS;
  }, [user.isPremium, creditsUsed]);

  const canScan = canUseFeature;
  const canChat = canUseFeature;
  const canSendMessage = canUseFeature;

  const acceptAIDisclosure = useCallback(async () => {
    setHasAcceptedAIDisclosureState(true);
    await AsyncStorage.setItem(STORAGE_KEYS.aiDisclosure, 'true');
    console.log('[AppContext] AI disclosure accepted');
  }, []);

  const consumeCredit = useCallback(() => {
    if (user.isPremium) return;
    setCreditsUsed(prev => {
      const next = prev + 1;
      void AsyncStorage.setItem(STORAGE_KEYS.creditsUsed, String(next));
      return next;
    });
  }, [user.isPremium]);

  const upgradeToPremium = useCallback(async (plan: 'monthly' | 'annual') => {
    if (!currentOffering) {
      console.log('[RC] No offering available');
      Alert.alert('Error', 'No subscription packages available. Please try again later.');
      return;
    }
    const packageId = plan === 'monthly' ? '$rc_monthly' : '$rc_annual';
    const pkg = currentOffering.availablePackages.find(p => p.identifier === packageId);
    if (!pkg) {
      console.log('[RC] Package not found:', packageId);
      Alert.alert('Error', 'Subscription package not found.');
      return;
    }
    purchaseMutation.mutate(pkg);
  }, [currentOffering, purchaseMutation]);

  const restorePurchases = useCallback(() => {
    restoreMutation.mutate();
  }, [restoreMutation]);

  const deleteAllData = useCallback(async () => {
    setScans([]);
    setChatMessages([]);
    setDailyMessageCount(0);
    setCreditsUsed(0);
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
    chatMessages,
    dailyMessageCount,
    canScan,
    canChat,
    canSendMessage,
    remainingCredits,
    creditsUsed,
    consumeCredit,
    canUseFeature,
    showPaymentSuccess,
    hasAcceptedAIDisclosure,
    acceptAIDisclosure,
    t,
    setLanguage,
    setLanguageSafe,
    setCountry,
    addScan,
    addChatMessage,
    upgradeToPremium,
    restorePurchases,
    deleteAllData,
    setShowPaymentSuccess,
    isLoading: settingsQuery.isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    currentOffering,
    isOfferingsLoading: offeringsQuery.isLoading,
  }), [
    language, country, currency, currencySymbol, availableLanguages,
    user, scans, chatMessages, dailyMessageCount, canScan, canChat,
    canSendMessage, remainingCredits, creditsUsed, consumeCredit,
    canUseFeature, showPaymentSuccess, hasAcceptedAIDisclosure, acceptAIDisclosure,
    t, setLanguage, setLanguageSafe,
    setCountry, addScan, addChatMessage, upgradeToPremium, restorePurchases,
    deleteAllData, setShowPaymentSuccess, settingsQuery.isLoading,
    purchaseMutation.isPending, restoreMutation.isPending,
    currentOffering, offeringsQuery.isLoading,
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
