import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check, X, Star, Users, Target, ChevronDown, ChevronUp, Zap, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';

export default function PremiumScreen() {
  const router = useRouter();
  const {
    t, currency, country, upgradeToPremium, user, remainingCredits,
    restorePurchases, isPurchasing, isRestoring, currentOffering, isOfferingsLoading,
    auth,
  } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [shineAnim]);

  const config = countryConfigs[country];
  const currencySymbol = config.currencySymbol;

  const monthlyPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_monthly');
  const annualPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_annual');
  const monthlyPrice = monthlyPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.monthly}`;
  const annualPrice = annualPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.annual}`;
  const displayPrice = billingCycle === 'monthly' ? monthlyPrice : annualPrice;

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  const freeFeatures = [t('freeFeature1'), t('freeFeature2'), t('freeFeature3')];
  const premiumFeatures = [
    t('premiumFeature1'), t('premiumFeature2'), t('premiumFeature3'),
    t('premiumFeature4'), t('premiumFeature5'), t('premiumFeature6'),
    t('premiumFeature7'), t('premiumFeature8'),
  ];

  const testimonials = [t('testimonial1'), t('testimonial2'), t('testimonial3')];
  const stats = [
    { icon: Users, value: t('stat1') },
    { icon: Target, value: t('stat2') },
    { icon: Zap, value: t('stat3') },
  ];

  const creditsLeft = remainingCredits === Infinity ? 3 : remainingCredits;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroSection}>
            <Animated.View style={[styles.crownContainer, { opacity: shineAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.7] }) }]}>
              <Crown size={48} color="#FFD700" />
            </Animated.View>
            <Text style={styles.heroTitle}>{t('premiumTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('premiumSubtitle')}</Text>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
              <View key={idx} style={styles.statItem}>
                <stat.icon size={20} color={Colors.accent} />
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === 'monthly' && styles.toggleActive]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>
                {t('monthly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === 'annual' && styles.toggleActive]}
              onPress={() => setBillingCycle('annual')}
            >
              <Text style={[styles.toggleText, billingCycle === 'annual' && styles.toggleTextActive]}>
                {t('annual')}
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>{t('save42')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.plansRow}>
            <View style={styles.planCard}>
              <Text style={styles.planName}>{t('freePlan')}</Text>
              <Text style={styles.planPrice}>{currencySymbol}0</Text>
              {!user.isPremium && (
                <View style={styles.creditCounter}>
                  <Text style={styles.creditCounterText}>
                    {creditsLeft}/3 {t('creditsRemaining')}
                  </Text>
                  <View style={styles.creditDots}>
                    {[0, 1, 2].map(i => (
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
              {freeFeatures.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={14} color={Colors.accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              {premiumFeatures.slice(3).map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <X size={14} color={Colors.textMuted} />
                  <Text style={styles.featureTextDisabled}>{f}</Text>
                </View>
              ))}
            </View>

            <LinearGradient
              colors={['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)']}
              style={styles.premiumCard}
            >
              <View style={styles.premiumBadge}>
                <Star size={12} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
              <Text style={styles.planName}>{t('premiumPlan')}</Text>
              <Text style={styles.planPricePremium}>
                {displayPrice}
                <Text style={styles.planPeriod}>{billingCycle === 'monthly' ? t('perMonth') : t('perYear')}</Text>
              </Text>
              {billingCycle === 'annual' && (
                <Text style={styles.monthlyEquivalentText}>
                  ~{currency === 'EUR' ? '' : currencySymbol}{config.pricing.monthlyEquivalent}{currency === 'EUR' ? '€' : ''}{t('perMonth')}
                </Text>
              )}
              {premiumFeatures.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={14} color={Colors.accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              {!user.isPremium ? (
                auth.isAuthenticated ? (
                  <TouchableOpacity
                    style={[styles.subscribeBtn, (isPurchasing || isOfferingsLoading) && styles.subscribeBtnDisabled]}
                    onPress={() => upgradeToPremium(billingCycle)}
                    activeOpacity={0.8}
                    disabled={isPurchasing || isOfferingsLoading}
                    testID="subscribe-btn"
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color={Colors.background} size="small" />
                    ) : (
                      <Text style={styles.subscribeBtnText}>{t('subscribe')}</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.subscribeBtn, { backgroundColor: Colors.info }]}
                    onPress={() => router.push('/auth' as any)}
                    activeOpacity={0.8}
                    testID="subscribe-auth-btn"
                  >
                    <Text style={styles.subscribeBtnText}>{t('createAccountCTA')}</Text>
                  </TouchableOpacity>
                )
              ) : (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanText}>{t('currentPlan')}</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Testimonials</Text>
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
              {t('subscriptionDisclaimer')}
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  crownContainer: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  toggleRow: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    gap: 6,
  },
  toggleActive: {
    backgroundColor: Colors.backgroundCard,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.textPrimary,
  },
  saveBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  plansRow: {
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  premiumBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  planPricePremium: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.accent,
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  monthlyEquivalentText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -10,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  featureTextDisabled: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'line-through' as const,
  },
  subscribeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  subscribeBtnDisabled: {
    opacity: 0.6,
  },
  subscribeBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  currentPlanBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  currentPlanText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  testimonialCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
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
  bottomSpace: {
    height: 30,
  },
  creditCounter: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center' as const,
    gap: 8,
  },
  creditCounterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  creditDots: {
    flexDirection: 'row' as const,
    gap: 6,
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
  legalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center' as const,
    gap: 10,
  },
  legalDisclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 17,
    paddingHorizontal: 8,
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
});
