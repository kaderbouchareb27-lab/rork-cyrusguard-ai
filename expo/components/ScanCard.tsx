import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, MessageSquare, Globe, Link, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { ScanResult, RiskLevel } from '@/mocks/scans';
import { useApp } from '@/contexts/AppContext';

interface ScanCardProps {
  scan: ScanResult;
  onPress: () => void;
}

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'high': return Colors.danger;
    case 'medium': return Colors.warning;
    case 'low': return Colors.accent;
  }
};

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'sms': return MessageSquare;
    case 'email': return Mail;
    case 'website': return Globe;
    case 'url': return Link;
    default: return Globe;
  }
};

export default React.memo(function ScanCard({ scan, onPress }: ScanCardProps) {
  const { language, t } = useApp();
  const color = getRiskColor(scan.riskLevel);
  const Icon = getSourceIcon(scan.sourceType);
  const summary = language === 'en' ? scan.summaryEn : scan.summary;
  const levelLabel = t(`risk${scan.riskLevel.charAt(0).toUpperCase() + scan.riskLevel.slice(1)}`);

  const date = new Date(scan.date);
  const formattedDate = date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
      testID={`scan-card-${scan.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.sourceType}>{scan.sourceType.toUpperCase()}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.scoreText, { color }]}>{scan.riskScore}</Text>
          </View>
        </View>
        <Text style={styles.summary} numberOfLines={2}>{summary}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={[styles.level, { color }]}>{levelLabel}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceType: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
  summary: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  level: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
