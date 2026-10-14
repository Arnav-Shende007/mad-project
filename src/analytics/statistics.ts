/**
 * AtmosIQ - Mathematical & Statistical Foundation Library
 * Correct implementations for Mean, Median, Min, Max, Range,
 * Standard Deviation, and Linear Trend Slope with robust handling
 * of empty arrays and missing values.
 */

import { MetricSummaryStats } from '@/models/analytics.types';

/**
 * Filter out null, undefined, or NaN values from number array
 */
export function sanitizeNumbers(arr: (number | null | undefined)[]): number[] {
  return arr.filter((val): val is number => typeof val === 'number' && !isNaN(val) && isFinite(val));
}

/**
 * Arithmetic Mean (Average)
 */
export function calculateMean(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / valid.length).toFixed(2));
}

/**
 * Statistical Median
 */
export function calculateMedian(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return Number(sorted[mid].toFixed(2));
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

/**
 * Minimum Value
 */
export function calculateMin(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) return 0;
  return Number(Math.min(...valid).toFixed(2));
}

/**
 * Maximum Value
 */
export function calculateMax(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) return 0;
  return Number(Math.max(...valid).toFixed(2));
}

/**
 * Range (Max - Min)
 */
export function calculateRange(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) return 0;
  return Number((Math.max(...valid) - Math.min(...valid)).toFixed(2));
}

/**
 * Sample / Population Standard Deviation
 */
export function calculateStandardDeviation(numbers: number[]): number {
  const valid = sanitizeNumbers(numbers);
  if (valid.length <= 1) return 0;
  const mean = calculateMean(valid);
  const variance = valid.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / valid.length;
  return Number(Math.sqrt(variance).toFixed(2));
}

/**
 * Complete summary statistics for a metric array
 */
export function calculateMetricSummary(numbers: (number | null | undefined)[]): MetricSummaryStats {
  const valid = sanitizeNumbers(numbers);
  if (valid.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      range: 0,
      standardDeviation: 0,
      sampleCount: 0,
    };
  }

  return {
    mean: calculateMean(valid),
    median: calculateMedian(valid),
    min: calculateMin(valid),
    max: calculateMax(valid),
    range: calculateRange(valid),
    standardDeviation: calculateStandardDeviation(valid),
    sampleCount: valid.length,
  };
}

/**
 * Linear regression trend slope
 * Positive slope indicates rising trend, negative indicates falling trend
 */
export function calculateTrendSlope(values: number[]): number {
  const valid = sanitizeNumbers(values);
  const n = valid.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = valid[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  return Number(slope.toFixed(3));
}

/**
 * Convert degrees to 16-point cardinal compass direction
 */
export function degreesToCompass(deg: number): string {
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = (deg % 360 + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return sectors[index];
}
