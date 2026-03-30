import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
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
  chatMessages: 'cyrusguard_chat',
  dailyMessages: 'cyrusguard_daily_msgs',
  creditsUsed: 'cyrusguard_credits_used',
  aiDisclosure: 'cyrusguard_ai_disclosure',
  auth: 'cyrusguard_auth',
};



export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('fr');
  const [country, setCountryState] = useState<Country>('CA');
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dailyMessageCount, setDailyMessageCount] = useState<number>(0);
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
        const [langStr, countryStr, userStr, creditsStr, disclosureStr, authStr, scansStr, chatStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.country),
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.creditsUsed),
          AsyncStorage.getItem(STORAGE_KEYS.aiDisclosure),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.scans),
          AsyncStorage.getItem(STORAGE_KEYS.chatMessages),
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
        let parsedChat: ChatMessage[] = [];
        if (chatStr) {
          try { parsedChat = JSON.parse(chatStr); } catch (e) { console.log('[AppContext] Failed to parse chat:', e); }
        }
        return {
          language: (langStr as Language) || 'fr',
          country: (countryStr as Country) || 'CA',
          user: parsedUser,
          creditsUsed: creditsStr ? parseInt(creditsStr, 10) : 0,
          hasAcceptedAIDisclosure: disclosureStr === 'true',
          auth: parsedAuth,
          scans: parsedScans,
          chatMessages: parsedChat,
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
          chatMessages: [] as ChatMessage[],
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
      if (settingsQuery.data.chatMessages && settingsQuery.data.chatMessages.length > 0) {
        setChatMessages(settingsQuery.data.chatMessages);
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

  const addChatMessageToStorage = useCallback((msgs: ChatMessage[]) => {
    void AsyncStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(msgs.slice(-100)));
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages(prev => {
      const updated = [...prev, msg];
      addChatMessageToStorage(updated);
      return updated;
    });
    if (msg.role === 'user') {
      setDailyMessageCount(prev => prev + 1);
    }
  }, [addChatMessageToStorage]);

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
  }, []);

  const upgradeToPremium = useCallback(async (_plan: 'monthly' | 'annual') => {
    console.log('[IAP] upgradeToPremium called - no purchase provider configured yet');
    Alert.alert('Info', language === 'fr'
      ? 'Service d\'achat bientôt disponible.'
      : 'Purchase service coming soon.');
  }, [language]);

  const restorePurchases = useCallback(() => {
    console.log('[IAP] restorePurchases called - no purchase provider configured yet');
    Alert.alert('Info', language === 'fr'
      ? 'Service d\'achat bientôt disponible.'
      : 'Purchase service coming soon.');
  }, [language]);

  const deleteAllData = useCallback(async () => {
    setScans([]);
    setChatMessages([]);
    setDailyMessageCount(0);
    setCreditsUsed(0);
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
    chatMessages,
    dailyMessageCount,
    canScan,
    canChat,
    canSendMessage,
    remainingCredits,
    creditsUsed,
    consumeCredit,
    canUseFeature,
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
    addChatMessage,
    upgradeToPremium,
    restorePurchases,
    deleteAllData,
    setShowPaymentSuccess,
    isLoading: settingsQuery.isLoading,
    isPurchasing: false,
    isRestoring: false,
    currentOffering: null as any,
    isOfferingsLoading: false,
  }), [
    language, country, currency, currencySymbol, availableLanguages,
    user, scans, chatMessages, dailyMessageCount, canScan, canChat,
    canSendMessage, remainingCredits, creditsUsed, consumeCredit,
    canUseFeature, needsPaywall, needsAccountCreation, showPaymentSuccess,
    hasAcceptedAIDisclosure, acceptAIDisclosure,
    auth, loginUser, logoutUser,
    t, setLanguage, setLanguageSafe,
    setCountry, addScan, addChatMessage, upgradeToPremium, restorePurchases,
    deleteAllData, setShowPaymentSuccess, settingsQuery.isLoading,
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
