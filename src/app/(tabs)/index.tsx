/**
 * AtmosIQ - Home / Weather Intelligence Dashboard
 * City search, live conditions, hourly scroll, air quality, and KPI summaries.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWeather } from '@/state/weatherContext';
import { useSettings } from '@/state/settingsContext';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { DEFAULT_LOCATIONS, searchCities } from '@/api/openMeteo';
import { LocationItem } from '@/models/weather.types';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';
import { KpiCard } from '@/components/charts/KpiCard';

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentLocation,
    weatherData,
    isLoading,
    isOffline,
    lastUpdated,
    error,
    refreshWeather,
    selectLocation,
  } = useWeather();

  const { formatTemperature, formatWindSpeed } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler (350ms) to prevent flooding API and hitting 503 rate limits
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchCities(text, 6);
          setSearchResults(results);
        } catch (e) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 350);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectCity = async (loc: LocationItem) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    setShowDropdown(false);
    await selectLocation(loc);
  };

  const current = weatherData?.current;
  const condition = getWeatherConditionInfo(current?.weatherCode);
  const hourly = weatherData?.hourly || [];
  const daily = weatherData?.daily || [];
  const airQuality = weatherData?.airQuality?.[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandingRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="compass" size={20} color={Palette.cyanGlow} />
          </View>
          <View>
            <Text style={styles.appName}>AtmosIQ</Text>
            <Text style={styles.appTagline}>Weather Intelligence & Analytics</Text>
          </View>
        </View>

        {isOffline ? (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline" size={14} color={Palette.amberWarning} />
            <Text style={styles.offlineText}>Offline Cache</Text>
          </View>
        ) : (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live WMO</Text>
          </View>
        )}
      </View>

      {/* City Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Palette.textSecondaryDark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city (e.g., Tokyo, New York, London)..."
            placeholderTextColor={Palette.textMutedDark}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
          />
          {isSearching && <ActivityIndicator size="small" color={Palette.cyanGlow} />}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Palette.textMutedDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <View style={styles.dropdown}>
            {searchResults.length > 0 ? (
              searchResults.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectCity(loc)}
                >
                  <Ionicons name="location-outline" size={16} color={Palette.cyanGlow} />
                  <Text style={styles.dropdownCity}>
                    {loc.name}
                    {loc.admin1 ? `, ${loc.admin1}` : ''} ({loc.country})
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.dropdownEmpty}>No cities found matching &quot;{searchQuery}&quot;</Text>
            )}
          </View>
        )}

        {/* Quick Location Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {DEFAULT_LOCATIONS.map((loc) => {
            const isSelected = currentLocation.name === loc.name;
            return (
              <TouchableOpacity
                key={loc.id}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => handleSelectCity(loc)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {loc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWeather}
            tintColor={Palette.cyanGlow}
            colors={[Palette.cyanGlow]}
          />
        }
      >
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Palette.roseAlert} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Hero Current Weather Card */}
        {current && (
          <View style={styles.heroCard}>
            <View style={styles.heroLocationRow}>
              <Ionicons name="location" size={16} color={Palette.cyanGlow} />
              <Text style={styles.locationTitle}>
                {currentLocation.name}, {currentLocation.country}
              </Text>
            </View>

            <View style={styles.heroMainRow}>
              <View>
                <Text style={styles.heroTemp}>
                  {formatTemperature(current.temperature)}
                </Text>
                <Text style={styles.heroCondition}>{current.weatherDescription}</Text>
                <Text style={styles.heroFeelsLike}>
                  Feels like {formatTemperature(current.apparentTemperature)}
                </Text>
              </View>

              <View style={styles.conditionIconWrapper}>
                <Ionicons
                  name={condition.iconName as any}
                  size={64}
                  color={condition.color || Palette.cyanGlow}
                />
              </View>
            </View>

            {/* Quick Metrics Bar */}
            <View style={styles.heroMetricsRow}>
              <View style={styles.metricSubItem}>
                <Ionicons name="water-outline" size={16} color={Palette.cyanGlow} />
                <Text style={styles.metricSubLabel}>Humidity</Text>
                <Text style={styles.metricSubVal}>{current.relativeHumidity}%</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricSubItem}>
                <Ionicons name="speedometer-outline" size={16} color={Palette.azureBlue} />
                <Text style={styles.metricSubLabel}>Wind</Text>
                <Text style={styles.metricSubVal}>{formatWindSpeed(current.windSpeed)}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricSubItem}>
                <Ionicons name="rainy-outline" size={16} color={Palette.cyanAccent} />
                <Text style={styles.metricSubLabel}>Rain</Text>
                <Text style={styles.metricSubVal}>{current.precipitation} mm</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricSubItem}>
                <Ionicons name="pulse-outline" size={16} color={Palette.indigoPulse} />
                <Text style={styles.metricSubLabel}>Pressure</Text>
                <Text style={styles.metricSubVal}>{current.pressure} hPa</Text>
              </View>
            </View>
          </View>
        )}

        {/* 48-Hour Hourly Forecast Section */}
        {hourly.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hourly Forecast</Text>
              <Text style={styles.sectionSubtitle}>Next 48 Hours</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyList}
            >
              {hourly.slice(0, 24).map((item, idx) => {
                const hourDate = new Date(item.time);
                const hourStr = isNaN(hourDate.getTime())
                  ? item.time.slice(11, 16)
                  : hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const itemCondition = getWeatherConditionInfo(item.weatherCode);

                return (
                  <View key={`hourly-${idx}`} style={styles.hourlyCard}>
                    <Text style={styles.hourlyTime}>{idx === 0 ? 'Now' : hourStr}</Text>
                    <Ionicons
                      name={itemCondition.iconName as any}
                      size={24}
                      color={itemCondition.color}
                      style={{ marginVertical: 6 }}
                    />
                    <Text style={styles.hourlyTemp}>{formatTemperature(item.temperature)}</Text>
                    {item.precipitationProbability > 0 && (
                      <Text style={styles.hourlyPop}>{item.precipitationProbability}%</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Air Quality Overview Card */}
        {airQuality && (
          <View style={styles.section}>
            <View style={styles.aqiCard}>
              <View style={styles.aqiHeader}>
                <View style={styles.aqiTitleRow}>
                  <Ionicons name="leaf-outline" size={18} color={Palette.emeraldFresh} />
                  <Text style={styles.aqiTitle}>Air Quality Index (AQI)</Text>
                </View>
                <View
                  style={[
                    styles.aqiBadge,
                    {
                      backgroundColor:
                        (airQuality.usAqi ?? 0) <= 50
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      borderColor:
                        (airQuality.usAqi ?? 0) <= 50 ? Palette.emeraldFresh : Palette.amberWarning,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.aqiBadgeText,
                      {
                        color:
                          (airQuality.usAqi ?? 0) <= 50 ? Palette.emeraldFresh : Palette.amberWarning,
                      },
                    ]}
                  >
                    US AQI: {airQuality.usAqi ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.aqiMetricsRow}>
                <View style={styles.aqiMetric}>
                  <Text style={styles.aqiMetricVal}>{airQuality.pm2_5 ?? '--'} µg/m³</Text>
                  <Text style={styles.aqiMetricLabel}>PM2.5 (Fine Particulate)</Text>
                </View>
                <View style={styles.aqiMetric}>
                  <Text style={styles.aqiMetricVal}>{airQuality.pm10 ?? '--'} µg/m³</Text>
                  <Text style={styles.aqiMetricLabel}>PM10 (Inhalable)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Action Buttons to Mandatory Academic Features */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Palette.cyanGlow }]}
            onPress={() => router.push('/(tabs)/analytics')}
          >
            <Ionicons name="stats-chart" size={22} color={Palette.cyanGlow} />
            <Text style={styles.actionTitle}>Interactive Analytics</Text>
            <Text style={styles.actionDesc}>Charts, variance, statistical formulas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Palette.violetMisty }]}
            onPress={() => router.push('/(tabs)/xml-explorer')}
          >
            <Ionicons name="code-download" size={22} color={Palette.violetMisty} />
            <Text style={styles.actionTitle}>XML Data Explorer</Text>
            <Text style={styles.actionDesc}>Live REST XML, parser & validation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Palette.emeraldFresh }]}
            onPress={() => router.push('/(tabs)/history')}
          >
            <Ionicons name="server" size={22} color={Palette.emeraldFresh} />
            <Text style={styles.actionTitle}>Local SQLite DB</Text>
            <Text style={styles.actionDesc}>Inspect saved records & schema</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Palette.amberWarning }]}
            onPress={() => router.push('/(tabs)/cloud-sync')}
          >
            <Ionicons name="cloud-upload" size={22} color={Palette.amberWarning} />
            <Text style={styles.actionTitle}>Firebase Cloud Sync</Text>
            <Text style={styles.actionDesc}>Upload queue & Firestore status</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Attribution */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Source: {weatherData?.dataSource || 'Open-Meteo REST API & WMO Standard'}
          </Text>
          {lastUpdated && (
            <Text style={styles.footerSub}>
              Last Synchronized: {new Date(lastUpdated).toLocaleTimeString()}
            </Text>
          )}
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
    paddingVertical: Spacing.sm,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  appName: {
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '800',
  },
  appTagline: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.emeraldFresh,
    marginRight: 6,
  },
  liveText: {
    ...Typography.caption,
    color: Palette.emeraldFresh,
    fontWeight: '700',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  offlineText: {
    ...Typography.caption,
    color: Palette.amberWarning,
    marginLeft: 4,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Palette.textPrimaryDark,
    ...Typography.bodyMedium,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Palette.cardSlate,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    zIndex: 100,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.cardBorderSubtle,
  },
  dropdownCity: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    marginLeft: Spacing.sm,
  },
  dropdownEmpty: {
    ...Typography.bodySmall,
    color: Palette.textMutedDark,
    padding: Spacing.md,
    textAlign: 'center',
  },
  pillsRow: {
    paddingVertical: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Palette.deepSlate,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  pillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Palette.cyanGlow,
  },
  pillText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  heroCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.md,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  locationTitle: {
    ...Typography.titleSmall,
    color: Palette.textSecondaryDark,
    marginLeft: 6,
  },
  heroMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  heroTemp: {
    ...Typography.displayLarge,
    color: Palette.textPrimaryDark,
  },
  heroCondition: {
    ...Typography.titleMedium,
    color: Palette.cyanGlow,
    marginTop: -4,
  },
  heroFeelsLike: {
    ...Typography.bodySmall,
    color: Palette.textMutedDark,
    marginTop: 2,
  },
  conditionIconWrapper: {
    padding: Spacing.xs,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  metricSubItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricSubLabel: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 4,
  },
  metricSubVal: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.cardBorder,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Palette.cyanGlow,
  },
  hourlyList: {
    paddingVertical: 2,
  },
  hourlyCard: {
    width: 72,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  hourlyTime: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
  },
  hourlyTemp: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  hourlyPop: {
    ...Typography.caption,
    color: Palette.azureBlue,
    fontSize: 10,
    marginTop: 2,
  },
  aqiCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  aqiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  aqiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aqiTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginLeft: 6,
  },
  aqiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  aqiBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  aqiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  aqiMetric: {
    flex: 1,
  },
  aqiMetricVal: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  aqiMetricLabel: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginTop: 6,
  },
  actionDesc: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  footerText: {
    ...Typography.caption,
    color: Palette.textMutedDark,
  },
  footerSub: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 2,
  },
});
