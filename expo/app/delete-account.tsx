import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, AlertTriangle, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';
import GuardianMark from '@/components/GuardianMark';
import { useSafeBack } from '@/lib/navigation';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { t, deleteAllData, language } = useApp();
  const [confirmation, setConfirmation] = useState('');

  const confirmWord = language === 'fr' ? 'SUPPRIMER' : 'DELETE';
  const canDelete = confirmation === confirmWord;

  const handleDelete = () => {
    Alert.alert(
      t('deleteAccountTitle'),
      language === 'fr' ? 'Êtes-vous absolument sûr ?' : 'Are you absolutely sure?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAccountButton'),
          style: 'destructive',
          onPress: async () => {
            await deleteAllData();
            router.replace('/');
          },
        },
      ]
    );
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
          <Text style={styles.topTitle}>{t('deleteAccountTitle')}</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          <View style={styles.warningCard}>
            <GuardianMark size={82} glow presentation="hero" />
            <View style={styles.warningBadge}><AlertTriangle size={18} color={Colors.danger} /></View>
            <Text style={styles.warningTitle}>{t('deleteAccountTitle')}</Text>
            <Text style={styles.warningText}>{t('deleteAccountWarning')}</Text>
          </View>

          <Text style={styles.confirmLabel}>{t('deleteAccountConfirm')}</Text>
          <TextInput
            style={styles.input}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder={t('deleteAccountPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
            testID="delete-confirm-input"
          />

          <TouchableOpacity
            style={[styles.deleteBtn, !canDelete && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={!canDelete}
            activeOpacity={0.8}
            testID="delete-confirm-btn"
          >
            <Trash2 size={18} color={canDelete ? Colors.white : Colors.textMuted} />
            <Text style={[styles.deleteBtnText, !canDelete && { color: Colors.textMuted }]}>
              {t('deleteAccountButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={goBack}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  warningCard: {
    backgroundColor: Colors.dangerMuted, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 12, marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(255,95,112,0.35)',
  },
  warningBadge: { width: 38, height: 38, marginTop: -28, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dangerMuted, borderWidth: 1, borderColor: 'rgba(255,95,112,0.45)' },
  warningTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.danger },
  warningText: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const, lineHeight: 22,
  },
  confirmLabel: {
    fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary, marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 20, textAlign: 'center' as const,
    letterSpacing: 2,
  },
  deleteBtn: {
    backgroundColor: Colors.danger, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 12,
  },
  deleteBtnDisabled: { backgroundColor: Colors.surface },
  deleteBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  cancelBtn: {
    paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600' as const, color: Colors.textMuted },
});
