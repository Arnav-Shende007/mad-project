/**
 * AtmosIQ - Open-Meteo REST API Client
 * Official Documentation: https://open-meteo.com/en/docs
 */

import {
  AirQualityReading,
  CompleteWeatherDataset,
  CurrentWeather,
  DailyForecastItem,
  HistoricalWeatherDay,
  HourlyForecastItem,
  LocationItem,
} from '@/models/weather.types';
import { getWeatherConditionInfo } from '@/constants/weatherCodes';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_BASE = 'https://api.open-meteo.com/v1';
const ARCHIVE_BASE = 'https://archive-api.open-meteo.com/v1';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1';

export const DEFAULT_LOCATIONS: LocationItem[] = [
  {
    id: 'loc_london',
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    isDefault: true,
  },
  {
    id: 'loc_newyork',
    name: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'loc_paris',
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
  },
  {
    id: 'loc_sydney',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
  },
];

/**
 * Search cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string, count: number = 8): Promise<LocationItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`;
  
  try {
    let res = await fetch(url);
    if (res.status === 503 || res.status === 429) {
      // Small pause and 1-time retry for burst rate limit
      await new Promise((r) => setTimeout(r, 400));
      res = await fetch(url);
    }
    if (!res.ok) {
      if (res.status === 503) {
        console.warn('[searchCities] Open-Meteo service temporarily busy (HTTP 503)');
        return [];
      }
      throw new Error(`Geocoding HTTP error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: `loc_${item.id || `${item.latitude.toFixed(2)}_${item.longitude.toFixed(2)}`}`,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || undefined,
      countryCode: item.country_code,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      timezone: item.timezone,
    }));
  } catch (err: any) {
    console.warn('[searchCities] Geocoding request failed:', err.message);
    throw new Error(`City search failed: ${err.message}`);
  }
}

/**
 * Fetch Current Weather, Hourly (48h) and Daily (7d) forecasts
 */
export async function fetchForecast(latitude: number, longitude: number, timezone: string = 'auto') {
  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation',
    'weather_code',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'is_day',
    'cloud_cover',
  ].join(',');

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
    'uv_index_max',
    'sunrise',
    'sunset',
  ].join(',');

  const url = `${FORECAST_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=${encodeURIComponent(timezone)}&forecast_days=7`;

  let res = await fetch(url);
  if (res.status === 503 || res.status === 429) {
    // 500ms pause and retry once
    await new Promise((r) => setTimeout(r, 500));
    res = await fetch(url);
  }

  if (!res.ok) {
    if (res.status === 503) {
      throw new Error(`Open-Meteo server is temporarily busy (HTTP 503). Retrying automatically.`);
    }
    throw new Error(`Forecast API HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch Air Quality observations and forecasts
 */
export async function fetchAirQuality(latitude: number, longitude: number, timezone: string = 'auto') {
  const params = [
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
    'european_aqi',
    'us_aqi',
  ].join(',');

  const url = `${AIR_QUALITY_BASE}/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${params}&timezone=${encodeURIComponent(timezone)}&forecast_days=3`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Air Quality API warning ${res.status}: ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    console.warn('[fetchAirQuality] Failed to retrieve air quality:', err.message);
    return null;
  }
}

/**
 * Fetch Historical / Archive observations
 */
export async function fetchHistoricalData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone: string = 'auto'
): Promise<HistoricalWeatherDay[]> {
  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'temperature_2m_mean',
    'precipitation_sum',
    'wind_speed_10m_max',
  ].join(',');

  const url = `${ARCHIVE_BASE}/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=${encodeURIComponent(timezone)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Historical API returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.daily || !Array.isArray(data.daily.time)) return [];

    const { time, temperature_2m_max, temperature_2m_min, temperature_2m_mean, precipitation_sum, wind_speed_10m_max } = data.daily;

    return time.map((dateStr: string, idx: number) => ({
      date: dateStr,
      temperatureMax: Number(temperature_2m_max?.[idx] ?? 0),
      temperatureMin: Number(temperature_2m_min?.[idx] ?? 0),
      temperatureMean: Number(temperature_2m_mean?.[idx] ?? 0),
      precipitationSum: Number(precipitation_sum?.[idx] ?? 0),
      windSpeedMax: Number(wind_speed_10m_max?.[idx] ?? 0),
    }));
  } catch (err: any) {
    console.warn('[fetchHistoricalData] Historical retrieval error:', err.message);
    return [];
  }
}

/**
 * Unified loader to retrieve complete dataset for a location
 */
export async function getCompleteWeatherData(location: LocationItem): Promise<CompleteWeatherDataset> {
  const [forecastResult, airQualityResult] = await Promise.all([
    fetchForecast(location.latitude, location.longitude, location.timezone || 'auto'),
    fetchAirQuality(location.latitude, location.longitude, location.timezone || 'auto'),
  ]);

  // Current Weather
  const cur = forecastResult.current || {};
  const weatherCode = Number(cur.weather_code ?? 0);
  const conditionInfo = getWeatherConditionInfo(weatherCode);

  const current: CurrentWeather = {
    time: cur.time || new Date().toISOString(),
    temperature: Number(cur.temperature_2m ?? 0),
    apparentTemperature: Number(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
    relativeHumidity: Number(cur.relative_humidity_2m ?? 0),
    precipitation: Number(cur.precipitation ?? 0),
    weatherCode,
    weatherDescription: conditionInfo.description,
    windSpeed: Number(cur.wind_speed_10m ?? 0),
    windDirection: Number(cur.wind_direction_10m ?? 0),
    pressure: Number(cur.surface_pressure ?? 1013),
    isDay: Boolean(cur.is_day ?? 1),
    cloudCover: cur.cloud_cover !== undefined ? Number(cur.cloud_cover) : undefined,
  };

  // Hourly Forecast (take next 48 hours)
  const hourlyData = forecastResult.hourly || {};
  const hourlyTimes: string[] = hourlyData.time || [];
  const hourly: HourlyForecastItem[] = [];

  const maxHours = Math.min(hourlyTimes.length, 48);
  for (let i = 0; i < maxHours; i++) {
    hourly.push({
      time: hourlyTimes[i],
      temperature: Number(hourlyData.temperature_2m?.[i] ?? 0),
      apparentTemperature: Number(hourlyData.apparent_temperature?.[i] ?? 0),
      precipitation: Number(hourlyData.precipitation?.[i] ?? 0),
      precipitationProbability: Number(hourlyData.precipitation_probability?.[i] ?? 0),
      relativeHumidity: Number(hourlyData.relative_humidity_2m?.[i] ?? 0),
      windSpeed: Number(hourlyData.wind_speed_10m?.[i] ?? 0),
      windDirection: Number(hourlyData.wind_direction_10m?.[i] ?? 0),
      pressure: Number(hourlyData.surface_pressure?.[i] ?? 1013),
      weatherCode: Number(hourlyData.weather_code?.[i] ?? 0),
    });
  }

  // Daily Forecast
  const dailyData = forecastResult.daily || {};
  const dailyTimes: string[] = dailyData.time || [];
  const daily: DailyForecastItem[] = [];

  for (let i = 0; i < dailyTimes.length; i++) {
    daily.push({
      date: dailyTimes[i],
      weatherCode: Number(dailyData.weather_code?.[i] ?? 0),
      temperatureMax: Number(dailyData.temperature_2m_max?.[i] ?? 0),
      temperatureMin: Number(dailyData.temperature_2m_min?.[i] ?? 0),
      apparentTemperatureMax: Number(dailyData.apparent_temperature_max?.[i] ?? 0),
      apparentTemperatureMin: Number(dailyData.apparent_temperature_min?.[i] ?? 0),
      precipitationSum: Number(dailyData.precipitation_sum?.[i] ?? 0),
      precipitationProbabilityMax: Number(dailyData.precipitation_probability_max?.[i] ?? 0),
      windSpeedMax: Number(dailyData.wind_speed_10m_max?.[i] ?? 0),
      windGustsMax: dailyData.wind_gusts_10m_max?.[i] !== undefined ? Number(dailyData.wind_gusts_10m_max[i]) : undefined,
      windDirectionDominant: dailyData.wind_direction_10m_dominant?.[i] !== undefined ? Number(dailyData.wind_direction_10m_dominant[i]) : undefined,
      uvIndexMax: dailyData.uv_index_max?.[i] !== undefined ? Number(dailyData.uv_index_max[i]) : undefined,
      sunrise: dailyData.sunrise?.[i],
      sunset: dailyData.sunset?.[i],
    });
  }

  // Air Quality Parsing
  let airQuality: AirQualityReading[] | undefined;
  if (airQualityResult && airQualityResult.hourly && Array.isArray(airQualityResult.hourly.time)) {
    const aqHourly = airQualityResult.hourly;
    const aqTimes: string[] = aqHourly.time;
    airQuality = [];
    const maxAq = Math.min(aqTimes.length, 48);
    for (let i = 0; i < maxAq; i++) {
      airQuality.push({
        time: aqTimes[i],
        pm2_5: aqHourly.pm2_5?.[i] !== undefined ? Number(aqHourly.pm2_5[i]) : null,
        pm10: aqHourly.pm10?.[i] !== undefined ? Number(aqHourly.pm10[i]) : null,
        europeanAqi: aqHourly.european_aqi?.[i] !== undefined ? Number(aqHourly.european_aqi[i]) : null,
        usAqi: aqHourly.us_aqi?.[i] !== undefined ? Number(aqHourly.us_aqi[i]) : null,
        carbonMonoxide: aqHourly.carbon_monoxide?.[i] !== undefined ? Number(aqHourly.carbon_monoxide[i]) : null,
        nitrogenDioxide: aqHourly.nitrogen_dioxide?.[i] !== undefined ? Number(aqHourly.nitrogen_dioxide[i]) : null,
        sulphurDioxide: aqHourly.sulphur_dioxide?.[i] !== undefined ? Number(aqHourly.sulphur_dioxide[i]) : null,
        ozone: aqHourly.ozone?.[i] !== undefined ? Number(aqHourly.ozone[i]) : null,
      });
    }
  }

  return {
    location,
    current,
    hourly,
    daily,
    airQuality,
    fetchedAt: new Date().toISOString(),
    dataSource: 'Open-Meteo REST API (WMO Standard)',
    isOfflineCached: false,
  };
}
