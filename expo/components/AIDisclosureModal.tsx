import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Shield, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface AIDisclosureModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export default function AIDisclosureModal({ visible, onAccept, onClose }: AIDisclosureModalProps) {
  const { t, language } = useApp();
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
                <Eye size={28} color={Colors.accent} />
              </View>
            </View>
          </View>

          <Text style={styles.title}>{t('aiDisclosureTitle')}</Text>

          <View style={styles.messageBubble}>
            <Shield size={16} color={Colors.info} style={styles.shieldIcon} />
            <Text style={styles.message}>{t('aiDisclosureMessage')}</Text>
          </View>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.8}
            testID="ai-disclosure-accept-btn"
          >
            <Text style={styles.acceptBtnText}>{t('aiDisclosureAccept')}</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              testID="ai-disclosure-close-btn"
            >
              <Text style={styles.closeBtnText}>{language === 'fr' ? 'Annuler' : 'Cancel'}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  messageBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
  },
  shieldIcon: {
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  acceptBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
});
