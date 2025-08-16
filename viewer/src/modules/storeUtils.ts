import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { getTables, queryTable } from './database.ts';
import { TableInfo } from './types.ts';

// Utility functions for the app store

export const loadTables = async (database: RemoteDatabase): Promise<TableInfo[]> => {
    try {
        return await getTables(database);
    } catch (err) {
        console.error('Failed to load tables:', err);
        return [];
    }
};

export const loadTableData = async (
    database: RemoteDatabase,
    tableName: string,
    page: number,
    pageSize: number
) => {
    try {
        return await queryTable(database, tableName, page, pageSize);
    } catch (err) {
        console.error('Failed to load table data:', err);
        throw err;
    }
};

export const connectToDatabase = async (url: string): Promise<RemoteDatabase> => {
    const database = new RemoteDatabase(url);
    await database.open();
    return database;
};

export const saveUrlToStorage = (url: string): void => {
    localStorage.setItem('lastDbUrl', url);
};

export const loadUrlFromStorage = (): string => {
    const savedUrl = localStorage.getItem('lastDbUrl') || '';
    return savedUrl || 'ws://judy.localdomain/domain/remote';
};