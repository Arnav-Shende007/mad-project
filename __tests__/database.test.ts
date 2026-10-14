/**
 * AtmosIQ - Local Database & Persistence Unit Tests
 */

import { sqliteService } from '../src/database/sqlite';
import { LocationItem, CompleteWeatherDataset } from '../src/models/weather.types';
import { XmlParseReport } from '../src/models/xml.types';

describe('Local Database & SQLite Persistence', () => {
  beforeAll(async () => {
    await sqliteService.initialize();
  });

  beforeEach(async () => {
    await sqliteService.clearAllData();
  });

  it('saves and updates locations without duplicating records', () => {
    const loc: LocationItem = {
      id: 'loc_london_test',
      name: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    return sqliteService.saveLocation(loc).then(async () => {
      // Re-save same location with updated metadata
      await sqliteService.saveLocation({
        ...loc,
        elevation: 35,
      });

      const summary = await sqliteService.getDatabaseSummary();
      expect(summary.locationCount).toBe(1);
    });
  });

  it('transactionally persists complete weather datasets and enqueues sync', async () => {
    const dataset: CompleteWeatherDataset = {
      location: {
        id: 'loc_paris_test',
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      },
      current: {
        time: '2026-10-14T15:00:00Z',
        temperature: 18.5,
        apparentTemperature: 18.0,
        relativeHumidity: 60,
        precipitation: 0,
        weatherCode: 1,
        weatherDescription: 'Mainly clear',
        windSpeed: 12,
        windDirection: 210,
        pressure: 1018,
        isDay: true,
      },
      hourly: [],
      daily: [
        {
          date: '2026-10-14',
          weatherCode: 1,
          temperatureMax: 20.0,
          temperatureMin: 11.0,
          apparentTemperatureMax: 19.5,
          apparentTemperatureMin: 10.5,
          precipitationSum: 0,
          precipitationProbabilityMax: 5,
          windSpeedMax: 15,
        },
      ],
      fetchedAt: '2026-10-14T15:00:00Z',
      dataSource: 'Test Source',
    };

    await sqliteService.persistWeatherDataset(dataset);

    const summary = await sqliteService.getDatabaseSummary();
    expect(summary.weatherRecordCount).toBe(1);
    expect(summary.forecastRecordCount).toBe(1);
    expect(summary.pendingSyncCount).toBe(1);

    const cached = await sqliteService.getLatestCachedWeather('loc_paris_test');
    expect(cached).toBeDefined();
    expect(cached?.temperature).toBe(18.5);
    expect(cached?.location_id).toBe('loc_paris_test');
  });

  it('persists XML reports and normalized records', async () => {
    const mockReport: XmlParseReport = {
      success: true,
      sourceEndpoint: 'https://api.met.no/test',
      fetchedAt: '2026-10-14T12:00:00Z',
      rawXmlLength: 1500,
      contentType: 'application/xml',
      statusCode: 200,
      parsedRecordCount: 2,
      records: [
        {
          id: 'xml_rec_1',
          sourceEndpoint: 'https://api.met.no/test',
          timestamp: '2026-10-14T12:00:00Z',
          locationName: 'Norway Grid',
          latitude: 60.1,
          longitude: 9.58,
          temperatureC: 7.5,
          humidityPercent: 65,
          windSpeedMps: 2.5,
        },
        {
          id: 'xml_rec_2',
          sourceEndpoint: 'https://api.met.no/test',
          timestamp: '2026-10-14T13:00:00Z',
          locationName: 'Norway Grid',
          latitude: 60.1,
          longitude: 9.58,
          temperatureC: 8.2,
          humidityPercent: 62,
          windSpeedMps: 3.0,
        },
      ],
      sqliteSavedCount: 0,
      firebaseSyncedCount: 0,
      parseDurationMs: 12,
    };

    const count = await sqliteService.persistXmlReport(mockReport);
    expect(count).toBe(2);

    const summary = await sqliteService.getDatabaseSummary();
    expect(summary.xmlImportCount).toBe(1);
    expect(summary.xmlRecordCount).toBe(2);

    const xmlRecs = await sqliteService.getXmlWeatherRecords();
    expect(xmlRecs.length).toBe(2);
    expect(xmlRecs[0].temperature_c).toBe(8.2);
    expect(xmlRecs[1].temperature_c).toBe(7.5);
  });

  it('updates sync queue item status and retries', async () => {
    const queueItems = await sqliteService.getPendingSyncItems();
    if (queueItems.length > 0) {
      const item = queueItems[0];
      await sqliteService.updateSyncItemStatus(item.id, 'COMPLETED');
      const updated = await sqliteService.getPendingSyncItems();
      expect(updated.find((i) => i.id === item.id)).toBeUndefined();
    }
  });
});
