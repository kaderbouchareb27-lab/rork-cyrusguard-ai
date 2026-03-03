import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.log('[Layout] SplashScreen.preventAutoHideAsync error:', e);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="result" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="scan-chat" />
      <Stack.Screen name="url-analyze" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="faq-page" />
      <Stack.Screen name="about" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="manage-subscription" />
      <Stack.Screen name="quiz" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log('[ErrorBoundary] Caught error:', error.message, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Oops!</Text>
          <Text style={errorStyles.message}>{this.state.error?.message ?? 'Unknown error'}</Text>
          <Text
            style={errorStyles.retry}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            Réessayer / Retry
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.danger, marginBottom: 12 },
  message: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const, marginBottom: 20, lineHeight: 20 },
  retry: { fontSize: 16, fontWeight: '600' as const, color: Colors.accent, padding: 12 },
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.hideAsync();
        console.log('[Layout] SplashScreen hidden successfully');
      } catch (e) {
        console.log('[Layout] SplashScreen.hideAsync error:', e);
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </AppProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
