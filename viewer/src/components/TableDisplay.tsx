interface TableDisplayProps {
    selectedTable: string | null;
    tableData: any[];
    tableInfo: string;
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalRows: number;
    pageSize: number;
    tableColumns: string[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
}

export default function TableDisplay({
    selectedTable,
    tableData,
    tableInfo,
    loading,
    error,
    currentPage,
    totalPages,
    totalRows,
    pageSize,
    tableColumns,
    onPageChange,
    onPageSizeChange
}: TableDisplayProps) {
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalRows);

    const handlePageSizeChange = (newPageSize: number) => {
        // Reset to first page when changing page size
        onPageSizeChange(newPageSize);
    };

    return (
        <div class="w-full">
            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-white">
                        <span>{selectedTable || 'Select a table'}</span>
                    </h2>
                    <div class="text-sm text-gray-300">{tableInfo}</div>
                </div>

                {loading ? (
                    <div>
                        {/* Top Navigation */}
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center space-x-2">
                                <span class="text-gray-300">Rows per page:</span>
                                <select 
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    class="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                </select>
                            </div>
                            
                            <div class="flex space-x-1">
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    First
                                </button>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                <div class="px-3 py-1 text-gray-300">
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    Next →
                                </button>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center mb-4">
                            <div class="text-gray-300">
                                Showing {startIndex}-{endIndex} of {totalRows || 0}
                            </div>
                        </div>
                        
                        {/* Table with placeholder rows */}
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-700">
                                <thead class="bg-gray-700">
                                    <tr>
                                        {/* Use tableColumns prop for column headers */}
                                        {tableColumns.length > 0 ? (
                                            tableColumns.map((column) => (
                                                <th
                                                    key={column}
                                                    class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                                >
                                                    {column}
                                                </th>
                                            ))
                                        ) : (
                                            // Fallback to generic columns if no column data
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <th
                                                    key={index}
                                                    class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                                >
                                                    Column {index + 1}
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-800 divide-y divide-gray-700">
                                    {/* Show placeholder rows based on current page size while loading */}
                                    {Array.from({ length: pageSize }).map((_, rowIndex) => (
                                        <tr key={rowIndex} class="animate-pulse">
                                            {tableColumns.length > 0 ? (
                                                tableColumns.map((_, colIndex) => (
                                                    <td key={colIndex} class="px-6 py-4 whitespace-nowrap">
                                                        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                                                    </td>
                                                ))
                                            ) : (
                                                Array.from({ length: 5 }).map((_, colIndex) => (
                                                    <td key={colIndex} class="px-6 py-4 whitespace-nowrap">
                                                        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Bottom Pagination */}
                        <div class="flex justify-between items-center mt-6">
                            <div class="text-gray-300">
                                Showing {startIndex}-{endIndex} of {totalRows || 0}
                            </div>
                            <div class="flex space-x-1">
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    First
                                </button>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                <div class="px-3 py-1 text-gray-300">
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    Next →
                                </button>
                                <button 
                                    disabled
                                    class="px-3 py-1 rounded-md bg-gray-700 text-gray-500 cursor-not-allowed"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div class="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <div class="w-5 h-5 text-red-500">⚠</div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-red-200">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : selectedTable ? (
                    <div>
                        {tableData.length > 0 ? (
                            <div>
                                {/* Top Navigation */}
                                <div class="flex justify-between items-center mb-4">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-gray-300">Rows per page:</span>
                                        <select 
                                            value={pageSize}
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                            class="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                            <option value="200">200</option>
                                        </select>
                                    </div>
                                    
                                    <div class="flex space-x-1">
                                        <button 
                                            onClick={() => onPageChange(1)}
                                            disabled={currentPage === 1}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === 1 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            First
                                        </button>
                                        <button 
                                            onClick={() => onPageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === 1 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            ← Previous
                                        </button>
                                        <div class="px-3 py-1 text-gray-300">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <button 
                                            onClick={() => onPageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === totalPages 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            Next →
                                        </button>
                                        <button 
                                            onClick={() => onPageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === totalPages 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between items-center mb-4">
                                    <div class="text-gray-300">
                                        Showing {startIndex}-{endIndex} of {totalRows}
                                    </div>
                                </div>
                                
                                {/* Table */}
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-700">
                                        <thead class="bg-gray-700">
                                            <tr>
                                                {Object.keys(tableData[0]).map((column) => (
                                                    <th
                                                        key={column}
                                                        class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                                    >
                                                        {column}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody class="bg-gray-800 divide-y divide-gray-700">
                                            {tableData.map((row, rowIndex) => (
                                                <tr key={rowIndex} class="hover:bg-gray-750">
                                                    {Object.keys(tableData[0]).map((key, colIndex) => (
                                                        <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs overflow-hidden text-ellipsis">
                                                            {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Bottom Pagination */}
                                <div class="flex justify-between items-center mt-6">
                                    <div class="text-gray-300">
                                        Showing {startIndex}-{endIndex} of {totalRows}
                                    </div>
                                    <div class="flex space-x-1">
                                        <button 
                                            onClick={() => onPageChange(1)}
                                            disabled={currentPage === 1}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === 1 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            First
                                        </button>
                                        <button 
                                            onClick={() => onPageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === 1 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            ← Previous
                                        </button>
                                        <div class="px-3 py-1 text-gray-300">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <button 
                                            onClick={() => onPageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === totalPages 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            Next →
                                        </button>
                                        <button 
                                            onClick={() => onPageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            class={`px-3 py-1 rounded-md transition duration-300 ${
                                currentPage === totalPages 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div class="text-center py-8 text-gray-400">
                                <div class="text-4xl mb-2">📋</div>
                                <p>No data found in table</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div class="text-center py-8 text-gray-400">
                        <div class="text-4xl mb-2">📋</div>
                        <p>Select a table to view its data</p>
                    </div>
                )}
            </div>
        </div>
    );
}