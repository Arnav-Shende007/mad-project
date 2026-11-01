/**
 * AtmosIQ - KPI Metric Card
 * Modern atmospheric dashboard card with icon, dynamic values, and trend indicators.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  badgeText?: string;
  badgeColor?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  iconName,
  iconColor = Palette.cyanGlow,
  badgeText,
  badgeColor = Palette.cyanAccent,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: `${badgeColor}20`, borderColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
    flexBasis: 120,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    margin: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  title: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  value: {
    fontVariant: ['tabular-nums'],
    ...Typography.titleLarge,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
  },
  unit: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginLeft: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textMutedDark,
    marginTop: 4,
  },
});
