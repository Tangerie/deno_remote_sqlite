import TableDisplay from '../components/TableDisplay.tsx';
import { useAppStore } from '../stores/appStore.ts';

interface BrowseTablesProps {
    loadTableData: (tableName: string, page: number, newPageSize?: number) => Promise<void>;
}

export default function BrowseTables({
    loadTableData
}: BrowseTablesProps) {
    const { 
        selectedTable,
        tableData,
        tableColumns,
        tableInfo,
        loading,
        error,
        currentPage,
        pageSize,
        totalRows,
        totalPages
    } = useAppStore(state => state);

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