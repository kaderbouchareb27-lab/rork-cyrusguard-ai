import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle, Bell, Camera, ChevronRight, CircleCheck, Crown, FileText,
  HelpCircle, Link, Lock, Mail, ScanLine, ShieldCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { getAlertsSectionTitle, getCountryAlerts, getTrendingScams, type AlertData } from '@/constants/countries';
import AppBackdrop from '@/components/AppBackdrop';
import GuardianHero from '@/components/GuardianHero';
import ScanCard from '@/components/ScanCard';

interface AlertCardProps { alert: AlertData }

const AlertCard = React.memo(function AlertCard({ alert }: AlertCardProps): React.ReactElement {
  const isHigh = alert.severity === 'high';
  return (
    <View style={alertStyles.card}>
      <View style={alertStyles.topRow}>
        <View style={[alertStyles.badge, isHigh ? alertStyles.highBadge : alertStyles.mediumBadge]}>
          {isHigh ? <AlertTriangle size={11} color={Colors.danger} /> : <Bell size={11} color={Colors.warning} />}
          <Text style={[alertStyles.badgeText, { color: isHigh ? Colors.danger : Colors.warning }]}>
            {isHigh ? 'Urgente' : 'Attention'}
          </Text>
        </View>
        <Text style={alertStyles.date}>{alert.date}</Text>
      </View>
      <Text style={alertStyles.title} numberOfLines={2}>{alert.title}</Text>
      <Text style={alertStyles.description} numberOfLines={3}>{alert.desc}</Text>
    </View>
  );
});

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const {
    t, language, country, scans, showPaymentSuccess, setShowPaymentSuccess,
    user, remainingCredits, canScan,
  } = useApp();
  const fadeAnim = useRef<Animated.Value>(new Animated.Value(0)).current;
  const slideAnim = useRef<Animated.Value>(new Animated.Value(16)).current;
  const bannerAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 45, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!showPaymentSuccess) return;
    Animated.sequence([
      Animated.timing(bannerAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(4000),
      Animated.timing(bannerAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => setShowPaymentSuccess(false));
  }, [showPaymentSuccess, bannerAnim, setShowPaymentSuccess]);

  const recentScans = useMemo(() => scans.slice(0, 3), [scans]);
  const alertsTitle = useMemo(() => getAlertsSectionTitle(country, language) ?? t('countryAlerts'), [country, language, t]);
  const topAlerts = useMemo(() => getCountryAlerts(country, language).slice(0, 4), [country, language]);
  const trendingScams = useMemo(() => getTrendingScams(country, language), [country, language]);
  const openScan = useCallback((scanId: string): void => {
    router.push({ pathname: '/result' as any, params: { scanId } });
  }, [router]);

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {showPaymentSuccess && (
            <Animated.View style={[styles.successBanner, { opacity: bannerAnim }]}>
              <CircleCheck size={18} color={Colors.background} />
              <Text style={styles.successText}>{t('paymentSuccess')}</Text>
            </Animated.View>
          )}

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.networkRow}>
              <View style={styles.networkLabel}>
                <View style={styles.liveDot} />
                <Text style={styles.networkText}>{language === 'fr' ? 'RÉSEAU DE PROTECTION' : 'PROTECTION NETWORK'}</Text>
              </View>
              <View style={styles.aiStatus}>
                <ShieldCheck size={17} color={Colors.accent} />
                <View>
                  <Text style={styles.aiStatusTitle}>AI · 4.0</Text>
                  <Text style={styles.aiStatusSub}>{language === 'fr' ? 'Protection active' : 'Protection active'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitleWhite}>Cyrus</Text>
              <Text style={styles.brandTitleGreen}>Guard AI</Text>
            </View>
            <Text style={styles.slogan}>
              {language === 'fr' ? 'Détectez la fraude avant qu’elle ne vous atteigne.' : 'Spot fraud before it reaches you.'}
            </Text>

            <View style={styles.guardianStage}>
              <GuardianHero size={250} markSize={174} />
              <View style={styles.watchBadge}>
                <View style={styles.liveDotSmall} />
                <Text style={styles.watchText}>{language === 'fr' ? 'CYRUS EN VEILLE' : 'CYRUS ON WATCH'}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {language === 'fr' ? 'Votre gardien ' : 'Your digital '}
              <Text style={styles.heroTitleAccent}>{language === 'fr' ? 'numérique.' : 'guardian.'}</Text>
            </Text>
            <Text style={styles.heroDescription}>
              {language === 'fr'
                ? 'Analysez un message, une image ou un lien suspect en quelques secondes.'
                : 'Analyze a suspicious message, image, or link in seconds.'}
            </Text>

            <View style={styles.ctaShell}>
              <TouchableOpacity onPress={() => router.push('/scan' as any)} activeOpacity={0.82} testID="scan-now-btn">
                <LinearGradient colors={['#72F6A4', '#20D96A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mainCta}>
                  <View style={styles.ctaIcon}><ScanLine size={24} color={Colors.accentLight} /></View>
                  <Text style={styles.mainCtaText}>{t('scanNow')}</Text>
                  <ChevronRight size={24} color={Colors.background} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.protectionStrip}>
              <View style={styles.protectionIcon}><ShieldCheck size={22} color={Colors.accent} /></View>
              <View style={styles.protectionCopy}>
                <Text style={styles.protectionTitle}>{language === 'fr' ? 'Protection prête en temps réel' : 'Real-time protection ready'}</Text>
                <Text style={styles.protectionSub}>{language === 'fr' ? 'Cyrus veille sur vos analyses 24/7' : 'Cyrus is ready for your scans 24/7'}</Text>
              </View>
              <View style={styles.activePill}><View style={styles.liveDotSmall} /><Text style={styles.activeText}>{language === 'fr' ? 'Actif' : 'Active'}</Text></View>
            </View>

            {!user.isPremium ? (
              <View style={styles.creditsRow}>
                <Text style={[styles.creditsText, remainingCredits === 0 && { color: Colors.danger }]}>
                  {remainingCredits}/2 {t('creditsRemaining')}
                </Text>
                <View style={styles.creditDots}>
                  {[0, 1].map((index: number) => <View key={index} style={[styles.creditDot, index < remainingCredits && styles.creditDotActive]} />)}
                </View>
              </View>
            ) : (
              <View style={styles.premiumRow}><Crown size={15} color={Colors.gold} /><Text style={styles.premiumText}>{t('unlimitedAccess')}</Text></View>
            )}

            <Text style={styles.sectionEyebrow}>{t('quickActions').toUpperCase()}</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.actionCard, !canScan && styles.lockedCard]} onPress={() => router.push('/scan' as any)} activeOpacity={0.78} testID="action-scan">
                <View style={styles.actionGlow} />
                <View style={styles.actionIconGreen}><Camera size={25} color={Colors.accent} /></View>
                <Text style={styles.actionTitle}>{t('scanImage')}</Text>
                <Text style={styles.actionSub}>SMS · WhatsApp · Email</Text>
                <View style={styles.actionArrow}><ChevronRight size={18} color={Colors.accent} /></View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionCard, styles.actionCardBlue]} onPress={() => router.push('/url-analyze' as any)} activeOpacity={0.78} testID="action-url">
                <View style={styles.actionIconBlue}><Link size={25} color={Colors.info} /></View>
                <Text style={styles.actionTitle}>{t('analyzeUrl')}</Text>
                <Text style={styles.actionSub}>{language === 'fr' ? 'Site web · URL suspecte' : 'Website · Suspicious URL'}</Text>
                <View style={[styles.actionArrow, styles.actionArrowBlue]}><ChevronRight size={18} color={Colors.info} /></View>
              </TouchableOpacity>
            </View>

            <View style={styles.privacyCard}>
              <View style={styles.privacyIcon}><Lock size={21} color={Colors.accent} /></View>
              <View style={styles.privacyCopy}>
                <Text style={styles.privacyTitle}>{language === 'fr' ? 'Vos données sont privées et sécurisées' : 'Your data is private and secure'}</Text>
                <Text style={styles.privacySub}>{language === 'fr' ? 'Aucune donnée personnelle n’est stockée.' : 'No personal data is stored.'}</Text>
              </View>
              <View style={styles.privacyRadar}><View style={styles.privacyRadarInner}><Lock size={15} color={Colors.accent} /></View></View>
            </View>

            <TouchableOpacity style={styles.quizCard} onPress={() => router.push('/quiz' as any)} activeOpacity={0.75} testID="action-quiz">
              <View style={styles.quizIcon}><HelpCircle size={21} color={Colors.accent} /></View>
              <View style={styles.quizCopy}><Text style={styles.quizTitle}>{t('quizTitle')}</Text><Text style={styles.quizSub}>{t('quizSubtitle')}</Text></View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>{alertsTitle.toUpperCase()}</Text>
            <Bell size={15} color={Colors.danger} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alertsScroll}>
            {topAlerts.map((alert: AlertData) => <AlertCard key={alert.id} alert={alert} />)}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>{t('trendingScams').toUpperCase()}</Text>
            <AlertTriangle size={15} color={Colors.warning} />
          </View>
          <View style={styles.scamsCard}>
            {trendingScams.map((scam: string, index: number) => (
              <View key={`${scam}-${index}`} style={[styles.scamRow, index < trendingScams.length - 1 && styles.rowDivider]}>
                <AlertTriangle size={14} color={Colors.danger} /><Text style={styles.scamText}>{scam}</Text>
              </View>
            ))}
          </View>

          {recentScans.length > 0 && (
            <View>
              <Text style={styles.sectionEyebrow}>{t('recentScans').toUpperCase()}</Text>
              {recentScans.map(scan => <ScanCard key={scan.id} scan={scan} onPress={() => openScan(scan.id)} />)}
            </View>
          )}

          <View style={styles.legalFooter}>
            <TouchableOpacity style={styles.legalLink} onPress={() => router.push('/privacy' as any)}><Lock size={12} color={Colors.textMuted} /><Text style={styles.legalText}>{t('footerPrivacy')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.legalLink} onPress={() => router.push('/terms' as any)}><FileText size={12} color={Colors.textMuted} /><Text style={styles.legalText}>{t('footerTerms')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.legalLink} onPress={() => router.push('/contact' as any)}><Mail size={12} color={Colors.textMuted} /><Text style={styles.legalText}>{t('footerContact')}</Text></TouchableOpacity>
          </View>
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const alertStyles = StyleSheet.create({
  card: { width: 272, padding: 17, marginRight: 12, borderRadius: 22, backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.borderLight },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  highBadge: { backgroundColor: Colors.dangerMuted },
  mediumBadge: { backgroundColor: Colors.warningMuted },
  badgeText: { fontSize: 10, fontWeight: '800' },
  date: { color: Colors.textMuted, fontSize: 10 },
  title: { color: Colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700', marginBottom: 7 },
  description: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 },
  successBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, padding: 12, borderRadius: 16, marginBottom: 14 },
  successText: { color: Colors.background, fontSize: 13, fontWeight: '800' },
  networkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  networkLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  networkText: { color: Colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOpacity: 1, shadowRadius: 8 },
  liveDotSmall: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent },
  aiStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(3,24,15,0.78)', paddingHorizontal: 11, paddingVertical: 8 },
  aiStatusTitle: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  aiStatusSub: { color: Colors.accent, fontSize: 8, marginTop: 1 },
  brandTitleRow: { flexDirection: 'row', alignItems: 'center' },
  brandTitleWhite: { color: Colors.white, fontSize: 34, fontWeight: '900', letterSpacing: -1.6 },
  brandTitleGreen: { color: Colors.accent, fontSize: 34, fontWeight: '900', letterSpacing: -1.6 },
  slogan: { color: Colors.textSecondary, fontSize: 16, lineHeight: 23, width: '78%', marginTop: 6 },
  guardianStage: { alignItems: 'center', marginTop: 4, marginBottom: 13 },
  watchBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -24, paddingHorizontal: 17, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'rgba(1,12,8,0.93)' },
  watchText: { color: Colors.accent, fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  heroTitle: { color: Colors.white, fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: -1.1 },
  heroTitleAccent: { color: Colors.accent },
  heroDescription: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 9, paddingHorizontal: 18 },
  ctaShell: { borderWidth: 1, borderColor: Colors.borderLight, padding: 12, borderRadius: 28, marginTop: 24, backgroundColor: 'rgba(2,17,11,0.82)' },
  mainCta: { minHeight: 66, borderRadius: 22, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: Colors.accent, shadowOpacity: 0.36, shadowRadius: 18, elevation: 8 },
  ctaIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#052C18', borderWidth: 1, borderColor: 'rgba(108,255,163,0.42)', alignItems: 'center', justifyContent: 'center' },
  mainCtaText: { flex: 1, textAlign: 'center', color: Colors.background, fontSize: 18, fontWeight: '900' },
  protectionStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard },
  protectionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.borderLight },
  protectionCopy: { flex: 1 },
  protectionTitle: { color: Colors.accentLight, fontSize: 13, fontWeight: '700' },
  protectionSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activeText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  creditsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  creditsText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  creditDots: { flexDirection: 'row', gap: 5 },
  creditDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  creditDotActive: { backgroundColor: Colors.accent },
  premiumRow: { flexDirection: 'row', alignSelf: 'center', gap: 7, marginTop: 12 },
  premiumText: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
  sectionEyebrow: { color: Colors.accent, fontSize: 11, letterSpacing: 1.6, fontWeight: '800', marginTop: 27, marginBottom: 13 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, minHeight: 190, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'rgba(3,25,15,0.90)', overflow: 'hidden' },
  actionCardBlue: { borderColor: 'rgba(95,178,255,0.28)', backgroundColor: 'rgba(2,20,19,0.90)' },
  actionGlow: { position: 'absolute', right: -40, top: -45, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(47,240,122,0.05)' },
  lockedCard: { opacity: 0.74 },
  actionIconGreen: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, borderColor: Colors.accent, backgroundColor: Colors.accentMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  actionIconBlue: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, borderColor: Colors.info, backgroundColor: Colors.infoMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  actionTitle: { color: Colors.white, fontSize: 15, fontWeight: '800', lineHeight: 20 },
  actionSub: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 6 },
  actionArrow: { position: 'absolute', right: 14, bottom: 14, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  actionArrowBlue: { borderColor: 'rgba(95,178,255,0.28)' },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, padding: 16, minHeight: 90, borderRadius: 23, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard, overflow: 'hidden' },
  privacyIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.accent, backgroundColor: Colors.accentMuted },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  privacySub: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  privacyRadar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,240,122,0.04)' },
  privacyRadarInner: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentMuted },
  quizCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard },
  quizIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.accentMuted, alignItems: 'center', justifyContent: 'center' },
  quizCopy: { flex: 1 },
  quizTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  quizSub: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertsScroll: { paddingBottom: 4, marginBottom: 4 },
  scamsCard: { borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard, paddingHorizontal: 15 },
  scamRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  scamText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  legalFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingTop: 24, marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  legalLink: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5 },
  legalText: { color: Colors.textMuted, fontSize: 11 },
  bottomSpace: { height: 88 },
});
