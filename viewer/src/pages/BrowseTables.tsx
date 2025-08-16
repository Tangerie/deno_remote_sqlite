import TableDisplay from '../components/TableDisplay.tsx';
import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useTableDataStore } from '../stores/tableDataStore.ts';
import { useUIStore } from '../stores/uiStore.ts';

interface BrowseTablesProps {
    loadTableData: (tableName: string, page: number, newPageSize?: number) => Promise<void>;
}

export default function BrowseTables({
    loadTableData
}: BrowseTablesProps) {
    const { selectedTable } = useDatabaseStore(state => ({
        selectedTable: state.selectedTable
    }));
    const { 
        tableData,
        tableColumns,
        tableInfo,
        currentPage,
        pageSize,
        totalRows,
        totalPages
    } = useTableDataStore(state => state);
    const { 
        loading,
        error
    } = useUIStore(state => state);

    return (
        <TableDisplay 
            selectedTable={selectedTable}
            tableData={tableData}
            tableInfo={tableInfo}
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            totalRows={totalRows}
            pageSize={pageSize}
            tableColumns={tableColumns}
            onPageChange={(page) => loadTableData(selectedTable || '', page)}
            onPageSizeChange={(newPageSize) => loadTableData(selectedTable || '', 1, newPageSize)}
        />
    );
}