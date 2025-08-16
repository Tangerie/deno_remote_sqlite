// This is a compatibility layer for components that still use the old appStore
// New components should use the domain-specific stores directly

import { useDatabaseStore } from './databaseStore.ts';
import { useTableDataStore } from './tableDataStore.ts';
import { useUIStore } from './uiStore.ts';

// Combined selector for backward compatibility
export const useAppStore = (selector: any) => {
    const databaseState = useDatabaseStore(state => state);
    const tableDataState = useTableDataStore(state => state);
    const uiState = useUIStore(state => state);
    
    const combinedState = {
        ...databaseState,
        ...tableDataState,
        ...uiState
    };
    
    return selector ? selector(combinedState) : combinedState;
};

// Re-export actions for backward compatibility
export {
    openDb,
    closeDb,
    setTables,
    selectTable,
    setUrl
} from './databaseStore.ts';

export {
    setTableData,
    setTableColumns,
    setTableInfo,
    setPageSize,
    setCurrentPage,
    setTotalRows,
    setTotalPages,
    resetTableData,
    loadTableData
} from './tableDataStore.ts';

export {
    setLoading,
    setError,
    clearError
} from './uiStore.ts';