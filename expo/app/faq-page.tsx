import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';

export default function FaqPageScreen() {
  const router = useRouter();
  const { language } = useApp();
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = language === 'fr' ? [
    { q: 'Comment fonctionne l\'analyse IA ?', a: 'Notre intelligence artificielle analyse les images, textes, logos et URLs pour détecter des signes d\'arnaque et fournir un score de risque clair.' },
    { q: 'Mes données sont-elles en sécurité ?', a: 'Absolument. Les images sont analysées puis immédiatement supprimées. Aucune donnée n\'est partagée avec des tiers. Nous respectons le RGPD et toutes les réglementations sur la protection des données.' },
    { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, vous pouvez annuler à tout moment depuis votre profil. L\'annulation prend effet à la fin de la période de facturation en cours.' },
    { q: 'Que comprend l\'essai gratuit ?', a: 'L’essai gratuit de 7 jours donne accès à toutes les analyses sans restriction. Vous pouvez annuler depuis les réglages de votre compte Apple avant la fin de l’essai.' },
    { q: 'L\'application fonctionne-t-elle hors ligne ?', a: 'L\'analyse IA nécessite une connexion internet. Cependant, votre historique de scans est disponible hors ligne.' },
    { q: 'Comment signaler une arnaque ?', a: 'Après chaque analyse, nous affichons les organismes de signalement officiels de votre pays avec leurs coordonnées.' },
    { q: 'Quels types de fraudes pouvez-vous détecter ?', a: 'Nous détectons les SMS de phishing, emails frauduleux, faux sites web, arnaques aux cryptomonnaies, fraudes bancaires, arnaques à l\'emploi, et bien d\'autres.' },
  ] : [
    { q: 'How does the AI analysis work?', a: 'Our artificial intelligence analyzes images, text, logos, and URLs to detect scam signals and provide a clear risk score.' },
    { q: 'Is my data secure?', a: 'Absolutely. Images are analyzed then immediately deleted. No data is shared with third parties. We comply with GDPR and all data protection regulations.' },
    { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel at any time from your profile. Cancellation takes effect at the end of the current billing period.' },
    { q: 'What is included in the free trial?', a: 'The 7-day free trial includes unrestricted access to every analysis feature. You can cancel in your Apple account settings before the trial ends.' },
    { q: 'Does the app work offline?', a: 'AI analysis requires an internet connection. However, your scan history is available offline.' },
    { q: 'How do I report a scam?', a: 'After each analysis, we display official reporting organizations from your country with their contact information.' },
    { q: 'What types of fraud can you detect?', a: 'We detect phishing SMS, fraudulent emails, fake websites, cryptocurrency scams, bank fraud, employment scams, and many more.' },
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackdrop />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>FAQ</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {faqs.map((faq, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.faqItem}
              onPress={() => setExpanded(expanded === idx ? null : idx)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                {expanded === idx ? <ChevronUp size={18} color={Colors.textMuted} /> : <ChevronDown size={18} color={Colors.textMuted} />}
              </View>
              {expanded === idx && <Text style={styles.faqA}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  faqItem: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight,
  },
  faqHeader: { flexDirection: 'row' as const, justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary, marginRight: 8 },
  faqA: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 10 },
  bottomSpace: { height: 40 },
});
