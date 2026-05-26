import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Globe, Flag, CreditCard, Crown, Trash2, LogOut,
  FileText, Lock, HelpCircle, Info, Mail, ChevronRight, Languages, MapPin, Sparkles
} from 'lucide-react-native';
import { Alert } from 'react-native';
import Colors from '@/constants/colors';
import { useApp, type Country } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';
import type { Language } from '@/constants/translations';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, country, currencySymbol, user, availableLanguages, setLanguageSafe, setCountry, auth, logoutUser, hasAcceptedAIDisclosure, revokeAIDisclosure } = useApp();

  const handleAiConsent = () => {
    if (!hasAcceptedAIDisclosure) {
      Alert.alert(
        language === 'fr' ? 'Consentement IA' : 'AI Consent',
        language === 'fr'
          ? 'Vous n\'avez pas encore accepté l\'analyse IA. Elle vous sera proposée lors de votre prochain scan.'
          : 'You have not accepted AI analysis yet. You will be prompted at your next scan.',
      );
      return;
    }
    Alert.alert(
      language === 'fr' ? 'Révoquer le consentement IA ?' : 'Revoke AI consent?',
      language === 'fr'
        ? 'Vous devrez réaccepter pour utiliser l\'analyse IA à nouveau.'
        : 'You will need to accept again to use AI analysis.',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel', style: 'cancel' as const },
        {
          text: language === 'fr' ? 'Révoquer' : 'Revoke',
          style: 'destructive' as const,
          onPress: () => { void revokeAIDisclosure(); },
        },
      ],
    );
  };

  const allLanguageOptions: { key: Language; label: string }[] = [
    { key: 'fr', label: t('french') },
    { key: 'en', label: t('english') },
  ];
  const languageOptions = allLanguageOptions.filter(l => availableLanguages.includes(l.key));

  const countryOptions: { key: Country; label: string }[] = [
    { key: 'CA', label: t('canada') },
    { key: 'FR', label: t('france') },
    { key: 'US', label: t('usa') },
  ];

  const currentLanguageLabel = languageOptions.find(l => l.key === language)?.label ?? languageOptions[0]?.label ?? '';
  const currentCountryLabel = countryOptions.find(c => c.key === country)?.label ?? '';
  const currencyDisplay = `${countryConfigs[country].currency} (${currencySymbol})`;

  const toggleLanguage = () => {
    if (availableLanguages.length <= 1) return;
    const currentIdx = availableLanguages.indexOf(language);
    const nextIdx = (currentIdx + 1) % availableLanguages.length;
    void setLanguageSafe(availableLanguages[nextIdx]);
  };

  const cycleCountry = () => {
    const countries: Country[] = ['CA', 'FR', 'US'];
    const idx = countries.indexOf(country);
    const next = countries[(idx + 1) % countries.length];
    void setCountry(next);
  };

  const menuSections = [
    {
      title: t('subscription'),
      items: [
        {
          icon: Crown,
          label: t('currentPlan'),
          value: user.isPremium ? 'Premium' : t('freePlan'),
          color: user.isPremium ? '#FFD700' : Colors.textMuted,
          onPress: () => router.push('/(tabs)/premium' as any),
        },
        {
          icon: CreditCard,
          label: t('manageSubscription'),
          color: Colors.accent,
          onPress: () => router.push('/manage-subscription' as any),
        },
      ],
    },
    {
      title: t('language'),
      items: [
        {
          icon: Languages,
          label: t('language'),
          value: currentLanguageLabel,
          color: Colors.info,
          onPress: toggleLanguage,
        },
        {
          icon: Flag,
          label: t('country'),
          value: currentCountryLabel,
          color: Colors.warning,
          onPress: cycleCountry,
        },
        {
          icon: Globe,
          label: t('currency'),
          value: currencyDisplay,
          color: Colors.accent,
          onPress: () => {},
        },
      ],
    },
    {
      title: t('aiTransparencySection'),
      items: [
        {
          icon: Sparkles,
          label: t('aiConsentLabel'),
          value: hasAcceptedAIDisclosure ? t('aiConsentAccepted') : t('aiConsentPending'),
          color: hasAcceptedAIDisclosure ? Colors.accent : Colors.textMuted,
          onPress: handleAiConsent,
        },
      ],
    },
    {
      title: t('legal'),
      items: [
        { icon: FileText, label: t('terms'), color: Colors.textSecondary, onPress: () => router.push('/terms' as any) },
        { icon: Lock, label: t('privacy'), color: Colors.textSecondary, onPress: () => router.push('/privacy' as any) },
        { icon: HelpCircle, label: t('faq'), color: Colors.textSecondary, onPress: () => router.push('/faq-page' as any) },
        { icon: Info, label: t('about'), color: Colors.textSecondary, onPress: () => router.push('/about' as any) },
        { icon: Mail, label: t('contact'), color: Colors.textSecondary, onPress: () => router.push('/contact' as any) },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('profileTitle')}</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <User size={28} color={Colors.accent} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{auth.isAuthenticated ? (auth.fullName || user.name || (language === 'fr' ? 'Utilisateur' : 'User')) : (language === 'fr' ? 'Invité' : 'Guest')}</Text>
              <Text style={styles.profileEmail}>{auth.isAuthenticated ? (auth.email || t('accountConnected')) : t('notConnected')}</Text>
            </View>
            {user.isPremium && (
              <View style={styles.premiumTag}>
                <Crown size={12} color="#FFD700" />
                <Text style={styles.premiumTagText}>PREMIUM</Text>
              </View>
            )}
          </View>

          {menuSections.map((section, sIdx) => (
            <View key={sIdx} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, iIdx) => (
                  <TouchableOpacity
                    key={iIdx}
                    style={[styles.menuItem, iIdx < section.items.length - 1 && styles.menuBorder]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                      <item.icon size={18} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {'value' in item && item.value ? (
                      <Text style={styles.menuValue}>{item.value}</Text>
                    ) : null}
                    <ChevronRight size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => router.push('/delete-account' as any)}
            activeOpacity={0.7}
            testID="delete-account-btn"
          >
            <Trash2 size={18} color={Colors.danger} />
            <Text style={styles.dangerText}>{t('deleteAccount')}</Text>
          </TouchableOpacity>

          {auth.isAuthenticated ? (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => void logoutUser()}
              activeOpacity={0.7}
              testID="logout-btn"
            >
              <LogOut size={18} color={Colors.textMuted} />
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.logoutBtn, { borderColor: Colors.accent + '40' }]}
              onPress={() => router.push('/auth' as any)}
              activeOpacity={0.7}
              testID="login-btn"
            >
              <User size={18} color={Colors.accent} />
              <Text style={[styles.logoutText, { color: Colors.accent }]}>{t('createAccountCTA')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.addressSection}>
            <MapPin size={14} color={Colors.textMuted} style={{ marginTop: 2 }} />
            <View>
              <Text style={styles.addressName}>CyrusGuard AI</Text>
              <Text style={styles.addressText}>1055 Rue Lucien-L'Allier</Text>
              <Text style={styles.addressText}>Unit #1036</Text>
              <Text style={styles.addressText}>Montreal, QC H3G 3C4</Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    paddingTop: 12,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  premiumTag: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumTagText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  dangerBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  logoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  addressSection: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addressName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    textAlign: 'center' as const,
  },
  bottomSpace: {
    height: 20,
  },
});
