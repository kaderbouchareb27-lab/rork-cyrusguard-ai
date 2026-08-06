import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Mail, Globe, MessageCircle, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';
import GuardianMark from '@/components/GuardianMark';

export default function ContactScreen() {
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
          <Text style={styles.topTitle}>Contact</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.brandLine}><GuardianMark size={42} /><Text style={styles.brandLineText}>CYRUSGUARD SUPPORT</Text></View>
          <Text style={styles.heading}>
            {language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
          </Text>
          <Text style={styles.subtext}>
            {language === 'fr'
              ? 'Notre équipe est disponible pour répondre à vos questions et vous aider.'
              : 'Our team is available to answer your questions and help you.'}
          </Text>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:support@cyrusguard.ai')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBg, { backgroundColor: Colors.accentMuted }]}>
              <Mail size={22} color={Colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={[styles.contactValue, styles.contactLink]}>support@cyrusguard.ai</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('https://www.cyrusguard.ai')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBg, { backgroundColor: Colors.infoMuted }]}>
              <Globe size={22} color={Colors.info} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{language === 'fr' ? 'Site web' : 'Website'}</Text>
              <Text style={[styles.contactValue, styles.contactLink]}>www.cyrusguard.ai</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
              <MessageCircle size={22} color="#A855F7" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{language === 'fr' ? 'Chat in-app' : 'In-app Chat'}</Text>
              <Text style={styles.contactValue}>
                {language === 'fr' ? 'Utilisez Cyrus pour une aide immédiate' : 'Use Cyrus for immediate help'}
              </Text>
            </View>
          </View>

          <View style={styles.contactCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
              <MapPin size={22} color="#F97316" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{language === 'fr' ? 'Adresse' : 'Address'}</Text>
              <Text style={styles.contactValue}>
                CyrusGuard AI{"\n"}1055 Rue Lucien-L'Allier, Unit #1036{"\n"}Montreal, QC H3G 3C4
              </Text>
            </View>
          </View>

          <Text style={styles.responseTime}>
            {language === 'fr'
              ? 'Temps de réponse moyen : 24h (gratuit) / 4h (Premium)'
              : 'Average response time: 24h (free) / 4h (Premium)'}
          </Text>

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
  content: { paddingHorizontal: 20, paddingTop: 16 },
  brandLine: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginBottom: 18 },
  brandLineText: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.1, color: Colors.accent },
  heading: { fontSize: 24, fontWeight: '800' as const, color: Colors.textPrimary, marginBottom: 8 },
  subtext: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  contactCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: 16, padding: 18,
    flexDirection: 'row' as const, alignItems: 'center', gap: 14,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 3,
  },
  iconBg: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textMuted, marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: '500' as const, color: Colors.textPrimary },
  contactLink: { color: Colors.accent, textDecorationLine: 'underline' as const },
  responseTime: {
    fontSize: 13, color: Colors.textMuted, textAlign: 'center' as const,
    marginTop: 20, fontStyle: 'italic' as const,
  },
  bottomSpace: { height: 40 },
});
