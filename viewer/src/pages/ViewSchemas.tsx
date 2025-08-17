import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import TableSchema from '../components/TableSchema.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import EmptyState from '../components/EmptyState.tsx';

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
                    <LoadingSpinner size="lg" />
                </div>
            ) : tables.length === 0 ? (
                <EmptyState 
                    icon="📋" 
                    title="No Tables Found" 
                    description="Connect to a database to view schemas." 
                />
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