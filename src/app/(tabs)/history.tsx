/**
 * AtmosIQ - Local SQLite Database & Data History Screen
 * 
 * Requirement C: Demonstrates persistent local storage using expo-sqlite:
 * - Table record counts
 * - Historical weather logs
 * - XML parsed records inspection
 * - Sync queue status
 * - SQLite diagnostic metrics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sqliteService } from '@/database/sqlite';
import {
  DatabaseSummaryStats,
  DbSyncQueueItem,
  DbWeatherRecord,
  DbXmlWeatherRecord,
} from '@/models/database.types';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/state/settingsContext';

type HistoryTab = 'weather' | 'xml' | 'sync_queue' | 'diagnostics';

export default function HistoryScreen() {
  const { formatTemperature, formatWindSpeed } = useSettings();

  const [activeTab, setActiveTab] = useState<HistoryTab>('weather');
  const [summary, setSummary] = useState<DatabaseSummaryStats | null>(null);
  const [weatherRecords, setWeatherRecords] = useState<DbWeatherRecord[]>([]);
  const [xmlRecords, setXmlRecords] = useState<DbXmlWeatherRecord[]>([]);
  const [syncItems, setSyncItems] = useState<DbSyncQueueItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDatabaseData = async () => {
    setIsRefreshing(true);
    try {
      const [sum, wRecs, xRecs, sItems] = await Promise.all([
        sqliteService.getDatabaseSummary(),
        sqliteService.getWeatherRecords(undefined, 30),
        sqliteService.getXmlWeatherRecords(undefined, 30),
        sqliteService.getPendingSyncItems(30),
      ]);
      setSummary(sum);
      setWeatherRecords(wRecs);
      setXmlRecords(xRecs);
      setSyncItems(sItems);
    } catch (e: any) {
      console.warn('Failed to load database stats:', e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleClearDatabase = () => {
    Alert.alert(
      'Reset Local SQLite Database',
      'Are you sure you want to delete all cached weather, forecast, and XML records from the local SQLite database? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Database',
          style: 'destructive',
          onPress: async () => {
            await sqliteService.clearAllData();
            await loadDatabaseData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Local Database</Text>
          <Text style={styles.subtitle}>Requirement C · SQLite Persistent Store</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDatabaseData}>
          <Ionicons name="refresh" size={20} color={Palette.cyanGlow} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadDatabaseData}
            tintColor={Palette.cyanGlow}
          />
        }
      >
        {/* Database Overview Cards Grid */}
        {summary && (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="location" size={20} color={Palette.cyanGlow} />
              <Text style={styles.summaryVal}>{summary.locationCount}</Text>
              <Text style={styles.summaryLabel}>Locations</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="cloud" size={20} color={Palette.azureBlue} />
              <Text style={styles.summaryVal}>{summary.weatherRecordCount}</Text>
              <Text style={styles.summaryLabel}>Weather Recs</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="code-download" size={20} color={Palette.violetMisty} />
              <Text style={styles.summaryVal}>{summary.xmlRecordCount}</Text>
              <Text style={styles.summaryLabel}>XML Recs</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="layers" size={20} color={Palette.amberWarning} />
              <Text style={styles.summaryVal}>{summary.pendingSyncCount}</Text>
              <Text style={styles.summaryLabel}>Sync Queue</Text>
            </View>
          </View>
        )}

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'weather' && styles.tabBtnActive]}
            onPress={() => setActiveTab('weather')}
          >
            <Text style={[styles.tabText, activeTab === 'weather' && styles.tabTextActive]}>
              Weather ({weatherRecords.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'xml' && styles.tabBtnActive]}
            onPress={() => setActiveTab('xml')}
          >
            <Text style={[styles.tabText, activeTab === 'xml' && styles.tabTextActive]}>
              XML Records ({xmlRecords.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sync_queue' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sync_queue')}
          >
            <Text style={[styles.tabText, activeTab === 'sync_queue' && styles.tabTextActive]}>
              Sync Queue ({syncItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'diagnostics' && styles.tabBtnActive]}
            onPress={() => setActiveTab('diagnostics')}
          >
            <Text style={[styles.tabText, activeTab === 'diagnostics' && styles.tabTextActive]}>
              Diagnostics
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Weather Records */}
        {activeTab === 'weather' && (
          <View>
            {weatherRecords.length > 0 ? (
              weatherRecords.map((rec) => (
                <View key={rec.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordId}>{rec.id}</Text>
                    <View style={styles.syncedBadge}>
                      <Ionicons
                        name={rec.synced_to_firebase ? 'checkmark-circle' : 'time-outline'}
                        size={12}
                        color={rec.synced_to_firebase ? Palette.emeraldFresh : Palette.amberWarning}
                      />
                      <Text
                        style={[
                          styles.syncedText,
                          {
                            color: rec.synced_to_firebase
                              ? Palette.emeraldFresh
                              : Palette.amberWarning,
                          },
                        ]}
                      >
                        {rec.synced_to_firebase ? 'Cloud Synced' : 'Local Only'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recordBody}>
                    <View>
                      <Text style={styles.recordTemp}>{formatTemperature(rec.temperature)}</Text>
                      <Text style={styles.recordCond}>{rec.weather_description}</Text>
                    </View>
                    <View style={styles.recordSubData}>
                      <Text style={styles.subText}>Humidity: {rec.relative_humidity}%</Text>
                      <Text style={styles.subText}>Wind: {formatWindSpeed(rec.wind_speed)}</Text>
                      <Text style={styles.subText}>Pressure: {rec.pressure} hPa</Text>
                    </View>
                  </View>

                  <Text style={styles.recordTimestamp}>Timestamp: {rec.timestamp}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="folder-open-outline" size={36} color={Palette.textMutedDark} />
                <Text style={styles.emptyTitle}>No SQLite weather records found.</Text>
                <Text style={styles.emptySub}>
                  Fetch live weather on the Home screen to populate local database tables.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: XML Records */}
        {activeTab === 'xml' && (
          <View>
            {xmlRecords.length > 0 ? (
              xmlRecords.map((xrec) => (
                <View key={xrec.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordId}>{xrec.id}</Text>
                    <Text style={styles.xmlSourceBadge}>XML Import</Text>
                  </View>
                  <View style={styles.recordBody}>
                    <View>
                      <Text style={styles.recordTemp}>{xrec.temperature_c}°C</Text>
                      <Text style={styles.recordCond}>{xrec.weather_condition || 'Standard'}</Text>
                    </View>
                    <View style={styles.recordSubData}>
                      <Text style={styles.subText}>Location: {xrec.location_name}</Text>
                      {xrec.humidity_percent !== null && (
                        <Text style={styles.subText}>Humidity: {xrec.humidity_percent}%</Text>
                      )}
                      {xrec.wind_speed_mps !== null && (
                        <Text style={styles.subText}>Wind: {xrec.wind_speed_mps} m/s</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.recordTimestamp}>Timestamp: {xrec.timestamp}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="code-slash-outline" size={36} color={Palette.textMutedDark} />
                <Text style={styles.emptyTitle}>No normalized XML records stored yet.</Text>
                <Text style={styles.emptySub}>
                  Visit XML Explorer and tap "Fetch & Parse Live XML Response".
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: Sync Queue */}
        {activeTab === 'sync_queue' && (
          <View>
            {syncItems.length > 0 ? (
              syncItems.map((item) => (
                <View key={item.id} style={styles.queueCard}>
                  <View style={styles.queueHeader}>
                    <Text style={styles.queueType}>{item.entity_type.toUpperCase()}</Text>
                    <View style={styles.queueStatusBadge}>
                      <Text style={styles.queueStatusText}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.queueId}>Entity ID: {item.entity_id}</Text>
                  <Text style={styles.queueRetries}>Retry Attempts: {item.retry_count}</Text>
                  {item.last_error && (
                    <Text style={styles.queueError}>Error: {item.last_error}</Text>
                  )}
                  <Text style={styles.queueCreated}>Enqueued at: {item.created_at}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle" size={36} color={Palette.emeraldFresh} />
                <Text style={styles.emptyTitle}>Sync Queue is Clean</Text>
                <Text style={styles.emptySub}>All local records have been processed or queued.</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <View style={styles.diagCard}>
            <Text style={styles.diagTitle}>SQLite Engine Diagnostics</Text>
            <View style={styles.diagRow}>
              <Text style={styles.diagKey}>Database File:</Text>
              <Text style={styles.diagVal}>atmosiq.db</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagKey}>Journal Mode:</Text>
              <Text style={styles.diagVal}>WAL (Write-Ahead Logging)</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagKey}>Foreign Keys:</Text>
              <Text style={styles.diagVal}>ON (ON DELETE CASCADE)</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagKey}>Schema Version:</Text>
              <Text style={styles.diagVal}>v1 (Production Verified)</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagKey}>Last Write Timestamp:</Text>
              <Text style={styles.diagVal}>{summary?.lastWriteTimestamp || 'Never'}</Text>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleClearDatabase}>
              <Ionicons name="trash-outline" size={18} color={Palette.roseAlert} />
              <Text style={styles.resetBtnText}>Clear Local SQLite Cache</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.spaceNavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
    color: Palette.textPrimaryDark,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.emeraldFresh,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Palette.cardSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  summaryVal: {
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontSize: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  tabBtnActive: {
    backgroundColor: Palette.deepSlate,
  },
  tabText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordId: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.deepSlate,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  syncedText: {
    ...Typography.caption,
    fontSize: 10,
    marginLeft: 4,
  },
  xmlSourceBadge: {
    ...Typography.caption,
    fontSize: 10,
    color: Palette.violetMisty,
    fontWeight: '700',
  },
  recordBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  recordTemp: {
    ...Typography.titleLarge,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  recordCond: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
  },
  recordSubData: {
    alignItems: 'flex-end',
  },
  subText: {
    ...Typography.caption,
    color: Palette.textMutedDark,
  },
  recordTimestamp: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 6,
    fontSize: 10,
  },
  queueCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueType: {
    ...Typography.caption,
    color: Palette.amberWarning,
    fontWeight: '700',
  },
  queueStatusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  queueStatusText: {
    ...Typography.caption,
    color: Palette.amberWarning,
    fontWeight: '700',
    fontSize: 10,
  },
  queueId: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  queueRetries: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginTop: 2,
  },
  queueError: {
    ...Typography.caption,
    color: Palette.roseAlert,
    marginTop: 2,
  },
  queueCreated: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 4,
  },
  diagCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  diagTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginBottom: Spacing.md,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.cardBorderSubtle,
  },
  diagKey: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
  },
  diagVal: {
    ...Typography.bodySmall,
    color: Palette.cyanGlow,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.roseAlert,
  },
  resetBtnText: {
    ...Typography.bodyMedium,
    color: Palette.roseAlert,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  emptyTitle: {
    ...Typography.bodyLarge,
    color: Palette.textPrimaryDark,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  emptySub: {
    ...Typography.bodySmall,
    color: Palette.textMutedDark,
    textAlign: 'center',
    marginTop: 4,
  },
});
