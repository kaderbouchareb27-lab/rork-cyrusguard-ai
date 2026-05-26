import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Shield, Sparkles, Lock, Database, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface AIDisclosureModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export default function AIDisclosureModal({ visible, onAccept, onClose }: AIDisclosureModalProps) {
  const { t } = useApp();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      testID="ai-disclosure-modal"
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Sparkles size={28} color={Colors.accent} />
              </View>
            </View>
          </View>

          <Text style={styles.title}>{t('aiDisclosureTitle')}</Text>
          <Text style={styles.subtitle}>{t('aiDisclosureSubtitle')}</Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletIcon, { backgroundColor: Colors.accentMuted }]}>
                <Shield size={16} color={Colors.accent} />
              </View>
              <View style={styles.bulletTextWrap}>
                <Text style={styles.bulletTitle}>{t('aiBullet1Title')}</Text>
                <Text style={styles.bulletDesc}>{t('aiBullet1Desc')}</Text>
              </View>
            </View>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletIcon, { backgroundColor: Colors.infoMuted }]}>
                <Database size={16} color={Colors.info} />
              </View>
              <View style={styles.bulletTextWrap}>
                <Text style={styles.bulletTitle}>{t('aiBullet2Title')}</Text>
                <Text style={styles.bulletDesc}>{t('aiBullet2Desc')}</Text>
              </View>
            </View>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletIcon, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
                <Lock size={16} color="#A855F7" />
              </View>
              <View style={styles.bulletTextWrap}>
                <Text style={styles.bulletTitle}>{t('aiBullet3Title')}</Text>
                <Text style={styles.bulletDesc}>{t('aiBullet3Desc')}</Text>
              </View>
            </View>
            <Text style={styles.fineprint}>{t('aiDisclosureFineprint')}</Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.8}
            testID="ai-disclosure-accept-btn"
          >
            <Shield size={18} color={Colors.background} />
            <Text style={styles.acceptBtnText}>{t('aiDisclosureAccept')}</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              style={styles.refuseBtn}
              onPress={onClose}
              activeOpacity={0.7}
              testID="ai-disclosure-refuse-btn"
            >
              <X size={16} color={Colors.danger} />
              <Text style={styles.refuseBtnText}>{t('aiDisclosureRefuse')}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  iconOuter: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 19,
  },
  scroll: {
    width: '100%',
    maxHeight: 280,
    marginBottom: 12,
  },
  scrollContent: {
    paddingVertical: 2,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start' as const,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  bulletTextWrap: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  bulletDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  fineprint: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    textAlign: 'center' as const,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  acceptBtn: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 6,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.background,
    letterSpacing: 0.2,
  },
  refuseBtn: {
    flexDirection: 'row' as const,
    paddingVertical: 12,
    marginTop: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  refuseBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
});
