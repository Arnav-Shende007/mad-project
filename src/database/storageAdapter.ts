/**
 * AtmosIQ - Universal Web & Node Persistence Storage Adapter
 * Zero native dependencies; ensures universal web and test compatibility.
 */

import { MIGRATIONS } from './migrations';
import { DatabaseAdapter, SqlQueryResult } from './storageAdapter.types';

export * from './storageAdapter.types';

class WebFallbackDatabaseAdapter implements DatabaseAdapter {
  public isNative = false;
  private tables: Map<string, any[]> = new Map();
  private schemaVersion: number = 0;

  async init(): Promise<void> {
    for (const migration of MIGRATIONS) {
      if (migration.version > this.schemaVersion) {
        this.tables.set('locations', []);
        this.tables.set('weather_records', []);
        this.tables.set('forecast_records', []);
        this.tables.set('air_quality_records', []);
        this.tables.set('xml_imports', []);
        this.tables.set('xml_weather_records', []);
        this.tables.set('sync_queue', []);
        this.tables.set('schema_version', [{ version: migration.version, applied_at: new Date().toISOString() }]);
        this.schemaVersion = migration.version;
      }
    }
  }

  async execute(sql: string, params: any[] = []): Promise<SqlQueryResult> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // SELECT COUNT(*)
    if (upper.startsWith('SELECT COUNT(*) AS COUNT FROM') || upper.startsWith('SELECT COUNT(*) FROM')) {
      const parts = trimmed.split(/\s+/);
      const fromIdx = parts.findIndex((p) => p.toUpperCase() === 'FROM');
      const tableName = parts[fromIdx + 1]?.replace(/;/g, '').toLowerCase();
      const rows = this.tables.get(tableName) || [];
      return { rows: [{ count: rows.length }], rowsAffected: 0 };
    }

    // SELECT
    if (upper.startsWith('SELECT')) {
      const match = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      const tableName = match ? match[1].toLowerCase() : '';
      let tableRows = [...(this.tables.get(tableName) || [])];

      const whereMatch = trimmed.match(/WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?/i);
      if (whereMatch && params.length > 0) {
        const col = whereMatch[1];
        const val = params[0];
        tableRows = tableRows.filter((r) => String(r[col]) === String(val));
      }

      if (upper.includes('ORDER BY')) {
        const orderMatch = trimmed.match(/ORDER BY\s+([a-zA-Z0-9_]+)\s+(ASC|DESC)/i);
        if (orderMatch) {
          const orderCol = orderMatch[1];
          const isDesc = orderMatch[2].toUpperCase() === 'DESC';
          tableRows.sort((a, b) => {
            if (a[orderCol] < b[orderCol]) return isDesc ? 1 : -1;
            if (a[orderCol] > b[orderCol]) return isDesc ? -1 : 1;
            return 0;
          });
        }
      }

      const limitMatch = trimmed.match(/LIMIT\s+(\d+|\?)/i);
      if (limitMatch) {
        const limit = limitMatch[1] === '?' ? Number(params[params.length - 1]) : Number(limitMatch[1]);
        if (!isNaN(limit)) {
          tableRows = tableRows.slice(0, limit);
        }
      }

      return { rows: tableRows, rowsAffected: 0 };
    }

    // INSERT INTO / INSERT OR REPLACE
    if (upper.startsWith('INSERT')) {
      const match = trimmed.match(/INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const columns = match[2].split(',').map((c) => c.trim().toLowerCase());
        const rowObj: Record<string, any> = {};
        for (let i = 0; i < columns.length; i++) {
          rowObj[columns[i]] = params[i] !== undefined ? params[i] : null;
        }

        const table = this.tables.get(tableName) || [];
        const idCol = columns.find((c) => c === 'id');
        if (idCol && rowObj[idCol]) {
          const existingIdx = table.findIndex((r) => r[idCol] === rowObj[idCol]);
          if (existingIdx >= 0) {
            table[existingIdx] = { ...table[existingIdx], ...rowObj };
          } else {
            table.push(rowObj);
          }
        } else {
          table.push(rowObj);
        }
        this.tables.set(tableName, table);
        return { rows: [], rowsAffected: 1 };
      }
    }

    // UPDATE
    if (upper.startsWith('UPDATE')) {
      const match = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const table = this.tables.get(tableName) || [];
        // Support updating sync_queue
        if (tableName === 'sync_queue' && params.length >= 3) {
          const newStatus = params[0];
          const newError = params[1];
          const itemId = params[2];
          const target = table.find((t) => t.id === itemId);
          if (target) {
            target.status = newStatus;
            target.last_error = newError;
            target.retry_count = (target.retry_count || 0) + 1;
          }
        }
        return { rows: [], rowsAffected: 1 };
      }
    }

    // DELETE
    if (upper.startsWith('DELETE')) {
      const match = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        this.tables.set(tableName, []);
        return { rows: [], rowsAffected: 0 };
      }
    }

    return { rows: [], rowsAffected: 0 };
  }

  async transaction(callback: (tx: DatabaseAdapter) => Promise<void>): Promise<void> {
    await callback(this);
  }

  async close(): Promise<void> {
    this.tables.clear();
  }
}

let cachedWebAdapter: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!cachedWebAdapter) {
    cachedWebAdapter = new WebFallbackDatabaseAdapter();
  }
  return cachedWebAdapter;
}
