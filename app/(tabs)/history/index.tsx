import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import ScanCard from '@/components/ScanCard';
import type { RiskLevel, ScanResult } from '@/mocks/scans';

type FilterType = 'all' | RiskLevel;

export default function HistoryScreen() {
  const { t, scans } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: t('filterAll'), color: Colors.textPrimary },
    { key: 'low', label: t('filterLow'), color: Colors.accent },
    { key: 'medium', label: t('filterMedium'), color: Colors.warning },
    { key: 'high', label: t('filterHigh'), color: Colors.danger },
  ];

  const filteredScans = useMemo(() => {
    if (filter === 'all') return scans;
    return scans.filter(s => s.riskLevel === filter);
  }, [scans, filter]);

  const handleScanPress = useCallback((scan: ScanResult) => {
    router.push({ pathname: '/result' as any, params: { scanId: scan.id } });
  }, [router]);

  const renderItem = useCallback(({ item }: { item: ScanResult }) => (
    <ScanCard scan={item} onPress={() => handleScanPress(item)} />
  ), [handleScanPress]);

  const keyExtractor = useCallback((item: ScanResult) => item.id, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('historyTitle')}</Text>
          <Text style={styles.count}>{filteredScans.length}</Text>
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && { backgroundColor: f.color + '20', borderColor: f.color },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                filter === f.key && { color: f.color },
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredScans}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('historyEmpty')}</Text>
              <Text style={styles.emptyDesc}>{t('historyEmptyDesc')}</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  count: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  filterRow: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
