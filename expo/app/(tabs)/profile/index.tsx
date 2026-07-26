import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Globe, Flag, CreditCard, Crown, Trash2, LogOut,
  FileText, Lock, HelpCircle, Info, Mail, ChevronRight, Languages, MapPin, Check, X
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp, type Country } from '@/contexts/AppContext';
import { countryConfigs, countryList, getCountryLabel } from '@/constants/countries';
import type { Language } from '@/constants/translations';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, country, currencySymbol, user, availableLanguages, setLanguageSafe, setCountry, auth, logoutUser } = useApp();

  const allLanguageOptions: { key: Language; label: string }[] = [
    { key: 'fr', label: t('french') },
    { key: 'en', label: t('english') },
  ];
  const languageOptions = allLanguageOptions.filter(l => availableLanguages.includes(l.key));

  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState<boolean>(false);

  const countryOptions = useMemo(() => countryList.map(c => ({
    key: c.code,
    label: language === 'fr' ? c.labelFr : c.labelEn,
    flag: c.flag,
  })), [language]);

  const currentLanguageLabel = languageOptions.find(l => l.key === language)?.label ?? languageOptions[0]?.label ?? '';
  const currentCountryLabel = `${countryConfigs[country].flag} ${getCountryLabel(country, language)}`;
  const currencyDisplay = `${countryConfigs[country].currency} (${currencySymbol})`;

  const toggleLanguage = () => {
    if (availableLanguages.length <= 1) return;
    const currentIdx = availableLanguages.indexOf(language);
    const nextIdx = (currentIdx + 1) % availableLanguages.length;
    void setLanguageSafe(availableLanguages[nextIdx]);
  };

  const selectCountry = (next: Country) => {
    setIsCountryPickerOpen(false);
    if (next === country) return;
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
          onPress: () => setIsCountryPickerOpen(true),
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

      <Modal
        visible={isCountryPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCountryPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('country')}</Text>
              <TouchableOpacity onPress={() => setIsCountryPickerOpen(false)} testID="close-country-picker">
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {countryOptions.map(option => {
                const isActive = option.key === country;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.countryRow, isActive && styles.countryRowActive]}
                    onPress={() => selectCountry(option.key)}
                    activeOpacity={0.7}
                    testID={`country-${option.key}`}
                  >
                    <Text style={styles.countryFlag}>{option.flag}</Text>
                    <Text style={[styles.countryLabel, isActive && styles.countryLabelActive]}>{option.label}</Text>
                    <Text style={styles.countryCurrency}>{countryConfigs[option.key].currencySymbol}</Text>
                    {isActive ? <Check size={18} color={Colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })}
              <View style={styles.bottomSpace} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end' as const,
  },
  modalSheet: {
    maxHeight: '75%' as const,
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  countryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  countryRowActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent + '50',
  },
  countryFlag: {
    fontSize: 20,
  },
  countryLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  countryLabelActive: {
    color: Colors.accent,
    fontWeight: '700' as const,
  },
  countryCurrency: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
