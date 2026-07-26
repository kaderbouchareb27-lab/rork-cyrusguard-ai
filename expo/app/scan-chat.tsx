import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Send, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { ChatMessage } from '@/mocks/scans';
import PaywallGate from '@/components/PaywallGate';
import AIDisclosureModal from '@/components/AIDisclosureModal';
import { sendScanChatMessage } from '@/services/openai';

export default function ScanChatScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { t, scans, language, country, canUseFeature, hasAcceptedAIDisclosure, acceptAIDisclosure } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showDisclosure, setShowDisclosure] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pendingAfterDisclosureRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const scan = useMemo(() => scans.find(s => s.id === scanId), [scans, scanId]);

  const contextMessage: ChatMessage = {
    id: 'context',
    role: 'assistant',
    content: language === 'fr'
      ? `Je suis prêt à discuter de ce scan (score de risque: ${scan?.riskScore ?? 0}/100). Posez-moi vos questions sur ce résultat.`
      : `I'm ready to discuss this scan (risk score: ${scan?.riskScore ?? 0}/100). Ask me any questions about this result.`,
    timestamp: new Date().toISOString(),
  };

  const allMessages = [contextMessage, ...messages];

  const doSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const scanContext = {
        riskScore: scan?.riskScore ?? 0,
        riskLevel: scan?.riskLevel ?? 'low',
        sourceType: scan?.sourceType ?? 'sms',
        summary: language === 'en' ? (scan?.summaryEn ?? '') : (scan?.summary ?? ''),
        suspiciousElements: language === 'en' ? (scan?.suspiciousElementsEn ?? []) : (scan?.suspiciousElements ?? []),
        reassuringElements: language === 'en' ? (scan?.reassuringElementsEn ?? []) : (scan?.reassuringElements ?? []),
        advice: language === 'en' ? (scan?.adviceEn ?? []) : (scan?.advice ?? []),
      };

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await sendScanChatMessage(messageText, scanContext, history, language, country);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.log('[ScanChat] Error:', error?.message);
      const isNetwork = error?.name === 'AbortError' || error?.message?.includes('timeout') || error?.message?.includes('Network');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isNetwork
          ? (language === 'fr' ? 'Connexion perdue. Vérifiez votre Internet et réessayez.' : 'Connection lost. Check your Internet and try again.')
          : (language === 'fr' ? 'Désolé, une erreur est survenue. Veuillez réessayer.' : 'Sorry, an error occurred. Please try again.'),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [input, isLoading, language, country, scan, messages]);

  const handleDisclosureAccept = useCallback(() => {
    void acceptAIDisclosure();
    setShowDisclosure(false);
    pendingAfterDisclosureRef.current = true;
  }, [acceptAIDisclosure]);

  useEffect(() => {
    if (pendingAfterDisclosureRef.current && hasAcceptedAIDisclosure) {
      pendingAfterDisclosureRef.current = false;
      void doSendMessage();
    }
  }, [hasAcceptedAIDisclosure, doSendMessage]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || isLoading) return;
    if (!hasAcceptedAIDisclosure) {
      setShowDisclosure(true);
      return;
    }
    void doSendMessage();
  }, [input, isLoading, hasAcceptedAIDisclosure, doSendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Shield size={14} color={Colors.accent} />
          </View>
        )}
        <View style={[styles.bubbleContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('scanChat')}</Text>
          <View style={styles.backBtn} />
        </View>

        {!canUseFeature ? (
          <PaywallGate type="scan-chat" />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={allMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={t('scanChatPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.textMuted} />
                ) : (
                  <Send size={18} color={input.trim() ? Colors.background : Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
            </KeyboardAvoidingView>
          </>
        )}
        <AIDisclosureModal visible={showDisclosure} onAccept={handleDisclosureAccept} onDecline={() => setShowDisclosure(false)} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  messageBubble: { flexDirection: 'row' as const, alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.accentMuted, alignItems: 'center', justifyContent: 'center',
  },
  bubbleContent: { maxWidth: '75%', borderRadius: 16, padding: 14 },
  userContent: { backgroundColor: Colors.accent, borderBottomRightRadius: 4, marginLeft: 'auto' as const },
  aiContent: { backgroundColor: Colors.backgroundCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  messageText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  userMessageText: { color: Colors.background },
  inputSafe: { borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background },
  inputRow: { flexDirection: 'row' as const, alignItems: 'flex-end', padding: 12, gap: 10 },
  input: {
    flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: Colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surface },
});
