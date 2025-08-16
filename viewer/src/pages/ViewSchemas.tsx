import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import TableSchema from '../components/TableSchema.tsx';

export default function ViewSchemas() {
    const { tables, selectedTable } = useDatabaseStore(state => ({
        tables: state.tables,
        selectedTable: state.selectedTable
    }));
    const { loading } = useUIStore(state => ({
        loading: state.loading
    }));

    return (
        <div class="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-white mb-6">Table Schemas</h2>
            
            {loading ? (
                <div class="flex justify-center items-center h-64">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : tables.length === 0 ? (
                <div class="text-center py-8 text-gray-400">
                    <div class="text-4xl mb-2">📋</div>
                    <p>No tables found. Connect to a database to view schemas.</p>
                </div>
            ) : (
                <div class="space-y-6">
                    {tables.map((table) => (
                        <TableSchema 
                            key={table.name} 
                            table={table} 
                            isSelected={selectedTable === table.name} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}