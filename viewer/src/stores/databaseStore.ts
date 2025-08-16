import { createStore } from "@tangerie/global-store";
import { createUseStore } from "./hooks.ts";
import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { TableInfo } from '../modules/types.ts';
import { 
    loadTables, 
    connectToDatabase, 
    saveUrlToStorage, 
    loadUrlFromStorage 
} from '../modules/storeUtils.ts';

interface DatabaseState {
    db: RemoteDatabase | null;
    tables: TableInfo[];
    selectedTable: string | null;
    url: string;
}

export const databaseStore = createStore({
    state: {
        db: null,
        tables: [],
        selectedTable: null,
        url: loadUrlFromStorage()
    } as DatabaseState,
    actions: {
        async openDb(state, url: string) {
            try {
                if (state.db) {
                    state.db.close();
                }
                
                const database = await connectToDatabase(url);
                
                state.db = database;
                state.url = url;
                saveUrlToStorage(url);
                
                // Load tables after connecting
                const tableInfo = await loadTables(database);
                state.tables = tableInfo;
            } catch (err) {
                state.db = null;
                state.tables = [];
                throw err;
            }
        },
        closeDb(state) {
            if (state.db) {
                state.db.close();
            }
            state.db = null;
            state.tables = [];
            state.selectedTable = null;
        },
        setTables(state, tables: TableInfo[]) {
            state.tables = tables;
        },
        selectTable(state, tableName: string | null) {
            state.selectedTable = tableName;
        },
        setUrl(state, url: string) {
            state.url = url;
            saveUrlToStorage(url);
        }
    }
});

export const useDatabaseStore = createUseStore(databaseStore);

export const { 
    openDb, 
    closeDb, 
    setTables, 
    selectTable,
    setUrl
} = databaseStore.actions;

export const { get: getDatabaseState } = databaseStore;