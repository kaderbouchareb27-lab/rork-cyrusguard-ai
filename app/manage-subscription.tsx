import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import {
  Crown, CreditCard, Check, ChevronLeft, Shield, Zap, XCircle, Star, RotateCcw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';

type PlanType = 'free' | 'monthly' | 'annual';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const {
    t, user, country, upgradeToPremium, remainingCredits,
    restorePurchases, isPurchasing, isRestoring, currentOffering,
  } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user.plan);

  const config = countryConfigs[country];
  const currencySymbol = config.currencySymbol;

  const monthlyPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_monthly');
  const annualPkg = currentOffering?.availablePackages.find(p => p.identifier === '$rc_annual');

  const prices = {
    monthly: monthlyPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.monthly}`,
    annual: annualPkg?.product?.priceString ?? `${currencySymbol}${config.pricing.annual}`,
  };

  const currentPlanLabel = (): string => {
    if (user.plan === 'monthly') return t('monthlyPlanLabel');
    if (user.plan === 'annual') return t('annualPlanLabel');
    return t('freePlan');
  };

  const currentPlanPrice = (): string => {
    if (user.plan === 'monthly') return `${prices.monthly}${t('perMonth')}`;
    if (user.plan === 'annual') return `${prices.annual}${t('perYear')}`;
    return `${currencySymbol}0`;
  };

  const handleChangePlan = (plan: PlanType) => {
    if (plan === 'free') return;
    const cycle = plan === 'monthly' ? 'monthly' : 'annual';
    void upgradeToPremium(cycle);
    setSelectedPlan(plan);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      t('cancelSubscription'),
      t('cancelSubConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('cancelSubscription'),
          style: 'destructive',
          onPress: () => {
            Alert.alert('', t('cancelSubSuccess'));
          },
        },
      ]
    );
  };

  const plansList: {
    key: PlanType;
    label: string;
    price: string;
    billing: string;
    features: string[];
    isCurrent: boolean;
    isRecommended: boolean;
    icon: typeof Crown;
    accentColor: string;
  }[] = [
    {
      key: 'free',
      label: t('freePlan'),
      price: `${currencySymbol}0`,
      billing: '',
      features: [t('freeFeature1'), t('freeFeature2'), t('freeFeature3')],
      isCurrent: user.plan === 'free',
      isRecommended: false,
      icon: Shield,
      accentColor: Colors.textMuted,
    },
    {
      key: 'monthly',
      label: t('monthlyPlanLabel'),
      price: prices.monthly,
      billing: t('billedMonthly'),
      features: [t('premiumFeature1'), t('premiumFeature2'), t('premiumFeature3'), t('premiumFeature6')],
      isCurrent: user.plan === 'monthly',
      isRecommended: false,
      icon: Zap,
      accentColor: Colors.accent,
    },
    {
      key: 'annual',
      label: t('annualPlanLabel'),
      price: prices.annual,
      billing: t('billedAnnually'),
      features: [t('premiumFeature1'), t('premiumFeature2'), t('premiumFeature3'), t('premiumFeature6'), t('premiumFeature7'), t('premiumFeature8')],
      isCurrent: user.plan === 'annual',
      isRecommended: true,
      icon: Crown,
      accentColor: '#FFD700',
    },
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('manageSubTitle'),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <View style={[styles.currentPlanIcon, { backgroundColor: user.isPremium ? 'rgba(255,215,0,0.15)' : Colors.surface }]}>
              {user.isPremium ? (
                <Crown size={24} color="#FFD700" />
              ) : (
                <Shield size={24} color={Colors.textMuted} />
              )}
            </View>
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanLabel}>{t('yourCurrentPlan')}</Text>
              <Text style={styles.currentPlanName}>{currentPlanLabel()}</Text>
            </View>
            {user.isPremium && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t('active')}</Text>
              </View>
            )}
          </View>

          <View style={styles.currentPlanDetails}>
            <Text style={styles.currentPlanPrice}>{currentPlanPrice()}</Text>
            <Text style={styles.currentPlanDesc}>
              {user.isPremium ? t('premiumPlanDesc') : t('freePlanDesc')}
            </Text>
            {!user.isPremium && (
              <View style={styles.creditsRow}>
                <CreditCard size={14} color={Colors.accent} />
                <Text style={styles.creditsText}>
                  {remainingCredits === Infinity ? '∞' : remainingCredits}/3 {t('creditsRemaining')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('availablePlans')}</Text>

        {plansList.map((plan) => {
          const isSelected = selectedPlan === plan.key;
          const borderColor = plan.isCurrent
            ? Colors.accent
            : isSelected
            ? plan.accentColor
            : Colors.border;

          return (
            <TouchableOpacity
              key={plan.key}
              style={[styles.planCard, { borderColor }]}
              onPress={() => setSelectedPlan(plan.key)}
              activeOpacity={0.7}
              testID={`plan-${plan.key}`}
            >
              {plan.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Star size={10} color="#FFD700" />
                  <Text style={styles.recommendedText}>{t('recommended')}</Text>
                </View>
              )}
              {plan.isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>{t('currentPlan')}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.accentColor + '20' }]}>
                  <plan.icon size={20} color={plan.accentColor} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.label}</Text>
                  {plan.billing ? <Text style={styles.planBilling}>{plan.billing}</Text> : null}
                </View>
                <Text style={[styles.planPrice, plan.key !== 'free' && { color: Colors.accent }]}>
                  {plan.price}
                  {plan.key === 'monthly' && (
                    <Text style={styles.planPeriod}>{t('perMonth')}</Text>
                  )}
                  {plan.key === 'annual' && (
                    <Text style={styles.planPeriod}>{t('perYear')}</Text>
                  )}
                </Text>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color={plan.key === 'free' ? Colors.textMuted : Colors.accent} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {!plan.isCurrent && plan.key !== 'free' && isSelected && (
                <TouchableOpacity
                  style={[styles.changePlanBtn, isPurchasing && styles.changePlanBtnDisabled]}
                  onPress={() => handleChangePlan(plan.key)}
                  activeOpacity={0.8}
                  disabled={isPurchasing}
                  testID={`change-plan-${plan.key}`}
                >
                  {isPurchasing ? (
                    <ActivityIndicator color={Colors.background} size="small" />
                  ) : (
                    <Text style={styles.changePlanBtnText}>
                      {user.isPremium ? t('changePlan') : t('upgradeNow')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {user.isPremium && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelSubscription}
            activeOpacity={0.7}
            testID="cancel-subscription-btn"
          >
            <XCircle size={18} color={Colors.danger} />
            <Text style={styles.cancelBtnText}>{t('cancelSubscription')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.restoreBtn, isRestoring && styles.restoreBtnDisabled]}
          onPress={restorePurchases}
          disabled={isRestoring}
          activeOpacity={0.7}
          testID="restore-purchases-btn"
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

        <Text style={styles.restoreText}>{t('restoreInfo')}</Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  currentPlanCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentPlanHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
  },
  currentPlanDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
  },
  currentPlanPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  currentPlanDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  creditsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start' as const,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  recommendedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD700',
    textTransform: 'uppercase' as const,
  },
  currentBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 10,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
  },
  planHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 14,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  planBilling: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  planFeatures: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  changePlanBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  changePlanBtnDisabled: {
    opacity: 0.6,
  },
  changePlanBtnText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  cancelBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  restoreBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
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
  restoreText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 10,
    lineHeight: 18,
  },
  bottomSpace: {
    height: 20,
  },
});
