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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '@/state/weatherContext';
import { VERIFIED_XML_ENDPOINTS } from '@/api/xmlWeatherApi';
import { Palette, Spacing } from '@/constants/theme';

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
    backgroundColor: '#070F1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(7, 15, 30, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#38BDF8',
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  evalBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 14,
  },
  evalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38BDF8',
  },
  evalDesc: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.8)',
    marginTop: 2,
    lineHeight: 18,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.7)',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endpointCard: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  endpointCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  endpointTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  endpointName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
  },
  endpointAgency: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.65)',
    marginLeft: 26,
    marginBottom: 2,
  },
  endpointUrl: {
    fontSize: 11,
    color: 'rgba(226, 232, 240, 0.45)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  formatBadgeText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  endpointDesc: {
    fontSize: 11,
    color: 'rgba(226, 232, 240, 0.6)',
    flex: 1,
  },
  fetchActionBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  fetchActionText: {
    fontSize: 15,
    color: '#070F1E',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F43F5E',
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#F43F5E',
    marginLeft: 8,
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  statusTile: {
    alignItems: 'center',
    flex: 1,
  },
  statusTileLabel: {
    fontSize: 11,
    color: 'rgba(226, 232, 240, 0.55)',
    marginBottom: 2,
  },
  statusTileVal: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  persistenceCard: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  persistenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
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
    fontSize: 11,
    color: 'rgba(226, 232, 240, 0.55)',
  },
  pItemVal: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 6,
  },
  tabItemActive: {
    borderBottomColor: '#38BDF8',
  },
  tabItemText: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.65)',
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  tabContent: {
    marginTop: Spacing.xs,
  },
  recordCard: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordIndex: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  recordTime: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.6)',
  },
  recordTempBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  recordTempText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  recordLocation: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recordCondition: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.75)',
    marginTop: 2,
  },
  recordParamsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  recordParam: {
    fontSize: 11,
    color: 'rgba(226, 232, 240, 0.55)',
    marginRight: 14,
  },
  snippetBox: {
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  snippetText: {
    fontFamily: 'monospace',
    color: 'rgba(226, 232, 240, 0.65)',
    fontSize: 11,
  },
  rawContainer: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rawHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  expandBtnText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
  },
  rawScrollHorizontal: {
    maxHeight: 400,
  },
  rawCodeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38BDF8',
    lineHeight: 16,
  },
  headersCard: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerKey: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  headerVal: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.75)',
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.6)',
    textAlign: 'center',
    marginTop: 4,
  },
});
