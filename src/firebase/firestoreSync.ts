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

    try {
      const pendingItems = await sqliteService.getPendingSyncItems(50);
      if (pendingItems.length === 0) {
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
                id: loc.id,
                name: loc.name,
                country: loc.country,
                latitude: loc.latitude,
                longitude: loc.longitude,
                timezone: loc.timezone || null,
                lastUpdated: serverTimestamp(),
              }, { merge: true });
            }

            // 2. Weather record document
            const weatherRef = doc(db, 'weatherRecords', item.entity_id);
            batch.set(weatherRef, {
              id: item.entity_id,
              locationId: loc.id,
              locationName: loc.name,
              temperature: cur.temperature,
              apparentTemperature: cur.apparentTemperature,
              humidity: cur.relativeHumidity,
              precipitation: cur.precipitation,
              windSpeed: cur.windSpeed,
              windDirection: cur.windDirection,
              pressure: cur.pressure,
              weatherCode: cur.weatherCode,
              condition: cur.weatherDescription,
              observationTime: cur.time,
              uploadedAt: serverTimestamp(),
            }, { merge: true });

            syncedInRun++;
          } else if (item.entity_type === 'xml_import') {
            const xmlRef = doc(db, 'xmlImports', item.entity_id);
            batch.set(xmlRef, {
              importId: item.entity_id,
              sourceEndpoint: payload.sourceEndpoint,
              recordCount: payload.recordCount,
              sampleRecords: payload.sampleRecords || [],
              uploadedAt: serverTimestamp(),
            }, { merge: true });

            syncedInRun++;
          }

          // Mark item as COMPLETED in SQLite
          await sqliteService.updateSyncItemStatus(item.id, 'COMPLETED');
        } catch (itemErr: any) {
          failedInRun++;
          await sqliteService.updateSyncItemStatus(item.id, 'FAILED', itemErr.message);
        }
      }

      // Commit the batch
      await batch.commit();

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
      this.totalFailedCount += 1;
      return {
        success: false,
        isConfigured: true,
        recordsSynced: syncedInRun,
        recordsFailed: failedInRun + 1,
        timestamp: new Date().toISOString(),
        message: `Firestore sync failed: ${err.message}`,
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
        sourceUrl: report.sourceEndpoint,
        contentType: report.contentType,
        statusCode: report.statusCode,
        recordCount: report.parsedRecordCount,
        fetchedAt: report.fetchedAt,
        uploadedAt: serverTimestamp(),
      });

      // Upload up to 25 normalized XML records
      const recordsToUpload = report.records.slice(0, 25);
      for (const rec of recordsToUpload) {
        const recRef = doc(db, 'xmlWeatherRecords', rec.id);
        batch.set(recRef, {
          id: rec.id,
          importId: importDocId,
          timestamp: rec.timestamp,
          locationName: rec.locationName,
          temperatureC: rec.temperatureC,
          humidityPercent: rec.humidityPercent ?? null,
          pressureHpa: rec.pressureHpa ?? null,
          windSpeedMps: rec.windSpeedMps ?? null,
          weatherCondition: rec.weatherCondition ?? null,
          uploadedAt: serverTimestamp(),
        });
      }

      await batch.commit();

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
      return {
        success: false,
        isConfigured: true,
        recordsSynced: 0,
        recordsFailed: report.records.length,
        timestamp: new Date().toISOString(),
        message: `Failed to upload XML records to Firestore: ${err.message}`,
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
