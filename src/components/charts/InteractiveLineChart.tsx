/**
 * AtmosIQ - Interactive SVG Line Chart
 * High-performance vector line and area chart compatible with Expo Go, iOS, Android, and Web.
 */

import React, { useId, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export interface LineChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface Props {
  data: LineChartPoint[];
  height?: number;
  unit?: string;
  strokeColor?: string;
  fillColor?: string;
  showPoints?: boolean;
}

export function InteractiveLineChart({
  data,
  height = 180,
  unit = '',
  strokeColor = Palette.cyanGlow,
  fillColor = 'rgba(34, 211, 238, 0.15)',
  showPoints = true,
}: Props) {
  const [chartWidth, setChartWidth] = useState(320);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gradientId = `line-fill-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 50) setChartWidth(w);
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>No data available for chart</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 25;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * usableWidth;
    const y = paddingTop + usableHeight - ((d.value - minVal) / range) * usableHeight;
    return { x, y, ...d };
  });

  // Construct SVG Path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  // Construct Area Path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + usableHeight} L ${points[0].x} ${paddingTop + usableHeight} Z`;

  const activePoint = (selectedIndex !== null ? points[selectedIndex] : undefined) ?? points[points.length - 1];

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {activePoint && (
        <View style={styles.activeHeader}>
          <Text style={styles.activeLabel}>{activePoint.label}</Text>
          <Text style={styles.activeValue}>
            {activePoint.value} {unit}
          </Text>
        </View>
      )}

      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={strokeColor} stopOpacity="0.35" />
            <Stop offset="1" stopColor={strokeColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal Grid lines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = paddingTop + usableHeight * (1 - pct);
          const gridVal = Number((minVal + range * pct).toFixed(1));
          return (
            <React.Fragment key={`grid-${idx}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={Palette.cardBorder}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 4}
                fill={Palette.textMutedDark}
                fontSize={9}
                textAnchor="end"
              >
                {gridVal}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Gradient fill underneath curve */}
        <Path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line Stroke */}
        <Path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />

        {/* Data points */}
        {showPoints &&
          points.map((pt, i) => (
            <Circle
              key={`pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={selectedIndex === i ? 5.5 : 3.5}
              fill={selectedIndex === i ? Palette.white : strokeColor}
              stroke={Palette.deepSlate}
              strokeWidth={2}
            />
          ))}

        {/* X-axis labels */}
        {points.map((pt, i) => {
          // Display every Nth label to prevent clutter
          const step = Math.ceil(points.length / Math.max(2, Math.floor(usableWidth / 60)));
          if (i % step !== 0 && i !== points.length - 1) return null;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={pt.x}
              y={height - 6}
              fill={Palette.textSecondaryDark}
              fontSize={10}
              textAnchor="middle"
            >
              {pt.label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Touch scrubber interaction overlay */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', left: paddingLeft, width: usableWidth }]}>
        {data.map((_, i) => (
          <TouchableOpacity
            key={`touch-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`${data[i].label}: ${data[i].value} ${unit}`}
            accessibilityState={{ selected: selectedIndex === i }}
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSelectedIndex(i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    overflow: 'hidden',
  },
  activeHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  activeLabel: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  activeValue: {
    fontVariant: ['tabular-nums'],
    ...Typography.bodyLarge,
    color: Palette.cyanGlow,
    fontWeight: '700',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Palette.textMutedDark,
  },
});
