interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRows: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    disabled?: boolean;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalRows,
    startIndex,
    endIndex,
    onPageChange,
    onPageSizeChange,
    disabled = false
}: PaginationControlsProps) {
    const handlePageSizeChange = (newPageSize: number) => {
        // Reset to first page when changing page size
        onPageSizeChange(newPageSize);
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center space-x-2">
                <span class="text-gray-300">Rows per page:</span>
                <select 
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    class="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
                <div class="text-gray-300 whitespace-nowrap">
                    Showing {startIndex}-{endIndex} of {totalRows || 0}
                </div>
                <div class="flex space-x-1">
                    <button 
                        onClick={() => onPageChange(1)}
                        disabled={disabled || isFirstPage}
                        class={`px-3 py-1 rounded-md transition duration-300 ${
                            disabled || isFirstPage 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        First
                    </button>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={disabled || isFirstPage}
                        class={`px-3 py-1 rounded-md transition duration-300 ${
                            disabled || isFirstPage 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        ← Previous
                    </button>
                    <div class="px-3 py-1 text-gray-300">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    <button 
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={disabled || isLastPage}
                        class={`px-3 py-1 rounded-md transition duration-300 ${
                            disabled || isLastPage 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        Next →
                    </button>
                    <button 
                        onClick={() => onPageChange(totalPages)}
                        disabled={disabled || isLastPage}
                        class={`px-3 py-1 rounded-md transition duration-300 ${
                            disabled || isLastPage 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );
}