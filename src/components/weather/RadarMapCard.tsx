import { Palette } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/state/settingsContext';

interface RadarMapCardProps {
  cityName?: string;
  temperature?: number;
  unitSymbol?: string;
}

export const RadarMapCard: React.FC<RadarMapCardProps> = ({
  cityName = 'Pune',
  temperature = 25,
  unitSymbol = '°',
}) => {
  const { formatTemperature } = useSettings();
  const mapHeight = 160;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Radar and maps</Text>

      {/* Stylized Thermal Radar Map Container */}
      <View style={styles.mapContainer}>
        <Svg width="100%" height={mapHeight} viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
          <Defs>
            {/* Ocean Gradient */}
            <LinearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#2563EB" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.85" />
            </LinearGradient>

            {/* Landmass Thermal Heat Gradient */}
            <RadialGradient id="thermalCenter" cx="65%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#DC2626" stopOpacity="0.85" />
              <Stop offset="35%" stopColor="#EA580C" stopOpacity="0.8" />
              <Stop offset="65%" stopColor="#F59E0B" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
            </RadialGradient>

            {/* Coastal Land Gradient */}
            <LinearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="50%">
              <Stop offset="0%" stopColor="#B45309" stopOpacity="0.75" />
              <Stop offset="60%" stopColor="#D97706" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#B91C1C" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          {/* Ocean Base */}
          <Rect x="0" y="0" width="340" height="160" fill="url(#oceanGrad)" rx="14" />

          {/* Landmass peninsula silhouette (reminiscent of West coast India / sub-continent in reference) */}
          <Path
            d="M 60,0
               C 80,25 100,45 110,65
               C 118,80 120,95 125,120
               C 130,140 145,155 155,160
               L 340,160
               L 340,0
               Z"
            fill="url(#landGrad)"
          />

          {/* Thermal heat map blob overlay */}
          <Circle cx="200" cy="80" r="75" fill="url(#thermalCenter)" />
          <Circle cx="150" cy="110" r="45" fill="#EF4444" fillOpacity="0.4" />

          {/* Subtle radar scan waves */}
          <Circle
            cx="145"
            cy="75"
            r="20"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeDasharray="2,3"
            fill="none"
            opacity={0.6}
          />
          <Circle
            cx="145"
            cy="75"
            r="38"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeDasharray="3,4"
            fill="none"
            opacity={0.4}
          />

          {/* Location marker pin */}
          <Circle cx="145" cy="75" r="4.5" fill="#FFFFFF" />
          <Circle cx="145" cy="75" r="2" fill="#DC2626" />
        </Svg>

        {/* Floating city label over pin */}
        <View style={styles.pinLabelWrap}>
          <Ionicons name="location-sharp" size={12} color="#FFFFFF" />
          <Text style={styles.pinLabelText}>{cityName}</Text>
        </View>
      </View>

      {/* Footer text */}
      <Text style={styles.footerNote}>
        Current temperature of approximately {formatTemperature(temperature)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(226, 232, 240, 0.8)',
    marginBottom: 10,
  },
  mapContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pinLabelWrap: {
    position: 'absolute',
    top: 55,
    left: '42%',
    maxWidth: '55%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 3,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: Palette.textSecondaryDark,
    marginTop: 8,
  },
});
