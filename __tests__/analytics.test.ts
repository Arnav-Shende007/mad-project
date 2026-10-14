/**
 * AtmosIQ - Mathematical & Statistical Foundation Tests
 */

import {
  calculateMean,
  calculateMedian,
  calculateMin,
  calculateMax,
  calculateRange,
  calculateStandardDeviation,
  calculateTrendSlope,
  degreesToCompass,
  calculateMetricSummary,
} from '../src/analytics/statistics';
import { computeWeatherAnalytics } from '../src/analytics/weatherAnalytics';
import { CompleteWeatherDataset } from '../src/models/weather.types';

describe('Statistical & Mathematical Analytics', () => {
  describe('calculateMean', () => {
    it('calculates arithmetic mean correctly', () => {
      expect(calculateMean([10, 20, 30])).toBe(20);
      expect(calculateMean([14.5, 18.2, 22.3])).toBe(18.33);
    });

    it('handles empty arrays without error', () => {
      expect(calculateMean([])).toBe(0);
    });

    it('filters out null, undefined, and NaN values', () => {
      expect(calculateMean([10, null as any, 20, NaN, undefined as any])).toBe(15);
    });
  });

  describe('calculateMedian', () => {
    it('calculates median for odd-length series', () => {
      expect(calculateMedian([5, 1, 9])).toBe(5);
    });

    it('calculates median for even-length series', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it('handles empty arrays', () => {
      expect(calculateMedian([])).toBe(0);
    });
  });

  describe('calculateRange and Extreme Values', () => {
    it('determines minimum and maximum', () => {
      expect(calculateMin([12, 4, 28, 19])).toBe(4);
      expect(calculateMax([12, 4, 28, 19])).toBe(28);
      expect(calculateRange([12, 4, 28, 19])).toBe(24);
    });

    it('handles negative temperatures', () => {
      expect(calculateMin([-10, -2, -15, 0])).toBe(-15);
      expect(calculateMax([-10, -2, -15, 0])).toBe(0);
      expect(calculateRange([-10, -2, -15, 0])).toBe(15);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('calculates population standard deviation', () => {
      // Numbers: [2, 4, 4, 4, 5, 5, 7, 9] -> Mean = 5, Variance = 4, StdDev = 2
      expect(calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2);
    });

    it('returns 0 for single item or identical values', () => {
      expect(calculateStandardDeviation([15])).toBe(0);
      expect(calculateStandardDeviation([20, 20, 20])).toBe(0);
    });
  });

  describe('calculateTrendSlope', () => {
    it('detects positive slope for rising temperatures', () => {
      const rising = [10, 12, 14, 16, 18];
      expect(calculateTrendSlope(rising)).toBe(2);
    });

    it('detects negative slope for cooling trends', () => {
      const cooling = [25, 22, 19, 16, 13];
      expect(calculateTrendSlope(cooling)).toBe(-3);
    });

    it('detects zero slope for flat trends', () => {
      expect(calculateTrendSlope([20, 20, 20])).toBe(0);
    });
  });

  describe('degreesToCompass', () => {
    it('correctly maps angles to 16 cardinal compass directions', () => {
      expect(degreesToCompass(0)).toBe('N');
      expect(degreesToCompass(360)).toBe('N');
      expect(degreesToCompass(90)).toBe('E');
      expect(degreesToCompass(180)).toBe('S');
      expect(degreesToCompass(270)).toBe('W');
      expect(degreesToCompass(45)).toBe('NE');
      expect(degreesToCompass(225)).toBe('SW');
    });
  });

  describe('computeWeatherAnalytics integration', () => {
    const mockDataset: CompleteWeatherDataset = {
      location: {
        id: 'loc_test',
        name: 'Test City',
        country: 'Testland',
        latitude: 50.0,
        longitude: 10.0,
      },
      current: {
        time: '2026-10-14T12:00:00Z',
        temperature: 20.0,
        apparentTemperature: 19.5,
        relativeHumidity: 55,
        precipitation: 0,
        weatherCode: 1,
        weatherDescription: 'Mainly clear',
        windSpeed: 15,
        windDirection: 180,
        pressure: 1016,
        isDay: true,
      },
      hourly: [
        {
          time: '2026-10-14T12:00:00Z',
          temperature: 20.0,
          apparentTemperature: 19.5,
          precipitation: 0,
          precipitationProbability: 10,
          relativeHumidity: 55,
          windSpeed: 15,
          windDirection: 180,
          pressure: 1016,
          weatherCode: 1,
        },
        {
          time: '2026-10-14T13:00:00Z',
          temperature: 22.0,
          apparentTemperature: 21.0,
          precipitation: 0,
          precipitationProbability: 10,
          relativeHumidity: 50,
          windSpeed: 18,
          windDirection: 190,
          pressure: 1015,
          weatherCode: 1,
        },
      ],
      daily: [
        {
          date: '2026-10-14',
          weatherCode: 1,
          temperatureMax: 24.0,
          temperatureMin: 14.0,
          apparentTemperatureMax: 23.0,
          apparentTemperatureMin: 13.5,
          precipitationSum: 0,
          precipitationProbabilityMax: 10,
          windSpeedMax: 20,
        },
        {
          date: '2026-10-15',
          weatherCode: 61,
          temperatureMax: 21.0,
          temperatureMin: 12.0,
          apparentTemperatureMax: 20.0,
          apparentTemperatureMin: 11.0,
          precipitationSum: 5.5,
          precipitationProbabilityMax: 80,
          windSpeedMax: 25,
        },
      ],
      airQuality: [
        {
          time: '2026-10-14T12:00:00Z',
          pm2_5: 8.5,
          pm10: 16.0,
          europeanAqi: 20,
          usAqi: 35,
        },
      ],
      fetchedAt: '2026-10-14T12:00:00Z',
      dataSource: 'Test Source',
    };

    it('computes comprehensive analytics and insights', () => {
      const analytics = computeWeatherAnalytics(mockDataset);

      expect(analytics.temperature.dailyStats.max).toBe(24.0);
      expect(analytics.temperature.dailyStats.min).toBe(21.0);
      expect(analytics.precipitation.totalPrecipitationMm).toBe(5.5);
      expect(analytics.precipitation.wettestDay?.date).toBe('2026-10-15');
      expect(analytics.precipitation.wettestDay?.amountMm).toBe(5.5);
      expect(analytics.wind.dominantDirectionCompass).toBe('S');
      expect(analytics.airQuality.highestUsAqi).toBe(35);
      expect(analytics.airQuality.aqiHealthCategory).toBe('Good');
      expect(analytics.insights.length).toBeGreaterThan(0);
    });
  });
});
