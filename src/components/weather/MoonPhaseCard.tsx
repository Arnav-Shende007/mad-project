import { Text } from 'react-native';
import type { DailyForecastItem } from '@/models/weather.types';
import { Panel, ui } from './WeatherPanel';

const phases = ['🌑 New moon','🌒 Waxing crescent','🌓 First quarter','🌔 Waxing gibbous','🌕 Full moon','🌖 Waning gibbous','🌗 Last quarter','🌘 Waning crescent'];

export function MoonPhaseCard({day}: {day?: DailyForecastItem}) {
  const phase = day?.moonPhase;
  return <Panel title="Moon">
    <Text style={ui.text}>{phase != null && phase >= 0 && phase <= 1 ? phases[Math.round(phase * 8) % 8] : 'Phase unavailable'}</Text>
    <Text style={ui.note}>Moonrise · {day?.moonrise?.slice(11,16) || 'Unavailable'}</Text>
    <Text style={ui.note}>Moonset · {day?.moonset?.slice(11,16) || 'Unavailable'}</Text>
  </Panel>;
}
