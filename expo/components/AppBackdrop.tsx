import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Line, Path, Pattern, Rect } from 'react-native-svg';

/**
 * Global CyrusGuard cyber backdrop. The watermark, scanner grid and circuit
 * traces keep every screen visually tied to the guardian identity.
 */
export default function AppBackdrop(): React.ReactElement {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#010906', '#03140D', '#020B08', '#000604']}
        locations={[0, 0.34, 0.72, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="microGrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <Path d="M 22 0 L 0 0 0 22" fill="none" stroke="#21F277" strokeOpacity="0.045" strokeWidth="0.45" />
          </Pattern>
        </Defs>
        <Rect width="390" height="844" fill="url(#microGrid)" opacity="0.62" />
        <Path d="M0 185 H42 L55 198 H91 L105 184 H142" fill="none" stroke="#22F078" strokeOpacity="0.10" strokeWidth="0.8" />
        <Circle cx="143" cy="184" r="2" fill="#2CFF86" fillOpacity="0.28" />
        <Path d="M390 238 H345 L332 225 H296 L283 239 H248" fill="none" stroke="#22F078" strokeOpacity="0.11" strokeWidth="0.8" />
        <Circle cx="247" cy="239" r="2" fill="#2CFF86" fillOpacity="0.3" />
        <Path d="M0 482 H52 L65 468 H106 L121 484 H151" fill="none" stroke="#22F078" strokeOpacity="0.08" strokeWidth="0.8" />
        <Path d="M390 594 H344 L331 608 H293 L277 592 H246" fill="none" stroke="#22F078" strokeOpacity="0.08" strokeWidth="0.8" />
        <Line x1="22" y1="300" x2="98" y2="300" stroke="#2CFF86" strokeOpacity="0.07" />
        <Line x1="291" y1="354" x2="372" y2="354" stroke="#2CFF86" strokeOpacity="0.07" />
      </Svg>

      <View style={styles.topGlow} />
      <View style={styles.midGlow} />
      <Image source={require('@/assets/images/logo-mark.png')} style={styles.watermark} resizeMode="contain" />
      <LinearGradient
        colors={['rgba(0,4,3,0.36)', 'transparent', 'rgba(0,3,2,0.72)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.edgeLeft} />
      <View style={styles.edgeRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  topGlow: {
    position: 'absolute',
    top: -170,
    alignSelf: 'center',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(22, 232, 104, 0.055)',
  },
  midGlow: {
    position: 'absolute',
    top: 250,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(12, 121, 62, 0.035)',
  },
  watermark: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    width: 330,
    height: 330,
    opacity: 0.055,
  },
  edgeLeft: {
    position: 'absolute',
    left: 0,
    top: 128,
    bottom: 100,
    width: 1,
    backgroundColor: 'rgba(47,232,107,0.08)',
  },
  edgeRight: {
    position: 'absolute',
    right: 0,
    top: 210,
    bottom: 60,
    width: 1,
    backgroundColor: 'rgba(47,232,107,0.06)',
  },
});
