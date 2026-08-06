import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Decorative dark-green ambient background shared across CyrusGuard screens. */
export default function AppBackdrop(): React.ReactElement {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#06110D', '#0C2619', '#06110D']}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  topGlow: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(73, 209, 125, 0.055)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -140,
    left: -95,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(101, 181, 255, 0.035)',
  },
});
