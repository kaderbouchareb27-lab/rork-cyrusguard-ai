import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check, ChevronDown, ChevronUp, RotateCcw, Shield, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';

export default function PremiumScreen() {
  const router = useRouter();
  const {
    t, country, upgradeToPremium, user, remainingCredits, freeCredits,
    restorePurchases, isPurchasing, isRestoring, currentOffering, isOfferingsLoading,
  } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    shineLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      shineLoop.stop();
      pulseLoop.stop();
    };
  }, [shineAnim, badgePulse]);

  const config = countryConfigs[country] ?? countryConfigs.INTL;
  const currencySymbol = config.currencySymbol;

  const monthlyPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_monthly' || /monthly|mois/i.test(p.product?.identifier ?? ''));
  const annualPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_annual' || /yearly|annual|annee|année/i.test(p.product?.identifier ?? ''));

  const monthlyPrice = monthlyPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.monthly}`;
  const annualPrice = annualPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.annual}`;
  const monthlyEquivalent = annualPkg?.product?.price
    ? `${currencySymbol}${(annualPkg.product.price / 12).toFixed(2)}`
    : `${currencySymbol}${config.pricing.monthlyEquivalent}`;

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  const premiumFeatures = [
    t('premiumFeature1'), t('premiumFeature2'), t('premiumFeature3'),
    t('premiumFeature4'), t('premiumFeature5'), t('premiumFeature6'),
    t('premiumFeature7'), t('premiumFeature8'),
  ];

  const testimonials = [t('testimonial1'), t('testimonial2'), t('testimonial3')];

  const creditsLeft = remainingCredits === Infinity ? freeCredits : remainingCredits;
  const creditSlots = Array.from({ length: freeCredits }, (_, i) => i);

  const handleSubscribe = () => {
    void upgradeToPremium(selectedPlan);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06110D', '#0A1E15', '#06110D']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroSection}>
            <Animated.View style={[styles.brandIconFrame, { opacity: shineAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.78, 1, 0.78] }) }]}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.brandIcon}
                resizeMode="cover"
              />
            </Animated.View>
            <Text style={styles.heroTitle}>{t('premiumTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('premiumSubtitle')}</Text>
          </View>

          {!user.isPremium && (
            <View style={styles.creditCounter}>
              <Shield size={16} color={creditsLeft > 0 ? Colors.accent : Colors.danger} />
              <Text style={styles.creditCounterText}>
                {creditsLeft}/{freeCredits} {t('creditsRemaining')}
              </Text>
              <View style={styles.creditDots}>
                {creditSlots.map(i => (
                  <View
                    key={i}
                    style={[
                      styles.creditDot,
                      i < creditsLeft ? styles.creditDotActive : styles.creditDotUsed,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: badgePulse }] }}>
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.8}
              testID="plan-annual"
            >
              <View style={styles.planBadgeRow}>
                <View style={styles.bestValueBadge}>
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text style={styles.bestValueText}>{t('bestValue')}</Text>
                </View>
                <View style={styles.twoMonthsBadge}>
                  <Text style={styles.twoMonthsText}>{t('twoMonthsFree')}</Text>
                </View>
              </View>

              <View style={styles.planContent}>
                <View style={styles.planRadio}>
                  <View style={[styles.radioOuter, selectedPlan === 'annual' && styles.radioOuterActive]}>
                    {selectedPlan === 'annual' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{t('annualPlan')}</Text>
                  <Text style={styles.planEquivalent}>
                    {monthlyEquivalent}{t('perMonthBilled')}
                  </Text>
                </View>
                <View style={styles.planPriceBlock}>
                  <Text style={styles.planPriceMain}>{annualPrice}</Text>
                  <Text style={styles.planPricePeriod}>{t('perYearBilled')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.planCard,
              styles.planCardMonthly,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
            testID="plan-monthly"
          >
            <View style={styles.planContent}>
              <View style={styles.planRadio}>
                <View style={[styles.radioOuter, selectedPlan === 'monthly' && styles.radioOuterActive]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{t('monthlyPlan')}</Text>
              </View>
              <View style={styles.planPriceBlock}>
                <Text style={styles.planPriceMain}>{monthlyPrice}</Text>
                <Text style={styles.planPricePeriod}>{t('perMonthBilled')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {!user.isPremium ? (
            <TouchableOpacity
              style={[styles.subscribeBtn, (isPurchasing || isOfferingsLoading) && styles.subscribeBtnDisabled]}
              onPress={handleSubscribe}
              activeOpacity={0.8}
              disabled={isPurchasing || isOfferingsLoading}
              testID="subscribe-btn"
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark ?? '#1a8a4a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeBtnGradient}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Crown size={20} color="#FFFFFF" />
                    <Text style={styles.subscribeBtnText}>{t('subscribe')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.currentPlanBadge}>
              <Check size={18} color={Colors.accent} />
              <Text style={styles.currentPlanText}>{t('currentPlan')}</Text>
            </View>
          )}

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium</Text>
            {premiumFeatures.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Check size={14} color={Colors.accent} />
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('testimonialsTitle')}</Text>
          {testimonials.map((testimonial, idx) => (
            <View key={idx} style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>{testimonial}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>{t('faqTitle')}</Text>
          {faqs.map((faq, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                {expandedFaq === idx ? (
                  <ChevronUp size={18} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={Colors.textMuted} />
                )}
              </View>
              {expandedFaq === idx && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.restoreBtn, isRestoring && styles.restoreBtnDisabled]}
            onPress={restorePurchases}
            disabled={isRestoring}
            activeOpacity={0.7}
            testID="premium-restore-btn"
          >
            {isRestoring ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <RotateCcw size={16} color={Colors.accent} />
            )}
            <Text style={styles.restoreBtnText}>
              {isRestoring ? t('restoringPurchases') : t('restorePurchases')}
            </Text>
          </TouchableOpacity>

          <View style={styles.legalFooter}>
            <Text style={styles.legalDisclaimerText}>
              {t('subscriptionLegalApple')}
            </Text>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={() => router.push('/terms' as any)} activeOpacity={0.7}>
                <Text style={styles.legalLinkText}>{t('terms')}</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>·</Text>
              <TouchableOpacity onPress={() => router.push('/privacy' as any)} activeOpacity={0.7}>
                <Text style={styles.legalLinkText}>{t('privacy')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.addressFooter}>
            <Text style={styles.addressFooterText}>
              CyrusGuard AI · 1055 Rue Lucien-L'Allier, Unit #1036, Montreal, QC H3G 3C4
            </Text>
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
  heroSection: {
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 24,
  },
  brandIconFrame: {
    width: 84,
    height: 84,
    borderRadius: 24,
    overflow: 'hidden' as const,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(73, 209, 125, 0.38)',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  brandIcon: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  creditCounter: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentMuted,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  creditCounterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  creditDots: {
    flexDirection: 'row' as const,
    gap: 5,
  },
  creditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  creditDotActive: {
    backgroundColor: Colors.accent,
  },
  creditDotUsed: {
    backgroundColor: Colors.border,
  },
  planCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planCardMonthly: {
    marginBottom: 16,
  },
  planCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 5,
  },
  planBadgeRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 12,
  },
  bestValueBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  twoMonthsBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  twoMonthsText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  planContent: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  planRadio: {
    marginRight: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  planEquivalent: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  planPriceBlock: {
    alignItems: 'flex-end' as const,
  },
  planPriceMain: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  planPricePeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  subscribeBtn: {
    borderRadius: 18,
    overflow: 'hidden' as const,
    marginBottom: 24,
  },
  subscribeBtnDisabled: {
    opacity: 0.6,
  },
  subscribeBtnGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    minHeight: 56,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800' as const,
  },
  currentPlanBadge: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  currentPlanText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  featuresSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  testimonialCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  testimonialText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  restoreBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restoreBtnDisabled: {
    opacity: 0.6,
  },
  restoreBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  legalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center' as const,
    gap: 10,
  },
  legalDisclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  legalLinksRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500' as const,
    textDecorationLine: 'underline' as const,
  },
  legalSeparator: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addressFooter: {
    marginTop: 12,
    paddingTop: 12,
    alignItems: 'center' as const,
  },
  addressFooterText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  bottomSpace: {
    height: 30,
  },
});
