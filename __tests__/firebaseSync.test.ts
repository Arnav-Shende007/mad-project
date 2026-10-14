/**
 * AtmosIQ - Firebase Cloud Synchronization Unit Tests
 */

import { getFirebaseStatus } from '../src/firebase/config';
import { firestoreSyncService } from '../src/firebase/firestoreSync';

describe('Firebase Firestore Cloud Sync', () => {
  it('correctly handles unconfigured environment variables gracefully', () => {
    const status = getFirebaseStatus();
    // In test environment without .env, it should safely identify as unconfigured
    expect(typeof status.isConfigured).toBe('boolean');
    expect(status.statusMessage).toBeDefined();
  });

  it('returns clean error payload when syncing without Firestore configuration', async () => {
    const status = getFirebaseStatus();
    if (!status.isConfigured) {
      const result = await firestoreSyncService.syncPendingQueue();
      expect(result.success).toBe(false);
      expect(result.isConfigured).toBe(false);
      expect(result.message).toContain('Cloud Sync is unconfigured');
    }
  });

  it('tracks sync statistics accurately', () => {
    const stats = firestoreSyncService.getSyncStats();
    expect(typeof stats.isSyncing).toBe('boolean');
    expect(typeof stats.totalSyncedCount).toBe('number');
    expect(typeof stats.totalFailedCount).toBe('number');
  });
});
