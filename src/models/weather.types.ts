/**
 * AtmosIQ - Core Weather Domain Models & Type Definitions
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationItem extends LocationCoordinates {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  countryCode?: string;
  elevation?: number;
  timezone?: string;
  isDefault?: boolean;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  isDay: boolean;
  cloudCover?: number;
  uvIndex?: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  precipitationProbability: number;
  relativeHumidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherCode: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax?: number;
  windDirectionDominant?: number;
  uvIndexMax?: number;
  sunrise?: string;
  sunset?: string;
}

export interface AirQualityReading {
  time: string;
  pm2_5: number | null;
  pm10: number | null;
  europeanAqi: number | null;
  usAqi: number | null;
  carbonMonoxide?: number | null;
  nitrogenDioxide?: number | null;
  sulphurDioxide?: number | null;
  ozone?: number | null;
}

export interface HistoricalWeatherDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface CompleteWeatherDataset {
  location: LocationItem;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality?: AirQualityReading[];
  historical?: HistoricalWeatherDay[];
  fetchedAt: string;
  dataSource: string;
  isOfflineCached?: boolean;
}
