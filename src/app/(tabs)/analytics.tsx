/**
 * AtmosIQ - Analytics Dashboard & Intelligence Visualizations
 * User-selected metrics, KPI cards, mathematical summaries,
 * data-grounded insights, and system architecture diagrams.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '@/state/weatherContext';
import { useSettings } from '@/state/settingsContext';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { InteractiveLineChart, LineChartPoint } from '@/components/charts/InteractiveLineChart';
import { KpiCard } from '@/components/charts/KpiCard';
import { SystemArchitectureDiagram } from '@/components/diagrams/SystemArchitectureDiagram';
import { SyncFlowDiagram } from '@/components/diagrams/SyncFlowDiagram';

type SelectedMetric = 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'air_quality';
type SelectedPeriod = '24h' | '7d';

export default function AnalyticsScreen() {
  const { weatherData, analytics, isLoading, refreshWeather, currentLocation } = useWeather();
  const { formatTemperature, formatWindSpeed } = useSettings();

  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>('temperature');
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>('24h');

  const hourly = weatherData?.hourly || [];
  const daily = weatherData?.daily || [];

  // Generate dynamic chart data based on active filter
  let chartData: LineChartPoint[] = [];
  let chartUnit = '';
  let chartStroke = Palette.cyanGlow;
  let chartFill = 'rgba(34, 211, 238, 0.2)';

  if (selectedMetric === 'temperature') {
    chartUnit = '°C';
    chartStroke = Palette.cyanGlow;
    chartFill = 'rgba(34, 211, 238, 0.2)';
    if (selectedPeriod === '24h') {
      chartData = hourly.slice(0, 24).map((h) => ({
        label: h.time.slice(11, 16),
        value: h.temperature,
      }));
    } else {
      chartData = daily.map((d) => ({
        label: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
        value: d.temperatureMax,
      }));
    }
  } else if (selectedMetric === 'precipitation') {
    chartUnit = 'mm';
    chartStroke = Palette.azureBlue;
    chartFill = 'rgba(56, 189, 248, 0.2)';
    if (selectedPeriod === '24h') {
      chartData = hourly.slice(0, 24).map((h) => ({
        label: h.time.slice(11, 16),
        value: h.precipitation,
      }));
    } else {
      chartData = daily.map((d) => ({
        label: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
        value: d.precipitationSum,
      }));
    }
  } else if (selectedMetric === 'wind') {
    chartUnit = 'km/h';
    chartStroke = Palette.emeraldFresh;
    chartFill = 'rgba(16, 185, 129, 0.2)';
    if (selectedPeriod === '24h') {
      chartData = hourly.slice(0, 24).map((h) => ({
        label: h.time.slice(11, 16),
        value: h.windSpeed,
      }));
    } else {
      chartData = daily.map((d) => ({
        label: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
        value: d.windSpeedMax,
      }));
    }
  } else if (selectedMetric === 'pressure') {
    chartUnit = 'hPa';
    chartStroke = Palette.indigoPulse;
    chartFill = 'rgba(99, 102, 241, 0.2)';
    chartData = hourly.slice(0, 24).map((h) => ({
      label: h.time.slice(11, 16),
      value: h.pressure,
    }));
  } else if (selectedMetric === 'air_quality') {
    chartUnit = 'AQI';
    chartStroke = Palette.amberWarning;
    chartFill = 'rgba(245, 158, 11, 0.2)';
    const aqList = weatherData?.airQuality || [];
    chartData = aqList.slice(0, 24).map((a) => ({
      label: a.time.slice(11, 16),
      value: a.usAqi ?? 0,
    }));
  }

  // Active stats depending on metric
  const tempStats = analytics?.temperature.hourlyStats;
  const precipStats = analytics?.precipitation;
  const windStats = analytics?.wind;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weather Intelligence & Analytics</Text>
          <Text style={styles.subtitle}>
            {currentLocation.name} · Statistical Modeling & Trends
          </Text>
        </View>
        <Ionicons name="analytics" size={24} color={Palette.cyanGlow} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWeather}
            tintColor={Palette.cyanGlow}
          />
        }
      >
        {/* Metric Selector Tabs */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricFilterRow}>
            {[
              { id: 'temperature', label: 'Temperature', icon: 'thermometer-outline' },
              { id: 'precipitation', label: 'Precipitation', icon: 'rainy-outline' },
              { id: 'wind', label: 'Wind Speed', icon: 'speedometer-outline' },
              { id: 'pressure', label: 'Barometer', icon: 'pulse-outline' },
              { id: 'air_quality', label: 'Air Quality', icon: 'leaf-outline' },
            ].map((m) => {
              const isSelected = selectedMetric === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.metricTab, isSelected && styles.metricTabActive]}
                  onPress={() => setSelectedMetric(m.id as SelectedMetric)}
                >
                  <Ionicons
                    name={m.icon as any}
                    size={16}
                    color={isSelected ? Palette.cyanGlow : Palette.textSecondaryDark}
                  />
                  <Text style={[styles.metricTabText, isSelected && styles.metricTabTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Scope Toggle */}
          <View style={styles.periodToggleRow}>
            <TouchableOpacity
              style={[styles.periodBtn, selectedPeriod === '24h' && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod('24h')}
            >
              <Text style={[styles.periodText, selectedPeriod === '24h' && styles.periodTextActive]}>
                24-Hour Hourly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodBtn, selectedPeriod === '7d' && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod('7d')}
            >
              <Text style={[styles.periodText, selectedPeriod === '7d' && styles.periodTextActive]}>
                7-Day Daily
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Chart Display */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartTitleBar}>
            <Text style={styles.chartTitleText}>
              {selectedMetric.toUpperCase()} TREND ({selectedPeriod.toUpperCase()})
            </Text>
            <Text style={styles.chartUnitsBadge}>{chartUnit}</Text>
          </View>

          <InteractiveLineChart
            data={chartData}
            height={200}
            unit={chartUnit}
            strokeColor={chartStroke}
            fillColor={chartFill}
            showPoints={chartData.length <= 24}
          />
        </View>

        {/* Statistical Summary KPI Cards (Requirement 4F) */}
        {tempStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistical Foundation</Text>
            <View style={styles.kpiGrid}>
              <KpiCard
                title="Arithmetic Mean"
                value={tempStats.mean}
                unit="°C"
                subtitle="Calculated average"
                iconName="calculator-outline"
                iconColor={Palette.cyanGlow}
              />
              <KpiCard
                title="Statistical Median"
                value={tempStats.median}
                unit="°C"
                subtitle="Central observation"
                iconName="funnel-outline"
                iconColor={Palette.azureBlue}
              />
            </View>

            <View style={styles.kpiGrid}>
              <KpiCard
                title="Extreme Minimum"
                value={tempStats.min}
                unit="°C"
                subtitle="Lowest reading"
                iconName="arrow-down-circle-outline"
                iconColor={Palette.emeraldFresh}
              />
              <KpiCard
                title="Extreme Maximum"
                value={tempStats.max}
                unit="°C"
                subtitle="Peak reading"
                iconName="arrow-up-circle-outline"
                iconColor={Palette.roseAlert}
              />
            </View>

            <View style={styles.kpiGrid}>
              <KpiCard
                title="Observation Range"
                value={tempStats.range}
                unit="°C"
                subtitle="Max - Min spread"
                iconName="swap-horizontal-outline"
                iconColor={Palette.indigoPulse}
              />
              <KpiCard
                title="Standard Deviation"
                value={`±${tempStats.standardDeviation}`}
                unit="°C"
                subtitle="Thermal dispersion"
                iconName="git-commit-outline"
                iconColor={Palette.violetMisty}
              />
            </View>
          </View>
        )}

        {/* Grounded Natural Language Observations (Requirement 4G) */}
        {analytics?.insights && analytics.insights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Automated Weather Insights</Text>
              <Text style={styles.sectionSubtitle}>Derived strictly from active dataset</Text>
            </View>

            {analytics.insights.map((insight) => (
              <View key={insight.id} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={
                      insight.severity === 'alert'
                        ? 'alert-circle'
                        : insight.severity === 'warning'
                        ? 'warning'
                        : 'information-circle'
                    }
                    size={18}
                    color={
                      insight.severity === 'alert'
                        ? Palette.roseAlert
                        : insight.severity === 'warning'
                        ? Palette.amberWarning
                        : Palette.cyanGlow
                    }
                  />
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightStatement}>{insight.statement}</Text>
                <Text style={styles.insightMeta}>Attribution: {insight.derivedFrom}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interactive Architecture Diagram (Requirement 5) */}
        <SystemArchitectureDiagram />

        {/* SQLite & Firebase Synchronization Diagram (Requirement 5) */}
        <SyncFlowDiagram />
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
  filterSection: {
    marginBottom: Spacing.sm,
  },
  metricFilterRow: {
    paddingVertical: Spacing.xs,
  },
  metricTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cardSurface,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginRight: Spacing.sm,
  },
  metricTabActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Palette.cyanGlow,
  },
  metricTabText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    marginLeft: 6,
    fontWeight: '600',
  },
  metricTabTextActive: {
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  periodToggleRow: {
    flexDirection: 'row',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    padding: 3,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  periodBtnActive: {
    backgroundColor: Palette.deepSlate,
  },
  periodText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  periodTextActive: {
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  chartWrapper: {
    marginVertical: Spacing.sm,
  },
  chartTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitleText: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chartUnitsBadge: {
    ...Typography.caption,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  section: {
    marginVertical: Spacing.sm,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
  },
  kpiGrid: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs,
  },
  insightCard: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginLeft: 6,
  },
  insightStatement: {
    ...Typography.bodyMedium,
    color: Palette.textSecondaryDark,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightMeta: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    fontStyle: 'italic',
  },
});
