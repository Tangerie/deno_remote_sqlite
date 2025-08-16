import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import TableItem from './TableItem.tsx';

interface TablesSidebarProps {
    loadTableData: (tableName: string) => void;
}

export default function TablesSidebar({
    loadTableData
}: TablesSidebarProps) {
    const { tables, selectedTable, db } = useDatabaseStore(state => ({
        tables: state.tables,
        selectedTable: state.selectedTable,
        db: state.db
    }));
    const { loading } = useUIStore(state => ({
        loading: state.loading
    }));

    return (
        <div class="w-full lg:w-1/4">
            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Database Tables</h2>
                {loading && !selectedTable ? (
                    <div class="flex justify-center my-4">
                        <div class="w-6 h-6 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : db ? (
                    <div>
                        <ul class="space-y-2 overflow-y-auto">
                            {tables.map((table) => (
                                <TableItem
                                    key={table.name}
                                    tableName={table.name}
                                    isSelected={selectedTable === table.name}
                                    onClick={() => loadTableData(table.name)}
                                />
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p class="text-gray-400 text-center py-4">Connect to database to see tables</p>
                )}
            </div>
        </div>
    );
}