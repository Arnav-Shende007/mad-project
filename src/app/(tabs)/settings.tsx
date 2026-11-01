/**
 * AtmosIQ - Settings, Preferences & Academic Overview Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '@/state/settingsContext';
import { Layout, Palette } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    temperatureUnit,
    setTemperatureUnit,
    windSpeedUnit,
    setWindSpeedUnit,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ScreenHeader title="Make it yours" subtitle="Your preferences, data tools, and app details" icon="options-outline" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Measurement Units */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Unit Preferences</Text>

          {/* Temperature Toggle */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="thermometer-outline" size={20} color={Palette.cyanGlow} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.settingTitle}>Temperature Unit</Text>
                  <Text style={styles.settingDesc}>App-wide thermal scale</Text>
                </View>
              </View>

              <View style={styles.segmentToggle}>
                <TouchableOpacity
                  style={[styles.segmentBtn, temperatureUnit === 'celsius' && styles.segmentBtnActive]}
                  onPress={() => setTemperatureUnit('celsius')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      temperatureUnit === 'celsius' && styles.segmentTextActive,
                    ]}
                  >
                    °C
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    temperatureUnit === 'fahrenheit' && styles.segmentBtnActive,
                  ]}
                  onPress={() => setTemperatureUnit('fahrenheit')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      temperatureUnit === 'fahrenheit' && styles.segmentTextActive,
                    ]}
                  >
                    °F
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Wind Speed Units */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="speedometer-outline" size={20} color={Palette.azureBlue} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.settingTitle}>Wind Speed Unit</Text>
                  <Text style={styles.settingDesc}>Velocity measurement</Text>
                </View>
              </View>

              <View style={styles.segmentToggle}>
                <TouchableOpacity
                  style={[styles.segmentBtn, windSpeedUnit === 'kmh' && styles.segmentBtnActive]}
                  onPress={() => setWindSpeedUnit('kmh')}
                >
                  <Text style={[styles.segmentText, windSpeedUnit === 'kmh' && styles.segmentTextActive]}>
                    km/h
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, windSpeedUnit === 'mph' && styles.segmentBtnActive]}
                  onPress={() => setWindSpeedUnit('mph')}
                >
                  <Text style={[styles.segmentText, windSpeedUnit === 'mph' && styles.segmentTextActive]}>
                    mph
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, windSpeedUnit === 'mps' && styles.segmentBtnActive]}
                  onPress={() => setWindSpeedUnit('mps')}
                >
                  <Text style={[styles.segmentText, windSpeedUnit === 'mps' && styles.segmentTextActive]}>
                    m/s
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Data Tools Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Explore your data</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/xml-explorer')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="code-download-outline" size={22} color={Palette.violetMisty} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.navTitle}>XML Data Explorer</Text>
                <Text style={styles.navDesc}>Requirement B: Genuine REST XML inspection</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textMutedDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/history')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="server-outline" size={22} color={Palette.emeraldFresh} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.navTitle}>Local SQLite Database</Text>
                <Text style={styles.navDesc}>Requirement C: Tables, records & diagnostics</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textMutedDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/cloud-sync')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="cloud-upload-outline" size={22} color={Palette.amberWarning} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.navTitle}>Firebase Cloud Sync</Text>
                <Text style={styles.navDesc}>Requirement D: Firestore synchronization</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textMutedDark} />
          </TouchableOpacity>
        </View>

        {/* Section 3: Project Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>System Architecture & Compliance</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Application:</Text>
              <Text style={styles.aboutVal}>AtmosIQ — Weather Intelligence</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Framework:</Text>
              <Text style={styles.aboutVal}>React Native & Expo SDK 57 (Managed)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Navigation:</Text>
              <Text style={styles.aboutVal}>Expo Router (File-based Tabs)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Language:</Text>
              <Text style={styles.aboutVal}>TypeScript (Strict Type-Safety)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Local Database:</Text>
              <Text style={styles.aboutVal}>expo-sqlite (WAL Mode & Migrations)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Cloud Database:</Text>
              <Text style={styles.aboutVal}>Firebase Cloud Firestore (Batch Writes)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>XML Parser:</Text>
              <Text style={styles.aboutVal}>fast-xml-parser (Cross-Platform Pure JS)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Visualizations:</Text>
              <Text style={styles.aboutVal}>react-native-svg (Interactive Vector Curves)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Deployment:</Text>
              <Text style={styles.aboutVal}>Android (Priority), iOS & Web</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Data Source Attributions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Open API Attributions</Text>
          <View style={styles.attrCard}>
            <Text style={styles.attrTitle}>Open-Meteo REST API</Text>
            <Text style={styles.attrDesc}>
              Weather forecast, geocoding, air quality, and historical archive data provided under
              CC-BY 4.0 license. (https://open-meteo.com)
            </Text>
          </View>

          <View style={styles.attrCard}>
            <Text style={styles.attrTitle}>Norwegian Meteorological Institute (MET Norway)</Text>
            <Text style={styles.attrDesc}>
              Locationforecast 2.0 Classic XML API provided under Norwegian license for open data
              (NLOD) & CC BY 4.0. (https://api.met.no)
            </Text>
          </View>

          <View style={styles.attrCard}>
            <Text style={styles.attrTitle}>NOAA National Weather Service</Text>
            <Text style={styles.attrDesc}>
              Real-time active meteorological alerts and hazards in Common Alerting Protocol
              (CAP)/Atom XML. (https://api.weather.gov)
            </Text>
          </View>
        </View>
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
  scrollContent: {
    width: '100%', maxWidth: Layout.contentMaxWidth, alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.7)',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  settingRow: {
    flexWrap: 'wrap', gap: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    color: Palette.textMutedDark,
    marginTop: 2,
  },
  segmentToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  segmentBtn: {
    minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: '#38BDF8',
  },
  segmentText: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.7)',
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#070F1E',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navDesc: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.6)',
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  aboutRow: {
    flexWrap: 'wrap', gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  aboutKey: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.65)',
  },
  aboutVal: {
    flexShrink: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  attrCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  attrTitle: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '700',
  },
  attrDesc: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.65)',
    marginTop: 4,
    lineHeight: 18,
  },
});
