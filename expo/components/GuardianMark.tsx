import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';

interface GuardianMarkProps {
  size?: number;
  /** Adds the emerald halo behind the mark. */
  glow?: boolean;
  /** Sweeps a scanner beam across the visor. */
  scanning?: boolean;
  /** Hero mode removes the tile-like frame so the mark blends into the radar. */
  presentation?: 'tile' | 'hero';
}

/**
 * The CyrusGuard hooded-sentinel mark: chrome-edged frame, emerald halo and
 * an optional scanning beam. Single source of truth for the brand logo.
 */
export default function GuardianMark({
  size = 44,
  glow = false,
  scanning = false,
  presentation = 'tile',
}: GuardianMarkProps): React.ReactElement {
  const radius = Math.round(size * 0.28);
  const beam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beam, { toValue: 1, duration: 1900, useNativeDriver: true }),
        Animated.timing(beam, { toValue: 0, duration: 1900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanning, beam]);

  const beamTranslate = beam.interpolate({
    inputRange: [0, 1],
    outputRange: [size * 0.16, size * 0.82],
  });

  return (
    <View style={[glow && styles.halo, { width: size, height: size, borderRadius: radius }]}>
      <View
        style={[
          styles.frame,
          presentation === 'hero' && styles.heroFrame,
          {
            width: size,
            height: size,
            borderRadius: presentation === 'hero' ? size / 2 : radius,
            borderWidth: presentation === 'hero' ? 0 : Math.max(1, size * 0.018),
          },
        ]}
      >
        <Image
          source={require('@/assets/images/logo-mark.png')}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: presentation === 'hero' ? size / 2 : Math.max(2, radius - 2),
          }}
          resizeMode="cover"
        />
        {scanning && (
          <Animated.View
            style={[
              styles.beam,
              { transform: [{ translateY: beamTranslate }] },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 12,
  },
  frame: {
    overflow: 'hidden' as const,
    backgroundColor: Colors.background,
    borderColor: Colors.chromeEdge,
  },
  heroFrame: {
    backgroundColor: 'transparent',
  },
  beam: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    height: 1.5,
    backgroundColor: Colors.accentLight,
    opacity: 0.85,
    shadowColor: Colors.accent,
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
});
