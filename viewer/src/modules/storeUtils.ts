import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { getTables, queryTable } from './database.ts';
import { TableInfo } from './types.ts';

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