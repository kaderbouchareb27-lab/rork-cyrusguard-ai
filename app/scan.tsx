import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Camera, ImagePlus, Scan, X, Loader } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { ScanResult } from '@/mocks/scans';
import PaywallGate from '@/components/PaywallGate';
import { analyzeImage } from '@/services/openai';

export default function ScanScreen() {
  const router = useRouter();
  const { t, addScan, language, canScan } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const pickImage = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission', language === 'fr' ? 'Permission caméra requise' : 'Camera permission required');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Scan] Image selected, uri:', asset.uri?.substring(0, 50), 'base64 length:', asset.base64?.length);
        setSelectedImage(asset.uri);
        setSelectedBase64(asset.base64 ?? null);
        startAnalysis(asset.uri, asset.base64 ?? undefined);
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const startAnalysis = async (imageUri: string, base64?: string) => {
    setIsAnalyzing(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(progressAnim, { toValue: 0.9, duration: 15000, useNativeDriver: false }).start();

    try {
      const analysis = await analyzeImage(imageUri, language, base64);
      console.log('[Scan] Analysis result:', analysis.riskScore, analysis.riskLevel);

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
      setIsAnalyzing(false);
      scanAnim.stopAnimation();
      progressAnim.setValue(0);
      router.replace({ pathname: '/result' as any, params: { scanId: newScan.id } });
    } catch (error) {
      console.log('[Scan] Analysis error:', error);
      setIsAnalyzing(false);
      scanAnim.stopAnimation();
      progressAnim.setValue(0);
      setSelectedImage(null);
      setSelectedBase64(null);
      Alert.alert(
        language === 'fr' ? 'Erreur d\'analyse' : 'Analysis Error',
        language === 'fr'
          ? 'Impossible d\'analyser l\'image. Veuillez réessayer.'
          : 'Unable to analyze the image. Please try again.'
      );
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#0F172A', '#162032', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('scanTitle')}</Text>
          <View style={styles.closeBtn} />
        </View>

        {!canScan ? (
          <PaywallGate type="scan" />
        ) : isAnalyzing ? (
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
            <Text style={styles.analyzingSubtext}>
              {language === 'fr' ? 'GPT-4o Vision analyse votre image...' : 'GPT-4o Vision is analyzing your image...'}
            </Text>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <View style={styles.iconSection}>
              <Animated.View style={[styles.mainIcon, { transform: [{ scale: pulseAnim }] }]}>
                <Scan size={56} color={Colors.accent} />
              </Animated.View>
              <Text style={styles.subtitle}>{t('scanSubtitle')}</Text>
            </View>

            <View style={styles.buttonsSection}>
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => pickImage(true)}
                activeOpacity={0.8}
                testID="take-photo-btn"
              >
                <View style={[styles.optionIconBg, { backgroundColor: Colors.accentMuted }]}>
                  <Camera size={24} color={Colors.accent} />
                </View>
                <Text style={styles.optionText}>{t('takePhoto')}</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => pickImage(false)}
                activeOpacity={0.8}
                testID="gallery-btn"
              >
                <View style={[styles.optionIconBg, { backgroundColor: Colors.infoMuted }]}>
                  <ImagePlus size={24} color={Colors.info} />
                </View>
                <Text style={styles.optionText}>{t('chooseFromGallery')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
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
  optionsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  iconSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  mainIcon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  buttonsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
