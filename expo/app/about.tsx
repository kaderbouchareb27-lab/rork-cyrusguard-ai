import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Shield, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function AboutScreen() {
  const router = useRouter();
  const { language } = useApp();

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
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
              <Shield size={40} color={Colors.accent} />
            </View>
            <Text style={styles.appName}>CyrusGuard AI</Text>
            <Text style={styles.version}>v3.0.1</Text>
          </View>

          <Text style={styles.description}>
            {language === 'fr'
              ? 'CyrusGuard AI est votre bouclier intelligent contre la fraude numérique. Propulsé par l\'intelligence artificielle GPT-4o, notre application analyse instantanément les messages suspects, emails et sites web pour vous protéger des arnaques.\n\nNotre mission est de démocratiser la cybersécurité en la rendant accessible à tous, avec un support en français et en anglais pour les marchés canadien, français et américain.'
              : 'CyrusGuard AI is your intelligent shield against digital fraud. Powered by GPT-4o artificial intelligence, our application instantly analyzes suspicious messages, emails, and websites to protect you from scams.\n\nOur mission is to democratize cybersecurity by making it accessible to everyone, with support in French and English for the Canadian, French, and American markets.'}
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Technologie' : 'Technology'}</Text>
            <Text style={styles.infoValue}>OpenAI GPT-4o Vision</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{language === 'fr' ? 'Marchés' : 'Markets'}</Text>
            <Text style={styles.infoValue}>🇨🇦 Canada  🇫🇷 France  🇺🇸 USA</Text>
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
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.accentMuted, alignItems: 'center', justifyContent: 'center',
  },
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
