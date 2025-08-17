interface PageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (newPageSize: number) => void;
    disabled?: boolean;
}

export default function PageSizeSelector({
    pageSize,
    onPageSizeChange,
    disabled = false
}: PageSizeSelectorProps) {
    const handlePageSizeChange = (newPageSize: number) => {
        onPageSizeChange(newPageSize);
    };

    return (
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
    );
}