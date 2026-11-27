import type { CompleteWeatherDataset } from '@/models/weather.types';
import { Platform } from 'react-native';

export const modes = ['Morning briefing', 'Rain likely', 'High heat'] as const;
export type Reminder = (typeof modes)[number];

// Resolve a wall-clock time in the forecast city's timezone, independently of the phone's timezone.
function instant(local: string, timezone: string) {
  const target = Date.parse(local + ':00Z');
  let guess = target;
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  for (let i = 0; i < 3; i++) {
    const displayed = formatter.format(new Date(guess)).replace(' ', 'T');
    const delta = target - Date.parse(displayed + ':00Z');
    if (!delta) return new Date(guess);
    guess += delta;
  }
  return null;
}

export async function reconcileReminders(
  data: CompleteWeatherDataset,
  enabled: Reminder[],
  ask: boolean,
) {
  const n = await import('expo-notifications');
  if (Platform.OS === 'android')
    await n.setNotificationChannelAsync('forecast', {
      name: 'Forecast updates',
      importance: n.AndroidImportance.DEFAULT,
    });
  if (enabled.length) {
    const permission = await n.getPermissionsAsync();
    if (
      !permission.granted &&
      !(ask && (await n.requestPermissionsAsync()).granted)
    )
      throw Error('Enable notification permission in system settings.');
  }
  const existing = await n.getAllScheduledNotificationsAsync();
  const pending = new Set(
    existing
      .filter((r) => r.identifier.startsWith('atmos-'))
      .map((r) => r.identifier),
  );
  const timezone = data.location.timezone;
  if (enabled.length && !timezone)
    throw Error('Notification times are unavailable for this location.');
  for (const day of data.daily) {
    for (const mode of enabled) {
      const match = data.hourly.find(
        (h) =>
          h.time.startsWith(day.date) &&
          h.time > data.current.time &&
          (mode === 'Rain likely'
            ? h.precipitationProbability >= 60
            : h.apparentTemperature >= 35),
      );
      const local =
        mode === 'Morning briefing' ? day.date + 'T07:00' : match?.time;
      if (!local) continue;
      const when = instant(local, timezone!);
      if (!when || when.getTime() <= Date.now()) continue;
      const id = 'atmos-' + mode + '-' + day.date;
      const body =
        mode === 'Morning briefing'
          ? 'High ' +
            Math.round(day.temperatureMax) +
            '°C · Rain chance ' +
            day.precipitationProbabilityMax +
            '%'
          : mode === 'Rain likely'
            ? 'Forecast rain chance ' + match!.precipitationProbability + '%'
            : 'Forecast feels like ' +
              Math.round(match!.apparentTemperature) +
              '°C';
      await n.scheduleNotificationAsync({
        identifier: id,
        content: { title: data.location.name + ' · ' + mode, body },
        trigger: {
          type: n.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: 'forecast',
        },
      });
      pending.delete(id);
    }
  }
  for (const id of pending) await n.cancelScheduledNotificationAsync(id);
}
