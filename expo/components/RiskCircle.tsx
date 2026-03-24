import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/colors';
import type { RiskLevel } from '@/mocks/scans';

interface RiskCircleProps {
  score: number;
  level: RiskLevel;
  levelLabel: string;
  size?: number;
  animated?: boolean;
}

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'high': return Colors.danger;
    case 'medium': return Colors.warning;
    case 'low': return Colors.accent;
  }
};

const getRiskBgColor = (level: RiskLevel): string => {
  switch (level) {
    case 'high': return Colors.dangerMuted;
    case 'medium': return Colors.warningMuted;
    case 'low': return Colors.accentMuted;
  }
};

export default function RiskCircle({ score, level, levelLabel, size = 180, animated = true }: RiskCircleProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const color = getRiskColor(level);
  const bgColor = getRiskBgColor(level);

  const strokeWidth = size * 0.06;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const [displayScore, setDisplayScore] = React.useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = React.useState(circumference);

  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);

      const listener = animatedValue.addListener(({ value }) => {
        const progress = value / 100;
        setStrokeDashoffset(circumference * (1 - progress));
        setDisplayScore(Math.round(value));
      });

      const anim = Animated.timing(animatedValue, {
        toValue: score,
        duration: 1500,
        useNativeDriver: false,
      });
      anim.start();

      return () => {
        anim.stop();
        animatedValue.removeListener(listener);
      };
    } else {
      const progress = score / 100;
      setStrokeDashoffset(circumference * (1 - progress));
      setDisplayScore(score);
    }
  }, [score, animated, circumference, animatedValue]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[styles.innerCircle, {
        width: size - strokeWidth * 4,
        height: size - strokeWidth * 4,
        borderRadius: (size - strokeWidth * 4) / 2,
        backgroundColor: bgColor,
      }]}>
        <Text style={[styles.scoreText, { color, fontSize: size * 0.28 }]}>
          {displayScore}
        </Text>
        <Text style={[styles.levelText, { color, fontSize: size * 0.1 }]}>
          {levelLabel}
        </Text>
      </View>
      <View style={[styles.glowDot, {
        backgroundColor: color,
        top: strokeWidth / 2 - 4,
        left: size / 2 - 4,
        shadowColor: color,
        opacity: displayScore > 0 ? 1 : 0,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  svg: {
    position: 'absolute' as const,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  levelText: {
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginTop: 4,
  },
  glowDot: {
    position: 'absolute' as const,
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
