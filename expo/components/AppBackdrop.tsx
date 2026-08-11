import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

/**
 * Ambient backdrop shared across CyrusGuard screens: a shadowed forest field
 * lit by the sentinel's emerald visor, framed by a hood-like vignette.
 */
export default function AppBackdrop(): React.ReactElement {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#04100A', '#0B2416', '#04100A']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.visorGlow} />
      <View style={styles.chromeSheen} />
      <View style={styles.deepGlow} />
      <LinearGradient
        colors={['rgba(2,8,5,0.55)', 'transparent', 'rgba(2,8,5,0.65)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  visorGlow: {
    position: 'absolute',
    top: -150,
    alignSelf: 'center' as const,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(47, 232, 107, 0.07)',
  },
  chromeSheen: {
    position: 'absolute',
    top: 90,
    right: -110,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(201, 214, 206, 0.028)',
  },
  deepGlow: {
    position: 'absolute',
    bottom: -160,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(47, 232, 107, 0.045)',
  },
});
