import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';
import GuardianMark from '@/components/GuardianMark';

interface GuardianHeroProps {
  size?: number;
  markSize?: number;
  scanning?: boolean;
}

/** Radar-like presentation for the CyrusGuard guardian mark. */
export default function GuardianHero({
  size = 250,
  markSize = 164,
  scanning = true,
}: GuardianHeroProps): React.ReactElement {
  const center = size / 2;
  const ringSizes: number[] = [size, size * 0.78, size * 0.58];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {ringSizes.map((ringSize: number, index: number) => (
        <View
          key={ringSize}
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              left: center - ringSize / 2,
              top: center - ringSize / 2,
              opacity: 0.34 + index * 0.13,
            },
          ]}
        />
      ))}
      <View style={[styles.crossHorizontal, { top: center }]} />
      <View style={[styles.crossVertical, { left: center }]} />
      <View style={[styles.node, styles.nodeLeft, { top: center - 2 }]} />
      <View style={[styles.node, styles.nodeRight, { top: center - 2 }]} />
      <View style={styles.logoGlow} />
      <View style={[styles.mark, { left: center - markSize / 2, top: center - markSize / 2 }]}>
        <GuardianMark size={markSize} glow scanning={scanning} presentation="hero" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  crossHorizontal: {
    position: 'absolute',
    left: -24,
    right: -24,
    height: 1,
    backgroundColor: 'rgba(47,232,107,0.42)',
    shadowColor: Colors.accent,
    shadowOpacity: 0.65,
    shadowRadius: 7,
  },
  crossVertical: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 1,
    backgroundColor: 'rgba(47,232,107,0.08)',
  },
  node: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  nodeLeft: { left: 14 },
  nodeRight: { right: 14 },
  logoGlow: {
    position: 'absolute',
    width: '62%',
    height: '62%',
    left: '19%',
    top: '19%',
    borderRadius: 999,
    backgroundColor: 'rgba(20, 238, 102, 0.075)',
  },
  mark: {
    position: 'absolute',
  },
});
