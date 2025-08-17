import { createStore } from "@tangerie/global-store";
import { createUseStore } from "./hooks.ts";
import { 
    loadTableData as loadTableDataUtil
} from '../modules/storeUtils.ts';

interface TableDataState {
    tableData: unknown[];
    tableColumns: string[];
    tableInfo: string;
    currentPage: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
}

export const tableDataStore = createStore({
    state: {
        tableData: [],
        tableColumns: [],
        tableInfo: '',
        currentPage: 1,
        pageSize: 50,
        totalRows: 0,
        totalPages: 0
    } as TableDataState,
    actions: {
        resetTableData(state) {
            state.tableData = [];
            state.tableColumns = [];
            state.tableInfo = '';
            state.currentPage = 1;
            state.totalRows = 0;
            state.totalPages = 0;
        },
        async loadTableData(state, db: any, tableName: string, page: number = state.currentPage, pageSize: number = state.pageSize, tables: any[] = []) {
            if (!db) return;
            
            try {
                const result = await loadTableDataUtil(
                    db,
                    tableName,
                    page,
                    pageSize
                );
                
                state.tableData = result.tableData;
                state.totalRows = result.totalRows;
                state.totalPages = Math.ceil(result.totalRows / pageSize);
                state.currentPage = page;
                
                if (result.tableData.length > 0) {
                    state.tableColumns = Object.keys(result.tableData[0]);
                } else {
                    // If no data, get column info from schema
                    const table = tables.find(t => t.name === tableName);
                    if (table) {
                        state.tableColumns = table.columns;
                    }
                }
                
                state.tableInfo = result.tableInfo;
            } catch (err) {
                state.tableData = [];
                state.tableColumns = [];
                throw err;
            }
        },
        async setCurrentPage(state, db: any, tableName: string, page: number, pageSize: number = state.pageSize, tables: any[] = []) {
            state.currentPage = page;
            await this.loadTableData(state, db, tableName, page, pageSize, tables);
        },
        setPageSize(state, size: number) {
            state.pageSize = size;
        }
    }
});

export const useTableDataStore = createUseStore(tableDataStore);

export const { 
    resetTableData,
    loadTableData,
    setCurrentPage,
    setPageSize
} = tableDataStore.actions;

export const { get: getTableDataState } = tableDataStore;