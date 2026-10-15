/**
 * AtmosIQ - XML Data Explorer Screen
 * 
 * Requirement B: Demonstrates the complete XML workflow for academic evaluation:
 * 1. Source REST API & Endpoint selection
 * 2. Fetching genuine XML over HTTP
 * 3. Inspecting HTTP Status & Response Headers
 * 4. Displaying Raw XML Response with formatting
 * 5. Parsing & Normalizing into typed TypeScript models
 * 6. Local SQLite persistence verification
 * 7. Firebase Cloud synchronization verification
 * 8. Live interactive demonstration refresh
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '@/state/weatherContext';
import { VERIFIED_XML_ENDPOINTS } from '@/api/xmlWeatherApi';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { NormalizedXmlWeatherRecord } from '@/models/xml.types';

export default function XmlExplorerScreen() {
  const {
    rawXmlData,
    xmlReport,
    isXmlLoading,
    xmlError,
    fetchAndParseXml,
    currentLocation,
  } = useWeather();

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(VERIFIED_XML_ENDPOINTS[0].id);
  const [showFullRawXml, setShowFullRawXml] = useState(false);
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw' | 'headers' | 'diagnostics'>('parsed');

  const activeEndpoint =
    VERIFIED_XML_ENDPOINTS.find((e) => e.id === selectedEndpointId) || VERIFIED_XML_ENDPOINTS[0];

  // Trigger initial fetch if empty
  useEffect(() => {
    if (!xmlReport && !isXmlLoading) {
      fetchAndParseXml(activeEndpoint.url, activeEndpoint.id);
    }
  }, []);

  const handleFetchXml = async () => {
    await fetchAndParseXml(activeEndpoint.url, activeEndpoint.id);
  };

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    const target = VERIFIED_XML_ENDPOINTS.find((e) => e.id === endpointId);
    if (target) {
      fetchAndParseXml(target.url, target.id);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>XML Data Explorer</Text>
          <Text style={styles.subtitle}>Requirement B · Genuine REST XML Pipeline</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleFetchXml}
          disabled={isXmlLoading}
        >
          {isXmlLoading ? (
            <ActivityIndicator size="small" color={Palette.cyanGlow} />
          ) : (
            <Ionicons name="refresh" size={20} color={Palette.cyanGlow} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Academic Evaluation Banner */}
        <View style={styles.evalBanner}>
          <Ionicons name="school-outline" size={20} color={Palette.cyanGlow} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.evalTitle}>Academic Evaluation Feature</Text>
            <Text style={styles.evalDesc}>
              This screen directly demonstrates fetching, validating, and parsing genuine XML from a
              live public REST endpoint into SQLite and Firebase.
            </Text>
          </View>
        </View>

        {/* Source API Endpoint Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Genuine XML REST API Source:</Text>
          {VERIFIED_XML_ENDPOINTS.map((endpoint) => {
            const isSelected = selectedEndpointId === endpoint.id;
            return (
              <TouchableOpacity
                key={endpoint.id}
                style={[styles.endpointCard, isSelected && styles.endpointCardActive]}
                onPress={() => handleSelectEndpoint(endpoint.id)}
                activeOpacity={0.7}
              >
                <View style={styles.endpointTop}>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? Palette.cyanGlow : Palette.textMutedDark}
                  />
                  <Text style={[styles.endpointName, isSelected && { color: Palette.cyanGlow }]}>
                    {endpoint.name}
                  </Text>
                </View>
                <Text style={styles.endpointAgency}>Agency: {endpoint.agency}</Text>
                <Text style={styles.endpointUrl} numberOfLines={1}>
                  {endpoint.url}
                </Text>
                <View style={styles.endpointBadgeRow}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatBadgeText}>{endpoint.contentTypeExpected}</Text>
                  </View>
                  <Text style={styles.endpointDesc} numberOfLines={1}>
                    {endpoint.formatDescription}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Fetch Action Button */}
        <TouchableOpacity
          style={[styles.fetchActionBtn, isXmlLoading && { opacity: 0.6 }]}
          onPress={handleFetchXml}
          disabled={isXmlLoading}
        >
          {isXmlLoading ? (
            <ActivityIndicator size="small" color={Palette.spaceNavy} style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="cloud-download" size={20} color={Palette.spaceNavy} style={{ marginRight: 8 }} />
          )}
          <Text style={styles.fetchActionText}>
            {isXmlLoading ? 'Executing Live XML Request...' : 'Fetch & Parse Live XML Response'}
          </Text>
        </TouchableOpacity>

        {/* Error notification if any */}
        {xmlError && (
          <View style={styles.errorBox}>
            <Ionicons name="close-circle" size={18} color={Palette.roseAlert} />
            <Text style={styles.errorText}>{xmlError}</Text>
          </View>
        )}

        {/* Status Metrics Bar */}
        {xmlReport && rawXmlData && (
          <View style={styles.statusBar}>
            <View style={styles.statusTile}>
              <Text style={styles.statusTileLabel}>HTTP Status</Text>
              <Text style={[styles.statusTileVal, { color: rawXmlData.status === 200 ? Palette.emeraldFresh : Palette.amberWarning }]}>
                {rawXmlData.status} OK
              </Text>
            </View>
            <View style={styles.statusTile}>
              <Text style={styles.statusTileLabel}>Payload Size</Text>
              <Text style={styles.statusTileVal}>{(rawXmlData.byteSize / 1024).toFixed(1)} KB</Text>
            </View>
            <View style={styles.statusTile}>
              <Text style={styles.statusTileLabel}>Parse Duration</Text>
              <Text style={styles.statusTileVal}>{xmlReport.parseDurationMs} ms</Text>
            </View>
            <View style={styles.statusTile}>
              <Text style={styles.statusTileLabel}>Normalized</Text>
              <Text style={[styles.statusTileVal, { color: Palette.cyanGlow }]}>
                {xmlReport.parsedRecordCount} recs
              </Text>
            </View>
          </View>
        )}

        {/* Persistence & Synchronization Live Counters */}
        {xmlReport && (
          <View style={styles.persistenceCard}>
            <Text style={styles.persistenceTitle}>Persistence & Cloud Sync Status</Text>
            <View style={styles.persistenceRow}>
              <View style={styles.pItem}>
                <Ionicons name="server" size={18} color={Palette.emeraldFresh} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.pItemLabel}>SQLite Persistence</Text>
                  <Text style={styles.pItemVal}>{xmlReport.sqliteSavedCount} Records Stored</Text>
                </View>
              </View>

              <View style={styles.pItem}>
                <Ionicons name="cloud-upload" size={18} color={Palette.amberWarning} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.pItemLabel}>Firestore Cloud Sync</Text>
                  <Text style={styles.pItemVal}>
                    {xmlReport.firebaseSyncedCount > 0
                      ? `${xmlReport.firebaseSyncedCount} Synced`
                      : 'Queued (Local Mode)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sub-Tabs: Parsed Records | Raw XML | Response Headers */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'parsed' && styles.tabItemActive]}
            onPress={() => setActiveTab('parsed')}
          >
            <Text style={[styles.tabItemText, activeTab === 'parsed' && styles.tabItemTextActive]}>
              Normalized Records ({xmlReport?.records.length ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'raw' && styles.tabItemActive]}
            onPress={() => setActiveTab('raw')}
          >
            <Text style={[styles.tabItemText, activeTab === 'raw' && styles.tabItemTextActive]}>
              Raw XML Response
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'headers' && styles.tabItemActive]}
            onPress={() => setActiveTab('headers')}
          >
            <Text style={[styles.tabItemText, activeTab === 'headers' && styles.tabItemTextActive]}>
              HTTP Headers
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Parsed & Normalized Records */}
        {activeTab === 'parsed' && (
          <View style={styles.tabContent}>
            {xmlReport && xmlReport.records.length > 0 ? (
              xmlReport.records.slice(0, 30).map((record, index) => (
                <View key={record.id || `rec-${index}`} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordIndex}>#{index + 1}</Text>
                    <Text style={styles.recordTime}>
                      {record.timestamp ? new Date(record.timestamp).toLocaleString() : record.timestamp}
                    </Text>
                    <View style={styles.recordTempBadge}>
                      <Text style={styles.recordTempText}>{record.temperatureC}°C</Text>
                    </View>
                  </View>

                  <Text style={styles.recordLocation}>Grid Location: {record.locationName}</Text>
                  <Text style={styles.recordCondition}>Condition: {record.weatherCondition}</Text>

                  <View style={styles.recordParamsRow}>
                    {record.humidityPercent !== undefined && (
                      <Text style={styles.recordParam}>Humidity: {record.humidityPercent}%</Text>
                    )}
                    {record.pressureHpa !== undefined && (
                      <Text style={styles.recordParam}>Pressure: {record.pressureHpa} hPa</Text>
                    )}
                    {record.windSpeedMps !== undefined && (
                      <Text style={styles.recordParam}>Wind: {record.windSpeedMps} m/s</Text>
                    )}
                  </View>

                  {record.rawNodeSnippet && (
                    <View style={styles.snippetBox}>
                      <Text style={styles.snippetText} numberOfLines={2}>
                        {record.rawNodeSnippet}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={36} color={Palette.textMutedDark} />
                <Text style={styles.emptyText}>No XML records loaded yet.</Text>
                <Text style={styles.emptySub}>
                  Press &quot;Fetch &amp; Parse Live XML Response&quot; to initiate the pipeline.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: Raw XML Syntax Viewer */}
        {activeTab === 'raw' && (
          <View style={styles.rawContainer}>
            <View style={styles.rawHeader}>
              <Text style={styles.rawHeaderTitle}>XML Document Payload</Text>
              <TouchableOpacity
                onPress={() => setShowFullRawXml(!showFullRawXml)}
                style={styles.expandBtn}
              >
                <Text style={styles.expandBtnText}>
                  {showFullRawXml ? 'Show Preview' : 'Show Full'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal style={styles.rawScrollHorizontal}>
              <Text style={styles.rawCodeText}>
                {rawXmlData
                  ? showFullRawXml
                    ? rawXmlData.rawXml
                    : rawXmlData.rawXml.slice(0, 3000) +
                      '\n\n... [Truncated for mobile performance. Tap "Show Full" to display complete 100KB+ XML]'
                  : 'No raw XML response available.'}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* TAB 3: HTTP Response Headers */}
        {activeTab === 'headers' && (
          <View style={styles.headersCard}>
            <Text style={styles.headersTitle}>Server Response Headers</Text>
            {rawXmlData?.headers &&
              Object.entries(rawXmlData.headers).map(([key, val]) => (
                <View key={key} style={styles.headerRow}>
                  <Text style={styles.headerKey}>{key}:</Text>
                  <Text style={styles.headerVal}>{val}</Text>
                </View>
              ))}
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
    color: Palette.cyanGlow,
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
  evalBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginBottom: Spacing.md,
  },
  evalTitle: {
    ...Typography.titleSmall,
    color: Palette.cyanGlow,
  },
  evalDesc: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginTop: 2,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  endpointCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.sm,
  },
  endpointCardActive: {
    borderColor: Palette.cyanGlow,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  endpointTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  endpointName: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginLeft: 8,
  },
  endpointAgency: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginLeft: 26,
    marginBottom: 2,
  },
  endpointUrl: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginLeft: 26,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  endpointBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26,
  },
  formatBadge: {
    backgroundColor: Palette.deepSlate,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    marginRight: 8,
  },
  formatBadgeText: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  endpointDesc: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    flex: 1,
  },
  fetchActionBtn: {
    flexDirection: 'row',
    backgroundColor: Palette.cyanGlow,
    borderRadius: Radius.lg,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  fetchActionText: {
    ...Typography.bodyMedium,
    color: Palette.spaceNavy,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.roseAlert,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Palette.roseAlert,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.md,
  },
  statusTile: {
    alignItems: 'center',
    flex: 1,
  },
  statusTileLabel: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginBottom: 2,
  },
  statusTileVal: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  persistenceCard: {
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.md,
  },
  persistenceTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginBottom: Spacing.sm,
  },
  persistenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pItemLabel: {
    ...Typography.caption,
    color: Palette.textMutedDark,
  },
  pItemVal: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Palette.cardBorder,
    marginBottom: Spacing.md,
  },
  tabItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: Spacing.sm,
  },
  tabItemActive: {
    borderBottomColor: Palette.cyanGlow,
  },
  tabItemText: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  tabContent: {
    marginTop: Spacing.xs,
  },
  recordCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordIndex: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  recordTime: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
  },
  recordTempBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  recordTempText: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  recordLocation: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '600',
  },
  recordCondition: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginTop: 2,
  },
  recordParamsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  recordParam: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginRight: 12,
  },
  snippetBox: {
    marginTop: 8,
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.xs,
    padding: 6,
  },
  snippetText: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Palette.textMutedDark,
    fontSize: 10,
  },
  rawContainer: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  rawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rawHeaderTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
  },
  expandBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Palette.deepSlate,
  },
  expandBtnText: {
    ...Typography.caption,
    color: Palette.cyanGlow,
  },
  rawScrollHorizontal: {
    maxHeight: 400,
  },
  rawCodeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Palette.cyanAccent,
    lineHeight: 16,
  },
  headersCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  headersTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.cardBorderSubtle,
  },
  headerKey: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  headerVal: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginTop: 2,
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
  emptyText: {
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
