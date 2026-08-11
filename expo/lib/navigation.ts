import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

/**
 * Returns a back handler that never dispatches GO_BACK on an empty stack.
 * When there is no previous screen (deep link, mandatory paywall redirect,
 * cold start on a nested route), it replaces the route with a safe fallback:
 * the paywall when no subscription is active, otherwise the provided fallback.
 */
export function useSafeBack(fallback: string = '/(tabs)/(home)'): () => void {
  const router = useRouter();
  const { needsPaywall } = useApp();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace((needsPaywall ? '/subscribe' : fallback) as never);
  }, [fallback, needsPaywall, router]);
}
