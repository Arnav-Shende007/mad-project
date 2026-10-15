import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyForecastItem } from '@/models/weather.types';

interface TemperatureInsightCardProps {
  today?: DailyForecastItem;
  tomorrow?: DailyForecastItem;
  unitSymbol?: string;
}

export const TemperatureInsightCard: React.FC<TemperatureInsightCardProps> = ({
  today,
  tomorrow,
  unitSymbol = '°',
}) => {
  if (!today || !tomorrow) {
    return null;
  }

  const delta = Math.round(tomorrow.temperatureMax - today.temperatureMax);
  let insightText = 'Temperature is similar to today';
  let diffBadge = '0°';

  if (delta > 0) {
    insightText = 'Temperature is a little higher than today';
    diffBadge = `${delta}${unitSymbol}↑`;
  } else if (delta < 0) {
    insightText = 'Temperature is a little lower than today';
    diffBadge = `${Math.abs(delta)}${unitSymbol}↓`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="thermometer-outline" size={16} color="#7DD3FC" />
        </View>
        <Text style={styles.headerTitle}>{"Tomorrow's Temperature"}</Text>
      </View>

      <View style={styles.contentRow}>
        <Text style={styles.insightText} numberOfLines={2}>
          {insightText}
        </Text>
        <Text style={styles.deltaBadge}>{diffBadge}</Text>
      </View>

      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(125, 211, 252, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: 'rgba(226, 232, 240, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  deltaBadge: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
