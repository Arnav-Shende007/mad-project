/**
 * AtmosIQ - Interactive SVG Bar Chart
 * Dual-range temperature bars or single precipitation bars with high readability.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export interface BarChartItem {
  label: string;
  primaryValue: number; // e.g. Max temp or rain amount
  secondaryValue?: number; // e.g. Min temp
}

interface Props {
  data: BarChartItem[];
  height?: number;
  unit?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isDualRange?: boolean;
}

export function InteractiveBarChart({
  data,
  height = 190,
  unit = '°C',
  primaryColor = Palette.cyanAccent,
  secondaryColor = Palette.azureBlue,
  isDualRange = true,
}: Props) {
  const [chartWidth, setChartWidth] = useState(320);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 50) setChartWidth(w);
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>No data available for bar chart</Text>
      </View>
    );
  }

  const allValues: number[] = [];
  data.forEach((d) => {
    allValues.push(d.primaryValue);
    if (d.secondaryValue !== undefined) allValues.push(d.secondaryValue);
  });

  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) + (isDualRange ? 3 : 1);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 25;
  const paddingBottom = 30;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;
  const groupWidth = usableWidth / data.length;
  const barWidth = Math.min(groupWidth * 0.35, 18);

  const active = selectedIdx !== null ? data[selectedIdx] : data[0];

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {active && (
        <View style={styles.header}>
          <Text style={styles.headerLabel}>{active.label}</Text>
          <View style={styles.headerValues}>
            <Text style={[styles.valText, { color: primaryColor }]}>
              High: {active.primaryValue}{unit}
            </Text>
            {active.secondaryValue !== undefined && (
              <Text style={[styles.valText, { color: secondaryColor, marginLeft: 12 }]}>
                Low: {active.secondaryValue}{unit}
              </Text>
            )}
          </View>
        </View>
      )}

      <Svg width={chartWidth} height={height}>
        {/* Baseline grid */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + usableHeight}
          x2={chartWidth - paddingRight}
          y2={paddingTop + usableHeight}
          stroke={Palette.cardBorder}
          strokeWidth={1}
        />

        {data.map((item, idx) => {
          const groupCenterX = paddingLeft + idx * groupWidth + groupWidth / 2;

          // Primary Bar (e.g. Max Temp)
          const primaryHeight = Math.max(4, ((item.primaryValue - minVal) / range) * usableHeight);
          const primaryY = paddingTop + usableHeight - primaryHeight;
          const primaryX = isDualRange ? groupCenterX - barWidth - 1 : groupCenterX - barWidth / 2;

          // Secondary Bar (e.g. Min Temp)
          let secondaryHeight = 0;
          let secondaryY = 0;
          let secondaryX = 0;
          if (isDualRange && item.secondaryValue !== undefined) {
            secondaryHeight = Math.max(4, ((item.secondaryValue - minVal) / range) * usableHeight);
            secondaryY = paddingTop + usableHeight - secondaryHeight;
            secondaryX = groupCenterX + 1;
          }

          const isSelected = selectedIdx === idx;

          return (
            <React.Fragment key={`bar-group-${idx}`}>
              {/* Primary Bar */}
              <Rect
                x={primaryX}
                y={primaryY}
                width={barWidth}
                height={primaryHeight}
                rx={4}
                fill={isSelected ? Palette.cyanGlow : primaryColor}
                opacity={isSelected ? 1 : 0.85}
              />

              {/* Secondary Bar */}
              {isDualRange && (
                <Rect
                  x={secondaryX}
                  y={secondaryY}
                  width={barWidth}
                  height={secondaryHeight}
                  rx={4}
                  fill={isSelected ? Palette.white : secondaryColor}
                  opacity={isSelected ? 1 : 0.75}
                />
              )}

              {/* Day / Period Label */}
              <SvgText
                x={groupCenterX}
                y={height - 8}
                fill={isSelected ? Palette.white : Palette.textSecondaryDark}
                fontSize={10}
                fontWeight={isSelected ? '700' : '500'}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Tap targets */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', left: paddingLeft, width: usableWidth }]}>
        {data.map((_, idx) => (
          <TouchableOpacity
            key={`tap-target-${idx}`}
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSelectedIdx(idx)}
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
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  headerLabel: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    fontWeight: '600',
  },
  headerValues: {
    flexDirection: 'row',
  },
  valText: {
    ...Typography.bodySmall,
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
