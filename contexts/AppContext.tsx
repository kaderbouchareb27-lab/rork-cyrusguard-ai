import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { translations, type Language } from '@/constants/translations';
import { type ScanResult, type ChatMessage } from '@/mocks/scans';

export type Country = 'CA' | 'US' | 'FR';
export type Currency = 'CAD' | 'EUR';

interface UserProfile {
  email: string;
  name: string;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'annual';
}

const countryToCurrency: Record<Country, Currency> = {
  CA: 'CAD',
  US: 'CAD',
  FR: 'EUR',
};

const FREE_CREDITS = 3;

const countryToLanguage: Record<Country, Language> = {
  CA: 'fr',
  US: 'en',
  FR: 'fr',
};

const STORAGE_KEYS = {
  language: 'cyrusguard_language',
  country: 'cyrusguard_country',
  scans: 'cyrusguard_scans',
  user: 'cyrusguard_user',
  chatMessages: 'cyrusguard_chat',
  dailyMessages: 'cyrusguard_daily_msgs',
  creditsUsed: 'cyrusguard_credits_used',
};

export const [AppProvider, useApp] = createContextHook(() => {
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

  const settingsQuery = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      try {
        const [langStr, countryStr, userStr, creditsStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.country),
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.creditsUsed),
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
        };
      } catch (e) {
        console.log('[AppContext] Error loading settings:', e);
        return {
          language: 'fr' as Language,
          country: 'CA' as Country,
          user: null,
          creditsUsed: 0,
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
    }
  }, [settingsQuery.data]);

  const currency = useMemo(() => countryToCurrency[country], [country]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] ?? key;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
  }, []);

  const setCountry = useCallback(async (c: Country) => {
    setCountryState(c);
    const defaultLang = countryToLanguage[c];
    setLanguageState(defaultLang);
    await AsyncStorage.setItem(STORAGE_KEYS.country, c);
    await AsyncStorage.setItem(STORAGE_KEYS.language, defaultLang);
  }, []);

  const addScan = useCallback((scan: ScanResult) => {
    setScans(prev => [scan, ...prev]);
    if (!user.isPremium) {
      setCreditsUsed(prev => {
        const next = prev + 1;
        AsyncStorage.setItem(STORAGE_KEYS.creditsUsed, String(next));
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

  const consumeCredit = useCallback(() => {
    if (user.isPremium) return;
    setCreditsUsed(prev => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.creditsUsed, String(next));
      return next;
    });
  }, [user.isPremium]);

  const upgradeToPremium = useCallback(async (plan: 'monthly' | 'annual') => {
    const updated = { ...user, isPremium: true, plan };
    setUser(updated);
    setShowPaymentSuccess(true);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
    setTimeout(() => setShowPaymentSuccess(false), 5000);
  }, [user]);

  const deleteAllData = useCallback(async () => {
    setScans([]);
    setChatMessages([]);
    setDailyMessageCount(0);
    setCreditsUsed(0);
    setUser({ email: '', name: '', isPremium: false, plan: 'free' });
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }, []);

  return {
    language,
    country,
    currency,
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
    t,
    setLanguage,
    setCountry,
    addScan,
    addChatMessage,
    upgradeToPremium,
    deleteAllData,
    setShowPaymentSuccess,
    isLoading: settingsQuery.isLoading,
  };
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
