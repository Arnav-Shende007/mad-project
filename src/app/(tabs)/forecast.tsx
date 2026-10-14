/**
 * AtmosIQ - 7-Day Extended Weather Forecast Screen
 * Daily thermal bars, precipitation trends, UV indices, and solar timings.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '@/state/weatherContext';
import { useSettings } from '@/state/settingsContext';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart';
import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart';

export default function ForecastScreen() {
  const { currentLocation, weatherData, isLoading, refreshWeather } = useWeather();
  const { formatTemperature } = useSettings();

  const daily = weatherData?.daily || [];

  // Bar chart data for 7-day high/low temperatures
  const barData = daily.map((d) => {
    const dayName = new Date(d.date).toLocaleDateString([], { weekday: 'short' });
    return {
      label: dayName || d.date.slice(5),
      primaryValue: d.temperatureMax,
      secondaryValue: d.temperatureMin,
    };
  });

  // Rain trend data
  const rainData = daily.map((d) => {
    const dayName = new Date(d.date).toLocaleDateString([], { weekday: 'short' });
    return {
      label: dayName || d.date.slice(5),
      value: d.precipitationSum,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Extended Forecast</Text>
          <Text style={styles.subtitle}>
            {currentLocation.name}, {currentLocation.country} (7-Day Projection)
          </Text>
        </View>
        <Ionicons name="calendar" size={24} color={Palette.cyanGlow} />
      </View>

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
        {/* High / Low Temperature Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="thermometer-outline" size={18} color={Palette.cyanGlow} />
              <Text style={styles.chartTitle}>7-Day Temperature Range</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: Palette.cyanAccent }]} />
              <Text style={styles.legendText}>Max Temp</Text>
              <View style={[styles.legendDot, { backgroundColor: Palette.azureBlue, marginLeft: 8 }]} />
              <Text style={styles.legendText}>Min Temp</Text>
            </View>
          </View>

          <InteractiveBarChart
            data={barData}
            height={190}
            unit="°"
            primaryColor={Palette.cyanAccent}
            secondaryColor={Palette.azureBlue}
            isDualRange={true}
          />
        </View>

        {/* Precipitation Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="rainy-outline" size={18} color={Palette.azureBlue} />
              <Text style={styles.chartTitle}>Daily Precipitation (mm)</Text>
            </View>
          </View>

          <InteractiveLineChart
            data={rainData}
            height={160}
            unit="mm"
            strokeColor={Palette.azureBlue}
            fillColor="rgba(56, 189, 248, 0.2)"
          />
        </View>

        {/* Detailed 7-Day List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
          {daily.map((day, idx) => {
            const cond = getWeatherConditionInfo(day.weatherCode);
            const dateObj = new Date(day.date);
            const dayOfWeek = idx === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'long' });
            const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <View key={`day-${idx}`} style={styles.dayCard}>
                <View style={styles.dayLeftCol}>
                  <Text style={styles.dayName}>{dayOfWeek}</Text>
                  <Text style={styles.dayDate}>{formattedDate}</Text>
                </View>

                <View style={styles.dayCenterCol}>
                  <Ionicons name={cond.iconName as any} size={24} color={cond.color} />
                  <Text style={styles.dayCondText} numberOfLines={1}>
                    {cond.description}
                  </Text>
                </View>

                <View style={styles.dayRightCol}>
                  <View style={styles.tempSpan}>
                    <Text style={styles.tempMax}>{formatTemperature(day.temperatureMax)}</Text>
                    <Text style={styles.tempMin}>{formatTemperature(day.temperatureMin)}</Text>
                  </View>
                  {day.precipitationProbabilityMax > 0 && (
                    <View style={styles.popBadge}>
                      <Ionicons name="water" size={10} color={Palette.azureBlue} />
                      <Text style={styles.popText}>{day.precipitationProbabilityMax}%</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
    color: Palette.textSecondaryDark,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  chartCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginBottom: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginLeft: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
  },
  section: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
    marginBottom: Spacing.sm,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  dayLeftCol: {
    width: 90,
  },
  dayName: {
    ...Typography.bodyMedium,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  dayDate: {
    ...Typography.caption,
    color: Palette.textMutedDark,
  },
  dayCenterCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  dayCondText: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginLeft: 8,
    flex: 1,
  },
  dayRightCol: {
    alignItems: 'flex-end',
  },
  tempSpan: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tempMax: {
    ...Typography.bodyLarge,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginRight: 8,
  },
  tempMin: {
    ...Typography.bodyMedium,
    color: Palette.textSecondaryDark,
  },
  popBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  popText: {
    ...Typography.caption,
    color: Palette.azureBlue,
    marginLeft: 2,
  },
});
