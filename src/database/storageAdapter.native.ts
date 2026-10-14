/**
 * AtmosIQ - Native SQLite Database Storage Adapter (Android & iOS)
 * Uses native expo-sqlite on physical mobile devices.
 */

import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';
import { DatabaseAdapter, SqlQueryResult } from './storageAdapter.types';

export * from './storageAdapter.types';

class NativeSQLiteDatabaseAdapter implements DatabaseAdapter {
  public isNative = true;
  private db: any = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('atmosiq.db');

    // Run PRAGMA WAL mode for high concurrency & durability
    await this.db.execAsync('PRAGMA journal_mode = WAL;');
    await this.db.execAsync('PRAGMA foreign_keys = ON;');

    // Apply migrations
    for (const migration of MIGRATIONS) {
      for (const statement of migration.sqlStatements) {
        await this.db.execAsync(statement);
      }
    }
  }

  async execute(sql: string, params: any[] = []): Promise<SqlQueryResult> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) {
      const rows = await this.db.getAllAsync(sql, params);
      return { rows, rowsAffected: 0 };
    } else {
      const result = await this.db.runAsync(sql, params);
      return {
        rows: [],
        rowsAffected: result.changes,
        insertId: result.lastInsertRowId,
      };
    }
  }

  async transaction(callback: (tx: DatabaseAdapter) => Promise<void>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.withTransactionAsync(async () => {
      await callback(this);
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

let cachedNativeAdapter: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!cachedNativeAdapter) {
    cachedNativeAdapter = new NativeSQLiteDatabaseAdapter();
  }
  return cachedNativeAdapter;
}
