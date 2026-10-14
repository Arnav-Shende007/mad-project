/**
 * AtmosIQ - Global Weather Intelligence State Context
 * Orchestrates API ingestion, SQLite persistence, analytics calculations,
 * XML data explorer workflows, and cloud synchronization.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CompleteWeatherDataset, LocationItem } from '@/models/weather.types';
import { FullAnalyticsPayload } from '@/models/analytics.types';
import { RawXmlFetchResult, XmlParseReport } from '@/models/xml.types';
import { DEFAULT_LOCATIONS, getCompleteWeatherData } from '@/api/openMeteo';
import { fetchRawXmlFromEndpoint, parseAndNormalizeXml, VERIFIED_XML_ENDPOINTS } from '@/api/xmlWeatherApi';
import { sqliteService } from '@/database/sqlite';
import { firestoreSyncService, SyncResult } from '@/firebase/firestoreSync';
import { computeWeatherAnalytics } from '@/analytics/weatherAnalytics';
import { getFirebaseStatus } from '@/firebase/config';

interface WeatherContextType {
  currentLocation: LocationItem;
  weatherData: CompleteWeatherDataset | null;
  analytics: FullAnalyticsPayload | null;
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  error: string | null;
  selectLocation: (loc: LocationItem) => Promise<void>;
  refreshWeather: () => Promise<void>;
  
  // XML Explorer State & Operations
  rawXmlData: RawXmlFetchResult | null;
  xmlReport: XmlParseReport | null;
  isXmlLoading: boolean;
  xmlError: string | null;
  fetchAndParseXml: (endpointUrl?: string, endpointId?: string) => Promise<XmlParseReport | null>;

  // Cloud Sync State & Operations
  syncResult: SyncResult | null;
  isSyncing: boolean;
  triggerCloudSync: () => Promise<SyncResult>;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(DEFAULT_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState<CompleteWeatherDataset | null>(null);
  const [analytics, setAnalytics] = useState<FullAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // XML Explorer state
  const [rawXmlData, setRawXmlData] = useState<RawXmlFetchResult | null>(null);
  const [xmlReport, setXmlReport] = useState<XmlParseReport | null>(null);
  const [isXmlLoading, setIsXmlLoading] = useState<boolean>(false);
  const [xmlError, setXmlError] = useState<string | null>(null);

  // Cloud Sync state
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  /**
   * Load weather data for a specific location
   */
  const loadWeatherData = useCallback(async (loc: LocationItem) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch live weather from Open-Meteo REST API
      const dataset = await getCompleteWeatherData(loc);
      setWeatherData(dataset);
      setIsOffline(false);
      setLastUpdated(dataset.fetchedAt);

      // 2. Compute statistical analytics
      const analyticsResult = computeWeatherAnalytics(dataset);
      setAnalytics(analyticsResult);

      // 3. Persist dataset to local SQLite database asynchronously
      try {
        await sqliteService.persistWeatherDataset(dataset);
      } catch (dbErr: any) {
        console.warn('[WeatherProvider] SQLite persistence notice:', dbErr.message);
      }
    } catch (apiErr: any) {
      console.warn('[WeatherProvider] Live fetch failed, attempting SQLite cache fallback:', apiErr.message);

      // Fallback to SQLite cache for offline resiliency
      try {
        const cached = await sqliteService.getLatestCachedWeather(loc.id);
        if (cached) {
          const cachedDataset: CompleteWeatherDataset = {
            location: loc,
            current: {
              time: cached.timestamp,
              temperature: cached.temperature,
              apparentTemperature: cached.apparent_temperature,
              relativeHumidity: cached.relative_humidity,
              precipitation: cached.precipitation,
              weatherCode: cached.weather_code,
              weatherDescription: `${cached.weather_description} (Cached)`,
              windSpeed: cached.wind_speed,
              windDirection: cached.wind_direction,
              pressure: cached.pressure,
              isDay: Boolean(cached.is_day),
            },
            hourly: [],
            daily: [],
            fetchedAt: cached.timestamp,
            dataSource: 'SQLite Local Cache (Offline Mode)',
            isOfflineCached: true,
          };
          setWeatherData(cachedDataset);
          setIsOffline(true);
          setLastUpdated(cached.timestamp);
        } else {
          setError(`Unable to connect: ${apiErr.message}`);
        }
      } catch (cacheErr: any) {
        setError(`Network failure: ${apiErr.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    sqliteService.initialize().catch(console.error);
    loadWeatherData(currentLocation);
  }, []);

  const selectLocation = async (loc: LocationItem) => {
    setCurrentLocation(loc);
    await loadWeatherData(loc);
  };

  const refreshWeather = async () => {
    await loadWeatherData(currentLocation);
  };

  /**
   * Execute live XML fetch, header inspection, parsing, SQLite storage & Firestore sync
   */
  const fetchAndParseXml = async (
    endpointUrl: string = VERIFIED_XML_ENDPOINTS[0].url,
    endpointId: string = VERIFIED_XML_ENDPOINTS[0].id
  ): Promise<XmlParseReport | null> => {
    setIsXmlLoading(true);
    setXmlError(null);

    try {
      // Step A: Send HTTP request to XML-producing REST endpoint & retrieve raw response
      const rawResult = await fetchRawXmlFromEndpoint(endpointUrl, endpointId);
      setRawXmlData(rawResult);

      // Step B: Validate XML & parse into typed normalized models
      const report = parseAndNormalizeXml(rawResult, currentLocation.name);

      // Step C: Persist normalized records to local SQLite
      let savedSqliteCount = 0;
      try {
        savedSqliteCount = await sqliteService.persistXmlReport(report);
        report.sqliteSavedCount = savedSqliteCount;
      } catch (sqlErr: any) {
        console.warn('[fetchAndParseXml] SQLite XML save notice:', sqlErr.message);
      }

      // Step D: Synchronize to Firebase if configured
      const fbStatus = getFirebaseStatus();
      if (fbStatus.isConfigured && report.success) {
        try {
          const syncRes = await firestoreSyncService.syncXmlReportDirectly(report);
          report.firebaseSyncedCount = syncRes.recordsSynced;
        } catch (syncErr: any) {
          console.warn('[fetchAndParseXml] Firestore sync notice:', syncErr.message);
        }
      }

      setXmlReport(report);
      return report;
    } catch (err: any) {
      const errMsg = `XML Workflow error: ${err.message}`;
      setXmlError(errMsg);
      return null;
    } finally {
      setIsXmlLoading(false);
    }
  };

  /**
   * Manual Cloud Sync to Firebase Firestore
   */
  const triggerCloudSync = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const result = await firestoreSyncService.syncPendingQueue();
      setSyncResult(result);
      return result;
    } catch (err: any) {
      const failedResult: SyncResult = {
        success: false,
        isConfigured: getFirebaseStatus().isConfigured,
        recordsSynced: 0,
        recordsFailed: 1,
        timestamp: new Date().toISOString(),
        message: `Sync operation exception: ${err.message}`,
      };
      setSyncResult(failedResult);
      return failedResult;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        currentLocation,
        weatherData,
        analytics,
        isLoading,
        isOffline,
        lastUpdated,
        error,
        selectLocation,
        refreshWeather,
        rawXmlData,
        xmlReport,
        isXmlLoading,
        xmlError,
        fetchAndParseXml,
        syncResult,
        isSyncing,
        triggerCloudSync,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextType {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
