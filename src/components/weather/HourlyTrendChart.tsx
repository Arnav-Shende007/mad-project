/**
 * AtmosIQ - Hourly Forecast Trend Chart Component
 * Horizontal hourly forecast list with connected temperature spline, icons,
 * rain percentages, and "48-hour forecast >" navigation link.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { HourlyForecastItem } from '@/models/weather.types';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';

interface HourlyTrendChartProps {
  hourly: HourlyForecastItem[];
  formatTemperature: (val: number) => string;
  onPressFullForecast?: () => void;
}

const ITEM_WIDTH = 64;
const CHART_HEIGHT = 44;

export function HourlyTrendChart({
  hourly,
  formatTemperature,
  onPressFullForecast,
}: HourlyTrendChartProps) {
  // Show up to next 16 hours in the glanceable carousel
  const items = hourly.slice(0, 16);
  if (items.length === 0) return null;

  const temps = items.map((i) => i.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  // Compute SVG point coordinates
  const points = items.map((item, idx) => {
    const x = idx * ITEM_WIDTH + ITEM_WIDTH / 2;
    // Invert Y: higher temperature is near top (padding 8 to CHART_HEIGHT - 8)
    const normalized = (item.temperature - minTemp) / range;
    const y = CHART_HEIGHT - 10 - normalized * (CHART_HEIGHT - 20);
    return { x, y };
  });

  // Construct smooth bezier SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const svgWidth = items.length * ITEM_WIDTH;

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        <View>
          {/* Top Row: Time, Icon, Temperature */}
          <View style={styles.itemsRow}>
            {items.map((item, idx) => {
              const hourDate = new Date(item.time);
              const hourStr = isNaN(hourDate.getTime())
                ? item.time.slice(11, 16)
                : hourDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
              const condition = getWeatherConditionInfo(item.weatherCode);

              return (
                <View key={`time-${idx}`} style={styles.columnItem}>
                  <Text style={styles.timeLabel}>{idx === 0 ? 'Now' : hourStr}</Text>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={condition.iconName as any}
                      size={20}
                      color={condition.color || Palette.cyanGlow}
                    />
                  </View>
                  <Text style={styles.tempLabel}>{formatTemperature(item.temperature)}</Text>
                </View>
              );
            })}
          </View>

          {/* Middle Row: Continuous Connecting Spline Line & Dots */}
          <View style={styles.chartWrapper}>
            <Svg width={svgWidth} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.9" />
                  <Stop offset="0.5" stopColor="#67E8F9" stopOpacity="0.9" />
                  <Stop offset="1" stopColor="#818CF8" stopOpacity="0.9" />
                </LinearGradient>
              </Defs>

              <Path
                d={pathD}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {points.map((pt, i) => (
                <Circle
                  key={`pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />
              ))}
            </Svg>
          </View>

          {/* Bottom Row: Precipitation Percentages */}
          <View style={styles.popRow}>
            {items.map((item, idx) => (
              <View key={`pop-${idx}`} style={styles.popItem}>
                <Text style={styles.popText}>
                  • {item.precipitationProbability || 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Link */}
      <TouchableOpacity
        style={styles.footerLink}
        onPress={onPressFullForecast}
        activeOpacity={0.7}
      >
        <Text style={styles.footerLinkText}>48-hour forecast</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(14, 35, 71, 0.65)',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemsRow: {
    flexDirection: 'row',
  },
  columnItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  timeLabel: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 11,
  },
  iconBox: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tempLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.white,
    marginBottom: 4,
  },
  chartWrapper: {
    height: CHART_HEIGHT,
  },
  popRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  popItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  popText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: Spacing.sm,
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 4,
  },
});
