import type {
  CompleteWeatherDataset,
  HourlyForecastItem,
} from '@/models/weather.types';

export const activities = [
  'Walk',
  'Run',
  'Cycle',
  'Commute',
  'Dry laundry',
] as const;
export type Activity = (typeof activities)[number];

function score(hour: HourlyForecastItem, activity: Activity) {
  const rain = hour.precipitationProbability;
  const wind = hour.windSpeed;
  if (activity === 'Dry laundry')
    return (
      rain * 2 + hour.relativeHumidity + Math.max(0, 15 - hour.temperature)
    );
  const target = activity === 'Run' ? 15 : 21;
  return (
    rain +
    Math.abs(hour.apparentTemperature - target) *
      (activity === 'Commute' ? 0.5 : 2) +
    wind * (activity === 'Cycle' ? 1.5 : 0.4) +
    (hour.uvIndex ?? 0)
  );
}

export function planDay(data: CompleteWeatherDataset, activity: Activity) {
  const start = data.current.time.slice(0, 13) + ':00';
  const upcoming = data.hourly.filter((h) => h.time >= start).slice(0, 24);
  const daylight = upcoming.filter((h) => {
    const day = data.daily.find((d) => d.date === h.time.slice(0, 10));
    return (
      day?.sunrise && day.sunset && h.time >= day.sunrise && h.time < day.sunset
    );
  });
  const candidates = activity === 'Commute' ? upcoming : daylight;
  return candidates.reduce<HourlyForecastItem | undefined>(
    (best, h) =>
      !best || score(h, activity) < score(best, activity) ? h : best,
    undefined,
  );
}

export function forecastFacts(data: CompleteWeatherDataset) {
  const day = data.daily.find((d) => d.date === data.current.time.slice(0, 10));
  return (
    day && {
      lowC: day.temperatureMin,
      highC: day.temperatureMax,
      rainPercent: day.precipitationProbabilityMax,
      windKmh: day.windSpeedMax,
    }
  );
}
