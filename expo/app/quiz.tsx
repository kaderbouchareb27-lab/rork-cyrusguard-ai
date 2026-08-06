import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Home, Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import AppBackdrop from '@/components/AppBackdrop';
import GuardianMark from '@/components/GuardianMark';
import { quizQuestions } from '@/mocks/scans';

export default function QuizScreen() {
  const router = useRouter();
  const { t, language } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const finishScaleAnim = useRef(new Animated.Value(0.5)).current;
  const finishOpacityAnim = useRef(new Animated.Value(0)).current;

  const question = quizQuestions[currentQuestion];
  const totalQuestions = quizQuestions.length;

  const handleAnswer = useCallback((index: number) => {
    if (showExplanation) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    const isCorrect = question?.options[index]?.isCorrect ?? false;
    if (isCorrect) {
      setScore(prev => prev + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [showExplanation, question, feedbackAnim]);

  const handleNext = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      feedbackAnim.setValue(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentQuestion(prev => prev + 1);

      Animated.timing(progressAnim, {
        toValue: (currentQuestion + 1) / totalQuestions,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setFinished(true);
      Animated.parallel([
        Animated.spring(finishScaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.timing(finishOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [currentQuestion, totalQuestions, feedbackAnim, progressAnim, finishScaleAnim, finishOpacityAnim]);

  const handleRetry = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setFinished(false);
    feedbackAnim.setValue(0);
    progressAnim.setValue(0);
    finishScaleAnim.setValue(0.5);
    finishOpacityAnim.setValue(0);
  }, [feedbackAnim, progressAnim, finishScaleAnim, finishOpacityAnim]);

  const getScoreMessage = useCallback(() => {
    const pct = score / totalQuestions;
    if (pct >= 0.8) return t('quizPerfect');
    if (pct >= 0.5) return t('quizGood');
    return t('quizNeedsWork');
  }, [score, totalQuestions, t]);

  const getScoreColor = useCallback(() => {
    const pct = score / totalQuestions;
    if (pct >= 0.8) return Colors.accent;
    if (pct >= 0.5) return Colors.warning;
    return Colors.danger;
  }, [score, totalQuestions]);

  if (finished) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <AppBackdrop />
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.finishContainer, { opacity: finishOpacityAnim, transform: [{ scale: finishScaleAnim }] }]}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
              <Text style={[styles.scoreNumber, { color: getScoreColor() }]}>{score}/{totalQuestions}</Text>
              <Text style={styles.scoreLabel}>{t('quizScore')}</Text>
            </View>
            <Award size={40} color={getScoreColor()} style={styles.awardIcon} />
            <Text style={styles.finishTitle}>{t('quizFinished')}</Text>
            <Text style={styles.finishMessage}>{getScoreMessage()}</Text>

            <View style={styles.finishActions}>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
                <RotateCcw size={18} color={Colors.textPrimary} />
                <Text style={styles.retryBtnText}>{t('quizRetry')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeBtn} onPress={() => router.back()} activeOpacity={0.8}>
                <Home size={18} color={Colors.background} />
                <Text style={styles.homeBtnText}>{t('quizBackHome')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  if (!question) return null;

  const questionText = language === 'fr' ? question.questionFr : question.questionEn;
  const explanationText = language === 'fr' ? question.explanationFr : question.explanationEn;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('quizTitle')}</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{currentQuestion + 1}/{totalQuestions}</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.questionCard}>
            <GuardianMark size={48} glow />
            <Text style={styles.questionText}>{questionText}</Text>
          </View>

          <View style={styles.optionsList}>
            {question.options.map((option, idx) => {
              const optText = language === 'fr' ? option.fr : option.en;
              const isSelected = selectedAnswer === idx;
              const isCorrect = option.isCorrect;
              let optionStyle = styles.optionDefault;
              let textStyle = styles.optionTextDefault;

              if (showExplanation) {
                if (isCorrect) {
                  optionStyle = styles.optionCorrect;
                  textStyle = styles.optionTextCorrect;
                } else if (isSelected && !isCorrect) {
                  optionStyle = styles.optionWrong;
                  textStyle = styles.optionTextWrong;
                }
              } else if (isSelected) {
                optionStyle = styles.optionSelected;
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionBtn, optionStyle]}
                  onPress={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                  testID={`quiz-option-${idx}`}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLetter, showExplanation && isCorrect && styles.optionLetterCorrect]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                    <Text style={[styles.optionText, textStyle]}>{optText}</Text>
                  </View>
                  {showExplanation && isCorrect && <CheckCircle size={20} color={Colors.accent} />}
                  {showExplanation && isSelected && !isCorrect && <XCircle size={20} color={Colors.danger} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <Animated.View style={[styles.explanationCard, { opacity: feedbackAnim, transform: [{ translateY: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={styles.explanationHeader}>
                {question.options[selectedAnswer ?? 0]?.isCorrect ? (
                  <CheckCircle size={18} color={Colors.accent} />
                ) : (
                  <XCircle size={18} color={Colors.danger} />
                )}
                <Text style={[styles.explanationBadge, { color: question.options[selectedAnswer ?? 0]?.isCorrect ? Colors.accent : Colors.danger }]}>
                  {question.options[selectedAnswer ?? 0]?.isCorrect ? t('quizCorrect') : t('quizIncorrect')}
                </Text>
              </View>
              <Text style={styles.explanationText}>{explanationText}</Text>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8} testID="quiz-next">
                <Text style={styles.nextBtnText}>
                  {currentQuestion < totalQuestions - 1 ? t('quizNext') : t('quizFinished')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
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
  backBtn: {
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
  counterBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  questionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionContent: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    textAlign: 'center' as const,
    lineHeight: 28,
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    overflow: 'hidden' as const,
  },
  optionLetterCorrect: {
    backgroundColor: Colors.accentMuted,
    color: Colors.accent,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  optionDefault: {},
  optionSelected: {
    borderColor: Colors.info,
    backgroundColor: Colors.infoMuted,
  },
  optionCorrect: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  optionWrong: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerMuted,
  },
  optionTextDefault: {},
  optionTextCorrect: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  optionTextWrong: {
    color: Colors.danger,
  },
  explanationCard: {
    marginTop: 20,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  explanationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  explanationBadge: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  finishContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  awardIcon: {
    marginBottom: 16,
  },
  finishTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  finishMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 36,
  },
  finishActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  retryBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  homeBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
