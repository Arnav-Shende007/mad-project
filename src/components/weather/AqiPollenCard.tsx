import { Text } from 'react-native';
import type { AirQualityReading } from '@/models/weather.types';
import { Panel, ui } from './WeatherPanel';

export function AqiPollenCard({
  airQuality,
}: {
  airQuality?: AirQualityReading;
}) {
  const value = airQuality?.usAqi;
  const aqi =
    typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? Math.round(value)
      : null;
  const labels = [
    'Good',
    'Moderate',
    'Unhealthy for sensitive groups',
    'Unhealthy',
    'Very unhealthy',
    'Hazardous',
  ];
  const band = [50, 100, 150, 200, 300, Infinity].findIndex(
    (limit) => aqi !== null && aqi <= limit,
  );
  return (
    <Panel title="Air quality & pollen">
      <Text style={ui.text}>
        US AQI · {aqi === null ? 'Unavailable' : aqi + ' · ' + labels[band]}
      </Text>
      {(['birch', 'grass', 'ragweed'] as const).map((type) => (
        <Text key={type} style={ui.note}>
          {type[0].toUpperCase() + type.slice(1)} pollen ·{' '}
          {airQuality?.[type] == null
            ? 'Unavailable'
            : airQuality[type] + ' grains/m³'}
        </Text>
      ))}
      <Text style={ui.note}>
        CAMS via Open-Meteo
        {airQuality ? ' · ' + airQuality.time.replace('T', ' ') : ''}
      </Text>
    </Panel>
  );
}
