import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';
import { useSafeBack } from '@/lib/navigation';

export default function TermsScreen() {
  const goBack = useSafeBack();
  const { language } = useApp();

  const content = language === 'fr' ? {
    title: 'Conditions d\'utilisation',
    sections: [
      { heading: '1. Acceptation des conditions', body: 'En utilisant CyrusGuard AI, vous acceptez les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.' },
      { heading: '2. Description du service', body: 'CyrusGuard AI est une application d\'analyse de fraude utilisant l\'intelligence artificielle. Le service fournit des analyses indicatives et ne constitue pas un avis juridique.' },
      { heading: '3. Compte utilisateur', body: 'Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités qui se produisent sous votre compte.' },
      { heading: '4. Utilisation acceptable', body: 'Vous vous engagez à utiliser le service uniquement à des fins légales et conformément aux lois applicables dans votre pays de résidence.' },
      { heading: '5. Limitation de responsabilité', body: 'CyrusGuard AI fournit des analyses à titre indicatif uniquement. Nous ne garantissons pas l\'exactitude à 100% des résultats et ne pouvons être tenus responsables des décisions prises sur la base de ces analyses.' },
      { heading: '6. Abonnements et paiements', body: 'CyrusGuard AI propose des abonnements Premium via les achats intégrés d\'Apple (In-App Purchases).\n\n• Les nouveaux abonnés éligibles bénéficient d’un essai gratuit de 7 jours sur les formules mensuelle et annuelle.\n• Aucun paiement n’est prélevé pendant l’essai. Le premier prélèvement intervient à la fin des 7 jours, sauf annulation au moins 24 heures avant.\n• L’abonnement se renouvelle automatiquement à la fin de chaque période sauf annulation au moins 24 heures avant la fin de la période en cours.\n• Le renouvellement est facturé au tarif en vigueur au moment du renouvellement.\n• Vous pouvez gérer et annuler vos abonnements dans Réglages > Apple ID > Abonnements.\n• Les prix sont affichés dans votre devise locale par l’App Store.' },
      { heading: '7. Traitement des données par l\'IA', body: 'CyrusGuard transmet de façon sécurisée les contenus soumis à son service d’intelligence artificielle uniquement pour réaliser l’analyse demandée. Les données ne sont pas conservées après l’analyse.' },
      { heading: '8. Propriété intellectuelle', body: 'Tout le contenu, les marques et la technologie de CyrusGuard AI sont protégés par les droits de propriété intellectuelle.' },
      { heading: '9. Modification des conditions', body: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs.' },
      { heading: '10. Coordonnées', body: 'CyrusGuard AI\n1055 Rue Lucien-L\'Allier, Unit #1036\nMontreal, QC H3G 3C4\n\nPour toute question concernant ces conditions, contactez-nous à support@cyrusguard.ai' },
    ],
  } : {
    title: 'Terms of Service',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By using CyrusGuard AI, you agree to these terms of service. If you do not agree, please do not use the application.' },
      { heading: '2. Service Description', body: 'CyrusGuard AI is a fraud analysis application using artificial intelligence. The service provides indicative analyses and does not constitute legal advice.' },
      { heading: '3. User Account', body: 'You are responsible for the confidentiality of your login credentials and all activities that occur under your account.' },
      { heading: '4. Acceptable Use', body: 'You agree to use the service only for lawful purposes and in accordance with applicable laws in your country of residence.' },
      { heading: '5. Limitation of Liability', body: 'CyrusGuard AI provides analyses for indicative purposes only. We do not guarantee 100% accuracy of results and cannot be held responsible for decisions made based on these analyses.' },
      { heading: '6. Subscriptions and Payments', body: 'CyrusGuard AI offers Premium subscriptions via Apple In-App Purchases.\n\n• Eligible new subscribers receive a 7-day free trial on both monthly and annual plans.\n• No payment is charged during the trial. The first charge occurs after 7 days unless cancelled at least 24 hours beforehand.\n• Subscriptions renew automatically at the end of each period unless cancelled at least 24 hours before the current period ends.\n• Renewal is charged at the rate in effect at that time.\n• Manage or cancel in Settings > Apple ID > Subscriptions.\n• Prices are displayed by the App Store in your local currency.' },
      { heading: '7. AI Data Processing', body: 'CyrusGuard securely sends submitted content to its artificial intelligence service only to perform the requested analysis. Data is not retained after analysis.' },
      { heading: '8. Intellectual Property', body: 'All content, trademarks, and technology of CyrusGuard AI are protected by intellectual property rights.' },
      { heading: '9. Modification of Terms', body: 'We reserve the right to modify these terms at any time. Users will be notified of significant changes.' },
      { heading: '10. Contact Information', body: 'CyrusGuard AI\n1055 Rue Lucien-L\'Allier, Unit #1036\nMontreal, QC H3G 3C4\n\nFor any questions regarding these terms, contact us at support@cyrusguard.ai' },
    ],
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackdrop />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
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
