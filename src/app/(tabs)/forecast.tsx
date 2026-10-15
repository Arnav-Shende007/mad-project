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
import { Palette } from '@/constants/theme';
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
    color: 'rgba(226, 232, 240, 0.65)',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  chartCard: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.7)',
    fontWeight: '500',
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayLeftCol: {
    width: 85,
  },
  dayName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.55)',
    marginTop: 2,
  },
  dayCenterCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  dayCondText: {
    fontSize: 13,
    color: 'rgba(226, 232, 240, 0.75)',
    flex: 1,
  },
  dayRightCol: {
    alignItems: 'flex-end',
  },
  tempSpan: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  tempMax: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tempMin: {
    fontSize: 15,
    color: 'rgba(226, 232, 240, 0.55)',
    fontWeight: '500',
  },
  popBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  popText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
});
