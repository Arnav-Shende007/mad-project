/**
 * AtmosIQ - Settings, Preferences & Academic Overview Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '@/state/settingsContext';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    temperatureUnit,
    setTemperatureUnit,
    windSpeedUnit,
    setWindSpeedUnit,
    theme,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Settings</Text>
          <Text style={styles.subtitle}>Preferences & Academic Evaluation Specs</Text>
        </View>
        <Ionicons name="settings" size={24} color={Palette.cyanGlow} />
      </View>

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
          <Text style={styles.sectionHeader}>Academic Data Tools</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/xml-explorer')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="code-download-outline" size={22} color={Palette.violetMisty} />
              <View style={{ marginLeft: 12 }}>
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
              <View style={{ marginLeft: 12 }}>
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
              <View style={{ marginLeft: 12 }}>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.titleSmall,
    color: Palette.textSecondaryDark,
    marginBottom: Spacing.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '600',
  },
  settingDesc: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 2,
  },
  segmentToggle: {
    flexDirection: 'row',
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: Palette.cyanGlow,
  },
  segmentText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: Palette.spaceNavy,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navTitle: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '600',
  },
  navDesc: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.cardBorderSubtle,
  },
  aboutKey: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
  },
  aboutVal: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '600',
  },
  attrCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  attrTitle: {
    ...Typography.bodySmall,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  attrDesc: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginTop: 4,
    lineHeight: 16,
  },
});
