import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { 
  AlertTriangle, CheckCircle, ExternalLink,
  Phone, ChevronLeft, Lightbulb, Flag, Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp, useLocalizedScan } from '@/contexts/AppContext';
import { reportingOrganizations, type ScanResult } from '@/mocks/scans';
import RiskCircle from '@/components/RiskCircle';

export default function ResultScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { t, scans, language, country } = useApp();

  const scan = useMemo(() => scans.find(s => s.id === scanId), [scans, scanId]);
  const orgs = reportingOrganizations[country] ?? reportingOrganizations.CA;

  const fallbackScan: ScanResult = useMemo(() => ({
    id: 'fallback',
    date: new Date().toISOString(),
    riskScore: 0,
    riskLevel: 'low' as const,
    sourceType: 'sms' as const,
    summary: '',
    summaryEn: '',
    explanation: '',
    explanationEn: '',
    suspiciousElements: [],
    suspiciousElementsEn: [],
    reassuringElements: [],
    reassuringElementsEn: [],
    advice: [],
    adviceEn: [],
  }), []);

  const localized = useLocalizedScan(scan ?? fallbackScan);

  if (!scan) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.errorText}>Scan not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const getSourceTypeLabel = (type: string): string => {
    const labels: Record<string, { fr: string; en: string }> = {
      sms: { fr: 'SMS / Texto', en: 'SMS / Text' },
      url: { fr: 'Lien / URL', en: 'Link / URL' },
      email: { fr: 'Email', en: 'Email' },
      phone: { fr: 'Appel téléphonique', en: 'Phone call' },
      social: { fr: 'Réseaux sociaux', en: 'Social media' },
      website: { fr: 'Site web', en: 'Website' },
    };
    return labels[type]?.[language === 'fr' ? 'fr' : 'en'] ?? type.toUpperCase();
  };
  const levelLabel = t(`risk${scan.riskLevel.charAt(0).toUpperCase() + scan.riskLevel.slice(1)}`);

  const riskColor = scan.riskLevel === 'high' ? Colors.danger 
    : scan.riskLevel === 'medium' ? Colors.warning : Colors.accent;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0F172A', '#162032', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('analysisComplete')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.scoreSection}>
            <RiskCircle score={scan.riskScore} level={scan.riskLevel} levelLabel={levelLabel} size={180} />
            <View style={[styles.sourceTag, { backgroundColor: riskColor + '20' }]}>
              <Text style={[styles.sourceTagText, { color: riskColor }]}>
                {t('contentTypeLabel')}: {getSourceTypeLabel(scan.sourceType)}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('summary')}</Text>
            <Text style={styles.cardText}>{localized.localSummary}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('explanation')}</Text>
            <Text style={styles.cardText}>{localized.localExplanation}</Text>
          </View>

          {localized.localSuspicious.length > 0 && (
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.danger }]}>
              <View style={styles.cardHeader}>
                <AlertTriangle size={18} color={Colors.danger} />
                <Text style={[styles.cardTitle, { color: Colors.danger, marginBottom: 0 }]}>
                  {t('suspiciousElements')}
                </Text>
              </View>
              {localized.localSuspicious.map((el, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.danger }]} />
                  <Text style={styles.bulletText}>{el}</Text>
                </View>
              ))}
            </View>
          )}

          {localized.localReassuring.length > 0 && (
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.accent }]}>
              <View style={styles.cardHeader}>
                <CheckCircle size={18} color={Colors.accent} />
                <Text style={[styles.cardTitle, { color: Colors.accent, marginBottom: 0 }]}>
                  {t('reassuringElements')}
                </Text>
              </View>
              {localized.localReassuring.map((el, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.bulletText}>{el}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.info }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={18} color={Colors.info} />
              <Text style={[styles.cardTitle, { color: Colors.info, marginBottom: 0 }]}>
                {t('advice')}
              </Text>
            </View>
            {localized.localAdvice.map((el, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.info }]} />
                <Text style={styles.bulletText}>{el}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Flag size={18} color={Colors.warning} />
              <Text style={[styles.cardTitle, { color: Colors.warning, marginBottom: 0 }]}>
                {t('reportingOrganizations')}
              </Text>
            </View>
            {orgs.map((org, idx) => (
              <View key={idx} style={styles.orgItem}>
                <Text style={styles.orgName}>{language === 'en' ? org.nameEn : org.name}</Text>
                <View style={styles.orgLinks}>
                  {org.url ? (
                    <View style={styles.orgLink}>
                      <ExternalLink size={14} color={Colors.accent} />
                      <Text style={styles.orgLinkText}>{org.url}</Text>
                    </View>
                  ) : null}
                  {org.phone ? (
                    <View style={styles.orgLink}>
                      <Phone size={14} color={Colors.accent} />
                      <Text style={styles.orgLinkText}>{org.phone}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.discussBtn}
            onPress={() => router.push('/scan' as any)}
            activeOpacity={0.8}
            testID="new-scan-btn"
          >
            <Shield size={20} color={Colors.background} />
            <Text style={styles.discussBtnText}>{t('newScan')}</Text>
          </TouchableOpacity>

          <Text style={styles.aiNotice}>{t('aiNotice')}</Text>

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
  errorText: {
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 100,
    fontSize: 16,
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
  topTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  aiNotice: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 14,
    paddingHorizontal: 24,
    lineHeight: 16,
    fontStyle: 'italic' as const,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  sourceTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sourceTagText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  orgItem: {
    marginBottom: 12,
  },
  orgName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  orgLinks: {
    gap: 4,
  },
  orgLink: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
  },
  orgLinkText: {
    fontSize: 12,
    color: Colors.accent,
  },
  discussBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  discussBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  bottomSpace: {
    height: 20,
  },
});
