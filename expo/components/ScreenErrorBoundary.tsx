import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RotateCcw, WifiOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

export default class ScreenErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError =
      error.message?.includes('Network') ||
      error.message?.includes('fetch') ||
      error.message?.includes('timeout') ||
      error.message?.includes('AbortError');
    return { hasError: true, error, isNetworkError };
  }

  componentDidCatch(error: Error, _info: React.ErrorInfo) {
    console.log('[ScreenErrorBoundary]', error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isNetworkError: false });
  };

  render() {
    if (this.state.hasError) {
      const { isNetworkError } = this.state;
      const Icon = isNetworkError ? WifiOff : AlertTriangle;
      const iconColor = isNetworkError ? Colors.warning : Colors.danger;

      return (
        <View style={styles.container}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
            <Icon size={32} color={iconColor} />
          </View>
          <Text style={styles.title}>
            {isNetworkError ? 'Connexion perdue' : 'Oops!'}
          </Text>
          <Text style={styles.message}>
            {isNetworkError
              ? 'Veuillez vérifier votre connexion Internet et réessayer.\nPlease check your Internet connection and try again.'
              : this.props.fallbackMessage ?? 'Une erreur est survenue. Veuillez réessayer.\nAn error occurred. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={this.handleRetry}
            activeOpacity={0.8}
            testID="error-retry-btn"
          >
            <RotateCcw size={16} color={Colors.background} />
            <Text style={styles.retryText}>Réessayer / Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
