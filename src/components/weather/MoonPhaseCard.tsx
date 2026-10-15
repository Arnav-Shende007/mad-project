import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
} from 'react-native-svg';

interface MoonPhaseCardProps {
  phaseName?: string;
  moonriseTime?: string;
  moonsetTime?: string;
}

export const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
  phaseName = 'Waning crescent',
  moonriseTime = '10:28 am',
  moonsetTime = '9:29 pm',
}) => {
  return (
    <View style={styles.card}>
      {/* Left side: Realistic Moon graphic and phase name */}
      <View style={styles.leftContainer}>
        <View style={styles.moonSvgWrap}>
          <Svg width={72} height={72} viewBox="0 0 72 72">
            <Defs>
              {/* Moon texture gradient */}
              <RadialGradient id="moonBody" cx="40%" cy="40%" rx="60%" ry="60%">
                <Stop offset="0%" stopColor="#E2E8F0" />
                <Stop offset="60%" stopColor="#94A3B8" />
                <Stop offset="100%" stopColor="#475569" />
              </RadialGradient>

              {/* Shadow gradient for waning crescent effect */}
              <LinearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#0B132B" stopOpacity="0.92" />
                <Stop offset="65%" stopColor="#0B132B" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#0B132B" stopOpacity="0.1" />
              </LinearGradient>
            </Defs>

            {/* Base lunar body */}
            <Circle cx="36" cy="36" r="32" fill="url(#moonBody)" />

            {/* Subtle craters */}
            <Circle cx="28" cy="24" r="5" fill="#64748B" opacity={0.4} />
            <Circle cx="25" cy="42" r="7" fill="#64748B" opacity={0.35} />
            <Circle cx="44" cy="28" r="4" fill="#64748B" opacity={0.3} />
            <Circle cx="38" cy="46" r="6" fill="#64748B" opacity={0.35} />
            <Circle cx="48" cy="40" r="3" fill="#64748B" opacity={0.25} />

            {/* Shadow overlay creating waning crescent (lighting on right edge) */}
            <Path
              d="M 36,4
                 A 32,32 0 1 0 36,68
                 A 22,32 0 0 1 36,4
                 Z"
              fill="#08101E"
              opacity={0.88}
            />

            {/* Faint rim glow */}
            <Circle
              cx="36"
              cy="36"
              r="32"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              fill="none"
            />
          </Svg>
        </View>

        <Text style={styles.phaseNameText}>{phaseName}</Text>
      </View>

      {/* Right side: Moonrise & Moonset */}
      <View style={styles.rightContainer}>
        <View style={styles.eventItem}>
          <Text style={styles.eventLabel}>Moonrise</Text>
          <Text style={styles.eventTime}>{moonriseTime}</Text>
        </View>

        <View style={styles.eventItem}>
          <Text style={styles.eventLabel}>Moonset</Text>
          <Text style={styles.eventTime}>{moonsetTime}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(16, 36, 70, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    alignItems: 'center',
    flex: 1,
  },
  moonSvgWrap: {
    marginBottom: 8,
  },
  phaseNameText: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.75)',
    fontWeight: '500',
  },
  rightContainer: {
    flex: 1,
    paddingLeft: 24,
    gap: 16,
  },
  eventItem: {
    alignItems: 'flex-start',
  },
  eventLabel: {
    fontSize: 12,
    color: 'rgba(226, 232, 240, 0.6)',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
