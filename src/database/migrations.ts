/**
 * AtmosIQ - SQLite Schema Migrations & DDL Definitions
 */

export interface Migration {
  version: number;
  description: string;
  sqlStatements: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial AtmosIQ schema with weather, forecast, air quality, XML imports, and sync queue',
    sqlStatements: [
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        elevation REAL,
        timezone TEXT,
        last_updated TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS weather_records (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        apparent_temperature REAL NOT NULL,
        relative_humidity REAL NOT NULL,
        precipitation REAL NOT NULL,
        wind_speed REAL NOT NULL,
        wind_direction REAL NOT NULL,
        pressure REAL NOT NULL,
        weather_code INTEGER NOT NULL,
        weather_description TEXT NOT NULL,
        is_day INTEGER NOT NULL,
        synced_to_firebase INTEGER DEFAULT 0,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS forecast_records (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        forecast_date TEXT NOT NULL,
        granularity TEXT NOT NULL,
        temperature_max REAL,
        temperature_min REAL,
        apparent_temperature REAL,
        precipitation REAL NOT NULL,
        wind_speed REAL NOT NULL,
        weather_code INTEGER NOT NULL,
        synced_to_firebase INTEGER DEFAULT 0,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS air_quality_records (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        pm2_5 REAL,
        pm10 REAL,
        european_aqi REAL,
        us_aqi REAL,
        synced_to_firebase INTEGER DEFAULT 0,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS xml_imports (
        id TEXT PRIMARY KEY,
        source_url TEXT NOT NULL,
        fetch_timestamp TEXT NOT NULL,
        content_type TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        parsing_status TEXT NOT NULL,
        record_count INTEGER NOT NULL,
        byte_size INTEGER NOT NULL,
        error_message TEXT,
        synced_to_firebase INTEGER DEFAULT 0
      );`,

      `CREATE TABLE IF NOT EXISTS xml_weather_records (
        id TEXT PRIMARY KEY,
        import_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        temperature_c REAL NOT NULL,
        humidity_percent REAL,
        pressure_hpa REAL,
        wind_speed_mps REAL,
        wind_direction_deg REAL,
        weather_condition TEXT,
        synced_to_firebase INTEGER DEFAULT 0,
        FOREIGN KEY (import_id) REFERENCES xml_imports(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        status TEXT DEFAULT 'PENDING'
      );`,

      `CREATE INDEX IF NOT EXISTS idx_weather_loc_time ON weather_records(location_id, timestamp);`,
      `CREATE INDEX IF NOT EXISTS idx_forecast_loc_date ON forecast_records(location_id, forecast_date);`,
      `CREATE INDEX IF NOT EXISTS idx_xml_import_time ON xml_weather_records(import_id, timestamp);`,
      `CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);`,
    ],
  },
];
