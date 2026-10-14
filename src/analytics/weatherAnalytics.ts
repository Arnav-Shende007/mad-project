/**
 * AtmosIQ - Weather Intelligence & Analytics Engine
 * Computes multi-dimensional domain statistics, trend regression,
 * and data-grounded natural language insights.
 */

import { CompleteWeatherDataset } from '@/models/weather.types';
import {
  AirQualityAnalytics,
  AtmosphericAnalytics,
  FullAnalyticsPayload,
  NaturalLanguageInsight,
  PrecipitationAnalytics,
  TemperatureAnalytics,
  WindAnalytics,
} from '@/models/analytics.types';
import {
  calculateMean,
  calculateMetricSummary,
  calculateTrendSlope,
  degreesToCompass,
} from './statistics';
import { getAqiCategory } from '@/constants/weatherCodes';

export function computeWeatherAnalytics(dataset: CompleteWeatherDataset): FullAnalyticsPayload {
  const { hourly, daily, airQuality, current, location } = dataset;

  // 1. Temperature Analytics
  const hourlyTemps = hourly.map((h) => h.temperature);
  const hourlyApparentTemps = hourly.map((h) => h.apparentTemperature);
  const dailyMaxTemps = daily.map((d) => d.temperatureMax);
  const dailyMinTemps = daily.map((d) => d.temperatureMin);

  const hourlyTempStats = calculateMetricSummary(hourlyTemps);
  const dailyMaxStats = calculateMetricSummary(dailyMaxTemps);

  // Apparent vs actual delta
  let maxApparentVsActualDiff = 0;
  for (let i = 0; i < hourly.length; i++) {
    const diff = Math.abs(hourly[i].temperature - hourly[i].apparentTemperature);
    if (diff > maxApparentVsActualDiff) {
      maxApparentVsActualDiff = diff;
    }
  }

  // Trend slope across daily maximums
  const trendSlope = calculateTrendSlope(dailyMaxTemps);
  const temperatureTrend: 'RISING' | 'FALLING' | 'STABLE' =
    trendSlope > 0.4 ? 'RISING' : trendSlope < -0.4 ? 'FALLING' : 'STABLE';

  // Warmest and coldest days
  let warmestDay = { date: '', maxTemp: -999 };
  let coldestDay = { date: '', minTemp: 999 };

  daily.forEach((d) => {
    if (d.temperatureMax > warmestDay.maxTemp) {
      warmestDay = { date: d.date, maxTemp: d.temperatureMax };
    }
    if (d.temperatureMin < coldestDay.minTemp) {
      coldestDay = { date: d.date, minTemp: d.temperatureMin };
    }
  });

  const temperature: TemperatureAnalytics = {
    hourlyStats: hourlyTempStats,
    dailyStats: dailyMaxStats,
    maxApparentVsActualDiff: Number(maxApparentVsActualDiff.toFixed(1)),
    temperatureTrend,
    trendSlope,
    warmestDay,
    coldestDay,
  };

  // 2. Precipitation Analytics
  const dailyRainSums = daily.map((d) => d.precipitationSum);
  const rainProbabilities = daily.map((d) => d.precipitationProbabilityMax);
  const totalRainMm = Number(dailyRainSums.reduce((a, b) => a + b, 0).toFixed(1));
  const avgDailyRainMm = calculateMean(dailyRainSums);
  const maxDailyRainMm = Math.max(...(dailyRainSums.length > 0 ? dailyRainSums : [0]));

  let wettestDay: { date: string; amountMm: number } | null = null;
  daily.forEach((d) => {
    if (d.precipitationSum > 0 && (!wettestDay || d.precipitationSum > wettestDay.amountMm)) {
      wettestDay = { date: d.date, amountMm: d.precipitationSum };
    }
  });

  const rainyDaysCount = dailyRainSums.filter((mm) => mm >= 0.5).length;
  const dryDaysCount = daily.length - rainyDaysCount;

  const precipitation: PrecipitationAnalytics = {
    totalPrecipitationMm: totalRainMm,
    averageDailyPrecipitationMm: avgDailyRainMm,
    maxDailyPrecipitationMm: maxDailyRainMm,
    wettestDay,
    precipitationDaysCount: rainyDaysCount,
    dryDaysCount,
    rainProbabilityAverage: calculateMean(rainProbabilities),
  };

  // 3. Wind Analytics
  const hourlyWinds = hourly.map((h) => h.windSpeed);
  const hourlyWindDirs = hourly.map((h) => h.windDirection);
  const dailyGusts = daily.map((d) => d.windGustsMax ?? 0);

  let peakWindTimestamp: string | null = null;
  let maxWindSpeed = 0;
  hourly.forEach((h) => {
    if (h.windSpeed >= maxWindSpeed) {
      maxWindSpeed = h.windSpeed;
      peakWindTimestamp = h.time;
    }
  });

  const avgWindDir = calculateMean(hourlyWindDirs);
  const wind: WindAnalytics = {
    meanWindSpeedKmh: calculateMean(hourlyWinds),
    maxWindSpeedKmh: maxWindSpeed,
    peakWindTimestamp,
    dominantDirectionDegrees: avgWindDir,
    dominantDirectionCompass: degreesToCompass(avgWindDir),
    gustMaxKmh: Math.max(...(dailyGusts.length > 0 ? dailyGusts : [0])),
  };

  // 4. Atmospheric Conditions
  const hourlyHumidity = hourly.map((h) => h.relativeHumidity);
  const hourlyPressure = hourly.map((h) => h.pressure);

  const pressureSlope = calculateTrendSlope(hourlyPressure);
  const atmosphere: AtmosphericAnalytics = {
    meanHumidityPercent: calculateMean(hourlyHumidity),
    minHumidityPercent: Math.min(...(hourlyHumidity.length > 0 ? hourlyHumidity : [0])),
    maxHumidityPercent: Math.max(...(hourlyHumidity.length > 0 ? hourlyHumidity : [0])),
    meanPressureHpa: calculateMean(hourlyPressure),
    minPressureHpa: Math.min(...(hourlyPressure.length > 0 ? hourlyPressure : [1013])),
    maxPressureHpa: Math.max(...(hourlyPressure.length > 0 ? hourlyPressure : [1013])),
    pressureTrend: pressureSlope > 0.05 ? 'RISING' : pressureSlope < -0.05 ? 'FALLING' : 'STEADY',
  };

  // 5. Air Quality Analytics
  let airQualityPayload: AirQualityAnalytics;
  if (airQuality && airQuality.length > 0) {
    const pm25Values = airQuality.map((a) => a.pm2_5).filter((v): v is number => v !== null);
    const pm10Values = airQuality.map((a) => a.pm10).filter((v): v is number => v !== null);
    const usAqiValues = airQuality.map((a) => a.usAqi).filter((v): v is number => v !== null);
    const euAqiValues = airQuality.map((a) => a.europeanAqi).filter((v): v is number => v !== null);

    const peakUsAqi = usAqiValues.length > 0 ? Math.max(...usAqiValues) : null;
    const aqiCategoryInfo = getAqiCategory(peakUsAqi);

    airQualityPayload = {
      hasData: true,
      meanPm25: calculateMean(pm25Values),
      meanPm10: calculateMean(pm10Values),
      maxPm25: pm25Values.length > 0 ? Math.max(...pm25Values) : null,
      maxPm10: pm10Values.length > 0 ? Math.max(...pm10Values) : null,
      highestUsAqi: peakUsAqi,
      highestEuropeanAqi: euAqiValues.length > 0 ? Math.max(...euAqiValues) : null,
      dominantPollutant: (pm25Values.length > 0 && pm10Values.length > 0 && Math.max(...pm25Values) * 2 > Math.max(...pm10Values)) ? 'Fine Particulate (PM2.5)' : 'Inhalable Particulate (PM10)',
      aqiHealthCategory: aqiCategoryInfo.label,
    };
  } else {
    airQualityPayload = {
      hasData: false,
      meanPm25: null,
      meanPm10: null,
      maxPm25: null,
      maxPm10: null,
      highestUsAqi: null,
      highestEuropeanAqi: null,
      dominantPollutant: 'N/A',
      aqiHealthCategory: 'Unknown',
    };
  }

  // 6. Dynamic Natural Language Observations Grounded in Verified Calculations
  const insights: NaturalLanguageInsight[] = [];

  // Insight: Temperature
  const tempVariance = hourlyTempStats.standardDeviation;
  insights.push({
    id: 'ins_temp_trend',
    category: 'temperature',
    title: `Thermal Trend: ${temperatureTrend}`,
    statement: `Weekly temperatures average ${dailyMaxStats.mean}°C, peaking at ${warmestDay.maxTemp}°C on ${warmestDay.date}. Daily thermal variance is ±${tempVariance}°C.`,
    severity: temperatureTrend === 'RISING' ? 'info' : 'positive',
    derivedFrom: `7-Day Daily Forecast (${daily.length} observation windows)`,
  });

  // Insight: Precipitation
  if (totalRainMm > 0 && wettestDay) {
    const wetDayPercent = Math.round(((wettestDay as any).amountMm / totalRainMm) * 100);
    insights.push({
      id: 'ins_precip',
      category: 'precipitation',
      title: 'Precipitation Concentration',
      statement: `Cumulative rainfall is projected at ${totalRainMm} mm across ${rainyDaysCount} rainy days. The wettest day (${(wettestDay as any).date}) accounts for ${wetDayPercent}% (${(wettestDay as any).amountMm} mm) of total precipitation.`,
      severity: totalRainMm > 25 ? 'alert' : 'info',
      derivedFrom: 'Open-Meteo High-Resolution Precipitation Modeling',
    });
  } else {
    insights.push({
      id: 'ins_precip_dry',
      category: 'precipitation',
      title: 'Arid / Dry Period',
      statement: `Zero significant precipitation is projected over the next 7 days (${dryDaysCount} dry days). Optimal outdoor conditions prevail.`,
      severity: 'positive',
      derivedFrom: '7-Day Precipitation Summary',
    });
  }

  // Insight: Wind
  insights.push({
    id: 'ins_wind',
    category: 'wind',
    title: `Wind Dynamics: ${wind.dominantDirectionCompass}`,
    statement: `Prevailing winds blow from ${wind.dominantDirectionCompass} (${Math.round(wind.dominantDirectionDegrees)}°) with an average velocity of ${wind.meanWindSpeedKmh} km/h and peak gusts of ${wind.gustMaxKmh} km/h.`,
    severity: wind.gustMaxKmh > 40 ? 'warning' : 'info',
    derivedFrom: '10-meter Surface Wind Vector Calculations',
  });

  // Insight: Pressure & Atmospheric Stability
  insights.push({
    id: 'ins_pressure',
    category: 'pressure',
    title: `Atmospheric Stability: ${atmosphere.pressureTrend}`,
    statement: `Surface barometric pressure is currently ${current.pressure} hPa (mean: ${atmosphere.meanPressureHpa} hPa). A ${atmosphere.pressureTrend.toLowerCase()} trend suggests ${atmosphere.pressureTrend === 'RISING' ? 'stabilizing clearing skies' : atmosphere.pressureTrend === 'FALLING' ? 'an incoming low-pressure weather disturbance' : 'steady equilibrium'}.`,
    severity: atmosphere.pressureTrend === 'FALLING' ? 'warning' : 'info',
    derivedFrom: 'Hourly Surface Barometric Pressure Series',
  });

  // Insight: Air Quality (if available)
  if (airQualityPayload.hasData && airQualityPayload.highestUsAqi !== null) {
    insights.push({
      id: 'ins_aqi',
      category: 'air_quality',
      title: `Air Quality Index: ${airQualityPayload.aqiHealthCategory}`,
      statement: `Max Air Quality Index reads ${airQualityPayload.highestUsAqi} (${airQualityPayload.aqiHealthCategory}). Mean PM2.5 concentration is ${airQualityPayload.meanPm25} µg/m³.`,
      severity: airQualityPayload.highestUsAqi > 100 ? 'warning' : 'positive',
      derivedFrom: 'Open-Meteo Copernicus Atmospheric Monitoring',
    });
  }

  return {
    periodLabel: '7-Day Comprehensive Forecast',
    dateRange: {
      start: daily[0]?.date || 'Today',
      end: daily[daily.length - 1]?.date || 'Next Week',
    },
    temperature,
    precipitation,
    wind,
    atmosphere,
    airQuality: airQualityPayload,
    insights,
    generatedAt: new Date().toISOString(),
  };
}
