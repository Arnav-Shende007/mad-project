/**
 * AtmosIQ - Cloud Firestore Synchronization Service
 * 
 * Synchronizes normalized weather records, XML imports, and air quality
 * data from local SQLite to Firebase Firestore using batch writes,
 * deterministic document keys, and retry queues.
 */

import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseStatus, getFirestoreInstance } from './config';
import { sqliteService } from '@/database/sqlite';
import { XmlParseReport } from '@/models/xml.types';

export interface SyncResult {
  success: boolean;
  isConfigured: boolean;
  recordsSynced: number;
  recordsFailed: number;
  timestamp: string;
  message: string;
}

export function parseFirestoreErrorMessage(err: any): string {
  const msg = err?.message || String(err);
  if (
    msg.includes('NOT_FOUND') ||
    msg.includes('does not exist') ||
    err?.code === 'not-found'
  ) {
    return 'Cloud Firestore database not created yet in Firebase Console. Go to Firebase Console -> Build -> Firestore Database -> Create database.';
  }
  if (
    msg.includes('permission-denied') ||
    msg.includes('PERMISSION_DENIED') ||
    err?.code === 'permission-denied'
  ) {
    return 'Firestore permission denied. Deploy the Firestore Security Rules in Firebase Console (see README Section 7).';
  }
  if (msg.includes('unavailable') || err?.code === 'unavailable') {
    return 'Firestore service temporarily unavailable. Check your internet connection.';
  }
  return msg;
}

class FirestoreSyncService {
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private totalSyncedCount = 0;
  private totalFailedCount = 0;

  /**
   * Synchronize pending SQLite queue items to Firestore
   */
  async syncPendingQueue(): Promise<SyncResult> {
    const status = getFirebaseStatus();
    if (!status.isConfigured) {
      return {
        success: false,
        isConfigured: false,
        recordsSynced: 0,
        recordsFailed: 0,
        timestamp: new Date().toISOString(),
        message: 'Cloud Sync is unconfigured. Set EXPO_PUBLIC_FIREBASE_* in .env to enable Firestore uploads.',
      };
    }

    const db = getFirestoreInstance();
    if (!db) {
      return {
        success: false,
        isConfigured: false,
        recordsSynced: 0,
        recordsFailed: 0,
        timestamp: new Date().toISOString(),
        message: 'Firestore instance unavailable.',
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        isConfigured: true,
        recordsSynced: 0,
        recordsFailed: 0,
        timestamp: new Date().toISOString(),
        message: 'Sync is already in progress.',
      };
    }

    this.isSyncing = true;
    let syncedInRun = 0;
    let failedInRun = 0;
    const stagedItemIds: string[] = [];

    try {
      const pendingItems = await sqliteService.getPendingSyncItems(50);

      // If queue is empty, attempt to sync latest local weather record directly so manual sync is never a no-op
      if (pendingItems.length === 0) {
        const fallback = await sqliteService.getLatestWeatherRecordForSync();
        if (fallback) {
          const loc = fallback.location;
          const cur = fallback.weather;
          const fallbackBatch = writeBatch(db);

          const locRef = doc(db, 'locations', loc.id);
          fallbackBatch.set(locRef, {
            id: String(loc.id),
            name: String(loc.name || 'Current City'),
            country: String(loc.country || ''),
            latitude: Number(loc.latitude) || 0,
            longitude: Number(loc.longitude) || 0,
            timezone: loc.timezone || null,
            lastUpdated: serverTimestamp(),
          }, { merge: true });

          const tempVal = Number(cur.temperature) || 0;
          const weatherRef = doc(db, 'weatherRecords', cur.id);
          fallbackBatch.set(weatherRef, {
            id: String(cur.id),
            locationId: String(loc.id),
            locationName: String(loc.name || 'Current City'),
            temperature: tempVal,
            apparentTemperature: Number(cur.apparent_temperature ?? tempVal) || 0,
            humidity: Number(cur.relative_humidity) || 0,
            precipitation: Number(cur.precipitation) || 0,
            windSpeed: Number(cur.wind_speed) || 0,
            windDirection: Number(cur.wind_direction) || 0,
            pressure: Number(cur.pressure) || 1013,
            weatherCode: Number(cur.weather_code) || 0,
            condition: String(cur.weather_description || 'Clear'),
            observationTime: String(cur.timestamp || new Date().toISOString()),
            uploadedAt: serverTimestamp(),
          }, { merge: true });

          const commitWithTimeout = Promise.race([
            fallbackBatch.commit(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Firestore commit timed out after 12 seconds')), 12000)
            ),
          ]);
          await commitWithTimeout;

          await sqliteService.markWeatherRecordSynced(cur.id);

          this.lastSyncTime = new Date().toISOString();
          this.totalSyncedCount += 1;

          return {
            success: true,
            isConfigured: true,
            recordsSynced: 1,
            recordsFailed: 0,
            timestamp: this.lastSyncTime,
            message: `Successfully synchronized current local weather for ${loc.name} to Firestore.`,
          };
        }

        this.isSyncing = false;
        return {
          success: true,
          isConfigured: true,
          recordsSynced: 0,
          recordsFailed: 0,
          timestamp: new Date().toISOString(),
          message: 'All local records are currently synchronized with Firestore.',
        };
      }

      // Batch write (Firestore limit is 500 per batch)
      const batch = writeBatch(db);

      for (const item of pendingItems) {
        try {
          const payload = JSON.parse(item.payload);

          if (item.entity_type === 'weather') {
            const loc = payload.location;
            const cur = payload.current;

            // 1. Location document
            if (loc && loc.id) {
              const locRef = doc(db, 'locations', loc.id);
              batch.set(locRef, {
                id: String(loc.id),
                name: String(loc.name || 'Unknown Location'),
                country: String(loc.country || ''),
                latitude: Number(loc.latitude) || 0,
                longitude: Number(loc.longitude) || 0,
                timezone: loc.timezone || null,
                lastUpdated: serverTimestamp(),
              }, { merge: true });
            }

            // 2. Weather record document
            const tempVal = Number(cur?.temperature) || 0;
            const weatherRef = doc(db, 'weatherRecords', item.entity_id);
            batch.set(weatherRef, {
              id: String(item.entity_id),
              locationId: String(loc?.id || 'unknown'),
              locationName: String(loc?.name || 'Unknown'),
              temperature: tempVal,
              apparentTemperature: Number(cur?.apparentTemperature ?? tempVal) || 0,
              humidity: Number(cur?.relativeHumidity) || 0,
              precipitation: Number(cur?.precipitation) || 0,
              windSpeed: Number(cur?.windSpeed) || 0,
              windDirection: Number(cur?.windDirection) || 0,
              pressure: Number(cur?.pressure) || 1013,
              weatherCode: Number(cur?.weatherCode) || 0,
              condition: String(cur?.weatherDescription || 'Fair'),
              observationTime: String(cur?.time || new Date().toISOString()),
              uploadedAt: serverTimestamp(),
            }, { merge: true });

            stagedItemIds.push(item.id);
          } else if (item.entity_type === 'xml_import') {
            const sourceUrl = String(
              payload.sourceUrl ||
              payload.sourceEndpoint ||
              'https://api.met.no/weatherapi/locationforecast/2.0/classic'
            );
            const xmlRef = doc(db, 'xmlImports', item.entity_id);
            batch.set(xmlRef, {
              importId: String(item.entity_id),
              sourceUrl,
              sourceEndpoint: sourceUrl,
              recordCount: Number(payload.recordCount || (payload.sampleRecords?.length ?? 0)),
              sampleRecords: payload.sampleRecords || [],
              uploadedAt: serverTimestamp(),
            }, { merge: true });

            stagedItemIds.push(item.id);
          } else {
            failedInRun++;
            await sqliteService.updateSyncItemStatus(item.id, 'FAILED', `Unsupported entity: ${item.entity_type}`);
          }
        } catch (itemErr: any) {
          failedInRun++;
          await sqliteService.updateSyncItemStatus(item.id, 'FAILED', itemErr.message);
        }
      }

      if (stagedItemIds.length === 0) {
        this.isSyncing = false;
        return {
          success: failedInRun === 0,
          isConfigured: true,
          recordsSynced: 0,
          recordsFailed: failedInRun,
          timestamp: new Date().toISOString(),
          message: failedInRun > 0 ? `Failed to parse ${failedInRun} records.` : 'No valid records to synchronize.',
        };
      }

      // Commit the batch to Firestore with 12s timeout to prevent hanging on dropped mobile streams
      const commitWithTimeout = Promise.race([
        batch.commit(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore commit timed out after 12 seconds')), 12000)
        ),
      ]);
      await commitWithTimeout;

      // Only mark items as COMPLETED after successful commit
      for (const id of stagedItemIds) {
        await sqliteService.updateSyncItemStatus(id, 'COMPLETED');
      }
      syncedInRun = stagedItemIds.length;

      this.lastSyncTime = new Date().toISOString();
      this.totalSyncedCount += syncedInRun;
      this.totalFailedCount += failedInRun;

      return {
        success: true,
        isConfigured: true,
        recordsSynced: syncedInRun,
        recordsFailed: failedInRun,
        timestamp: this.lastSyncTime,
        message: `Successfully synchronized ${syncedInRun} records to Firestore.`,
      };
    } catch (err: any) {
      const friendlyError = parseFirestoreErrorMessage(err);
      for (const id of stagedItemIds) {
        await sqliteService.updateSyncItemStatus(id, 'FAILED', friendlyError);
      }
      failedInRun += stagedItemIds.length;
      this.totalFailedCount += failedInRun;

      return {
        success: false,
        isConfigured: true,
        recordsSynced: 0,
        recordsFailed: failedInRun,
        timestamp: new Date().toISOString(),
        message: `Firestore sync failed: ${friendlyError}`,
      };
    } finally {
      this.isSyncing = false;
    }

  }

  /**
   * Upload an XML report directly to Firestore
   */
  async syncXmlReportDirectly(report: XmlParseReport): Promise<SyncResult> {
    const status = getFirebaseStatus();
    if (!status.isConfigured) {
      return {
        success: false,
        isConfigured: false,
        recordsSynced: 0,
        recordsFailed: 0,
        timestamp: new Date().toISOString(),
        message: 'Cloud Sync is unconfigured (Local SQLite mode active).',
      };
    }

    const db = getFirestoreInstance();
    if (!db) {
      return {
        success: false,
        isConfigured: false,
        recordsSynced: 0,
        recordsFailed: 0,
        timestamp: new Date().toISOString(),
        message: 'Firestore instance not ready.',
      };
    }

    try {
      const batch = writeBatch(db);
      const importDocId = `xml_imp_${Date.now()}`;
      const importRef = doc(db, 'xmlImports', importDocId);

      batch.set(importRef, {
        id: importDocId,
        sourceUrl: String(report.sourceEndpoint || 'https://api.met.no/weatherapi/locationforecast/2.0/classic'),
        sourceEndpoint: String(report.sourceEndpoint || 'https://api.met.no/weatherapi/locationforecast/2.0/classic'),
        contentType: report.contentType,
        statusCode: report.statusCode,
        recordCount: Number(report.parsedRecordCount) || 0,
        fetchedAt: report.fetchedAt,
        uploadedAt: serverTimestamp(),
      });

      // Upload up to 25 normalized XML records
      const recordsToUpload = report.records.slice(0, 25);
      for (const rec of recordsToUpload) {
        const recRef = doc(db, 'xmlWeatherRecords', rec.id);
        batch.set(recRef, {
          id: String(rec.id),
          importId: importDocId,
          timestamp: String(rec.timestamp),
          locationName: String(rec.locationName || 'Unknown'),
          temperatureC: Number(rec.temperatureC) || 0,
          humidityPercent: rec.humidityPercent != null ? Number(rec.humidityPercent) : null,
          pressureHpa: rec.pressureHpa != null ? Number(rec.pressureHpa) : null,
          windSpeedMps: rec.windSpeedMps != null ? Number(rec.windSpeedMps) : null,
          weatherCondition: rec.weatherCondition != null ? String(rec.weatherCondition) : null,
          uploadedAt: serverTimestamp(),
        });
      }

      const commitWithTimeout = Promise.race([
        batch.commit(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore commit timed out after 12 seconds')), 12000)
        ),
      ]);
      await commitWithTimeout;


      this.lastSyncTime = new Date().toISOString();
      this.totalSyncedCount += recordsToUpload.length + 1;

      return {
        success: true,
        isConfigured: true,
        recordsSynced: recordsToUpload.length + 1,
        recordsFailed: 0,
        timestamp: this.lastSyncTime,
        message: `Successfully uploaded XML Import and ${recordsToUpload.length} normalized records to Firestore.`,
      };
    } catch (err: any) {
      const friendlyError = parseFirestoreErrorMessage(err);
      return {
        success: false,
        isConfigured: true,
        recordsSynced: 0,
        recordsFailed: report.records.length,
        timestamp: new Date().toISOString(),
        message: `Failed to upload XML records to Firestore: ${friendlyError}`,
      };
    }
  }

  getSyncStats() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      totalSyncedCount: this.totalSyncedCount,
      totalFailedCount: this.totalFailedCount,
    };
  }
}

export const firestoreSyncService = new FirestoreSyncService();
