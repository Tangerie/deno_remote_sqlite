import { TableInfo } from '../modules/types.ts';

interface TablesSidebarProps {
    tables: TableInfo[];
    selectedTable: string | null;
    loading: boolean;
    db: any;
    loadTableData: (tableName: string) => void;
}

export default function TablesSidebar({
    tables,
    selectedTable,
    loading,
    db,
    loadTableData
}: TablesSidebarProps) {
    return (
        <div class="w-full lg:w-1/4">
            <div class="bg-white rounded-lg shadow-lg p-6" style={{ height: 'calc(100vh - 2rem)' }}>
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Database Tables</h2>
                {loading && !selectedTable ? (
                    <div class="flex justify-center my-4">
                        <div class="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : db ? (
                    <div>
                        <ul class="space-y-2">
                            {tables.map((table) => (
                                <li key={table.name}>
                                    <button
                                        onClick={() => loadTableData(table.name)}
                                        class={`w-full text-left px-4 py-2 rounded-md transition duration-200 flex items-center ${selectedTable === table.name
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'hover:bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <i class={`fas fa-table mr-3 ${selectedTable === table.name ? 'text-blue-500' : 'text-blue-400'}`}></i>
                                        {table.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p class="text-gray-500 text-center py-4">Connect to database to see tables</p>
                )}
            </div>
        </div>
    );
}