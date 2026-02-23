import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
  ChevronLeft, Globe, Search, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle,
  Clock, MapPin, FileText, Star, MessageSquareWarning, Building2, ShoppingCart,
  Lightbulb, Lock, ArrowRight, ThumbsUp, ThumbsDown, Phone, ExternalLink
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import PaywallGate from '@/components/PaywallGate';
import RiskCircle from '@/components/RiskCircle';
import { analyzeUrl as analyzeUrlApi } from '@/services/openai';
import type { UrlAnalysisResult } from '@/services/openai';

const ANALYSIS_STEPS_FR = [
  'Vérification du domaine...',
  'Analyse de la réputation...',
  'Recherche de plaintes...',
  'Vérification de l\'entreprise...',
  'Génération du rapport...',
];

const ANALYSIS_STEPS_EN = [
  'Checking domain...',
  'Analyzing reputation...',
  'Searching complaints...',
  'Verifying business...',
  'Generating report...',
];

export default function UrlAnalyzeScreen() {
  const router = useRouter();
  const { t, language, canUseFeature, consumeCredit } = useApp();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = language === 'fr' ? ANALYSIS_STEPS_FR : ANALYSIS_STEPS_EN;

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const analyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);
    progressAnim.setValue(0);
    fadeAnim.setValue(0);

    stepTimerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    Animated.timing(progressAnim, { toValue: 0.85, duration: 14000, useNativeDriver: false }).start();

    try {
      consumeCredit();
      const apiResult = await analyzeUrlApi(url.trim(), language);
      console.log('[URL] Deep analysis result:', apiResult.score);

      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      Animated.timing(progressAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start(() => {
        setResult(apiResult);
        setIsAnalyzing(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    } catch (error) {
      console.log('[URL] Analysis error:', error);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setIsAnalyzing(false);
      progressAnim.setValue(0);
      Alert.alert(
        language === 'fr' ? 'Erreur d\'analyse' : 'Analysis Error',
        language === 'fr'
          ? 'Impossible d\'analyser l\'URL. Veuillez réessayer.'
          : 'Unable to analyze the URL. Please try again.'
      );
    }
  };

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 65) return 'low';
    if (score >= 35) return 'medium';
    return 'high';
  };

  const getVerdictLabel = (score: number) => {
    if (score >= 65) return t('reliableSite');
    if (score >= 35) return t('cautionSite');
    return t('dangerousSite');
  };

  const renderCheck = (label: string, value: boolean, icon?: React.ReactNode) => (
    <View style={styles.checkRow}>
      {icon || (value ? <CheckCircle size={16} color={Colors.accent} /> : <AlertTriangle size={16} color={Colors.danger} />)}
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={[styles.checkBadge, { backgroundColor: value ? Colors.accentMuted : Colors.dangerMuted }]}>
        <Text style={[styles.checkBadgeText, { color: value ? Colors.accent : Colors.danger }]}>
          {value ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}
        </Text>
      </View>
    </View>
  );

  const renderReviewBar = (positive: number, negative: number) => {
    const total = positive + negative;
    const posWidth = total > 0 ? (positive / total) * 100 : 50;
    return (
      <View style={styles.reviewBarContainer}>
        <View style={styles.reviewBarLabels}>
          <View style={styles.reviewBarLabel}>
            <ThumbsUp size={13} color={Colors.accent} />
            <Text style={styles.reviewBarLabelText}>{positive}%</Text>
          </View>
          <View style={styles.reviewBarLabel}>
            <ThumbsDown size={13} color={Colors.danger} />
            <Text style={styles.reviewBarLabelText}>{negative}%</Text>
          </View>
        </View>
        <View style={styles.reviewBar}>
          <View style={[styles.reviewBarPos, { width: `${posWidth}%` as any }]} />
          <View style={[styles.reviewBarNeg, { width: `${100 - posWidth}%` as any }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0F172A', '#162032', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('analyzeUrlTitle')}</Text>
          <View style={styles.backBtn} />
        </View>

        {!canUseFeature ? (
          <PaywallGate type="url" />
        ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <Globe size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder={t('urlPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                testID="url-input"
              />
            </View>
            <TouchableOpacity
              style={[styles.analyzeBtn, !url.trim() && styles.analyzeBtnDisabled]}
              onPress={analyze}
              disabled={!url.trim() || isAnalyzing}
              activeOpacity={0.8}
            >
              <Search size={18} color={url.trim() ? Colors.background : Colors.textMuted} />
              <Text style={[styles.analyzeBtnText, !url.trim() && { color: Colors.textMuted }]}>
                {isAnalyzing ? t('analyzing') : t('deepAnalysis')}
              </Text>
            </TouchableOpacity>
          </View>

          {isAnalyzing && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]} />
              </View>
              <View style={styles.stepsContainer}>
                {steps.map((step, idx) => (
                  <View key={idx} style={[styles.stepRow, idx <= currentStep && styles.stepRowActive]}>
                    <View style={[styles.stepDot, idx < currentStep && styles.stepDotDone, idx === currentStep && styles.stepDotCurrent]} />
                    <Text style={[styles.stepText, idx <= currentStep && styles.stepTextActive]}>
                      {step}
                    </Text>
                    {idx < currentStep && <CheckCircle size={14} color={Colors.accent} />}
                  </View>
                ))}
              </View>
            </View>
          )}

          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.scoreSection}>
                <RiskCircle
                  score={result.score}
                  level={getRiskLevel(result.score)}
                  levelLabel={getVerdictLabel(result.score)}
                  size={180}
                />
                <View style={[styles.verdictBanner, {
                  backgroundColor: result.score >= 65 ? Colors.accentMuted
                    : result.score >= 35 ? Colors.warningMuted : Colors.dangerMuted,
                }]}>
                  <Text style={styles.verdictEmoji}>{result.verdictEmoji || (result.score >= 65 ? '✅' : result.score >= 35 ? '⚠️' : '🚨')}</Text>
                  <Text style={[styles.verdictText, {
                    color: result.score >= 65 ? Colors.accent
                      : result.score >= 35 ? Colors.warning : Colors.danger,
                  }]}>
                    {language === 'fr' ? result.verdict : (result.verdictEn || result.verdict)}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconWrap, { backgroundColor: Colors.infoMuted }]}>
                    <Lock size={16} color={Colors.info} />
                  </View>
                  <Text style={styles.cardTitle}>{t('siteReliability')}</Text>
                </View>
                {renderCheck(t('sslStatus'), result.ssl)}
                <View style={styles.checkRow}>
                  <Clock size={16} color={Colors.info} />
                  <Text style={styles.checkLabel}>{t('domainAge')}</Text>
                  <Text style={styles.checkValueText}>{result.domainAge}</Text>
                </View>
                {renderCheck(t('legalMentions'), result.legalMentions)}
                {renderCheck(t('privacyPolicy'), result.privacyPolicy)}
                {renderCheck(t('termsOfService'), result.termsOfService)}
                <View style={styles.checkRow}>
                  <MapPin size={16} color={result.physicalAddress ? Colors.accent : Colors.danger} />
                  <Text style={styles.checkLabel}>{t('physicalAddress')}</Text>
                  <View style={[styles.checkBadge, { backgroundColor: result.physicalAddress ? Colors.accentMuted : Colors.dangerMuted }]}>
                    <Text style={[styles.checkBadgeText, { color: result.physicalAddress ? Colors.accent : Colors.danger }]}>
                      {result.physicalAddress ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}
                    </Text>
                  </View>
                </View>
                <View style={styles.checkRow}>
                  <FileText size={16} color={result.redirects === 0 ? Colors.accent : Colors.danger} />
                  <Text style={styles.checkLabel}>{t('redirectDetection')}</Text>
                  <Text style={[styles.checkValueText, { color: result.redirects === 0 ? Colors.accent : Colors.danger }]}>
                    {result.redirects}
                  </Text>
                </View>
              </View>

              {result.reputation && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconWrap, { backgroundColor: Colors.warningMuted }]}>
                      <Star size={16} color={Colors.warning} />
                    </View>
                    <Text style={styles.cardTitle}>{t('reputationReviews')}</Text>
                  </View>

                  <View style={styles.trustScoreRow}>
                    <Text style={styles.trustScoreLabel}>{t('trustScore')}</Text>
                    <View style={styles.trustScoreValue}>
                      <Text style={[styles.trustScoreNumber, {
                        color: result.reputation.trustScore >= 65 ? Colors.accent
                          : result.reputation.trustScore >= 35 ? Colors.warning : Colors.danger,
                      }]}>
                        {result.reputation.trustScore}
                      </Text>
                      <Text style={styles.trustScoreMax}>/100</Text>
                    </View>
                  </View>

                  {renderReviewBar(result.reputation.positiveReviews, result.reputation.negativeReviews)}

                  <Text style={styles.sectionSummary}>
                    {language === 'fr' ? result.reputation.summary : (result.reputation.summaryEn || result.reputation.summary)}
                  </Text>

                  {result.reputation.reviews && result.reputation.reviews.length > 0 && (
                    <View style={styles.reviewsList}>
                      {result.reputation.reviews.map((review, idx) => (
                        <View key={idx} style={styles.reviewItem}>
                          <View style={styles.reviewItemHeader}>
                            <Text style={styles.reviewSource}>{review.source}</Text>
                            <View style={styles.ratingBadge}>
                              <Star size={11} color={Colors.warning} />
                              <Text style={styles.ratingText}>{review.rating}</Text>
                            </View>
                          </View>
                          <Text style={styles.reviewSummary}>
                            {language === 'fr' ? review.summary : (review.summaryEn || review.summary)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {result.complaints && (
                <View style={[styles.card, result.complaints.total > 0 && { borderLeftWidth: 3, borderLeftColor: Colors.danger }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconWrap, { backgroundColor: Colors.dangerMuted }]}>
                      <MessageSquareWarning size={16} color={Colors.danger} />
                    </View>
                    <Text style={styles.cardTitle}>{t('complaintsSection')}</Text>
                    <View style={[styles.countBadge, {
                      backgroundColor: result.complaints.total > 0 ? Colors.dangerMuted : Colors.accentMuted,
                    }]}>
                      <Text style={[styles.countBadgeText, {
                        color: result.complaints.total > 0 ? Colors.danger : Colors.accent,
                      }]}>
                        {result.complaints.total}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sectionSummary}>
                    {language === 'fr' ? result.complaints.summary : (result.complaints.summaryEn || result.complaints.summary)}
                  </Text>

                  {result.complaints.items && result.complaints.items.length > 0 && (
                    <View style={styles.complaintsList}>
                      {result.complaints.items.map((item, idx) => (
                        <View key={idx} style={styles.complaintItem}>
                          <View style={styles.complaintSource}>
                            <View style={styles.complaintDot} />
                            <Text style={styles.complaintSourceText}>{item.source}</Text>
                          </View>
                          <Text style={styles.complaintDesc}>
                            {language === 'fr' ? item.description : (item.descriptionEn || item.description)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {result.complaints.total === 0 && (
                    <View style={styles.noComplaintsRow}>
                      <CheckCircle size={16} color={Colors.accent} />
                      <Text style={styles.noComplaintsText}>{t('noComplaints')}</Text>
                    </View>
                  )}
                </View>
              )}

              {result.business && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                      <Building2 size={16} color="#8B5CF6" />
                    </View>
                    <Text style={styles.cardTitle}>{t('businessDetails')}</Text>
                  </View>

                  <View style={styles.businessGrid}>
                    <View style={styles.businessRow}>
                      <Text style={styles.businessLabel}>{t('businessName')}</Text>
                      <Text style={styles.businessValue}>{result.business.name}</Text>
                    </View>
                    {renderCheck(t('businessRegistered'), result.business.registered)}
                    {renderCheck(t('contactInfo'), result.business.hasContact)}
                    {result.business.address && result.business.address !== 'Non disponible' && result.business.address !== 'Not available' && (
                      <View style={styles.businessRow}>
                        <MapPin size={14} color={Colors.textMuted} />
                        <Text style={styles.businessAddressText}>{result.business.address}</Text>
                      </View>
                    )}
                    {result.business.phone && result.business.phone !== 'Non disponible' && result.business.phone !== 'Not available' && (
                      <View style={styles.businessRow}>
                        <Phone size={14} color={Colors.textMuted} />
                        <Text style={styles.businessAddressText}>{result.business.phone}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.sectionSummary}>
                    {language === 'fr' ? result.business.summary : (result.business.summaryEn || result.business.summary)}
                  </Text>
                </View>
              )}

              {result.onlineStore && (
                <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.info }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconWrap, { backgroundColor: Colors.infoMuted }]}>
                      <ShoppingCart size={16} color={Colors.info} />
                    </View>
                    <Text style={styles.cardTitle}>{t('onlineStoreAnalysis')}</Text>
                  </View>

                  {renderCheck(t('realisticPrices'), result.onlineStore.realisticPrices)}
                  {renderCheck(t('returnPolicy'), result.onlineStore.returnPolicy)}
                  {renderCheck(t('securePayment'), result.onlineStore.securePayment)}
                  {renderCheck(
                    t('brandCopying'),
                    !result.onlineStore.brandCopying,
                    result.onlineStore.brandCopying
                      ? <AlertTriangle size={16} color={Colors.danger} />
                      : <CheckCircle size={16} color={Colors.accent} />
                  )}

                  <Text style={styles.sectionSummary}>
                    {language === 'fr' ? result.onlineStore.summary : (result.onlineStore.summaryEn || result.onlineStore.summary)}
                  </Text>
                </View>
              )}

              {result.personalizedAdvice && result.personalizedAdvice.length > 0 && (
                <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.warning }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconWrap, { backgroundColor: Colors.warningMuted }]}>
                      <Lightbulb size={16} color={Colors.warning} />
                    </View>
                    <Text style={styles.cardTitle}>{t('personalizedAdvice')}</Text>
                  </View>
                  {(language === 'fr' ? result.personalizedAdvice : (result.personalizedAdviceEn || result.personalizedAdvice)).map((advice, idx) => (
                    <View key={idx} style={styles.adviceRow}>
                      <ArrowRight size={14} color={Colors.warning} style={{ marginTop: 2 }} />
                      <Text style={styles.adviceText}>{advice}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.bottomSpace} />
            </Animated.View>
          )}
        </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  inputSection: { gap: 12, marginBottom: 20 },
  inputRow: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10,
    backgroundColor: Colors.backgroundCard, borderRadius: 14,
    paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 14 },
  analyzeBtn: {
    backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  analyzeBtnDisabled: { backgroundColor: Colors.surface },
  analyzeBtnText: { fontSize: 15, fontWeight: '700' as const, color: Colors.background },
  progressSection: { marginBottom: 24, gap: 14 },
  progressBar: {
    height: 6, backgroundColor: Colors.surface, borderRadius: 3, overflow: 'hidden' as const,
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  stepsContainer: { gap: 10, paddingHorizontal: 4 },
  stepRow: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10, opacity: 0.4,
  },
  stepRowActive: { opacity: 1 },
  stepDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surface,
  },
  stepDotDone: { backgroundColor: Colors.accent },
  stepDotCurrent: { backgroundColor: Colors.info, shadowColor: Colors.info, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 3 },
  stepText: { flex: 1, fontSize: 13, color: Colors.textMuted },
  stepTextActive: { color: Colors.textSecondary },
  scoreSection: { alignItems: 'center', paddingVertical: 20, gap: 16 },
  verdictBanner: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14,
  },
  verdictEmoji: { fontSize: 20 },
  verdictText: { fontSize: 15, fontWeight: '700' as const, flex: 1, flexWrap: 'wrap' as const },
  card: {
    backgroundColor: Colors.backgroundCard, borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginBottom: 14,
  },
  cardIconWrap: {
    width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary, flex: 1 },
  checkRow: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10,
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checkLabel: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  checkBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
  },
  checkBadgeText: { fontSize: 12, fontWeight: '700' as const },
  checkValueText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textPrimary },
  trustScoreRow: {
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 12,
  },
  trustScoreLabel: { fontSize: 14, color: Colors.textSecondary },
  trustScoreValue: { flexDirection: 'row' as const, alignItems: 'baseline' },
  trustScoreNumber: { fontSize: 28, fontWeight: '800' as const },
  trustScoreMax: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' as const },
  reviewBarContainer: { marginBottom: 12 },
  reviewBarLabels: {
    flexDirection: 'row' as const, justifyContent: 'space-between', marginBottom: 6,
  },
  reviewBarLabel: { flexDirection: 'row' as const, alignItems: 'center', gap: 5 },
  reviewBarLabelText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  reviewBar: {
    flexDirection: 'row' as const, height: 8, borderRadius: 4, overflow: 'hidden' as const,
  },
  reviewBarPos: { backgroundColor: Colors.accent, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  reviewBarNeg: { backgroundColor: Colors.danger, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  sectionSummary: {
    fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 10,
  },
  reviewsList: { marginTop: 12, gap: 8 },
  reviewItem: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
  },
  reviewItemHeader: {
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  reviewSource: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary },
  ratingBadge: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 4,
    backgroundColor: Colors.warningMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 11, fontWeight: '700' as const, color: Colors.warning },
  reviewSummary: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  countBadgeText: { fontSize: 13, fontWeight: '800' as const },
  complaintsList: { marginTop: 10, gap: 10 },
  complaintItem: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
  },
  complaintSource: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 6, marginBottom: 4,
  },
  complaintDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger,
  },
  complaintSourceText: { fontSize: 12, fontWeight: '700' as const, color: Colors.danger },
  complaintDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  noComplaintsRow: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginTop: 8,
  },
  noComplaintsText: { fontSize: 13, color: Colors.accent, fontWeight: '600' as const },
  businessGrid: { gap: 0 },
  businessRow: {
    flexDirection: 'row' as const, alignItems: 'center', gap: 10,
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  businessLabel: { fontSize: 14, color: Colors.textSecondary },
  businessValue: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary, textAlign: 'right' as const },
  businessAddressText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  adviceRow: {
    flexDirection: 'row' as const, alignItems: 'flex-start', gap: 10, marginBottom: 10,
  },
  adviceText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  bottomSpace: { height: 30 },
});
