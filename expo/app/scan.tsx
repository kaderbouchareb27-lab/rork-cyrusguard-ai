import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Alert,
  TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import {
  Camera, ImagePlus, Scan, X, Loader, MessageSquare, Link2, Mail,
  Phone, MessagesSquare, ChevronRight, Send,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { ScanResult } from '@/mocks/scans';
import PaywallGate from '@/components/PaywallGate';
import AIDisclosureModal from '@/components/AIDisclosureModal';
import { analyzeImage, analyzeText, cancelActiveRequests, type ContentType } from '@/services/openai';

interface ContentTypeOption {
  type: ContentType;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  { type: 'sms', labelKey: 'contentTypeSms', icon: <MessageSquare size={20} color="#22C55E" />, color: '#22C55E', bgColor: 'rgba(34,197,94,0.15)' },
  { type: 'url', labelKey: 'contentTypeUrl', icon: <Link2 size={20} color="#3B82F6" />, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.15)' },
  { type: 'email', labelKey: 'contentTypeEmail', icon: <Mail size={20} color="#F59E0B" />, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.15)' },
  { type: 'phone', labelKey: 'contentTypePhone', icon: <Phone size={20} color="#EF4444" />, color: '#EF4444', bgColor: 'rgba(239,68,68,0.15)' },
  { type: 'social', labelKey: 'contentTypeSocial', icon: <MessagesSquare size={20} color="#A855F7" />, color: '#A855F7', bgColor: 'rgba(168,85,247,0.15)' },
];

const PLATFORMS = ['Messenger', 'WhatsApp', 'Instagram', 'Autre'] as const;
const PLATFORM_KEYS: Record<string, string> = {
  'Messenger': 'platformMessenger',
  'WhatsApp': 'platformWhatsapp',
  'Instagram': 'platformInstagram',
  'Autre': 'platformOther',
};

export default function ScanScreen() {
  const router = useRouter();
  const { t, addScan, language, country, canScan, consumeCredit, hasAcceptedAIDisclosure, acceptAIDisclosure } = useApp();
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType>('sms');
  const [textInput, setTextInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Messenger');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [_showImageOptions, setShowImageOptions] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    return () => {
      isMountedRef.current = false;
      cancelActiveRequests();
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
    };
  }, [fadeAnim]);

  const getPlaceholder = useCallback((): string => {
    switch (selectedType) {
      case 'sms': return t('smsPlaceholder');
      case 'url': return t('urlInputPlaceholder');
      case 'email': return t('emailPlaceholder');
      case 'phone': return t('phonePlaceholder');
      case 'social': return t('socialPlaceholder');
      default: return '';
    }
  }, [selectedType, t]);

  const requireDisclosure = (action: () => void) => {
    if (!hasAcceptedAIDisclosure) {
      setPendingAction(() => action);
      setShowDisclosure(true);
      return;
    }
    void Promise.resolve(action());
  };

  const handleDisclosureAccept = () => {
    void acceptAIDisclosure();
    setShowDisclosure(false);
    if (pendingAction) {
      void Promise.resolve(pendingAction());
      setPendingAction(null);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.2,
        base64: true,
        exif: false,
        allowsEditing: false,
      };

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission', language === 'fr' ? 'Permission caméra requise' : 'Camera permission required');
          return;
        }
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Scan] Image selected, uri:', asset.uri?.substring(0, 80), 'base64 length:', asset.base64?.length ?? 0, 'mimeType:', asset.mimeType, 'width:', asset.width, 'height:', asset.height);

        if (!asset.uri && !asset.base64) {
          Alert.alert(
            language === 'fr' ? 'Erreur' : 'Error',
            language === 'fr' ? 'Impossible de charger l\'image. Veuillez réessayer.' : 'Unable to load image. Please try again.'
          );
          return;
        }

        void startImageAnalysis(asset.uri, asset.base64 ?? undefined, asset.mimeType ?? undefined);
      }
    } catch (error: any) {
      console.log('[Scan] Image picker error:', error?.message, error);
      Alert.alert(
        language === 'fr' ? 'Erreur' : 'Error',
        language === 'fr' ? 'Impossible de sélectionner l\'image. Veuillez réessayer.' : 'Unable to select image. Please try again.'
      );
    }
  };

  const startLoadingAnimation = () => {
    if (loopRef.current) loopRef.current.stop();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loopRef.current = loop;
    loop.start();
    Animated.timing(progressAnim, { toValue: 0.9, duration: 15000, useNativeDriver: false }).start();
  };

  const stopLoadingAnimation = () => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
    scanAnim.stopAnimation();
    progressAnim.setValue(0);
  };

  const handleAnalysisResult = (analysis: any, imageUri?: string) => {
    if (!isMountedRef.current) return;
    const newScan: ScanResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      sourceType: analysis.sourceType,
      summary: analysis.summary,
      summaryEn: analysis.summaryEn,
      explanation: analysis.explanation,
      explanationEn: analysis.explanationEn,
      suspiciousElements: analysis.suspiciousElements,
      suspiciousElementsEn: analysis.suspiciousElementsEn,
      reassuringElements: analysis.reassuringElements,
      reassuringElementsEn: analysis.reassuringElementsEn,
      advice: analysis.advice,
      adviceEn: analysis.adviceEn,
      imageUri,
    };
    addScan(newScan);
    consumeCredit();
    setIsAnalyzing(false);
    stopLoadingAnimation();
    router.replace({ pathname: '/result' as any, params: { scanId: newScan.id } });
  };

  const startImageAnalysis = async (imageUri: string, base64?: string, mimeType?: string) => {
    setIsAnalyzing(true);
    startLoadingAnimation();
    try {
      const analysis = await analyzeImage(imageUri, language, base64, country, mimeType);
      if (!isMountedRef.current) return;
      handleAnalysisResult(analysis, imageUri);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.log('[Scan] Image analysis error:', error?.message, error);
      setIsAnalyzing(false);
      stopLoadingAnimation();
      const msg = error?.message ?? '';
      const isNetwork = error?.name === 'AbortError' || msg.includes('timeout') || msg.includes('Network') || msg.includes('network');
      const isQuota = msg.includes('quota') || msg.includes('billing');
      const isRateLimit = msg.includes('429') || msg.includes('rate limit');
      const isServerError = msg.includes('500') || msg.includes('server error') || msg.includes('unavailable');
      let alertMsg: string;
      if (isNetwork) {
        alertMsg = language === 'fr' ? 'Vérifiez votre connexion Internet et réessayez.' : 'Check your Internet connection and try again.';
      } else if (isQuota) {
        alertMsg = language === 'fr' ? 'Service temporairement indisponible. Réessayez plus tard.' : 'Service temporarily unavailable. Try again later.';
      } else if (isRateLimit) {
        alertMsg = language === 'fr' ? 'Service surchargé. Veuillez patienter un moment et réessayer.' : 'Service overloaded. Please wait a moment and try again.';
      } else if (isServerError) {
        alertMsg = language === 'fr' ? 'Service temporairement indisponible. Réessayez dans quelques instants.' : 'Service temporarily unavailable. Try again shortly.';
      } else if (msg.includes('Impossible') || msg.includes('Réponse invalide') || msg.includes('service AI') || msg.includes('Erreur lors')) {
        alertMsg = msg;
      } else {
        alertMsg = language === 'fr' ? 'Une erreur est survenue. Réessayez avec une autre image.' : 'An error occurred. Try again with another image.';
      }
      Alert.alert(
        language === 'fr' ? 'Erreur d\'analyse' : 'Analysis Error',
        alertMsg
      );
    }
  };

  const startTextAnalysis = async () => {
    if (!textInput.trim()) return;
    setIsAnalyzing(true);
    startLoadingAnimation();
    try {
      const analysis = await analyzeText({
        contentType: selectedType,
        text: textInput.trim(),
        phoneNumber: selectedType === 'phone' ? phoneNumber.trim() || undefined : undefined,
        platform: selectedType === 'social' ? selectedPlatform : undefined,
      }, language, country);
      if (!isMountedRef.current) return;
      handleAnalysisResult(analysis);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.log('[Scan] Text analysis error:', error?.message, error);
      setIsAnalyzing(false);
      stopLoadingAnimation();
      const msg = error?.message ?? '';
      const isNetwork = error?.name === 'AbortError' || msg.includes('timeout') || msg.includes('Network');
      const isRateLimit = msg.includes('Rate limit') || msg.includes('429');
      const isServerError = msg.includes('temporarily unavailable') || msg.includes('500');
      let alertMsg: string;
      if (isNetwork) {
        alertMsg = language === 'fr' ? 'Vérifiez votre connexion Internet et réessayez.' : 'Check your Internet connection and try again.';
      } else if (isRateLimit) {
        alertMsg = language === 'fr' ? 'Service surchargé. Veuillez patienter un moment et réessayer.' : 'Service overloaded. Please wait a moment and try again.';
      } else if (isServerError) {
        alertMsg = language === 'fr' ? 'Le service d\'analyse est temporairement indisponible. Réessayez dans quelques instants.' : 'Analysis service is temporarily unavailable. Please try again shortly.';
      } else {
        alertMsg = language === 'fr' ? 'Erreur lors de l\'analyse : ' + msg : 'Analysis error: ' + msg;
      }
      Alert.alert(
        language === 'fr' ? 'Erreur d\'analyse' : 'Analysis Error',
        alertMsg
      );
    }
  };

  const analyzingLabel = useCallback((): string => {
    const labels: Record<ContentType, { fr: string; en: string }> = {
      sms: { fr: 'Analyse du SMS en cours...', en: 'Analyzing SMS...' },
      url: { fr: 'Analyse du lien en cours...', en: 'Analyzing link...' },
      email: { fr: 'Analyse de l\'email en cours...', en: 'Analyzing email...' },
      phone: { fr: 'Analyse de l\'appel en cours...', en: 'Analyzing call...' },
      social: { fr: 'Analyse du message en cours...', en: 'Analyzing message...' },
    };
    return labels[selectedType]?.[language === 'fr' ? 'fr' : 'en'] ?? t('analyzing');
  }, [selectedType, language, t]);

  if (!canScan) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#0F172A', '#162032', '#0F172A']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <X size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.topTitle}>{t('scanTitle')}</Text>
            <View style={styles.closeBtn} />
          </View>
          <PaywallGate type="scan" />
        </SafeAreaView>
      </View>
    );
  }

  if (isAnalyzing) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#0F172A', '#162032', '#0F172A']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.topBar}>
            <View style={styles.closeBtn} />
            <Text style={styles.topTitle}>{t('scanTitle')}</Text>
            <View style={styles.closeBtn} />
          </View>
          <View style={styles.analyzingContainer}>
            <Animated.View style={[styles.scanCircle, { opacity: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]}>
              <View style={styles.scanCircleInner}>
                <Loader size={40} color={Colors.accent} />
              </View>
            </Animated.View>
            <Text style={styles.analyzingTitle}>{t('analyzing')}</Text>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={styles.analyzingSubtext}>{analyzingLabel()}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0F172A', '#162032', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('scanTitle')}</Text>
          <View style={styles.closeBtn} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.iconHeader}>
                <Scan size={32} color={Colors.accent} />
                <Text style={styles.subtitle}>{t('scanMultiSubtitle')}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeSelectorScroll}
              >
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = selectedType === ct.type;
                  return (
                    <TouchableOpacity
                      key={ct.type}
                      style={[
                        styles.typeChip,
                        isSelected && { backgroundColor: ct.bgColor, borderColor: ct.color },
                      ]}
                      onPress={() => {
                        setSelectedType(ct.type);
                        setTextInput('');
                        setPhoneNumber('');
                        setShowImageOptions(false);
                      }}
                      activeOpacity={0.7}
                      testID={`type-${ct.type}`}
                    >
                      <View style={[styles.typeChipIcon, { backgroundColor: isSelected ? ct.color + '30' : Colors.surface }]}>
                        {ct.icon}
                      </View>
                      <Text style={[
                        styles.typeChipLabel,
                        isSelected && { color: ct.color },
                      ]}>
                        {t(ct.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.inputSection}>
                {selectedType === 'phone' && (
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder={t('phoneNumberPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    testID="phone-number-input"
                  />
                )}

                {selectedType === 'social' && (
                  <View style={styles.platformRow}>
                    <Text style={styles.platformLabel}>{t('socialPlatform')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platformChips}>
                      {PLATFORMS.map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[styles.platformChip, selectedPlatform === p && styles.platformChipActive]}
                          onPress={() => setSelectedPlatform(p)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.platformChipText, selectedPlatform === p && styles.platformChipTextActive]}>
                            {t(PLATFORM_KEYS[p] ?? p)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TextInput
                  style={[
                    styles.textArea,
                    selectedType === 'email' && styles.textAreaLarge,
                    selectedType === 'url' && styles.textAreaSmall,
                  ]}
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder={getPlaceholder()}
                  placeholderTextColor={Colors.textMuted}
                  multiline={selectedType !== 'url'}
                  numberOfLines={selectedType === 'url' ? 1 : selectedType === 'email' ? 8 : 5}
                  textAlignVertical="top"
                  autoCapitalize={selectedType === 'url' ? 'none' : 'sentences'}
                  keyboardType={selectedType === 'url' ? 'url' : 'default'}
                  testID="content-input"
                />

                <TouchableOpacity
                  style={[styles.analyzeBtn, !textInput.trim() && styles.analyzeBtnDisabled]}
                  onPress={() => requireDisclosure(startTextAnalysis)}
                  disabled={!textInput.trim()}
                  activeOpacity={0.8}
                  testID="analyze-btn"
                >
                  <Send size={20} color={textInput.trim() ? Colors.background : Colors.textMuted} />
                  <Text style={[styles.analyzeBtnText, !textInput.trim() && styles.analyzeBtnTextDisabled]}>
                    {t('analyzeContent')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerSection}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('orScanImage')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageBtn}
                  onPress={() => requireDisclosure(() => pickImage(true))}
                  activeOpacity={0.8}
                  testID="take-photo-btn"
                >
                  <View style={[styles.imageBtnIcon, { backgroundColor: Colors.accentMuted }]}>
                    <Camera size={20} color={Colors.accent} />
                  </View>
                  <Text style={styles.imageBtnText}>{t('takePhoto')}</Text>
                  <ChevronRight size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageBtn}
                  onPress={() => requireDisclosure(() => pickImage(false))}
                  activeOpacity={0.8}
                  testID="gallery-btn"
                >
                  <View style={[styles.imageBtnIcon, { backgroundColor: Colors.infoMuted }]}>
                    <ImagePlus size={20} color={Colors.info} />
                  </View>
                  <Text style={styles.imageBtnText}>{t('chooseFromGallery')}</Text>
                  <ChevronRight size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AIDisclosureModal visible={showDisclosure} onAccept={handleDisclosureAccept} onDecline={() => setShowDisclosure(false)} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  typeSelectorScroll: {
    paddingBottom: 4,
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeChipIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  inputSection: {
    gap: 12,
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 120,
    maxHeight: 200,
  },
  textAreaLarge: {
    minHeight: 180,
    maxHeight: 280,
  },
  textAreaSmall: {
    minHeight: 50,
    maxHeight: 50,
  },
  phoneInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  platformRow: {
    gap: 8,
  },
  platformLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  platformChips: {
    gap: 8,
  },
  platformChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  platformChipActive: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderColor: '#A855F7',
  },
  platformChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  platformChipTextActive: {
    color: '#A855F7',
    fontWeight: '600' as const,
  },
  analyzeBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  analyzeBtnDisabled: {
    backgroundColor: Colors.surface,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  analyzeBtnTextDisabled: {
    color: Colors.textMuted,
  },
  dividerSection: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  imageButtons: {
    gap: 10,
  },
  imageBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  scanCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  analyzingSubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
});
