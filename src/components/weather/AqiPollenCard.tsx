import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AirQualityReading } from '@/models/weather.types';

interface AqiPollenCardProps {
  airQuality?: AirQualityReading;
}

export const AqiPollenCard: React.FC<AqiPollenCardProps> = ({ airQuality }) => {
  const aqiValue = airQuality?.usAqi ?? (airQuality?.europeanAqi ? Math.round(airQuality.europeanAqi * 20) : 42);

  let category = 'Good';
  let barColor = '#4ADE80';
  let fillPercent = 20;

  if (aqiValue <= 50) {
    category = 'Good';
    barColor = '#4ADE80';
    fillPercent = Math.max(12, (aqiValue / 50) * 33);
  } else if (aqiValue <= 100) {
    category = 'Satisfactory';
    barColor = '#84CC16';
    fillPercent = 33 + ((aqiValue - 50) / 50) * 33;
  } else if (aqiValue <= 150) {
    category = 'Moderate';
    barColor = '#FBBF24';
    fillPercent = 66 + ((aqiValue - 100) / 50) * 20;
  } else if (aqiValue <= 200) {
    category = 'Poor';
    barColor = '#F97316';
    fillPercent = 86;
  } else {
    category = 'Very Poor';
    barColor = '#EF4444';
    fillPercent = 100;
  }

  return (
    <View style={styles.container}>
      {/* AQI Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>AQI</Text>
        <Text style={styles.aqiStatusText}>
          {category}({aqiValue})
        </Text>
        <View style={styles.track}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, Math.max(5, fillPercent))}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>

      {/* Pollen Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Pollen</Text>
        <View style={styles.pollenRow}>
          <View style={styles.pollenItem}>
            <View style={styles.leafCircle}>
              <Ionicons name="leaf" size={26} color="rgba(255, 255, 255, 0.4)" />
            </View>
            <Text style={styles.pollenType}>Tree</Text>
            <Text style={styles.pollenValue}>None</Text>
          </View>

          <View style={styles.pollenItem}>
            <View style={styles.leafCircle}>
              <Ionicons name="leaf" size={26} color="rgba(255, 255, 255, 0.4)" />
            </View>
            <Text style={styles.pollenType}>Grass</Text>
            <Text style={styles.pollenValue}>None</Text>
          </View>

          <View style={styles.pollenItem}>
            <View style={styles.leafCircle}>
              <Ionicons name="leaf" size={26} color="rgba(255, 255, 255, 0.4)" />
            </View>
            <Text style={styles.pollenType}>Ragweed</Text>
            <Text style={styles.pollenValue}>None</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    gap: 8,
  },
  card: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(226, 232, 240, 0.7)',
    marginBottom: 6,
  },
  aqiStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  pollenRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 4,
  },
  pollenItem: {
    alignItems: 'center',
    flex: 1,
  },
  leafCircle: {
    marginBottom: 6,
  },
  pollenType: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.6)',
    marginBottom: 2,
  },
  pollenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
