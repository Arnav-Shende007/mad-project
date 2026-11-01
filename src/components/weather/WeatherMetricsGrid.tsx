import { Palette } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CurrentWeather } from '@/models/weather.types';
import { useSettings } from '@/state/settingsContext';

interface WeatherMetricsGridProps {
  current?: CurrentWeather;
  unitSymbol?: string;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  current,
  unitSymbol = '°',
}) => {
  const { formatTemperature, formatWindSpeed } = useSettings();
  // 1. UV Index
  const uv = current?.uvIndex ?? 1;
  let uvCategory = 'Low';
  let uvSubtitle = 'Low rest of day';
  if (uv >= 11) {
    uvCategory = 'Extreme';
    uvSubtitle = 'Stay indoors';
  } else if (uv >= 8) {
    uvCategory = 'Very High';
    uvSubtitle = 'Protection needed';
  } else if (uv >= 6) {
    uvCategory = 'High';
    uvSubtitle = 'Protection needed';
  } else if (uv >= 3) {
    uvCategory = 'Moderate';
    uvSubtitle = 'Moderate exposure';
  }
  const uvDotPos = Math.min(130, Math.max(10, (uv / 11) * 130));

  // 2. Humidity
  const humidity = current?.relativeHumidity ?? 57;
  const humFillWidth = Math.min(100, Math.max(5, humidity));

  // 3. Dew point (calculate if missing)
  const temp = current?.temperature ?? 25;
  const dewPoint =
    current?.dewPoint ?? Math.round(temp - (100 - humidity) / 5);
  let dewSubtitle = 'Comfortable';
  if (dewPoint > 20) {
    dewSubtitle = 'High humidity';
  } else if (dewPoint >= 15) {
    dewSubtitle = 'Noticeable humidity';
  } else if (dewPoint < 10) {
    dewSubtitle = 'A bit dry';
  }

  // 4. Wind
  const windSpeed = current?.windSpeed ?? 0;
  const windDir = current?.windDirection ?? 0;
  let windSubtitle = "It's calm";
  if (windSpeed > 35) {
    windSubtitle = 'Strong wind';
  } else if (windSpeed > 15) {
    windSubtitle = 'Moderate breeze';
  } else if (windSpeed > 4) {
    windSubtitle = 'Light breeze';
  }

  // Compass needle calculation
  const compassRadius = 38;
  const compassCenter = 44;
  const angleRad = ((windDir - 90) * Math.PI) / 180;
  const needleX = compassCenter + (compassRadius - 6) * Math.cos(angleRad);
  const needleY = compassCenter + (compassRadius - 6) * Math.sin(angleRad);

  // 5. Pressure
  const pressure = current?.pressure ?? 1010.7;
  let pressureSubtitle = 'Stable atmospheric pressure';
  if (pressure > 1018) {
    pressureSubtitle = 'High pressure system';
  } else if (pressure < 1005) {
    pressureSubtitle = 'Low pressure system';
  } else {
    pressureSubtitle = 'Currently steady';
  }

  // 6. Visibility
  const visibility = current?.visibility ?? 4.0;
  let visSubtitle = 'Moderate right now';
  if (visibility >= 10) {
    visSubtitle = 'Clear view';
  } else if (visibility < 3) {
    visSubtitle = 'Low visibility';
  }

  return (
    <View style={styles.container}>
      {/* ROW 1: UV Index & Humidity */}
      <View style={styles.row}>
        {/* UV Index Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny-outline" size={15} color="#FBBF24" />
            <Text style={styles.headerLabel}>UV Index</Text>
          </View>
          <Text style={styles.subtitle}>{uvSubtitle}</Text>
          <Text style={styles.largeValue}>{uvCategory}</Text>

          {/* UV Multi-Color Gradient Bar */}
          <View style={styles.uvBarContainer}>
            <Svg width="100%" height={12} viewBox="0 0 140 12">
              <Defs>
                <LinearGradient id="uvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#4ADE80" />
                  <Stop offset="30%" stopColor="#FBBF24" />
                  <Stop offset="65%" stopColor="#FB923C" />
                  <Stop offset="85%" stopColor="#F87171" />
                  <Stop offset="100%" stopColor="#C084FC" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="3" width="140" height="6" rx="3" fill="url(#uvGrad)" />
              <Circle
                cx={uvDotPos}
                cy="6"
                r="5"
                fill="#FFFFFF"
                stroke="#0B132B"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        </View>

        {/* Humidity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water-outline" size={15} color="#38BDF8" />
            <Text style={styles.headerLabel}>Humidity</Text>
          </View>
          <Text style={styles.subtitle}>Similar to yesterday</Text>
          <Text style={styles.largeValue}>{Math.round(humidity)}%</Text>

          {/* Humidity Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${humFillWidth}%` }]} />
          </View>
        </View>
      </View>

      {/* ROW 2: Wind & Dew point */}
      <View style={styles.row}>
        {/* Wind Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="navigate-outline" size={15} color="#A78BFA" />
            <Text style={styles.headerLabel}>Wind</Text>
          </View>
          <Text style={styles.subtitle}>{windSubtitle}</Text>

          {/* Circular Compass Gauge */}
          <View style={styles.compassWrap}>
            <Svg width={88} height={88} viewBox="0 0 88 88">
              {/* Outer dial ring */}
              <Circle
                cx={compassCenter}
                cy={compassCenter}
                r={compassRadius}
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="2"
                strokeDasharray="2,5"
                fill="none"
              />
              <Circle
                cx={compassCenter}
                cy={compassCenter}
                r={compassRadius - 6}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                fill="rgba(255, 255, 255, 0.02)"
              />
              {/* Cardinal indicator arrow */}
              <Path
                d={`M ${compassCenter},${compassCenter} L ${needleX},${needleY}`}
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Circle cx={needleX} cy={needleY} r="3" fill="#38BDF8" />
            </Svg>

            {/* Center Speed Value */}
            <View style={styles.compassCenterTextWrap}>
              <Text style={styles.compassSpeedText}>{formatWindSpeed(windSpeed).split(' ')[0]}</Text>
              <Text style={styles.compassUnitText}>{formatWindSpeed(windSpeed).split(' ')[1]}</Text>
            </View>
          </View>
        </View>

        {/* Dew point Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="thermometer-outline" size={15} color="#F472B6" />
            <Text style={styles.headerLabel}>Dew point</Text>
          </View>
          <Text style={styles.subtitle}>{dewSubtitle}</Text>
          <View style={styles.spacer} />
          <Text style={styles.giantValue}>
            {formatTemperature(dewPoint)}
          </Text>
        </View>
      </View>

      {/* ROW 3: Pressure & Visibility */}
      <View style={styles.row}>
        {/* Pressure Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer-outline" size={15} color="#34D399" />
            <Text style={styles.headerLabel}>Pressure</Text>
          </View>
          <Text style={styles.subtitle}>{pressureSubtitle}</Text>

          {/* Semicircular Pressure Gauge */}
          <View style={styles.gaugeWrap}>
            <Svg width={96} height={60} viewBox="0 0 96 60">
              {/* Arc track */}
              <Path
                d="M 12 52 A 38 38 0 0 1 84 52"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Arc fill */}
              <Path
                d="M 12 52 A 38 38 0 0 1 68 20"
                stroke="#60A5FA"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <View style={styles.gaugeCenterWrap}>
              <Text style={styles.gaugeValueText}>{pressure.toFixed(1)}</Text>
              <Text style={styles.gaugeUnitText}>mb</Text>
            </View>
          </View>
        </View>

        {/* Visibility Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={15} color="#FCD34D" />
            <Text style={styles.headerLabel}>Visibility</Text>
          </View>
          <Text style={styles.subtitle}>{visSubtitle}</Text>
          <View style={styles.spacer} />
          <Text style={styles.largeValue}>
            {visibility.toFixed(2)} km
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 125,
    backgroundColor: Palette.cardSurface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Palette.textSecondaryDark,
  },
  subtitle: {
    fontSize: 11,
    color: Palette.textMutedDark,
    lineHeight: 14,
    minHeight: 28,
  },
  largeValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  giantValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  spacer: {
    flex: 1,
  },
  uvBarContainer: {
    marginTop: 8,
    height: 14,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  compassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 88,
    marginVertical: 2,
  },
  compassCenterTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassSpeedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compassUnitText: {
    fontSize: 10,
    color: Palette.textMutedDark,
  },
  gaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  gaugeCenterWrap: {
    position: 'absolute',
    top: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gaugeUnitText: {
    fontSize: 10,
    color: Palette.textMutedDark,
  },
});
