/**
 * AtmosIQ - Universal Database Adapter Type Contracts
 */

export interface SqlQueryResult<T = any> {
  rows: T[];
  rowsAffected: number;
  insertId?: number;
}

export interface DatabaseAdapter {
  init(): Promise<void>;
  execute(sql: string, params?: any[]): Promise<SqlQueryResult>;
  transaction(callback: (tx: DatabaseAdapter) => Promise<void>): Promise<void>;
  close(): Promise<void>;
  isNative: boolean;
}
