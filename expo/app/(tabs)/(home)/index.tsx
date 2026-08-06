import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Camera, Link, MessageCircle, ChevronRight, AlertTriangle, Crown, Lock, Bell, HelpCircle, FileText, Mail, ScanLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { getCountryAlerts, getTrendingScams, getAlertsSectionTitle, type AlertData } from '@/constants/countries';
import ScanCard from '@/components/ScanCard';
import AppBackdrop from '@/components/AppBackdrop';

const AlertCard = React.memo(function AlertCard({ alert }: { alert: AlertData }) {
  const isHigh = alert.severity === 'high';

  return (
    <View style={alertStyles.card}>
      <View style={alertStyles.cardHeader}>
        <View style={[alertStyles.severityBadge, isHigh ? alertStyles.severityHigh : alertStyles.severityMedium]}>
          {isHigh ? <AlertTriangle size={11} color={Colors.danger} /> : <Bell size={11} color={Colors.warning} />}
          <Text style={[alertStyles.severityText, isHigh ? alertStyles.severityTextHigh : alertStyles.severityTextMedium]}>
            {isHigh ? 'Urgente' : 'Attention'}
          </Text>
        </View>
        <Text style={alertStyles.date}>{alert.date}</Text>
      </View>
      <Text style={alertStyles.title} numberOfLines={2}>{alert.title}</Text>
      <Text style={alertStyles.desc} numberOfLines={3}>{alert.desc}</Text>
    </View>
  );
});

const alertStyles = StyleSheet.create({
  card: {
    width: 272,
    backgroundColor: 'rgba(16, 37, 28, 0.92)',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  severityBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityHigh: {
    backgroundColor: Colors.dangerMuted,
  },
  severityMedium: {
    backgroundColor: Colors.warningMuted,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  severityTextHigh: {
    color: Colors.danger,
  },
  severityTextMedium: {
    color: Colors.warning,
  },
  date: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 19,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { t, language, country, scans, showPaymentSuccess, setShowPaymentSuccess, user, remainingCredits, canScan, canChat } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (showPaymentSuccess) {
      Animated.sequence([
        Animated.timing(bannerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(bannerAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setShowPaymentSuccess(false));
    }
  }, [showPaymentSuccess, bannerAnim, setShowPaymentSuccess]);

  const recentScans = useMemo(() => scans.slice(0, 3), [scans]);

  const openScan = useCallback((scanId: string) => {
    router.push({ pathname: '/result' as any, params: { scanId } });
  }, [router]);

  const alertsSectionTitle = useMemo(() => {
    return getAlertsSectionTitle(country, language) ?? t('countryAlerts');
  }, [country, language, t]);

  const topAlerts = useMemo(() => {
    return getCountryAlerts(country, language).slice(0, 4);
  }, [country, language]);

  const trendingScams = useMemo(() => {
    return getTrendingScams(country, language);
  }, [country, language]);

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showPaymentSuccess && (
            <Animated.View style={[styles.successBanner, { opacity: bannerAnim }]}>
              <Text style={styles.successText}>{t('paymentSuccess')}</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.brandBar}>
              <View style={styles.brandSignal}><View style={styles.brandSignalDot} /><Text style={styles.brandSignalText}>{language === 'fr' ? 'RÉSEAU DE PROTECTION' : 'PROTECTION NETWORK'}</Text></View>
              <Text style={styles.brandVersion}>AI · 2.0</Text>
            </View>
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.slogan}>{language === 'fr' ? 'Détectez la fraude avant qu’elle ne vous atteigne.' : 'Spot fraud before it reaches you.'}</Text>
          </Animated.View>

          <Animated.View style={[styles.heroCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#173D2A', '#0B1C15', '#06110D']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            >
              <View style={styles.heroOrbOne} />
              <View style={styles.heroOrbTwo} />
              <View style={styles.heroScannerBadge}>
                <View style={styles.scannerDot} />
                <ScanLine size={13} color={Colors.accentLight} />
                <Text style={styles.scannerText}>{language === 'fr' ? 'CYRUS EN VEILLE' : 'CYRUS ON WATCH'}</Text>
              </View>
              <View style={styles.heroLogoFrame}>
                <Image source={require('@/assets/images/icon.png')} style={styles.heroLogo} resizeMode="cover" />
                <View style={styles.heroScanBeam} />
              </View>
              <Text style={styles.heroTitle}>{language === 'fr' ? 'Votre gardien numérique.' : 'Your digital guardian.'}</Text>
              <Text style={styles.heroDescription}>{language === 'fr' ? 'Analysez un message, une image ou un lien suspect en quelques secondes.' : 'Analyze a suspicious message, image, or link in seconds.'}</Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => router.push('/scan' as any)}
                activeOpacity={0.8}
                testID="scan-now-btn"
              >
                <View style={styles.heroButtonIcon}><Camera size={18} color={Colors.background} /></View>
                <Text style={styles.heroButtonText}>{t('scanNow')}</Text>
                <ChevronRight size={18} color={Colors.background} />
              </TouchableOpacity>
              <View style={styles.heroFootnote}><View style={styles.heroFootnoteLine} /><Text style={styles.heroFootnoteText}>{language === 'fr' ? 'ANALYSE CONFIDENTIELLE' : 'PRIVATE ANALYSIS'}</Text><View style={styles.heroFootnoteLine} /></View>
            </LinearGradient>
          </Animated.View>

          {!user.isPremium && (
            <View style={styles.creditsBanner}>
              <View style={styles.creditsBannerLeft}>
                <Shield size={18} color={remainingCredits > 0 ? Colors.accent : Colors.danger} />
                <Text style={[styles.creditsBannerText, remainingCredits === 0 && styles.creditsBannerTextUsed]}>
                  {remainingCredits}/2 {t('creditsRemaining')}
                </Text>
              </View>
              <View style={styles.creditDots}>
                {[0, 1].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.creditDot,
                      i < (typeof remainingCredits === 'number' ? remainingCredits : 0)
                        ? styles.creditDotActive
                        : styles.creditDotUsed,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {user.isPremium && (
            <View style={styles.premiumBannerRow}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.premiumBannerText}>{t('unlimitedAccess')}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, !canScan && styles.actionCardLocked]}
              onPress={() => router.push('/scan' as any)}
              activeOpacity={0.7}
              testID="action-scan"
            >
              {!canScan && (
                <View style={styles.premiumBadge}>
                  <Crown size={10} color="#FFD700" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: canScan ? Colors.accentMuted : Colors.dangerMuted }]}>
                <Camera size={22} color={canScan ? Colors.accent : Colors.danger} />
              </View>
              <Text style={styles.actionLabel}>{t('scanImage')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/url-analyze' as any)}
              activeOpacity={0.7}
              testID="action-url"
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.infoMuted }]}>
                <Link size={22} color={Colors.info} />
              </View>
              <Text style={styles.actionLabel}>{t('analyzeUrl')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, !canChat && styles.actionCardLocked]}
              onPress={() => {
                if (canChat) {
                  router.push('/chat' as any);
                } else {
                  router.push('/(tabs)/premium' as any);
                }
              }}
              activeOpacity={0.7}
              testID="action-chat"
            >
              {!canChat && (
                <View style={styles.premiumBadge}>
                  <Crown size={10} color="#FFD700" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: canChat ? 'rgba(168,85,247,0.15)' : 'rgba(255,215,0,0.1)' }]}>
                <MessageCircle size={22} color={canChat ? '#A855F7' : '#94A3B8'} />
              </View>
              <Text style={[styles.actionLabel, !canChat && styles.actionLabelLocked]}>{t('chatWithCyrus')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickToolsRow}>
            <TouchableOpacity
              style={styles.quickToolCard}
              onPress={() => router.push('/quiz' as any)}
              activeOpacity={0.7}
              testID="action-quiz"
            >
              <View style={[styles.quickToolIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                <HelpCircle size={20} color="#A855F7" />
              </View>
              <View style={styles.quickToolInfo}>
                <Text style={styles.quickToolTitle}>{t('quizTitle')}</Text>
                <Text style={styles.quickToolSub}>{t('quizSubtitle')}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Bell size={16} color={Colors.danger} />
              <Text style={styles.sectionTitle}>{alertsSectionTitle}</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.alertsScroll}
          >
            {topAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('trendingScams')}</Text>
            <AlertTriangle size={16} color={Colors.warning} />
          </View>
          <View style={styles.scamsCard}>
            {trendingScams.map((scam, idx, arr) => (
              <View key={idx} style={[styles.scamItem, idx < arr.length - 1 && styles.scamBorder]}>
                <AlertTriangle size={14} color={Colors.danger} />
                <Text style={styles.scamText}>{scam}</Text>
              </View>
            ))}
          </View>

          {recentScans.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('recentScans')}</Text>
              </View>
              {recentScans.map((scan) => (
                <ScanCard
                  key={scan.id}
                  scan={scan}
                  onPress={() => openScan(scan.id)}
                />
              ))}
            </>
          )}

          <View style={styles.legalFooter}>
            <View style={styles.legalDivider} />
            <View style={styles.legalLinks}>
              <TouchableOpacity
                onPress={() => router.push('/privacy' as any)}
                activeOpacity={0.7}
                style={styles.legalLink}
                testID="footer-privacy"
              >
                <Lock size={13} color={Colors.textMuted} />
                <Text style={styles.legalLinkText}>{t('footerPrivacy')}</Text>
              </TouchableOpacity>
              <View style={styles.legalDot} />
              <TouchableOpacity
                onPress={() => router.push('/terms' as any)}
                activeOpacity={0.7}
                style={styles.legalLink}
                testID="footer-terms"
              >
                <FileText size={13} color={Colors.textMuted} />
                <Text style={styles.legalLinkText}>{t('footerTerms')}</Text>
              </TouchableOpacity>
              <View style={styles.legalDot} />
              <TouchableOpacity
                onPress={() => router.push('/contact' as any)}
                activeOpacity={0.7}
                style={styles.legalLink}
                testID="footer-contact"
              >
                <Mail size={13} color={Colors.textMuted} />
                <Text style={styles.legalLinkText}>{t('footerContact')}</Text>
              </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  successBanner: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  successText: {
    color: Colors.background,
    fontWeight: '700' as const,
    fontSize: 14,
    textAlign: 'center' as const,
  },
  header: {
    marginTop: 14,
    marginBottom: 18,
  },
  brandBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandSignal: { flexDirection: 'row' as const, alignItems: 'center', gap: 7 },
  brandSignalDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOpacity: 0.9, shadowRadius: 7, elevation: 3 },
  brandSignalText: { color: Colors.accentLight, fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.1 },
  brandVersion: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.7 },
  heroLogoFrame: {
    width: 154,
    height: 154,
    borderRadius: 77,
    padding: 5,
    overflow: 'hidden' as const,
    backgroundColor: '#06110D',
    borderWidth: 1.5,
    borderColor: 'rgba(145, 242, 183, 0.58)',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.58,
    shadowRadius: 30,
    elevation: 12,
  },
  heroLogo: { width: '100%', height: '100%', borderRadius: 72 },
  heroScanBeam: { position: 'absolute' as const, left: -10, right: -10, top: 74, height: 2, backgroundColor: '#9EFFBC', shadowColor: Colors.accent, shadowOpacity: 1, shadowRadius: 10, elevation: 8 },
  heroScannerBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center' as const,
    backgroundColor: 'rgba(6, 17, 13, 0.54)',
    borderColor: 'rgba(145, 242, 183, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  scannerText: {
    color: Colors.accentLight,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  appName: { fontSize: 28, fontWeight: '900' as const, color: Colors.textPrimary, letterSpacing: -1.1 },
  slogan: { fontSize: 14, color: Colors.textSecondary, marginTop: 5, lineHeight: 20 },
  heroCard: {
    marginBottom: 24, borderRadius: 32, overflow: 'hidden' as const, borderWidth: 1,
    borderColor: 'rgba(145, 242, 183, 0.28)', shadowColor: '#000000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.34, shadowRadius: 28, elevation: 9,
  },
  heroGradient: { paddingTop: 21, paddingBottom: 19, paddingHorizontal: 22, alignItems: 'center', gap: 11, overflow: 'hidden' as const },
  heroOrbOne: { position: 'absolute' as const, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(73,209,125,0.14)', top: -130, right: -90 },
  heroOrbTwo: { position: 'absolute' as const, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(73,209,125,0.08)', bottom: -110, left: -45 },
  heroTitle: { fontSize: 24, fontWeight: '900' as const, color: Colors.white, textAlign: 'center' as const, letterSpacing: -0.7, marginTop: 2 },
  heroDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' as const, maxWidth: 275, marginBottom: 5 },
  heroButton: { width: '100%', backgroundColor: Colors.accentLight, flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 17, gap: 9, minHeight: 54, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.26, shadowRadius: 12, elevation: 5 },
  heroButtonIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(6,17,13,0.13)', alignItems: 'center', justifyContent: 'center' },
  heroButtonText: { flex: 1, color: Colors.background, fontSize: 16, fontWeight: '800' as const, textAlign: 'center' as const },
  heroFootnote: { flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginTop: 1 },
  heroFootnoteLine: { height: 1, width: 34, backgroundColor: 'rgba(145,242,183,0.26)' },
  heroFootnoteText: { color: Colors.textMuted, fontSize: 9, fontWeight: '800' as const, letterSpacing: 1.1 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  quickToolsRow: {
    gap: 10,
    marginBottom: 24,
  },
  quickToolCard: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickToolIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickToolInfo: {
    flex: 1,
  },
  quickToolTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  quickToolSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  alertsScroll: {
    paddingBottom: 4,
    marginBottom: 24,
  },
  scamsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scamItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  scamBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scamText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  legalFooter: {
    marginTop: 8,
    paddingTop: 4,
  },
  legalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  legalLinks: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  legalLink: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  legalLinkText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  legalDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  bottomSpace: {
    height: 20,
  },
  creditsBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditsBannerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  },
  creditsBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  creditsBannerTextUsed: {
    color: Colors.danger,
  },
  creditDots: {
    flexDirection: 'row' as const,
    gap: 5,
  },
  creditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  creditDotActive: {
    backgroundColor: Colors.accent,
  },
  creditDotUsed: {
    backgroundColor: Colors.border,
  },
  premiumBannerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  premiumBannerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  actionCardLocked: {
    opacity: 0.75,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  premiumBadge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#FFD700',
    letterSpacing: 0.3,
  },
  actionLabelLocked: {
    color: '#94A3B8',
  },
});
