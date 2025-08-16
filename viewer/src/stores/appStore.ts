import { createStore } from "@tangerie/global-store";
import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { TableInfo } from '../modules/types.ts';

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
        setDb: (state, db: RemoteDatabase | null) => {
            state.db = db;
        },
        clearDb: (state) => {
            if (state.db) {
                state.db.close();
            }
            state.db = null;
        },
        
        // Tables actions
        setTables: (state, tables: TableInfo[]) => {
            state.tables = tables;
        },
        setSelectedTable: (state, tableName: string | null) => {
            state.selectedTable = tableName;
        },
        
        // Table data actions
        setTableData: (state, data: any[]) => {
            state.tableData = data;
        },
        setTableColumns: (state, columns: string[]) => {
            state.tableColumns = columns;
        },
        setTableInfo: (state, info: string) => {
            state.tableInfo = info;
        },
        
        // Pagination actions
        setCurrentPage: (state, page: number) => {
            state.currentPage = page;
        },
        setPageSize: (state, size: number) => {
            state.pageSize = size;
        },
        setTotalRows: (state, rows: number) => {
            state.totalRows = rows;
        },
        setTotalPages: (state, pages: number) => {
            state.totalPages = pages;
        },
        
        // UI state actions
        setLoading: (state, loading: boolean) => {
            state.loading = loading;
        },
        setError: (state, error: string | null) => {
            state.error = error;
        },
        setUrl: (state, url: string) => {
            state.url = url;
            localStorage.setItem('lastDbUrl', url);
        },
        
        // Reset actions
        resetTableData: (state) => {
            state.tableData = [];
            state.tableColumns = [];
            state.tableInfo = '';
            state.currentPage = 1;
            state.totalRows = 0;
            state.totalPages = 0;
        },
        resetAll: (state) => {
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
export const { get: getAppState, actions: appActions, select: selectAppState, selector: createSelector, set: setAppState } = appStore;