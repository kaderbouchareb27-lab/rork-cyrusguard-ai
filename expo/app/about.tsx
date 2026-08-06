import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';

export default function AboutScreen() {
  const router = useRouter();
  const { language } = useApp();

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackdrop />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{language === 'fr' ? 'À propos' : 'About'}</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>CyrusGuard AI</Text>
            <Text style={styles.version}>AI Fraud Scanner · v2.0.0</Text>
          </View>

          <Text style={styles.description}>
            {language === 'fr'
              ? 'CyrusGuard AI est votre scanner de protection contre la fraude numérique. Son gardien IA analyse les messages, courriels, liens et sites suspects afin de vous aider à repérer les signaux d’arnaque avant qu’ils ne vous atteignent.\n\nNotre mission : rendre la vigilance numérique simple, claire et accessible, avec une protection adaptée à votre pays, en français et en anglais.'
              : 'CyrusGuard AI is your protection scanner against digital fraud. Its AI guardian analyzes suspicious messages, emails, links, and websites to help you spot scam signals before they reach you.\n\nOur mission: make digital vigilance simple, clear, and accessible, with country-aware protection in French and English.'}
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Technologie' : 'Technology'}</Text>
            <Text style={styles.infoValue}>{language === 'fr' ? 'Scanner IA de fraude' : 'AI fraud scanner'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Marchés' : 'Markets'}</Text>
            <Text style={styles.infoValue}>{language === 'fr' ? '17 profils de protection' : '17 protection profiles'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Langues' : 'Languages'}</Text>
            <Text style={styles.infoValue}>Français, English</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Siège social' : 'Headquarters'}</Text>
            <Text style={styles.infoValue}>Montreal, QC, Canada</Text>
          </View>

          <View style={styles.addressBlock}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.addressText}>
              CyrusGuard AI{"\n"}1055 Rue Lucien-L'Allier, Unit #1036{"\n"}Montreal, QC H3G 3C4
            </Text>
          </View>

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
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  logoSection: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: Colors.accentMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.accentGlow,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 18, elevation: 6,
  },
  logoImage: { width: 82, height: 82, borderRadius: 24 },
  appName: { fontSize: 24, fontWeight: '800' as const, color: Colors.textPrimary },
  version: { fontSize: 13, color: Colors.textMuted },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  infoCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    flexDirection: 'row' as const, justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  infoLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  infoValue: { fontSize: 13, color: Colors.textSecondary },
  addressBlock: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
  bottomSpace: { height: 40 },
});
