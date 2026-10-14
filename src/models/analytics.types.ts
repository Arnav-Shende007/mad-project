/**
 * AtmosIQ - Analytics & Statistical Models
 */

export interface MetricSummaryStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
  standardDeviation: number;
  sampleCount: number;
}

export interface TemperatureAnalytics {
  hourlyStats: MetricSummaryStats;
  dailyStats: MetricSummaryStats;
  maxApparentVsActualDiff: number;
  temperatureTrend: 'RISING' | 'FALLING' | 'STABLE';
  trendSlope: number; // degrees per unit time
  warmestDay: { date: string; maxTemp: number };
  coldestDay: { date: string; minTemp: number };
}

export interface PrecipitationAnalytics {
  totalPrecipitationMm: number;
  averageDailyPrecipitationMm: number;
  maxDailyPrecipitationMm: number;
  wettestDay: { date: string; amountMm: number } | null;
  precipitationDaysCount: number;
  dryDaysCount: number;
  rainProbabilityAverage: number;
}

export interface WindAnalytics {
  meanWindSpeedKmh: number;
  maxWindSpeedKmh: number;
  peakWindTimestamp: string | null;
  dominantDirectionDegrees: number;
  dominantDirectionCompass: string;
  gustMaxKmh: number;
}

export interface AtmosphericAnalytics {
  meanHumidityPercent: number;
  minHumidityPercent: number;
  maxHumidityPercent: number;
  meanPressureHpa: number;
  minPressureHpa: number;
  maxPressureHpa: number;
  pressureTrend: 'RISING' | 'FALLING' | 'STEADY';
}

export interface AirQualityAnalytics {
  hasData: boolean;
  meanPm25: number | null;
  meanPm10: number | null;
  maxPm25: number | null;
  maxPm10: number | null;
  highestUsAqi: number | null;
  highestEuropeanAqi: number | null;
  dominantPollutant: string;
  aqiHealthCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unknown';
}

export interface NaturalLanguageInsight {
  id: string;
  category: 'temperature' | 'precipitation' | 'wind' | 'air_quality' | 'pressure';
  title: string;
  statement: string;
  severity: 'info' | 'warning' | 'alert' | 'positive';
  derivedFrom: string;
}

export interface FullAnalyticsPayload {
  periodLabel: string;
  dateRange: { start: string; end: string };
  temperature: TemperatureAnalytics;
  precipitation: PrecipitationAnalytics;
  wind: WindAnalytics;
  atmosphere: AtmosphericAnalytics;
  airQuality: AirQualityAnalytics;
  insights: NaturalLanguageInsight[];
  generatedAt: string;
}
