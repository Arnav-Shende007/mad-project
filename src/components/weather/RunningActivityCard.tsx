import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CurrentWeather, HourlyForecastItem } from '@/models/weather.types';

interface RunningActivityCardProps {
  current?: CurrentWeather;
  hourly?: HourlyForecastItem[];
}

export const RunningActivityCard: React.FC<RunningActivityCardProps> = ({
  current,
  hourly = [],
}) => {
  // Determine overall running quality
  const temp = current?.temperature ?? 22;
  const rain = (current?.precipitation ?? 0) > 0;
  const wind = current?.windSpeed ?? 10;

  let rating = 'Good';
  let description = 'Good weather for running right now';

  if (rain) {
    rating = 'Poor';
    description = 'Rainy conditions outside, consider indoor cardio';
  } else if (temp > 33) {
    rating = 'Poor';
    description = 'High heat index, running not recommended';
  } else if (temp > 28 || wind > 35) {
    rating = 'Fair';
    description = 'Warm temperature, stay well hydrated';
  } else if (temp >= 14 && temp <= 24) {
    rating = 'Ideal';
    description = 'Perfect crisp temperature for running';
  }

  // Next 3 hours for activity status
  const next3Hours = hourly.slice(1, 4).map((h, i) => {
    const d = new Date(h.time);
    const timeLabel = isNaN(d.getTime())
      ? `+${i + 1}h`
      : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    let status = 'Good';
    let iconColor = '#4ADE80';
    let faceIcon = 'happy-outline';

    if (h.precipitation > 0 || h.temperature > 32) {
      status = 'Poor';
      iconColor = '#F87171';
      faceIcon = 'sad-outline';
    } else if (h.temperature > 27) {
      status = 'Fair';
      iconColor = '#FBBF24';
      faceIcon = 'ellipse-outline';
    }

    return {
      key: h.time || `hour-${i}`,
      timeLabel,
      status,
      iconColor,
      faceIcon,
    };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Running</Text>

      <View style={styles.mainContentRow}>
        {/* Left side: Runner icon and summary */}
        <View style={styles.leftSummary}>
          <View style={styles.runnerIconWrap}>
            <Ionicons name="walk" size={38} color="#FFFFFF" />
          </View>
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.descText} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Right side: 3 upcoming hours */}
        <View style={styles.rightHourlySlots}>
          {next3Hours.map((slot) => (
            <View key={slot.key} style={styles.slotItem}>
              <Text style={styles.slotTime}>{slot.timeLabel}</Text>
              <View style={[styles.faceBadge, { borderColor: slot.iconColor }]}>
                <Ionicons name={slot.faceIcon as any} size={18} color={slot.iconColor} />
              </View>
              <Text style={[styles.slotStatus, { color: slot.iconColor }]}>
                {slot.status}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Carousel dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
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
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(226, 232, 240, 0.8)',
    marginBottom: 8,
  },
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  leftSummary: {
    flex: 1.1,
    paddingRight: 12,
  },
  runnerIconWrap: {
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.7)',
    lineHeight: 16,
  },
  rightHourlySlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  slotTime: {
    fontSize: 10,
    color: 'rgba(226, 232, 240, 0.65)',
    marginBottom: 4,
  },
  faceBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 4,
    borderWidth: 1,
  },
  slotStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
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
