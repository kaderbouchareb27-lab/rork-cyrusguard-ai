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
import { type ScanResult } from '@/mocks/scans';
import { countryConfigs, type Currency } from '@/constants/countries';

export type Country =
  | 'CA'
  | 'US'
  | 'FR'
  | 'ES'
  | 'BE'
  | 'CH'
  | 'GB'
  | 'DE'
  | 'IT'
  | 'PT'
  | 'NL'
  | 'LU'
  | 'IE'
  | 'AU'
  | 'MA'
  | 'MX'
  | 'INTL';

export const SUPPORTED_COUNTRIES: Country[] = [
  'CA', 'FR', 'BE', 'CH', 'LU', 'US', 'GB', 'IE', 'ES', 'PT', 'IT', 'DE', 'NL', 'AU', 'MA', 'MX', 'INTL',
];

function isSupportedCountry(value: string | null): value is Country {
  return !!value && (SUPPORTED_COUNTRIES as string[]).includes(value);
}

/** Regions without their own profile that map to the closest supported one. */
const REGION_ALIASES: Record<string, Country> = {
  UK: 'GB',
  AT: 'DE',
  PR: 'US',
  VI: 'US',
  GU: 'US',
  AS: 'US',
  MP: 'US',
  MC: 'FR',
  GP: 'FR',
  MQ: 'FR',
  GF: 'FR',
  RE: 'FR',
  YT: 'FR',
  NC: 'FR',
  PF: 'FR',
  AD: 'ES',
  SM: 'IT',
  VA: 'IT',
  LI: 'CH',
  NZ: 'AU',
};

/**
 * Timezone -> country fallback, used when the device locale exposes no region
 * (common on iOS when the language is set without a region, e.g. "en").
 */
const TIMEZONE_PREFIX_COUNTRIES: { prefix: string; country: Country }[] = [
  { prefix: 'America/Toronto', country: 'CA' },
  { prefix: 'America/Montreal', country: 'CA' },
  { prefix: 'America/Vancouver', country: 'CA' },
  { prefix: 'America/Edmonton', country: 'CA' },
  { prefix: 'America/Winnipeg', country: 'CA' },
  { prefix: 'America/Halifax', country: 'CA' },
  { prefix: 'America/St_Johns', country: 'CA' },
  { prefix: 'America/Mexico', country: 'MX' },
  { prefix: 'America/Monterrey', country: 'MX' },
  { prefix: 'America/Cancun', country: 'MX' },
  { prefix: 'America/Tijuana', country: 'MX' },
  { prefix: 'America/', country: 'US' },
  { prefix: 'US/', country: 'US' },
  { prefix: 'Pacific/Honolulu', country: 'US' },
  { prefix: 'Europe/Paris', country: 'FR' },
  { prefix: 'Europe/Brussels', country: 'BE' },
  { prefix: 'Europe/Zurich', country: 'CH' },
  { prefix: 'Europe/Luxembourg', country: 'LU' },
  { prefix: 'Europe/London', country: 'GB' },
  { prefix: 'Europe/Dublin', country: 'IE' },
  { prefix: 'Europe/Madrid', country: 'ES' },
  { prefix: 'Atlantic/Canary', country: 'ES' },
  { prefix: 'Europe/Lisbon', country: 'PT' },
  { prefix: 'Europe/Rome', country: 'IT' },
  { prefix: 'Europe/Berlin', country: 'DE' },
  { prefix: 'Europe/Vienna', country: 'DE' },
  { prefix: 'Europe/Amsterdam', country: 'NL' },
  { prefix: 'Africa/Casablanca', country: 'MA' },
  { prefix: 'Australia/', country: 'AU' },
];

function countryFromTimezone(): Country | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (!tz) return null;
    const match = TIMEZONE_PREFIX_COUNTRIES.find(entry => tz.startsWith(entry.prefix));
    return match ? match.country : null;
  } catch {
    return null;
  }
}

/**
 * Detects the user's country so the AI cites the right national anti-fraud
 * bodies (FTC/IC3 in the US, CAFC in Canada, Cybermalveillance in France...).
 * Order: device region -> alias -> timezone -> international profile.
 * Never falls back to Canada for a non-Canadian device.
 */
function detectDeviceCountry(): Country {
  try {
    const options = Intl.DateTimeFormat().resolvedOptions();
    const locales: string[] = [options.locale ?? ''];
    const region = locales
      .map(l => l.split(/[-_]/)[1]?.toUpperCase() ?? '')
      .find(r => r.length === 2) ?? '';

    if (isSupportedCountry(region)) return region;
    const alias = REGION_ALIASES[region];
    if (alias) return alias;

    const fromTz = countryFromTimezone();
    if (fromTz) return fromTz;

    return 'INTL';
  } catch (e) {
    console.log('[AppContext] Locale detection failed:', e);
    return countryFromTimezone() ?? 'INTL';
  }
}

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

export const FREE_CREDITS = 2;
const ENTITLEMENT_ID = 'CyrusGuard AI Pro';

const STORAGE_KEYS = {
  language: 'cyrusguard_language',
  country: 'cyrusguard_country',
  scans: 'cyrusguard_scans',
  user: 'cyrusguard_user',
  creditsUsed: 'cyrusguard_credits_used',
  aiDisclosure: 'cyrusguard_ai_disclosure',
  auth: 'cyrusguard_auth',
};

function getRCApiKey(): string {
  const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  if (Platform.OS === 'web') return testKey;
  const platformKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: testKey,
  }) ?? '';
  return platformKey || testKey;
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
    void Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
    rcConfigured = true;
    console.log('[RC] RevenueCat configured successfully on', Platform.OS);
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
  const productId = (entitlement.productIdentifier ?? '').toLowerCase();
  if (productId.includes('yearly') || productId.includes('annual') || productId.includes('annee') || productId.includes('année')) return 'annual';
  if (productId.includes('monthly') || productId.includes('mois')) return 'monthly';
  if (productId.includes('lifetime')) return 'annual';
  return 'monthly';
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
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
  const [rcLoggedIn, setRcLoggedIn] = useState<boolean>(false);

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
        const resolvedCountry: Country = isSupportedCountry(countryStr) ? countryStr : detectDeviceCountry();
        const resolvedLanguage: Language = (langStr as Language) || countryConfigs[resolvedCountry].defaultLanguage;
        return {
          language: resolvedLanguage,
          country: resolvedCountry,
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

  const rcLoginMutation = useMutation({
    mutationFn: async (uid: string) => {
      if (!rcConfigured) {
        console.log('[RC] Not configured, skipping logIn');
        return null;
      }
      console.log('[RC] Logging in with RevenueCat');
      const { customerInfo } = await Purchases.logIn(uid);
      return customerInfo;
    },
    onSuccess: (info) => {
      if (info) {
        console.log('[RC] logIn successful');
        queryClient.setQueryData(['rc-customer-info'], info);
        setRcLoggedIn(true);
      }
    },
    onError: (error: any) => {
      console.log('[RC] logIn error:', error);
    },
  });

  useEffect(() => {
    if (auth.isAuthenticated && auth.uid && rcConfigured && !rcLoggedIn) {
      console.log('[RC] Auto-login for authenticated user');
      rcLoginMutation.mutate(auth.uid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.uid, rcLoggedIn]);

  const customerInfoQuery = useQuery({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      if (!rcConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log('[RC] Customer info fetched');
        return info;
      } catch (e) {
        console.log('[RC] Error fetching customer info:', e);
        return null;
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
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
    console.log('[RC] Syncing premium status');
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
      if (auth.isAuthenticated && !rcLoggedIn && auth.uid) {
        console.log('[RC] Ensuring logIn before purchase...');
        const { customerInfo: loginInfo } = await Purchases.logIn(auth.uid);
        setRcLoggedIn(true);
        queryClient.setQueryData(['rc-customer-info'], loginInfo);
      }
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
        Alert.alert('✅', language === 'fr'
          ? 'Votre abonnement Premium a été restauré !'
          : 'Your premium subscription has been restored!');
      } else {
        Alert.alert('ℹ️', language === 'fr'
          ? 'Aucun abonnement actif trouvé.'
          : 'No active subscription found.');
      }
    },
    onError: (error: any) => {
      console.log('[RC] Restore error:', error);
      Alert.alert('Error', error?.message ?? 'Failed to restore purchases.');
    },
  });

  const currentOffering = useMemo<PurchasesOffering | null>(() => {
    const data = offeringsQuery.data;
    if (!data) return null;
    const current = data.current;
    if (current && current.availablePackages.length > 0) return current;
    const fallback = Object.values(data.all).find(o => o.availablePackages.length > 0) ?? null;
    if (fallback) {
      console.log('[RC] Current offering empty, falling back to:', fallback.identifier);
    }
    return fallback;
  }, [offeringsQuery.data]);

  const countryConfig = useMemo(() => countryConfigs[country] ?? countryConfigs.INTL, [country]);
  const currency = useMemo<Currency>(() => countryConfig.currency, [countryConfig]);
  const currencySymbol = useMemo(() => countryConfig.currencySymbol, [countryConfig]);
  const availableLanguages = useMemo(() => countryConfig.availableLanguages, [countryConfig]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] ?? key;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
  }, []);

  const setCountry = useCallback(async (c: Country) => {
    setCountryState(c);
    const config = countryConfigs[c] ?? countryConfigs.INTL;
    const defaultLang = config.defaultLanguage;
    setLanguageState(defaultLang);
    await AsyncStorage.setItem(STORAGE_KEYS.country, c);
    await AsyncStorage.setItem(STORAGE_KEYS.language, defaultLang);
  }, []);

  const setLanguageSafe = useCallback(async (lang: Language) => {
    const config = countryConfigs[country] ?? countryConfigs.INTL;
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

    let updatedUser: UserProfile = {
      email: '',
      name: '',
      isPremium: false,
      plan: 'free',
    };
    setUser(prev => {
      updatedUser = {
        ...prev,
        email: params.email ?? prev.email,
        name: params.fullName ?? prev.name,
      };
      return updatedUser;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

    if (rcConfigured && params.uid) {
      try {
        console.log('[RC] Calling Purchases.logIn after auth...');
        const { customerInfo } = await Purchases.logIn(params.uid);
        setRcLoggedIn(true);
        queryClient.setQueryData(['rc-customer-info'], customerInfo);
        console.log('[RC] logIn after auth successful');

        const isPremium = checkPremiumFromCustomerInfo(customerInfo);
        const plan = getPlanFromCustomerInfo(customerInfo);
        if (isPremium) {
          const premiumUser = { ...updatedUser, isPremium, plan };
          setUser(premiumUser);
          await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(premiumUser));
        }
      } catch (e) {
        console.log('[RC] logIn after auth error:', e);
      }
    }
  }, [queryClient]);

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
    setRcLoggedIn(false);

    if (rcConfigured) {
      try {
        await Purchases.logOut();
        console.log('[RC] Logged out from RevenueCat');
      } catch (e) {
        console.log('[RC] logOut error:', e);
      }
    }

    setUser({ email: '', name: '', isPremium: false, plan: 'free' });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ email: '', name: '', isPremium: false, plan: 'free' }));
  }, []);

  const upgradeToPremium = useCallback(async (plan: 'monthly' | 'annual') => {
    if (!currentOffering) {
      console.log('[RC] No offering available');
      Alert.alert('Error', language === 'fr'
        ? 'Aucun forfait disponible. Veuillez réessayer plus tard.'
        : 'No subscription packages available. Please try again later.');
      return;
    }
    const packageId = plan === 'monthly' ? '$rc_monthly' : '$rc_annual';
    const matchesPlan = (identifier: string): boolean => {
      const id = identifier.toLowerCase();
      return plan === 'monthly'
        ? id.includes('month') || id.includes('mois')
        : id.includes('annual') || id.includes('year') || id.includes('annee') || id.includes('année');
    };
    const pkg =
      currentOffering.availablePackages.find(p => p.identifier === packageId) ??
      currentOffering.availablePackages.find(p => matchesPlan(p.identifier)) ??
      currentOffering.availablePackages.find(p => matchesPlan(p.product?.identifier ?? ''));
    if (!pkg) {
      console.log('[RC] Package not found:', packageId);
      Alert.alert('Error', language === 'fr'
        ? 'Forfait introuvable.'
        : 'Subscription package not found.');
      return;
    }
    purchaseMutation.mutate(pkg);
  }, [currentOffering, purchaseMutation, language]);

  const restorePurchases = useCallback(() => {
    restoreMutation.mutate();
  }, [restoreMutation]);

  const deleteAllData = useCallback(async () => {
    setScans([]);
    setCreditsUsed(0);
    setAuth({ isAuthenticated: false, uid: null, email: null, fullName: null, provider: null });
    setUser({ email: '', name: '', isPremium: false, plan: 'free' });
    setRcLoggedIn(false);
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    if (rcConfigured) {
      try { await Purchases.logOut(); } catch (e) { console.log('[RC] logOut error:', e); }
    }
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
    freeCredits: FREE_CREDITS,
    countryConfig,
    needsPaywall,
    needsAccountCreation,
    showPaymentSuccess,
    hasAcceptedAIDisclosure,
    acceptAIDisclosure,
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
    currentOffering,
    isOfferingsLoading: offeringsQuery.isLoading,
  }), [
    language, country, currency, currencySymbol, availableLanguages, countryConfig,
    user, scans, canScan,
    remainingCredits, creditsUsed, consumeCredit,
    canUseFeature, needsPaywall, needsAccountCreation, showPaymentSuccess,
    hasAcceptedAIDisclosure, acceptAIDisclosure,
    auth, loginUser, logoutUser,
    t, setLanguage, setLanguageSafe,
    setCountry, addScan, upgradeToPremium, restorePurchases,
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
