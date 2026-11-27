import { planDay } from '../src/analytics/dayPlanner';
import type { CompleteWeatherDataset, HourlyForecastItem } from '../src/models/weather.types';

const hour = (time: string, rain: number, humidity: number) => ({
  time: '2026-11-27T' + time, precipitationProbability: rain, temperature: 22,
  apparentTemperature: 22, windSpeed: 5, relativeHumidity: humidity,
}) as HourlyForecastItem;
const day = {
  current: { time: '2026-11-27T09:15' },
  hourly: [hour('07:00',0,10),hour('11:00',70,20),hour('13:00',5,30),hour('22:00',0,10)],
  daily: [{date:'2026-11-27',sunrise:'2026-11-27T06:30',sunset:'2026-11-27T18:00'}],
} as CompleteWeatherDataset;

test('outdoor activities compare upcoming daylight forecasts in city time', () => {
  expect(planDay(day,'Dry laundry')?.time).toBe('2026-11-27T13:00');
  expect(planDay(day,'Run')?.time).toBe('2026-11-27T13:00');
  expect(planDay(day,'Commute')?.time).toBe('2026-11-27T22:00');
});
test('a missing sunrise or missing forecasts cannot produce a daylight recommendation', () => {
  expect(planDay({...day,daily:[]},'Cycle')).toBeUndefined();
  expect(planDay({...day,hourly:[]},'Walk')).toBeUndefined();
});
