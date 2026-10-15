/**
 * AtmosIQ - Home / Weather Intelligence Dashboard
 * Modern midnight-blue mobile interface matching the reference weather design.
 * Features hero twilight header, continuous hourly spline chart, tomorrow's insight,
 * 15-day daily forecast, running fitness card, radar map card, AQI & pollen,
 * 2x2 metrics grid (UV, Humidity, Wind compass, Dew point, Pressure gauge, Visibility),
 * celestial sun/moon cycle cards, and quick access to academic features.
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWeather } from '@/state/weatherContext';
import { useSettings } from '@/state/settingsContext';

import { DEFAULT_LOCATIONS, searchCities } from '@/api/openMeteo';
import { LocationItem } from '@/models/weather.types';

// Specialized Weather UI Components
import { WeatherHeroHeader } from '@/components/weather/WeatherHeroHeader';
import { HourlyTrendChart } from '@/components/weather/HourlyTrendChart';
import { TemperatureInsightCard } from '@/components/weather/TemperatureInsightCard';
import { DailyForecastCard } from '@/components/weather/DailyForecastCard';
import { RunningActivityCard } from '@/components/weather/RunningActivityCard';
import { RadarMapCard } from '@/components/weather/RadarMapCard';
import { AqiPollenCard } from '@/components/weather/AqiPollenCard';
import { WeatherMetricsGrid } from '@/components/weather/WeatherMetricsGrid';
import { SunCycleCard } from '@/components/weather/SunCycleCard';
import { MoonPhaseCard } from '@/components/weather/MoonPhaseCard';

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

  const { formatTemperature } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler
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
        } catch {
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
    setSearchBarOpen(false);
    await selectLocation(loc);
  };

  const handleReportIncorrectInfo = () => {
    Alert.alert(
      'Report Weather Data',
      `Thank you for reporting weather discrepancies in ${currentLocation.name}. Your feedback helps calibrate our local sensors and offline caches.`,
      [{ text: 'OK' }]
    );
  };

  const current = weatherData?.current;
  const hourly = weatherData?.hourly || [];
  const daily = weatherData?.daily || [];
  const airQuality = weatherData?.airQuality?.[0];
  const todayDaily = daily[0];
  const tomorrowDaily = daily[1];

  // Format updated timestamp
  const updatedTimeStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '8:55 pm';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar with Search toggle & Status Badges */}
      <View style={styles.topBar}>
        <View style={styles.brandingRow}>
          <Text style={styles.appName}>AtmosIQ</Text>
          {isOffline ? (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline" size={12} color="#FBBF24" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          ) : (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchIconButton}
          activeOpacity={0.7}
          onPress={() => setSearchBarOpen(!searchBarOpen)}
        >
          <Ionicons
            name={searchBarOpen ? 'close' : 'search'}
            size={20}
            color="#E2E8F0"
          />
        </TouchableOpacity>
      </View>

      {/* Expandable City Search Bar */}
      {searchBarOpen && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(226, 232, 240, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city (e.g. Pune, Tokyo, London)..."
              placeholderTextColor="rgba(226, 232, 240, 0.4)"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              autoFocus
            />
            {isSearching && <ActivityIndicator size="small" color="#38BDF8" />}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="rgba(226, 232, 240, 0.6)" />
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
                    <Ionicons name="location-outline" size={16} color="#38BDF8" />
                    <Text style={styles.dropdownCity}>
                      {loc.name}
                      {loc.admin1 ? `, ${loc.admin1}` : ''} ({loc.country})
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.dropdownEmpty}>
                  No cities found matching &quot;{searchQuery}&quot;
                </Text>
              )}
            </View>
          )}

          {/* Quick Location Selection Pills */}
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
      )}

      {/* Main Weather Feed */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWeather}
            tintColor="#38BDF8"
            colors={['#38BDF8']}
          />
        }
      >
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#F87171" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 1. Hero Header (Location, Giant Temp, Condition, High/Low, Twilight Stargazer Backdrop) */}
        {current && (
          <WeatherHeroHeader
            location={currentLocation}
            current={current}
            todayDaily={todayDaily}
            formatTemperature={formatTemperature}
          />
        )}

        {/* 2. Hourly Forecast with continuous temperature curve & 48-hour forecast link */}
        {hourly.length > 0 && (
          <HourlyTrendChart
            hourly={hourly}
            formatTemperature={formatTemperature}
            onPressFullForecast={() => router.push('/(tabs)/analytics')}
          />
        )}

        {/* 3. Tomorrow's Temperature Insight Banner */}
        <TemperatureInsightCard
          today={todayDaily}
          tomorrow={tomorrowDaily}
          unitSymbol="°"
        />

        {/* 4. 15-day / 7-day Daily Forecast List Card */}
        <DailyForecastCard
          daily={daily}
          unitSymbol="°"
          onPressMore={() => router.push('/(tabs)/analytics')}
        />

        {/* 5. Running Fitness Activity Card */}
        <RunningActivityCard current={current} hourly={hourly} />

        {/* 6. Radar & Heat Maps Card */}
        <RadarMapCard
          cityName={currentLocation.name}
          temperature={current?.temperature ?? 25}
          unitSymbol="°"
        />

        {/* 7. AQI & 3-Column Pollen Card */}
        <AqiPollenCard airQuality={airQuality} />

        {/* 8. 2x2 Grid of Weather Metrics: UV, Humidity, Wind compass, Dew point, Pressure gauge, Visibility */}
        <WeatherMetricsGrid current={current} unitSymbol="°" />

        {/* 9. Celestial Sun Cycle Parabolic Card */}
        <SunCycleCard
          sunriseTime={todayDaily?.sunrise}
          sunsetTime={todayDaily?.sunset}
        />

        {/* 10. Celestial Moon Phase Card */}
        <MoonPhaseCard
          phaseName="Waning crescent"
          moonriseTime="10:28 am"
          moonsetTime="9:29 pm"
        />

        {/* 11. Report Incorrect Info Button */}
        <View style={styles.reportRow}>
          <TouchableOpacity
            style={styles.reportButton}
            activeOpacity={0.7}
            onPress={handleReportIncorrectInfo}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#E2E8F0" />
            <Text style={styles.reportButtonText}>Report incorrect info</Text>
          </TouchableOpacity>
        </View>

        {/* 12. Attribution Footer */}
        <View style={styles.attributionRow}>
          <Ionicons name="cloudy" size={14} color="rgba(226, 232, 240, 0.6)" />
          <Text style={styles.attributionSource}>AtmosIQ / Open-Meteo</Text>
          <Text style={styles.attributionDot}>•</Text>
          <Text style={styles.attributionTime}>Updated {updatedTimeStr}</Text>
        </View>

        {/* 13. Academic Features Quick Hub (Navigation to Analytics, XML, DB, Cloud Sync) */}
        <View style={styles.academicSection}>
          <Text style={styles.academicTitle}>AtmosIQ Intelligence Hub</Text>
          <View style={styles.academicGrid}>
            <TouchableOpacity
              style={styles.academicChip}
              onPress={() => router.push('/(tabs)/analytics')}
            >
              <Ionicons name="stats-chart" size={18} color="#38BDF8" />
              <Text style={styles.academicChipText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.academicChip}
              onPress={() => router.push('/(tabs)/xml-explorer')}
            >
              <Ionicons name="code-download" size={18} color="#A78BFA" />
              <Text style={styles.academicChipText}>XML REST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.academicChip}
              onPress={() => router.push('/(tabs)/history')}
            >
              <Ionicons name="server" size={18} color="#34D399" />
              <Text style={styles.academicChipText}>SQLite DB</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.academicChip}
              onPress={() => router.push('/(tabs)/cloud-sync')}
            >
              <Ionicons name="cloud-upload" size={18} color="#FBBF24" />
              <Text style={styles.academicChipText}>Firestore</Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(7, 15, 30, 0.95)',
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 11,
    color: '#FBBF24',
    fontWeight: '600',
  },
  searchIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    backgroundColor: '#0B172E',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 36, 70, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#0F2142',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  dropdownCity: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownEmpty: {
    padding: 16,
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.6)',
    textAlign: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8',
  },
  pillText: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.75)',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    flex: 1,
  },
  reportRow: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 36, 70, 0.7)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 6,
  },
  attributionSource: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.55)',
    fontWeight: '500',
  },
  attributionDot: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.4)',
  },
  attributionTime: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.55)',
  },
  academicSection: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(16, 36, 70, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  academicTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(226, 232, 240, 0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  academicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  academicChip: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  academicChipText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
