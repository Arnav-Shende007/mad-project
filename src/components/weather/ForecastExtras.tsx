import { useEffect, useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Choice, Panel, ui } from './WeatherPanel';
import { modes, reconcileReminders, type Reminder } from '@/forecast/reminders';
import { useSettings } from '@/state/settingsContext';
import type { CompleteWeatherDataset } from '@/models/weather.types';

const nativeBuild =
  Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
let queue = Promise.resolve();
function reconcile(
  data: CompleteWeatherDataset,
  selected: Reminder[],
  ask: boolean,
) {
  const operation = queue.then(() => reconcileReminders(data, selected, ask));
  queue = operation.catch(() => {});
  return operation;
}

export function ForecastExtras({ data }: { data: CompleteWeatherDataset }) {
  const [enabled, setEnabled] = useState<Reminder[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [alerts, setAlerts] = useState<{ headline: string; uri: string }[]>();
  const [alertsStatus, setAlertsStatus] = useState('Checking NWS…');
  const { latitude, longitude, country, countryCode } = data.location;
  const usa = countryCode === 'US' || country === 'United States';
  const { formatTemperature } = useSettings();
  const temperature = formatTemperature(data.current.temperature);
  useEffect(() => {
    if (!nativeBuild || !data.daily.length) return;
    void import('@/forecast/widget')
      .then((w) =>
        w.updateWidget({
          city: data.location.name,
          temperature,
          detail: data.daily[0].precipitationProbabilityMax + '% rain',
          time: data.current.time.replace('T', ' '),
        }),
      )
      .catch(() => {});
    let active = true;
    AsyncStorage.getItem('forecast-reminders')
      .then(async (raw) => {
        if (!active) return;
        const selected: Reminder[] = raw ? JSON.parse(raw) : [];
        setEnabled(selected);
        if (selected.length) await reconcile(data, selected, false);
      })
      .catch(() => {
        if (active) setMessage('Could not refresh reminders.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [data, temperature]);
  useEffect(() => {
    if (!usa) return;
    const controller = new AbortController();
    fetch(
      'https://api.weather.gov/alerts/active?point=' +
        latitude.toFixed(4) +
        ',' +
        longitude.toFixed(4),
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) throw Error();
        return res.json();
      })
      .then((json) => {
        if (!Array.isArray(json.features)) throw Error();
        setAlerts(
          json.features.map(
            (f: {
              properties: { headline: string; event: string; id: string };
            }) => ({
              headline: f.properties.headline || f.properties.event,
              uri:
                'https://forecast.weather.gov/MapClick.php?lat=' +
                latitude +
                '&lon=' +
                longitude,
            }),
          ),
        );
        setAlertsStatus('No active NWS warnings for this location.');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAlerts(undefined);
          setAlertsStatus('NWS warnings unavailable.');
        }
      });
    return () => controller.abort();
  }, [usa, latitude, longitude, data.fetchedAt]);
  async function toggle(mode: Reminder) {
    const next = enabled.includes(mode)
      ? enabled.filter((m) => m !== mode)
      : [...enabled, mode];
    setReady(false);
    try {
      await reconcile(data, next, true);
      await AsyncStorage.setItem('forecast-reminders', JSON.stringify(next));
      setEnabled(next);
      setMessage('Preferences saved.');
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Could not update reminders.',
      );
    } finally {
      setReady(true);
    }
  }
  return (
    <Panel title="Weather alerts">
      {usa ? (
        alerts?.length ? (
          alerts.map((a, i) => (
            <Choice
              key={i}
              label={a.headline}
              onPress={() => void Linking.openURL(a.uri)}
            />
          ))
        ) : (
          <Text style={ui.text}>{alertsStatus}</Text>
        )
      ) : (
        <Text style={ui.note}>
          In-app official warnings currently cover the United States.
        </Text>
      )}
      {(countryCode === 'IN' || country === 'India') && (
        <Choice
          label="Open India Meteorological Department warnings"
          onPress={() => void Linking.openURL('https://mausam.imd.gov.in/')}
        />
      )}
      <Text style={ui.note}>
        {nativeBuild
          ? 'Choose reminders for this city. Morning briefings arrive at 07:00 city time. Forecast reminders refresh when you open the app.'
          : 'Scheduled reminders are available in a native AtmosIQ build.'}
      </Text>
      {nativeBuild && (
        <View style={ui.row}>
          {modes.map((mode) => (
            <Choice
              key={mode}
              label={mode}
              selected={enabled.includes(mode)}
              disabled={!ready}
              onPress={() => toggle(mode)}
            />
          ))}
        </View>
      )}
      {!!message && <Text style={ui.note}>{message}</Text>}
    </Panel>
  );
}
