import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import ScreenErrorBoundary from '@/components/ScreenErrorBoundary';

export default function PremiumLayout() {
  return (
    <ScreenErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </ScreenErrorBoundary>
  );
}
