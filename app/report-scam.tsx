import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Send, CheckCircle, AlertTriangle, MessageSquare, Mail, Phone, Users, ShoppingBag, DollarSign, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const SCAM_TYPES = [
  { key: 'sms', iconComponent: MessageSquare, color: Colors.danger },
  { key: 'email', iconComponent: Mail, color: Colors.warning },
  { key: 'phone', iconComponent: Phone, color: Colors.info },
  { key: 'social', iconComponent: Users, color: '#A855F7' },
  { key: 'marketplace', iconComponent: ShoppingBag, color: Colors.accent },
  { key: 'financial', iconComponent: DollarSign, color: '#F97316' },
  { key: 'other', iconComponent: HelpCircle, color: Colors.textMuted },
] as const;

const typeTranslationKeys: Record<string, string> = {
  sms: 'reportTypeSms',
  email: 'reportTypeEmail',
  phone: 'reportTypePhone',
  social: 'reportTypeSocial',
  marketplace: 'reportTypeMarketplace',
  financial: 'reportTypeFinancial',
  other: 'reportTypeOther',
};

export default function ReportScamScreen() {
  const router = useRouter();
  const { t, language } = useApp();
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const handleTypeSelect = useCallback((key: string) => {
    setSelectedType(key);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedType || !description.trim()) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSubmitted(true);
    Animated.parallel([
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [selectedType, description, successAnim, scaleAnim]);

  if (submitted) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.successContainer, { opacity: successAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIconCircle}>
              <CheckCircle size={56} color={Colors.accent} />
            </View>
            <Text style={styles.successTitle}>{t('reportSuccess')}</Text>
            <Text style={styles.successSubtext}>
              {language === 'fr'
                ? 'Ton signalement sera ajouté aux alertes pour protéger les autres utilisateurs.'
                : 'Your report will be added to alerts to protect other users.'}
            </Text>
            <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backHomeBtnText}>{t('quizBackHome')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('reportScamTitle')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <AlertTriangle size={32} color={Colors.warning} />
            <Text style={styles.headerTitle}>{t('reportScamDesc')}</Text>
          </View>

          <Text style={styles.label}>{t('reportType')}</Text>
          <View style={styles.typesGrid}>
            {SCAM_TYPES.map(({ key, iconComponent: Icon, color }) => {
              const isSelected = selectedType === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.typeChip, isSelected && { backgroundColor: color + '20', borderColor: color }]}
                  onPress={() => handleTypeSelect(key)}
                  activeOpacity={0.7}
                  testID={`report-type-${key}`}
                >
                  <Icon size={18} color={isSelected ? color : Colors.textMuted} />
                  <Text style={[styles.typeChipText, isSelected && { color }]}>
                    {t(typeTranslationKeys[key] ?? key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('reportDescription')}</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={t('reportDescPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
            testID="report-description"
          />

          <Text style={styles.label}>{t('reportLocation')}</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={t('reportLocationPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            maxLength={100}
            testID="report-location"
          />

          <TouchableOpacity
            style={[styles.submitBtn, (!selectedType || !description.trim()) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!selectedType || !description.trim()}
            activeOpacity={0.8}
            testID="report-submit"
          >
            <Send size={18} color={!selectedType || !description.trim() ? Colors.textMuted : Colors.background} />
            <Text style={[styles.submitBtnText, (!selectedType || !description.trim()) && styles.submitBtnTextDisabled]}>
              {t('reportSubmit')}
            </Text>
          </TouchableOpacity>

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
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    paddingVertical: 20,
    backgroundColor: Colors.warningMuted,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
  },
  typesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  textArea: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 28,
  },
  submitBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.surface,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  submitBtnTextDisabled: {
    color: Colors.textMuted,
  },
  bottomSpace: {
    height: 40,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  successSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 32,
  },
  backHomeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  backHomeBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
