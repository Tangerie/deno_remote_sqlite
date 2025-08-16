import { useAppStore } from '../stores/appStore.ts';

export default function ViewSchemas() {
    const { tables, selectedTable, loading } = useAppStore(state => ({
        tables: state.tables,
        selectedTable: state.selectedTable,
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
                        <div 
                            key={table.name} 
                            class={`bg-gray-750 rounded-lg p-4 border-l-4 ${selectedTable === table.name ? 'border-blue-500' : 'border-gray-600'}`}
                        >
                            <div class="flex justify-between items-center">
                                <h3 class="text-xl font-medium text-white">{table.name}</h3>
                            </div>
                            
                            <div class="mt-3">
                                <h4 class="text-sm font-medium text-gray-300 mb-2">Columns:</h4>
                                <div class="flex flex-wrap gap-2">
                                    {table.columns.map((column) => (
                                        <span 
                                            key={column} 
                                            class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm"
                                        >
                                            {column}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}