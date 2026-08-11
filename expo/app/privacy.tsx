import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';

export default function PrivacyScreen() {
  const router = useRouter();
  const { language } = useApp();

  const content = language === 'fr' ? {
    title: 'Politique de confidentialité',
    sections: [
      { heading: '1. Collecte de données', body: 'Nous collectons uniquement les données nécessaires au fonctionnement du service : adresse email, préférences de langue et pays, et historique des scans.' },
      { heading: '2. Images analysées', body: 'Les images soumises pour analyse sont traitées par notre IA puis immédiatement supprimées. Aucune image n\'est stockée sur nos serveurs.' },
      { heading: '3. Traitement des données par l\'intelligence artificielle', body: 'Les contenus soumis à l\'analyse (images, textes, URLs) sont transmis à OpenAI (openai.com), notre service d\'intelligence artificielle tiers basé aux États-Unis. OpenAI traite ces données conformément à sa politique de confidentialité disponible sur openai.com/privacy. Les données sont envoyées de manière sécurisée (chiffrement TLS) uniquement pour l\'analyse de fraude. Les données ne sont pas conservées après l\'analyse et ne sont pas utilisées pour entraîner des modèles. Aucune donnée personnelle identifiable n\'est volontairement transmise. Vous êtes informé de ce traitement avant votre première analyse via une fenêtre de consentement explicite.' },
      { heading: '4. Utilisation des données', body: 'Vos données sont utilisées exclusivement pour fournir et améliorer le service CyrusGuard AI. Aucune donnée n\'est vendue ou partagée avec des tiers à des fins commerciales.' },
      { heading: '5. Sécurité', body: 'Nous utilisons le chiffrement de bout en bout et les meilleures pratiques de sécurité pour protéger vos données.' },
      { heading: '6. Droits RGPD', body: 'Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits depuis votre profil ou en nous contactant.' },
      { heading: '7. Suppression des données', body: 'Vous pouvez demander la suppression complète de votre compte et de toutes vos données à tout moment depuis les paramètres de l\'application.' },
      { heading: '8. Abonnements et paiements', body: 'Les abonnements Premium sont gérés via les achats intégrés d\'Apple (In-App Purchases). Les paiements sont traités exclusivement par Apple. CyrusGuard AI n\'a pas accès à vos informations de paiement. La gestion et l\'annulation des abonnements se font via les réglages de votre compte Apple (Réglages > Apple ID > Abonnements).' },
      { heading: '9. Cookies', body: 'Nous n\'utilisons pas de cookies de suivi. Seuls des cookies essentiels au fonctionnement de l\'application sont utilisés.' },
      { heading: '10. Coordonnées du responsable', body: 'CyrusGuard AI\n1055 Rue Lucien-L\'Allier, Unit #1036\nMontreal, QC H3G 3C4\n\nPour exercer vos droits ou pour toute question relative à la protection de vos données, contactez-nous à support@cyrusguard.ai' },
    ],
  } : {
    title: 'Privacy Policy',
    sections: [
      { heading: '1. Data Collection', body: 'We only collect data necessary for the service to function: email address, language and country preferences, and scan history.' },
      { heading: '2. Analyzed Images', body: 'Images submitted for analysis are processed by our AI and immediately deleted. No images are stored on our servers.' },
      { heading: '3. Third-Party AI Data Processing', body: 'Content submitted for analysis (images, texts, URLs) is transmitted to OpenAI (openai.com), our third-party artificial intelligence service based in the United States. OpenAI processes this data in accordance with its privacy policy available at openai.com/privacy. Data is securely transmitted (TLS encryption) solely for fraud analysis purposes. Data is not retained after analysis and is not used to train models. No personally identifiable information is intentionally transmitted. You are informed of this processing before your first analysis via an explicit consent dialog.' },
      { heading: '4. Data Usage', body: 'Your data is used exclusively to provide and improve the CyrusGuard AI service. No data is sold or shared with third parties for commercial purposes.' },
      { heading: '5. Security', body: 'We use end-to-end encryption and best security practices to protect your data.' },
      { heading: '6. GDPR Rights', body: 'In accordance with GDPR, you have the right to access, rectify, delete, and port your data. You can exercise these rights from your profile or by contacting us.' },
      { heading: '7. Data Deletion', body: 'You can request complete deletion of your account and all data at any time from the application settings.' },
      { heading: '8. Subscriptions and Payments', body: 'Premium subscriptions are managed through Apple In-App Purchases. Payments are processed exclusively by Apple. CyrusGuard AI does not have access to your payment information. Subscription management and cancellation is done through your Apple account settings (Settings > Apple ID > Subscriptions).' },
      { heading: '9. Cookies', body: 'We do not use tracking cookies. Only cookies essential for the application to function are used.' },
      { heading: '10. Data Controller Contact', body: 'CyrusGuard AI\n1055 Rue Lucien-L\'Allier, Unit #1036\nMontreal, QC H3G 3C4\n\nTo exercise your rights or for any questions regarding your data protection, contact us at support@cyrusguard.ai' },
    ],
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackdrop />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{content.title}</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {content.sections.map((s, i) => (
            <View key={i} style={styles.section}>
              <Text style={styles.heading}>{s.heading}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
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
  section: { marginBottom: 12, padding: 17, borderRadius: 18, backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.border },
  heading: { fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  bottomSpace: { height: 40 },
});
