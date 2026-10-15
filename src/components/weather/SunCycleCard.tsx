import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Line,
} from 'react-native-svg';

interface SunCycleCardProps {
  sunriseTime?: string;
  sunsetTime?: string;
}

export const SunCycleCard: React.FC<SunCycleCardProps> = ({
  sunriseTime,
  sunsetTime,
}) => {
  const svgWidth = 320;
  const svgHeight = 75;

  // Format sunrise / sunset
  const formatTime = (timeStr?: string, fallback: string = '6:00 am') => {
    if (!timeStr) return fallback;
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) {
      // If it's already HH:MM
      if (/^\d{1,2}:\d{2}/.test(timeStr)) {
        return timeStr;
      }
      return fallback;
    }
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  const formattedSunrise = formatTime(sunriseTime, '6:28 am');
  const formattedSunset = formatTime(sunsetTime, '6:11 pm');

  // Compute sun orb position along parabola y = a*(x-h)^2 + k
  // Path from (20, 58) to peak (160, 18) to (300, 58)
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;
  // Day duration assumption: 6:00 to 18:30 (12.5 hrs)
  const dayProgress = Math.min(1, Math.max(0, (currentHours - 6.0) / 12.5));
  const sunX = 20 + dayProgress * 280;
  // Parabola formula: at x=20 y=58, at x=160 y=18, at x=300 y=58
  const normX = (sunX - 160) / 140;
  const sunY = 18 + normX * normX * 40;
  const isNight = currentHours < 6.0 || currentHours > 18.5;

  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <Defs>
            <LinearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#EAB308" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#FACC15" stopOpacity="1" />
              <Stop offset="100%" stopColor="#EAB308" stopOpacity="0.4" />
            </LinearGradient>

            <RadialGradient id="sunGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <Stop offset="40%" stopColor="#FACC15" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Horizon line */}
          <Line
            x1="10"
            y1="58"
            x2="310"
            y2="58"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />

          {/* Parabolic golden arc */}
          <Path
            d="M 20,58 Q 160,-2 300,58"
            stroke="url(#sunArcGrad)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Sun marker orb (if daytime, display glowing sun; if night, subtle position) */}
          <Circle
            cx={sunX}
            cy={sunY}
            r="12"
            fill="url(#sunGlow)"
            opacity={isNight ? 0.4 : 1}
          />
          <Circle
            cx={sunX}
            cy={sunY}
            r="4.5"
            fill={isNight ? '#94A3B8' : '#FEF9C3'}
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
        </Svg>
      </View>

      {/* Sunrise & Sunset Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Sunrise</Text>
          <Text style={styles.timeValue}>{formattedSunrise}</Text>
        </View>

        <View style={[styles.infoItem, styles.alignRight]}>
          <Text style={styles.label}>Sunset</Text>
          <Text style={styles.timeValue}>{formattedSunset}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  infoItem: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.6)',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
