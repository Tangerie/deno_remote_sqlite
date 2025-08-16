import { createStore } from "@tangerie/global-store";
import { createUseStore } from "../stores/hooks.ts";
import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { DatabaseManager } from '../modules/database.ts';
import { TableInfo } from '../modules/types.ts';
import { get } from "node:http";

interface AppState {
    db: RemoteDatabase | null;
    tables: TableInfo[];
    selectedTable: string | null;
    tableData: any[];
    tableColumns: string[];
    loading: boolean;
    error: string | null;
    url: string;
    tableInfo: string;
    currentPage: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
}

export const appStore = createStore({
    state: {
        db: null,
        tables: [],
        selectedTable: null,
        tableData: [],
        tableColumns: [],
        loading: false,
        error: null,
        url: (() => {
            // Load last URL from localStorage or use default
            const savedUrl = localStorage.getItem('lastDbUrl') || '';
            return savedUrl || 'ws://judy.localdomain/domain/remote';
        })(),
        tableInfo: '',
        currentPage: 1,
        pageSize: 50,
        totalRows: 0,
        totalPages: 0
    } as AppState,
    actions: {
        // Database actions
        async openDb(state, url: string) {
            try {
                state.loading = true;
                state.error = null;
                
                if (state.db) {
                    state.db.close();
                }
                
                const database = new RemoteDatabase(url);
                await database.open();
                
                state.db = database;
                state.url = url;
                localStorage.setItem('lastDbUrl', url);
                
                // Load tables after connecting
                const tableInfo = await DatabaseManager.getTables(database);
                state.tables = tableInfo;
            } catch (err) {
                state.error = `Failed to connect to database: ${(err as Error).message}`;
                state.db = null;
                state.tables = [];
            } finally {
                state.loading = false;
            }
        },
        closeDb(state) {
            if (state.db) {
                state.db.close();
            }
            state.db = null;
            state.tables = [];
            state.selectedTable = null;
            state.tableData = [];
            state.tableColumns = [];
            state.tableInfo = '';
            state.currentPage = 1;
            state.totalRows = 0;
            state.totalPages = 0;
        },
        
        // Tables actions
        setTables(state, tables: TableInfo[]) {
            state.tables = tables;
        },
        selectTable(state, tableName: string | null) {
            state.selectedTable = tableName;
            if (!tableName) {
                // Clear data when deselecting
                state.tableData = [];
                state.tableColumns = [];
                state.tableInfo = '';
                state.totalRows = 0;
                state.totalPages = 0;
            }
            // Reset pagination when selecting a new table
            state.currentPage = 1;
        },
        
        // Table data actions
        setTableData(state, data: any[]) {
            state.tableData = data;
        },
        setTableColumns(state, columns: string[]) {
            state.tableColumns = columns;
        },
        setTableInfo(state, info: string) {
            state.tableInfo = info;
        },
        
        // Pagination actions
        setPageSize(state, size: number) {
            state.pageSize = size;
        },
        setCurrentPage(state, page: number) {
            state.currentPage = page;
        },
        setTotalRows(state, rows: number) {
            state.totalRows = rows;
        },
        setTotalPages(state, pages: number) {
            state.totalPages = pages;
        },
        
        // UI state actions
        setLoading(state, loading: boolean) {
            state.loading = loading;
        },
        setError(state, error: string | null) {
            state.error = error;
        },
        setUrl(state, url: string) {
            state.url = url;
            localStorage.setItem('lastDbUrl', url);
        },
        
        // Data loading action (encapsulates complex behavior)
        async loadTableData(state, tableName: string, page: number = state.currentPage) {
            if (!state.db) return;
            
            try {
                state.loading = true;
                state.error = null;
                
                const result = await DatabaseManager.queryTable(
                    state.db,
                    tableName,
                    page,
                    state.pageSize
                );
                
                state.tableData = result.tableData;
                state.totalRows = result.totalRows;
                state.totalPages = Math.ceil(result.totalRows / state.pageSize);
                state.currentPage = page;
                
                if (result.tableData.length > 0) {
                    state.tableColumns = Object.keys(result.tableData[0]);
                } else {
                    // If no data, get column info from schema
                    const table = state.tables.find(t => t.name === tableName);
                    if (table) {
                        state.tableColumns = table.columns;
                    }
                }
                
                state.tableInfo = result.tableInfo;
            } catch (err) {
                state.error = `Failed to load table data: ${(err as Error).message}`;
                state.tableData = [];
                state.tableColumns = [];
            } finally {
                state.loading = false;
            }
        },
        
        // Reset actions
        resetTableData(state) {
            state.tableData = [];
            state.tableColumns = [];
            state.tableInfo = '';
            state.currentPage = 1;
            state.totalRows = 0;
            state.totalPages = 0;
        },
        resetAll(state) {
            state.tables = [];
            state.selectedTable = null;
            state.tableData = [];
            state.tableColumns = [];
            state.tableInfo = '';
            state.currentPage = 1;
            state.totalRows = 0;
            state.totalPages = 0;
        }
    }
});

export const useAppStore = createUseStore(appStore);

// Export individual actions directly as per style guide
export const {
    openDb,
    closeDb,
    setTables,
    selectTable,
    setTableData,
    setTableColumns,
    setTableInfo,
    setPageSize,
    setCurrentPage,
    setTotalRows,
    setTotalPages,
    setLoading,
    setError,
    setUrl,
    resetTableData,
    resetAll
} = appStore.actions;

// Also export selectors
export const { get: getAppState, select: selectAppState, selector: createSelector } = appStore;

export const loadTableData = async (tableName: string, page: number, newPageSize?: number) => {
    const { db } = appStore.get();
    if (!db) return;

    try {
        setLoading(true);
        setError(null);
        await selectTable(tableName);
        
        if (newPageSize !== undefined) {
            setPageSize(newPageSize);
        }

        // Load the table data after selecting the table
        await appStore.actions.loadTableData(tableName, page);
    } catch (err: any) {
        setError(`Failed to load table data: ${err.message}`);
        console.error(err);
    } finally {
        setLoading(false);
    }
};