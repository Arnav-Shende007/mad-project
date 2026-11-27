import { useEffect, useRef, useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { CompleteWeatherDataset } from '@/models/weather.types';
import {
  activities,
  Activity,
  forecastFacts,
  planDay,
} from '@/analytics/dayPlanner';
import { useSettings } from '@/state/settingsContext';
import { Panel, Choice, ui } from './WeatherPanel';

const copy = {
  en: [
    'Your day at a glance',
    'High',
    'Low',
    'Chance of rain',
    'Peak wind',
    'Carry an umbrella.',
    'Wind may affect outdoor plans.',
  ],
  hi: [
    'आज का मौसम',
    'अधिकतम',
    'न्यूनतम',
    'बारिश की संभावना',
    'अधिकतम हवा',
    'छाता साथ रखें।',
    'तेज़ हवा बाहर की योजनाओं को प्रभावित कर सकती है।',
  ],
  mr: [
    'आजचे हवामान',
    'कमाल',
    'किमान',
    'पावसाची शक्यता',
    'कमाल वारा',
    'छत्री सोबत घ्या.',
    'जोरदार वाऱ्यामुळे बाहेरच्या बेतांवर परिणाम होऊ शकतो.',
  ],
};
type Language = keyof typeof copy;
const endpoint = process.env.EXPO_PUBLIC_BRIEFING_URL;

export function DayPlanner({ data }: { data: CompleteWeatherDataset }) {
  const { formatTemperature, formatWindSpeed } = useSettings();
  const [activity, setActivity] = useState<Activity>('Walk');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState('Weather');
  const [plannerFirst, setPlannerFirst] = useState(false);
  const [guess, setGuess] = useState<boolean>();
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const card = useRef<View>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('planner-preferences')
      .then((raw) => {
        if (!active || !raw) return;
        const saved = JSON.parse(raw);
        if (Object.prototype.hasOwnProperty.call(copy, saved.lang))
          setLang(saved.lang);
        if (activities.includes(saved.activity)) setActivity(saved.activity);
        if (['Weather', 'Midnight'].includes(saved.theme))
          setTheme(saved.theme);
        setPlannerFirst(saved.plannerFirst === true);
      })
      .catch(() => {});
    return () => {
      active = false;
      request.current?.abort();
    };
  }, []);
  function save(changes: object) {
    AsyncStorage.setItem(
      'planner-preferences',
      JSON.stringify({ lang, theme, activity, plannerFirst, ...changes }),
    ).catch(() => setStatus('Preferences could not be saved.'));
  }
  const facts = forecastFacts(data);
  if (!facts) return null;
  const t = copy[lang];
  const briefing = [
    t[1] + ' ' + formatTemperature(facts.highC),
    t[2] + ' ' + formatTemperature(facts.lowC),
    t[3] + ' ' + facts.rainPercent + '%',
    t[4] + ' ' + formatWindSpeed(facts.windKmh),
  ].join(' · ');
  const best = planDay(data, activity);
  const date = data.current.time.slice(0, 10);
  const yesterday = data.previousHigh;
  const hours = data.hourly.filter((h) => h.time.startsWith(date));
  const hottest = hours.reduce<typeof best>(
    (max, h) => (!max || h.temperature > max.temperature ? h : max),
    undefined,
  );
  const background =
    theme === 'Midnight' || !data.current.isDay
      ? '#152038'
      : facts.rainPercent >= 50
        ? '#26485B'
        : '#205369';

  async function generate() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setStatus('');
    const timer = setTimeout(() => controller.abort(), 22000);
    try {
      const res = await fetch(endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...facts, lang }),
      });
      if (!res.ok) throw Error();
      const result = await res.json();
      if (typeof result.briefing !== 'string') throw Error();
      if (!controller.signal.aborted) setAnswer(result.briefing);
    } catch {
      if (request.current === controller)
        setStatus('AI unavailable. The forecast briefing is shown above.');
    } finally {
      clearTimeout(timer);
      if (request.current === controller) setBusy(false);
    }
  }
  async function share() {
    let uri: string | undefined;
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        uri = await captureRef(card, { format: 'png', quality: 1 });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          text:
            data.location.name + ' · ' + date + ' · ' + briefing + ' · AtmosIQ',
        });
      } else {
        await Share.share({
          message:
            data.location.name + ' · ' + date + ' · ' + briefing + ' · AtmosIQ',
        });
      }
    } catch {
      setStatus('Sharing is unavailable on this device.');
    } finally {
      if (uri) releaseCapture(uri);
    }
  }
  const planner = (
    <Panel title="Best hour for your plans">
      <View style={ui.row}>
        {activities.map((a) => (
          <Choice
            key={a}
            label={a}
            selected={activity === a}
            onPress={() => {
              setActivity(a);
              save({ activity: a });
            }}
          />
        ))}
      </View>
      <Text style={ui.text}>
        {best
          ? best.time.replace('T', ' at ') +
            ' · ' +
            formatTemperature(best.temperature) +
            ' · ' +
            best.precipitationProbability +
            '% rain · ' +
            formatWindSpeed(best.windSpeed)
          : 'No suitable forecast hours available.'}
      </Text>
      <Text style={ui.note}>
        {activity === 'Dry laundry'
          ? 'Favors lower rain risk and humidity.'
          : 'Compares rain, wind and feels-like temperature.'}{' '}
        Times are local to {data.location.name}.
      </Text>
    </Panel>
  );
  return (
    <>
      {plannerFirst && planner}
      <Panel title={t[0]}>
        <View
          ref={card}
          collapsable={false}
          style={{
            padding: 18,
            gap: 8,
            backgroundColor: background,
            borderRadius: 12,
          }}
        >
          <Text style={ui.note}>AtmosIQ · {date}</Text>
          <Text style={ui.title}>{data.location.name}</Text>
          <Text style={ui.text}>{briefing}</Text>
          {facts.rainPercent >= 50 && <Text style={ui.text}>{t[5]}</Text>}
          {facts.windKmh >= 35 && <Text style={ui.text}>{t[6]}</Text>}
          <Text style={ui.note}>
            Open-Meteo · {data.current.time.replace('T', ' ')}
          </Text>
        </View>
        {hottest && (
          <Text style={ui.note}>
            Warmest remaining forecast hour · {hottest.time.slice(11, 16)} ·{' '}
            {formatTemperature(hottest.temperature)}
          </Text>
        )}
        {yesterday != null && (
          <Text style={ui.note}>
            Yesterday’s high · {formatTemperature(yesterday)}
          </Text>
        )}
        {!!answer && <Text style={ui.text}>AI · {answer}</Text>}
        <View style={ui.row}>
          {(['en', 'hi', 'mr'] as const).map((l, i) => (
            <Choice
              key={l}
              label={['English', 'हिन्दी', 'मराठी'][i]}
              selected={lang === l}
              onPress={() => {
                request.current?.abort();
                request.current = null;
                setBusy(false);
                setAnswer('');
                setLang(l);
                save({ lang: l });
              }}
            />
          ))}
        </View>
        <View style={ui.row}>
          <Choice label="Share forecast" onPress={share} />
          {endpoint && (
            <Choice
              label={busy ? 'Writing…' : 'Ask Groq for a briefing'}
              disabled={busy}
              onPress={generate}
            />
          )}
          <Choice
            label={'Theme · ' + theme}
            onPress={() => {
              const next = theme === 'Weather' ? 'Midnight' : 'Weather';
              setTheme(next);
              save({ theme: next });
            }}
          />
          <Choice
            label={plannerFirst ? 'Show briefing first' : 'Show planner first'}
            onPress={() => {
              setPlannerFirst(!plannerFirst);
              save({ plannerFirst: !plannerFirst });
            }}
          />
        </View>
        {!!status && (
          <Text accessibilityLiveRegion="polite" style={ui.note}>
            {status}
          </Text>
        )}
      </Panel>
      {!plannerFirst && planner}
      {data.daily.length > 1 && (
        <Panel title="Forecast challenge">
          <Text style={ui.text}>
            Will tomorrow’s high be warmer than today’s in {data.location.name}?
          </Text>
          <View style={ui.row}>
            {[true, false].map((g) => (
              <Choice
                key={String(g)}
                label={g ? 'Warmer' : 'Same or cooler'}
                onPress={() => setGuess(g)}
              />
            ))}
          </View>
          {guess !== undefined && (
            <Text style={ui.note}>
              {guess === data.daily[1].temperatureMax > facts.highC
                ? 'Correct!'
                : 'Try again tomorrow.'}{' '}
              Forecast high · {formatTemperature(data.daily[1].temperatureMax)}
            </Text>
          )}
        </Panel>
      )}
    </>
  );
}
