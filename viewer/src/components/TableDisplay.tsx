interface TableDisplayProps {
    selectedTable: string | null;
    tableData: any[];
    tableInfo: string;
    loading: boolean;
    error: string | null;
}

export default function TableDisplay({
    selectedTable,
    tableData,
    tableInfo,
    loading,
    error
}: TableDisplayProps) {
    return (
        <div class="w-full lg:w-3/4">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        <span>{selectedTable || 'Select a table'}</span>
                    </h2>
                    <div class="text-sm text-gray-500">{tableInfo}</div>
                </div>

                {loading ? (
                    <div class="flex justify-center my-8">
                        <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-red-500"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : selectedTable ? (
                    <div>
                        {tableData.length > 0 ? (
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            {Object.keys(tableData[0]).map((column) => (
                                                <th
                                                    key={column}
                                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        {tableData.map((row, rowIndex) => (
                                            <tr key={rowIndex} class="hover:bg-gray-50">
                                                {Object.keys(tableData[0]).map((key, colIndex) => (
                                                    <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                                        {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-table text-4xl mb-2"></i>
                                <p>No data found in table</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-table text-4xl mb-2"></i>
                        <p>Select a table to view its data</p>
                    </div>
                )}

                {/* Pagination */}
                {selectedTable && tableData.length > 0 && (
                    <div class="flex justify-between items-center mt-6">
                        <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300">
                            <i class="fas fa-chevron-left mr-2"></i> Previous
                        </button>
                        <div class="text-gray-600">Showing 1-50 of {tableData.length}</div>
                        <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300">
                            Next <i class="fas fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}