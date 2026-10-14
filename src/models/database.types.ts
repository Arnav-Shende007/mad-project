/**
 * AtmosIQ - SQLite Database Schema & Persistence Models
 */

export interface DbLocationRecord {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  timezone: string | null;
  last_updated: string;
}

export interface DbWeatherRecord {
  id: string;
  location_id: string;
  timestamp: string;
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  precipitation: number;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  weather_code: number;
  weather_description: string;
  is_day: number;
  synced_to_firebase: number;
}

export interface DbForecastRecord {
  id: string;
  location_id: string;
  forecast_date: string;
  granularity: 'hourly' | 'daily';
  temperature_max: number | null;
  temperature_min: number | null;
  apparent_temperature: number | null;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  synced_to_firebase: number;
}

export interface DbAirQualityRecord {
  id: string;
  location_id: string;
  timestamp: string;
  pm2_5: number | null;
  pm10: number | null;
  european_aqi: number | null;
  us_aqi: number | null;
  synced_to_firebase: number;
}

export interface DbXmlImportRecord {
  id: string;
  source_url: string;
  fetch_timestamp: string;
  content_type: string;
  status_code: number;
  parsing_status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  record_count: number;
  byte_size: number;
  error_message: string | null;
  synced_to_firebase: number;
}

export interface DbXmlWeatherRecord {
  id: string;
  import_id: string;
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  temperature_c: number;
  humidity_percent: number | null;
  pressure_hpa: number | null;
  wind_speed_mps: number | null;
  wind_direction_deg: number | null;
  weather_condition: string | null;
  synced_to_firebase: number;
}

export interface DbSyncQueueItem {
  id: string;
  entity_type: 'weather' | 'air_quality' | 'xml_import' | 'xml_record' | 'location';
  entity_id: string;
  payload: string;
  created_at: string;
  retry_count: number;
  last_error: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';
}

export interface DatabaseSummaryStats {
  locationCount: number;
  weatherRecordCount: number;
  forecastRecordCount: number;
  airQualityRecordCount: number;
  xmlImportCount: number;
  xmlRecordCount: number;
  pendingSyncCount: number;
  lastWriteTimestamp: string | null;
}
