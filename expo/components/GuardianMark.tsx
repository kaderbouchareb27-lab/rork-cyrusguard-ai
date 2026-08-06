import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';

interface GuardianMarkProps {
  size?: number;
  glow?: boolean;
}

/** CyrusGuard's robot-C scanner mark, used as the visual signature throughout the app. */
export default function GuardianMark({ size = 44, glow = false }: GuardianMarkProps): React.ReactElement {
  const radius = Math.round(size * 0.29);

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: radius,
          padding: Math.max(2, Math.round(size * 0.045)),
        },
        glow && styles.glow,
      ]}
    >
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: '100%', height: '100%', borderRadius: Math.max(2, radius - 3) }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: 'rgba(73, 209, 125, 0.12)',
    borderWidth: 1,
    borderColor: Colors.accentGlow,
  },
  glow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 7,
  },
});
