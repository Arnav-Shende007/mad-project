import { Palette } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyForecastItem } from '@/models/weather.types';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';
import { useSettings } from '@/state/settingsContext';

interface DailyForecastCardProps {
  daily: DailyForecastItem[];
  unitSymbol?: string;
  onPressMore?: () => void;
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({
  daily,
  unitSymbol = '°',
  onPressMore,
}) => {
  const { formatTemperature } = useSettings();
  if (!daily || daily.length === 0) {
    return null;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Map daily items to display rows
  const rows = daily.slice(0, 8).map((item, index) => {
    let dayLabel = '';
    const itemDate = new Date(`${item.date}T12:00:00`);
    const isToday = item.date === todayStr || index === 0;

    if (isToday) {
      dayLabel = 'Today';
    } else {
      dayLabel = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
    }

    const condition = getWeatherConditionInfo(item.weatherCode);
    const pop = item.precipitationProbabilityMax ?? 0;
    const maxT = Math.round(item.temperatureMax);
    const minT = Math.round(item.temperatureMin);

    return {
      key: item.date || `day-${index}`,
      dayLabel,
      pop,
      iconName: condition.iconName as any,
      iconColor: condition.color || '#FDE047',
      maxT,
      minT,
    };
  });

  return (
    <View style={styles.card}>
      {rows.map((row, idx) => (
        <View key={row.key} style={[styles.row, idx > 0 && styles.rowBorder]}>
          {/* Day Label */}
          <Text style={[styles.dayText, row.dayLabel === 'Today' && styles.todayText]}>
            {row.dayLabel}
          </Text>

          {/* Precipitation probability */}
          <View style={styles.popContainer}>
            {row.pop > 0 ? (
              <Text style={styles.popText}>• {row.pop}%</Text>
            ) : (
              <Text style={styles.popTextDim}>• 0%</Text>
            )}
          </View>

          {/* Weather Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={row.iconName} size={20} color={row.iconColor} />
          </View>

          {/* High / Low Temp */}
          <View style={styles.tempContainer}>
            <Text style={styles.maxTempText}>
              {formatTemperature(row.maxT)}
            </Text>
            <Text style={styles.minTempText}>
              {formatTemperature(row.minT)}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer link */}
      <TouchableOpacity
        style={styles.moreButton}
        activeOpacity={0.7}
        onPress={onPressMore}
      >
        <Text style={styles.moreButtonText}>View full forecast</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(226, 232, 240, 0.6)" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  dayText: {
    flex: 1,
    minWidth: 48,
    fontSize: 15,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  popContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  popText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
  },
  popTextDim: {
    fontSize: 13,
    color: Palette.textMutedDark,
    fontWeight: '500',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  maxTempText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 30,
    textAlign: 'right',
  },
  minTempText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(226, 232, 240, 0.55)',
    minWidth: 30,
    textAlign: 'right',
  },
  moreButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  moreButtonText: {
    fontSize: 13,
    color: Palette.textSecondaryDark,
    fontWeight: '500',
  },
});
