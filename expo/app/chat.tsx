import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Send, Shield, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { ChatMessage } from '@/mocks/scans';
import PaywallGate from '@/components/PaywallGate';
import AIDisclosureModal from '@/components/AIDisclosureModal';
import { sendChatMessage, cancelActiveRequests } from '@/services/openai';

export default function ChatScreen() {
  const router = useRouter();
  const { t, chatMessages, addChatMessage, canSendMessage, user, language, country, canChat, hasAcceptedAIDisclosure, acceptAIDisclosure } = useApp();
  const [input, setInput] = useState('');
  const [showDisclosure, setShowDisclosure] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: t('chatWelcome'),
    timestamp: new Date().toISOString(),
  };

  const allMessages = [welcomeMessage, ...chatMessages];

  const [isLoading, setIsLoading] = useState(false);
  const pendingAfterDisclosureRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cancelActiveRequests();
    };
  }, []);

  const doSendMessage = useCallback(async () => {
    if (!input.trim() || !canSendMessage || isLoading) return;

    const messageText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await sendChatMessage(messageText, history, language, country);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMsg);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.log('[Chat] Error:', error?.message);
      const isNetwork = error?.name === 'AbortError' || error?.message?.includes('timeout') || error?.message?.includes('Network');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isNetwork
          ? (language === 'fr' ? 'Connexion perdue. Vérifiez votre Internet et réessayez.' : 'Connection lost. Check your Internet and try again.')
          : (language === 'fr' ? 'Désolé, une erreur est survenue. Veuillez réessayer.' : 'Sorry, an error occurred. Please try again.'),
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMsg);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [input, canSendMessage, isLoading, addChatMessage, language, country, chatMessages]);

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
    if (!input.trim() || !canSendMessage || isLoading) return;
    if (!hasAcceptedAIDisclosure) {
      setShowDisclosure(true);
      return;
    }
    void doSendMessage();
  }, [input, canSendMessage, isLoading, hasAcceptedAIDisclosure, doSendMessage]);

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

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.titleSection}>
            <Text style={styles.topTitle}>{t('chatTitle')}</Text>
            {user.isPremium && (
              <Text style={styles.msgCount}>Premium</Text>
            )}
          </View>
          <View style={styles.backBtn} />
        </View>

        {!canChat && chatMessages.length === 0 ? (
          <PaywallGate type="chat" />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={allMessages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={0}
            >
              <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
                {!canSendMessage ? (
                  <View style={styles.limitBanner}>
                    <Lock size={16} color={Colors.warning} />
                    <Text style={styles.limitText}>
                      {language === 'fr' ? 'Limite atteinte. Passez à Premium pour des messages illimités.' : 'Limit reached. Upgrade to Premium for unlimited messages.'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={input}
                      onChangeText={setInput}
                      placeholder={t('chatPlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      maxLength={1000}
                      testID="chat-input"
                    />
                    <TouchableOpacity
                      style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
                      onPress={sendMessage}
                      disabled={!input.trim() || isLoading}
                      testID="send-btn"
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.textMuted} />
                      ) : (
                        <Send size={18} color={input.trim() ? Colors.background : Colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </SafeAreaView>
            </KeyboardAvoidingView>
          </>
        )}
        <AIDisclosureModal visible={showDisclosure} onAccept={handleDisclosureAccept} />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  msgCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageBubble: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 14,
  },
  userContent: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
    marginLeft: 'auto' as const,
  },
  aiContent: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.background,
  },
  inputSafe: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surface,
  },
  limitBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.warningMuted,
    margin: 12,
    borderRadius: 12,
  },
  limitText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
});
