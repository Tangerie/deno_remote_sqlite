import PaginationControls from './PaginationControls.tsx';
import ErrorDisplay from './ErrorDisplay.tsx';
import EmptyState from './EmptyState.tsx';

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

    // Render table header based on columns
    const renderTableHeader = (columns: string[]) => (
        <thead class="bg-gray-700">
            <tr>
                {columns.length > 0 ? (
                    columns.map((column) => (
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
    );

    // Render table body based on data
    const renderTableBody = (data: any[], columns: string[]) => (
        <tbody class="bg-gray-800 divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
                <tr key={rowIndex} class="hover:bg-gray-750">
                    {columns.length > 0 ? (
                        columns.map((key, colIndex) => (
                            <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs overflow-hidden text-ellipsis">
                                {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                            </td>
                        ))
                    ) : (
                        Array.from({ length: 5 }).map((_, colIndex) => (
                            <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {row[`column${colIndex}`] !== null && row[`column${colIndex}`] !== undefined ? 
                                    String(row[`column${colIndex}`]) : 'NULL'}
                            </td>
                        ))
                    )}
                </tr>
            ))}
        </tbody>
    );

    // Render placeholder rows while loading
    const renderPlaceholderRows = () => (
        <tbody class="bg-gray-800 divide-y divide-gray-700">
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
    );

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
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages || 1}
                            pageSize={pageSize}
                            totalRows={totalRows || 0}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            onPageChange={onPageChange}
                            onPageSizeChange={onPageSizeChange}
                            disabled={true}
                        />
                        
                        {/* Table with placeholder rows */}
                        <div class="overflow-x-auto mt-4">
                            <table class="min-w-full divide-y divide-gray-700">
                                {renderTableHeader(tableColumns)}
                                {renderPlaceholderRows()}
                            </table>
                        </div>
                        
                        {/* Bottom Pagination */}
                        <div class="mt-6">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages || 1}
                                pageSize={pageSize}
                                totalRows={totalRows || 0}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                onPageChange={onPageChange}
                                onPageSizeChange={onPageSizeChange}
                                disabled={true}
                            />
                        </div>
                    </div>
                ) : error ? (
                    <ErrorDisplay error={error} />
                ) : selectedTable ? (
                    <div>
                        {tableData.length > 0 ? (
                            <div>
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    totalRows={totalRows}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    onPageChange={onPageChange}
                                    onPageSizeChange={onPageSizeChange}
                                />
                                
                                {/* Table */}
                                <div class="overflow-x-auto mt-4">
                                    <table class="min-w-full divide-y divide-gray-700">
                                        {renderTableHeader(Object.keys(tableData[0]))}
                                        {renderTableBody(tableData, Object.keys(tableData[0]))}
                                    </table>
                                </div>
                                
                                {/* Bottom Pagination */}
                                <div class="mt-6">
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        pageSize={pageSize}
                                        totalRows={totalRows}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        onPageChange={onPageChange}
                                        onPageSizeChange={onPageSizeChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <EmptyState 
                                icon="📋" 
                                title="No Data Found" 
                                description="No data found in this table" 
                            />
                        )}
                    </div>
                ) : (
                    <EmptyState 
                        icon="📋" 
                        title="Select a Table" 
                        description="Select a table to view its data" 
                    />
                )}
            </div>
        </div>
    );
}