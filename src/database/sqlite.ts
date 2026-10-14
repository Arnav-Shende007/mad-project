/**
 * AtmosIQ - Local SQLite Database Service
 * Provides parameterized queries, transactional inserts, upserts,
 * deduplication, offline cache retrieval, and sync queue management.
 */

import { CompleteWeatherDataset, LocationItem } from '@/models/weather.types';
import { XmlParseReport } from '@/models/xml.types';
import {
  DatabaseSummaryStats,
  DbAirQualityRecord,
  DbForecastRecord,
  DbLocationRecord,
  DbSyncQueueItem,
  DbWeatherRecord,
  DbXmlImportRecord,
  DbXmlWeatherRecord,
} from '@/models/database.types';
import { DatabaseAdapter, getDatabaseAdapter } from './storageAdapter';

class SQLiteService {
  private adapter: DatabaseAdapter;
  private isInitialized = false;

  constructor() {
    this.adapter = getDatabaseAdapter();
  }

  /**
   * Initialize schema and tables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      await this.adapter.init();
      this.isInitialized = true;
      console.log('[SQLiteService] Database initialized successfully (Native:', this.adapter.isNative, ')');
    } catch (err: any) {
      console.error('[SQLiteService] Initialization failed:', err);
      throw err;
    }
  }

  /**
   * Save or update a location
   */
  async saveLocation(loc: LocationItem): Promise<void> {
    await this.initialize();
    const sql = `
      INSERT OR REPLACE INTO locations (id, name, country, latitude, longitude, elevation, timezone, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await this.adapter.execute(sql, [
      loc.id,
      loc.name,
      loc.country,
      loc.latitude,
      loc.longitude,
      loc.elevation ?? null,
      loc.timezone ?? null,
      new Date().toISOString(),
    ]);
  }

  /**
   * Transactionally persist full weather dataset, update sync queue
   */
  async persistWeatherDataset(dataset: CompleteWeatherDataset): Promise<void> {
    await this.initialize();
    const loc = dataset.location;

    await this.adapter.transaction(async (tx) => {
      // 1. Save location
      await tx.execute(
        `INSERT OR REPLACE INTO locations (id, name, country, latitude, longitude, elevation, timezone, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [loc.id, loc.name, loc.country, loc.latitude, loc.longitude, loc.elevation ?? null, loc.timezone ?? null, dataset.fetchedAt]
      );

      // 2. Save current weather
      const cur = dataset.current;
      const weatherRecordId = `w_${loc.id}_${cur.time.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await tx.execute(
        `INSERT OR REPLACE INTO weather_records 
         (id, location_id, timestamp, temperature, apparent_temperature, relative_humidity, precipitation, wind_speed, wind_direction, pressure, weather_code, weather_description, is_day, synced_to_firebase)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          weatherRecordId,
          loc.id,
          cur.time,
          cur.temperature,
          cur.apparentTemperature,
          cur.relativeHumidity,
          cur.precipitation,
          cur.windSpeed,
          cur.windDirection,
          cur.pressure,
          cur.weatherCode,
          cur.weatherDescription,
          cur.isDay ? 1 : 0,
        ]
      );

      // 3. Save daily forecasts
      for (const day of dataset.daily) {
        const forecastId = `fc_daily_${loc.id}_${day.date}`;
        await tx.execute(
          `INSERT OR REPLACE INTO forecast_records
           (id, location_id, forecast_date, granularity, temperature_max, temperature_min, apparent_temperature, precipitation, wind_speed, weather_code, synced_to_firebase)
           VALUES (?, ?, ?, 'daily', ?, ?, ?, ?, ?, ?, 0);`,
          [
            forecastId,
            loc.id,
            day.date,
            day.temperatureMax,
            day.temperatureMin,
            day.apparentTemperatureMax,
            day.precipitationSum,
            day.windSpeedMax,
            day.weatherCode,
          ]
        );
      }

      // 4. Save Air Quality
      if (dataset.airQuality && dataset.airQuality.length > 0) {
        for (const aq of dataset.airQuality.slice(0, 24)) {
          const aqId = `aq_${loc.id}_${aq.time.replace(/[^a-zA-Z0-9]/g, '_')}`;
          await tx.execute(
            `INSERT OR REPLACE INTO air_quality_records
             (id, location_id, timestamp, pm2_5, pm10, european_aqi, us_aqi, synced_to_firebase)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
            [aqId, loc.id, aq.time, aq.pm2_5, aq.pm10, aq.europeanAqi, aq.usAqi]
          );
        }
      }

      // 5. Add to Sync Queue
      const queueId = `sync_${weatherRecordId}`;
      const payload = JSON.stringify({
        location: loc,
        current: cur,
        daily: dataset.daily,
        airQuality: dataset.airQuality ? dataset.airQuality[0] : null,
      });

      await tx.execute(
        `INSERT OR REPLACE INTO sync_queue (id, entity_type, entity_id, payload, created_at, retry_count, status)
         VALUES (?, 'weather', ?, ?, ?, 0, 'PENDING');`,
        [queueId, weatherRecordId, payload, dataset.fetchedAt]
      );
    });
  }

  /**
   * Save XML Import and its normalized weather records transactionally
   */
  async persistXmlReport(report: XmlParseReport): Promise<number> {
    await this.initialize();
    const importId = `xml_imp_${Date.now()}`;

    await this.adapter.transaction(async (tx) => {
      // 1. Insert XML import metadata
      await tx.execute(
        `INSERT INTO xml_imports (id, source_url, fetch_timestamp, content_type, status_code, parsing_status, record_count, byte_size, error_message, synced_to_firebase)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          importId,
          report.sourceEndpoint,
          report.fetchedAt,
          report.contentType,
          report.statusCode,
          report.success ? 'SUCCESS' : 'FAILED',
          report.parsedRecordCount,
          report.rawXmlLength,
          report.errorMessage || null,
        ]
      );

      // 2. Insert normalized records
      for (const rec of report.records) {
        await tx.execute(
          `INSERT OR REPLACE INTO xml_weather_records
           (id, import_id, timestamp, location_name, latitude, longitude, temperature_c, humidity_percent, pressure_hpa, wind_speed_mps, wind_direction_deg, weather_condition, synced_to_firebase)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
          [
            rec.id,
            importId,
            rec.timestamp,
            rec.locationName,
            rec.latitude,
            rec.longitude,
            rec.temperatureC,
            rec.humidityPercent ?? null,
            rec.pressureHpa ?? null,
            rec.windSpeedMps ?? null,
            rec.windDirectionDeg ?? null,
            rec.weatherCondition ?? null,
          ]
        );
      }

      // 3. Queue for Firebase sync
      if (report.records.length > 0) {
        const queueId = `sync_xml_${importId}`;
        const queuePayload = JSON.stringify({
          importId,
          sourceEndpoint: report.sourceEndpoint,
          recordCount: report.records.length,
          sampleRecords: report.records.slice(0, 10),
        });
        await tx.execute(
          `INSERT OR REPLACE INTO sync_queue (id, entity_type, entity_id, payload, created_at, retry_count, status)
           VALUES (?, 'xml_import', ?, ?, ?, 0, 'PENDING');`,
          [queueId, importId, queuePayload, report.fetchedAt]
        );
      }
    });

    return report.records.length;
  }

  /**
   * Retrieve latest cached weather for offline display
   */
  async getLatestCachedWeather(locationId: string): Promise<DbWeatherRecord | null> {
    await this.initialize();
    const res = await this.adapter.execute(
      `SELECT * FROM weather_records WHERE location_id = ? ORDER BY timestamp DESC LIMIT 1;`,
      [locationId]
    );
    return res.rows[0] || null;
  }

  /**
   * Retrieve historical weather readings for a location
   */
  async getWeatherRecords(locationId?: string, limit: number = 50): Promise<DbWeatherRecord[]> {
    await this.initialize();
    if (locationId) {
      const res = await this.adapter.execute(
        `SELECT * FROM weather_records WHERE location_id = ? ORDER BY timestamp DESC LIMIT ?;`,
        [locationId, limit]
      );
      return res.rows;
    } else {
      const res = await this.adapter.execute(
        `SELECT * FROM weather_records ORDER BY timestamp DESC LIMIT ?;`,
        [limit]
      );
      return res.rows;
    }
  }

  /**
   * Retrieve XML imports
   */
  async getXmlImports(limit: number = 20): Promise<DbXmlImportRecord[]> {
    await this.initialize();
    const res = await this.adapter.execute(
      `SELECT * FROM xml_imports ORDER BY fetch_timestamp DESC LIMIT ?;`,
      [limit]
    );
    return res.rows;
  }

  /**
   * Retrieve normalized XML records
   */
  async getXmlWeatherRecords(importId?: string, limit: number = 50): Promise<DbXmlWeatherRecord[]> {
    await this.initialize();
    if (importId) {
      const res = await this.adapter.execute(
        `SELECT * FROM xml_weather_records WHERE import_id = ? ORDER BY timestamp ASC LIMIT ?;`,
        [importId, limit]
      );
      return res.rows;
    } else {
      const res = await this.adapter.execute(
        `SELECT * FROM xml_weather_records ORDER BY timestamp DESC LIMIT ?;`,
        [limit]
      );
      return res.rows;
    }
  }

  /**
   * Retrieve pending sync queue items
   */
  async getPendingSyncItems(limit: number = 20): Promise<DbSyncQueueItem[]> {
    await this.initialize();
    const res = await this.adapter.execute(
      `SELECT * FROM sync_queue WHERE status = 'PENDING' OR status = 'FAILED' ORDER BY created_at ASC LIMIT ?;`,
      [limit]
    );
    return res.rows;
  }

  /**
   * Update sync queue item status
   */
  async updateSyncItemStatus(
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'FAILED' | 'COMPLETED',
    error?: string
  ): Promise<void> {
    await this.initialize();
    await this.adapter.execute(
      `UPDATE sync_queue SET status = ?, last_error = ?, retry_count = retry_count + 1 WHERE id = ?;`,
      [status, error || null, id]
    );
  }

  /**
   * Get database summary diagnostics
   */
  async getDatabaseSummary(): Promise<DatabaseSummaryStats> {
    await this.initialize();

    const [locRes, wRes, fRes, aqRes, xmlImpRes, xmlRecRes, syncRes] = await Promise.all([
      this.adapter.execute('SELECT COUNT(*) AS count FROM locations;'),
      this.adapter.execute('SELECT COUNT(*) AS count FROM weather_records;'),
      this.adapter.execute('SELECT COUNT(*) AS count FROM forecast_records;'),
      this.adapter.execute('SELECT COUNT(*) AS count FROM air_quality_records;'),
      this.adapter.execute('SELECT COUNT(*) AS count FROM xml_imports;'),
      this.adapter.execute('SELECT COUNT(*) AS count FROM xml_weather_records;'),
      this.adapter.execute("SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'PENDING';"),
    ]);

    const latestW = await this.adapter.execute('SELECT timestamp FROM weather_records ORDER BY timestamp DESC LIMIT 1;');
    const lastWrite = latestW.rows[0]?.timestamp || null;

    return {
      locationCount: Number(locRes.rows[0]?.count ?? 0),
      weatherRecordCount: Number(wRes.rows[0]?.count ?? 0),
      forecastRecordCount: Number(fRes.rows[0]?.count ?? 0),
      airQualityRecordCount: Number(aqRes.rows[0]?.count ?? 0),
      xmlImportCount: Number(xmlImpRes.rows[0]?.count ?? 0),
      xmlRecordCount: Number(xmlRecRes.rows[0]?.count ?? 0),
      pendingSyncCount: Number(syncRes.rows[0]?.count ?? 0),
      lastWriteTimestamp: lastWrite,
    };
  }

  /**
   * Clear all local tables (for testing or reset)
   */
  async clearAllData(): Promise<void> {
    await this.initialize();
    await this.adapter.execute('DELETE FROM weather_records;');
    await this.adapter.execute('DELETE FROM forecast_records;');
    await this.adapter.execute('DELETE FROM air_quality_records;');
    await this.adapter.execute('DELETE FROM xml_weather_records;');
    await this.adapter.execute('DELETE FROM xml_imports;');
    await this.adapter.execute('DELETE FROM sync_queue;');
    console.log('[SQLiteService] Local database cleared');
  }
}

export const sqliteService = new SQLiteService();
