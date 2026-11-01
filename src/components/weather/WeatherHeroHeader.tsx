/**
 * AtmosIQ - Weather Hero Header Component
 * Matches the reference design with location, giant temperature, condition,
 * high/low range, feels-like temperature, and atmospheric scenic twilight silhouette backdrop.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { LocationItem, CurrentWeather, DailyForecastItem } from '@/models/weather.types';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';

interface WeatherHeroHeaderProps {
  location: LocationItem;
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
  formatTemperature: (val: number) => string;
}

export function WeatherHeroHeader({
  location,
  current,
  todayDaily,
  formatTemperature,
}: WeatherHeroHeaderProps) {
  const highTemp = todayDaily ? formatTemperature(todayDaily.temperatureMax) : formatTemperature(current.temperature + 4);
  const lowTemp = todayDaily ? formatTemperature(todayDaily.temperatureMin) : formatTemperature(current.temperature - 4);
  const feelsLike = formatTemperature(current.apparentTemperature);
  const condition = getWeatherConditionInfo(current.weatherCode);

  return (
    <View style={styles.container}>
      {/* Location Row */}
      <View style={styles.locationRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>YOUR LOCAL OUTLOOK</Text>
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.country}>{location.country}</Text>
        </View>
        <View style={styles.weatherIcon}>
          <Ionicons name={condition.iconName as keyof typeof Ionicons.glyphMap} size={34} color={condition.color} />
        </View>
      </View>

      {/* Main Temperature Display */}
      <View style={styles.tempSection}>
        <Text style={styles.temperatureText}>{formatTemperature(current.temperature)}</Text>
        <Text style={styles.conditionText}>{current.weatherDescription}</Text>
        <Text style={styles.rangeText}>
          ↑ {highTemp}  /  ↓ {lowTemp}  •  Feels like {feelsLike}
        </Text>
      </View>

      {/* Atmospheric Scenic Illustration Backdrop */}
      <View pointerEvents="none" accessibilityElementsHidden style={styles.scenicWrapper}>
        <Svg width="100%" height="100%" viewBox="0 0 360 160" preserveAspectRatio="xMidYMax slice">
          <Defs>
            <LinearGradient id="twilightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0E244D" stopOpacity="0.8" />
              <Stop offset="0.6" stopColor="#1E3A8A" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#08101E" stopOpacity="0.95" />
            </LinearGradient>
            <RadialGradient id="auroraGlow" cx="0.75" cy="0.4" r="0.6">
              <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.35" />
              <Stop offset="0.5" stopColor="#818CF8" stopOpacity="0.15" />
              <Stop offset="1" stopColor="#08101E" stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0B1A30" stopOpacity="1" />
              <Stop offset="1" stopColor="#050B14" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background Sky */}
          <Rect x="0" y="0" width="360" height="160" fill="url(#twilightGrad)" rx="20" />
          <Rect x="0" y="0" width="360" height="160" fill="url(#auroraGlow)" rx="20" />

          {/* Subtle Stars in Night Sky */}
          <Circle cx="30" cy="25" r="1" fill="#FFFFFF" opacity="0.6" />
          <Circle cx="65" cy="45" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="120" cy="20" r="0.8" fill="#FFFFFF" opacity="0.5" />
          <Circle cx="180" cy="35" r="1.4" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="240" cy="18" r="1" fill="#FFFFFF" opacity="0.7" />
          <Circle cx="310" cy="30" r="1.2" fill="#FFFFFF" opacity="0.85" />
          <Circle cx="290" cy="55" r="0.9" fill="#FFFFFF" opacity="0.5" />
          <Circle cx="150" cy="50" r="1" fill="#FFFFFF" opacity="0.6" />

          {/* Rolling Hills Silhouette */}
          <Path
            d="M 0 135 Q 90 105 180 125 T 360 110 L 360 160 L 0 160 Z"
            fill="url(#hillGrad)"
          />
          <Path
            d="M 120 160 Q 220 100 360 120 L 360 160 Z"
            fill="#060E1A"
            opacity="0.9"
          />

          {/* Stargazer / Silhouette on Hilltop */}
          <G transform="translate(245, 78)">
            {/* Person Head */}
            <Circle cx="12" cy="8" r="4.5" fill="#38BDF8" opacity="0.9" />
            {/* Person Torso with Jacket */}
            <Path d="M 8 13 L 16 13 L 18 32 L 6 32 Z" fill="#2563EB" opacity="0.9" />
            {/* Legs */}
            <Path d="M 7 32 L 6 52 L 10 52 L 11 32 Z" fill="#1D4ED8" />
            <Path d="M 13 32 L 14 52 L 18 52 L 17 32 Z" fill="#1E40AF" />
            {/* Phone/Flashlight Subtle Glow in Hands */}
            <Circle cx="9" cy="22" r="3" fill="#67E8F9" opacity="0.8" />
          </G>

          {/* Gentle Foreground Ridge with Flowers/Grass Dots */}
          <Circle cx="220" cy="148" r="2" fill="#34D399" opacity="0.6" />
          <Circle cx="230" cy="146" r="1.5" fill="#F472B6" opacity="0.7" />
          <Circle cx="255" cy="149" r="2" fill="#FBBF24" opacity="0.7" />
          <Circle cx="280" cy="151" r="1.8" fill="#38BDF8" opacity="0.6" />
          <Circle cx="305" cy="147" r="2" fill="#A78BFA" opacity="0.6" />
        </Svg>
      </View>

      {/* Atmospheric Summary Pill */}
      <View style={styles.summaryPill}>
        <Text style={styles.summaryText}>
          {current.weatherDescription}. Low {lowTemp}.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#102747',
    borderWidth: 1,
    borderColor: Palette.accentBorder,
    overflow: 'hidden',
  },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: '#A5DBF5', marginBottom: 10 },
  country: { fontSize: 13, color: Palette.textSecondaryDark, marginTop: 4 },
  weatherIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(56,189,248,0.12)', alignItems: 'center', justifyContent: 'center' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    zIndex: 1,
    gap: 12,
  },
  locationName: {
    ...Typography.titleLarge,
    color: Palette.white,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tempSection: {
    marginTop: 20,
    marginBottom: 24,
    zIndex: 1,
  },
  temperatureText: {
    fontSize: 80,
    fontWeight: '300',
    color: Palette.white,
    letterSpacing: -3,
  },
  conditionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Palette.white,
    marginTop: -4,
    marginBottom: 4,
  },
  rangeText: {
    ...Typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  scenicWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    maxWidth: 520,
    height: 190,
    opacity: 0.5,
  },
  summaryPill: {
    zIndex: 1,
    backgroundColor: 'rgba(16, 37, 75, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    alignSelf: 'flex-start',
  },
  summaryText: {
    ...Typography.bodyMedium,
    color: Palette.white,
    fontWeight: '500',
  },
});
